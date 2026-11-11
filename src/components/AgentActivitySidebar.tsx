import React from 'react';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Layers,
  CheckCircle2,
  AlertOctagon,
  Scale,
  Sparkles,
} from 'lucide-react';
import { FinalAnswer } from '../types';

interface AgentActivitySidebarProps {
  isInvestigating: boolean;
  latestAnswer: FinalAnswer | null;
}

export const AgentActivitySidebar: React.FC<AgentActivitySidebarProps> = ({
  isInvestigating,
  latestAnswer,
}) => {
  return (
    <div className="bg-[#10121c] border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            AGENT ORCHESTRATION
          </h3>
        </div>
        <span
          className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full ${
            isInvestigating
              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isInvestigating ? 'bg-purple-400 animate-ping' : 'bg-emerald-400'
            }`}
          />
          {isInvestigating ? 'INVESTIGATING' : 'READY'}
        </span>
      </div>

      {/* Orchestrator Pipeline status */}
      <div className="space-y-2 text-xs font-mono">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">
          Active Modular Subsystems
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Document Analyzer (PDF)
            </span>
            <span className="text-slate-500 text-[10px]">Active</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Table Analyzer (CSV)
            </span>
            <span className="text-slate-500 text-[10px]">Deterministic</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Vision & Chart Analyzer
            </span>
            <span className="text-slate-500 text-[10px]">Active</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Self-Challenger Engine
            </span>
            <span className="text-slate-500 text-[10px]">Adversarial</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              Bounded Reasoner
            </span>
            <span className="text-slate-500 text-[10px]">Zero-Shot</span>
          </div>
        </div>
      </div>

      {/* Verification Summary if Answer exists */}
      {latestAnswer && (
        <div className="space-y-2 text-xs font-mono pt-2 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Verification Status</span>
            <span className="text-purple-300 font-bold">{latestAnswer.status}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Coverage:</span>
              <span className="text-white font-bold">{latestAnswer.verification.evidenceCoverageDetail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Agreement:</span>
              <span className="text-white font-bold">{latestAnswer.verification.sourceAgreementDetail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Deterministic Checks:</span>
              <span className="text-emerald-400 font-bold">
                {latestAnswer.verification.reasoningChecksPassed} / {latestAnswer.verification.totalReasoningChecks}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Contradictions:</span>
              <span className={latestAnswer.conflicts.length > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                {latestAnswer.conflicts.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Rule Box */}
      <div className="mt-auto p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-slate-400 leading-relaxed font-sans">
        <div className="flex items-center gap-1.5 text-purple-300 font-semibold mb-1 font-mono text-[10px] uppercase">
          <Scale className="w-3.5 h-3.5" />
          Strict Evidence Rule
        </div>
        CrossMind never invents values or manufactures confidence scores. When evidence is insufficient, it bounds the uncertainty and details missing telemetry.
      </div>
    </div>
  );
};
