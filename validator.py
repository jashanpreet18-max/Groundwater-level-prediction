import pandas as pd
from typing import Tuple, Dict, Any, List

REQUIRED_COLUMNS = ["Date", "Water_Level", "Station"]
ALT_COLUMN_MAP = {
    "date": "Date",
    "observation_date": "Date",
    "datetime": "Date",
    "time": "Date",
    "station": "Station",
    "station_name": "Station",
    "location": "Station",
    "water_level": "Water_Level",
    "groundwater_level": "Water_Level",
    "water_table": "Water_Level",
    "mbgl": "Water_Level",
    "value": "Water_Level",
    "state": "State",
    "district": "District",
    "latitude": "Latitude",
    "lat": "Latitude",
    "longitude": "Longitude",
    "lon": "Longitude",
    "long": "Longitude",
    "unit": "Unit"
}

def validate_and_normalize_csv(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Validates CSV dataframe schema, normalizes column names, and checks minimum record counts.
    Returns (normalized_df, validation_summary).
    """
    # Normalize column names (strip whitespace & rename lower-case aliases)
    renamed_cols = {}
    for col in df.columns:
        clean_col = str(col).strip().lower()
        if clean_col in ALT_COLUMN_MAP:
            renamed_cols[col] = ALT_COLUMN_MAP[clean_col]
        else:
            renamed_cols[col] = str(col).strip()
            
    df = df.rename(columns=renamed_cols)

    missing_required = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    
    if missing_required:
        return df, {
            "is_valid": False,
            "errors": [f"Missing required columns: {', '.join(missing_required)}. Available columns: {list(df.columns)}"],
            "total_rows": len(df)
        }

    # Fill defaults for optional metadata columns
    if "State" not in df.columns:
        df["State"] = "General"
    if "District" not in df.columns:
        df["District"] = "Default District"
    if "Latitude" not in df.columns:
        df["Latitude"] = 28.6139  # Default centroid if missing
    if "Longitude" not in df.columns:
        df["Longitude"] = 77.2090
    if "Unit" not in df.columns:
        df["Unit"] = "mbgl"

    # Validate row count
    if len(df) < 5:
        return df, {
            "is_valid": False,
            "errors": [f"Dataset contains only {len(df)} rows. Minimum 5 observations required."],
            "total_rows": len(df)
        }

    return df, {
        "is_valid": True,
        "errors": [],
        "total_rows": len(df),
        "columns": list(df.columns),
        "stations_found": list(df["Station"].unique())
    }
