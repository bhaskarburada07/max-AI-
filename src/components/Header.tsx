import React from 'react';
import {
  Brain,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { DemoPresetQuestion } from '../types';

interface HeaderProps {
  onResetSources: () => void;
  presetQuestions: DemoPresetQuestion[];
  onSelectPreset: (q: DemoPresetQuestion) => void;
  isInvestigating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onResetSources,
  presetQuestions,
  onSelectPreset,
  isInvestigating,
}) => {
  return (
    <header className="border-b border-purple-900/30 bg-[#0f111a]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-800 shadow-lg shadow-purple-500/20 border border-purple-400/30">
            <Brain className="w-5 h-5 text-white animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0f111a]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-purple-100 to-indigo-300 bg-clip-text text-transparent font-['Plus_Jakarta_Sans']">
                CROSSMIND AI
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono uppercase tracking-wider">
                Zero-Shot Multimodal
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Evidence-First Multimodal Reasoning & Verification Engine
            </p>
          </div>
        </div>

        {/* Engine indicators & Presets */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Quick Preset Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg p-1">
            <span className="text-[11px] text-slate-400 font-medium px-2 hidden lg:inline flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> Test Scenarios:
            </span>
            <div className="flex gap-1 overflow-x-auto max-w-[340px] sm:max-w-none">
              {presetQuestions.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  disabled={isInvestigating}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${preset.badgeColor}`}
                  title={preset.question}
                >
                  {preset.badge}
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={onResetSources}
            disabled={isInvestigating}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium disabled:opacity-50"
            title="Reset to default multi-modal demo dataset (PDF, CSV, Chart)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Engine Status pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Deterministic Verifier Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
