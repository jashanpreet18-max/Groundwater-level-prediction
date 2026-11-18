import React, { useState } from "react";
import { uploadDatasetCSV } from "../services/api";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Info,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export const DataUploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [previewLines, setPreviewLines] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
    details?: any;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setStatusMessage(null);

      // Read small text preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || "";
        const lines = text.split("\n").slice(0, 6).filter((l) => l.trim().length > 0);
        setPreviewLines(lines);
      };
      reader.readAsText(file.slice(0, 4096));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      setStatusMessage(null);
      const res = await uploadDatasetCSV(selectedFile);
      setStatusMessage({
        type: "success",
        text: res.message || "CSV dataset uploaded and models retrained successfully!",
        details: res.details,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to upload and validate CSV dataset.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 border-l-4 border-l-cyan-500">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Dataset Ingestion Pipeline
          </span>
        </div>
        <h2 className="text-xl font-bold text-white font-['Outfit'] mt-1 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-cyan-400" />
          Custom CGWB / DWLR Dataset Importer
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Upload custom groundwater telemetry CSV observation files. The system automatically validates headers,
          imputes continuous missing readings, recalculates seasonal lags, and retrains forecasting models.
        </p>
      </div>

      {/* 5-Step Ingestion Workflow Breadcrumbs */}
      <div className="glass-panel p-4 bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 overflow-x-auto pb-1 gap-2">
          <div className="flex items-center gap-2 text-cyan-400 shrink-0">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">1</span>
            <span>Upload CSV</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <div className="flex items-center gap-2 text-slate-300 shrink-0">
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            <span>Schema Validation</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <div className="flex items-center gap-2 text-slate-300 shrink-0">
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            <span>Data Cleaning</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <div className="flex items-center gap-2 text-slate-300 shrink-0">
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">4</span>
            <span>Lag Generation</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <div className="flex items-center gap-2 text-emerald-400 shrink-0">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">5</span>
            <span>Model Retraining</span>
          </div>
        </div>
      </div>

      {/* Schema Standard Box */}
      <div className="glass-panel p-5 bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-cyan-400" />
          Supported Column Aliases Standard (Auto-Detected)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The pipeline recognizes standard CGWB / DWLR exports as well as flexible lower-case variations:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-mono text-cyan-400 font-bold block">Date</span>
            <span className="text-slate-400 text-[11px]">e.g. `Date`, `date`, `observation_date`</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-mono text-emerald-400 font-bold block">Water_Level</span>
            <span className="text-slate-400 text-[11px]">e.g. `Water_Level`, `water_level`, `mbgl`</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-mono text-amber-400 font-bold block">Station</span>
            <span className="text-slate-400 text-[11px]">e.g. `Station`, `station`, `location`</span>
          </div>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div className="glass-panel p-8 text-center space-y-4 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 transition-all">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-cyan-400">
          <FileText className="w-8 h-8" />
        </div>

        <div>
          <label className="cursor-pointer inline-block">
            <span className="px-5 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition-all inline-flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              <span>Choose Groundwater CSV File</span>
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {selectedFile && (
            <p className="text-xs text-slate-300 font-mono mt-3">
              Selected File: <span className="text-emerald-400 font-semibold">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Raw Preview Box */}
        {previewLines.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left font-mono text-[11px] text-slate-400 max-h-36 overflow-y-auto">
            <span className="text-[10px] text-slate-500 font-sans uppercase font-bold block mb-1">
              CSV Header &amp; Top Rows Preview:
            </span>
            {previewLines.map((line, i) => (
              <div key={i} className="truncate">
                {line}
              </div>
            ))}
          </div>
        )}

        {selectedFile && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all disabled:opacity-50 inline-flex items-center gap-2"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Validating, Preprocessing &amp; Retraining...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Upload &amp; Retrain Pipeline</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{statusMessage.text}</p>
            {statusMessage.details && (
              <p className="mt-1 text-slate-400 font-mono text-[11px]">
                Processed Observations: {statusMessage.details.total_records} | Recording Stations: {statusMessage.details.stations_count}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
