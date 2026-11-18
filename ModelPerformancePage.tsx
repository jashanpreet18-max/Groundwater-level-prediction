import React, { useState, useEffect, useMemo } from "react";
import { StationSummary, ModelEvaluation } from "../types/groundwater";
import { fetchStations, fetchModelPerformance } from "../services/api";
import { ModelMetricsTable } from "../components/ModelMetricsTable";
import { VivaTooltip } from "../components/VivaTooltip";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  Trophy,
  CheckCircle,
  Zap,
  HelpCircle,
  ShieldCheck,
  Cpu,
  Layers,
} from "lucide-react";

export const ModelPerformancePage: React.FC = () => {
  const [stations, setStations] = useState<StationSummary[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [evaluation, setEvaluation] = useState<ModelEvaluation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const list = await fetchStations();
        setStations(list);
        if (list.length > 0) {
          const defaultSt = list[0].station;
          setSelectedStation(defaultSt);
          const ev = await fetchModelPerformance(defaultSt);
          setEvaluation(ev);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleStationChange = async (name: string) => {
    setSelectedStation(name);
    try {
      setLoading(true);
      const ev = await fetchModelPerformance(name);
      setEvaluation(ev);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const actualVsPredChartData = useMemo(() => {
    if (!evaluation) return [];

    const bestModelName = evaluation.best_model;
    const bestPredictions = evaluation.predictions_by_model[bestModelName] || [];

    return evaluation.test_dates.map((date, idx) => ({
      date,
      actual: evaluation.actual_values[idx],
      predicted: bestPredictions[idx],
    }));
  }, [evaluation]);

  const bestMetric = evaluation?.model_comparison?.[0];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-emerald-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Empirical ML Evaluation
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Model Performance & Validation Matrix
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Strict out-of-sample holdout test set evaluation using chronological 80/20 splitting.
            No future-data leakage; models are compared objectively across MAE, RMSE, R², and MAPE.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">Station:</label>
          <select
            value={selectedStation}
            onChange={(e) => handleStationChange(e.target.value)}
            className="bg-slate-900 text-slate-100 font-semibold border border-slate-700 rounded-lg text-sm px-3.5 py-2 focus:outline-none focus:border-emerald-500"
          >
            {stations.map((s) => (
              <option key={s.station} value={s.station}>
                {s.station} ({s.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Best Model Highlight Trophy Card */}
      {evaluation && bestMetric && (
        <div className="glass-panel p-6 bg-gradient-to-r from-emerald-500/10 via-slate-900/90 to-slate-900/80 border border-emerald-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Top Performing Architecture
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white font-['Outfit']">
              {evaluation.best_model}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {evaluation.explanation}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <VivaTooltip term="RMSE" explanation="Root Mean Squared Error penalizes larger errors; lower is better." />
              <span className="text-xl font-bold text-emerald-400 font-mono block mt-1">
                {bestMetric.rmse.toFixed(2)} m
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <VivaTooltip term="MAE" explanation="Mean Absolute Error: average magnitude of absolute error in mbgl." />
              <span className="text-xl font-bold text-white font-mono block mt-1">
                {bestMetric.mae.toFixed(2)} m
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <VivaTooltip term="R² Score" explanation="Coefficient of determination: variance explained by model." />
              <span className="text-xl font-bold text-cyan-400 font-mono block mt-1">
                {bestMetric.r2.toFixed(3)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <VivaTooltip term="MAPE" explanation="Mean Absolute Percentage Error relative to actual values." />
              <span className="text-xl font-bold text-teal-400 font-mono block mt-1">
                {bestMetric.mape.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Model Metrics Table */}
      {evaluation && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Comparative Multi-Model Evaluation Matrix
            </h3>
            <span className="text-xs text-slate-400">
              Tested on 20% holdout window ({evaluation.test_dates.length} periods)
            </span>
          </div>

          <ModelMetricsTable
            metrics={evaluation.model_comparison}
            bestModel={evaluation.best_model}
          />
        </div>
      )}

      {/* Actual vs Predicted Line Chart */}
      {evaluation && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">
                Holdout Validation: Actual vs. Predicted ({evaluation.best_model})
              </h3>
              <p className="text-xs text-slate-400">
                Overlay of true ground-truth observations (cyan solid) against holdout model predictions (emerald dashed).
              </p>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Evaluating candidate models...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={actualVsPredChartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d50" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    reversed
                    label={{
                      value: "Depth to Water Table (mbgl)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#070c18",
                      borderColor: "#1e2d50",
                      borderRadius: "0.5rem",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                    formatter={(val: any, name: any) => [
                      `${val} mbgl`,
                      name === "actual" ? "Actual Test Measurement" : "Model Prediction",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#06b6d4" }}
                    name="Actual Observed Level"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    strokeDasharray="3 3"
                    dot={{ r: 4, fill: "#10b981" }}
                    name="Predicted Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* VIVA MODE: Methodological "Why?" Questions and Answers */}
      <div className="glass-panel p-6 space-y-4 bg-slate-900/60 border border-slate-800">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          Viva Defence: Theoretical & Practical Rationale
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-400 block">Why time-series forecasting?</span>
            <p className="text-slate-300 leading-relaxed">
              Groundwater telemetry observations are strictly temporally ordered. Autoregressive lags and seasonal periodicity
              (pre vs post monsoon) govern recharge and depletion cycles that standard cross-sectional models fail to preserve.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-400 block">Why chronological splitting?</span>
            <p className="text-slate-300 leading-relaxed">
              Random k-fold shuffling leaks future information into training sets (lookahead bias).
              Splitting chronologically (first 80% train, last 20% test) mirrors real operational forecasting conditions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 block">Why compare baseline against ML?</span>
            <p className="text-slate-300 leading-relaxed">
              A Naive or seasonal baseline proves whether advanced ML models (Random Forest, Gradient Boosting)
              extract non-trivial signal rather than overfitting historical noise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
