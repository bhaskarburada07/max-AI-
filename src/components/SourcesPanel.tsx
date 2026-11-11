import React from 'react';
import {
  FileText,
  Table as TableIcon,
  Image as ImageIcon,
  Activity,
  Plus,
  Eye,
  FileCheck,
  Upload,
} from 'lucide-react';
import { Source } from '../types';

interface SourcesPanelProps {
  sources: Source[];
  onInspectSource: (source: Source) => void;
  onOpenAddModal: () => void;
  isInvestigating: boolean;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({
  sources,
  onInspectSource,
  onOpenAddModal,
  isInvestigating,
}) => {
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
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
      default:
        return <Activity className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getSourceBadgeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'csv':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'chart':
      case 'image':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="bg-[#10121c] border border-slate-800/80 rounded-2xl p-4 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            EVIDENCE REPOSITORY
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {sources.length} sources
          </span>
        </div>
        <button
          onClick={onOpenAddModal}
          disabled={isInvestigating}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Source</span>
        </button>
      </div>

      {/* Sources List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
        {sources.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No sources uploaded. Click Add Source or Reset Demo.
          </div>
        ) : (
          sources.map((s) => (
            <div
              key={s.id}
              className="group p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-purple-500/40 transition-all flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 shrink-0">
                    {getSourceIcon(s.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-purple-300 transition-colors">
                      {s.fileName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {s.description || 'Uploaded evidence artifact'}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase shrink-0 ${getSourceBadgeColor(
                    s.type
                  )}`}
                >
                  {s.type}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/50 text-[10px] text-slate-500 font-mono">
                <span>
                  {s.fileSize ? `${Math.round(s.fileSize / 1024)} KB` : 'Verified'}
                </span>
                <button
                  onClick={() => onInspectSource(s)}
                  className="flex items-center gap-1 text-slate-400 hover:text-purple-300 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  <span>Inspect Data</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono">
          <Upload className="w-3 h-3 text-slate-400" />
          Heterogeneous inputs ready
        </span>
        <span className="text-[10px] font-mono text-purple-400">PDF • CSV • Vision</span>
      </div>
    </div>
  );
};
