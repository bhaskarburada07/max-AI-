import React from 'react';
import {
  UploadCloud,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  GitBranch,
  Layers,
  Scale,
} from 'lucide-react';

interface HeroBannerProps {
  onStartClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onStartClick }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#131625] via-[#10121d] to-[#0d0f17] border border-purple-900/30 p-6 md:p-8 mb-6 shadow-2xl">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono mb-3">
          <Scale className="w-3.5 h-3.5 text-purple-400" />
          <span>ZERO-SHOT MULTIMODAL PROOF ARCHITECTURE</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 font-['Plus_Jakarta_Sans'] leading-tight">
          AI THAT INVESTIGATES{' '}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-300 bg-clip-text text-transparent">
            BEFORE IT ANSWERS.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed max-w-2xl">
          Cross-modal heterogeneous evidence, adversarial self-challenge, deterministic verification,
          and <strong className="text-purple-300">evidence-bounded reasoning</strong>. Never invents missing facts;
          formally establishes what is <span className="text-emerald-400 font-semibold">PROVEN</span>,{' '}
          <span className="text-yellow-400 font-semibold">INFERRED</span>, or{' '}
          <span className="text-rose-400 font-semibold">UNKNOWN</span>.
        </p>

        {/* 3-Step Visual Explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 py-2 border-y border-slate-800/80">
          <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-purple-300 font-semibold">1. UPLOAD</div>
              <div className="text-[11px] text-slate-400">PDF, CSV tables, charts & telemetry</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-semibold">2. INVESTIGATE</div>
              <div className="text-[11px] text-slate-400">Zero-shot plan & self-challenge</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-semibold">3. PROVE</div>
              <div className="text-[11px] text-slate-400">Deterministic verification & bounds</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onStartClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Start Investigation</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-purple-400" /> Evidence Graph
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Conflict Detection
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Multi-Modal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
