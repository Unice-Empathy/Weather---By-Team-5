import React from 'react';
import { RefreshCw, Activity, Database, CloudSun } from 'lucide-react';

export type NavTab = 'overview' | 'map' | 'nowcast' | 'psi' | 'fourday' | 'forecast' | 'sensors';

interface WeatherNavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenHealth: () => void;
  onOpenApiDirectory: () => void;
  countdown: number;
}

export const WeatherNavbar: React.FC<WeatherNavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  onOpenHealth,
  onOpenApiDirectory,
  countdown
}) => {
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'map', label: 'Island Map' },
    { id: 'nowcast', label: '2-Hr Nowcast' },
    { id: 'fourday', label: '4-Day Outlook' },
    { id: 'psi', label: 'Air Quality & UV' },
    { id: 'forecast', label: '24h Bulletin' },
    { id: 'sensors', label: 'Station Sensors' }
  ];

  return (
    <header className="border-b border-slate-200/90 bg-white/85 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Wordmark */}
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 shrink-0 hover:text-cyan-700 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-xs">
            <CloudSun className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <span className="block">Singapore Weather</span>
            <span className="text-[10px] font-normal text-slate-500 block -mt-0.5">NEA Live Open Data</span>
          </div>
        </a>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-4 text-sm font-medium">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`transition-colors whitespace-nowrap py-1 ${
                activeTab === item.id
                  ? 'text-cyan-700 font-bold border-b-2 border-cyan-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenApiDirectory}
            title="Inspect all 10 Singapore Open Data APIs"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden sm:inline">10 NEA APIs</span>
          </button>

          <button
            onClick={onOpenHealth}
            title="System & Health Status"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Uptime</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title={`Refresh weather data (Auto in ${formatCountdown(countdown)})`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 rounded-lg transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Sync ({formatCountdown(countdown)})</span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Tab Bar */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-white/95 text-xs no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs transition-colors ${
              activeTab === item.id
                ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
