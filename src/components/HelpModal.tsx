import React from 'react';
import {
  X,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Compass,
  FileText,
  Keyboard,
  ExternalLink,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-primary)] font-['Plus_Jakarta_Sans']">
                MAX AI Help & Documentation
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">
                Evidence-Grounded AI Answer System
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs text-[var(--text-secondary)]">
          {/* Section: The Verification Principle */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>How MAX AI Prevents Hallucinations</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Unlike typical generative chatbots that predict words from open training weights, MAX AI first extracts exact passages, table cells, and OCR text from your uploaded documents. Every factual claim is cross-checked against those citations before answering.
            </p>
          </div>

          {/* Verification Status Codes */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Claim Verification Standards
            </span>
            <div className="space-y-1.5">
              <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">PROVEN:</span>
                  <span className="ml-1 text-[11px]">
                    Direct verbatim quote or numeric value identified in document text with exact page citation.
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">INFERRED:</span>
                  <span className="ml-1 text-[11px]">
                    Logically synthesized from verified context (e.g. sums, comparisons, or multi-page aggregations).
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-500/20 bg-slate-500/5 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-600 dark:text-slate-400">UNKNOWN:</span>
                  <span className="ml-1 text-[11px]">
                    Information is absent from the provided documents. MAX AI explicitly declines to invent missing facts.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Keyboard Shortcuts
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-[var(--bg-surface)] flex items-center justify-between">
                <span>Quick Search</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)]">
                  ⌘ K
                </kbd>
              </div>
              <div className="p-2 rounded-xl bg-[var(--bg-surface)] flex items-center justify-between">
                <span>Send Inquiry</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)]">
                  Enter
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--border-color)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
