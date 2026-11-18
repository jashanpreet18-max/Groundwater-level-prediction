import React from "react";
import { Droplet, Activity, RefreshCw, Info, Database, Clock } from "lucide-react";

interface HeaderProps {
  apiStatus: "healthy" | "error" | "loading";
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ apiStatus, onRefresh }) => {
  return (
    <header className="h-20 bg-[#070c18]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg shadow-black/20">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Droplet className="w-6 h-6 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-white tracking-tight font-['Outfit']">
              Groundwater Level Prediction System
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
              Groundwater AI
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            AI-powered groundwater monitoring and forecasting for smarter water-resource planning
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Last Updated */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Last Updated: <strong className="text-slate-200">Dec 2025</strong></span>
        </div>

        {/* Official Dataset Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium" title="Official CGWB / DWLR Observation Telemetry Active">
          <Database className="w-3.5 h-3.5" />
          <span>Official Dataset Active</span>
        </div>

        {/* System Online Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <Activity className={`w-3.5 h-3.5 ${apiStatus === "healthy" ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
          <span className="text-slate-200 font-semibold">
            {apiStatus === "healthy" ? "System Online" : apiStatus === "loading" ? "Connecting..." : "Offline"}
          </span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
            title="Refresh System Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
