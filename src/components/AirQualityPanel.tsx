import React, { useState, useEffect } from 'react';
import { PsiData, UvData } from '../types';
import { ShieldCheck, Wind, AlertCircle, RefreshCw, Activity, Sun, Info, CheckCircle2 } from 'lucide-react';

interface AirQualityPanelProps {
  data: PsiData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const AirQualityPanel: React.FC<AirQualityPanelProps> = ({
  data,
  isLoading,
  onRefresh
}) => {
  const [uvData, setUvData] = useState<{ index: number; history: { hour: string; value: number }[] } | null>(null);
  const [pm25Hourly, setPm25Hourly] = useState<Record<string, number>>({});

  useEffect(() => {
    // Fetch UV Index
    fetch('/api/uv')
      .then((r) => r.json())
      .then((payload) => {
        const records = payload?.data?.records?.[0]?.index;
        if (Array.isArray(records) && records.length > 0) {
          setUvData({
            index: records[0].value,
            history: records.slice(0, 6)
          });
        }
      })
      .catch(console.error);

    // Fetch PM2.5 1-hourly
    fetch('/api/pm25')
      .then((r) => r.json())
      .then((payload) => {
        const readings = payload?.data?.items?.[0]?.readings?.pm25_one_hourly;
        if (readings) {
          setPm25Hourly(readings);
        }
      })
      .catch(console.error);
  }, []);

  if (isLoading && !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
        <RefreshCw className="w-6 h-6 text-cyan-600 animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-700">Retrieving Singapore PSI & Environmental metrics...</p>
        <p className="text-xs text-slate-400">Querying /api/psi & /api/uv (Data.gov.sg)</p>
      </div>
    );
  }

  if (!data || !data.regions) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-800">Air Quality data temporarily refreshing</p>
        <button
          onClick={onRefresh}
          className="mt-3 text-xs text-cyan-600 hover:text-cyan-700 font-semibold"
        >
          Retry Sync
        </button>
      </div>
    );
  }

  const { overallBand, overallDescription, maxPsi, regions, updatedTimestamp } = data;

  const getBandBadgeClass = (band: string) => {
    switch (band.toLowerCase()) {
      case 'good':
        return 'text-emerald-700 border-emerald-300 bg-emerald-50';
      case 'moderate':
        return 'text-cyan-700 border-cyan-300 bg-cyan-50';
      case 'unhealthy':
        return 'text-amber-700 border-amber-300 bg-amber-50';
      default:
        return 'text-rose-700 border-rose-300 bg-rose-50';
    }
  };

  const currentUv = uvData?.index ?? 4;
  const uvCategory =
    currentUv <= 2 ? { level: 'Low', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' } :
    currentUv <= 5 ? { level: 'Moderate', color: 'text-amber-700 bg-amber-50 border-amber-200' } :
    currentUv <= 7 ? { level: 'High', color: 'text-orange-700 bg-orange-50 border-orange-200' } :
    { level: 'Very High', color: 'text-rose-700 bg-rose-50 border-rose-200' };

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Overview Card */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Singapore Air Quality, PSI & UV Index
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Official NEA 24-hour PSI, 1-hour PM2.5, and Solar UV Index via Data.gov.sg
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <span>Updated: {updatedTimestamp.includes('T') ? updatedTimestamp.split('T')[1].slice(0, 5) + ' SGT' : updatedTimestamp}</span>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh PSI and UV data"
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-5">
          {/* Island PSI */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-xs text-slate-500 font-medium">Island Max PSI</div>
              <div className="text-4xl font-extrabold font-mono text-slate-900 tabular-nums mt-0.5">
                {maxPsi}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Current Island Band</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{overallBand}</div>
              <p className="text-xs text-slate-500 mt-0.5">{overallDescription}</p>
            </div>
          </div>

          {/* Real-Time UV Index Widget */}
          <div className="md:col-span-4 flex items-center gap-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4">
            <div className="p-3 bg-white border border-amber-200 rounded-xl text-amber-600 shrink-0 shadow-2xs">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span>Solar UV Index</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${uvCategory.color}`}>
                  {uvCategory.level}
                </span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums mt-0.5">
                {currentUv}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentUv >= 6 ? 'Seek shade & apply SPF 30+' : 'Moderate protection advised outdoors'}
              </p>
            </div>
          </div>

          {/* Health Advisory Guide */}
          <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              <span>NEA Public Health Standards</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600 pt-0.5">
              <div>
                <span className="text-emerald-700 font-semibold font-mono">0 - 50:</span> Good. Normal activity.
              </div>
              <div>
                <span className="text-cyan-700 font-semibold font-mono">51 - 100:</span> Moderate. Normal activity.
              </div>
              <div>
                <span className="text-amber-700 font-semibold font-mono">101 - 200:</span> Unhealthy. Reduce prolonged exertion.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Cards Grid (Central, North, South, East, West) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">Regional Air Quality Telemetry</h3>
          <span className="text-xs text-slate-500">24-hr PSI and 1-hr PM2.5 (µg/m³)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {Object.entries(regions).map(([key, reg]) => {
            const oneHrPm25 = pm25Hourly[key.toLowerCase()];

            return (
              <div
                key={key}
                className="bg-white/95 hover:bg-slate-50/80 border border-slate-200 hover:border-cyan-300 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{reg.region} Region</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getBandBadgeClass(reg.band)}`}>
                    {reg.band}
                  </span>
                </div>

                <div className="space-y-2 py-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">24-hr PSI:</span>
                    <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                      {reg.psi}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500">1-hr PM2.5:</span>
                    <span className="font-semibold font-mono text-emerald-700">
                      {oneHrPm25 != null ? `${oneHrPm25} µg/m³` : `${reg.pm25} µg/m³`}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">24-hr PM10:</span>
                    <span className="font-mono text-slate-700">
                      {reg.pm10} µg/m³
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-snug border-t border-slate-100 pt-2">
                  {reg.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
