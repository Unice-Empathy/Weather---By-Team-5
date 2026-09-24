import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TwoHourForecastData, PsiData } from '../types';
import { getWeatherIcon } from '../utils/weatherIcons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  MapPin,
  Navigation,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  Compass,
  Maximize2,
  Minimize2,
  Droplets,
  Wind
} from 'lucide-react';

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

// SLA OneMap Basemap options
type OneMapStyle = 'Default' | 'Grey' | 'Original' | 'Night';

const ONEMAP_STYLES: { id: OneMapStyle; name: string; desc: string; url: string }[] = [
  {
    id: 'Default',
    name: 'OneMap Default',
    desc: 'Official Full-Color SLA Map',
    url: 'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png'
  },
  {
    id: 'Grey',
    name: 'OneMap Grey',
    desc: 'Minimalist Clean Light Theme',
    url: 'https://www.onemap.gov.sg/maps/tiles/Grey/{z}/{x}/{y}.png'
  },
  {
    id: 'Original',
    name: 'OneMap Classic',
    desc: 'Original Topographic Scheme',
    url: 'https://www.onemap.gov.sg/maps/tiles/Original/{z}/{x}/{y}.png'
  },
  {
    id: 'Night',
    name: 'OneMap Night',
    desc: 'Dark Contrast Cartography',
    url: 'https://www.onemap.gov.sg/maps/tiles/Night/{z}/{x}/{y}.png'
  }
];

// All Singapore Planning Areas matching NEA 2-hour nowcast feeds
const ALL_SINGAPORE_AREAS: MapLocation[] = [
  { name: 'City', region: 'South', lat: 1.292, lon: 103.844 },
  { name: 'Marina Bay', region: 'South', lat: 1.282, lon: 103.858 },
  { name: 'Sentosa', region: 'South', lat: 1.243, lon: 103.832 },
  { name: 'Queenstown', region: 'South', lat: 1.291, lon: 103.786 },
  { name: 'Bukit Merah', region: 'South', lat: 1.282, lon: 103.818 },
  { name: 'Southern Islands', region: 'South', lat: 1.220, lon: 103.835 },

  { name: 'Ang Mo Kio', region: 'Central', lat: 1.375, lon: 103.839 },
  { name: 'Bishan', region: 'Central', lat: 1.351, lon: 103.839 },
  { name: 'Toa Payoh', region: 'Central', lat: 1.334, lon: 103.856 },
  { name: 'Bukit Timah', region: 'Central', lat: 1.325, lon: 103.791 },
  { name: 'Novena', region: 'Central', lat: 1.320, lon: 103.843 },
  { name: 'Tanglin', region: 'Central', lat: 1.306, lon: 103.812 },
  { name: 'Kallang', region: 'Central', lat: 1.311, lon: 103.863 },
  { name: 'Central Water Catchment', region: 'Central', lat: 1.365, lon: 103.815 },

  { name: 'Changi', region: 'East', lat: 1.357, lon: 103.987 },
  { name: 'Bedok', region: 'East', lat: 1.321, lon: 103.924 },
  { name: 'Tampines', region: 'East', lat: 1.345, lon: 103.944 },
  { name: 'Pasir Ris', region: 'East', lat: 1.370, lon: 103.948 },
  { name: 'Paya Lebar', region: 'East', lat: 1.358, lon: 103.914 },
  { name: 'Geylang', region: 'East', lat: 1.318, lon: 103.886 },
  { name: 'Marine Parade', region: 'East', lat: 1.303, lon: 103.907 },
  { name: 'Pulau Ubin', region: 'East', lat: 1.412, lon: 103.957 },
  { name: 'Pulau Tekong', region: 'East', lat: 1.405, lon: 104.053 },

  { name: 'Jurong East', region: 'West', lat: 1.326, lon: 103.737 },
  { name: 'Jurong West', region: 'West', lat: 1.340, lon: 103.705 },
  { name: 'Clementi', region: 'West', lat: 1.315, lon: 103.760 },
  { name: 'Bukit Batok', region: 'West', lat: 1.353, lon: 103.754 },
  { name: 'Bukit Panjang', region: 'West', lat: 1.378, lon: 103.763 },
  { name: 'Choa Chu Kang', region: 'West', lat: 1.384, lon: 103.747 },
  { name: 'Tengah', region: 'West', lat: 1.360, lon: 103.730 },
  { name: 'Tuas', region: 'West', lat: 1.295, lon: 103.635 },
  { name: 'Pioneer', region: 'West', lat: 1.315, lon: 103.697 },
  { name: 'Boon Lay', region: 'West', lat: 1.304, lon: 103.701 },
  { name: 'Jalan Bahar', region: 'West', lat: 1.348, lon: 103.684 },
  { name: 'Jurong Island', region: 'West', lat: 1.266, lon: 103.700 },
  { name: 'Western Water Catchment', region: 'West', lat: 1.390, lon: 103.680 },

  { name: 'Woodlands', region: 'North', lat: 1.432, lon: 103.786 },
  { name: 'Yishun', region: 'North', lat: 1.418, lon: 103.839 },
  { name: 'Sembawang', region: 'North', lat: 1.445, lon: 103.818 },
  { name: 'Punggol', region: 'North', lat: 1.401, lon: 103.904 },
  { name: 'Sengkang', region: 'North', lat: 1.384, lon: 103.891 },
  { name: 'Hougang', region: 'North', lat: 1.371, lon: 103.892 },
  { name: 'Serangoon', region: 'North', lat: 1.355, lon: 103.872 },
  { name: 'Seletar', region: 'North', lat: 1.409, lon: 103.870 },
  { name: 'Mandai', region: 'North', lat: 1.423, lon: 103.792 },
  { name: 'Lim Chu Kang', region: 'North', lat: 1.435, lon: 103.712 },
  { name: 'Sungei Kadut', region: 'North', lat: 1.415, lon: 103.745 }
];

