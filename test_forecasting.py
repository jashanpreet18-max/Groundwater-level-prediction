import pytest
import pandas as pd
import numpy as np
from backend.forecasting.naive_model import NaiveBaselineModel
from backend.forecasting.arima_model import ARIMAForecaster
from backend.forecasting.ml_models import MLForecaster
from backend.forecasting.evaluator import evaluate_all_models

@pytest.fixture
def sample_series():
    dates = pd.date_range(start="2020-01-01", periods=36, freq="MS")
    values = [20.0 + 0.3 * i + 2.0 * np.sin(i * 0.5) for i in range(36)]
    return pd.DataFrame({"Date": dates, "Water_Level": values, "Station": "Test Station"})

def test_naive_model(sample_series):
    model = NaiveBaselineModel()
    model.fit(sample_series["Water_Level"])
    res = model.predict(horizon=6)
    assert len(res["predictions"]) == 6
    assert len(res["lower_bound"]) == 6
    assert len(res["upper_bound"]) == 6

def test_arima_model(sample_series):
    model = ARIMAForecaster()
    model.fit(sample_series["Water_Level"])
    res = model.predict(horizon=6)
    assert len(res["predictions"]) == 6
    assert len(res["lower_bound"]) == 6

def test_ml_forecaster(sample_series):
    model = MLForecaster(model_type="random_forest")
    model.fit(sample_series, target_col="Water_Level")
    res = model.predict(horizon=6)
    assert len(res["predictions"]) == 6

def test_evaluator(sample_series):
    res = evaluate_all_models(sample_series)
    assert "best_model" in res
    assert "model_comparison" in res
    assert len(res["model_comparison"]) == 4
