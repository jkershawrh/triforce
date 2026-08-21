"""Benchmark runner — compares models across tasks and hardware.

Used by the healthcare agent's /api/v1/benchmark/* endpoints.
Can also run standalone for pre-computed benchmark reports.
"""

import logging
import os
from typing import Optional

import config
import llm_client

logger = logging.getLogger("triforce.benchmark")

TASK_PROMPTS = {
    "classification": {
        "system": "Classify this clinical document into exactly one category: discharge_summary, progress_note, lab_report, radiology_report, pathology_report, surgical_note, consultation, prescription. Respond with only the category name.",
        "max_tokens": 32,
    },
    "ner": {
        "system": "Extract all medical entities from this text as a JSON array. Each entity: {text, type (medication/condition/procedure)}. Respond with ONLY the JSON array.",
        "max_tokens": 512,
    },
    "summarization": {
        "system": "Summarize this clinical record in 2-3 sentences for a physician handoff. Be concise and include key findings.",
        "max_tokens": 256,
    },
    "fraud_scoring": {
        "system": "Assess the fraud risk (0-100) for this transaction and explain your reasoning in one sentence.",
        "max_tokens": 128,
    },
    "compliance_reasoning": {
        "system": "Analyze this transaction for regulatory compliance. Answer with yes/no and explain in 2 sentences.",
        "max_tokens": 200,
    },
}

CPU_MODELS = os.environ.get("BENCHMARK_CPU_MODELS",
    "granite-4-0-h-tiny-cpu,granite-2b-cpu,"
    "qwen25-3b-cpu,phi3-mini-cpu,"
    "granite-3-2-8b-instruct-cpu"
).split(",")

GPU_MODELS = os.environ.get("BENCHMARK_GPU_MODELS",
    "granite-3-2-8b-instruct,qwen3-14b,gpt-oss-20b,gpt-oss-120b"
).split(",")


async def run_single(model: str, task: str, text: str,
                     api_base: Optional[str] = None,
                     api_key: Optional[str] = None) -> dict:
    """Run a single model on a single task. Returns latency, output, tokens."""
    task_config = TASK_PROMPTS.get(task, TASK_PROMPTS["classification"])
    prompt = f"{task_config['system']}\n\n{text}"
    is_gpu = model in GPU_MODELS

    result = await llm_client.call_llm(model, prompt,
                                       max_tokens=task_config["max_tokens"],
                                       api_base=api_base, api_key=api_key)

    if "error" in result:
        result["hardware"] = "gpu" if is_gpu else "cpu"
        result["task"] = task
        return result

    prompt_tokens = result.get("prompt_tokens", 0)
    output_tokens = result.get("output_tokens", 0)
    total_tokens = prompt_tokens + output_tokens

    if is_gpu:
        cost_per_req = total_tokens * config.GPU_COST_PER_TOKEN
    else:
        cost_per_req = 0.0

    return {
        "model": model,
        "hardware": "gpu" if is_gpu else "cpu",
        "task": task,
        "latency_ms": result["latency_ms"],
        "output": (result.get("content") or "")[:500],
        "prompt_tokens": prompt_tokens,
        "output_tokens": output_tokens,
        "cost_monthly": round(cost_per_req * config.DEFAULT_DAILY_REQUESTS * config.DAYS_PER_MONTH, 2),
    }


async def run_comparison(task: str, text: str, models: list) -> dict:
    """Run multiple models on the same task. Returns sorted results."""
    import asyncio

    tasks = [run_single(m, task, text) for m in models]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    clean = []
    for r in results:
        if isinstance(r, Exception):
            clean.append({"error": str(r)})
        else:
            clean.append(r)

    clean.sort(key=lambda r: r.get("latency_ms", 999999))

    return {
        "task": task,
        "models_compared": len(models),
        "results": clean,
        "fastest": clean[0] if clean else None,
    }


def list_available_models() -> dict:
    """List all models available for benchmarking."""
    cpu = [{"model": m, "hardware": "cpu", "cost": "$0/token"} for m in CPU_MODELS]
    gpu = [{"model": m, "hardware": "gpu", "cost": "$/token"} for m in GPU_MODELS]
    return {
        "cpu_models": cpu,
        "gpu_models": gpu,
        "total": len(cpu) + len(gpu),
    }
