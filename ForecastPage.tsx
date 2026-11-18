import React, { useState, useEffect, useMemo } from "react";
import { StationSummary, ForecastResponse } from "../types/groundwater";
import { fetchStations, generateForecast } from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import { VivaTooltip } from "../components/VivaTooltip";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
} from "recharts";
import {
  TrendingUp,
  Cpu,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
  Table,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export const ForecastPage: React.FC = () => {
  const [stations, setStations] = useState<StationSummary[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [horizon, setHorizon] = useState<number>(30);
  const [selectedModel, setSelectedModel] = useState<string>("best");
  const [showConfidence, setShowConfidence] = useState<boolean>(true);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const list = await fetchStations();
        setStations(list);
        if (list.length > 0) {
          const defaultSt = list[0].station;
          setSelectedStation(defaultSt);
          const res = await generateForecast(defaultSt, 30, "best");
          setForecastData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleStationChange = async (stationName: string) => {
    setSelectedStation(stationName);
    try {
      setIsGenerating(true);
      const res = await generateForecast(stationName, horizon, selectedModel);
      setForecastData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunForecast = async () => {
    if (!selectedStation) return;
    try {
      setIsGenerating(true);
      const res = await generateForecast(selectedStation, horizon, selectedModel);
      setForecastData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const chartPoints = useMemo(() => {
    if (!forecastData) return [];

    const historical: {
      date: string;
      historical: number | null;
      forecast: number | null;
      lower_bound: number | null;
      upper_bound: number | null;
      ci_range?: number[];
    }[] = forecastData.history.map((h) => ({
      date: h.date,
      historical: h.water_level,
      forecast: null,
      lower_bound: null,
      upper_bound: null,
    }));

    const forecast: {
      date: string;
      historical: number | null;
      forecast: number | null;
      lower_bound: number | null;
      upper_bound: number | null;
      ci_range?: number[];
    }[] = forecastData.forecast.map((f) => ({
      date: f.date,
      historical: null,
      forecast: f.predicted_level,
      lower_bound: f.lower_bound,
      upper_bound: f.upper_bound,
      ci_range: [f.lower_bound, f.upper_bound],
    }));

    if (historical.length > 0 && forecast.length > 0) {
      forecast[0] = {
        ...forecast[0],
        historical: historical[historical.length - 1].historical,
      };
    }

    return [...historical, ...forecast];
  }, [forecastData]);

  // Forecast metrics summary
  const latestObserved = forecastData ? forecastData.status.latest_level : 0;
  const forecastEndpoint = forecastData && forecastData.forecast.length > 0
    ? forecastData.forecast[forecastData.forecast.length - 1].predicted_level
    : 0;
  const netDelta = forecastEndpoint && latestObserved ? Math.round((forecastEndpoint - latestObserved) * 100) / 100 : 0;

  // Scientifically cautious narrative interpretation
  const interpretationText = useMemo(() => {
    if (!forecastData) return "";
    const dir = netDelta > 0.3 ? "drawdown (deepening depth)" : netDelta < -0.3 ? "recharge (rising water table)" : "stability";
    return (
      `Based on historical multi-year observations and out-of-sample recursive modeling, ` +
      `the ${forecastData.model_used} model projects an estimated net ${dir} ` +
      `of ${netDelta > 0 ? `+${netDelta}` : netDelta} mbgl across the ${forecastData.horizon}-period horizon. ` +
      `The projected endpoint is ${forecastEndpoint} mbgl (95% confidence interval: ${forecastData.forecast[forecastData.forecast.length - 1]?.lower_bound || 0} to ${forecastData.forecast[forecastData.forecast.length - 1]?.upper_bound || 0} mbgl). ` +
      `This projection supports preemptive local irrigation scheduling and aquifer recharge planning.`
    );
  }, [forecastData, netDelta, forecastEndpoint]);

  return (
    <div className="space-y-6">
      {/* Header & Controls Panel */}
      <div className="glass-panel p-6 space-y-4 border-l-4 border-l-cyan-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Time-Series Predictive Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] mt-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Groundwater Forecasting Studio
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Generate future groundwater depth projections across custom horizons using Naive, ARIMA,
            or Lag-Ensemble Machine Learning regressors with quantified uncertainty bounds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-800">
          {/* Station Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Monitoring Station:
            </label>
            <select
              value={selectedStation}
              onChange={(e) => handleStationChange(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-cyan-500 font-semibold"
            >
              {stations.map((s) => (
                <option key={s.station} value={s.station}>
                  {s.station} ({s.district})
                </option>
              ))}
            </select>
          </div>

          {/* Horizon Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Forecast Horizon:
            </label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value={7}>7 Periods (Short-Term)</option>
              <option value={14}>14 Periods (Bi-Weekly)</option>
              <option value={30}>30 Periods (Monthly Horizon)</option>
              <option value={60}>60 Periods (Bi-Monthly Horizon)</option>
              <option value={90}>90 Periods (Quarterly Horizon)</option>
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Model Algorithm:
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="best">&#9733; Auto-Select Best Out-of-Sample Model</option>
              <option value="naive">Naive Baseline Model</option>
              <option value="arima">ARIMA / Holt-Winters</option>
              <option value="random_forest">Random Forest Regressor (Ensemble)</option>
              <option value="gradient_boosting">Gradient Boosting Regressor</option>
            </select>
          </div>

          {/* Action Button */}
          <div className="flex items-end">
            <button
              onClick={handleRunForecast}
              disabled={isGenerating || loading}
              className="w-full h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              {isGenerating ? "Training & Projecting..." : "Generate Forecast"}
            </button>
          </div>
        </div>
      </div>

      {/* Forecast Result KPI Cards */}
      {forecastData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 bg-slate-900/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Latest Observed Depth</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-white font-mono">{latestObserved}</span>
              <span className="text-xs text-slate-400">mbgl</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Baseline ground-truth measurement</span>
          </div>

          <div className="glass-panel p-4 bg-slate-900/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Forecast Endpoint</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-emerald-400 font-mono">{forecastEndpoint}</span>
              <span className="text-xs text-slate-400">mbgl</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Projected depth after {forecastData.horizon} steps</span>
          </div>

          <div className="glass-panel p-4 bg-slate-900/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Expected Trajectory</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-2xl font-bold font-mono ${netDelta > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {netDelta > 0 ? `+${netDelta} m` : `${netDelta} m`}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {netDelta > 0 ? "Drawdown (water table falling)" : "Recharge (water table rising)"}
            </span>
          </div>

          <div className="glass-panel p-4 bg-slate-900/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Algorithm Deployed</span>
            <div className="text-base font-bold text-cyan-300 mt-1.5 truncate">
              {forecastData.model_used}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Selected by validation criteria</span>
          </div>
        </div>
      )}

      {/* Main Forecast Chart */}
      {forecastData && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Forecast Trajectory &mdash; {forecastData.station}
                </h3>
                <StatusBadge status={forecastData.status.status_code} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Model: <span className="text-emerald-400 font-semibold">{forecastData.model_used}</span> | Horizon: {forecastData.horizon} periods
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showConfidence}
                  onChange={(e) => setShowConfidence(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                />
                Show 95% Confidence Interval
              </label>
            </div>
          </div>

          <div className="h-96 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartPoints} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
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
                    name === "historical" ? "Historical Observed Level" : name === "forecast" ? "Predicted Level" : "Confidence Bound",
                  ]}
                />
                <Legend />
                {showConfidence && (
                  <Area
                    type="monotone"
                    dataKey="ci_range"
                    fill="#10b981"
                    fillOpacity={0.15}
                    stroke="none"
                    name="95% Confidence Bound"
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={false}
                  name="Historical Observed Level (mbgl)"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: "#10b981" }}
                  name="Predicted Level (mbgl)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Narrative Interpretation Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs leading-relaxed flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-cyan-300">Hydrological Forecast Interpretation:</p>
              <p className="text-slate-300 mt-1">{interpretationText}</p>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Data Table */}
      {forecastData && (
        <div className="glass-panel p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-400" />
              Tabular Prediction Schedule (Next {forecastData.forecast.length} Periods)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Values in meters below ground level (mbgl)
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 max-h-72 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 px-4">Period Date</th>
                  <th className="py-2.5 px-4">Predicted Level</th>
                  <th className="py-2.5 px-4">Lower Bound (95%)</th>
                  <th className="py-2.5 px-4">Upper Bound (95%)</th>
                  <th className="py-2.5 px-4 text-right">Relative Shift vs Current</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
                {forecastData.forecast.map((pt, i) => {
                  const shift = Math.round((pt.predicted_level - latestObserved) * 100) / 100;
                  return (
                    <tr key={pt.date} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 text-white font-semibold">{pt.date}</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-bold">{pt.predicted_level} mbgl</td>
                      <td className="py-2.5 px-4 text-slate-400">{pt.lower_bound} mbgl</td>
                      <td className="py-2.5 px-4 text-slate-400">{pt.upper_bound} mbgl</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className={shift > 0 ? "text-amber-400" : "text-emerald-400"}>
                          {shift > 0 ? `+${shift}m` : `${shift}m`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scientific Honesty Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-200">Scientific & Hydrological Advisory:</p>
          <p className="text-slate-400 mt-0.5">
            Groundwater-level forecasts are statistical approximations computed from historical telemetry observations.
            Field factors such as unexpected tube-well pumpage spikes, canal rotational schedules, and localized rainfall extremes
            may cause real-world deviations. These estimates should support, not replace, expert hydrogeological review.
          </p>
        </div>
      </div>
    </div>
  );
};
