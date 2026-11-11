import React, { useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  Paperclip,
  Plus,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  Compass,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
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

interface ChatWorkspaceProps {
  messages: ChatMessageItem[];
  sources: Source[];
  question: string;
  setQuestion: (q: string) => void;
  onInvestigate: () => void;
  isInvestigating: boolean;
  onOpenUpload: () => void;
  onNewChat: () => void;
  onInspectSourceByFileName: (fileName: string) => void;
  suggestions: string[];
  onSelectSuggestion: (sug: string) => void;
  conversationTitle?: string;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  messages,
  sources,
  question,
  setQuestion,
  onInvestigate,
  isInvestigating,
  onOpenUpload,
  onNewChat,
  onInspectSourceByFileName,
  suggestions,
  onSelectSuggestion,
  conversationTitle = 'Investigation Workspace',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">
      {/* Top Conversation Header */}
      <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-[var(--bg-secondary)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 truncate">
          <Bot className="w-4 h-4 text-indigo-500 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate font-['Plus_Jakarta_Sans']">
            {conversationTitle}
          </h2>
          {sources.length > 0 && (
            <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {sources.length} active source{sources.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)] font-['Plus_Jakarta_Sans']">
                How can I assist your investigation?
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mt-1 leading-relaxed">
                {sources.length > 0
                  ? 'I am loaded with your uploaded evidence and ready to answer fact-checked questions.'
                  : 'Ask any question or upload a document to begin.'}
              </p>
            </div>

            {/* Quick Suggestions */}
            {suggestions.length > 0 && (
              <div className="flex flex-col gap-2 max-w-md w-full pt-4">
                <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                  Suggested from your documents:
                </span>
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSuggestion(sug)}
                    className="p-3 text-left rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-indigo-500/30 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all font-medium flex items-center justify-between group shadow-xs"
                  >
                    <span>"{sug}"</span>
                    <Sparkles className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 animate-in fade-in ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Assistant Avatar */}
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 shadow-xs text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs font-medium'
                    : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-xs space-y-3'
                }`}
              >
                {msg.sender === 'assistant' && msg.headline && (
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)] text-xs">
                    <div className="flex items-center gap-1.5 font-bold font-['Plus_Jakarta_Sans']">
                      {msg.status === 'PROVEN' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : msg.status === 'INFERRED' ? (
                        <Compass className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className="text-[var(--text-primary)]">{msg.headline}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          msg.status === 'PROVEN'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : msg.status === 'INFERRED'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {msg.status || 'VERIFIED'}
                      </span>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* If full investigation result attached, show interactive Evidence / Citations */}
                {msg.investigationResult && (
                  <div className="pt-2">
                    <CleanAnswerView
                      answer={msg.investigationResult}
                      onInspectSourceByFileName={onInspectSourceByFileName}
                    />
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Investigating Loading Indicator Bubble */}
        {isInvestigating && (
          <div className="flex items-start gap-3 animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] space-y-2 max-w-sm">
              <div className="flex items-center gap-2 font-semibold text-indigo-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Investigating evidence...</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-mono leading-relaxed">
                Reading document pages, matching claims, and performing strict verification.
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Input Bar */}
      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
        {/* Dynamic Question Suggestions above input */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pb-2.5 text-xs overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3" />
              <span>Suggested:</span>
            </span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSuggestion(sug)}
                disabled={isInvestigating}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0"
              >
                "{sug}"
              </button>
            ))}
          </div>
        )}

        <div className="relative rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] focus-within:border-indigo-500 flex items-center p-2 transition-all shadow-inner">
          <button
            type="button"
            onClick={onOpenUpload}
            className="p-2 text-[var(--text-muted)] hover:text-indigo-400 transition-colors"
            title="Upload document"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isInvestigating}
            placeholder={
              sources.length > 0
                ? "Ask a question about your documents..."
                : "Ask any question or attach files (+)..."
            }
            rows={1}
            className="flex-1 bg-transparent px-2.5 text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none leading-relaxed"
          />

          <button
            type="button"
            onClick={onInvestigate}
            disabled={isInvestigating || question.trim().length === 0}
            className={`p-2.5 rounded-xl text-white transition-all shrink-0 ${
              question.trim().length > 0 && !isInvestigating
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
  );
};
