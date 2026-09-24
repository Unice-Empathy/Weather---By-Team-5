import React from 'react';
import { PsiData } from '../types';
import { ShieldCheck, Wind, AlertCircle, RefreshCw, Activity, Info, CheckCircle2 } from 'lucide-react';

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
  if (isLoading && !data) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center space-y-3">
        <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-300">Retrieving Singapore PSI readings...</p>
        <p className="text-xs text-slate-500">Querying /api/psi (Data.gov.sg)</p>
      </div>
    );
  }

  if (!data || !data.regions) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-200">Air Quality data temporarily unavailable</p>
        <button
          onClick={onRefresh}
          className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { overallBand, overallDescription, maxPsi, regions, updatedTimestamp } = data;

  const getBandBadgeClass = (band: string) => {
    switch (band.toLowerCase()) {
      case 'good':
        return 'text-emerald-400 border-emerald-800/60 bg-emerald-950/30';
      case 'moderate':
        return 'text-cyan-400 border-cyan-800/60 bg-cyan-950/30';
      case 'unhealthy':
        return 'text-amber-400 border-amber-800/60 bg-amber-950/30';
      default:
        return 'text-rose-400 border-rose-800/60 bg-rose-950/30';
    }
  };

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Singapore Air Quality & Pollutant Standards Index (PSI)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Official NEA 24-hour PSI and PM2.5 readings across the island via Data.gov.sg
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Updated: {updatedTimestamp.includes('T') ? updatedTimestamp.split('T')[1].slice(0, 5) + ' SGT' : updatedTimestamp}</span>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh PSI data"
              className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-5">
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400 font-medium">Island Max PSI</div>
              <div className="text-4xl font-bold font-mono text-white tabular-nums mt-0.5">
                {maxPsi}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Current Island Band</div>
              <div className="text-xl font-bold text-white mt-0.5">{overallBand}</div>
              <p className="text-xs text-slate-400 mt-1">{overallDescription}</p>
            </div>
          </div>

          {/* Health Advisory Guide */}
          <div className="md:col-span-8 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>NEA Public Health Advisory (24-hour PSI)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
              <div>
                <span className="text-emerald-400 font-semibold font-mono">0 - 50 (Good):</span>
                <p>Normal outdoor activity for all groups.</p>
              </div>
              <div>
                <span className="text-cyan-400 font-semibold font-mono">51 - 100 (Moderate):</span>
                <p>Normal outdoor activity for healthy individuals.</p>
              </div>
              <div>
                <span className="text-amber-400 font-semibold font-mono">101 - 200 (Unhealthy):</span>
                <p>Reduce prolonged or strenuous exertion.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Cards Grid (Central, North, South, East, West) */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3">Regional Meteorological Readings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {Object.entries(regions).map(([key, reg]) => (
            <div
              key={key}
              className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{reg.region}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getBandBadgeClass(reg.band)}`}>
                  {reg.band}
                </span>
              </div>

              <div>
                <div className="text-xs text-slate-400">24-hr PSI</div>
                <div className="text-3xl font-bold font-mono text-white tabular-nums">
                  {reg.psi}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between font-mono tabular-nums">
                  <span>PM2.5:</span>
                  <span className="text-slate-200">{reg.pm25} µg/m³</span>
                </div>
                <div className="flex justify-between font-mono tabular-nums">
                  <span>PM10:</span>
                  <span className="text-slate-200">{reg.pm10} µg/m³</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
