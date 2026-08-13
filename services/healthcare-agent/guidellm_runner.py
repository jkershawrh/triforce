"""guidellm benchmark runner — wraps Red Hat guidellm for production-grade load sweeps."""

import asyncio
import logging
import os
import uuid

import config

logger = logging.getLogger("triforce.guidellm")

_jobs: dict[str, dict] = {}
_semaphore = asyncio.Semaphore(1)

GPU_MODELS = {"granite-3-2-8b-instruct", "qwen3-14b", "gpt-oss-20b", "gpt-oss-120b"}


def _extract_metrics(benchmark) -> dict:
    m = benchmark.metrics

    def summarize(dist):
        if dist is None:
            return None
        s = getattr(dist, 'successful', dist)
        if s is None or getattr(s, 'count', 0) == 0:
            return None
        percs = getattr(s, 'percentiles', None)
        return {
            "mean": round(s.mean, 2) if getattr(s, 'mean', None) else None,
            "p50": round(percs.p50, 2) if percs and getattr(percs, 'p50', None) else None,
            "p95": round(percs.p95, 2) if percs and getattr(percs, 'p95', None) else None,
            "p99": round(percs.p99, 2) if percs and getattr(percs, 'p99', None) else None,
            "min": round(s.min, 2) if getattr(s, 'min', None) else None,
            "max": round(s.max, 2) if getattr(s, 'max', None) else None,
        }

    result = {}
    for field in ['requests_per_second', 'request_latency', 'time_to_first_token_ms',
                   'inter_token_latency_ms', 'output_tokens_per_second', 'tokens_per_second']:
        val = getattr(m, field, None)
        if val is not None:
            result[field] = summarize(val)
    return result


async def start_benchmark(
    model: str,
    rate_type: str = "synchronous",
    max_requests: int = 10,
    max_seconds: float = 60,
) -> str:
    job_id = str(uuid.uuid4())[:8]
    is_gpu = model in GPU_MODELS
    api_base = config.GPU_API_BASE if is_gpu else config.LITELLM_API_BASE
    api_key = config.GPU_API_KEY if is_gpu else config.LITELLM_API_KEY

    _jobs[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "model": model,
        "hardware": "gpu" if is_gpu else "cpu",
    }

    asyncio.create_task(_run(job_id, model, api_base, api_key,
                             rate_type, max_requests, max_seconds))
    return job_id


async def _run(job_id, model, api_base, api_key, rate_type, max_requests, max_seconds):
    async with _semaphore:
        _jobs[job_id]["status"] = "running"
        try:
            os.environ["GUIDELLM__OPENAI__API_KEY"] = api_key or ""
            os.environ["GUIDELLM__OPENAI__BASE_URL"] = api_base or ""
            os.environ["GUIDELLM__PREFERRED_ROUTE"] = "chat_completions"
            os.environ["HF_HOME"] = "/tmp/hf_cache"

            from guidellm.benchmark import BenchmarkScenario, benchmark_generative_text

            scenario = BenchmarkScenario.model_validate({
                "spec": {
                    "backend": {
                        "kind": "openai_http",
                        "target": api_base,
                        "model": model,
                        "api_key": api_key,
                        "validate_backend": False,
                    },
                    "profile": {"kind": rate_type},
                    "tokenizer": {"kind": "hf_auto", "model": "ibm-granite/granite-3.2-2b-instruct"},
                    "data": [{
                        "kind": "synthetic_text",
                        "prompt_tokens": 128,
                        "output_tokens": 128,
                    }],
                    "constraints": [
                        {"kind": "max_duration", "seconds": max_seconds},
                        {"kind": "max_requests", "count": max_requests},
                    ],
                    "outputs": [],
                },
                "benchmarks": [{}],
            })

            report, _ = await benchmark_generative_text(
                args=scenario,
                progress=None,
                console=None,
            )

            if report.benchmarks:
                bm = report.benchmarks[0]
                totals = getattr(bm, 'request_totals', None)
                _jobs[job_id].update({
                    "status": "complete",
                    "metrics": _extract_metrics(bm),
                    "total_requests": totals.total if totals else 0,
                    "successful_requests": totals.successful if totals else 0,
                    "duration_seconds": round(bm.duration, 2) if getattr(bm, 'duration', None) else 0,
                })
            else:
                _jobs[job_id]["status"] = "error"
                _jobs[job_id]["error"] = "No benchmark results produced"

        except Exception as e:
            logger.error("guidellm benchmark failed: %s", e, exc_info=True)
            _jobs[job_id]["status"] = "error"
            _jobs[job_id]["error"] = str(e)


def get_job(job_id: str) -> dict | None:
    return _jobs.get(job_id)
