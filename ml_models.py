import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from backend.preprocessing.feature_engineering import create_time_series_features, prepare_ml_dataset, LAG_WINDOWS

class MLForecaster:
    """
    Machine Learning Forecaster supporting Random Forest Regressor & Gradient Boosting Regressor.
    Uses lag features and recursive multi-step forecasting across future horizons.
    """
    def __init__(self, model_type: str = "random_forest"):
        self.model_type = model_type
        if model_type == "gradient_boosting":
            self.name = "Gradient Boosting Regressor"
            self.model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.05, max_depth=4, random_state=42)
        else:
            self.name = "Random Forest Regressor"
            self.model = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)

        self.feature_names = []
        self.last_series = None
        self.last_date = None
        self.train_residual_std = 0.5

    def fit(self, df: pd.DataFrame, target_col: str = "Water_Level"):
        """
        Extracts lag features and fits the ML regressor.
        """
        df_feat = create_time_series_features(df, target_col=target_col)
        X, y, feature_cols = prepare_ml_dataset(df_feat, target_col=target_col)

        if len(X) < 3:
            # Fallback if too few records after lagging
            X = pd.DataFrame({"lag_1": df[target_col].shift(1).fillna(df[target_col].mean())})
            y = df[target_col]
            feature_cols = ["lag_1"]

        self.feature_names = feature_cols
        self.model.fit(X, y)
        
        preds_in_sample = self.model.predict(X)
        self.train_residual_std = float(np.std(y - preds_in_sample)) if len(y) > 0 else 0.5

        # Store recent observations for iterative recursive forecasting
        self.last_series = list(df[target_col].values)
        self.last_date = pd.to_datetime(df["Date"].max())

    def predict(self, horizon: int = 30) -> Dict[str, Any]:
        if self.last_series is None:
            raise ValueError("ML model must be fitted prior to forecasting.")

        current_series = list(self.last_series)
        current_date = self.last_date

        predictions = []
        lower_bound = []
        upper_bound = []

        for step in range(1, horizon + 1):
            next_date = current_date + pd.DateOffset(months=1) if horizon <= 36 else current_date + pd.DateOffset(days=1)
            
            # Construct row features
            month = next_date.month
            quarter = next_date.quarter
            sin_m = np.sin(2 * np.pi * month / 12.0)
            cos_m = np.cos(2 * np.pi * month / 12.0)

            feat_dict = {
                "month": month,
                "quarter": quarter,
                "sin_month": sin_m,
                "cos_month": cos_m,
            }

            for lag in LAG_WINDOWS:
                if len(current_series) >= lag:
                    feat_dict[f"lag_{lag}"] = current_series[-lag]
                else:
                    feat_dict[f"lag_{lag}"] = current_series[0]

            feat_dict["rolling_mean_3"] = np.mean(current_series[-3:]) if len(current_series) >= 3 else np.mean(current_series)
            feat_dict["rolling_std_3"] = np.std(current_series[-3:]) if len(current_series) >= 3 else 0.0
            feat_dict["rolling_mean_6"] = np.mean(current_series[-6:]) if len(current_series) >= 6 else np.mean(current_series)

            # Build single-row feature vector matching trained columns
            row_X = pd.DataFrame([feat_dict])[self.feature_names]
            next_pred = float(self.model.predict(row_X)[0])
            next_pred = max(0.5, round(next_pred, 2))

            predictions.append(next_pred)
            current_series.append(next_pred)
            current_date = next_date

            # Calculate prediction confidence interval (widens with horizon)
            uncertainty = 1.96 * self.train_residual_std * np.sqrt(1 + (step * 0.06))
            lower_bound.append(round(max(0.0, next_pred - uncertainty), 2))
            upper_bound.append(round(next_pred + uncertainty, 2))

        return {
            "model": self.name,
            "predictions": predictions,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound
        }
