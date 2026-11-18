import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar, NavTab } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { DashboardPage } from "./pages/DashboardPage";
import { DataExplorerPage } from "./pages/DataExplorerPage";
import { ForecastPage } from "./pages/ForecastPage";
import { ModelPerformancePage } from "./pages/ModelPerformancePage";
import { TrendAnalysisPage } from "./pages/TrendAnalysisPage";
import { StationMapPage } from "./pages/StationMapPage";
import { DataUploadPage } from "./pages/DataUploadPage";
import { AboutPage } from "./pages/AboutPage";
import { checkHealth } from "./services/api";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [apiStatus, setApiStatus] = useState<"healthy" | "error" | "loading">("loading");

  const verifyApi = async () => {
    try {
      setApiStatus("loading");
      const health = await checkHealth();
      if (health.status === "healthy") {
        setApiStatus("healthy");
      } else {
        setApiStatus("error");
      }
    } catch (err) {
      console.error("API Health Check Failed:", err);
      setApiStatus("error");
    }
  };

  useEffect(() => {
    verifyApi();
  }, []);

  return (
    <div className="min-h-screen bg-[#090f1d] flex flex-col font-sans text-slate-100">
      <Header apiStatus={apiStatus} onRefresh={verifyApi} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-5rem)] flex flex-col justify-between">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {activeTab === "dashboard" && <DashboardPage onNavigateTab={setActiveTab} />}
            {activeTab === "data-explorer" && <DataExplorerPage />}
            {activeTab === "forecast" && <ForecastPage />}
            {activeTab === "model-performance" && <ModelPerformancePage />}
            {activeTab === "trend-analysis" && <TrendAnalysisPage />}
            {activeTab === "station-map" && <StationMapPage />}
            {activeTab === "data-upload" && <DataUploadPage />}
            {activeTab === "about" && <AboutPage />}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default App;
