import React from 'react';
import {
  MessageSquare,
  FolderKanban,
  LayoutTemplate,
  FileText,
  History,
  Settings,
  HelpCircle,
  Search,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

export type MainNavTab =
  | 'chat'
  | 'projects'
  | 'templates'
  | 'documents'
  | 'history'
  | 'settings'
  | 'help';

interface SidebarProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  documentCount: number;
  projectCount: number;
  onOpenUpload: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userName: string;
  userEmail?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSearch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  documentCount,
  projectCount,
  onOpenUpload,
  theme,
  onToggleTheme,
  userName,
  userEmail = 'bhaskarburada141@gmail.com',
  isCollapsed,
  onToggleCollapse,
  onOpenSearch,
}) => {
  return (
    <aside
      className={`h-screen sticky top-0 shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between select-none z-30 transition-all duration-200 ${
        isCollapsed ? 'w-16 p-2' : 'w-64 p-3.5'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col space-y-4">
        {/* Brand & Collapse Button */}
        <div className="flex items-center justify-between px-1.5 py-1">
          <div
            onClick={() => onSelectTab('chat')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* Dotted grid icon mark inspired by reference screenshot */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="grid grid-cols-2 gap-1 p-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)] font-['Plus_Jakarta_Sans']">
                  MAX AI
                </span>
                <span className="text-[9px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  v2.0
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Search Bar matching screenshot */}
        {!isCollapsed ? (
          <div
            onClick={onOpenSearch}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-blue-400/50 cursor-pointer transition-all shadow-xs"
          >
            <div className="flex items-center gap-2 text-xs">
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </div>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] shadow-2xs">
              ⌘ K
            </kbd>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Search (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Main Navigation List */}
        <nav className="space-y-1">
          {/* AI Chat (Primary) */}
          <button
            type="button"
            onClick={() => onSelectTab('chat')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
            title="AI Chat"
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>AI Chat</span>}
            </div>
          </button>

          {/* Projects */}
          <button
            type="button"
            onClick={() => onSelectTab('projects')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'projects'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
            title="Projects"
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Projects</span>}
            </div>
            {!isCollapsed && projectCount > 0 && (
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'projects'
                    ? 'bg-white/20 text-white'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                {projectCount}
              </span>
            )}
          </button>

          {/* Templates */}
          <button
            type="button"
            onClick={() => onSelectTab('templates')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
            title="Templates"
          >
            <div className="flex items-center gap-2.5">
              <LayoutTemplate className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Templates</span>}
            </div>
          </button>

          {/* Documents (with quick add "+" button as in screenshot) */}
          <div className="relative group/doc flex items-center">
            <button
              type="button"
              onClick={() => onSelectTab('documents')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'documents'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
              }`}
              title="Documents"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Documents</span>}
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-1.5">
                  {documentCount > 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        activeTab === 'documents'
                          ? 'bg-white/20 text-white'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {documentCount}
                    </span>
                  )}
                </div>
              )}
            </button>

            {!isCollapsed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenUpload();
                }}
                className={`absolute right-2 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${
                  activeTab === 'documents' ? 'text-white/80 hover:text-white' : ''
                }`}
                title="Upload Document"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Research History */}
          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
            title="Research History"
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Research History</span>}
            </div>
          </button>
        </nav>

        {/* Section: Settings & Help */}
        <div className="pt-2">
          {!isCollapsed && (
            <span className="block px-3 py-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono">
              Settings & Help
            </span>
          )}

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => onSelectTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('help')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'help'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
              }`}
              title="Help & Support"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Help & Support</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Section: Theme Toggle & User Profile (as shown in reference screenshot) */}
      <div className="space-y-3 pt-3 border-t border-[var(--border-color)]">
        {/* Segmented Light / Dark Toggle matching screenshot */}
        {!isCollapsed ? (
          <div className="p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] grid grid-cols-2 gap-1 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => {
                if (theme !== 'light') onToggleTheme();
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                theme === 'light'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (theme !== 'dark') onToggleTheme();
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-[#18202f] text-white font-bold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>
        )}

        {/* User Profile Card matching screenshot */}
        <div
          onClick={() => onSelectTab('settings')}
          className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[var(--bg-surface)] cursor-pointer transition-colors"
          title="Account Settings"
        >
          {/* User circular avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {userName.slice(0, 1).toUpperCase()}
          </div>

          {!isCollapsed && (
            <div className="truncate text-left leading-tight flex-1">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                {userName}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] truncate font-mono mt-0.5">
                {userEmail}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
