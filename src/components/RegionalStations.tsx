import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface RegionalStationsProps {
  currentLocation: string;
  onSelectStation: (station: string) => void;
  isLoading: boolean;
}

const SINGAPORE_STATIONS = [
  { id: 'Singapore', name: 'Singapore (Central)', zone: 'Central', desc: 'Central City & Downtown Core' },
  { id: 'Marina Bay', name: 'Marina Bay', zone: 'South', desc: 'Coastal bay & financial district' },
  { id: 'Changi', name: 'Changi', zone: 'East', desc: 'Eastern coastal airport corridor' },
  { id: 'Sentosa', name: 'Sentosa Island', zone: 'South', desc: 'Southern resort archipelago' },
  { id: 'Jurong', name: 'Jurong West', zone: 'West', desc: 'Western industrial & lake district' },
  { id: 'Woodlands', name: 'Woodlands', zone: 'North', desc: 'Northern border causeway gateway' },
  { id: 'Punggol', name: 'Punggol Waterway', zone: 'North-East', desc: 'North-eastern eco-town & coast' },
  { id: 'Ang Mo Kio', name: 'Ang Mo Kio', zone: 'Central North', desc: 'Central residential heartland' }
];

export const RegionalStations: React.FC<RegionalStationsProps> = ({
  currentLocation,
  onSelectStation,
  isLoading
}) => {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Regional Weather Stations</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Select a regional observation post across the island to observe local readings
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {SINGAPORE_STATIONS.map((station) => {
          const isSelected =
            currentLocation.toLowerCase() === station.id.toLowerCase() ||
            (station.id === 'Singapore' && currentLocation.toLowerCase().includes('singapore'));

          return (
            <button
              key={station.id}
              onClick={() => onSelectStation(station.id)}
              disabled={isLoading}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{station.zone} Zone</span>
                {isSelected && (
                  <span className="flex items-center gap-1 text-cyan-400 font-medium">
                    <Navigation className="w-3 h-3 fill-cyan-400" /> Active
                  </span>
                )}
              </div>
              <div className="text-base font-semibold text-white">
                {station.name}
              </div>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {station.desc}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
