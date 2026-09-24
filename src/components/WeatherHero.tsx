import React from 'react';
import { WeatherData } from '../types';
import { getWeatherIcon } from '../utils/weatherIcons';
import { Droplets, Wind, Thermometer, CloudRain, Clock, MapPin } from 'lucide-react';
import heroImage from '../assets/images/singapore_skyline_weather_1790237012053.jpg';

interface WeatherHeroProps {
  data: WeatherData;
  isFallback?: boolean;
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({ data, isFallback }) => {
  // Defensive values to guarantee never NaN, null, or undefined
  const temp = Number.isFinite(data.temperature) ? data.temperature : 30;
  const feelsLike = Number.isFinite(data.feelsLike) ? data.feelsLike : temp;
  const humidity = Number.isFinite(data.humidity) ? data.humidity : 75;
  const wind = Number.isFinite(data.windSpeed) ? data.windSpeed : 12;
  const condition = data.condition || 'Clear';
  const rainfall = data.rainfall || '0 mm';
  const location = data.location || 'Singapore';
  const updated = data.lastUpdated || 'Recently';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
      {/* Background Image with Measured Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Singapore skyline atmospheric backdrop"
          className="w-full h-full object-cover opacity-25"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Graceful fallback to CSS gradient
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        {/* Location & Metadata Bar - Zero-pill discipline */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-400 mb-6 border-b border-slate-800/60 pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold text-white text-base sm:text-lg">{location}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Republic of Singapore</span>
          </div>

          <div className="flex items-center gap-2 font-mono tabular-nums text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Last Updated: {updated}</span>
            {isFallback && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-amber-400/90">Preview Simulation</span>
              </>
            )}
          </div>
        </div>

        {/* Primary Weather Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-inner backdrop-blur-sm shrink-0">
              {getWeatherIcon(condition, "w-16 h-16 sm:w-20 sm:h-20")}
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl sm:text-7xl font-bold font-mono tabular-nums tracking-tighter text-white">
                  {temp}
                </span>
                <span className="text-3xl sm:text-4xl font-light text-cyan-300">°C</span>
              </div>
              <p className="text-xl sm:text-2xl font-medium text-slate-100 mt-1 capitalize">
                {condition}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Feels like <span className="font-mono tabular-nums text-slate-200">{feelsLike}°C</span>
              </p>
            </div>
          </div>

          {/* Meteorological Metrics Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Relative Humidity</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {humidity}<span className="text-sm font-normal text-slate-400 ml-0.5">%</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <Wind className="w-4 h-4 text-teal-400" />
                <span>Wind Speed</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {wind}<span className="text-sm font-normal text-slate-400 ml-1">km/h</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <CloudRain className="w-4 h-4 text-sky-400" />
                <span>Rainfall</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {rainfall}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <span>Apparent Heat</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                {feelsLike}<span className="text-sm font-normal text-slate-400 ml-0.5">°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
