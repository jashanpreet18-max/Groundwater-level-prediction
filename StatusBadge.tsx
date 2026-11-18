import React from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from "lucide-react";

interface StatusBadgeProps {
  status: "NORMAL" | "WATCH" | "LOW" | "CRITICAL";
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true }) => {
  const configs = {
    NORMAL: {
      label: "NORMAL",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    WATCH: {
      label: "WATCH",
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-500/30",
      icon: <Info className="w-3.5 h-3.5" />,
    },
    LOW: {
      label: "LOW",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    CRITICAL: {
      label: "CRITICAL",
      bgColor: "bg-rose-500/10",
      textColor: "text-rose-400",
      borderColor: "border-rose-500/30",
      icon: <AlertOctagon className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[status] || configs.NORMAL;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};
