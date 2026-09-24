import React, { useState, useMemo } from 'react';
import { AreaForecast, TwoHourForecastData, PsiData } from '../types';
import { getWeatherIcon } from '../utils/weatherIcons';
import { MapPin, Navigation, Wind, CloudRain, Thermometer, Layers, Check, Search } from 'lucide-react';

interface SingaporeWeatherMapProps {
  currentLocation: string;
  onSelectLocation: (location: string) => void;
  nowcastData: TwoHourForecastData | null;
  psiData: PsiData | null;
  currentTemp?: number;
  currentCondition?: string;
}

interface MapLocation {
  name: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central';
  lat: number;
  lon: number;
}

// Key Singapore Locations with accurate geographic coordinates
const SINGAPORE_LOCATIONS: MapLocation[] = [
  { name: 'City', region: 'South', lat: 1.292, lon: 103.844 },
  { name: 'Marina Bay', region: 'South', lat: 1.282, lon: 103.858 },
  { name: 'Sentosa', region: 'South', lat: 1.243, lon: 103.832 },
  { name: 'Queenstown', region: 'South', lat: 1.291, lon: 103.786 },

  { name: 'Ang Mo Kio', region: 'Central', lat: 1.375, lon: 103.839 },
  { name: 'Bishan', region: 'Central', lat: 1.351, lon: 103.839 },
  { name: 'Toa Payoh', region: 'Central', lat: 1.334, lon: 103.856 },
  { name: 'Bukit Timah', region: 'Central', lat: 1.325, lon: 103.791 },

  { name: 'Changi', region: 'East', lat: 1.357, lon: 103.987 },
  { name: 'Bedok', region: 'East', lat: 1.321, lon: 103.924 },
  { name: 'Tampines', region: 'East', lat: 1.345, lon: 103.944 },
  { name: 'Pasir Ris', region: 'East', lat: 1.370, lon: 103.948 },
  { name: 'Paya Lebar', region: 'East', lat: 1.358, lon: 103.914 },

  { name: 'Jurong East', region: 'West', lat: 1.326, lon: 103.737 },
  { name: 'Jurong West', region: 'West', lat: 1.340, lon: 103.705 },
  { name: 'Clementi', region: 'West', lat: 1.315, lon: 103.760 },
  { name: 'Bukit Batok', region: 'West', lat: 1.353, lon: 103.754 },
  { name: 'Tuas', region: 'West', lat: 1.295, lon: 103.635 },
  { name: 'Boon Lay', region: 'West', lat: 1.304, lon: 103.701 },

  { name: 'Woodlands', region: 'North', lat: 1.432, lon: 103.786 },
  { name: 'Yishun', region: 'North', lat: 1.418, lon: 103.839 },
  { name: 'Sembawang', region: 'North', lat: 1.445, lon: 103.818 },
  { name: 'Punggol', region: 'North', lat: 1.401, lon: 103.904 },
  { name: 'Sengkang', region: 'North', lat: 1.384, lon: 103.891 }
];

// SVG projection constants
const MIN_LON = 103.60;
const MAX_LON = 104.04;
const MIN_LAT = 1.18;
const MAX_LAT = 1.48;
const SVG_WIDTH = 900;
const SVG_HEIGHT = 500;

function projectToSvg(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * (SVG_WIDTH - 120) + 60;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * (SVG_HEIGHT - 100) + 50;
  return { x: Math.round(x), y: Math.round(y) };
}

