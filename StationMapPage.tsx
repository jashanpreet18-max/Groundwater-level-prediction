import React, { useState, useEffect } from "react";
import { StationSummary } from "../types/groundwater";
import { fetchStations } from "../services/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin, Info, ShieldCheck, AlertTriangle, Compass, Eye, Activity } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";

// Fix Leaflet default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom colored SVG pin markers
const createCustomPin = (color: string) =>
  L.divIcon({
    className: "custom-leaflet-marker",
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #090f1d; box-shadow: 0 0 12px ${color}90;"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

const statusColors: Record<string, string> = {
  NORMAL: "#10b981",
  WATCH: "#f59e0b",
  LOW: "#f97316",
  CRITICAL: "#ef4444",
};

export const StationMapPage: React.FC = () => {
  const [stations, setStations] = useState<StationSummary[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mapLayer, setMapLayer] = useState<'streets' | 'osm' | 'satellite'>('streets');

  const mapTileProviders = {
    streets: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, METI',
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid',
    },
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const list = await fetchStations();
        setStations(list);
        if (list.length > 0) {
          setSelectedStation(list[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const stationsWithCoords = stations.filter(
    (st) => st.latitude !== undefined && st.longitude !== undefined && st.latitude !== 0
  );

  // Status breakdown counts
  const normalCount = stations.filter((s) => s.status === "NORMAL").length;
  const watchCount = stations.filter((s) => s.status === "WATCH").length;
  const lowCount = stations.filter((s) => s.status === "LOW").length;
  const criticalCount = stations.filter((s) => s.status === "CRITICAL").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-emerald-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Geospatial Telemetry Network
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] mt-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            DWLR Monitoring Station Geospatial Map
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Geographic distribution of Digital Water Level Recorder (DWLR) observation nodes across India,
            color-coded according to project-defined groundwater depletion risk bands.
          </p>
        </div>

        {/* Legend with Counts */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Normal (&lt;15m): <strong className="text-white">{normalCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Watch (15-25m): <strong className="text-white">{watchCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-slate-300">Low (25-35m): <strong className="text-white">{lowCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Critical (&gt;35m): <strong className="text-white">{criticalCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Map & Selected Station Sidebar */}
      {stationsWithCoords.length === 0 && !loading ? (
        <div className="glass-panel p-12 text-center space-y-3">
          <MapPin className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Map View Unavailable</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Geographic coordinates (latitude and longitude) were not provided in the current dataset.
            Upload a CSV containing Latitude and Longitude columns to activate the interactive map.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Leaflet Map (3 cols on large screen) */}
          <div className="lg:col-span-3 glass-panel p-3 h-[520px] relative overflow-hidden">
            {/* Basemap Switcher */}
            <div className="absolute top-5 right-5 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg p-1 flex gap-1 shadow-lg">
              <button
                type="button"
                onClick={() => setMapLayer('streets')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition ${mapLayer === 'streets' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
              >
                Terrain / Street
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('osm')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition ${mapLayer === 'osm' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
              >
                OpenStreetMap
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('satellite')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition ${mapLayer === 'satellite' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
              >
                Satellite
              </button>
            </div>
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Loading geospatial nodes...
              </div>
            ) : (
              <MapContainer
                center={[23.5937, 78.9629]} // Center of India
                zoom={5}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                {stationsWithCoords.map((st) => (
                  <Marker
                    key={st.station}
                    position={[st.latitude, st.longitude]}
                    icon={createCustomPin(statusColors[st.status] || "#10b981")}
                    eventHandlers={{
                      click: () => setSelectedStation(st),
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1.5 text-slate-900 font-sans">
                        <div className="font-bold text-sm text-slate-950">{st.station}</div>
                        <div className="text-xs text-slate-600">
                          {st.district}, {st.state}
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200 text-xs">
                          <span className="font-semibold text-slate-700">Latest Level:</span>
                          <span className="font-mono font-bold text-slate-950">{st.latest_water_level} mbgl</span>
                        </div>
                        <div className="pt-1">
                          <StatusBadge status={st.status} />
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>

          {/* Selected Station Inspection Card (1 col) */}
          <div className="glass-panel p-5 flex flex-col justify-between space-y-4">
            {selectedStation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Node Telemetry
                  </span>
                  <StatusBadge status={selectedStation.status} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white font-['Outfit']">
                    {selectedStation.station}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedStation.district}, {selectedStation.state}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Latest Depth:</span>
                    <span className="font-bold font-mono text-cyan-400">
                      {selectedStation.latest_water_level} mbgl
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Observation Date:</span>
                    <span className="font-mono text-slate-300">
                      {selectedStation.latest_date}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Total Records:</span>
                    <span className="font-mono text-slate-300">
                      {selectedStation.total_observations} months
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Coordinates:</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {selectedStation.latitude.toFixed(3)}°N, {selectedStation.longitude.toFixed(3)}°E
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  Click any pin on the map to switch station context and inspect local aquifer conditions.
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                Select a station on the map to inspect details.
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
              Basemap: Esri World Maps &amp; OpenStreetMap (Active)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
