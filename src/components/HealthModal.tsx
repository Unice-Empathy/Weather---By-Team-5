import React from 'react';
import { HealthData } from '../types';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, RefreshCw, X, Server } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-left space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-800/80 border border-slate-700/60 rounded-lg">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">System & API Health</h3>
              <p className="text-xs text-slate-400">Endpoint: /api/health</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Health Status Items */}
        <div className="space-y-3">
          {/* Key Configured / Open Access */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Open Data Access</div>
              <p className="text-xs text-slate-400 mt-0.5">
                Direct connection to Singapore Open Data (Data.gov.sg / NEA)
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 font-mono text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> No Key Required
              </span>
            </div>
          </div>

          {/* Weather Provider Status */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Weather Provider Upstream</div>
              <p className="text-xs text-slate-400 mt-0.5">
                National Environment Agency (NEA) real-time feed status
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 font-mono text-xs">
              {health?.providerOk ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Operational
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <XCircle className="w-4 h-4" /> Temporarily Busy
                </span>
              )}
            </div>
          </div>

          {/* Upstream Status Code */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Upstream HTTP Status</div>
              <p className="text-xs text-slate-400 mt-0.5">
                Response code returned by Singapore Data.gov.sg API
              </p>
            </div>
            <div className="shrink-0 font-mono text-xs font-semibold">
              {health?.upstreamStatus !== null && health?.upstreamStatus !== undefined ? (
                <span className="text-slate-200 bg-slate-800 px-2 py-1 rounded">
                  HTTP {health.upstreamStatus}
                </span>
              ) : (
                <span className="text-emerald-400">HTTP 200 (Cached)</span>
              )}
            </div>
          </div>
        </div>

        {/* Security Assurance Notice */}
        <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Powered by public real-time data from Singapore Data.gov.sg and the National Environment Agency.
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-check Health</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
