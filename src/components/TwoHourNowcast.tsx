import React, { useState } from 'react';
import { TwoHourForecastData } from '../types';
import { getWeatherIcon } from '../utils/weatherIcons';
import { Search, Clock, CloudLightning, CloudRain, Sun, MapPin, AlertCircle, RefreshCw } from 'lucide-react';

interface TwoHourNowcastProps {
  data: TwoHourForecastData | null;
  isLoading: boolean;
  onRefresh: () => void;
  onSelectArea?: (area: string) => void;
}

export const TwoHourNowcast: React.FC<TwoHourNowcastProps> = ({
  data,
  isLoading,
  onRefresh,
  onSelectArea
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'rain' | 'fair'>('all');

  if (isLoading && !data) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center space-y-3">
        <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-300">Retrieving Singapore 2-Hour Nowcast...</p>
        <p className="text-xs text-slate-500">Querying /api/two-hr-forecast (Data.gov.sg)</p>
      </div>
    );
  }

  if (!data || !data.forecasts || data.forecasts.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-200">2-Hour Nowcast data temporarily unavailable</p>
        <button
          onClick={onRefresh}
          className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { validPeriod, summary, forecasts, updatedTimestamp } = data;

  const filtered = forecasts.filter((item) => {
    const matchesSearch = item.area.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'rain') {
      return (
        item.forecast.toLowerCase().includes('rain') ||
        item.forecast.toLowerCase().includes('shower') ||
        item.forecast.toLowerCase().includes('thunder')
      );
    }
    if (filterType === 'fair') {
      return (
        item.forecast.toLowerCase().includes('fair') ||
        item.forecast.toLowerCase().includes('cloudy')
      );
    }
    return true;
  });

  return (
    <section className="space-y-5 animate-fade-in">
      {/* Header and Valid Period Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-xl font-bold text-white tracking-tight">Singapore 2-Hour Nowcast</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Official National Environment Agency (NEA) live town-by-town forecasts via Data.gov.sg
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Valid: <strong className="text-cyan-300">{validPeriod.text || 'Next 2 Hours'}</strong></span>
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh 2-Hour Nowcast"
              className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Real-time island overview pill-free metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div className="text-slate-400 mb-0.5">Monitored Towns</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">{forecasts.length}</div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div className="text-slate-400 mb-0.5 flex items-center gap-1">
              <CloudLightning className="w-3.5 h-3.5 text-amber-400" />
              <span>Thundery Showers</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              {summary.thunderyCount} <span className="text-xs font-normal text-slate-400">areas</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div className="text-slate-400 mb-0.5 flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>Showers / Rain</span>
            </div>
            <div className="text-xl font-bold font-mono text-sky-400 tabular-nums">
              {summary.showeryCount} <span className="text-xs font-normal text-slate-400">areas</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div className="text-slate-400 mb-0.5 flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fair / Cloudy</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {Math.max(0, forecasts.length - summary.thunderyCount - summary.showeryCount)}{' '}
              <span className="text-xs font-normal text-slate-400">areas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search town (e.g. Changi, Jurong, Woodlands)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Towns ({forecasts.length})
          </button>
          <button
            onClick={() => setFilterType('rain')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterType === 'rain'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rain & Thunder ({summary.showeryCount + summary.thunderyCount})
          </button>
          <button
            onClick={() => setFilterType('fair')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterType === 'fair'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fair / Cloudy
          </button>
        </div>
      </div>

      {/* Grid of Areas */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center text-slate-400 text-xs">
          No towns match your current search query.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((item) => {
            const isRain =
              item.forecast.toLowerCase().includes('rain') ||
              item.forecast.toLowerCase().includes('shower') ||
              item.forecast.toLowerCase().includes('thunder');

            return (
              <div
                key={item.area}
                onClick={() => onSelectArea && onSelectArea(item.area)}
                className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  isRain
                    ? 'bg-slate-900/90 border-sky-800/60 hover:border-sky-600 hover:bg-slate-900'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="text-[11px] font-mono text-slate-500">NEA</span>
                    {item.location && (
                      <MapPin className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                  <h3 className="font-semibold text-white text-sm truncate" title={item.area}>
                    {item.area}
                  </h3>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                  <span className="text-xs text-slate-300 truncate" title={item.forecast}>
                    {item.forecast}
                  </span>
                  <div className="shrink-0">
                    {getWeatherIcon(item.forecast, "w-5 h-5")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
