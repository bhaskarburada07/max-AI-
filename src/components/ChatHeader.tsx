import React from 'react';
import {
  Brain,
  FolderOpen,
  RotateCcw,
  Sparkles,
  Layers,
  Plus,
} from 'lucide-react';
import { DemoPresetQuestion } from '../types';

interface ChatHeaderProps {
  sourcesCount: number;
  onOpenSourcesDrawer: () => void;
  onResetInvestigation: () => void;
  onRestoreDemo: () => void;
  presetQuestions: DemoPresetQuestion[];
  onSelectPreset: (q: DemoPresetQuestion) => void;
  isInvestigating: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  sourcesCount,
  onOpenSourcesDrawer,
  onResetInvestigation,
  onRestoreDemo,
  presetQuestions,
  onSelectPreset,
  isInvestigating,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0f1118]/95 backdrop-blur-sm sticky top-0 z-30 px-4 py-2.5 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white font-['Plus_Jakarta_Sans']">
                CrossMind AI
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isInvestigating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                  }`}
                />
                <span className="hidden sm:inline">
                  {isInvestigating ? 'Investigating...' : 'Ready'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sources Drawer Toggle Button */}
          <button
            onClick={onOpenSourcesDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            title="Manage active sources"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">Sources</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {sourcesCount}
            </span>
          </button>

          {/* New Investigation / Clear View */}
          <button
            onClick={onResetInvestigation}
            disabled={isInvestigating}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            title="Start new investigation with clean state"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">New Investigation</span>
          </button>

          {/* Demo Data Quick Menu / Restore */}
          <button
            onClick={onRestoreDemo}
            disabled={isInvestigating}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-xs text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50"
            title="Restore sample business audit dataset (PDF, CSV, Chart)"
          >
            <Layers className="w-3 h-3 text-slate-400" />
            <span className="hidden md:inline">Demo Dataset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
