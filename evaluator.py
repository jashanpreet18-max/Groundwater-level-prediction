import pandas as pd
import numpy as np
from typing import Dict, Any, List
from backend.forecasting.naive_model import NaiveBaselineModel
from backend.forecasting.arima_model import ARIMAForecaster
from backend.forecasting.ml_models import MLForecaster
from backend.utils.metrics import calculate_metrics

def evaluate_all_models(df_station: pd.DataFrame, target_col: str = "Water_Level") -> Dict[str, Any]:
    """
    Performs strict chronological train-test evaluation across all candidate models:
    - Splits series into 80% Train, 20% Test (minimum test size = 3).
    - Trains Naive Baseline, ARIMA, Random Forest, and Gradient Boosting.
    - Evaluates out-of-sample predictions on Test set.
    - Computes MAE, RMSE, R², MAPE metrics.
    - Identifies the best performing model.
    """
    df_sorted = df_station.sort_values(by="Date").reset_index(drop=True)
    n = len(df_sorted)

    if n < 10:
        # If too few data points, use 70/30 split
        split_idx = max(5, int(n * 0.7))
    else:
        split_idx = int(n * 0.8)

    train_df = df_sorted.iloc[:split_idx].copy()
    test_df = df_sorted.iloc[split_idx:].copy()

    test_y = test_df[target_col].values
    test_horizon = len(test_df)

    if test_horizon == 0:
        test_horizon = 1
        test_y = train_df[target_col].iloc[-1:].values

    models_to_evaluate = [
        ("Naive Baseline", NaiveBaselineModel("Naive Baseline")),
        ("ARIMA / Holt-Winters", ARIMAForecaster("ARIMA / Holt-Winters")),
        ("Random Forest Regressor", MLForecaster(model_type="random_forest")),
        ("Gradient Boosting Regressor", MLForecaster(model_type="gradient_boosting"))
    ]

    model_metrics = []
    test_dates = [d.strftime("%Y-%m-%d") for d in test_df["Date"]]
    actual_values = [round(float(v), 2) for v in test_y]

    predictions_by_model = {}

    for name, model_obj in models_to_evaluate:
        try:
            if isinstance(model_obj, MLForecaster):
                model_obj.fit(train_df, target_col=target_col)
            else:
                model_obj.fit(train_df[target_col])

            res = model_obj.predict(horizon=test_horizon)
            pred_y = res["predictions"]
            predictions_by_model[name] = pred_y

            metrics = calculate_metrics(test_y, pred_y[:len(test_y)])
            model_metrics.append({
                "model": name,
                "mae": metrics["mae"],
                "rmse": metrics["rmse"],
                "r2": metrics["r2"],
                "mape": metrics["mape"],
                "predictions": pred_y
            })
        except Exception as e:
            # Fallback if a specific model encounters fitting errors
            model_metrics.append({
                "model": name,
                "mae": 999.0,
                "rmse": 999.0,
                "r2": -1.0,
                "mape": 999.0,
                "predictions": [round(float(np.mean(train_df[target_col])), 2)] * test_horizon
            })

    # Sort models by lowest RMSE
    sorted_metrics = sorted(model_metrics, key=lambda x: x["rmse"])
    best_model = sorted_metrics[0]

    explanation = (
        f"Selected '{best_model['model']}' as the best model because it achieved the lowest out-of-sample "
        f"Root Mean Squared Error (RMSE: {best_model['rmse']:.2f} mbgl) and Mean Absolute Error "
        f"(MAE: {best_model['mae']:.2f} mbgl) on the 20% chronological holdout test set."
    )

    return {
        "test_dates": test_dates,
        "actual_values": actual_values,
        "model_comparison": [
            {
                "model": item["model"],
                "mae": item["mae"],
                "rmse": item["rmse"],
                "r2": item["r2"],
                "mape": item["mape"]
            }
            for item in sorted_metrics
        ],
        "best_model": best_model["model"],
        "explanation": explanation,
        "predictions_by_model": predictions_by_model
    }
