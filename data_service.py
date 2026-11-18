import os
import pandas as pd
from typing import Dict, Any, List, Optional
from backend.utils.config import DEFAULT_DATASET, STATUS_THRESHOLDS, DATA_RAW_DIR
from backend.preprocessing.validator import validate_and_normalize_csv
from backend.preprocessing.cleaner import preprocess_dataframe, calculate_dataset_stats

class DataService:
    def __init__(self, data_path: str = str(DEFAULT_DATASET)):
        self.data_path = data_path
        self.raw_df = None
        self.cleaned_df = None
        self.stats = {}
        self.load_dataset(data_path)

    def load_dataset(self, path: str):
        if not os.path.exists(path):
            raise FileNotFoundError(f"Dataset not found at path: {path}")
            
        raw = pd.read_csv(path)
        norm_df, validation = validate_and_normalize_csv(raw)
        
        if not validation["is_valid"]:
            raise ValueError(f"Invalid dataset format: {validation['errors']}")
            
        self.raw_df = norm_df
        self.cleaned_df, self.stats = preprocess_dataframe(self.raw_df)
        self.data_path = path

    def save_uploaded_csv(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        save_path = os.path.join(DATA_RAW_DIR, f"uploaded_{filename}")
        with open(save_path, "wb") as f:
            f.write(file_content)

        # Validate & load
        raw = pd.read_csv(save_path)
        norm_df, validation = validate_and_normalize_csv(raw)
        
        if not validation["is_valid"]:
            os.remove(save_path)
            return {"success": False, "errors": validation["errors"]}

        self.load_dataset(save_path)
        return {
            "success": True,
            "filename": filename,
            "total_records": self.stats["total_records"],
            "stations_count": self.stats["number_of_locations"]
        }

    def get_locations_taxonomy(self) -> Dict[str, Any]:
        """
        Returns State -> District -> Stations nested dictionary.
        """
        taxonomy = {}
        for (state, district), group in self.cleaned_df.groupby(["State", "District"]):
            if state not in taxonomy:
                taxonomy[state] = {}
            if district not in taxonomy[state]:
                taxonomy[state][district] = []
            taxonomy[state][district].extend(list(group["Station"].unique()))

        # Deduplicate stations per district
        for state in taxonomy:
            for dist in taxonomy[state]:
                taxonomy[state][dist] = sorted(list(set(taxonomy[state][dist])))

        return taxonomy

    def get_stations_summary(self) -> List[Dict[str, Any]]:
        stations = []
        for station_name, group in self.cleaned_df.groupby("Station"):
            group_sorted = group.sort_values(by="Date")
            latest_row = group_sorted.iloc[-1]
            latest_level = float(latest_row["Water_Level"])

            # Classification
            if latest_level < STATUS_THRESHOLDS["NORMAL"]:
                status = "NORMAL"
            elif latest_level < STATUS_THRESHOLDS["WATCH"]:
                status = "WATCH"
            elif latest_level < STATUS_THRESHOLDS["LOW"]:
                status = "LOW"
            else:
                status = "CRITICAL"

            initial_level = float(group_sorted.iloc[0]["Water_Level"])
            net_change = round(latest_level - initial_level, 2)
            mean_level = round(float(group["Water_Level"].mean()), 2)
            min_level = round(float(group["Water_Level"].min()), 2)
            max_level = round(float(group["Water_Level"].max()), 2)

            stations.append({
                "station": station_name,
                "state": str(latest_row.get("State", "General")),
                "district": str(latest_row.get("District", "General")),
                "latitude": float(latest_row.get("Latitude", 28.61)),
                "longitude": float(latest_row.get("Longitude", 77.20)),
                "latest_water_level": round(latest_level, 2),
                "latest_date": latest_row["Date"].strftime("%Y-%m-%d"),
                "status": status,
                "total_observations": len(group),
                "mean_water_level": mean_level,
                "min_water_level": min_level,
                "max_water_level": max_level,
                "net_change": net_change,
                "trend_direction": "DEPLETING" if net_change > 0 else "RECHARGING"
            })

        return stations

    def get_station_data(self, station_name: str) -> List[Dict[str, Any]]:
        station_df = self.cleaned_df[self.cleaned_df["Station"] == station_name].sort_values("Date")
        records = []
        for _, row in station_df.iterrows():
            records.append({
                "date": row["Date"].strftime("%Y-%m-%d"),
                "water_level": round(float(row["Water_Level"]), 2),
                "unit": str(row.get("Unit", "mbgl"))
            })
        return records
