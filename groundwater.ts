export interface StationSummary {
  station: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  latest_water_level: number;
  latest_date: string;
  status: "NORMAL" | "WATCH" | "LOW" | "CRITICAL";
  total_observations: number;
  mean_water_level?: number;
  min_water_level?: number;
  max_water_level?: number;
  net_change?: number;
  trend_direction?: string;
}

export interface Observation {
  date: string;
  water_level: number;
  unit: string;
}

export interface ForecastPoint {
  date: string;
  predicted_level: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ModelMetric {
  model: string;
  mae: number;
  rmse: number;
  r2: number;
  mape: number;
}

export interface ModelEvaluation {
  test_dates: string[];
  actual_values: number[];
  model_comparison: ModelMetric[];
  best_model: string;
  explanation: string;
  predictions_by_model: Record<string, number[]>;
}

export interface GroundwaterStatusInfo {
  status_code: "NORMAL" | "WATCH" | "LOW" | "CRITICAL";
  latest_level: number;
  trend: string;
  description: string;
  color: string;
}

export interface ForecastResponse {
  station: string;
  horizon: number;
  model_used: string;
  best_model_recommended: string;
  model_explanation: string;
  status: GroundwaterStatusInfo;
  history: Observation[];
  forecast: ForecastPoint[];
  evaluation: ModelEvaluation;
}

export interface SeasonalPattern {
  month: string;
  avg_water_level: number;
}

export interface TrendInsights {
  key_insight: string;
  seasonal_insight: string;
  variability_insight: string;
  peak_depletion_month: string;
  peak_recharge_month: string;
}

export interface TrendAnalysisResponse {
  station: string;
  historical_min: number;
  historical_max: number;
  historical_avg: number;
  historical_median?: number;
  historical_std?: number;
  recent_change: number;
  overall_trend: string;
  seasonal_patterns: SeasonalPattern[];
  history_trend?: Observation[];
  insights?: TrendInsights;
}

export interface DatasetStats {
  total_records: number;
  number_of_locations: number;
  date_range: { start: string; end: string };
  missing_values: number;
  avg_water_level: number;
  min_water_level: number;
  max_water_level: number;
}

export type LocationsTaxonomy = Record<string, Record<string, string[]>>;
