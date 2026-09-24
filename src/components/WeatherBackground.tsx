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
        gradient: 'from-slate-950 via-indigo-950/70 to-slate-950',
        ambientColor: 'rgba(99, 102, 241, 0.15)',
        hasRain: true,
        hasLightning: true,
        rainCount: 45
      };
    }

    if (isRain) {
      return {
        type: 'rain',
        gradient: 'from-slate-950 via-slate-900/90 to-sky-950/40',
        ambientColor: 'rgba(56, 189, 248, 0.12)',
        hasRain: true,
        hasLightning: false,
        rainCount: 35
      };
    }

    if (isFair) {
      return {
        type: 'fair',
        gradient: isNight
          ? 'from-slate-950 via-blue-950/40 to-slate-950'
          : 'from-slate-950 via-sky-950/30 to-amber-950/20',
        ambientColor: isNight ? 'rgba(147, 197, 253, 0.08)' : 'rgba(251, 191, 36, 0.12)',
        hasSunRays: !isNight,
        hasStars: isNight
      };
    }

    // Default: Partly Cloudy
    return {
      type: 'cloudy',
      gradient: isNight
        ? 'from-slate-950 via-slate-900 to-slate-950'
        : 'from-slate-950 via-slate-900/80 to-cyan-950/25',
      ambientColor: 'rgba(34, 211, 238, 0.08)',
      hasClouds: true
    };
  }, [condLower, isNight]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transition-colors duration-1000 ease-in-out"
    >
      {/* Base Gradient Layer */}
      <div className={`absolute inset-0 bg-gradient-to-b ${weatherTheme.gradient}`} />

      {/* Atmospheric Radial Ambient Glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[140px] opacity-70 transition-all duration-1000"
        style={{ backgroundColor: weatherTheme.ambientColor }}
      />

      {/* Sun Ray Glow for Fair/Sunny Tropical Days */}
      {weatherTheme.hasSunRays && (
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/10 via-amber-300/5 to-transparent rounded-full blur-3xl" />
      )}

      {/* Lightning Flash Atmosphere for Thundery Showers */}
      {weatherTheme.hasLightning && (
        <div className="absolute inset-0 bg-indigo-300/5 mix-blend-overlay animate-pulse duration-1000" />
      )}

      {/* Drifting Cloud Layers */}
      <div className="absolute top-10 -left-20 w-[600px] h-48 bg-slate-800/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-36 -right-20 w-[700px] h-56 bg-slate-700/10 rounded-full blur-3xl animate-float-reverse" />

      {/* Animated Rain Particles */}
      {weatherTheme.hasRain && (
        <div className="absolute inset-0 opacity-40">
          {Array.from({ length: weatherTheme.rainCount || 30 }).map((_, i) => {
            const leftPct = (i * 2.3) % 100;
            const delay = (i * 0.12) % 2;
            const duration = 0.9 + (i % 5) * 0.15;
            const height = 18 + (i % 12);

            return (
              <span
                key={i}
                className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-cyan-300/80 to-sky-200/90 rounded-full animate-rainfall"
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

      {/* Subtle Star Points for Night */}
      {weatherTheme.hasStars && (
        <div className="absolute inset-0 opacity-60">
          {Array.from({ length: 40 }).map((_, i) => {
            const topPct = (i * 7) % 60;
            const leftPct = (i * 13) % 100;
            const size = (i % 3) + 1;
            const opacity = 0.3 + (i % 5) * 0.14;

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

      {/* Bottom Horizon Gradient to ground the UI */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
    </div>
  );
};
