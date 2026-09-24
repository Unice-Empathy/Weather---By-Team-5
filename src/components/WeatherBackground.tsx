import React, { useMemo } from 'react';

interface WeatherBackgroundProps {
  condition?: string;
  isNight?: boolean;
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({
  condition = 'Partly Cloudy',
  isNight = false
}) => {
  const condLower = condition.toLowerCase();

  const weatherTheme = useMemo(() => {
    const isThunder = condLower.includes('thunder') || condLower.includes('storm');
    const isRain = condLower.includes('rain') || condLower.includes('shower') || condLower.includes('drizzle');
    const isCloudy = condLower.includes('cloud') || condLower.includes('overcast') || condLower.includes('hazy');
    const isFair = condLower.includes('fair') || condLower.includes('clear') || condLower.includes('sun');

    if (isThunder) {
      return {
        type: 'thunder',
        gradient: isNight
          ? 'from-slate-900 via-indigo-950/70 to-slate-900'
          : 'from-slate-200 via-indigo-100/50 to-slate-100',
        ambientColor: isNight ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.12)',
        hasRain: true,
        hasLightning: true,
        rainCount: 40,
        cloudColor: 'bg-indigo-200/40'
      };
    }

    if (isRain) {
      return {
        type: 'rain',
        gradient: isNight
          ? 'from-slate-900 via-slate-800 to-sky-950/40'
          : 'from-slate-100 via-sky-50 to-blue-100/50',
        ambientColor: 'rgba(56, 189, 248, 0.15)',
        hasRain: true,
        hasLightning: false,
        rainCount: 35,
        cloudColor: 'bg-slate-300/40'
      };
    }

    if (isFair) {
      return {
        type: 'fair',
        gradient: isNight
          ? 'from-slate-950 via-blue-950/50 to-slate-900'
          : 'from-sky-50 via-slate-50 to-amber-50/40',
        ambientColor: isNight ? 'rgba(147, 197, 253, 0.1)' : 'rgba(251, 191, 36, 0.18)',
        hasSunRays: !isNight,
        hasStars: isNight,
        cloudColor: 'bg-white/50'
      };
    }

    // Default: Partly Cloudy
    return {
      type: 'cloudy',
      gradient: isNight
        ? 'from-slate-900 via-slate-800 to-slate-900'
        : 'from-sky-100/60 via-slate-50 to-cyan-50/40',
      ambientColor: 'rgba(34, 211, 238, 0.12)',
      hasClouds: true,
      cloudColor: 'bg-white/60'
    };
  }, [condLower, isNight]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transition-colors duration-1000 ease-in-out"
    >
      {/* Base Lighter Atmospheric Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${weatherTheme.gradient}`} />

      {/* Ambient Radial Lighting */}
      <div
        className="absolute -top-36 left-1/2 -translate-x-1/2 w-[950px] h-[550px] rounded-full blur-[140px] opacity-80 transition-all duration-1000"
        style={{ backgroundColor: weatherTheme.ambientColor }}
      />

      {/* Tropical Daylight Sun Disc & Glow for Fair Conditions */}
      {weatherTheme.hasSunRays && (
        <>
          <div className="absolute top-4 right-12 w-80 h-80 bg-gradient-to-br from-amber-300/30 via-yellow-200/15 to-transparent rounded-full blur-2xl" />
          <div className="absolute top-12 right-24 w-32 h-32 bg-amber-100/40 rounded-full blur-md" />
        </>
      )}

      {/* Lightning Flash Atmosphere */}
      {weatherTheme.hasLightning && (
        <div className="absolute inset-0 bg-indigo-400/10 mix-blend-overlay animate-pulse duration-700" />
      )}

      {/* Soft Drifting Cloud Pillows (light mode) */}
      <div
        className={`absolute top-8 -left-20 w-[600px] h-48 ${weatherTheme.cloudColor} rounded-full blur-3xl animate-float-slow`}
      />
      <div
        className={`absolute top-28 -right-20 w-[700px] h-56 ${weatherTheme.cloudColor} rounded-full blur-3xl animate-float-reverse`}
      />

      {/* High-visibility Rain Droplets */}
      {weatherTheme.hasRain && (
        <div className="absolute inset-0 opacity-60">
          {Array.from({ length: weatherTheme.rainCount || 30 }).map((_, i) => {
            const leftPct = (i * 2.5) % 100;
            const delay = (i * 0.11) % 2;
            const duration = 0.85 + (i % 5) * 0.12;
            const height = 18 + (i % 14);

            return (
              <span
                key={i}
                className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-cyan-500/70 to-sky-600/90 rounded-full animate-rainfall"
                style={{
                  left: `${leftPct}%`,
                  height: `${height}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  top: '-30px'
                }}
              />
            );
          })}
        </div>
      )}

      {/* Subtle Night Stars */}
      {weatherTheme.hasStars && (
        <div className="absolute inset-0 opacity-75">
          {Array.from({ length: 40 }).map((_, i) => {
            const topPct = (i * 7) % 60;
            const leftPct = (i * 13) % 100;
            const size = (i % 3) + 1;
            const opacity = 0.4 + (i % 5) * 0.12;

            return (
              <span
                key={i}
                className="absolute rounded-full bg-slate-200"
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity
                }}
              />
            );
          })}
        </div>
      )}

      {/* Subtle light horizon ground tint */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-100/80 via-slate-50/40 to-transparent" />
    </div>
  );
};
