import React from 'react';
import {
  LayoutTemplate,
  FileCheck2,
  TrendingUp,
  Cpu,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  BookOpen,
} from 'lucide-react';

interface TemplatesViewProps {
  onUseTemplate: (prompt: string, title?: string) => void;
  onOpenUpload: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onUseTemplate,
  onOpenUpload,
}) => {
  const templates = [
    {
      id: 'tmpl-exec-audit',
      title: 'Executive Financial Audit',
      description: 'Reconcile Q3 and Q4 revenue milestones, identify discrepancies between accounting ledgers and executive reports, and compute gross margins.',
      category: 'Finance & Strategy',
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      samplePrompt: 'Perform a comprehensive financial audit across all uploaded reports: reconcile Q3 and Q4 revenue milestones, list any ledger discrepancies, and cite exact dollar values.',
    },
    {
      id: 'tmpl-hardware-spec',
      title: 'Technical Hardware & Firmware Verification',
      description: 'Cross-check flight cycles, power curves, thermal endurance ratings, and firmware rollout dates against engineering specifications.',
      category: 'Engineering & Telemetry',
      icon: <Cpu className="w-5 h-5 text-blue-500" />,
      samplePrompt: 'Cross-examine firmware rollout dates, peak power consumption curves, and thermal battery limits. Flag any anomalies where field telemetry conflicts with spec sheets.',
    },
    {
      id: 'tmpl-compliance-review',
      title: 'Contract & Compliance Verification',
      description: 'Extract obligations, verify clause citations, check termination policies, and ensure strict zero-hallucination legal compliance.',
      category: 'Legal & Governance',
      icon: <FileCheck2 className="w-5 h-5 text-purple-500" />,
      samplePrompt: 'Identify all operational liabilities, compliance obligations, and warranty clauses. Quote exact sections and page numbers.',
    },
    {
      id: 'tmpl-risk-assessment',
      title: 'Failure Mode & Risk Assessment',
      description: 'Quantify incident rates, identify hardware components with accelerated wear, and assess mitigation protocols.',
      category: 'Operations & Safety',
      icon: <ShieldAlert className="w-5 h-5 text-amber-500" />,
      samplePrompt: 'Extract all reported failures, calculate the failure rate per flight hour, and identify which sub-systems experienced accelerated degradation.',
    },
    {
      id: 'tmpl-research-synthesis',
      title: 'Multimodal Research Synthesis',
      description: 'Synthesize insights combining textual audit notes, tabular telemetry spreadsheets, and visual charts into a unified brief.',
      category: 'Intelligence & Research',
      icon: <Layers className="w-5 h-5 text-indigo-500" />,
      samplePrompt: 'Synthesize the findings across text documents, CSV tables, and charts into an executive briefing with high-confidence supporting citations.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      <div className="pb-4 border-b border-[var(--border-color)]">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-['Plus_Jakarta_Sans'] tracking-tight flex items-center gap-2">
          <LayoutTemplate className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Investigation Templates</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Pre-configured evidence-gathering workflows designed for audits, hardware specs, legal reviews, and research.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => onUseTemplate(tmpl.samplePrompt, tmpl.title)}
            className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-blue-500/40 hover:bg-[var(--bg-secondary)] transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-xs group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center">
                  {tmpl.icon}
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)]">
                  {tmpl.category}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <span>Launch Template</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
