import pandas as pd
import numpy as np
from typing import Dict, Any, List
from backend.services.data_service import DataService
from backend.forecasting.naive_model import NaiveBaselineModel
from backend.forecasting.arima_model import ARIMAForecaster
from backend.forecasting.ml_models import MLForecaster
from backend.forecasting.evaluator import evaluate_all_models
from backend.utils.config import STATUS_THRESHOLDS

class ForecastService:
    def __init__(self, data_service: DataService):
        self.data_service = data_service

    def generate_forecast(self, station_name: str, horizon: int = 30, model_choice: str = "best") -> Dict[str, Any]:
        cleaned_df = self.data_service.cleaned_df
        station_df = cleaned_df[cleaned_df["Station"] == station_name].sort_values("Date").reset_index(drop=True)

        if station_df.empty:
            # Fallback to first station if station_name invalid
            station_name = list(cleaned_df["Station"].unique())[0]
            station_df = cleaned_df[cleaned_df["Station"] == station_name].sort_values("Date").reset_index(drop=True)

        # Run out-of-sample evaluation first to get baseline & best model
        eval_res = evaluate_all_models(station_df)

        if model_choice.lower() == "best":
            selected_model_name = eval_res["best_model"]
        elif "naive" in model_choice.lower():
            selected_model_name = "Naive Baseline"
        elif "arima" in model_choice.lower() or "holt" in model_choice.lower():
            selected_model_name = "ARIMA / Holt-Winters"
        elif "gradient" in model_choice.lower():
            selected_model_name = "Gradient Boosting Regressor"
        else:
            selected_model_name = "Random Forest Regressor"

        # Fit selected model on ENTIRE station dataset for final future forecasting
        if selected_model_name == "Naive Baseline":
            model = NaiveBaselineModel()
            model.fit(station_df["Water_Level"])
        elif selected_model_name == "ARIMA / Holt-Winters":
            model = ARIMAForecaster()
            model.fit(station_df["Water_Level"])
        elif selected_model_name == "Gradient Boosting Regressor":
            model = MLForecaster(model_type="gradient_boosting")
            model.fit(station_df, target_col="Water_Level")
        else:
            model = MLForecaster(model_type="random_forest")
            model.fit(station_df, target_col="Water_Level")

        forecast_res = model.predict(horizon=horizon)

        # Build future dates
        last_date = pd.to_datetime(station_df["Date"].max())
        forecast_dates = []
        for i in range(1, horizon + 1):
            if horizon <= 36:
                next_d = last_date + pd.DateOffset(months=i)
            else:
                next_d = last_date + pd.DateOffset(days=i)
            forecast_dates.append(next_d.strftime("%Y-%m-%d"))

        # Combine historical series for seamless chart rendering
        history = [
            {"date": row["Date"].strftime("%Y-%m-%d"), "water_level": round(float(row["Water_Level"]), 2)}
            for _, row in station_df.iterrows()
        ]

        forecast_points = []
        for d, p, l, u in zip(forecast_dates, forecast_res["predictions"], forecast_res["lower_bound"], forecast_res["upper_bound"]):
            forecast_points.append({
                "date": d,
                "predicted_level": round(float(p), 2),
                "lower_bound": round(float(l), 2),
                "upper_bound": round(float(u), 2)
            })

        # Calculate Groundwater Status
        latest_level = float(station_df["Water_Level"].iloc[-1])
        status_info = self.calculate_status(latest_level, forecast_res["predictions"])

        return {
            "station": station_name,
            "horizon": horizon,
            "model_used": selected_model_name,
            "best_model_recommended": eval_res["best_model"],
            "model_explanation": eval_res["explanation"],
            "status": status_info,
            "history": history,
            "forecast": forecast_points,
            "evaluation": eval_res
        }

    def calculate_status(self, latest_level: float, predictions: List[float]) -> Dict[str, Any]:
        if latest_level < STATUS_THRESHOLDS["NORMAL"]:
            status_code = "NORMAL"
            badge_color = "emerald"
            desc = "Groundwater levels are shallow and within safe historical operating limits."
        elif latest_level < STATUS_THRESHOLDS["WATCH"]:
            status_code = "WATCH"
            badge_color = "yellow"
            desc = "Groundwater levels show moderate drawdown. Regular monitoring recommended."
        elif latest_level < STATUS_THRESHOLDS["LOW"]:
            status_code = "LOW"
            badge_color = "orange"
            desc = "Groundwater levels are low (depleted water table). Water conservation advised."
        else:
            status_code = "CRITICAL"
            badge_color = "red"
            desc = "Groundwater levels are severely depleted (> 35 mbgl). Critical aquifer risk."

        # Trend direction
        if len(predictions) > 0:
            forecast_diff = predictions[-1] - latest_level
            if forecast_diff > 0.5:
                trend = "Declining (Depleting Depth increasing)"
            elif forecast_diff < -0.5:
                trend = "Recharging (Water table rising)"
            else:
                trend = "Stable"
        else:
            trend = "Stable"

        return {
            "status_code": status_code,
            "latest_level": round(latest_level, 2),
            "trend": trend,
            "description": desc,
            "color": badge_color
        }

    def get_trend_analysis(self, station_name: str) -> Dict[str, Any]:
        cleaned_df = self.data_service.cleaned_df
        station_df = cleaned_df[cleaned_df["Station"] == station_name].sort_values("Date").reset_index(drop=True)

        if station_df.empty:
            return {"error": "Station not found"}

        station_df["month"] = pd.to_datetime(station_df["Date"]).dt.month
        monthly_avg = station_df.groupby("month")["Water_Level"].mean().round(2).to_dict()

        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        seasonal_patterns = [
            {"month": month_names[m - 1], "avg_water_level": monthly_avg.get(m, 0.0)}
            for m in range(1, 13)
        ]

        min_val = round(float(station_df["Water_Level"].min()), 2)
        max_val = round(float(station_df["Water_Level"].max()), 2)
        avg_val = round(float(station_df["Water_Level"].mean()), 2)
        median_val = round(float(station_df["Water_Level"].median()), 2)
        std_val = round(float(station_df["Water_Level"].std()), 2)
        recent_change = round(float(station_df["Water_Level"].iloc[-1] - station_df["Water_Level"].iloc[0]), 2)

        # Identify peak depletion and peak recharge months
        peak_depletion_idx = int(np.argmax([m["avg_water_level"] for m in seasonal_patterns]))
        peak_recharge_idx = int(np.argmin([m["avg_water_level"] for m in seasonal_patterns]))
        peak_depletion_month = month_names[peak_depletion_idx]
        peak_recharge_month = month_names[peak_recharge_idx]

        # Calculate automated insights based on computed values
        if recent_change > 0.5:
            key_insight = f"Groundwater depth has depleted by {recent_change:+.2f} mbgl over the recorded multi-year period, indicating an ongoing declining water table."
        elif recent_change < -0.5:
            key_insight = f"Groundwater depth has recovered by {abs(recent_change):.2f} mbgl over the recorded period, indicating positive cumulative recharge."
        else:
            key_insight = f"Groundwater levels have remained stable with minimal net multi-year change ({recent_change:+.2f} mbgl)."

        seasonal_insight = (
            f"Strong seasonal monsoonal dynamics: Peak aquifer drawdown occurs in {peak_depletion_month} "
            f"({seasonal_patterns[peak_depletion_idx]['avg_water_level']} mbgl), followed by recovery in {peak_recharge_month} "
            f"({seasonal_patterns[peak_recharge_idx]['avg_water_level']} mbgl)."
        )

        variability_insight = (
            f"Historical standard deviation is {std_val:.2f} mbgl (range: {min_val} to {max_val} mbgl), "
            f"reflecting {'high' if std_val > 2.5 else 'moderate' if std_val > 1.0 else 'low'} inter-seasonal hydrological variance."
        )

        history_trend = [
            {"date": row["Date"].strftime("%Y-%m-%d"), "water_level": round(float(row["Water_Level"]), 2)}
            for _, row in station_df.iterrows()
        ]

        return {
            "station": station_name,
            "historical_min": min_val,
            "historical_max": max_val,
            "historical_avg": avg_val,
            "historical_median": median_val,
            "historical_std": std_val,
            "recent_change": recent_change,
            "overall_trend": "Depleting (Increasing mbgl)" if recent_change > 0 else "Recharging (Decreasing mbgl)",
            "seasonal_patterns": seasonal_patterns,
            "history_trend": history_trend,
            "insights": {
                "key_insight": key_insight,
                "seasonal_insight": seasonal_insight,
                "variability_insight": variability_insight,
                "peak_depletion_month": peak_depletion_month,
                "peak_recharge_month": peak_recharge_month
            }
        }
