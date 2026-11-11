import React, { useRef, useEffect, useState } from 'react';
import {
  Send,
  Loader2,
  Paperclip,
  Sparkles,
  Bot,
  User,
  Plus,
  ShieldCheck,
  Compass,
  FileText,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
} from 'lucide-react';
import { FinalAnswer, Source } from '../types';
import { CleanAnswerView } from './CleanAnswerView';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'PROVEN' | 'INFERRED' | 'UNKNOWN' | 'GENERAL_KNOWLEDGE';
  headline?: string;
  evidenceCount?: number;
  sourcesUsed?: string[];
  investigationResult?: FinalAnswer;
}

interface MainChatPanelProps {
  messages: ChatMessageItem[];
  sources: Source[];
  question: string;
  setQuestion: (q: string) => void;
  onInvestigate: (customQuery?: string) => void;
  isInvestigating: boolean;
  onOpenUpload: () => void;
  onInspectSourceByFileName: (fileName: string) => void;
  onSelectSuggestion: (prompt: string) => void;
  activeSuggestions: string[];
  onOpenSourcesDrawer: () => void;
  onNewChat: () => void;
}

export const MainChatPanel: React.FC<MainChatPanelProps> = ({
  messages,
  sources,
  question,
  setQuestion,
  onInvestigate,
  isInvestigating,
  onOpenUpload,
  onInspectSourceByFileName,
  onSelectSuggestion,
  activeSuggestions,
  onOpenSourcesDrawer,
  onNewChat,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPromptsMenu, setShowPromptsMenu] = useState(false);
  const [expandedVerificationId, setExpandedVerificationId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isInvestigating]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (question.trim().length > 0 && !isInvestigating) {
        onInvestigate();
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const readySources = sources.filter((s) => s.status === 'READY');

  return (
    <div className="flex-1 flex flex-col justify-between h-[calc(100vh-3.5rem)] relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Scrollable Center Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {messages.length === 0 ? (
          /* Welcome Screen matching reference screenshot */
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center my-auto min-h-[50vh] text-center space-y-8 animate-in fade-in duration-300">
            {/* Heading & Subtitle */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] font-['Plus_Jakarta_Sans'] tracking-tight">
                Welcome to MAX AI
              </h1>
              <p className="text-sm text-[var(--text-secondary)] font-medium max-w-lg mx-auto leading-relaxed">
                Investigate the evidence before trusting the answer.
                <br />
                <span className="text-xs text-[var(--text-muted)]">
                  Ask fact-checked questions, verify documents, or synthesize research without hallucinations.
                </span>
              </p>
            </div>

            {/* Four Quick Action Cards in 2x2 grid matching reference screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-xl">
              {/* Card 1: Ask MAX AI (Amber/Yellow soft pastel icon) */}
              <div
                onClick={() => {
                  const prompt = readySources.length > 0
                    ? `Summarize the primary conclusions from ${readySources[0].fileName}`
                    : 'What are the main principles of evidence-grounded AI?';
                  setQuestion(prompt);
                  textareaRef.current?.focus();
                }}
                className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-amber-400/50 hover:bg-[var(--bg-secondary)] transition-all cursor-pointer flex items-center justify-between group shadow-xs select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-xs text-[var(--text-primary)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Ask MAX AI
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)]">Instant inquiry</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] text-[var(--text-muted)] group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 2: Research & Analyze (Blue/Cyan soft pastel icon) */}
              <div
                onClick={() => {
                  const prompt = readySources.length > 0
                    ? `Perform a detailed research breakdown of key metrics in ${readySources[0].fileName}`
                    : 'Analyze key operational challenges in modern autonomous systems';
                  setQuestion(prompt);
                  textareaRef.current?.focus();
                }}
                className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-blue-400/50 hover:bg-[var(--bg-secondary)] transition-all cursor-pointer flex items-center justify-between group shadow-xs select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-xs text-[var(--text-primary)] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      Research & Analyze
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)]">Deep reasoning</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] text-[var(--text-muted)] group-hover:text-sky-600 dark:group-hover:text-sky-400 flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 3: Verify Evidence (Green soft pastel icon) */}
              <div
                onClick={() => {
                  const prompt = readySources.length > 0
                    ? `Verify whether all claims in ${readySources[0].fileName} are supported by explicit quotes`
                    : 'How does MAX AI strictly verify citations against document text?';
                  setQuestion(prompt);
                  textareaRef.current?.focus();
                }}
                className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-emerald-400/50 hover:bg-[var(--bg-secondary)] transition-all cursor-pointer flex items-center justify-between group shadow-xs select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-xs text-[var(--text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Verify Evidence
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)]">Check citations</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] text-[var(--text-muted)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 4: Upload & Analyze Documents (Purple/Rose soft pastel icon) */}
              <div
                onClick={onOpenUpload}
                className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-rose-400/50 hover:bg-[var(--bg-secondary)] transition-all cursor-pointer flex items-center justify-between group shadow-xs select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-xs text-[var(--text-primary)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Upload Documents
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)]">PDF, CSV, Excel, TXT</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-lg bg-[var(--bg-surface)] text-[var(--text-muted)] group-hover:text-purple-600 dark:group-hover:text-purple-400 flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Active Sources Pill strip if documents are uploaded */}
            {readySources.length > 0 && (
              <div className="flex items-center gap-2 pt-2 text-xs text-[var(--text-secondary)] font-mono">
                <span className="text-[var(--text-muted)]">Active Context:</span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {readySources.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onInspectSourceByFileName(s.fileName)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[11px] text-[var(--text-primary)] font-medium transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span className="truncate max-w-[160px]">{s.fileName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 animate-in fade-in duration-200 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Avatar */}
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[82%] rounded-2xl p-4 sm:p-5 shadow-xs text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs font-medium'
                      : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-xs space-y-3'
                  }`}
                >
                  {/* Assistant Header with Verification Status */}
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-color)] text-xs">
                      <div className="flex items-center gap-1.5 font-bold font-['Plus_Jakarta_Sans']">
                        {msg.status === 'PROVEN' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : msg.status === 'INFERRED' ? (
                          <Compass className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                        <span className="text-[var(--text-primary)] font-extrabold truncate">
                          {msg.headline || 'MAX AI Grounded Answer'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                            msg.status === 'PROVEN'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : msg.status === 'INFERRED'
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                              : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {msg.status || 'VERIFIED'}
                        </span>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded transition-colors"
                          title="Copy Answer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Main text content */}
                  <div className="whitespace-pre-wrap leading-relaxed text-[var(--text-primary)]">
                    {msg.content}
                  </div>

                  {/* Supporting Evidence Items (Requirement: display supporting evidence & source citations) */}
                  {msg.investigationResult && (
                    <div className="pt-2 border-t border-[var(--border-color)]">
                      {/* Toggleable Evidence & Verification Section */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedVerificationId((prev) =>
                            prev === msg.id ? null : msg.id
                          )
                        }
                        className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
                      >
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>
                            {expandedVerificationId === msg.id
                              ? 'Hide Evidence & Citations'
                              : `View Evidence & Citations (${msg.investigationResult.evidence?.length || 0})`}
                          </span>
                        </div>
                        {expandedVerificationId === msg.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {expandedVerificationId === msg.id && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-3">
                          <CleanAnswerView
                            answer={msg.investigationResult}
                            onInspectSourceByFileName={onInspectSourceByFileName}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Investigating Loading Indicator */}
            {isInvestigating && (
              <div className="flex items-start gap-3.5 animate-in fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-xs bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] space-y-1.5 max-w-sm">
                  <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Investigating evidence...</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] font-mono">
                    Searching document pages, checking fact boundaries, and compiling citations.
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ChatGPT-style Bottom Input Area matching reference screenshot */}
      <div className="p-4 sm:p-6 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent pt-2 shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Main Input Box Card */}
          <div className="relative rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
            {/* Top row: Text input + Send button */}
            <div className="flex items-start p-3 sm:p-3.5 gap-2">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isInvestigating}
                rows={2}
                placeholder={
                  readySources.length > 0
                    ? `Ask anything about ${readySources[0].fileName}${
                        readySources.length > 1
                          ? ` and ${readySources.length - 1} other source(s)`
                          : ''
                      }...`
                    : 'Ask anything about your documents, evidence, or research...'
                }
                className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none leading-relaxed min-h-[40px] max-h-32"
              />

              <button
                type="button"
                onClick={() => onInvestigate()}
                disabled={isInvestigating || question.trim().length === 0}
                className={`p-2 rounded-xl text-white transition-all shrink-0 ${
                  question.trim().length > 0 && !isInvestigating
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-600/20 active:scale-95'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
                title="Send inquiry"
              >
                {isInvestigating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Bottom Toolbar row inside the box matching reference screenshot */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] bg-[var(--bg-surface)]/50 rounded-b-2xl">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* Attach Button */}
                <button
                  type="button"
                  onClick={onOpenUpload}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors font-medium text-[11px]"
                  title="Upload & attach documents"
                >
                  <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                  <span>Attach</span>
                </button>

                {/* Evidence Sources Button */}
                <button
                  type="button"
                  onClick={onOpenSourcesDrawer}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors font-medium text-[11px] ${
                    readySources.length > 0
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10'
                      : 'hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Manage Evidence Sources"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {readySources.length > 0
                      ? `${readySources.length} Source${readySources.length === 1 ? '' : 's'}`
                      : 'Add Sources'}
                  </span>
                </button>

                {/* Browse Prompts matching screenshot */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPromptsMenu(!showPromptsMenu)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors font-medium text-[11px]"
                    title="Browse Suggested Prompts"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Browse Prompts</span>
                  </button>

                  {/* Prompts Dropdown Menu */}
                  {showPromptsMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl p-2.5 z-30 space-y-1.5 animate-in fade-in">
                      <div className="text-[10px] uppercase font-mono font-bold text-[var(--text-muted)] px-2 py-1">
                        Suggested Inquiries:
                      </div>
                      {(activeSuggestions.length > 0
                        ? activeSuggestions
                        : [
                            'Summarize key findings and risk factors',
                            'Compare financial revenue across quarters',
                            'Extract all verified metrics and tables',
                            'Verify cold-weather thermal test limits',
                          ]
                      ).map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setQuestion(sug);
                            setShowPromptsMenu(false);
                            textareaRef.current?.focus();
                          }}
                          className="w-full text-left p-2 rounded-xl text-xs hover:bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors leading-relaxed truncate"
                        >
                          "{sug}"
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Character Counter matching screenshot (e.g. 20 / 3,000) */}
              <div className="text-[10px] font-mono text-[var(--text-muted)] select-none">
                {question.length} / 3,000
              </div>
            </div>
          </div>

          {/* Model Disclaimer matching bottom of screenshot */}
          <p className="text-[10px] text-center text-[var(--text-muted)] leading-relaxed select-none">
            MAX AI verifies every answer against ground-truth document evidence to prevent hallucinations. Model: Gemini Flash Evidence Engine v2.0.
          </p>
        </div>
      </div>
    </div>
  );
};
