import React from "react";
import { Droplet, ShieldCheck, ExternalLink } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-800/80 bg-[#070c18] py-8 px-6 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold">
            <Droplet className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-white tracking-tight font-['Outfit'] text-sm">
              Groundwater AI
            </span>
            <span className="text-slate-500 mx-2">|</span>
            <span className="text-slate-400">Groundwater Level Prediction System</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px] text-center md:text-right">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Groundwater Level Prediction System • Environmental Intelligence Platform. Forecasts are calculated from historical CGWB &amp; DWLR telemetry observations.</span>
        </div>
      </div>
    </footer>
  );
};
