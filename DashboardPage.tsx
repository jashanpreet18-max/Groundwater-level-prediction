import React, { useState, useEffect, useMemo } from "react";
import {
  StationSummary,
  ForecastResponse,
  DatasetStats,
  LocationsTaxonomy,
} from "../types/groundwater";
import {
  fetchStations,
  fetchGlobalStats,
  generateForecast,
  fetchLocations,
} from "../services/api";
import { KpiCard } from "../components/KpiCard";
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
  MapPin,
  FileText,
  Activity,
  Compass,
  Zap,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface DashboardPageProps {
  onNavigateTab: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const [stations, setStations] = useState<StationSummary[]>([]);
  const [taxonomy, setTaxonomy] = useState<LocationsTaxonomy>({});
  const [globalStats, setGlobalStats] = useState<DatasetStats | null>(null);
  
  // Location selection state
  const [selectedState, setSelectedState] = useState<string>("All");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [selectedStation, setSelectedStation] = useState<string>("");
  
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [showConfidence, setShowConfidence] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize data
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [stList, gStats, tax] = await Promise.all([
          fetchStations(),
          fetchGlobalStats(),
          fetchLocations().catch(() => ({})),
        ]);
        setStations(stList);
        setGlobalStats(gStats);
        setTaxonomy(tax);

        if (stList.length > 0) {
          const defaultSt = stList[0].station;
          setSelectedStation(defaultSt);
          setSelectedState(stList[0].state || "All");
          setSelectedDistrict(stList[0].district || "All");
          const fc = await generateForecast(defaultSt, 30, "best");
          setForecastData(fc);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Handle station change
  const handleStationChange = async (stationName: string, stateOverride?: string, districtOverride?: string) => {
    setSelectedStation(stationName);
    const meta = stations.find((s) => s.station === stationName);
    if (meta) {
      if (stateOverride !== undefined) {
        setSelectedState(stateOverride);
      } else {
        setSelectedState(meta.state);
      }
      if (districtOverride !== undefined) {
        setSelectedDistrict(districtOverride);
      } else {
        setSelectedDistrict(meta.district);
      }
    }
    try {
      setLoading(true);
      const fc = await generateForecast(stationName, 30, "best");
      setForecastData(fc);
    } catch (err) {
      console.error("Error changing station:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    setSelectedDistrict("All");
    const candidates = stations.filter((s) => newState === "All" || s.state === newState);
    if (candidates.length > 0) {
      handleStationChange(candidates[0].station, newState, "All");
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    const candidates = stations.filter((s) => {
      if (selectedState !== "All" && s.state !== selectedState) return false;
      if (newDistrict !== "All" && s.district !== newDistrict) return false;
      return true;
    });
    if (candidates.length > 0) {
      handleStationChange(candidates[0].station, selectedState, newDistrict);
    }
  };

  // State dropdown list
  const availableStates = useMemo(() => {
    const s = Array.from(new Set(stations.map((st) => st.state))).filter(Boolean);
    return ["All", ...s];
  }, [stations]);

  // District dropdown list filtered by selected state
  const availableDistricts = useMemo(() => {
    let filtered = stations;
    if (selectedState !== "All") {
      filtered = filtered.filter((st) => st.state === selectedState);
    }
    const d = Array.from(new Set(filtered.map((st) => st.district))).filter(Boolean);
    return ["All", ...d];
  }, [stations, selectedState]);

  // Filtered station dropdown list
  const filteredStations = useMemo(() => {
    return stations.filter((st) => {
      if (selectedState !== "All" && st.state !== selectedState) return false;
      if (selectedDistrict !== "All" && st.district !== selectedDistrict) return false;
      return true;
    });
  }, [stations, selectedState, selectedDistrict]);

  // Combined chart data
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

    // Connect last historical to first forecast point for seamless continuity
    if (historical.length > 0 && forecast.length > 0) {
      forecast[0] = {
        ...forecast[0],
        historical: historical[historical.length - 1].historical,
      };
    }

    return [...historical, ...forecast];
  }, [forecastData]);

  const bestMetric = forecastData?.evaluation?.model_comparison?.[0];
  const selectedStationMeta = stations.find((s) => s.station === selectedStation);

  // Forecast endpoint calculation
  const latestLevel = forecastData ? forecastData.status.latest_level : 0;
  const forecastEndpoint = forecastData && forecastData.forecast.length > 0
    ? forecastData.forecast[forecastData.forecast.length - 1].predicted_level
    : 0;
  const netForecastDiff = forecastEndpoint && latestLevel ? roundVal(forecastEndpoint - latestLevel) : 0;

  function roundVal(v: number): number {
    return Math.round(v * 100) / 100;
  }

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="glass-panel p-6 border-l-4 border-l-emerald-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Environmental Intelligence Platform
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white font-['Outfit'] mt-1">
            Groundwater Level Prediction System
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            AI-powered groundwater monitoring and time-series forecasting for smarter water-resource planning,
            drought mitigation, and sustainable aquifer management.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Dataset Source:</span>
            <span className="font-semibold text-cyan-400">CGWB / DWLR Standard</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Active Mode:</span>
            <span className="font-semibold text-emerald-400">Official Telemetry (Active)</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Last Observation:</span>
            <span className="font-mono text-slate-200">
              {selectedStationMeta?.latest_date || "2025-12-01"}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Telemetry Status Notice */}
      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider text-[10px] shrink-0">
            Official Mode
          </span>
          <span className="leading-relaxed text-slate-300">
            Operating with official CGWB &amp; DWLR telemetry observations. Automated time-series forecasting and risk scoring active.
          </span>
        </div>
        <button
          onClick={() => onNavigateTab("data-upload")}
          className="shrink-0 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 font-semibold text-[11px] transition-colors"
        >
          Import Telemetry CSV
        </button>
      </div>

      {/* Cascading Location Filter Toolbar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Location Hierarchy:
          </span>

          {/* State */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-slate-400">State:</label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg text-xs px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
            >
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-slate-400">District:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg text-xs px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
            >
              {availableDistricts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>

          {/* Station */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-slate-400 font-semibold text-white">Monitoring Station:</label>
            <select
              value={selectedStation}
              onChange={(e) => handleStationChange(e.target.value)}
              className="bg-slate-950 text-slate-100 font-semibold border border-emerald-500/50 rounded-lg text-xs px-3 py-1.5 focus:border-emerald-400 focus:outline-none"
            >
              {filteredStations.map((s) => (
                <option key={s.station} value={s.station}>
                  {s.station} ({s.district})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedStationMeta && (
          <div className="text-xs text-slate-400">
            Coordinates:{" "}
            <span className="font-mono text-emerald-400">
              {selectedStationMeta.latitude.toFixed(4)}°N, {selectedStationMeta.longitude.toFixed(4)}°E
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid — Fully Dynamic to Selected Station & Region */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        <KpiCard
          title="Aquifer Risk Status"
          value={selectedStationMeta?.status || forecastData?.status?.status_code || "NORMAL"}
          subtitle={`${selectedStationMeta?.district || "Selected"} Aquifer`}
          icon={<Compass className="w-4 h-4 text-emerald-400" />}
          badge={{
            text: (selectedStationMeta?.status || forecastData?.status?.status_code) === "NORMAL"
              ? "Safe Aquifer"
              : (selectedStationMeta?.status || forecastData?.status?.status_code) === "WATCH"
              ? "Watch Level"
              : "High Depletion",
            type: (selectedStationMeta?.status || forecastData?.status?.status_code) === "NORMAL"
              ? "positive"
              : (selectedStationMeta?.status || forecastData?.status?.status_code) === "WATCH"
              ? "warning"
              : "negative",
          }}
        />
        <KpiCard
          title="Station Records"
          value={`${selectedStationMeta?.total_observations || forecastData?.history?.length || 96} Months`}
          subtitle={`Telemetry: ${selectedStationMeta?.state || "State"}`}
          icon={<FileText className="w-4 h-4 text-cyan-400" />}
          badge={{ text: "2018–2025 Series", type: "neutral" }}
        />
        <KpiCard
          title="Station Mean Depth"
          value={
            selectedStationMeta?.mean_water_level !== undefined
              ? `${selectedStationMeta.mean_water_level} m`
              : forecastData?.history?.length
              ? `${(forecastData.history.reduce((acc, h) => acc + h.water_level, 0) / forecastData.history.length).toFixed(2)} m`
              : "--"
          }
          subtitle="Station Historical Mean"
          icon={<Activity className="w-4 h-4 text-teal-400" />}
          badge={{ text: "mbgl Depth", type: "neutral" }}
        />
        <KpiCard
          title="Latest Observed Depth"
          value={
            forecastData?.status?.latest_level !== undefined
              ? `${forecastData.status.latest_level} m`
              : selectedStationMeta?.latest_water_level !== undefined
              ? `${selectedStationMeta.latest_water_level} m`
              : "--"
          }
          subtitle="Meters Below Surface"
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          badge={{
            text: forecastData?.status?.trend || selectedStationMeta?.trend_direction || "Stable",
            type:
              (forecastData?.status?.status_code || selectedStationMeta?.status) === "CRITICAL"
                ? "negative"
                : (forecastData?.status?.status_code || selectedStationMeta?.status) === "WATCH"
                ? "warning"
                : "positive",
          }}
        />
        <KpiCard
          title="30-Day Forecast Target"
          value={
            forecastData?.forecast?.length
              ? `${forecastData.forecast[forecastData.forecast.length - 1].predicted_level.toFixed(2)} m`
              : "--"
          }
          subtitle={forecastData?.best_model_recommended ? `Via ${forecastData.best_model_recommended}` : "Model Projection"}
          icon={<Zap className="w-4 h-4 text-emerald-400" />}
          badge={{
            text: bestMetric ? `RMSE: ${bestMetric.rmse.toFixed(2)} m` : "Calculated",
            type: "positive",
          }}
        />
        <KpiCard
          title="Net Multi-Year Shift"
          value={
            selectedStationMeta?.net_change !== undefined
              ? `${selectedStationMeta.net_change > 0 ? "+" : ""}${selectedStationMeta.net_change} m`
              : forecastData?.history?.length
              ? `${(forecastData.history[forecastData.history.length - 1].water_level - forecastData.history[0].water_level) > 0 ? "+" : ""}${(forecastData.history[forecastData.history.length - 1].water_level - forecastData.history[0].water_level).toFixed(2)} m`
              : "--"
          }
          subtitle="Net Drawdown vs 2018"
          icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
          badge={{
            text: (selectedStationMeta?.net_change || 0) > 0 ? "Depleting Aquifer" : "Recharging",
            type: (selectedStationMeta?.net_change || 0) > 0 ? "negative" : "positive",
          }}
        />
      </div>

      {/* CENTERPIECE: Large Interactive Groundwater Level Overview Chart */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white font-['Outfit']">
                Groundwater Level Overview &mdash; {selectedStation}
              </h3>
              {forecastData && <StatusBadge status={forecastData.status.status_code} />}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical observations and 30-day forecasted trajectory for the selected monitoring station.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showConfidence}
                onChange={(e) => setShowConfidence(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              Show 95% Confidence Band
            </label>

            <button
              onClick={() => onNavigateTab("forecast")}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition-all flex items-center gap-1"
            >
              Open Forecast Studio <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="h-88 w-full pt-2">
          {loading ? (
            <div className="h-72 flex items-center justify-center text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                <span>Calculating station telemetry and generating forecasts...</span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={chartPoints} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d50" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  reversed
                  label={{
                    value: "Depth to Water Table (mbgl — lower is deeper/depleted)",
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
                  formatter={(value: any, name: any) => [
                    `${value} mbgl`,
                    name === "historical"
                      ? "Historical Observed Level"
                      : name === "forecast"
                      ? "Predicted Level"
                      : "Confidence Interval",
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
                    name="95% Confidence Band"
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={false}
                  name="Historical Observed Level"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3.5, fill: "#10b981" }}
                  name="Forecasted Level"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* DUAL PANELS: Groundwater Status & Forecast Summary */}
      {forecastData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Groundwater Status Card */}
          <div className="glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Aquifer Status Assessment
              </span>
              <StatusBadge status={forecastData.status.status_code} />
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-white font-['Outfit']">
                  {forecastData.status.status_code} DEPTH LEVEL
                </p>
                <p className="text-xs text-slate-300">{forecastData.status.description}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Classification Standard: </span>
              Thresholds are project-defined (&lt;15m Normal, 15&ndash;25m Watch, 25&ndash;35m Low, &gt;35m Critical)
              to facilitate risk prioritization; official operational deployment requires calibration against local hydrogeological standards.
            </div>
          </div>

          {/* Forecast Summary Card */}
          <div className="glass-panel p-5 space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              30-Day Forecast Horizon Summary
            </span>

            <div className="grid grid-cols-3 gap-2 text-center py-1">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Latest Observed</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">{latestLevel} m</span>
                <span className="text-[10px] text-slate-500">Current Depth</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Forecast Endpoint</span>
                <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{forecastEndpoint} m</span>
                <span className="text-[10px] text-slate-500">After 30 Days</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Expected Shift</span>
                <span
                  className={`text-lg font-bold font-mono mt-0.5 block ${
                    netForecastDiff > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {netForecastDiff > 0 ? `+${netForecastDiff}m` : `${netForecastDiff}m`}
                </span>
                <span className="text-[10px] text-slate-500">
                  {netForecastDiff > 0 ? "Drawdown" : "Recharge"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-center justify-between">
              <div>
                <span className="text-slate-400">Winning Algorithm: </span>
                <span className="font-semibold text-emerald-400">{forecastData.model_used}</span>
              </div>
              <button
                onClick={() => onNavigateTab("model-performance")}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                View Evaluation <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIVA MODE: "How the Prediction Works" End-to-End Visual Pipeline */}
      <div className="glass-panel p-6 space-y-4 bg-gradient-to-br from-slate-900/90 via-[#0c1427] to-slate-900/80 border border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
              End-to-End Prediction Architecture Pipeline
            </h4>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Academically Rigorous
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold inline-flex items-center justify-center mb-1.5">
              1
            </span>
            <p className="font-bold text-white">CGWB Ingestion</p>
            <p className="text-[11px] text-slate-400 mt-1">Multi-year observations in mbgl standard</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold inline-flex items-center justify-center mb-1.5">
              2
            </span>
            <p className="font-bold text-white">Cleaning & Impute</p>
            <p className="text-[11px] text-slate-400 mt-1">Forward-fill & linear continuous interpolation</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 font-bold inline-flex items-center justify-center mb-1.5">
              3
            </span>
            <p className="font-bold text-white">Lag Engineering</p>
            <p className="text-[11px] text-slate-400 mt-1">Lags 1-30, rolling stats & cyclical sine encodings</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold inline-flex items-center justify-center mb-1.5">
              4
            </span>
            <p className="font-bold text-white">80/20 Split</p>
            <p className="text-[11px] text-slate-400 mt-1">Chronological split without future data leakage</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold inline-flex items-center justify-center mb-1.5">
              5
            </span>
            <p className="font-bold text-white">4-Model Eval</p>
            <p className="text-[11px] text-slate-400 mt-1">Naive, ARIMA, Random Forest, Gradient Boosting</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/30 bg-emerald-500/5">
            <span className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 font-bold inline-flex items-center justify-center mb-1.5">
              6
            </span>
            <p className="font-bold text-emerald-300">Best Forecast</p>
            <p className="text-[11px] text-slate-300 mt-1">Lowest RMSE model + 95% uncertainty interval</p>
          </div>
        </div>
      </div>
    </div>
  );
};
