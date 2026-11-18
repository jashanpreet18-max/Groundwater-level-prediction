import numpy as np
import pandas as pd
from typing import Dict, Any, List

class NaiveBaselineModel:
    """
    Naive forecasting baseline: predicts future values equal to the last observed historical level
    or seasonal naive value from 12 periods prior.
    """
    def __init__(self, name: str = "Naive Baseline"):
        self.name = name
        self.last_value = None
        self.historical_series = None

    def fit(self, y: pd.Series):
        self.historical_series = np.array(y, dtype=float)
        self.last_value = float(self.historical_series[-1]) if len(self.historical_series) > 0 else 0.0

    def predict(self, horizon: int = 30) -> Dict[str, Any]:
        if self.last_value is None:
            raise ValueError("Model must be fitted before predicting.")

        # Naive constant prediction or seasonal repetition
        predictions = []
        n_hist = len(self.historical_series)
        
        for i in range(horizon):
            if n_hist >= 12:
                # Use seasonal repetition (12 steps ago) with slight last-value weight
                seasonal_idx = (n_hist - 12 + (i % 12))
                pred = 0.7 * self.historical_series[seasonal_idx] + 0.3 * self.last_value
            else:
                pred = self.last_value
            predictions.append(round(float(pred), 2))

        # Standard deviation of residuals for confidence bounds
        std_residual = float(np.std(self.historical_series[-12:])) if n_hist >= 2 else 0.5
        lower_bound = [round(max(0.0, p - 1.96 * std_residual * np.sqrt(1 + i * 0.05)), 2) for i, p in enumerate(predictions)]
        upper_bound = [round(p + 1.96 * std_residual * np.sqrt(1 + i * 0.05), 2) for i, p in enumerate(predictions)]

        return {
            "model": self.name,
            "predictions": predictions,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound
        }
