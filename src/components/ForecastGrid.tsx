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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
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
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">24-Hour Forecast</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly meteorological outlook across the Singapore metropolitan region
          </p>
        </div>

        {/* Interactive segmented controls for filtering */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedPeriod === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Hours ({forecast.length})
          </button>
          <button
            onClick={() => setSelectedPeriod('day')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedPeriod === 'day'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daylight (06:00 - 19:00)
          </button>
          <button
            onClick={() => setSelectedPeriod('night')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedPeriod === 'night'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Night
          </button>
        </div>
      </div>

      {/* Horizontal Scroll / Multi-card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredForecast.map((item, index) => {
          const temp = Number.isFinite(item.temperature) ? item.temperature : 30;
          const condition = item.condition || 'Partly cloudy';
          const rainChance = typeof item.rainChance === 'number' && Number.isFinite(item.rainChance) ? item.rainChance : 0;
          const humidity = Number.isFinite(item.humidity) ? item.humidity : 75;

          return (
            <div
              key={`${item.time}-${index}`}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-mono tabular-nums font-semibold text-slate-200">
                    {item.time}
                  </span>
                  {rainChance > 0 && (
                    <span className="flex items-center gap-0.5 text-sky-400 font-mono text-[11px]">
                      <CloudRain className="w-3 h-3" />
                      {rainChance}%
                    </span>
                  )}
                </div>

                <div className="my-2 flex items-center justify-center py-1">
                  {getWeatherIcon(condition, "w-8 h-8")}
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold font-mono tabular-nums text-white">
                    {temp}°C
                  </div>
                  <div className="text-xs text-slate-300 font-medium truncate mt-0.5" title={condition}>
                    {condition}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1 font-mono tabular-nums">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>{humidity}%</span>
                </div>
                <div className="flex items-center justify-end gap-1 font-mono tabular-nums">
                  <Wind className="w-3 h-3 text-teal-400" />
                  <span>{item.windSpeed || 10} <span className="text-[9px]">km/h</span></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
