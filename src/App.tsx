import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WeatherData, HealthData, WeatherErrorResponse, TwoHourForecastData, PsiData, FourDayForecastItem } from './types';
import { WeatherNavbar, NavTab } from './components/WeatherNavbar';
import { WeatherBackground } from './components/WeatherBackground';
import { WeatherHero } from './components/WeatherHero';
import { SingaporeWeatherMap } from './components/SingaporeWeatherMap';
import { ForecastGrid } from './components/ForecastGrid';
import { FourDayOutlook } from './components/FourDayOutlook';
import { StationSensors } from './components/StationSensors';
import { RegionalStations } from './components/RegionalStations';
import { HealthModal } from './components/HealthModal';
import { ApiDirectoryModal } from './components/ApiDirectoryModal';
import { WeatherFooter } from './components/WeatherFooter';
import { TwoHourNowcast } from './components/TwoHourNowcast';
import { AirQualityPanel } from './components/AirQualityPanel';
import { AlertTriangle, RefreshCw, Activity, Clock, ArrowRight, Map, Calendar, Radio, Database } from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 300; // 5 minutes refresh cycle

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [currentLocation, setCurrentLocation] = useState<string>('City');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [upstreamStatus, setUpstreamStatus] = useState<number | null>(null);

  // Live Singapore Open Data states (Data.gov.sg / NEA)
  const [twoHrData, setTwoHrData] = useState<TwoHourForecastData | null>(null);
  const [twoHrLoading, setTwoHrLoading] = useState<boolean>(false);
  const [psiData, setPsiData] = useState<PsiData | null>(null);
  const [psiLoading, setPsiLoading] = useState<boolean>(false);
  const [fourDayForecasts, setFourDayForecasts] = useState<FourDayForecastItem[]>([]);
  const [fourDayLoading, setFourDayLoading] = useState<boolean>(false);

  // Modals state
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [isHealthOpen, setIsHealthOpen] = useState<boolean>(false);
  const [isApiDirectoryOpen, setIsApiDirectoryOpen] = useState<boolean>(false);

  // Countdown timer
  const [countdown, setCountdown] = useState<number>(REFRESH_INTERVAL_SECONDS);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Health Check from /api/health
  const fetchHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const json: HealthData = await res.json();
        setHealthData(json);
      } else {
        setHealthData({
          keyConfigured: true,
          providerOk: false,
          upstreamStatus: res.status
        });
      }
    } catch {
      setHealthData({
        keyConfigured: true,
        providerOk: false,
        upstreamStatus: 502
      });
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // Fetch Singapore 2-Hour Nowcast from /api/two-hr-forecast
  const fetchTwoHr = useCallback(async () => {
    setTwoHrLoading(true);
    try {
      const res = await fetch('/api/two-hr-forecast');
      if (res.ok) {
        const json: TwoHourForecastData = await res.json();
        setTwoHrData(json);
      }
    } catch {
      // Handled silently
    } finally {
      setTwoHrLoading(false);
    }
  }, []);

  // Fetch Singapore PSI Air Quality from /api/psi
  const fetchPsi = useCallback(async () => {
    setPsiLoading(true);
    try {
      const res = await fetch('/api/psi');
      if (res.ok) {
        const json: PsiData = await res.json();
        setPsiData(json);
      }
    } catch {
      // Handled silently
    } finally {
      setPsiLoading(false);
    }
  }, []);

  // Fetch Singapore 4-Day Outlook from /api/four-day-outlook
  const fetchFourDay = useCallback(async () => {
    setFourDayLoading(true);
    try {
      const res = await fetch('/api/four-day-outlook');
      if (res.ok) {
        const json = await res.json();
        const items = json?.data?.records?.[0]?.forecasts || [];
        const formatted: FourDayForecastItem[] = items.map((f: any) => {
          const dateObj = new Date(f.timestamp);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          return {
            day: dayName,
            timestamp: f.timestamp,
            condition: f.forecast || 'Partly Cloudy',
            summary: f.summary || f.forecast || 'Moderate tropical conditions',
            tempLow: f.temperature?.low ?? 25,
            tempHigh: f.temperature?.high ?? 32,
            humidityLow: f.relativeHumidity?.low ?? 60,
            humidityHigh: f.relativeHumidity?.high ?? 90,
            windSpeedLow: f.wind?.speed?.low ?? 10,
            windSpeedHigh: f.wind?.speed?.high ?? 20,
            windDirection: f.wind?.direction ?? 'SE'
          };
        });
        if (formatted.length > 0) {
          setFourDayForecasts(formatted);
        }
      }
    } catch {
      // Handled silently
    } finally {
      setFourDayLoading(false);
    }
  }, []);

  // Fetch Live Weather from /api/weather
  const fetchWeather = useCallback(async (locationToFetch: string) => {
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    setUpstreamStatus(null);

    try {
      const res = await fetch(`/api/weather?location=${encodeURIComponent(locationToFetch)}`);

      if (res.ok) {
        const data: WeatherData = await res.json();
        if (data && typeof data.temperature === 'number') {
          setWeatherData(data);
          if (data.fourDayForecast && data.fourDayForecast.length > 0) {
            setFourDayForecasts(data.fourDayForecast);
          }
        } else {
          throw new Error('Malformed weather response');
        }
      } else {
        const errJson: WeatherErrorResponse = await res.json().catch(() => ({
          error: 'Weather data temporarily unavailable'
        }));

        setError('Weather data temporarily unavailable');
        setErrorDetail(errJson.error || 'Weather service unavailable');
        if (errJson.upstreamStatus) {
          setUpstreamStatus(errJson.upstreamStatus);
        }
      }
    } catch {
      setError('Weather data temporarily unavailable');
      setErrorDetail('Network request to /api/weather failed');
    } finally {
      setLoading(false);
      setCountdown(REFRESH_INTERVAL_SECONDS);
    }
  }, []);

  // Master refresh function
  const handleRefreshAll = useCallback(() => {
    fetchWeather(currentLocation);
    fetchTwoHr();
    fetchPsi();
    fetchFourDay();
    fetchHealth();
  }, [fetchWeather, fetchTwoHr, fetchPsi, fetchFourDay, fetchHealth, currentLocation]);

  // Initial load
  useEffect(() => {
    handleRefreshAll();
  }, [handleRefreshAll]);

  // Auto-refresh countdown
  useEffect(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRefreshAll();
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [handleRefreshAll]);

  const handleSelectLocation = (locationName: string) => {
    setCurrentLocation(locationName);
    fetchWeather(locationName);
  };

  const isNightTime = () => {
    const hours = new Date().getHours();
    return hours < 7 || hours >= 19;
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col font-sans selection:bg-cyan-200 selection:text-cyan-900 relative">
      {/* Weather-Adaptive Lighter Background */}
      <WeatherBackground
        condition={weatherData?.condition || 'Partly Cloudy'}
        isNight={isNightTime()}
      />

      {/* Navigation Bar */}
      <WeatherNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={handleRefreshAll}
        isRefreshing={loading || twoHrLoading || psiLoading}
        onOpenHealth={() => setIsHealthOpen(true)}
        onOpenApiDirectory={() => setIsApiDirectoryOpen(true)}
        countdown={countdown}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-8">
        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Active Area & Map Trigger */}
          <div
            onClick={() => setActiveTab('map')}
            className="p-4 bg-white/90 hover:bg-white border border-slate-200 hover:border-cyan-400 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-lg text-cyan-700 shrink-0">
                <Map className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate">{currentLocation}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Interactive Island Map
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>

          {/* 2-Hour Nowcast Quick Snippet */}
          <div
            onClick={() => setActiveTab('nowcast')}
            className="p-4 bg-white/90 hover:bg-white border border-slate-200 hover:border-sky-400 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-700 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">2-Hr Nowcast</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {twoHrData ? (
                    <span>
                      {twoHrData.validPeriod.text} ·{' '}
                      {twoHrData.summary.thunderyCount > 0
                        ? `${twoHrData.summary.thunderyCount} thundery`
                        : 'Fair weather'}
                    </span>
                  ) : (
                    'Loading nowcast...'
                  )}
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-sky-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>

          {/* 4-Day Outlook Snippet */}
          <div
            onClick={() => setActiveTab('fourday')}
            className="p-4 bg-white/90 hover:bg-white border border-slate-200 hover:border-amber-400 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">4-Day Outlook</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {fourDayForecasts.length > 0
                    ? `${fourDayForecasts[0].day}: ${fourDayForecasts[0].tempLow}-${fourDayForecasts[0].tempHigh}°C`
                    : 'Synoptic outlook'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>

          {/* PSI Air Quality Quick Snippet */}
          <div
            onClick={() => setActiveTab('psi')}
            className="p-4 bg-white/90 hover:bg-white border border-slate-200 hover:border-teal-400 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-teal-700 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">PSI & UV</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {psiData ? (
                    <span>
                      Max PSI: <strong className="text-slate-900 font-mono">{psiData.maxPsi}</strong> ({psiData.overallBand})
                    </span>
                  ) : (
                    'Loading air quality...'
                  )}
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-teal-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </div>

        {/* Loading State */}
        {loading && !weatherData && (
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-16 text-center space-y-3 backdrop-blur-sm shadow-xs">
            <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-800">Retrieving Singapore live weather readings...</p>
            <p className="text-xs text-slate-400">Querying real-time NEA Open Data</p>
          </div>
        )}

        {/* Error State Banner */}
        {error && !weatherData && !loading && (
          <div className="rounded-2xl border border-rose-200 bg-white p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-5 shadow-sm">
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Weather data temporarily unavailable
              </h2>
              {errorDetail && (
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  {errorDetail}
                </p>
              )}
              {upstreamStatus && (
                <p className="text-xs font-mono text-slate-400">
                  Upstream Status: HTTP {upstreamStatus}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => fetchWeather(currentLocation)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* View Tab: Overview */}
        {activeTab === 'overview' && weatherData && (
          <div className="space-y-8 animate-fade-in">
            {/* Live Weather Hero for Selected Location */}
            <WeatherHero data={weatherData} isFallback={false} />

            {/* Interactive Singapore Map */}
            <SingaporeWeatherMap
              currentLocation={currentLocation}
              onSelectLocation={handleSelectLocation}
              nowcastData={twoHrData}
              psiData={psiData}
              currentTemp={weatherData.temperature}
              currentCondition={weatherData.condition}
            />

            {/* 4-Day Extended Outlook */}
            <FourDayOutlook forecasts={fourDayForecasts} isLoading={fourDayLoading} />

            {/* 24-Hour Forecast Bulletin */}
            <ForecastGrid forecast={weatherData.forecast} />

            {/* Station Sensors array */}
            <StationSensors />

            {/* Regional Stations Selector */}
            <RegionalStations
              currentLocation={currentLocation}
              onSelectStation={handleSelectLocation}
              isLoading={loading}
            />
          </div>
        )}

        {/* View Tab: Interactive Singapore Map */}
        {activeTab === 'map' && (
          <div className="space-y-6 animate-fade-in">
            <SingaporeWeatherMap
              currentLocation={currentLocation}
              onSelectLocation={handleSelectLocation}
              nowcastData={twoHrData}
              psiData={psiData}
              currentTemp={weatherData?.temperature}
              currentCondition={weatherData?.condition}
            />

            {weatherData && (
              <WeatherHero data={weatherData} isFallback={false} />
            )}
          </div>
        )}

        {/* View Tab: 2-Hour Nowcast */}
        {activeTab === 'nowcast' && (
          <TwoHourNowcast
            data={twoHrData}
            isLoading={twoHrLoading}
            onRefresh={fetchTwoHr}
            onSelectArea={(area) => {
              handleSelectLocation(area);
              setActiveTab('overview');
            }}
          />
        )}

        {/* View Tab: 4-Day Outlook */}
        {activeTab === 'fourday' && (
          <div className="space-y-6 animate-fade-in">
            <FourDayOutlook forecasts={fourDayForecasts} isLoading={fourDayLoading} />
          </div>
        )}

        {/* View Tab: Air Quality / PSI & UV */}
        {activeTab === 'psi' && (
          <AirQualityPanel
            data={psiData}
            isLoading={psiLoading}
            onRefresh={fetchPsi}
          />
        )}

        {/* View Tab: 24h Forecast Bulletin */}
        {activeTab === 'forecast' && weatherData && (
          <div className="space-y-6 animate-fade-in">
            <ForecastGrid forecast={weatherData.forecast} />
          </div>
        )}

        {/* View Tab: Station Sensors Telemetry */}
        {activeTab === 'sensors' && (
          <div className="space-y-6 animate-fade-in">
            <StationSensors />
          </div>
        )}
      </main>

      {/* System & API Health Inspection Modal */}
      <HealthModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
        health={healthData}
        isLoading={healthLoading}
        onRefresh={fetchHealth}
      />

      {/* Singapore Data.gov.sg 10-Endpoint Directory Modal */}
      <ApiDirectoryModal
        isOpen={isApiDirectoryOpen}
        onClose={() => setIsApiDirectoryOpen(false)}
      />

      {/* Mandatory Footer */}
      <WeatherFooter />
    </div>
  );
}
