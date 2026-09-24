import React from 'react';
import { RefreshCw, Activity, ShieldCheck } from 'lucide-react';

interface WeatherNavbarProps {
  activeTab: 'overview' | 'map' | 'nowcast' | 'psi' | 'forecast' | 'regions';
  setActiveTab: (tab: 'overview' | 'map' | 'nowcast' | 'psi' | 'forecast' | 'regions') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenHealth: () => void;
  countdown: number;
}

export const WeatherNavbar: React.FC<WeatherNavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  onOpenHealth,
  countdown
}) => {
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 shrink-0 hover:text-cyan-400 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
          Singapore Weather
        </a>

        {/* Zone 2: 3-5 clean single-line nav links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('overview')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
                : 'hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'map'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
                : 'hover:text-slate-200'
            }`}
          >
            Island Map
          </button>
          <button
            onClick={() => setActiveTab('nowcast')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'nowcast'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
                : 'hover:text-slate-200'
            }`}
          >
            2-Hr Nowcast
          </button>
          <button
            onClick={() => setActiveTab('psi')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'psi'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
                : 'hover:text-slate-200'
            }`}
          >
            Air Quality (PSI)
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'forecast'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
                : 'hover:text-slate-200'
            }`}
          >
            24h Forecast
          </button>
          <button
            onClick={() => setActiveTab('regions')}
            className={`transition-colors whitespace-nowrap ${
              activeTab === 'regions'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
                : 'hover:text-slate-200'
            }`}
          >
            Stations
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenHealth}
            title="System & API Health Status"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Health Check</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title={`Refresh weather data (Auto in ${formatCountdown(countdown)})`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="tabular-nums font-mono">{formatCountdown(countdown)}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
