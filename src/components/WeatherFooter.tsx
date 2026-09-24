import React from 'react';

export const WeatherFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 mt-16 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="font-semibold text-slate-300">
            Singapore Live Weather Platform
          </div>
          <div className="flex items-center gap-4">
            <span>Cache Policy: 10m TTL</span>
            <span aria-hidden="true">·</span>
            <span>Refreshes every 10 min</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          Weather information is provided for informational purposes only.
          This website is an independent project and is not affiliated with,
          endorsed by, or operated by any government agency or weather provider.
        </p>
      </div>
    </footer>
  );
};
