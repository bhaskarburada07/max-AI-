import React from 'react';
import {
  UploadCloud,
  FileText,
  MessageSquare,
  BarChart3,
  Clock,
  ArrowRight,
  Sparkles,
  Bot,
  Layers,
  Paperclip,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Source } from '../types';
import { getLocalGreeting } from './TopHeader';

interface HomePageProps {
  onOpenUpload: () => void;
  onNavigateToChat: (initialPrompt?: string) => void;
  onNavigateToDocuments: () => void;
  onNavigateToReports: () => void;
  onNavigateToHistory: () => void;
  onLoadDemoSample: () => void;
  sources: Source[];
  quickQuestion: string;
  setQuickQuestion: (q: string) => void;
  onSubmitQuickQuestion: () => void;
  isInvestigating: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenUpload,
  onNavigateToChat,
  onNavigateToDocuments,
  onNavigateToReports,
  onNavigateToHistory,
  onLoadDemoSample,
  sources,
  quickQuestion,
  setQuickQuestion,
  onSubmitQuickQuestion,
  isInvestigating,
}) => {
  const { greeting } = getLocalGreeting();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (quickQuestion.trim().length > 0 && !isInvestigating) {
        onSubmitQuickQuestion();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* 1. Hero Greeting Banner (Reference Design) */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-indigo-500/20 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Evidence-Grounded Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight font-['Plus_Jakarta_Sans']">
              {greeting}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Turn your documents into clear answers and useful insights with zero hallucinations.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onOpenUpload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Document</span>
              </button>

              <button
                type="button"
                onClick={onLoadDemoSample}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Try a Sample</span>
              </button>
            </div>
          </div>

          {/* Friendly AI Mascot / 3D Icon illustration (Reference design) */}
          <div className="hidden md:flex items-center justify-center shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-indigo-600/30 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center p-6 shadow-2xl relative group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full" />
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40 transform group-hover:scale-105 transition-transform">
                <Bot className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Quick Action Cards (Reference Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Upload Document Card */}
        <div
          onClick={onOpenUpload}
          className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-blue-500/40 hover:bg-[var(--bg-surface)] transition-all cursor-pointer group flex flex-col justify-between h-40 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <FileText className="w-5 h-5" />
            </div>
            <div className="w-7 h-7 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-blue-400 transition-colors">
              Upload Document
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              PDF, CSV, images, TXT, Excel...
            </p>
          </div>
        </div>

        {/* Ask a Question Card */}
        <div
          onClick={() => onNavigateToChat()}
          className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-purple-500/40 hover:bg-[var(--bg-surface)] transition-all cursor-pointer group flex flex-col justify-between h-40 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="w-7 h-7 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-purple-400 transition-colors">
              Ask a Question
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Get instant verified answers with citations.
            </p>
          </div>
        </div>

        {/* View Insights Card */}
        <div
          onClick={onNavigateToReports}
          className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-emerald-500/40 hover:bg-[var(--bg-surface)] transition-all cursor-pointer group flex flex-col justify-between h-40 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="w-7 h-7 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
              View Insights
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Explore key trends, metrics & summaries.
            </p>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div
          onClick={onNavigateToHistory}
          className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-amber-500/40 hover:bg-[var(--bg-surface)] transition-all cursor-pointer group flex flex-col justify-between h-40 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <div className="w-7 h-7 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-amber-400 transition-colors">
              Recent Activity
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Continue previous investigations.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main AI Assistant Ready Workspace & Instant Input (Reference Design) */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 sm:p-12 text-center space-y-6 shadow-sm">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-sm">
            <FileText className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-['Plus_Jakarta_Sans']">
            Your AI assistant is ready
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md">
            {sources.length > 0
              ? `${sources.length} document${sources.length === 1 ? '' : 's'} loaded in active context. Ask anything to investigate.`
              : 'Upload a document or ask a question to get started.'}
          </p>

          {sources.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] font-mono"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="truncate max-w-[160px]">{src.fileName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instant Question Input Field (Reference Design) */}
        <div className="max-w-2xl mx-auto pt-2">
          <div className="relative rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] focus-within:border-indigo-500 flex items-center p-2 shadow-inner transition-all">
            <button
              type="button"
              onClick={onOpenUpload}
              className="p-2 text-[var(--text-muted)] hover:text-indigo-400 transition-colors"
              title="Attach documents"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={quickQuestion}
              onChange={(e) => setQuickQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isInvestigating}
              placeholder="Ask anything about your documents..."
              className="flex-1 bg-transparent px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            />

            <button
              type="button"
              onClick={onSubmitQuickQuestion}
              disabled={isInvestigating || quickQuestion.trim().length === 0}
              className={`p-2.5 rounded-xl text-white transition-all ${
                quickQuestion.trim().length > 0 && !isInvestigating
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-indigo-600/30 hover:opacity-90 active:scale-95'
                  : 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isInvestigating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
