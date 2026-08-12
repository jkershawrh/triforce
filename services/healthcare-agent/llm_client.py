"""Shared async LLM client for MAAS/LiteLLM inference."""

import time

import httpx

import config


async def call_llm(model, prompt, max_tokens=300, api_base=None, api_key=None,
                   timeout=60) -> dict:
    """Call an LLM via the OpenAI-compatible chat completions API.

    Resolves CPU vs GPU API base automatically based on model name.
    Returns dict with model, latency_ms, content, prompt_tokens, output_tokens.
    On error, returns dict with model, latency_ms, error.
    """
    base = api_base or config.LITELLM_API_BASE
    key = api_key or config.LITELLM_API_KEY

    if "cpu" not in model and config.GPU_API_BASE:
        base = config.GPU_API_BASE
        key = config.GPU_API_KEY or key

    start = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                f"{base}/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}",
                         "Content-Type": "application/json"},
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": 0.1,
                },
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        return {
            "model": model,
            "latency_ms": int((time.monotonic() - start) * 1000),
            "error": str(e),
        }

    usage = data.get("usage", {})
    return {
        "model": model,
        "latency_ms": int((time.monotonic() - start) * 1000),
        "content": data["choices"][0]["message"].get("content", ""),
        "prompt_tokens": usage.get("prompt_tokens", 0),
        "output_tokens": usage.get("completion_tokens", 0),
    }
