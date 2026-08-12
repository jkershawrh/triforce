"""Centralized configuration for the healthcare agent."""

import os

LITELLM_API_BASE = os.environ.get("LITELLM_API_BASE", "https://maas-rhdp.apps.maas.redhatworkshops.io")
LITELLM_API_KEY = os.environ.get("LITELLM_API_KEY", "")
GPU_API_BASE = os.environ.get("GPU_API_BASE", "")
GPU_API_KEY = os.environ.get("GPU_API_KEY", "")
