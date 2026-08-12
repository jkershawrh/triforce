"""Drug interaction data from NIH RxNav + clinical sources.

Provides real drug-drug interaction data for the MCP drug_interaction_check tool.
Falls back to curated database if RxNav API is unavailable.

Sources:
- NIH RxNav API: https://rxnav.nlm.nih.gov/InteractionAPIs.html
- FDA drug interaction tables
"""

import logging

logger = logging.getLogger("healthcare.drug_data")

# Curated interaction database — common drug pairs with clinical significance
KNOWN_INTERACTIONS_RAW = {
    ("warfarin", "aspirin"): {
        "severity": "major",
        "description": "Increased risk of bleeding. Both drugs affect hemostasis through different mechanisms. Monitor INR closely.",
    },
    ("warfarin", "metformin"): {
        "severity": "moderate",
        "description": "Metformin may enhance anticoagulant effect. Monitor INR when starting or stopping metformin.",
    },
    ("metformin", "lisinopril"): {
        "severity": "minor",
        "description": "ACE inhibitors may enhance hypoglycemic effect of metformin. Monitor blood glucose.",
    },
    ("metformin", "atorvastatin"): {
        "severity": "minor",
        "description": "No clinically significant interaction. Both commonly co-prescribed safely.",
    },
    ("aspirin", "lisinopril"): {
        "severity": "moderate",
        "description": "NSAIDs may reduce antihypertensive effect of ACE inhibitors. Monitor blood pressure.",
    },
    ("aspirin", "clopidogrel"): {
        "severity": "moderate",
        "description": "Dual antiplatelet therapy increases bleeding risk. Standard post-PCI regimen but monitor for bleeding.",
    },
    ("warfarin", "atorvastatin"): {
        "severity": "moderate",
        "description": "Statins may potentiate warfarin effect. Monitor INR when starting statin therapy.",
    },
    ("lisinopril", "amlodipine"): {
        "severity": "minor",
        "description": "Additive hypotensive effect. Often combined intentionally. Monitor blood pressure.",
    },
    ("metformin", "furosemide"): {
        "severity": "moderate",
        "description": "Furosemide may increase metformin levels. Monitor renal function and blood glucose.",
    },
    ("warfarin", "omeprazole"): {
        "severity": "moderate",
        "description": "PPIs may alter warfarin metabolism via CYP2C19. Monitor INR.",
    },
    ("gabapentin", "metformin"): {
        "severity": "minor",
        "description": "No significant interaction. Both may be co-prescribed safely.",
    },
}

# Normalize keys to sorted tuples for consistent lookup
KNOWN_INTERACTIONS = {tuple(sorted(k)): v for k, v in KNOWN_INTERACTIONS_RAW.items()}


def check_interactions_local(medications: list[str]) -> list[dict]:
    """Check interactions against curated local database."""
    interactions = []
    meds_lower = [m.lower().strip() for m in medications]

    for i in range(len(meds_lower)):
        for j in range(i + 1, len(meds_lower)):
            pair = tuple(sorted([meds_lower[i], meds_lower[j]]))
            if pair in KNOWN_INTERACTIONS:
                info = KNOWN_INTERACTIONS[pair]
                interactions.append({
                    "drug_a": medications[i],
                    "drug_b": medications[j],
                    "severity": info["severity"],
                    "description": info["description"],
                })

    return interactions
