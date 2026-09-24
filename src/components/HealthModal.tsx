import React from 'react';
import { HealthData } from '../types';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, RefreshCw, X, Server, Database } from 'lucide-react';

interface HealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: HealthData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const HealthModal: React.FC<HealthModalProps> = ({
  isOpen,
  onClose,
  health,
  isLoading,
  onRefresh
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-7 text-left space-y-5 text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-100 text-cyan-700 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">System & API Health</h3>
              <p className="text-xs text-slate-500">Endpoint: /api/health</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Health Status Items */}
        <div className="space-y-3">
          {/* Open Data Access */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Singapore Open Data Access</div>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct connection to Singapore Open Data (Data.gov.sg / NEA)
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 font-mono text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct Public Feed
              </span>
            </div>
          </div>

          {/* Upstream Provider */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Weather Provider Status</div>
              <p className="text-xs text-slate-500 mt-0.5">
                National Environment Agency (NEA) real-time data status
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 font-mono text-xs">
              {health?.providerOk ? (
                <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 10 Feeds Synced
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Syncing
                </span>
              )}
            </div>
          </div>

          {/* Upstream HTTP Status */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">HTTP Status</div>
              <p className="text-xs text-slate-500 mt-0.5">
                Response code returned by Singapore Data.gov.sg
              </p>
            </div>
            <div className="shrink-0 font-mono text-xs font-semibold">
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                200 OK
              </span>
            </div>
          </div>

          {/* Connected Feeds */}
          {health?.activeFeeds && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-600" />
                Active NEA Data Streams ({health.activeFeeds.length} Total)
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                {health.activeFeeds.map((feed) => (
                  <div key={feed.id} className="flex items-center gap-1 text-slate-600 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">{feed.endpoint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Retest Telemetry</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
