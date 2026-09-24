import React from 'react';
import { FourDayForecastItem } from '../types';
import { getWeatherIcon } from '../utils/weatherIcons';
import { Calendar, Wind, Droplets, Thermometer, ShieldCheck } from 'lucide-react';

interface FourDayOutlookProps {
  forecasts?: FourDayForecastItem[];
  isLoading?: boolean;
}

export const FourDayOutlook: React.FC<FourDayOutlookProps> = ({
  forecasts = [],
  isLoading = false
}) => {
  return (
    <section className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">4-Day Extended Weather Outlook</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official Singapore National Environment Agency (NEA) meteorological projections
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 font-medium rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            NEA Synoptic Model
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl border border-slate-200" />
          ))}
        </div>
      )}

      {/* 4-Day Forecast Cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {forecasts.map((item, idx) => {
            const tempSpread = item.tempHigh - item.tempLow;
            const isRain = item.condition.toLowerCase().includes('rain') || item.condition.toLowerCase().includes('thunder');

            return (
              <div
                key={idx}
                className="bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-cyan-300 rounded-xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-md group"
              >
                {/* Header: Day and Date */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-base">
                      {item.day || `Day ${idx + 1}`}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      +{idx + 1}d
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' }) : ''}
                  </p>
                </div>

                {/* Weather Icon & Condition Title */}
                <div className="flex items-center gap-3.5 py-1">
                  <div className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
                    {getWeatherIcon(item.condition, "w-8 h-8")}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 text-sm leading-tight truncate">
                      {item.condition}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                      {item.summary || 'Tropical conditions'}
                    </div>
                  </div>
                </div>

                {/* Temperature Range Bar */}
                <div className="space-y-1.5 bg-white border border-slate-200/80 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                      Range
                    </span>
                    <div className="font-mono tabular-nums font-semibold text-slate-900">
                      <span className="text-cyan-700">{item.tempLow}°C</span>
                      <span className="text-slate-400 mx-1.5">—</span>
                      <span className="text-amber-600">{item.tempHigh}°C</span>
                    </div>
                  </div>
                  {/* Visual Temp Bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400 h-full rounded-full w-full" />
                  </div>
                </div>

                {/* Humidity & Wind Sub-metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/70">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Droplets className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span className="font-mono tabular-nums">{item.humidityLow} - {item.humidityHigh}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 justify-end">
                    <Wind className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-mono tabular-nums">{item.windSpeedLow}-{item.windSpeedHigh} km/h</span>
                  </div>
                </div>

                {/* Outdoor Planning Pill */}
                <div className="pt-1">
                  <span
                    className={`block text-center text-[11px] font-medium py-1 px-2 rounded-md ${
                      isRain
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isRain ? 'Carry an umbrella' : 'Good for outdoor activities'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
