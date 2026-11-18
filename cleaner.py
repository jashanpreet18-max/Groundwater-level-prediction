import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple

def preprocess_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans raw groundwater dataframe:
    - Parses dates
    - Removes invalid/negative water level values
    - Sorts chronologically
    - Interpolates missing continuous values per station
    - Returns cleaned dataframe + statistics summary dictionary
    """
    cleaned_df = df.copy()

    # Convert Date column to datetime
    cleaned_df["Date"] = pd.to_datetime(cleaned_df["Date"], errors="coerce")
    cleaned_df = cleaned_df.dropna(subset=["Date"])

    # Convert Water_Level to numeric
    cleaned_df["Water_Level"] = pd.to_numeric(cleaned_df["Water_Level"], errors="coerce")
    
    # Filter out physical impossibilities (water level < 0 or > 200 mbgl)
    cleaned_df = cleaned_df[(cleaned_df["Water_Level"] >= 0) & (cleaned_df["Water_Level"] <= 200)]

    # Sort chronologically per station
    cleaned_df = cleaned_df.sort_values(by=["Station", "Date"]).reset_index(drop=True)

    # Clean & interpolate missing continuous water levels per station
    processed_dfs = []
    for station, group in cleaned_df.groupby("Station"):
        group = group.copy()
        # Handle duplicates by taking mean of Water_Level while keeping metadata
        meta_cols = [c for c in ["State", "District", "Latitude", "Longitude", "Unit"] if c in group.columns]
        num_mean = group.groupby("Date")[["Water_Level"]].mean().reset_index()
        if meta_cols:
            meta = group.groupby("Date")[meta_cols].first().reset_index()
            group = pd.merge(num_mean, meta, on="Date", how="left")
        else:
            group = num_mean
        group["Station"] = station
        
        # Forward fill and linear interpolate
        group["Water_Level"] = group["Water_Level"].ffill().bfill().interpolate(method="linear")
        processed_dfs.append(group)

    if processed_dfs:
        cleaned_df = pd.concat(processed_dfs, ignore_index=True)
    
    # Calculate statistics summary
    stats = calculate_dataset_stats(cleaned_df)
    return cleaned_df, stats

def calculate_dataset_stats(df: pd.DataFrame) -> Dict[str, Any]:
    if df.empty:
        return {
            "total_records": 0,
            "number_of_locations": 0,
            "date_range": {"start": None, "end": None},
            "missing_values": 0,
            "avg_water_level": 0.0,
            "min_water_level": 0.0,
            "max_water_level": 0.0
        }

    return {
        "total_records": int(len(df)),
        "number_of_locations": int(df["Station"].nunique()),
        "date_range": {
            "start": df["Date"].min().strftime("%Y-%m-%d"),
            "end": df["Date"].max().strftime("%Y-%m-%d")
        },
        "missing_values": int(df["Water_Level"].isna().sum()),
        "avg_water_level": round(float(df["Water_Level"].mean()), 2),
        "min_water_level": round(float(df["Water_Level"].min()), 2),
        "max_water_level": round(float(df["Water_Level"].max()), 2)
    }


