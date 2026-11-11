import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  FileText,
  MessageSquare,
  LayoutTemplate,
  History,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Source } from '../types';
import { ProjectItem } from './ProjectsSidebar';
import { MainNavTab } from './Sidebar';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[];
  projects: ProjectItem[];
  onSelectTab: (tab: MainNavTab) => void;
  onSelectProject: (id: string) => void;
  onSelectSource: (source: Source) => void;
  onQuickQuery: (q: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  sources,
  projects,
  onSelectTab,
  onSelectProject,
  onSelectSource,
  onQuickQuery,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredSources = sources.filter((s) =>
    s.fileName.toLowerCase().includes(query.toLowerCase())
  );
  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[var(--border-color)] flex items-center gap-2.5">
          <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search documents, projects, or ask a question..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Ask AI option if query is non-empty */}
          {query.trim().length > 0 && (
            <div
              onClick={() => {
                onQuickQuery(query);
                onClose();
              }}
              className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 cursor-pointer flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span className="font-semibold truncate">Ask MAX AI: "{query}"</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          )}

          {/* Documents Section */}
          {filteredSources.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] px-2">
                Documents ({filteredSources.length})
              </span>
              {filteredSources.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSource(s);
                    onClose();
                  }}
                  className="p-2 rounded-xl hover:bg-[var(--bg-surface)] cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-[var(--text-primary)] truncate">{s.fileName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                    {s.pageCount || 1} pages
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Projects Section */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] px-2">
                Projects ({filteredProjects.length})
              </span>
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id);
                    onClose();
                  }}
                  className="p-2 rounded-xl hover:bg-[var(--bg-surface)] cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <div className="truncate">
                      <div className="text-[var(--text-primary)] font-medium truncate">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate">
                        {p.description}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                    {p.lastActive}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Navigation Links */}
          <div className="space-y-1 pt-1 border-t border-[var(--border-subtle)]">
            <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] px-2">
              Quick Actions
            </span>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('chat');
                  onClose();
                }}
                className="p-2 rounded-xl hover:bg-[var(--bg-surface)] text-left flex items-center gap-2 text-[var(--text-secondary)]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                <span>AI Chat</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('templates');
                  onClose();
                }}
                className="p-2 rounded-xl hover:bg-[var(--bg-surface)] text-left flex items-center gap-2 text-[var(--text-secondary)]"
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-indigo-500" />
                <span>Templates</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('documents');
                  onClose();
                }}
                className="p-2 rounded-xl hover:bg-[var(--bg-surface)] text-left flex items-center gap-2 text-[var(--text-secondary)]"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Documents</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTab('history');
                  onClose();
                }}
                className="p-2 rounded-xl hover:bg-[var(--bg-surface)] text-left flex items-center gap-2 text-[var(--text-secondary)]"
              >
                <History className="w-3.5 h-3.5 text-amber-500" />
                <span>History</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
