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
    """Extract key metrics from a GenerativeBenchmark into a flat dict."""
    m = benchmark.metrics

    def summarize(dist):
        if dist is None:
            return None
        s = dist.successful
        if s is None or s.count == 0:
            return None
        return {
            "mean": round(s.mean, 2) if s.mean else None,
            "p50": round(s.percentiles.p50, 2) if s.percentiles and s.percentiles.p50 else None,
            "p95": round(s.percentiles.p95, 2) if s.percentiles and s.percentiles.p95 else None,
            "p99": round(s.percentiles.p99, 2) if s.percentiles and s.percentiles.p99 else None,
            "min": round(s.min, 2) if s.min else None,
            "max": round(s.max, 2) if s.max else None,
        }

    return {
        "requests_per_second": summarize(m.requests_per_second),
        "request_latency": summarize(m.request_latency),
        "time_to_first_token_ms": summarize(m.time_to_first_token_ms),
        "inter_token_latency_ms": summarize(m.inter_token_latency_ms),
        "output_tokens_per_second": summarize(m.output_tokens_per_second),
        "tokens_per_second": summarize(m.tokens_per_second),
        "prompt_token_count": summarize(m.prompt_token_count),
        "output_token_count": summarize(m.output_token_count),
    }


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

            from guidellm.benchmark.entrypoints import benchmark_generative_text

            report, _ = await benchmark_generative_text(
                target=api_base,
                backend_type="openai_http",
                backend_args={"headers": {"Authorization": f"Bearer {api_key}"}},
                model=model,
                processor=None,
                processor_args=None,
                data="prompt_tokens=128,output_tokens=128",
                data_args=None,
                data_sampler=None,
                rate_type=rate_type,
                rate=None,
                max_seconds=max_seconds,
                max_requests=max_requests,
                warmup_percent=None,
                cooldown_percent=None,
                output_path=None,
                output_extras=None,
                output_sampling=None,
                random_seed=42,
                show_progress=False,
                show_progress_scheduler_stats=False,
                output_console=False,
            )

            if report.benchmarks:
                bm = report.benchmarks[0]
                _jobs[job_id].update({
                    "status": "complete",
                    "metrics": _extract_metrics(bm),
                    "total_requests": bm.request_totals.total if bm.request_totals else 0,
                    "successful_requests": bm.request_totals.successful if bm.request_totals else 0,
                    "duration_seconds": round(bm.duration, 2) if bm.duration else 0,
                })
            else:
                _jobs[job_id]["status"] = "error"
                _jobs[job_id]["error"] = "No benchmark results produced"

        except Exception as e:
            logger.error("guidellm benchmark failed: %s", e)
            _jobs[job_id]["status"] = "error"
            _jobs[job_id]["error"] = str(e)


def get_job(job_id: str) -> dict | None:
    return _jobs.get(job_id)
