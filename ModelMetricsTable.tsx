import React from "react";
import { ModelMetric } from "../types/groundwater";
import { Trophy, CheckCircle } from "lucide-react";
import { VivaTooltip } from "./VivaTooltip";

interface ModelMetricsTableProps {
  metrics: ModelMetric[];
  bestModel: string;
  explanation?: string;
}

export const ModelMetricsTable: React.FC<ModelMetricsTableProps> = ({ metrics, bestModel, explanation }) => {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3.5 px-4">Model Algorithm</th>
              <th className="py-3.5 px-4">
                <VivaTooltip
                  term="MAE (mbgl)"
                  explanation="Mean Absolute Error. Represents the average magnitude of prediction error in meters below ground level."
                />
              </th>
              <th className="py-3.5 px-4">
                <VivaTooltip
                  term="RMSE (mbgl)"
                  explanation="Root Mean Squared Error. Penalizes larger deviation errors more heavily; primary criteria for best model selection."
                />
              </th>
              <th className="py-3.5 px-4">
                <VivaTooltip
                  term="R² Score"
                  explanation="Coefficient of Determination. Measures the proportion of variance in groundwater depth explained by the model (1.0 = perfect fit)."
                />
              </th>
              <th className="py-3.5 px-4">
                <VivaTooltip
                  term="MAPE (%)"
                  explanation="Mean Absolute Percentage Error. Average relative prediction error percentage."
                />
              </th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {metrics.map((m) => {
              const isBest = m.model.toLowerCase() === bestModel.toLowerCase();
              return (
                <tr
                  key={m.model}
                  className={`transition-colors ${
                    isBest
                      ? "bg-emerald-500/10 border-l-4 border-l-emerald-400 font-medium text-emerald-300"
                      : "hover:bg-slate-800/40 text-slate-300"
                  }`}
                >
                  <td className="py-3.5 px-4 flex items-center gap-2">
                    {isBest && <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />}
                    <span className="font-semibold text-white">{m.model}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{m.mae.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{m.rmse.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono">{m.r2.toFixed(3)}</td>
                  <td className="py-3.5 px-4 font-mono">{m.mape.toFixed(1)}%</td>
                  <td className="py-3.5 px-4 text-right">
                    {isBest ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" /> Best Model
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Evaluated</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {explanation && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
          <Trophy className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-400">Model Selection Rationale: </span>
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
};
