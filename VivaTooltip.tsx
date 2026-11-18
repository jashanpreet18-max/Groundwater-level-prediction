import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface VivaTooltipProps {
  term: string;
  explanation: string;
}

export const VivaTooltip: React.FC<VivaTooltipProps> = ({ term, explanation }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center gap-1 cursor-help group"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="font-semibold text-slate-200">{term}</span>
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />

      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 rounded-lg bg-slate-950 border border-emerald-500/40 text-slate-200 text-xs shadow-xl z-50 pointer-events-none leading-normal font-sans">
          <span className="font-bold text-emerald-400 block mb-0.5">{term}</span>
          {explanation}
        </span>
      )}
    </span>
  );
};