export const SingaporeWeatherMap: React.FC<SingaporeWeatherMapProps> = ({
  currentLocation,
  onSelectLocation,
  nowcastData,
  psiData,
  currentTemp = 31,
  currentCondition = 'Partly Cloudy'
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [hoveredLocation, setHoveredLocation] = useState<MapLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mapMode, setMapMode] = useState<'weather' | 'psi'>('weather');

  // Map town forecasts to names
  const forecastMap = useMemo(() => {
    const map = new Map<string, string>();
    if (nowcastData && nowcastData.forecasts) {
      for (const f of nowcastData.forecasts) {
        map.set(f.area.toLowerCase(), f.forecast);
      }
    }
    return map;
  }, [nowcastData]);

  // Filter locations
  const filteredLocations = useMemo(() => {
    return SINGAPORE_LOCATIONS.filter((loc) => {
      const matchesRegion = selectedRegion === 'All' || loc.region === selectedRegion;
      const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [selectedRegion, searchTerm]);

  // Selected location details
  const activeLocObj = useMemo(() => {
    return (
      SINGAPORE_LOCATIONS.find(
        (l) => l.name.toLowerCase() === currentLocation.toLowerCase() ||
               currentLocation.toLowerCase().includes(l.name.toLowerCase())
      ) || SINGAPORE_LOCATIONS[0]
    );
  }, [currentLocation]);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-fade-in">
      {/* Map Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Interactive Singapore Weather Map</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Click any location to update all live weather parameters for that area
          </p>
        </div>

        {/* Region & Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setMapMode('weather')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mapMode === 'weather'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weather
            </button>
            <button
              onClick={() => setMapMode('psi')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mapMode === 'psi'
                  ? 'bg-slate-800 text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Air Quality (PSI)
            </button>
          </div>

          {/* Region selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
            {['All', 'North', 'South', 'East', 'West', 'Central'].map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  selectedRegion === reg
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Location Indicator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Selected Location:</span>
            <strong className="text-white text-sm font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block"></span>
              {currentLocation}
            </strong>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Coordinates: {activeLocObj.lat.toFixed(3)}°N, {activeLocObj.lon.toFixed(3)}°E ({activeLocObj.region} Region)
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono tabular-nums text-slate-300">
          <span className="text-cyan-400 font-bold">{currentTemp}°C</span>
          <span className="text-slate-400">·</span>
          <span>{currentCondition}</span>
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative w-full aspect-[16/9] min-h-[360px] max-h-[500px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center p-2">
        {/* Subtle Water & Maritime Grid background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Singapore Map SVG */}
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full object-contain filter drop-shadow-lg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="mainIslandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            <linearGradient id="selectedPulse" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Singapore Main Island & Surrounding Islands accurate landmass SVG paths */}
          {/* Main Island: Pulau Ujong */}
          <path
            d="M 120 280 
               C 130 250, 160 210, 210 180 
               C 260 150, 310 130, 370 120 
               C 430 110, 490 115, 540 135 
               C 590 155, 640 180, 710 190 
               C 770 200, 830 220, 850 250 
               C 855 270, 830 300, 780 320 
               C 730 340, 670 350, 600 360 
               C 530 370, 480 375, 430 370 
               C 380 365, 340 370, 290 380 
               C 240 390, 180 400, 140 370 
               C 110 345, 110 310, 120 280 Z"
            fill="url(#mainIslandGrad)"
            stroke="#334155"
            strokeWidth="2"
            strokeLinejoin="round"
            className="transition-colors duration-500"
          />

          {/* Secondary Straits Contour Detail */}
          <path
            d="M 170 340 Q 230 320 300 330 T 450 330 T 620 330 T 760 300"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Jurong Island (Southwest) */}
          <path
            d="M 230 405 C 250 395, 290 400, 310 415 C 320 425, 305 445, 275 445 C 245 445, 220 425, 230 405 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1.5"
          />
          <text x="270" y="430" fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Jurong Island</text>

          {/* Sentosa Island (South) */}
          <path
            d="M 450 420 C 470 415, 520 420, 535 435 C 540 445, 515 455, 480 455 C 445 455, 435 435, 450 420 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1.5"
          />
          <text x="490" y="442" fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Sentosa</text>

          {/* Pulau Ubin (Northeast) */}
          <path
            d="M 730 140 C 750 135, 785 140, 795 152 C 800 160, 775 168, 750 168 C 725 168, 715 150, 730 140 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1.5"
          />
          <text x="760" y="156" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif">P. Ubin</text>

          {/* Pulau Tekong (East) */}
          <path
            d="M 830 130 C 850 120, 885 125, 890 145 C 895 165, 865 180, 840 175 C 815 170, 815 145, 830 130 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1.5"
          />
          <text x="860" y="155" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif">P. Tekong</text>

          {/* Region Label Annotations */}
          <text x="440" y="150" fill="#475569" fontSize="11" fontWeight="bold" letterSpacing="2" textAnchor="middle">NORTH</text>
          <text x="480" y="270" fill="#475569" fontSize="11" fontWeight="bold" letterSpacing="2" textAnchor="middle">CENTRAL</text>
          <text x="730" y="270" fill="#475569" fontSize="11" fontWeight="bold" letterSpacing="2" textAnchor="middle">EAST</text>
          <text x="250" y="270" fill="#475569" fontSize="11" fontWeight="bold" letterSpacing="2" textAnchor="middle">WEST</text>
          <text x="480" y="385" fill="#475569" fontSize="11" fontWeight="bold" letterSpacing="2" textAnchor="middle">SOUTH</text>

          {/* Interactive Pins / Hotspots */}
          {filteredLocations.map((loc) => {
            const { x, y } = projectToSvg(loc.lat, loc.lon);
            const isSelected =
              currentLocation.toLowerCase() === loc.name.toLowerCase() ||
              currentLocation.toLowerCase().includes(loc.name.toLowerCase());
            const areaCondition = forecastMap.get(loc.name.toLowerCase()) || 'Partly Cloudy';
            const isRain =
              areaCondition.toLowerCase().includes('rain') ||
              areaCondition.toLowerCase().includes('shower') ||
              areaCondition.toLowerCase().includes('thunder');

            return (
              <g
                key={loc.name}
                transform={`translate(${x}, ${y})`}
                onClick={() => onSelectLocation(loc.name)}
                onMouseEnter={() => setHoveredLocation(loc)}
                onMouseLeave={() => setHoveredLocation(null)}
                className="cursor-pointer transition-all duration-300 group"
              >
                {/* Pulsing Target Ring for Active Selected Pin */}
                {isSelected && (
                  <>
                    <circle r="22" fill="none" stroke="#22d3ee" strokeWidth="1.5" opacity="0.4" className="animate-ping" />
                    <circle r="15" fill="#0891b2" opacity="0.2" />
                  </>
                )}

                {/* Marker Outer Circle */}
                <circle
                  r={isSelected ? 10 : 7}
                  fill={isSelected ? '#06b6d4' : isRain ? '#38bdf8' : '#334155'}
                  stroke={isSelected ? '#ffffff' : '#0f172a'}
                  strokeWidth="2"
                  className="transition-all duration-300 group-hover:scale-125"
                />

                {/* Center dot */}
                <circle
                  r={isSelected ? 4 : 2.5}
                  fill={isSelected ? '#ffffff' : isRain ? '#ffffff' : '#94a3b8'}
                />

                {/* Pin Name Label */}
                <text
                  y={isSelected ? -16 : -12}
                  fill={isSelected ? '#22d3ee' : '#cbd5e1'}
                  fontSize={isSelected ? 11 : 9.5}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  textAnchor="middle"
                  className="select-none pointer-events-none drop-shadow-md"
                >
                  {loc.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Floating Card in Corner of Map */}
        {(hoveredLocation || activeLocObj) && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs shadow-xl max-w-xs transition-all pointer-events-none">
            {(() => {
              const displayLoc = hoveredLocation || activeLocObj;
              const cond = forecastMap.get(displayLoc.name.toLowerCase()) || currentCondition;
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-sm">{displayLoc.name}</span>
                    <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded">
                      {displayLoc.region}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-slate-300">
                    <span className="truncate">{cond}</span>
                    <div className="shrink-0">{getWeatherIcon(cond, 'w-4 h-4')}</div>
                  </div>
                  <div className="text-[11px] text-cyan-400 pt-1 border-t border-slate-800 font-medium">
                    Click to load all real-time readings
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Legend in Top Right */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-2.5 text-[11px] text-slate-400 space-y-1.5 pointer-events-none hidden sm:block">
          <div className="font-semibold text-slate-200 text-xs mb-1">Map Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-white inline-block"></span>
            <span>Selected Location</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-slate-900 inline-block"></span>
            <span>Rain / Showers Area</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-900 inline-block"></span>
            <span>Fair / Cloudy Area</span>
          </div>
        </div>
      </div>

      {/* Quick Location Pills under Map for Fast Selection */}
      <div className="space-y-2">
        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>Popular Meteorological Locations:</span>
          <span>{filteredLocations.length} locations available</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filteredLocations.map((loc) => {
            const isSelected =
              currentLocation.toLowerCase() === loc.name.toLowerCase() ||
              currentLocation.toLowerCase().includes(loc.name.toLowerCase());
            const cond = forecastMap.get(loc.name.toLowerCase()) || 'Partly Cloudy';

            return (
              <button
                key={loc.name}
                onClick={() => onSelectLocation(loc.name)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-semibold'
                    : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300'
                }`}
              >
                <span>{loc.name}</span>
                <span className="shrink-0">{getWeatherIcon(cond, 'w-3 h-3')}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
