import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).parent.parent.parent
BACKEND_DIR = Path(__file__).parent.parent
APP_DIR = Path(__file__).parent

# Model configuration
STEGASTAMP_MODEL_PATH = os.getenv(
    "STEGASTAMP_MODEL_PATH",
    str(APP_DIR / "models" / "stegastamp_pretrained")
)

# Watermark configuration
WATERMARK_SECRET = os.getenv("WATERMARK_SECRET", "AI-PROOF-v1")

# API configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 8000))

# Image configuration
MAX_IMAGE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}

# Logging configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
