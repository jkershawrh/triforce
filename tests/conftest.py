import os
import pathlib

import pytest

PROJECT_ROOT = pathlib.Path(__file__).parent.parent

HEALTHCARE_URL = os.environ.get("HEALTHCARE_URL", "http://localhost:8081")
FINSERV_URL = os.environ.get("FINSERV_URL", "http://localhost:8082")
SKIP_LIVE = not os.environ.get("LITELLM_API_KEY", "")

SAMPLE_TEXT = (
    "DISCHARGE SUMMARY: 72-year-old male with Type 2 Diabetes on Metformin 500mg "
    "and Lisinopril 10mg. Recent STEMI with PCI to RCA. Started on Aspirin 81mg, "
    "Clopidogrel 75mg. History of hypertension and CKD stage 3."
)

skip_without_api_key = pytest.mark.skipif(
    SKIP_LIVE, reason="LITELLM_API_KEY not set — skipping live tests"
)
