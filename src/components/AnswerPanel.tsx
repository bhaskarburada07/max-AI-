import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  FileText,
  Table as TableIcon,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Cpu,
  AlertOctagon,
  ArrowRight,
  Calculator,
  GitCompare,
  Compass,
  FileSearch,
  Scale,
} from 'lucide-react';
import { FinalAnswer } from '../types';

interface AnswerPanelProps {
  answer: FinalAnswer;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({ answer }) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'reasoning' | 'challenge' | 'verification' | 'planner'>('evidence');
  const [showAllEvidence, setShowAllEvidence] = useState(false);

  const getStatusBadge = () => {
    if (answer.conflicts.length > 0) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <span>⚠️ CONFLICT DETECTED</span>
        </div>
      );
    }
    switch (answer.status) {
      case 'PROVEN':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>🟢 PROVEN</span>
          </div>
        );
      case 'INFERRED':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>🟡 INFERRED</span>
          </div>
        );
      case 'UNKNOWN':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>🔴 UNKNOWN</span>
          </div>
        );
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'text':
        return <FileText className="w-3.5 h-3.5 text-rose-400" />;
      case 'csv':
      case 'excel':
        return <TableIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'chart':
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <FileSearch className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const relevantEvidence = showAllEvidence
    ? answer.evidence
    : answer.evidence.filter((e) => e.usedInReasoning).length > 0
    ? answer.evidence.filter((e) => e.usedInReasoning)
    : answer.evidence.slice(0, 8);

  return (
    <div className="bg-[#10121c] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mb-8">
      {/* Top Banner & Status Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900/90 via-[#131627] to-slate-900/90 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <span className="text-xs text-slate-400 font-mono">
              Investigation ID: {answer.investigationId.slice(0, 14)}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
            <span>Coverage: <strong className="text-white">{answer.verification.evidenceCoverageDetail}</strong></span>
            <span>Agreement: <strong className="text-white">{answer.verification.sourceAgreementDetail}</strong></span>
          </div>
        </div>

        {/* Answer Question & Headline */}
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug font-['Plus_Jakarta_Sans']">
          {answer.headline}
        </h2>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
          {answer.answer}
        </p>

        {/* Conflict Alert Banner if discrepancies exist */}
        {answer.conflicts.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200">
            <div className="flex items-center gap-2 font-bold text-xs uppercase font-mono text-amber-300 mb-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              <span>DISCREPANCY AUDIT: CONFLICT DETECTED ACROSS SOURCES</span>
            </div>
            {answer.conflicts.map((c, idx) => (
              <div key={idx} className="space-y-2 text-xs">
                <p className="text-amber-100 font-medium">{c.discrepancy}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="p-2.5 rounded bg-slate-900/80 border border-amber-500/20">
                    <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">
                      Source A: {c.evidenceA.sourceFileName} [{c.evidenceA.location}]
                    </span>
                    <span className="text-slate-300">Claim: "{c.evidenceA.claim}"</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/80 border border-amber-500/20">
                    <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">
                      Source B: {c.evidenceB.sourceFileName} [{c.evidenceB.location}]
                    </span>
                    <span className="text-slate-300">Claim: "{c.evidenceB.claim}"</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-300/80 font-mono mt-1">
                  Policy effect: Claim cannot be marked PROVEN without reconciliation between official text narrative and telemetry ledger.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MANDATORY Evidence-Bounded Reasoning Section (for UNKNOWN & INFERRED) */}
      {answer.boundedReasoning && (
        <div className="p-5 sm:p-6 bg-[#121422] border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xs uppercase font-mono text-purple-300 mb-4">
            <Compass className="w-4 h-4 text-purple-400" />
            <span>EVIDENCE-BOUNDED REASONING: WHAT CAN WE STILL SAY?</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* What can still be established */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/20">
              <h4 className="text-xs font-mono uppercase font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> What Can Still Be Established:
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {answer.boundedReasoning.whatCanStillBeSaid.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                    <div>
                      <p className="font-medium text-slate-200">{item.claim}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.rationale}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* What is not established */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/20">
              <h4 className="text-xs font-mono uppercase font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> What Is NOT Established:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {answer.boundedReasoning.whatIsNotEstablished.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold shrink-0 mt-0.5">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Conditional Reasoning & Additional Evidence Needed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {/* Conditional Reasoning */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h4 className="text-xs font-mono uppercase font-bold text-indigo-300 mb-2 flex items-center gap-1.5">
                <GitCompare className="w-3.5 h-3.5" /> Conditional Reasoning ("If ... Then"):
              </h4>
              <div className="space-y-2 text-xs">
                {answer.boundedReasoning.conditionalReasoning.map((cond, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
                    <p className="text-purple-300 font-medium">Condition: {cond.condition}</p>
                    <p className="text-slate-200 mt-1">Outcome: {cond.outcome}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">Assessment: {cond.confidenceAssessment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Evidence Needed */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h4 className="text-xs font-mono uppercase font-bold text-purple-300 mb-2 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" /> What Additional Evidence Would Resolve Uncertainty:
              </h4>
              <div className="space-y-2 text-xs">
                {answer.boundedReasoning.additionalEvidenceNeeded.map((ev, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 uppercase">
                        {ev.modality}
                      </span>
                    </div>
                    <p className="text-slate-200 mt-1 font-medium">{ev.description}</p>
                    <p className="text-[11px] text-emerald-400 mt-0.5">Resolution: {ev.expectedResolution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHY THIS ANSWER? Tabbed Navigation */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              AUDIT TRAIL: "WHY THIS ANSWER?"
            </h3>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === 'evidence'
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Evidence ({answer.evidence.length})
            </button>
            <button
              onClick={() => setActiveTab('reasoning')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === 'reasoning'
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Reasoning ({answer.reasoning.length})
            </button>
            <button
              onClick={() => setActiveTab('challenge')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === 'challenge'
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Self-Challenge ({answer.challenges.length})
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === 'verification'
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Verification ({answer.verification.checks.length})
            </button>
          </div>
        </div>

        {/* TAB CONTENT 1: EVIDENCE AUDIT */}
        {activeTab === 'evidence' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Showing {relevantEvidence.length} grounded evidence items with exact coordinates</span>
              <button
                onClick={() => setShowAllEvidence(!showAllEvidence)}
                className="text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>{showAllEvidence ? 'Show Only Used Evidence' : 'Show All Extracted Evidence'}</span>
                {showAllEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relevantEvidence.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-3.5 rounded-xl bg-slate-900/60 border ${
                    ev.usedInReasoning ? 'border-purple-500/30 ring-1 ring-purple-500/10' : 'border-slate-800/80'
                  } transition-all`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                      {getSourceIcon(ev.sourceType)}
                      <span className="truncate max-w-[180px]">{ev.sourceFileName}</span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {ev.location}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium mb-1.5">
                    "{ev.claim}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/60">
                    <span className="text-slate-300">Entity: <strong className="text-white">{ev.entity}</strong></span>
                    {ev.value !== undefined && (
                      <span className="text-emerald-400">Value: {String(ev.value)}{ev.unit ? ` ${ev.unit}` : ''}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: REASONING STEPS */}
        {activeTab === 'reasoning' && (
          <div className="space-y-3">
            {answer.reasoning.map((step, idx) => (
              <div
                key={step.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2 font-mono"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-purple-300 uppercase flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-purple-400" />
                    Step {idx + 1}: {step.operation}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border uppercase ${
                      step.verificationStatus === 'passed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {step.verificationStatus === 'passed' ? '✓ Verified Math' : 'Logical Inference'}
                  </span>
                </div>

                <p className="text-xs font-sans text-slate-200">{step.explanation}</p>

                {step.formula && (
                  <div className="p-2 rounded bg-slate-950 text-xs text-emerald-300 font-mono border border-slate-800">
                    Formula: {step.formula}
                  </div>
                )}

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span>Output: <strong className="text-slate-200">{step.output}</strong></span>
                  <span className="text-[10px]">Inputs: {step.inputs.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB CONTENT 3: SELF-CHALLENGE REPORT */}
        {activeTab === 'challenge' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 font-mono mb-2">
              The CrossMind Self-Challenger actively attempted to disprove or weaken the conclusion across multiple failure modes:
            </p>
            {answer.challenges.map((c) => (
              <div
                key={c.id}
                className={`p-3.5 rounded-xl bg-slate-900/60 border ${
                  c.supported
                    ? 'border-amber-500/30 bg-amber-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold font-mono uppercase text-purple-300">
                    Test: {c.type.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                      c.supported
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {c.supported ? '⚠ Challenge Sustained' : '✓ Survived Challenge'}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-200 mb-1">Q: "{c.question}"</p>
                <p className="text-xs text-slate-300 mb-2">Finding: {c.finding}</p>

                <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                  Impact: {c.mitigationOrImpact}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB CONTENT 4: VERIFICATION DASHBOARD */}
        {activeTab === 'verification' && (
          <div className="space-y-4">
            {/* Scorecard metrics calculated strictly from deterministic checks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Evidence Coverage</div>
                <div className="text-lg font-bold text-white mt-1">{answer.verification.evidenceCoverageDetail}</div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  {Math.round(answer.verification.evidenceCoverage * 100)}% Grounded
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Source Agreement</div>
                <div className="text-lg font-bold text-white mt-1">{answer.verification.sourceAgreementDetail}</div>
                <div className="text-[10px] text-purple-400 font-mono">Cross-Modal Sync</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Reasoning Checks</div>
                <div className="text-lg font-bold text-white mt-1">
                  {answer.verification.reasoningChecksPassed} / {answer.verification.totalReasoningChecks}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">100% Deterministic</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Contradictions</div>
                <div className={`text-lg font-bold mt-1 ${answer.conflicts.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {answer.conflicts.length}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {answer.conflicts.length > 0 ? 'Conflict Alert' : 'Zero Conflicts'}
                </div>
              </div>
            </div>

            {/* Individual check list */}
            <div className="space-y-2 pt-2">
              {answer.verification.checks.map((chk) => (
                <div
                  key={chk.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs font-mono"
                >
                  <div className="mt-0.5">
                    {chk.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-semibold">{chk.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{chk.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{chk.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
