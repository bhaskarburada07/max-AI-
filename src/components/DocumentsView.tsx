import React from 'react';
import {
  FileText,
  Table as TableIcon,
  Image as ImageIcon,
  FileCode,
  UploadCloud,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Search,
} from 'lucide-react';
import { Source } from '../types';

interface DocumentsViewProps {
  sources: Source[];
  onOpenUpload: () => void;
  onRemoveSource: (id: string) => void;
  onInspectSource: (source: Source) => void;
  onAskAboutDocument: (source: Source) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  sources,
  onOpenUpload,
  onRemoveSource,
  onInspectSource,
  onAskAboutDocument,
}) => {
  const [filter, setFilter] = React.useState('');

  const filtered = sources.filter((s) =>
    s.fileName.toLowerCase().includes(filter.toLowerCase())
  );

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-400" />;
      case 'csv':
      case 'excel':
        return <TableIcon className="w-5 h-5 text-emerald-400" />;
      case 'image':
      case 'chart':
        return <ImageIcon className="w-5 h-5 text-indigo-400" />;
      default:
        return <FileCode className="w-5 h-5 text-slate-400" />;
    }
  };

  function formatBytes(bytes?: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-['Plus_Jakarta_Sans'] tracking-tight">
            Document Intelligence ({sources.length})
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Manage your verified evidence sources, inspect text extractions, and launch questions.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Files</span>
        </button>
      </div>

      {/* Filter and Search */}
      {sources.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter documents..."
            className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-xs rounded-xl pl-9 pr-4 py-2 border border-[var(--border-color)] focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* Empty State */}
      {sources.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--text-primary)]">No documents uploaded yet</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-1">
              Upload PDFs, CSVs, Excel files, or images to begin querying your data with verified evidence.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenUpload}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Select Documents</span>
          </button>
        </div>
      ) : (
        /* Document Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((src) => {
            const isReady = src.status === 'READY';
            const isError = src.status === 'ERROR';
            const isWorking = src.status === 'UPLOADING' || src.status === 'PROCESSING';

            return (
              <div
                key={src.id}
                className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center shrink-0 mt-0.5">
                      {getSourceIcon(src.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--text-primary)] truncate max-w-[200px] sm:max-w-[260px]">
                        {src.fileName}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                        {formatBytes(src.fileSize)} • {src.type.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isReady && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                    {isWorking && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Processing</span>
                      </span>
                    )}
                    {isError && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Error</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Document Metadata Details */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-[var(--bg-surface)] text-[11px] font-mono text-[var(--text-secondary)]">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px]">Pages</span>
                    <span className="font-bold text-[var(--text-primary)]">{src.pageCount || 1}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px]">Characters</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {(src.characterCount || src.content?.length || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px]">OCR</span>
                    <span className="font-bold text-[var(--text-primary)]">{src.ocrUsed ? 'YES' : 'NO'}</span>
                  </div>
                </div>

                {/* Suggestions pill preview if available */}
                {src.generatedSuggestions && src.generatedSuggestions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Suggested Questions
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {src.generatedSuggestions.slice(0, 2).map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => onAskAboutDocument(src)}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-[var(--bg-surface)] hover:bg-indigo-500/10 text-[var(--text-secondary)] hover:text-indigo-400 border border-[var(--border-color)] truncate max-w-full text-left transition-colors"
                        >
                          "{sug}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => onInspectSource(src)}
                    className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Inspect Text</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onAskAboutDocument(src)}
                      className="px-3 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-colors"
                    >
                      Ask Question
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveSource(src.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
