import React, { useState, useEffect } from 'react';
import { X, Globe2, ExternalLink, CheckCircle2, Code2, Database, Copy, Check } from 'lucide-react';
import { ApiDirectoryResponse, ApiEndpointItem } from '../types';

interface ApiDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDirectoryModal: React.FC<ApiDirectoryModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<ApiDirectoryResponse | null>(null);
  const [activeJson, setActiveJson] = useState<{ id: string; content: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/all-endpoints')
        .then((r) => r.json())
        .then(setData)
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInspect = async (item: ApiEndpointItem) => {
    setIsLoading(true);
    try {
      const res = await fetch(item.apiPath);
      const json = await res.json();
      setActiveJson({
        id: item.name,
        content: JSON.stringify(json, null, 2)
      });
    } catch (err) {
      setActiveJson({
        id: item.name,
        content: JSON.stringify({ error: 'Failed to inspect live response' }, null, 2)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100/80 text-cyan-700 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 leading-tight">
                Singapore Data.gov.sg API Directory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All 10 Real-Time Open Data feeds powered by National Environment Agency (NEA)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="p-3 bg-cyan-50/60 border border-cyan-200 rounded-xl text-xs text-cyan-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-600" />
              10/10 Open Data feeds connected directly. Zero third-party API key required.
            </span>
            <span className="font-mono text-cyan-700 font-semibold">100% Public Open Data</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {data?.endpoints.map((ep, idx) => (
              <div key={ep.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 w-5">#{idx + 1}</span>
                    <span className="font-semibold text-sm text-slate-900">{ep.name}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {ep.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleInspect(ep)}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 flex items-center gap-1 transition-colors"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      Live JSON
                    </button>
                    <a
                      href={ep.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-cyan-600"
                      title="Open Official Data.gov.sg URL"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <p className="text-xs text-slate-500 pl-7">{ep.description}</p>

                {/* URL Bar */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-mono text-slate-600 ml-7">
                  <span className="truncate pr-2">{ep.url}</span>
                  <button
                    onClick={() => handleCopy(ep.url, ep.id)}
                    className="text-slate-400 hover:text-slate-700 shrink-0"
                    title="Copy API URL"
                  >
                    {copiedId === ep.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* JSON Viewer Inspector */}
          {activeJson && (
            <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-900 text-slate-100 text-xs font-mono">
              <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
                <span className="text-cyan-400 font-semibold">{activeJson.id} · Live Response</span>
                <button
                  onClick={() => setActiveJson(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <pre className="p-4 max-h-64 overflow-y-auto text-[11px] text-slate-200 leading-relaxed">
                {activeJson.content}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Complies with Singapore Open Data Terms of Use</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
