import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Sun,
  Moon,
  Database,
  Cpu,
  ShieldCheck,
  Save,
  CheckCircle2,
  HardDrive,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userName: string;
  setUserName: (name: string) => void;
  dbMode: 'mongodb' | 'memory_fallback';
  dbConnected: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  userName,
  setUserName,
  dbMode,
  dbConnected,
}) => {
  const [localName, setLocalName] = useState(userName);
  const [role, setRole] = useState('Senior Research Analyst');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setLocalName(userName);
  }, [userName]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setUserName(localName);
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: localName, role, theme }),
      });
    } catch {
      // Ignored
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-primary)] font-['Plus_Jakarta_Sans']">
                System Preferences & Settings
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Manage profile identity, theme appearance, and database configuration.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-5 text-xs text-[var(--text-primary)]">
          {/* User Profile */}
          <div className="space-y-3">
            <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[10px] font-mono">
              User Profile
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[var(--text-muted)] mb-1">Role / Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Theme Mode Toggle */}
          <div className="space-y-3">
            <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[10px] font-mono">
              Appearance Theme
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') onToggleTheme();
                }}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 font-bold shadow-xs'
                    : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <div className="text-left">
                  <div className="text-xs">Light Mode</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Clean, high-contrast</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') onToggleTheme();
                }}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold shadow-xs'
                    : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <div className="text-xs">Dark Mode</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Deep navy focus</div>
                </div>
              </button>
            </div>
          </div>

          {/* Full-Stack Architecture Status */}
          <div className="space-y-3">
            <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[10px] font-mono">
              Backend & Database Architecture
            </span>
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-xs text-[var(--text-primary)]">
                    Database Engine
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {dbMode === 'mongodb' ? 'MongoDB Atlas' : 'Resilient In-Memory'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-xs text-[var(--text-primary)]">
                    AI Reasoning Engine
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  Gemini Flash Grounded RAG
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-xs text-[var(--text-primary)]">
                    Evidence Verification
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Strict Match Enforced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-secondary)] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
