import React from 'react';
import {
  FolderKanban,
  Plus,
  MoreHorizontal,
  FileText,
  Clock,
  Trash2,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  lastActive: string;
  docCount: number;
  isSelected?: boolean;
}

interface ProjectsSidebarProps {
  projects: ProjectItem[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject?: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickPrompt?: () => void;
}

export const ProjectsSidebar: React.FC<ProjectsSidebarProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  isOpen,
  onClose,
  onOpenQuickPrompt,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-72 shrink-0 border-l border-[var(--border-color)] bg-[var(--bg-secondary)] h-screen sticky top-0 flex flex-col justify-between p-4 z-20 select-none transition-all">
      {/* Top Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[var(--text-primary)] font-['Plus_Jakarta_Sans']">
              Projects
            </h2>
            <span className="text-xs font-mono text-[var(--text-muted)] font-medium">
              ({projects.length})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              title="Project Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors lg:hidden"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Project Button Card matching screenshot */}
        <button
          type="button"
          onClick={onNewProject}
          className="w-full flex items-center justify-between p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-blue-500/40 hover:bg-[var(--bg-surface)] text-left transition-all shadow-xs group"
        >
          <div>
            <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              New Project
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Start a new investigation thread
            </p>
          </div>
          <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
        </button>

        {/* Project List matching screenshot cards */}
        <div className="space-y-2 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
          {projects.length === 0 ? (
            <div className="p-6 text-center rounded-2xl border border-dashed border-[var(--border-color)] text-xs text-[var(--text-muted)]">
              <FolderKanban className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <span>No projects created yet.</span>
            </div>
          ) : (
            projects.map((proj) => {
              const isSelected = proj.id === selectedProjectId;
              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all relative group flex flex-col justify-between space-y-1.5 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 shadow-xs'
                      : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-blue-400/40 hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-xs text-[var(--text-primary)] line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {proj.title}
                    </h3>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {proj.lastActive}
                    </span>

                    {onDeleteProject && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(proj.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all rounded"
                        title="Delete project"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Action Button (matching the blue/purple circle icon in screenshot) */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onOpenQuickPrompt}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
          title="Instant AI Prompt"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
        </button>
      </div>
    </aside>
  );
};
