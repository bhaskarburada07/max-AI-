import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Table as TableIcon,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Cpu,
  GitBranch,
  ShieldCheck,
  Compass,
  FileSearch,
  ExternalLink,
} from 'lucide-react';
import { FinalAnswer, Source } from '../types';
import { EvidenceGraphViewer } from './EvidenceGraphViewer';

interface CleanAnswerViewProps {
  answer: FinalAnswer;
  onInspectSourceByFileName?: (fileName: string) => void;
}

export const CleanAnswerView: React.FC<CleanAnswerViewProps> = ({
  answer,
  onInspectSourceByFileName,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusBadge = () => {
    if (answer.conflicts.length > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>CONFLICT DETECTED</span>
        </span>
      );
    }
    switch (answer.status) {
      case 'PROVEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PROVEN</span>
          </span>
        );
      case 'GENERAL_KNOWLEDGE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>GENERAL KNOWLEDGE</span>
          </span>
        );
      case 'INFERRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>INFERRED</span>
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>UNKNOWN</span>
          </span>
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
        return <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <FileSearch className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const usedEvidence = answer.evidence.filter((e) => e.usedInReasoning);
  const displayEvidence = usedEvidence.length > 0 ? usedEvidence : answer.evidence.slice(0, 6);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 animate-in fade-in pb-8">
      {/* 1. User Question Card */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#141722]/80 border border-slate-800/80">
        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs text-slate-300 font-semibold shrink-0">
          Q
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-100 leading-relaxed">
            {answer.question}
          </p>
        </div>
      </div>

      {/* 2. Main AI Answer Card */}
      <div className="rounded-2xl bg-[#141722] border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        {/* Status header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            {getStatusBadge()}
            <span className="text-xs text-slate-400 font-mono">
              Deterministic verification
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Coverage: {answer.verification.evidenceCoverageDetail}
          </div>
        </div>

        {/* Headline & Answer body */}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
            {answer.headline}
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
            {answer.answer}
          </p>

          {/* Explicit Findings vs Inferences breakdown if available */}
          {((answer.explicitFindings && answer.explicitFindings.length > 0) ||
            (answer.inferences && answer.inferences.length > 0)) && (
            <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {answer.explicitFindings && answer.explicitFindings.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wide block mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Explicitly Documented
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {answer.explicitFindings.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 shrink-0">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {answer.inferences && answer.inferences.length > 0 && (
                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                  <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wide block mb-1.5 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    Inferential Recommendations
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {answer.inferences.map((inf: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-400 shrink-0">•</span>
                        <span>{inf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Conflict Alert Banner (if conflicts exist) */}
        {answer.conflicts.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-400 uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4" />
              <span>Contradiction Detected Across Sources</span>
            </div>

            {answer.conflicts.map((c, idx) => (
              <div key={idx} className="space-y-2 text-xs">
                <p className="text-amber-100 font-medium">{c.discrepancy}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <div className="p-2.5 rounded-lg bg-[#0f1118] border border-amber-500/20">
                    <span className="text-[10px] font-mono uppercase text-amber-400 block mb-0.5">
                      {c.evidenceA.sourceFileName} [{c.evidenceA.location}]
                    </span>
                    <span className="text-slate-300">"{c.evidenceA.claim}"</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0f1118] border border-amber-500/20">
                    <span className="text-[10px] font-mono uppercase text-amber-400 block mb-0.5">
                      {c.evidenceB.sourceFileName} [{c.evidenceB.location}]
                    </span>
                    <span className="text-slate-300">"{c.evidenceB.claim}"</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-300/80 font-mono">
                  {c.impact}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 4. Evidence-Bounded Reasoning (for UNKNOWN & INFERRED) */}
        {answer.boundedReasoning && (
          <div className="p-4 rounded-xl bg-[#0f1118] border border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-indigo-400 uppercase">
              <Compass className="w-3.5 h-3.5" />
              <span>Evidence-Bounded Reasoning</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-emerald-400 font-semibold block mb-1">
                  What can still be established:
                </span>
                <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                  {answer.boundedReasoning.whatCanStillBeSaid.map((item, idx) => (
                    <li key={idx}>
                      <span className="font-medium text-slate-200">{item.claim}</span>
                      {item.rationale && (
                        <span className="text-slate-400 block text-[11px]">{item.rationale}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {answer.boundedReasoning.whatIsNotEstablished.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-rose-400 font-semibold block mb-1">
                    What remains not established:
                  </span>
                  <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                    {answer.boundedReasoning.whatIsNotEstablished.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {answer.boundedReasoning.additionalEvidenceNeeded.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-indigo-300 font-semibold block mb-1">
                    Additional evidence required to resolve uncertainty:
                  </span>
                  <div className="space-y-1.5">
                    {answer.boundedReasoning.additionalEvidenceNeeded.map((ev, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] font-mono text-indigo-400 uppercase">
                          [{ev.modality}]
                        </span>{' '}
                        <span className="text-slate-200">{ev.description}</span>
                        <span className="text-slate-400 block text-[11px] mt-0.5">
                          Resolution: {ev.expectedResolution}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Grounded Evidence Sources list (Compact, clickable chips) */}
        <div>
          <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2">
            Evidence Sources ({displayEvidence.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {displayEvidence.map((ev) => (
              <div
                key={ev.id}
                onClick={() => onInspectSourceByFileName && onInspectSourceByFileName(ev.sourceFileName)}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium truncate">
                    {getSourceIcon(ev.sourceType)}
                    <span className="truncate group-hover:text-indigo-300 transition-colors">
                      {ev.sourceFileName}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {ev.location}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  "{ev.claim}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Compact Verification Summary Bar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {answer.verification.reasoningChecksPassed}/{answer.verification.totalReasoningChecks} Checks Passed
            </span>
            <span>•</span>
            <span>Agreement: {answer.verification.sourceAgreementDetail}</span>
            {answer.conflicts.length === 0 && (
              <>
                <span>•</span>
                <span className="text-emerald-400">Zero Contradictions</span>
              </>
            )}
          </div>

          {/* Toggle Investigation Details Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <span>{showDetails ? 'Hide details' : 'How CrossMind investigated'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 7. Collapsible Investigation Details Section (Progressive Disclosure) */}
        {showDetails && (
          <div className="pt-4 border-t border-slate-800/80 space-y-5 animate-in fade-in">
            {/* Reasoning Steps */}
            <div>
              <h4 className="text-xs font-mono uppercase font-bold text-slate-300 mb-2">
                Deterministic Reasoning Trace
              </h4>
              <div className="space-y-2">
                {answer.reasoning.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                      <span>Step {idx + 1}: {step.operation.toUpperCase()}</span>
                      {step.verificationStatus === 'passed' && (
                        <span className="text-emerald-400 text-[10px]">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-slate-400 font-sans text-xs mb-1.5">{step.explanation}</p>
                    {step.formula && (
                      <div className="p-1.5 rounded bg-black/40 text-[11px] text-emerald-300 border border-slate-800">
                        Formula: {step.formula}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Self-Challenge Report */}
            <div>
              <h4 className="text-xs font-mono uppercase font-bold text-slate-300 mb-2">
                Self-Challenger Stress Tests ({answer.challenges.length})
              </h4>
              <div className="space-y-2">
                {answer.challenges.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1 font-mono">
                      <span className="text-slate-300 font-semibold uppercase">{c.type.replace(/_/g, ' ')}</span>
                      <span className={c.supported ? 'text-amber-400' : 'text-emerald-400'}>
                        {c.supported ? '⚠ Challenge Sustained' : '✓ Survived'}
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium mb-1">"{c.question}"</p>
                    <p className="text-slate-400 text-[11px]">{c.finding}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Evidence Graph */}
            {answer.graph && (
              <div>
                <EvidenceGraphViewer graph={answer.graph} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
