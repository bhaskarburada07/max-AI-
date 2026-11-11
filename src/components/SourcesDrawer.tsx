import React, { useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Eye,
  FileText,
  Table as TableIcon,
  Image as ImageIcon,
  FileCode,
  UploadCloud,
  RotateCcw,
} from 'lucide-react';
import { Source } from '../types';

interface SourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[];
  onRemoveSource: (id: string) => void;
  onClearAll: () => void;
  onInspectSource: (source: Source) => void;
  onAddFiles: (files: File[]) => void;
  onRestoreDemo: () => void;
  isInvestigating: boolean;
}

export const SourcesDrawer: React.FC<SourcesDrawerProps> = ({
  isOpen,
  onClose,
  sources,
  onRemoveSource,
  onClearAll,
  onInspectSource,
  onAddFiles,
  onRestoreDemo,
  isInvestigating,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'text':
        return <FileText className="w-4 h-4 text-rose-400" />;
      case 'csv':
      case 'excel':
        return <TableIcon className="w-4 h-4 text-emerald-400" />;
      case 'chart':
      case 'image':
        return <ImageIcon className="w-4 h-4 text-indigo-400" />;
      default:
        return <FileCode className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-[#12151e] border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
              Evidence Sources ({sources.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Active files in current investigation context
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar: Add files & Clear all */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.svg,.webp,.json"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isInvestigating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Files</span>
          </button>

          <div className="flex items-center gap-2">
            {sources.length > 0 && (
              <button
                onClick={onClearAll}
                disabled={isInvestigating}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs transition-colors border border-slate-800 disabled:opacity-50"
                title="Remove all sources from context"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}

            <button
              onClick={onRestoreDemo}
              disabled={isInvestigating}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors border border-slate-800 disabled:opacity-50"
              title="Load sample dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Demo</span>
            </button>
          </div>
        </div>

        {/* Sources List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {sources.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <UploadCloud className="w-8 h-8 text-slate-600 mx-auto" />
              <div>
                <p className="text-xs font-medium text-slate-300">No sources active</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click Add Files or drop files in the input box to begin.
                </p>
              </div>
              <button
                onClick={onRestoreDemo}
                className="text-xs text-indigo-400 hover:underline"
              >
                Load sample drone fleet files
              </button>
            </div>
          ) : (
            sources.map((src) => (
              <div
                key={src.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                    {getSourceIcon(src.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {src.fileName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate uppercase">
                      {src.type} {src.fileSize ? `• ${Math.round(src.fileSize / 1024)} KB` : ''}
                    </p>
                  </div>
                </div>

                {/* Inspect and Remove actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onInspectSource(src)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                    title="Inspect file contents"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveSource(src.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove from investigation context"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 text-center">
          Supported: PDF, CSV, Excel, TXT, PNG, JPG, SVG
        </div>
      </div>
    </div>
  );
};
