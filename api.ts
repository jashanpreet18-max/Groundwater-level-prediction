import axios from "axios";
import {
  StationSummary,
  Observation,
  ForecastResponse,
  TrendAnalysisResponse,
  DatasetStats,
  LocationsTaxonomy,
} from "../types/groundwater";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000/api"
    : "/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const checkHealth = async () => {
  const res = await api.get("/health");
  return res.data;
};

export const fetchLocations = async (): Promise<LocationsTaxonomy> => {
  const res = await api.get("/locations");
  return res.data;
};

export const fetchStations = async (): Promise<StationSummary[]> => {
  const res = await api.get("/stations");
  return res.data;
};

export const fetchStationData = async (station: string): Promise<{ station: string; total_records: number; observations: Observation[] }> => {
  const res = await api.get("/data", { params: { station } });
  return res.data;
};

export const fetchGlobalStats = async (): Promise<DatasetStats> => {
  const res = await api.get("/statistics");
  return res.data;
};

export const generateForecast = async (station: string, horizon: number = 30, model: string = "best"): Promise<ForecastResponse> => {
  const res = await api.post("/forecast", { station, horizon, model });
  return res.data;
};

export const fetchModelPerformance = async (station: string) => {
  const res = await api.get("/model-performance", { params: { station } });
  return res.data;
};

export const fetchTrendAnalysis = async (station: string): Promise<TrendAnalysisResponse> => {
  const res = await api.get("/trends", { params: { station } });
  return res.data;
};

export const uploadDatasetCSV = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
