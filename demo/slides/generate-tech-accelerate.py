#!/usr/bin/env python3
"""
Generate Tech Accelerate Hands-On Workshop slides.

Uses the NA Summit:Connect 2026 Postcard PPTX as the theme/layout source.

Usage:
  python3 generate-tech-accelerate.py [template.pptx] [output.pptx]
"""

import sys
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt

TEMPLATE = Path.home() / "Downloads" / "NA Summit_ Connect 2026 Postcard.pptx"
OUTPUT = Path(__file__).parent / "tech-accelerate-workshop.pptx"

# Layout mapping (from preview inspection):
#   0  TITLE          — branded title with title + subtitle + 2 bottom boxes
#   4  CUSTOM_2_1_1   — section divider with subtitle + big title
#   13 CUSTOM_4_17    — content: header subtitle + title + sub-subtitle + footer + BODY
#   14 CUSTOM_4_22    — statement: big title + header + footer
#   20 CUSTOM_4_17_2  — content: header + footer + title + BODY
#   23 TITLE_1_1_1    — closing: header subtitle + slide number (minimal)
#   29 TITLE_2        — alt title with title + subtitle + 2 bottom boxes

LY_TITLE = 0
LY_SECTION = 4
LY_CONTENT = 13      # title + subtitle + body
LY_STATEMENT = 14    # big title
LY_CONTENT_ALT = 20  # title + body (no subtitle line)
LY_CLOSING = 23
LY_TITLE_ALT = 29


def set_ph(slide, idx, text):
    """Set placeholder text by index, silently skip if not found."""
    for ph in slide.placeholders:
        if ph.placeholder_format.idx == idx:
            ph.text = text
            return ph
    return None


def set_ph_formatted(slide, idx, lines):
    """Set placeholder with multiple formatted lines."""
    for ph in slide.placeholders:
        if ph.placeholder_format.idx == idx:
            tf = ph.text_frame
            for i, line in enumerate(lines):
                if i == 0:
                    p = tf.paragraphs[0]
                else:
                    p = tf.add_paragraph()
                p.text = line
            return ph
    return None


# ============================================================
# SLIDE DEFINITIONS
# ============================================================

