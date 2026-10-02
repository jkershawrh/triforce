import asyncio
from pathlib import Path
import sys


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import graph


class _Response:
    content = "Bounded solution brief"


class _FakeLLM:
    async def ainvoke(self, _messages):
        return _Response()


def test_brief_generation_reserves_context_for_grounded_inputs(monkeypatch):
    requested_budgets = []

    def fake_get_llm(max_tokens):
        requested_budgets.append(max_tokens)
        return _FakeLLM()

    monkeypatch.setattr(graph, "_get_llm", fake_get_llm)
    state = {
        "query": "Design a private document assistant for 200 engineers.",
        "requirements": {"workload_type": "document assistant"},
        "hardware_options": [{"family": "Intel Xeon 6"}],
        "platform_capabilities": [{"name": "OpenShift AI"}],
        "architecture": {"pattern": "RAG"},
        "inference_log": [],
    }

    result = asyncio.run(graph.generate_brief(state))

    assert requested_budgets == [512]
    assert result["brief"] == "Bounded solution brief"
