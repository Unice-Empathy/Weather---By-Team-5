import React from 'react';
import { ExternalLink, Database, ShieldCheck } from 'lucide-react';

export const WeatherFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/95 mt-16 py-10 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Singapore Live Weather Platform · 10 Real-Time NEA Open Data Feeds
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 font-mono">
            <span>Cache: Staggered Pacing</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Sync: Live Auto-Refresh</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-emerald-700 font-medium">Zero API Keys Required</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <p className="leading-relaxed">
            Data sourced in real-time from Singapore’s Open Data Portal (
            <a
              href="https://data.gov.sg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-700 hover:underline font-medium inline-flex items-center gap-0.5"
            >
              Data.gov.sg <ExternalLink className="w-3 h-3" />
            </a>
            ) and the National Environment Agency (NEA) under the Singapore Open Data Licence.
          </p>
          <div className="flex flex-wrap gap-2 sm:justify-end items-center">
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">2-Hour Nowcast</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">24-Hour Forecast</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">4-Day Outlook</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">PSI & PM2.5</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">UV Index</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">Station Sensors</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
