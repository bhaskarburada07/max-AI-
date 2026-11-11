import React from 'react';
import { CheckCircle2, Clock, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { TraceEvent } from '../types';

interface LiveTraceProps {
  trace: TraceEvent[];
  isInvestigating: boolean;
}

export const LiveTrace: React.FC<LiveTraceProps> = ({ trace, isInvestigating }) => {
  if (trace.length === 0 && !isInvestigating) return null;

  return (
    <div className="bg-[#10121c] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl mb-6">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-semibold text-white tracking-wider uppercase font-mono">
            LIVE AGENT EXECUTION TRACE
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          {isInvestigating ? (
            <span className="flex items-center gap-1.5 text-purple-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Orchestrating modular tools...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Execution verified</span>
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 font-mono text-xs">
        {trace.map((evt, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/40 border border-slate-800/60"
          >
            <div className="mt-0.5 shrink-0">
              {evt.status === 'completed' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : evt.status === 'in_progress' ? (
                <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              ) : evt.status === 'failed' ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-slate-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-purple-300 font-semibold">{evt.stage}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{evt.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
