import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import {
  Plus,
  Send,
  Loader2,
  X,
  FileText,
  Table as TableIcon,
  Image as ImageIcon,
  FileCode,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Source } from '../types';

export interface ChatInputAreaHandle {
  openFilePicker: () => void;
}

interface ChatInputAreaProps {
  question: string;
  setQuestion: (q: string) => void;
  onInvestigate: () => void;
  isInvestigating: boolean;
  sources: Source[];
  onRemoveSource: (id: string) => void;
  onClearAllSources: () => void;
  onAddFiles: (files: File[]) => void;
  onRetrySource?: (source: Source) => void;
  suggestions: string[];
  onSelectSuggestion: (q: string) => void;
}

export const ChatInputArea = forwardRef<ChatInputAreaHandle, ChatInputAreaProps>(
  (
    {
      question,
      setQuestion,
      onInvestigate,
      isInvestigating,
      sources,
      onRemoveSource,
      onClearAllSources,
      onAddFiles,
      onRetrySource,
      suggestions,
      onSelectSuggestion,
    },
    ref
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = React.useState(false);

    // Expose openFilePicker to parent component
    useImperativeHandle(ref, () => ({
      openFilePicker: () => {
        fileInputRef.current?.click();
      },
    }));

    const handlePlusClick = () => {
      fileInputRef.current?.click();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onAddFiles(Array.from(e.target.files));
        // Reset input value so re-selecting the exact same file fires onChange reliably
        e.target.value = '';
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onAddFiles(Array.from(e.dataTransfer.files));
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isInvestigating && question.trim().length > 0) {
          onInvestigate();
        }
      }
    };

    const getSourceIcon = (type: string) => {
      switch (type) {
        case 'pdf':
          return <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
        case 'csv':
        case 'excel':
          return <TableIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
        case 'image':
        case 'chart':
          return <ImageIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
        default:
          return <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
      }
    };

    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Container with drag & drop support */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl bg-[#141722] border transition-all ${
            isDragOver
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-950/20'
              : 'border-slate-800 focus-within:border-slate-700 shadow-xl'
          }`}
        >
          {/* Drag Overlay Banner */}
          {isDragOver && (
            <div className="absolute inset-0 z-20 rounded-2xl bg-[#141722]/90 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-indigo-400">
              <div className="flex items-center gap-2 text-indigo-300 font-medium text-sm">
                <UploadCloud className="w-5 h-5 animate-bounce" />
                <span>Drop files to add as evidence</span>
              </div>
            </div>
          )}

          {/* PERMANENTLY MOUNTED HIDDEN FILE INPUT */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.webp"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* 1. File State Chips (Live State Machine: UPLOADING | PROCESSING | READY | ERROR) */}
          {sources.length > 0 && (
            <div className="px-3.5 pt-3 pb-2 border-b border-slate-800/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-[85%] scrollbar-none">
                {sources.map((src) => {
                  const isReady = src.status === 'READY';
                  const isError = src.status === 'ERROR';
                  const isWorking = src.status === 'UPLOADING' || src.status === 'PROCESSING';

                  return (
                    <div
                      key={src.id}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all shrink-0 ${
                        isError
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                          : isReady
                          ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700'
                          : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200 animate-pulse'
                      }`}
                    >
                      {getSourceIcon(src.type)}

                      <div className="flex flex-col">
                        <span className="font-mono text-[11px] truncate max-w-[130px] sm:max-w-[180px] font-medium leading-tight">
                          {src.fileName}
                        </span>

                        {/* State Status Indicator */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 leading-tight">
                          {isWorking && (
                            <>
                              <Loader2 className="w-2.5 h-2.5 animate-spin text-indigo-400" />
                              <span>{src.statusMessage || (src.status === 'UPLOADING' ? 'Uploading...' : 'Processing...')}</span>
                            </>
                          )}
                          {isReady && (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                              <span className="text-emerald-400/90">
                                {src.pageCount ? `${src.pageCount} ${src.pageCount === 1 ? 'page' : 'pages'}` : 'Verified'}
                                {src.characterCount ? ` • ${src.characterCount.toLocaleString()} chars` : ''}
                                {src.ocrUsed ? ' • OCR' : ''}
                              </span>
                            </>
                          )}
                          {isError && (
                            <>
                              <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                              <span className="text-rose-400">{src.errorMessage || 'Could not read file'}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Retry Button on Error */}
                      {isError && onRetrySource && (
                        <button
                          type="button"
                          onClick={() => onRetrySource(src)}
                          className="p-1 rounded text-rose-300 hover:text-white hover:bg-rose-800/40 transition-colors ml-1"
                          title="Retry processing"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSource(src.id);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                        title={`Remove ${src.fileName}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Clear all files button */}
              {sources.length >= 2 && (
                <button
                  type="button"
                  onClick={onClearAllSources}
                  className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors shrink-0 whitespace-nowrap px-1 py-0.5 rounded hover:bg-slate-800"
                  title="Remove all sources"
                >
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* 2. Main Input Box (Native '+' trigger + Textarea + Investigate button) */}
          <div className="relative flex items-center gap-2 p-2.5 sm:p-3">
            {/* Reliable '+' Button that executes native file input click */}
            <button
              type="button"
              onClick={handlePlusClick}
              disabled={isInvestigating}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white transition-all shrink-0 active:scale-95"
              title="Add files (PDF, CSV, Images, TXT)"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Textarea Input */}
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isInvestigating}
              placeholder={
                sources.length > 0
                  ? "Ask anything about your uploaded sources..."
                  : "Add files (+) or ask any question to investigate..."
              }
              rows={1}
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none py-1.5 px-1 max-h-32 leading-relaxed font-sans"
            />

            {/* Investigate Button */}
            <button
              type="button"
              onClick={onInvestigate}
              disabled={isInvestigating || question.trim().length === 0}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                question.trim().length > 0 && !isInvestigating
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Run investigation"
            >
              {isInvestigating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Investigating...</span>
                </>
              ) : (
                <>
                  <span>Investigate</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. DYNAMIC DOCUMENT-GROUNDED SUGGESTIONS ONLY */}
        {suggestions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs justify-center sm:justify-start animate-in fade-in">
            <span className="text-[11px] text-indigo-400 font-mono flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Suggested questions:</span>
            </span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSuggestion(sug)}
                disabled={isInvestigating}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors text-left"
              >
                "{sug}"
              </button>
            ))}
          </div>
        ) : (
          sources.length === 0 && (
            <div className="mt-2 text-center sm:text-left">
              <span className="text-[11px] text-slate-500 font-mono">
                Add a file (+) to get document-specific suggestions
              </span>
            </div>
          )
        )}
      </div>
    );
  }
);
