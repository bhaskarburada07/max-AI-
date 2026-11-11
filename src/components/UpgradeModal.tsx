import React from 'react';
import {
  X,
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  Lock,
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-xl rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-primary)] font-['Plus_Jakarta_Sans']">
                Upgrade to MAX AI Pro
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">
                Enterprise-grade evidence extraction and unlimited reasoning limits
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

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current Free Plan */}
          <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Standard
              </span>
              <div className="text-2xl font-extrabold text-[var(--text-primary)]">
                $0 <span className="text-xs font-normal text-[var(--text-muted)]">/ mo</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Essential document verification for individual researchers.
              </p>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Up to 10 document sources</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Standard OCR & PDF parsing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Full citation quotes & page links</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="w-full py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text-muted)] cursor-default"
            >
              Current Active Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  MAX AI PRO
                </span>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                  Popular
                </span>
              </div>
              <div className="text-2xl font-extrabold text-[var(--text-primary)]">
                $29 <span className="text-xs font-normal text-[var(--text-muted)]">/ mo</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Unlimited multimodal reasoning for analytical teams.
              </p>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Unlimited documents & pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Deep Multi-Document cross checks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>High-speed GPU OCR processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Export audit reports (PDF & JSON)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
