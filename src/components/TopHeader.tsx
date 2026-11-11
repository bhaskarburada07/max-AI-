import React from 'react';
import {
  Sparkles,
  HelpCircle,
  Gift,
  PanelRight,
  PanelRightClose,
  Menu,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { MainNavTab } from './Sidebar';

interface TopHeaderProps {
  activeTab: MainNavTab;
  onOpenHelp: () => void;
  onOpenUpgrade: () => void;
  onOpenPresets: () => void;
  onToggleLeftSidebar: () => void;
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
  documentCount: number;
  userName: string;
}

export function getLocalGreeting(): { greeting: string; period: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good morning 👋', period: 'Morning' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good afternoon 👋', period: 'Afternoon' };
  } else if (hour >= 17 && hour < 22) {
    return { greeting: 'Good evening 👋', period: 'Evening' };
  } else {
    return { greeting: 'Good night 👋', period: 'Night' };
  }
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenHelp,
  onOpenUpgrade,
  onOpenPresets,
  onToggleLeftSidebar,
  isRightSidebarOpen,
  onToggleRightSidebar,
  documentCount,
  userName,
}) => {
  const getTabTitle = (tab: MainNavTab) => {
    switch (tab) {
      case 'chat':
        return 'AI Chat';
      case 'projects':
        return 'Projects';
      case 'templates':
        return 'Templates';
      case 'documents':
        return 'Documents & Evidence';
      case 'history':
        return 'Research History';
      case 'settings':
        return 'Settings & System Preferences';
      case 'help':
        return 'Help & Documentation';
      default:
        return 'MAX AI';
    }
  };

  return (
    <header className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 select-none transition-colors">
      {/* Left zone: Mobile menu & Page Title matching screenshot */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleLeftSidebar}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] lg:hidden transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <h1 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] font-['Plus_Jakarta_Sans'] tracking-tight">
          {getTabTitle(activeTab)}
        </h1>

        {documentCount > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold font-mono border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            <span>{documentCount} verified {documentCount === 1 ? 'doc' : 'docs'}</span>
          </span>
        )}
      </div>

      {/* Right zone: Upgrade button, Help icon, Gift/Presets, Right sidebar toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Upgrade pill button matching screenshot */}
        <button
          type="button"
          onClick={onOpenUpgrade}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" />
          <span>Upgrade</span>
        </button>

        {/* Help icon button matching screenshot */}
        <button
          type="button"
          onClick={onOpenHelp}
          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-color)] transition-colors"
          title="Help & Support"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Gift / Presets icon button matching screenshot */}
        <button
          type="button"
          onClick={onOpenPresets}
          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-color)] transition-colors"
          title="Try Sample Datasets"
        >
          <Gift className="w-4 h-4 text-indigo-500" />
        </button>

        {/* Toggle Right Projects Sidebar button */}
        <button
          type="button"
          onClick={onToggleRightSidebar}
          className={`p-2 rounded-xl border transition-colors ${
            isRightSidebarOpen
              ? 'text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] border-[var(--border-color)] bg-[var(--bg-surface)]'
          }`}
          title={isRightSidebarOpen ? 'Hide Projects panel' : 'Show Projects panel'}
        >
          {isRightSidebarOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRight className="w-4 h-4" />
          )}
        </button>

        {/* User Status Avatar Pill */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
          {userName.slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
