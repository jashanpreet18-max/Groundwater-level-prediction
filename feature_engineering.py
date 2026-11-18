import pandas as pd
import numpy as np
from typing import Tuple, List
from backend.utils.config import LAG_WINDOWS

def create_time_series_features(df: pd.DataFrame, target_col: str = "Water_Level") -> pd.DataFrame:
    """
    Creates temporal and autoregressive features for ML models:
    - Lag features (lag_1, lag_2, lag_3, lag_7, lag_14, lag_30)
    - Rolling window statistics (rolling mean, rolling std)
    - Calendar features (Month, Quarter, Day of Year, Sin/Cos cyclical encodings)
    """
    df_feat = df.copy()
    df_feat["Date"] = pd.to_datetime(df_feat["Date"])
    df_feat = df_feat.sort_values(by="Date").reset_index(drop=True)

    # Calendar features
    df_feat["month"] = df_feat["Date"].dt.month
    df_feat["quarter"] = df_feat["Date"].dt.quarter
    df_feat["day_of_year"] = df_feat["Date"].dt.dayofyear
    
    # Cyclical Month Encodings
    df_feat["sin_month"] = np.sin(2 * np.pi * df_feat["month"] / 12.0)
    df_feat["cos_month"] = np.cos(2 * np.pi * df_feat["month"] / 12.0)

    # Lag features
    for lag in LAG_WINDOWS:
        df_feat[f"lag_{lag}"] = df_feat[target_col].shift(lag)

    # Rolling Statistics (using previous available observations)
    df_feat["rolling_mean_3"] = df_feat[target_col].shift(1).rolling(window=3, min_periods=1).mean()
    df_feat["rolling_std_3"] = df_feat[target_col].shift(1).rolling(window=3, min_periods=1).std().fillna(0)
    df_feat["rolling_mean_6"] = df_feat[target_col].shift(1).rolling(window=6, min_periods=1).mean()

    return df_feat

def prepare_ml_dataset(df_feat: pd.DataFrame, target_col: str = "Water_Level") -> Tuple[pd.DataFrame, pd.Series, List[str]]:
    """
    Drops rows with NaN lag values created during shift operations.
    Returns (X, y, feature_names).
    """
    feature_cols = [
        col for col in df_feat.columns 
        if col.startswith("lag_") or col.startswith("rolling_") or col in ["month", "quarter", "sin_month", "cos_month"]
    ]
    
    clean_feat_df = df_feat.dropna(subset=feature_cols + [target_col]).reset_index(drop=True)
    X = clean_feat_df[feature_cols]
    y = clean_feat_df[target_col]
    return X, y, feature_cols
