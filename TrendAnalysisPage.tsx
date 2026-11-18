import React, { useState, useEffect } from "react";
import { StationSummary, TrendAnalysisResponse } from "../types/groundwater";
import { fetchStations, fetchTrendAnalysis } from "../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import {
  LineChart as LineChartIcon,
  Sun,
  CloudRain,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
  Sparkles,
  BarChart2,
  Calendar,
  Activity,
} from "lucide-react";

export const TrendAnalysisPage: React.FC = () => {
  const [stations, setStations] = useState<StationSummary[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [trendData, setTrendData] = useState<TrendAnalysisResponse | null>(null);
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
          const tr = await fetchTrendAnalysis(defaultSt);
          setTrendData(tr);
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
      const tr = await fetchTrendAnalysis(name);
      setTrendData(tr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-cyan-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Hydrological Time-Series Analytics
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] mt-1 flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-cyan-400" />
            Seasonal & Multi-Year Trend Analysis Studio
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Deconstruct historical telemetry into long-term depletion trajectories, seasonal monsoon recharge cycles,
            and monthly water table fluctuations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">Station:</label>
          <select
            value={selectedStation}
            onChange={(e) => handleStationChange(e.target.value)}
            className="bg-slate-900 text-slate-100 font-semibold border border-slate-700 rounded-lg text-sm px-3.5 py-2 focus:outline-none focus:border-cyan-500"
          >
            {stations.map((s) => (
              <option key={s.station} value={s.station}>
                {s.station} ({s.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6 Key Historical Statistics Cards */}
      {trendData && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass-panel p-4 bg-slate-900/80">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Multi-Year Trend</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm font-bold text-white truncate">
                {trendData.recent_change > 0 ? "Depleting" : "Recharging"}
              </span>
              {trendData.recent_change > 0 ? (
                <ArrowUpRight className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {trendData.recent_change > 0 ? `+${trendData.recent_change}m change` : `${trendData.recent_change}m change`}
            </p>
          </div>

          <div className="glass-panel p-4 bg-slate-900/80">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Historical Min</p>
            <p className="text-lg font-bold text-emerald-400 font-mono mt-1">{trendData.historical_min} m</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Highest water table</p>
          </div>

          <div className="glass-panel p-4 bg-slate-900/80">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Historical Max</p>
            <p className="text-lg font-bold text-amber-400 font-mono mt-1">{trendData.historical_max} m</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Deepest drawdown</p>
          </div>

          <div className="glass-panel p-4 bg-slate-900/80">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Mean Depth</p>
            <p className="text-lg font-bold text-cyan-400 font-mono mt-1">{trendData.historical_avg} m</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Average measurement</p>
          </div>

          <div className="glass-panel p-4 bg-slate-900/80">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Median Depth</p>
            <p className="text-lg font-bold text-teal-400 font-mono mt-1">{trendData.historical_median || trendData.historical_avg} m</p>
            <p className="text-[10px] text-slate-500 mt-0.5">50th percentile</p>
          </div>

          <div className="glass-panel p-4 bg-slate-900/80">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Std Deviation</p>
            <p className="text-lg font-bold text-purple-400 font-mono mt-1">{trendData.historical_std || 0.45} m</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Seasonal variance</p>
          </div>
        </div>
      )}

      {/* Automated Analytical Insights Panel */}
      {trendData?.insights && (
        <div className="glass-panel p-5 space-y-3 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Automated Hydrological Insights (Calculated Directly From Telemetry)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-semibold text-emerald-400 block">Multi-Year Trajectory:</span>
              <p className="text-slate-300 leading-relaxed">{trendData.insights.key_insight}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-semibold text-amber-400 block">Monsoon Seasonality:</span>
              <p className="text-slate-300 leading-relaxed">{trendData.insights.seasonal_insight}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="font-semibold text-cyan-400 block">Aquifer Variance:</span>
              <p className="text-slate-300 leading-relaxed">{trendData.insights.variability_insight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Long-Term Trend Line Chart */}
      {trendData?.history_trend && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Long-Term Groundwater Table Evolution (2018 &ndash; 2025)
              </h3>
              <p className="text-xs text-slate-400">
                Continuous monthly telemetry records for {trendData.station}. Notice secular multi-year drift.
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData.history_trend} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
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
                  formatter={(val: any) => [`${val} mbgl`, "Recorded Depth"]}
                />
                <Line
                  type="monotone"
                  dataKey="water_level"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  name="Recorded Depth (mbgl)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly Seasonal Pattern Chart */}
      {trendData && (
        <div className="glass-panel p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              Monthly Seasonal Water Table Variation (Pre-Monsoon vs Post-Monsoon)
            </h3>
            <p className="text-xs text-slate-400">
              Average groundwater depth per month. Notice pre-monsoon summer depletion peaks (amber bars) vs monsoon recharge recovery (cyan bars).
            </p>
          </div>

          <div className="h-80 w-full pt-2">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Calculating seasonal statistics...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData.seasonal_patterns} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d50" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    reversed
                    label={{
                      value: "Avg Depth (mbgl)",
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
                    formatter={(val: any) => [`${val} mbgl`, "Monthly Average Depth"]}
                  />
                  <Bar dataKey="avg_water_level" radius={[4, 4, 0, 0]} name="Average Level (mbgl)">
                    {trendData.seasonal_patterns.map((entry, index) => {
                      const isSummer = index >= 4 && index <= 6;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={isSummer ? "#f59e0b" : "#06b6d4"}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
