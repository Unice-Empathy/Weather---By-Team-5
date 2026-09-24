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
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
        <RefreshCw className="w-6 h-6 text-cyan-600 animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-700">Retrieving Singapore 2-Hour Nowcast...</p>
        <p className="text-xs text-slate-400">Querying /api/two-hr-forecast (Data.gov.sg)</p>
      </div>
    );
  }

  if (!data || !data.forecasts || data.forecasts.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-800">2-Hour Nowcast data temporarily refreshing</p>
        <button
          onClick={onRefresh}
          className="mt-3 text-xs text-cyan-600 hover:text-cyan-700 font-semibold"
        >
          Retry Sync
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
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Singapore 2-Hour Nowcast</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Official National Environment Agency (NEA) live town-by-town forecasts via Data.gov.sg
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums text-slate-600">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              <span>Valid: <strong className="text-cyan-700">{validPeriod.text || 'Next 2 Hours'}</strong></span>
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh nowcast"
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Rain Cluster Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <CloudLightning className="w-4 h-4 text-amber-500" />
              <span>Thundery Showers</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {summary.thunderyCount} <span className="text-xs font-normal text-slate-500">planning areas</span>
            </div>
            {summary.thunderyCount > 0 && (
              <p className="text-[11px] text-amber-700 mt-1 truncate">
                {summary.thunderyAreas.slice(0, 3).join(', ')}
                {summary.thunderyAreas.length > 3 ? ` +${summary.thunderyAreas.length - 3} more` : ''}
              </p>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <CloudRain className="w-4 h-4 text-sky-500" />
              <span>Showers & Rain</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {summary.showeryCount} <span className="text-xs font-normal text-slate-500">planning areas</span>
            </div>
            {summary.showeryCount > 0 && (
              <p className="text-[11px] text-sky-700 mt-1 truncate">
                {summary.showeryAreas.slice(0, 3).join(', ')}
              </p>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Sun className="w-4 h-4 text-emerald-500" />
              <span>Fair / Partly Cloudy</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {Math.max(0, forecasts.length - summary.thunderyCount - summary.showeryCount)}{' '}
              <span className="text-xs font-normal text-slate-500">planning areas</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">Suitable for outdoor travel</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-200/80 mt-5">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search town (e.g. Sentosa, Bedok)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-1 rounded-xl text-xs w-full sm:w-auto justify-center">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({forecasts.length})
            </button>
            <button
              onClick={() => setFilterType('rain')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 ${
                filterType === 'rain'
                  ? 'bg-white text-sky-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CloudRain className="w-3 h-3" />
              Rain & Storms ({summary.thunderyCount + summary.showeryCount})
            </button>
            <button
              onClick={() => setFilterType('fair')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 ${
                filterType === 'fair'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3 h-3" />
              Fair ({Math.max(0, forecasts.length - summary.thunderyCount - summary.showeryCount)})
            </button>
          </div>
        </div>
      </div>

      {/* Town Forecast Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {filtered.map((item) => {
          const isRain =
            item.forecast.toLowerCase().includes('rain') ||
            item.forecast.toLowerCase().includes('shower') ||
            item.forecast.toLowerCase().includes('thunder');

          return (
            <div
              key={item.area}
              onClick={() => onSelectArea?.(item.area)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 group shadow-2xs hover:shadow-sm ${
                isRain
                  ? 'bg-sky-50/50 hover:bg-sky-50 border-sky-200/80 hover:border-sky-300'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-cyan-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-xs truncate group-hover:text-cyan-700 transition-colors">
                  {item.area}
                </span>
                <MapPin className="w-3 h-3 text-slate-400 group-hover:text-cyan-600 shrink-0" />
              </div>

              <div className="flex items-center gap-2 py-1">
                <div className="p-1.5 bg-white border border-slate-200/80 rounded-lg shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  {getWeatherIcon(item.forecast, "w-6 h-6")}
                </div>
                <span className="text-[11px] text-slate-600 leading-tight font-medium">
                  {item.forecast}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-1">
                <span>View Live</span>
                <span className="text-cyan-600 group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
