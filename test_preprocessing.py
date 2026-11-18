import pytest
import pandas as pd
from backend.preprocessing.validator import validate_and_normalize_csv
from backend.preprocessing.cleaner import preprocess_dataframe
from backend.preprocessing.feature_engineering import create_time_series_features, prepare_ml_dataset

def test_validate_and_normalize_csv():
    df_sample = pd.DataFrame({
        "date": ["2024-01-01", "2024-02-01", "2024-03-01", "2024-04-01", "2024-05-01"],
        "station_name": ["Test Station"] * 5,
        "water_level": [12.5, 13.0, 13.5, 14.0, 14.5]
    })
    
    norm_df, validation = validate_and_normalize_csv(df_sample)
    assert validation["is_valid"] is True
    assert "Date" in norm_df.columns
    assert "Station" in norm_df.columns
    assert "Water_Level" in norm_df.columns

def test_preprocess_dataframe():
    df_raw = pd.DataFrame({
        "Date": ["2024-01-01", "2024-02-01", "invalid_date", "2024-04-01"],
        "Station": ["Station A"] * 4,
        "Water_Level": [10.0, None, 12.0, 14.0]
    })
    
    cleaned_df, stats = preprocess_dataframe(df_raw)
    assert len(cleaned_df) >= 2
    assert stats["total_records"] == len(cleaned_df)
    assert stats["missing_values"] == 0

def test_feature_engineering():
    df_station = pd.DataFrame({
        "Date": pd.date_range("2020-01-01", periods=40, freq="MS"),
        "Water_Level": [10.0 + i * 0.2 for i in range(40)]
    })
    
    df_feat = create_time_series_features(df_station)
    assert "lag_1" in df_feat.columns
    assert "lag_7" in df_feat.columns
    assert "rolling_mean_3" in df_feat.columns

    X, y, feature_cols = prepare_ml_dataset(df_feat)
    assert len(X) > 0
    assert len(X) == len(y)
