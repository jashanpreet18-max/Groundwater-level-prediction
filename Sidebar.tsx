import React from "react";
import {
  LayoutDashboard,
  Database,
  TrendingUp,
  BarChart3,
  LineChart,
  MapPin,
  UploadCloud,
  Info,
} from "lucide-react";

export type NavTab =
  | "dashboard"
  | "data-explorer"
  | "forecast"
  | "model-performance"
  | "trend-analysis"
  | "station-map"
  | "data-upload"
  | "about";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "data-explorer", label: "Data Explorer", icon: <Database className="w-4 h-4" /> },
    { id: "forecast", label: "Forecast", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "model-performance", label: "Model Performance", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "trend-analysis", label: "Trend Analysis", icon: <LineChart className="w-4 h-4" /> },
    { id: "station-map", label: "Station Map", icon: <MapPin className="w-4 h-4" /> },
    { id: "data-upload", label: "Upload Dataset", icon: <UploadCloud className="w-4 h-4" /> },
    { id: "about", label: "About Project", icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0c1427] border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-5rem)]">
      <nav className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/5"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <span className={isActive ? "text-emerald-400" : "text-slate-500"}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs space-y-1">
        <p className="text-slate-300 font-semibold">CGWB & DWLR Data Compatible</p>
        <p className="text-slate-500 text-[11px]">Time-Series Analysis & AI Forecasting</p>
      </div>
    </aside>
  );
};
