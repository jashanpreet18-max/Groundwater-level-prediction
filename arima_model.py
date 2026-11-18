import numpy as np
import pandas as pd
from typing import Dict, Any
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing

class ARIMAForecaster:
    """
    ARIMA / Exponential Smoothing Time-Series Forecaster.
    Fits ARIMA(1,1,1) or Holt-Winters Exponential Smoothing model to historical series.
    Provides point predictions and 95% confidence intervals (Lower/Upper bounds).
    """
    def __init__(self, name: str = "ARIMA / Holt-Winters"):
        self.name = name
        self.fitted_model = None
        self.is_exponential_smoothing = False
        self.residual_std = 0.5

    def fit(self, y: pd.Series):
        series = np.array(y, dtype=float)
        
        try:
            # Try ARIMA(1,1,1) first
            model = ARIMA(series, order=(1, 1, 1))
            self.fitted_model = model.fit()
            self.is_exponential_smoothing = False
            residuals = self.fitted_model.resid
            self.residual_std = float(np.std(residuals)) if len(residuals) > 0 else 0.5
        except Exception:
            try:
                # Fallback to Holt-Winters Exponential Smoothing
                model = ExponentialSmoothing(series, trend="add", seasonal="add", seasonal_periods=min(12, max(2, len(series)//2)))
                self.fitted_model = model.fit()
                self.is_exponential_smoothing = True
                residuals = series - self.fitted_model.fittedvalues
                self.residual_std = float(np.std(residuals)) if len(residuals) > 0 else 0.5
            except Exception:
                # Basic Exponential Smoothing fallback
                model = ExponentialSmoothing(series, trend="add")
                self.fitted_model = model.fit()
                self.is_exponential_smoothing = True
                self.residual_std = 0.5

    def predict(self, horizon: int = 30) -> Dict[str, Any]:
        if self.fitted_model is None:
            raise ValueError("ARIMA model must be fitted prior to predicting.")

        if not self.is_exponential_smoothing and hasattr(self.fitted_model, "get_forecast"):
            forecast_res = self.fitted_model.get_forecast(steps=horizon)
            predictions = forecast_res.predicted_mean
            conf_int = forecast_res.conf_int(alpha=0.05)
            
            # Handle potential 2D / 1D shape variations
            if hasattr(conf_int, "values"):
                conf_val = conf_int.values
            else:
                conf_val = conf_int
                
            lower_bound = [round(max(0.0, float(val[0])), 2) for val in conf_val]
            upper_bound = [round(float(val[1]), 2) for val in conf_val]
            preds = [round(float(p), 2) for p in predictions]
        else:
            preds_raw = self.fitted_model.forecast(steps=horizon)
            preds = [round(float(p), 2) for p in preds_raw]
            
            # Estimate confidence intervals analytically
            lower_bound = []
            upper_bound = []
            for i, p in enumerate(preds):
                margin = 1.96 * self.residual_std * np.sqrt(1 + i * 0.08)
                lower_bound.append(round(max(0.0, p - margin), 2))
                upper_bound.append(round(p + margin, 2))

        return {
            "model": self.name,
            "predictions": preds,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound
        }
