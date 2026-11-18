import React from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: {
    text: string;
    type: "positive" | "negative" | "neutral" | "warning";
  };
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon, badge }) => {
  const badgeStyles = {
    positive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    negative: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    neutral: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className="glass-panel glass-card-hover p-5 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight font-['Outfit']">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-emerald-400">
          {icon}
        </div>
      </div>

      {badge && (
        <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium">
          <span className={`px-2 py-0.5 rounded-full border ${badgeStyles[badge.type]}`}>
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};
