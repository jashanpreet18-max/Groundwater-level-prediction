import React from "react";
import {
  Info,
  BookOpen,
  Layers,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Database,
  Cpu,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 border-l-4 border-l-cyan-500">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Academic Project Documentation
          </span>
        </div>
        <h2 className="text-xl font-bold text-white font-['Outfit'] mt-1 flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" />
          About Groundwater Level Prediction System
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Comprehensive project background, mathematical formulations, chronological validation principles,
          and viva defence guidelines for final-year university evaluation.
        </p>
      </div>

      {/* Problem & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-panel p-5 space-y-3">
          <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            1. Problem Statement
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Overexploitation of deep aquifers across major agricultural belts (Punjab, Rajasthan, Haryana)
            has led to continuous groundwater table depletion. Accurate time-series forecasting of groundwater
            levels enables irrigation authorities, district planners, and hydrologists to implement proactive
            artificial recharge structures and enforce regulated pumping schedules before drought crises emerge.
          </p>
        </div>

        <div className="glass-panel p-5 space-y-3">
          <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            2. Primary Objectives
          </h3>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Ingest and standardize DWLR / CGWB telemetry observations recorded in meters below ground level (mbgl).</li>
            <li>Engineer temporal autoregressive lag features (`lag_1` to `lag_30`) and cyclical month sinus encodings.</li>
            <li>Train and benchmark four forecasting algorithms: Naive Baseline, ARIMA, Random Forest, and Gradient Boosting.</li>
            <li>Evaluate out-of-sample performance chronologically (80% train / 20% holdout test) to prevent data leakage.</li>
            <li>Project future groundwater trajectories with quantified 95% confidence bounds.</li>
          </ul>
        </div>
      </div>

      {/* Methodology Pipeline */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          3. End-to-End System Methodology
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs inline-flex items-center justify-center mb-2">1</span>
            <h4 className="text-xs font-bold text-white uppercase">Data Preprocessing</h4>
            <p className="text-[11px] text-slate-400 mt-1">Schema mapping, outlier filtering, linear continuous interpolation</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs inline-flex items-center justify-center mb-2">2</span>
            <h4 className="text-xs font-bold text-white uppercase">Feature Engineering</h4>
            <p className="text-[11px] text-slate-400 mt-1">Lags 1-30, rolling windows (3, 6), calendar sinus cyclical transforms</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs inline-flex items-center justify-center mb-2">3</span>
            <h4 className="text-xs font-bold text-white uppercase">Time-Series Modeling</h4>
            <p className="text-[11px] text-slate-400 mt-1">Naive Baseline, ARIMA(1,1,1), Random Forest, Gradient Boosting</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs inline-flex items-center justify-center mb-2">4</span>
            <h4 className="text-xs font-bold text-white uppercase">Evaluation &amp; Horizon</h4>
            <p className="text-[11px] text-slate-400 mt-1">Chronological holdout RMSE/MAE comparison + 95% confidence intervals</p>
          </div>
        </div>
      </div>

      {/* VIVA DEFENCE Q&A SECTION */}
      <div className="glass-panel p-6 space-y-4 bg-slate-900/70 border border-emerald-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
              Viva Presentation Defense &amp; Examiner Q&amp;A
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            High-Yield Academic Questions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-300 block">Q1: What does the unit "mbgl" signify?</span>
            <p className="text-slate-300 leading-relaxed">
              mbgl stands for <em>meters below ground level</em>. It measures the depth down to the water table.
              Crucially, <strong>lower values (e.g. 5–10m) indicate a shallow, healthy water table</strong>,
              while <strong>higher values (e.g. 35–45m) represent deeper aquifer depletion</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-bold text-cyan-300 block">Q2: How is future information leakage prevented?</span>
            <p className="text-slate-300 leading-relaxed">
              We strictly forbid random k-fold shuffling. The observation timeline is partitioned chronologically:
              the initial 80% is used for fitting, and the terminal 20% acts as an untouched out-of-sample holdout test window.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-bold text-amber-300 block">Q3: Why include a Naive Baseline model?</span>
            <p className="text-slate-300 leading-relaxed">
              A baseline model (persisting previous or seasonal values) establishes the minimum performance floor.
              Any machine learning algorithm must prove superior predictive error (lower RMSE/MAE) over the baseline to justify deployment.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-bold text-purple-300 block">Q4: How are multi-step future horizons generated?</span>
            <p className="text-slate-300 leading-relaxed">
              For horizons up to 90 steps, we use recursive autoregressive forecasting: each step's point prediction
              is appended to the active series to dynamically compute the subsequent step's lag features (`lag_1`, `lag_2`, etc.).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-bold text-teal-300 block">Q5: How are confidence intervals calculated?</span>
            <p className="text-slate-300 leading-relaxed">
              Confidence intervals are estimated analytically using the standard deviation of in-sample residuals (&sigma;)
              scaled by &plusmn;1.96 (&alpha;=0.05 for 95% coverage) with a square-root horizon expansion term: &plusmn;1.96 &middot; &sigma; &radic;(1 + 0.06 &middot; h).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-300 block">Q6: What dataset provenance and standards are used?</span>
            <p className="text-slate-300 leading-relaxed">
              The system operates with standardized CGWB (Central Ground Water Board) and DWLR observation schemas.
              The application provides a flexible ingestion interface to upload and analyze any live official government groundwater telemetry records directly.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack & Scientific Disclaimer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-panel p-5 space-y-3">
          <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Verified Technology Stack
          </h3>
          <div className="text-xs text-slate-300 space-y-1.5 font-mono">
            <p><span className="text-cyan-400 font-semibold">Frontend:</span> React 18, TypeScript, Vite, Tailwind CSS, Recharts, Leaflet</p>
            <p><span className="text-emerald-400 font-semibold">Backend:</span> Python 3.13, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn, Statsmodels</p>
            <p><span className="text-amber-400 font-semibold">Validation:</span> Pytest test suite, Chronological 80/20 train/test holdout</p>
          </div>
        </div>

        <div className="glass-panel p-5 space-y-3 border-l-4 border-l-amber-500">
          <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Scientific Disclaimer
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "Groundwater-level forecasts are statistical approximations based on historical telemetry observations and mathematical model assumptions. Predictions should support, not replace, field-level hydrological assessment, tube-well pumping tests, and official government water-resource management decisions."
          </p>
        </div>
      </div>
    </div>
  );
};
