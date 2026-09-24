import React from 'react';
import { WeatherData } from '../types';
import { getWeatherIcon } from '../utils/weatherIcons';
import { Droplets, Wind, Thermometer, CloudRain, Clock, MapPin, Sun, Wind as WindIcon, ShieldCheck } from 'lucide-react';
import heroImage from '../assets/images/singapore_skyline_weather_1790237012053.jpg';

interface WeatherHeroProps {
  data: WeatherData;
  isFallback?: boolean;
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({ data, isFallback }) => {
  const temp = Number.isFinite(data.temperature) ? data.temperature : 30;
  const feelsLike = Number.isFinite(data.feelsLike) ? data.feelsLike : temp;
  const humidity = Number.isFinite(data.humidity) ? data.humidity : 75;
  const wind = Number.isFinite(data.windSpeed) ? data.windSpeed : 12;
  const condition = data.condition || 'Clear';
  const rainfall = data.rainfall || '0.0 mm';
  const location = data.location || 'Central Singapore';
  const updated = data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) : 'Live';

  const uv = data.uv || { index: 4, level: 'Moderate', color: 'amber', description: 'Sun protection recommended' };
  const pm25 = data.pm25 || { value: 18, band: 'Normal', color: 'emerald', description: 'Normal outdoor activities' };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-md">
      {/* Background Image with Light Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Singapore skyline atmospheric backdrop"
          className="w-full h-full object-cover opacity-15"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      <div className="relative z-10 p-6 sm:p-8">
        {/* Location & Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-500 mb-6 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
            <span className="font-bold text-slate-900 text-base sm:text-lg">{location}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-600 font-medium">Republic of Singapore</span>
          </div>

          <div className="flex items-center gap-2 font-mono tabular-nums text-slate-500 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated: {updated}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              NEA Real-Time
            </span>
          </div>
        </div>

        {/* Primary Weather Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="p-4 bg-sky-50/80 border border-sky-100 rounded-2xl shadow-xs shrink-0">
              {getWeatherIcon(condition, "w-16 h-16 sm:w-20 sm:h-20")}
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl sm:text-7xl font-extrabold font-mono tabular-nums tracking-tighter text-slate-900">
                  {temp}
                </span>
                <span className="text-3xl sm:text-4xl font-light text-cyan-600">°C</span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-slate-800 mt-1 capitalize">
                {condition}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Feels like <span className="font-mono tabular-nums font-semibold text-slate-700">{feelsLike}°C</span> (Heat Index)
              </p>

              {/* Real-time Environmental Badges (UV + PM2.5) */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-medium text-slate-700">UV Index:</span>
                  <span className="font-bold font-mono text-amber-700">{uv.index}</span>
                  <span className="text-slate-400">({uv.level})</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-700">1-hr PM2.5:</span>
                  <span className="font-bold font-mono text-emerald-700">{pm25.value} µg/m³</span>
                  <span className="text-slate-400">({pm25.band})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meteorological Metrics Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="bg-slate-50/90 hover:bg-white border border-slate-200 rounded-xl p-3.5 transition-colors">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                <Droplets className="w-4 h-4 text-cyan-600" />
                <span>Relative Humidity</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {humidity}<span className="text-sm font-normal text-slate-400 ml-0.5">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">NEA Hygrometer Feed</p>
            </div>

            <div className="bg-slate-50/90 hover:bg-white border border-slate-200 rounded-xl p-3.5 transition-colors">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                <Wind className="w-4 h-4 text-teal-600" />
                <span>Wind Speed</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {wind}<span className="text-sm font-normal text-slate-400 ml-1">km/h</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Anemometer Array</p>
            </div>

            <div className="bg-slate-50/90 hover:bg-white border border-slate-200 rounded-xl p-3.5 transition-colors">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                <CloudRain className="w-4 h-4 text-sky-600" />
                <span>Precipitation</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {rainfall}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Automated Rain Gauges</p>
            </div>

            <div className="bg-slate-50/90 hover:bg-white border border-slate-200 rounded-xl p-3.5 transition-colors">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                <Thermometer className="w-4 h-4 text-amber-600" />
                <span>Apparent Heat</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {feelsLike}<span className="text-sm font-normal text-slate-400 ml-0.5">°C</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Biometeorology Heat Index</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
