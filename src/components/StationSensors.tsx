import React, { useState, useEffect, useMemo } from 'react';
import { Thermometer, CloudRain, Droplets, Wind, Search, RefreshCw, Radio, CheckCircle2 } from 'lucide-react';

interface StationRecord {
  id: string;
  name: string;
  temperature?: number;
  rainfall?: number;
  humidity?: number;
  windSpeed?: number;
}

export const StationSensors: React.FC = () => {
  const [stations, setStations] = useState<StationRecord[]>([]);
  const [activeMetric, setActiveMetric] = useState<'all' | 'temp' | 'rain' | 'humidity' | 'wind'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');

  const fetchSensorStations = async () => {
    setIsLoading(true);
    try {
      const [tRes, rRes, hRes, wRes] = await Promise.all([
        fetch('/api/air-temperature').then(r => r.json()).catch(() => null),
        fetch('/api/rainfall').then(r => r.json()).catch(() => null),
        fetch('/api/relative-humidity').then(r => r.json()).catch(() => null),
        fetch('/api/wind-speed').then(r => r.json()).catch(() => null)
      ]);

      const stationMap = new Map<string, StationRecord>();

      // Populate base stations from temperature
      if (tRes?.data?.stations) {
        for (const s of tRes.data.stations) {
          stationMap.set(s.id, { id: s.id, name: s.name });
        }
      }

      // Add temperature values
      const tReadings = tRes?.data?.readings?.[0]?.data || [];
      for (const r of tReadings) {
        const item = stationMap.get(r.stationId);
        if (item) item.temperature = Number(r.value);
      }

      // Add rainfall values
      const rReadings = rRes?.data?.readings?.[0]?.data || [];
      for (const r of rReadings) {
        const item = stationMap.get(r.stationId);
        if (item) item.rainfall = Number(r.value);
      }

      // Add humidity values
      const hReadings = hRes?.data?.readings?.[0]?.data || [];
      for (const r of hReadings) {
        const item = stationMap.get(r.stationId);
        if (item) item.humidity = Number(r.value);
      }

      // Add wind values
      const wReadings = wRes?.data?.readings?.[0]?.data || [];
      for (const r of wReadings) {
        const item = stationMap.get(r.stationId);
        if (item) item.windSpeed = Math.round(Number(r.value) * 1.852); // knots to km/h
      }

      setStations(Array.from(stationMap.values()));
      setLastSync(new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorStations();
  }, []);

  const filtered = useMemo(() => {
    return stations.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [stations, search]);

  return (
    <section className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-600 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Meteorological Station Sensors</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Direct real-time telemetry from NEA ground telemetry stations across Singapore
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter station..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>

          <button
            onClick={fetchSensorStations}
            disabled={isLoading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Sensor Metric Selector */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
        <button
          onClick={() => setActiveMetric('all')}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            activeMetric === 'all'
              ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          All Sensors ({filtered.length})
        </button>
        <button
          onClick={() => setActiveMetric('temp')}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
            activeMetric === 'temp'
              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5" />
          Air Temperature (°C)
        </button>
        <button
          onClick={() => setActiveMetric('rain')}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
            activeMetric === 'rain'
              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          Precipitation (mm)
        </button>
        <button
          onClick={() => setActiveMetric('humidity')}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
            activeMetric === 'humidity'
              ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          Relative Humidity (%)
        </button>
        <button
          onClick={() => setActiveMetric('wind')}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
            activeMetric === 'wind'
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          Wind Speed (km/h)
        </button>
      </div>

      {/* Grid of Stations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((station) => (
          <div
            key={station.id}
            className="p-3.5 bg-slate-50/90 hover:bg-white border border-slate-200 hover:border-cyan-300 rounded-xl transition-all shadow-2xs hover:shadow-sm space-y-2.5"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-semibold text-slate-900 text-xs truncate" title={station.name}>
                {station.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                {station.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {(activeMetric === 'all' || activeMetric === 'temp') && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 p-1.5 rounded-lg">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-mono font-semibold text-slate-800">
                    {station.temperature != null ? `${station.temperature.toFixed(1)}°C` : '—'}
                  </span>
                </div>
              )}

              {(activeMetric === 'all' || activeMetric === 'rain') && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 p-1.5 rounded-lg">
                  <CloudRain className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="font-mono font-semibold text-slate-800">
                    {station.rainfall != null ? `${station.rainfall.toFixed(1)} mm` : '0.0 mm'}
                  </span>
                </div>
              )}

              {(activeMetric === 'all' || activeMetric === 'humidity') && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 p-1.5 rounded-lg">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span className="font-mono font-semibold text-slate-800">
                    {station.humidity != null ? `${station.humidity}%` : '—'}
                  </span>
                </div>
              )}

              {(activeMetric === 'all' || activeMetric === 'wind') && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 p-1.5 rounded-lg">
                  <Wind className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span className="font-mono font-semibold text-slate-800">
                    {station.windSpeed != null ? `${station.windSpeed} km/h` : '—'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
