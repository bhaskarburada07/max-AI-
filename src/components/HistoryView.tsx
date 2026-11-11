import React, { useState, useEffect } from 'react';
import {
  History,
  MessageSquare,
  Trash2,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
} from 'lucide-react';

export interface SavedConversationSummary {
  id: string;
  title: string;
  messagesCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  sourceFiles?: string[];
}

interface HistoryViewProps {
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  currentConversationId: string | null;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onSelectConversation,
  onNewChat,
  currentConversationId,
}) => {
  const [conversations, setConversations] = useState<SavedConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/conversations');
      if (!res.ok) throw new Error('Failed to load conversation history');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err: any) {
      console.error('[HistoryView] Error fetching conversations:', err);
      setError(err.message || 'Could not fetch history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('[HistoryView] Delete error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-['Plus_Jakarta_Sans'] tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-amber-500" />
            <span>Investigation History & Threads</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Persisted in database with citations, evidence verification states, and source scopes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchConversations}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start New Investigation</span>
          </button>
        </div>
      </div>

      {/* Conversation Thread List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Retrieving conversation records...</span>
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--text-primary)]">No previous history yet</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-1">
              Ask your first question in the Chat Workspace or from the Home tab. Conversations are automatically saved.
            </p>
          </div>
          <button
            type="button"
            onClick={onNewChat}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Start First Inquiry</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const isCurrent = conv.id === currentConversationId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-sm ${
                  isCurrent
                    ? 'border-indigo-500/50 bg-indigo-500/5'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-indigo-500/30 hover:bg-[var(--bg-surface)]'
                }`}
              >
                <div className="flex items-start gap-3.5 truncate w-full sm:w-auto flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </div>

                  <div className="truncate flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors truncate">
                        {conv.title || 'Untitled Investigation'}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold">
                          Active
                        </span>
                      )}
                    </div>

                    {conv.lastMessage && (
                      <p className="text-xs text-[var(--text-muted)] truncate mt-1">
                        {conv.lastMessage}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(conv.updatedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(conv.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <span>•</span>

                      <span>{conv.messagesCount} message(s)</span>

                      {conv.sourceFiles && conv.sourceFiles.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400 truncate max-w-[200px]">
                            {conv.sourceFiles.join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete thread"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="w-8 h-8 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
