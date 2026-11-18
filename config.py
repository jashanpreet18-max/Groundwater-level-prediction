import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_RAW_DIR = BASE_DIR / "data" / "raw"
DATA_PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODEL_DIR = BASE_DIR / "models"
DEFAULT_DATASET = DATA_RAW_DIR / "cgwb_dwlr_sample.csv"

# Classification Thresholds (Project-defined relative quantiles or absolute mbgl bounds)
STATUS_THRESHOLDS = {
    "NORMAL": 15.0,     # < 15.0 mbgl (shallow, abundant)
    "WATCH": 25.0,      # 15.0 - 25.0 mbgl (moderate)
    "LOW": 35.0,        # 25.0 - 35.0 mbgl (low)
    "CRITICAL": 35.0    # > 35.0 mbgl (severely depleted)
}

# Supported Lag Horizons
LAG_WINDOWS = [1, 2, 3, 7, 14, 30]
