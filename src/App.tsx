import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WeatherData, HealthData, WeatherErrorResponse, TwoHourForecastData, PsiData } from './types';
import { WeatherNavbar } from './components/WeatherNavbar';
import { WeatherBackground } from './components/WeatherBackground';
import { WeatherHero } from './components/WeatherHero';
import { SingaporeWeatherMap } from './components/SingaporeWeatherMap';
import { ForecastGrid } from './components/ForecastGrid';
import { RegionalStations } from './components/RegionalStations';
import { HealthModal } from './components/HealthModal';
import { WeatherFooter } from './components/WeatherFooter';
import { TwoHourNowcast } from './components/TwoHourNowcast';
import { AirQualityPanel } from './components/AirQualityPanel';
import { AlertTriangle, RefreshCw, Activity, Clock, ArrowRight, Map } from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 600; // 10 minutes

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'nowcast' | 'psi' | 'forecast' | 'regions'>('overview');
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

  // Health modal state
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [isHealthOpen, setIsHealthOpen] = useState<boolean>(false);

  // Countdown timer for 10-minute refresh
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

  // Fetch Live Weather from /api/weather based on selected Singapore location
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
    fetchHealth();
  }, [fetchWeather, fetchTwoHr, fetchPsi, fetchHealth, currentLocation]);

  // Initial load
  useEffect(() => {
    handleRefreshAll();
  }, [handleRefreshAll]);

  // 10-minute auto-refresh countdown
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

  // Location selector handler driven by Singapore Map or station buttons
  const handleSelectLocation = (locationName: string) => {
    setCurrentLocation(locationName);
    fetchWeather(locationName);
  };

  const isNightTime = () => {
    const hours = new Date().getHours();
    return hours < 7 || hours >= 19;
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      {/* Weather-Adaptive Atmospheric Background */}
      <WeatherBackground
        condition={weatherData?.condition || 'Partly Cloudy'}
        isNight={isNightTime()}
      />

      {/* Top Bar Navigation */}
      <WeatherNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={handleRefreshAll}
        isRefreshing={loading || twoHrLoading || psiLoading}
        onOpenHealth={() => setIsHealthOpen(true)}
        countdown={countdown}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-8">
        {/* Live Open Data Highlights Bar (Data.gov.sg / NEA) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Active Location & Map Trigger */}
          <div
            onClick={() => setActiveTab('map')}
            className="p-4 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-cyan-400 shrink-0">
                <Map className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate">{currentLocation}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  Map & Microclimate Station
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>

          {/* 2-Hour Nowcast Quick Snippet */}
          <div
            onClick={() => setActiveTab('nowcast')}
            className="p-4 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sky-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white">2-Hour Nowcast</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
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
            <ArrowRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>

          {/* PSI Air Quality Quick Snippet */}
          <div
            onClick={() => setActiveTab('psi')}
            className="p-4 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-teal-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white">Air Quality (PSI)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {psiData ? (
                    <span>
                      Max PSI: <strong className="text-slate-200 font-mono">{psiData.maxPsi}</strong> ({psiData.overallBand})
                    </span>
                  ) : (
                    'Loading PSI...'
                  )}
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </div>

        {/* Loading State */}
        {loading && !weatherData && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-16 text-center space-y-3 backdrop-blur-sm">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-300">Retrieving Singapore live weather readings...</p>
            <p className="text-xs text-slate-500">Querying real-time NEA Open Data</p>
          </div>
        )}

        {/* Error State Banner */}
        {error && !weatherData && !loading && (
          <div className="rounded-2xl border border-rose-900/60 bg-rose-950/20 p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-5">
            <div className="w-12 h-12 bg-rose-900/40 border border-rose-700/60 rounded-xl flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Weather data temporarily unavailable
              </h2>
              {errorDetail && (
                <p className="text-sm text-rose-200/90 max-w-md mx-auto">
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
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
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

            {/* Interactive Singapore Map: Clicking any point updates the location parameters */}
            <SingaporeWeatherMap
              currentLocation={currentLocation}
              onSelectLocation={handleSelectLocation}
              nowcastData={twoHrData}
              psiData={psiData}
              currentTemp={weatherData.temperature}
              currentCondition={weatherData.condition}
            />

            {/* 24-Hour Forecast */}
            <ForecastGrid forecast={weatherData.forecast} />

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

        {/* View Tab: Air Quality / PSI */}
        {activeTab === 'psi' && (
          <AirQualityPanel
            data={psiData}
            isLoading={psiLoading}
            onRefresh={fetchPsi}
          />
        )}

        {/* View Tab: Forecast */}
        {activeTab === 'forecast' && weatherData && (
          <div className="space-y-6 animate-fade-in">
            <ForecastGrid forecast={weatherData.forecast} />
          </div>
        )}

        {/* View Tab: Regional Stations */}
        {activeTab === 'regions' && (
          <div className="space-y-6 animate-fade-in">
            <RegionalStations
              currentLocation={currentLocation}
              onSelectStation={handleSelectLocation}
              isLoading={loading}
            />
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

      {/* Mandatory Footer */}
      <WeatherFooter />
    </div>
  );
}
