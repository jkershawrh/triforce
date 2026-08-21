"""Centralized configuration for the healthcare agent."""

import os

LITELLM_API_BASE = os.environ.get("LITELLM_API_BASE", "https://maas-rhdp.apps.maas.redhatworkshops.io")
LITELLM_API_KEY = os.environ.get("LITELLM_API_KEY", "")
GPU_API_BASE = os.environ.get("GPU_API_BASE", "")
GPU_API_KEY = os.environ.get("GPU_API_KEY", "")

TRIFORCE_VERSION = os.environ.get("TRIFORCE_VERSION", "0.1.0")

GPU_COST_PER_TOKEN = 0.0003 / 1000
DEFAULT_DAILY_REQUESTS = 10_000
DAYS_PER_MONTH = 30
