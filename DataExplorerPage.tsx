import React, { useState, useEffect, useMemo } from "react";
import { StationSummary, Observation } from "../types/groundwater";
import { fetchStations, fetchStationData, fetchGlobalStats } from "../services/api";
import {
  Database,
  Search,
  Download,
  Calendar,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";

export const DataExplorerPage: React.FC = () => {
  const [stations, setStations] = useState<StationSummary[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("All");
  const [observations, setObservations] = useState<Observation[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<"date" | "water_level">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 15;
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const list = await fetchStations();
        setStations(list);
        if (list.length > 0) {
          const defaultSt = list[0].station;
          setSelectedStation(defaultSt);
          const data = await fetchStationData(defaultSt);
          setObservations(data.observations);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleStationChange = async (name: string) => {
    setSelectedStation(name);
    setCurrentPage(1);
    try {
      setLoading(true);
      const data = await fetchStationData(name);
      setObservations(data.observations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    let result = observations.filter(
      (obs) =>
        obs.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obs.water_level.toString().includes(searchTerm)
    );

    result.sort((a, b) => {
      if (sortField === "date") {
        return sortOrder === "asc"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      } else {
        return sortOrder === "asc"
          ? a.water_level - b.water_level
          : b.water_level - a.water_level;
      }
    });

    return result;
  }, [observations, searchTerm, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSorted.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSorted.slice(start, start + rowsPerPage);
  }, [filteredAndSorted, currentPage, rowsPerPage]);

  const selectedStationMeta = stations.find((s) => s.station === selectedStation);

  // CSV Export feature
  const handleExportCSV = () => {
    if (filteredAndSorted.length === 0) return;
    const headers = ["Station", "Date", "Water_Level_mbgl", "Unit"];
    const rows = filteredAndSorted.map((r) => [
      `"${selectedStation}"`,
      `"${r.date}"`,
      r.water_level,
      `"${r.unit || "mbgl"}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `groundwater_${selectedStation.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-cyan-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Observation Registry
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] mt-1 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Groundwater Data Explorer & Telemetry Browser
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Browse, filter, and export verified time-series observation records collected at Digital Water Level Recorder (DWLR) stations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">Station:</label>
          <select
            value={selectedStation}
            onChange={(e) => handleStationChange(e.target.value)}
            className="bg-slate-900 text-slate-100 font-semibold border border-slate-700 rounded-lg text-sm px-3.5 py-2 focus:outline-none focus:border-cyan-500"
          >
            {stations.map((s) => (
              <option key={s.station} value={s.station}>
                {s.station} ({s.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dataset Statistics Summary Cards */}
      {selectedStationMeta && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 bg-slate-900/80">
            <p className="text-xs text-slate-400 font-semibold uppercase">Jurisdiction</p>
            <p className="text-lg font-bold text-white mt-1">
              {selectedStationMeta.district}, {selectedStationMeta.state}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Administrative Region</p>
          </div>

          <div className="glass-panel p-4 bg-slate-900/80">
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Observations</p>
            <p className="text-lg font-bold text-cyan-400 font-mono mt-1">
              {observations.length} records
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Continuous monthly telemetry</p>
          </div>

          <div className="glass-panel p-4 bg-slate-900/80">
            <p className="text-xs text-slate-400 font-semibold uppercase">Geographic Coordinates</p>
            <p className="text-lg font-bold text-emerald-400 font-mono mt-1">
              {selectedStationMeta.latitude.toFixed(4)}°N, {selectedStationMeta.longitude.toFixed(4)}°E
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">WGS84 Reference Standard</p>
          </div>

          <div className="glass-panel p-4 bg-slate-900/80">
            <p className="text-xs text-slate-400 font-semibold uppercase">Latest Observed Level</p>
            <p className="text-lg font-bold text-amber-400 font-mono mt-1">
              {selectedStationMeta.latest_water_level} mbgl
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Date: {selectedStationMeta.latest_date}</p>
          </div>
        </div>
      )}

      {/* Table Container with Search, Sorting, Pagination, and CSV Export */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search date (e.g. 2024) or level..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
              }}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Sort: {sortField === "date" ? "Date" : "Level"} ({sortOrder.toUpperCase()})
              </span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
              <tr>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField("date");
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Observation Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField("water_level");
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Groundwater Level (mbgl)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-4">Measurement Unit</th>
                <th className="py-3 px-4 text-right">Hydrological Depth Band</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-sans">
                    Loading station observations...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-sans">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((obs, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                    <td className="py-3 px-4 font-semibold text-white">{obs.date}</td>
                    <td className="py-3 px-4 text-cyan-300 font-bold">{obs.water_level}</td>
                    <td className="py-3 px-4 text-slate-400">{obs.unit || "mbgl"}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      {obs.water_level < 15 ? (
                        <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          Shallow (&lt;15m)
                        </span>
                      ) : obs.water_level < 25 ? (
                        <span className="text-yellow-400 font-semibold px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20">
                          Moderate (15&ndash;25m)
                        </span>
                      ) : obs.water_level < 35 ? (
                        <span className="text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          Low (25&ndash;35m)
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                          Critical (&gt;35m)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2">
          <div>
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredAndSorted.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-white">
              {Math.min(currentPage * rowsPerPage, filteredAndSorted.length)}
            </span>{" "}
            of <span className="font-semibold text-white">{filteredAndSorted.length}</span> rows
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono text-slate-300">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
