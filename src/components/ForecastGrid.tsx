import React, { useState } from 'react';
import { ForecastItem } from '../types';
import { getWeatherIcon } from '../utils/weatherIcons';
import { Droplets, Wind, CloudRain, Clock } from 'lucide-react';

interface ForecastGridProps {
  forecast: ForecastItem[];
}

export const ForecastGrid: React.FC<ForecastGridProps> = ({ forecast }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'day' | 'night'>('all');

  if (!forecast || forecast.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        <p>No upcoming forecast periods currently available.</p>
      </div>
    );
  }

  // Filter periods
  const filteredForecast = forecast.filter((item) => {
    if (selectedPeriod === 'all') return true;
    const hour = parseInt(item.time.split(':')[0], 10);
    if (Number.isNaN(hour)) return true;
    if (selectedPeriod === 'day') return hour >= 6 && hour < 19;
    return hour < 6 || hour >= 19;
  });

  return (
    <section className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">24-Hour Regional Forecast Bulletin</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential meteorological projections across Singapore from NEA Open Data
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedPeriod === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Hours ({forecast.length})
          </button>
          <button
            onClick={() => setSelectedPeriod('day')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedPeriod === 'day'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daylight (06:00 - 19:00)
          </button>
          <button
            onClick={() => setSelectedPeriod('night')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedPeriod === 'night'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Night
          </button>
        </div>
      </div>

      {/* Forecast Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredForecast.map((item, index) => {
          const temp = Number.isFinite(item.temperature) ? item.temperature : 30;
          const condition = item.condition || 'Partly cloudy';
          const rainChance = typeof item.rainChance === 'number' && Number.isFinite(item.rainChance) ? item.rainChance : 0;
          const humidity = Number.isFinite(item.humidity) ? item.humidity : 75;

          return (
            <div
              key={`${item.time}-${index}`}
              className="bg-slate-50/90 hover:bg-white border border-slate-200 hover:border-cyan-300 rounded-xl p-3.5 flex flex-col justify-between transition-all shadow-2xs hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-mono tabular-nums font-bold text-slate-800">
                    {item.time}
                  </span>
                  {rainChance > 0 && (
                    <span className="flex items-center gap-0.5 text-sky-600 font-mono text-[11px] font-semibold">
                      <CloudRain className="w-3 h-3" />
                      {rainChance}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 my-2">
                  <div className="p-1.5 bg-white border border-slate-200/80 rounded-lg shadow-2xs">
                    {getWeatherIcon(condition, "w-6 h-6")}
                  </div>
                  <div className="font-mono tabular-nums text-lg font-bold text-slate-900">
                    {temp}°C
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-700 capitalize line-clamp-1">
                  {condition}
                </p>
                {item.fullTime && (
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {item.fullTime}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-600" />
                  {humidity}%
                </span>
                <span>{item.rainfall || '0 mm'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
