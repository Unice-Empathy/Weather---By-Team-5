import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind
} from 'lucide-react';

export function getWeatherIcon(condition: string, className = "w-6 h-6"): React.ReactNode {
  const text = (condition || '').toLowerCase();

  if (text.includes('thunder') || text.includes('lightning') || text.includes('storm')) {
    return <CloudLightning className={`${className} text-amber-400`} />;
  }
  if (text.includes('heavy rain') || text.includes('torrential') || text.includes('shower')) {
    return <CloudRain className={`${className} text-sky-400`} />;
  }
  if (text.includes('drizzle') || text.includes('light rain') || text.includes('patchy rain')) {
    return <CloudDrizzle className={`${className} text-sky-300`} />;
  }
  if (text.includes('partly cloudy') || text.includes('scattered')) {
    return <CloudSun className={`${className} text-amber-300`} />;
  }
  if (text.includes('cloud') || text.includes('overcast')) {
    return <Cloud className={`${className} text-slate-300`} />;
  }
  if (text.includes('fog') || text.includes('mist') || text.includes('haze')) {
    return <CloudFog className={`${className} text-slate-400`} />;
  }
  if (text.includes('wind') || text.includes('breeze') || text.includes('gale')) {
    return <Wind className={`${className} text-teal-300`} />;
  }

  // Default to sun / clear
  return <Sun className={`${className} text-amber-400`} />;
}