SLIDES = [
    # --- 1: Title ---
    {
        "layout": LY_TITLE,
        "placeholders": {
            0: "Agentic AI with Intel® Xeon®\n+ Red Hat AI",
            1: "Deploying Enterprise AI Solutions\nwith Red Hat AI QuickStarts",
            2: "Tech Accelerate",
            3: "Hands-On Workshop",
        },
        "notes": "Sept 2026 Tech Accelerate. Hands-on lab for TSS, ITS & SAs.",
    },
    # --- 2: Agenda ---
    {
        "layout": LY_CONTENT,
        "placeholders": {
            1: "Red Hat × Intel  |  Tech Accelerate 2026",
            0: "Workshop Agenda",
            2: "~2.5 hours  |  Hands-on lab + discussion",
            4: "1. The Problem — Why CPU inference matters (10 min)\n"
               "2. Architecture — Polyglot agents, MCP tools, semantic routing (15 min)\n"
               "3. Hands-On Lab — Orient, Baseline, Optimize, Deploy (90 min)\n"
               "4. Optimization Deep Dive — Caching, routing, fusion, benchmarking (20 min)\n"
               "5. Wrap-Up — Decision framework + next steps (10 min)",
        },
        "notes": "Total ~2.5 hours. Lab is self-paced CYOA with 4 paths.",
    },
    # --- 3: Section - The Problem ---
    {
        "layout": LY_SECTION,
        "placeholders": {
            1: "Part 1",
            0: "The AI Infrastructure\nProblem",
        },
        "notes": "Transition slide.",
    },
    # --- 4: The Problem ---
    {
        “layout”: LY_CONTENT,
        “placeholders”: {
            1: “Red Hat × Intel  |  Tech Accelerate 2026”,
            0: “The CPU vs. GPU False Choice”,
            2: “It was never about picking one — it’s about routing both”,
            4: “• $307B spent on enterprise AI in 2025 — most on GPU infrastructure\n”
               “• GPU is faster, but constrained, expensive, and often idle\n”
               “• CPU inference is slower, but $0/token on hardware you already own\n”
               “• Quality matters: summarization and reasoning need GPU-class compute\n”
               “• Cost matters: classification and NER run fine on CPU at zero cost\n”
               “• 80%+ of AI projects stall before production (RAND, 2024)\n”
               “• The real problem: no system routes the right task to the right hardware”,
        },
        “notes”: “Frame as a routing problem, not CPU vs GPU. Both have a role — the question is who decides.”,
    },
    # --- 5: The Thesis ---
    {
        "layout": LY_STATEMENT,
        "placeholders": {
            1: "Red Hat × Intel  |  Tech Accelerate 2026",
            0: "Start on CPU at $0/token.\nScale to GPU where it matters.\nThe system routes for you.",
        },
        "notes": "This is the punchline of the entire workshop.",
    },
    # --- 6: Section - Architecture ---
    {
        "layout": LY_SECTION,
        "placeholders": {
            1: "Part 2",
            0: "Platform Architecture",
        },
        "notes": "Transition to architecture overview.",
    },
    # --- 7: Architecture ---
    {
        "layout": LY_CONTENT,
        "placeholders": {
            1: "Red Hat × Intel  |  Tech Accelerate 2026",
            0: "Polyglot Multi-Agent Platform",
            2: "9 pods • 3 languages • 1 namespace",
            4: "• vLLM Semantic Router — complexity → right hardware (<1ms)\n"
               "• Healthcare Agent (Python/FastAPI) — 4-node clinical NLP pipeline\n"
               "• FinServ Agent (Java/Quarkus) — LLM + rule-based fraud scoring\n"
               "• Orchestrator (Go) — A2A discovery + workflow coordination\n"
               "• MCP Gateway — 8 federated tools via JSON-RPC\n"
               "• AMQ Streams (Redpanda) — event-driven audit trail\n"
               "• MAAS/LiteLLM — CPU ($0) + GPU ($/token) model serving",
        },
        "notes": "Polyglot by design. Each service uses the right language. All inference on Intel Xeon 6 via MAAS.",
    },
    # --- 8: Model Fleet ---
    {
        "layout": LY_CONTENT,
        "placeholders": {
            1: "Red Hat × Intel  |  Tech Accelerate 2026",
            0: "Model Fleet — Intel® Xeon® 6 + Gaudi®",
            2: "Right model per task • right hardware per model",
            4: "CPU Models ($0/token):\n"
               "  granite-4-0-h-tiny (~1B) — ultra-fast classification\n"
               "  granite-2b-cpu (2B) — NER, fraud scoring\n"
               "  qwen25-3b-cpu (3B) — classification, summarization\n"
               "  phi3-mini-cpu (3.8B) — complex reasoning\n"
               "  granite-3-2-8b-instruct (8B) — reasoning, fusion judge\n\n"
               "GPU Models ($/token):\n"
               "  qwen3-14b (14B) — multilingual reasoning\n"
               "  gpt-oss-120b (120B) — frontier reasoning",
        },
        "notes": "5 CPU models at $0/token. GPU reserved for tasks that genuinely need it.",
    },
    # --- 9: Section - Lab ---
    {
        "layout": LY_SECTION,
        "placeholders": {
            1: "Part 3",
            0: "Hands-On Lab",
        },
        "notes": "Transition to the lab portion.",
    },
    # --- 10: Lab Structure ---
    {
        "layout": LY_CONTENT,
        "placeholders": {
            1: "Red Hat × Intel  |  Tech Accelerate 2026",
            0: "Choose Your Own Adventure",
            2: "4 paths + 4 build exercises + capstone",
            4: "Explore Paths (~20 min each):\n"
               "  Path A: Right-Size Your Models\n"
               "  Path B: Engineer Down for CPU\n"
               "  Path C: Route & Split Traffic\n"
               "  Path D: Scale & Cost\n\n"
               "Build Exercises (~20 min each):\n"
               "  Custom Routing Config\n"
               "  Fusion Panel Tuning\n"
               "  MCP Tool Deep Dive\n"
               "  Load Test Harness\n\n"
               "Capstone: Deploy Your Optimized Stack (~25 min)",
        },
        "notes": "CYOA format. Pick 1-2 paths based on role. Capstone deploys optimized stack.",
    },
    # --- 11: Optimization Stack ---
    {
        "layout": LY_CONTENT,
        "placeholders": {
            1: "Red Hat × Intel  |  Tech Accelerate 2026",
            0: "12 Optimization Techniques",
            2: "Per-request + system-level — they compound",
            4: "Per-Request:\n"
               "  • Adaptive classification cache (0ms on hit)\n"
               "  • Conditional pipeline (skip unnecessary nodes)\n"
               "  • Right-sized model per task (2B vs 8B)\n"
               "  • Prompt tuning (compact JSON output)\n\n"
               "System-Level:\n"
               "  • INT8 quantization via Intel® AMX\n"
               "  • Speculative decoding (draft + target)\n"
               "  • Heterogeneous routing (CPU → GPU)\n"
               "  • Multi-model fusion (panel + judge)\n"
               "  • vLLM continuous batching + paged attention",
        },
        "notes": "These compound. Cache + right model + conditional pipeline = 60-80% cost reduction.",
    },
    # --- 12: Demo - Pipeline ---
    {
        "layout": LY_STATEMENT,
        "placeholders": {
            1: "LIVE DEMO",
            0: "Healthcare NLP Pipeline\n4 models • 1 clinical note • ~5s • $0.00",
        },
        "notes": "SCREENSHOT: Run the pipeline from the Triforce frontend. Show results with latency and $0 cost.",
    },
    # --- 13: Demo - Benchmark ---
    {
        "layout": LY_STATEMENT,
        "placeholders": {
            1: "LIVE DEMO",
            0: "Model Benchmarking\nSame task • different models • real metrics",
        },
        "notes": "SCREENSHOT: Run classification benchmark from the frontend. Show the race animation.",
    },
    # --- 14: Demo - Routing ---
    {
        "layout": LY_STATEMENT,
        "placeholders": {
            1: "LIVE DEMO",
            0: "Semantic Routing\nEmbedding-based classification in <1ms\nNo LLM call — pure vector similarity",
        },
        "notes": "SCREENSHOT: Show 6 prompts routed by complexity in the routing module.",
    },
    # --- 15: Section - Results ---
    {
        "layout": LY_SECTION,
        "placeholders": {
            1: "Part 4",
            0: "What We Measured",
        },
        "notes": "Transition to proof points.",
    },
    # --- 16: Proof Points ---
    {
        "layout": LY_CONTENT,
        "placeholders": {
            1: "Red Hat × Intel  |  Tech Accelerate 2026",
            0: "Measured Results",
            2: "All numbers from live RHDP MAAS on Intel Xeon 6",
            4: "Pipeline latency:    ~10s (8B model) → ~3-5s (right-sized)  = 2-3x faster\n"
               "Classification:      ~800ms (LLM) → 0ms (cache hit)        = instant\n"
               "Cost per inference:  $/token (GPU) → $0/token (CPU)        = 100% savings\n"
               "Concurrent users:    1 (thread-locked) → 10+ (OVMS/vLLM)   = 10x scale\n\n"
               "CPU handles 80% of routine inference.\n"
               "GPU is reserved for the 20% that genuinely needs it.",
        },
        "notes": "Not synthetic benchmarks. Live measurements on RHDP MAAS Intel Xeon 6.",
    },
    # --- 17: Decision Framework ---
    {
        "layout": LY_CONTENT,
        "placeholders": {
            1: "Red Hat × Intel  |  Tech Accelerate 2026",
            0: "Your Decision Framework",
            2: "The output from the capstone exercise",
            4: "Use CPU ($0) when:\n"
               "  • Classification, NER, labeling\n"
               "  • Cached / repeated queries\n"
               "  • Latency < 5s is acceptable\n"
               "  • Cost optimization is priority\n\n"
               "Route to GPU when:\n"
               "  • Summarization of long documents\n"
               "  • Multi-step reasoning / diagnosis\n"
               "  • Quality > latency tradeoff\n"
               "  • Frontier model capability needed",
        },
        "notes": "This is what students build in the Capstone.",
    },
    # --- 18: QuickStarts ---
    {
        "layout": LY_CONTENT,
        "placeholders": {
            1: "Red Hat × Intel  |  Tech Accelerate 2026",
            0: "Red Hat AI QuickStarts",
            2: "demo.redhat.com → AI QuickStarts → Intel Xeon 6",
            4: "• Pre-built, tested lab environments on demo.redhat.com\n"
               "• One-click provisioning — cluster + tenant in ~30 minutes\n"
               "• Showroom lab with interactive terminal + embedded app\n"
               "• Intel Xeon 6 models served via RHDP MaaS ($0/token)\n"
               "• Reusable for PoCs, workshops, demos, and partner events",
        },
        "notes": "Available today on demo.redhat.com.",
    },
    # --- 19: Section - Next Steps ---
    {
        "layout": LY_SECTION,
        "placeholders": {
            1: "Part 5",
            0: "Next Steps",
        },
        "notes": "Transition to call to action.",
    },
    # --- 20: Call to Action ---
    {
        "layout": LY_CONTENT,
        "placeholders": {
            1: "Red Hat × Intel  |  Tech Accelerate 2026",
            0: "Get Started Today",
            2: "From lab to production",
            4: "1. Try the lab: demo.redhat.com → AI QuickStarts → Intel Xeon 6\n"
               "2. Run a PoC: 30-second application at intel.com/redhat-poc\n"
               "3. Deploy: OpenShift AI + Intel Xeon 6 on your infrastructure\n"
               "4. Connect: Ask your Red Hat or Intel account team\n\n"
               "Resources:\n"
               "  • Red Hat AI QuickStarts catalog: demo.redhat.com\n"
               "  • Intel AI on Xeon: intel.com/xeon-ai\n"
               "  • Red Hat AI portfolio: redhat.com/ai",
        },
        "notes": "End with actionable next steps.",
    },
    # --- 21: Thank You ---
    {
        "layout": LY_TITLE_ALT,
        "placeholders": {
            0: "Thank You",
            1: "Red Hat × Intel",
            2: "Tech Accelerate",
            3: "2026",
        },
        "notes": "Q&A slide.",
    },
]


def main():
    template_path = Path(sys.argv[1]) if len(sys.argv) > 1 else TEMPLATE
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else OUTPUT

    if not template_path.exists():
        print(f"Template not found: {template_path}")
        sys.exit(1)

    prs = Presentation(str(template_path))

    # Remove existing template slides (keep layouts/theme)
    while len(prs.slides) > 0:
        rId = prs.slides._sldIdLst[0].get(
            "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
        )
        prs.part.drop_rel(rId)
        prs.slides._sldIdLst.remove(prs.slides._sldIdLst[0])

    for i, slide_def in enumerate(SLIDES):
        layout = prs.slide_layouts[slide_def["layout"]]
        slide = prs.slides.add_slide(layout)

        for idx, text in slide_def["placeholders"].items():
            set_ph(slide, idx, text)

        if slide_def.get("notes"):
            slide.notes_slide.notes_text_frame.text = slide_def["notes"]

        title = slide_def["placeholders"].get(0, slide_def["placeholders"].get(1, ""))
        print(f"  Slide {i+1:2d} (Layout {slide_def['layout']:2d}): {title[:60]}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(output_path))
    print(f"\nSaved: {output_path}")
    print(f"Slides: {len(SLIDES)}")


if __name__ == "__main__":
    main()