export const SingaporeWeatherMap: React.FC<SingaporeWeatherMapProps> = ({
  currentLocation,
  onSelectLocation,
  nowcastData,
  psiData,
  currentTemp = 31,
  currentCondition = 'Partly Cloudy'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [oneMapStyle, setOneMapStyle] = useState<OneMapStyle>('Default');
  const [mapMode, setMapMode] = useState<'weather' | 'psi'>('weather');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Map town forecasts to lowercase names
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
    return ALL_SINGAPORE_AREAS.filter((loc) => {
      const matchesRegion = selectedRegion === 'All' || loc.region === selectedRegion;
      const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [selectedRegion, searchTerm]);

  // Initialize SLA OneMap Leaflet instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Bounds for Singapore to prevent panning into outer oceans
    const southWest = L.latLng(1.13, 103.55);
    const northEast = L.latLng(1.49, 104.12);
    const bounds = L.latLngBounds(southWest, northEast);

    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: bounds,
      maxBoundsViscosity: 0.8,
      zoomControl: false
    });

    // SLA OneMap TileLayer with official attribution
    const currentStyleObj = ONEMAP_STYLES.find((s) => s.id === oneMapStyle) || ONEMAP_STYLES[0];
    const tileLayer = L.tileLayer(currentStyleObj.url, {
      minZoom: 11,
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a> &copy; <a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority (SLA)</a>'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    markersLayerRef.current = markersGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update SLA OneMap Basemap Tile Layer when style changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const styleObj = ONEMAP_STYLES.find((s) => s.id === oneMapStyle) || ONEMAP_STYLES[0];

    tileLayerRef.current.setUrl(styleObj.url);
  }, [oneMapStyle]);

  // Render Custom Interactive Weather & PSI Markers onto SLA OneMap
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredLocations.forEach((loc) => {
      const isSelected =
        loc.name.toLowerCase() === currentLocation.toLowerCase() ||
        currentLocation.toLowerCase().includes(loc.name.toLowerCase());

      const forecast = forecastMap.get(loc.name.toLowerCase()) || 'Partly Cloudy';
      const isRain =
        forecast.toLowerCase().includes('rain') ||
        forecast.toLowerCase().includes('shower') ||
        forecast.toLowerCase().includes('thunder');

      const regionLower = loc.region.toLowerCase();
      const regionPsi = psiData?.regions?.[regionLower]?.psi ?? 58;

      let iconHtml = '';

      if (mapMode === 'weather') {
        iconHtml = `
          <div class="relative flex flex-col items-center cursor-pointer group transition-transform ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'}">
            ${isSelected ? '<span class="absolute -inset-2 rounded-full bg-cyan-500/30 animate-ping"></span>' : ''}
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-md transition-all ${
              isSelected
                ? 'bg-cyan-600 text-white border-2 border-white ring-2 ring-cyan-500 shadow-cyan-500/30'
                : isRain
                ? 'bg-white/95 text-sky-800 border border-sky-300 hover:border-sky-500 shadow-sm'
                : 'bg-white/95 text-slate-800 border border-slate-300 hover:border-cyan-500 shadow-sm'
            }">
              <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-white' : isRain ? 'bg-sky-500' : 'bg-amber-500'}"></span>
              <span class="whitespace-nowrap">${loc.name}</span>
            </div>
            <div class="mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium shadow-xs border ${
              isSelected
                ? 'bg-slate-900 text-cyan-300 border-slate-700'
                : 'bg-white/90 text-slate-600 border-slate-200'
            }">
              ${forecast}
            </div>
          </div>
        `;
      } else {
        // PSI mode
        const bandColor =
          regionPsi <= 50
            ? 'bg-emerald-500 text-white'
            : regionPsi <= 100
            ? 'bg-teal-600 text-white'
            : 'bg-amber-600 text-white';

        iconHtml = `
          <div class="relative flex flex-col items-center cursor-pointer group transition-transform ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'}">
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-md border ${
              isSelected ? 'border-2 border-cyan-400 ring-2 ring-cyan-500' : 'border-white'
            } ${bandColor}">
              <span class="font-mono">PSI ${regionPsi}</span>
              <span class="text-[10px] opacity-90">${loc.name}</span>
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'onemap-custom-marker',
        html: iconHtml,
        iconSize: [120, 48],
        iconAnchor: [60, 24]
      });

      const marker = L.marker([loc.lat, loc.lon], { icon: customIcon });

      marker.on('click', () => {
        onSelectLocation(loc.name);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([loc.lat, loc.lon], 13, { duration: 0.8 });
        }
      });

      // Popup with full microclimate summary
      const popupContent = `
        <div class="p-3 text-slate-800 font-sans text-xs space-y-2">
          <div class="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <strong class="text-sm font-bold text-slate-900">${loc.name}</strong>
            <span class="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">${loc.region} Region</span>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-500">2-Hr Nowcast:</span>
              <span class="font-semibold text-cyan-700">${forecast}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Regional PSI:</span>
              <span class="font-mono font-semibold text-teal-700">${regionPsi}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Coordinates:</span>
              <span class="font-mono text-slate-500">${loc.lat.toFixed(3)}°N, ${loc.lon.toFixed(3)}°E</span>
            </div>
          </div>
          <div class="pt-1.5 text-[10px] text-cyan-700 font-medium flex items-center gap-1">
            <span>● Official SLA OneMap Cadastral Layer</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { offset: [0, -16] });
      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredLocations, currentLocation, forecastMap, psiData, mapMode, onSelectLocation]);

  // Pan to selected region or location
  const handlePanTo = (lat: number, lon: number, zoom = 13) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], zoom, { duration: 0.9 });
    }
  };

  const handleResetSingapore = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([1.3521, 103.8198], 12, { duration: 0.8 });
    }
    setSelectedRegion('All');
  };

  return (
    <section className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-fade-in text-slate-800">
      {/* SLA OneMap Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600">
              <Compass className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>SLA OneMap Singapore</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded-md border border-red-200">
                Official SLA Basemap
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative national geospatial base layers powered by Singapore Land Authority (SLA) OneMap
          </p>
        </div>

        {/* Top Controls: SLA Basemap Selector & Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Basemap Style Switcher */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-xl text-xs">
            <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              SLA Layer:
            </span>
            {ONEMAP_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setOneMapStyle(style.id)}
                title={style.desc}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  oneMapStyle === style.id
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {style.id}
              </button>
            ))}
          </div>

          {/* Data Mode Switcher */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setMapMode('weather')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                mapMode === 'weather'
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weather Nowcast
            </button>
            <button
              onClick={() => setMapMode('psi')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                mapMode === 'psi'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PSI Air Quality
            </button>
          </div>
        </div>
      </div>

      {/* Region Fast Pan Quicklinks & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 font-medium">Fast Pan:</span>
          <button
            onClick={handleResetSingapore}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
          >
            All Island
          </button>
          <button
            onClick={() => handlePanTo(1.292, 103.844, 14)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
          >
            Downtown / City
          </button>
          <button
            onClick={() => handlePanTo(1.357, 103.987, 13)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
          >
            Changi / East
          </button>
          <button
            onClick={() => handlePanTo(1.340, 103.705, 13)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
          >
            Jurong / West
          </button>
          <button
            onClick={() => handlePanTo(1.432, 103.786, 13)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
          >
            Woodlands / North
          </button>
          <button
            onClick={() => handlePanTo(1.243, 103.832, 14)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium transition-colors"
          >
            Sentosa / South
          </button>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search planning area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Selected Location Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Focused Station:</span>
            <strong className="text-slate-900 text-sm font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block animate-pulse"></span>
              {currentLocation}
            </strong>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-500 hidden sm:inline">
            Click any pin on SLA OneMap to calibrate live readings
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono tabular-nums text-slate-700">
          <span className="text-cyan-700 font-bold">{currentTemp}°C</span>
          <span className="text-slate-300">·</span>
          <span>{currentCondition}</span>
        </div>
      </div>

      {/* SLA OneMap Interactive Leaflet Canvas */}
      <div
        className={`relative w-full rounded-xl border border-slate-300 overflow-hidden shadow-inner transition-all ${
          isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-32px)]' : 'h-[520px]'
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* SLA OneMap Verification Watermark / Badge */}
        <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 text-xs font-semibold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SLA OneMap Live Tile Service</span>
          <a
            href="https://www.onemap.gov.sg/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-cyan-700"
            title="Open official SLA OneMap portal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Toggle Fullscreen button */}
        <button
          onClick={() => setIsFullscreen((prev) => !prev)}
          className="absolute top-3 right-3 z-20 p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-lg shadow-sm border border-slate-200 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Map Legend Overlay in bottom left */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-2 rounded-xl shadow-md text-[11px] space-y-1 text-slate-700 max-w-xs pointer-events-auto">
          <div className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1">
            {mapMode === 'weather' ? 'NEA 2-Hr Nowcast' : 'NEA Regional PSI'}
          </div>
          {mapMode === 'weather' ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Fair / Cloudy
              </span>
              <span className="flex items-center gap-1 text-sky-600">
                <span className="w-2 h-2 rounded-full bg-sky-500 inline-block"></span> Rain / Showers
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 font-mono">
              <span className="text-emerald-700">0-50 Good</span>
              <span>·</span>
              <span className="text-teal-700">51-100 Mod</span>
              <span>·</span>
              <span className="text-amber-700">101+ Unhealthy</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Select Planning Areas Pills */}
      <div className="space-y-2 pt-1 border-t border-slate-200/80">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>All 47 Singapore Planning Areas (Click to pan on SLA OneMap):</span>
          <span className="font-mono text-[11px]">{filteredLocations.length} areas shown</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar py-1">
          {filteredLocations.map((loc) => {
            const isSelected =
              loc.name.toLowerCase() === currentLocation.toLowerCase() ||
              currentLocation.toLowerCase().includes(loc.name.toLowerCase());
            return (
              <button
                key={loc.name}
                onClick={() => {
                  onSelectLocation(loc.name);
                  handlePanTo(loc.lat, loc.lon, 14);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-600 text-white font-semibold border-cyan-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
                {loc.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
