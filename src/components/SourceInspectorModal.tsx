import React from 'react';
import { X, FileText, Table as TableIcon, Image as ImageIcon, Eye, Download } from 'lucide-react';
import { Source } from '../types';

interface SourceInspectorModalProps {
  source: Source | null;
  onClose: () => void;
}

export const SourceInspectorModal: React.FC<SourceInspectorModalProps> = ({
  source,
  onClose,
}) => {
  if (!source) return null;

  const renderContent = () => {
    if (source.type === 'csv' || source.type === 'excel') {
      const lines = (source.content || '').trim().split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map((h) => h.trim());
        const rows = lines.slice(1).map((l) => l.split(',').map((c) => c.trim()));

        return (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-purple-300">
                <tr>
                  <th className="py-2.5 px-3 text-[10px] text-slate-500 uppercase">#</th>
                  {headers.map((h, idx) => (
                    <th key={idx} className="py-2.5 px-3 whitespace-nowrap font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-purple-950/20 transition-colors">
                    <td className="py-2 px-3 text-[10px] text-slate-500 font-mono">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2 px-3 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    if (source.type === 'chart' || source.type === 'image') {
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            {source.content?.startsWith('data:image') ? (
              <img
                src={source.content}
                alt={source.fileName}
                className="max-h-72 mx-auto rounded-lg border border-slate-800 object-contain shadow-lg"
              />
            ) : (
              <div className="p-8 text-purple-400 font-mono text-xs">
                Visual telemetry vector artifact: {source.fileName}
              </div>
            )}
          </div>

          {source.metadata?.visualPoints && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-mono font-bold text-purple-300 mb-2 uppercase">
                Extracted Visual Feature Points
              </h4>
              <div className="space-y-2 text-xs">
                {source.metadata.visualPoints.map((pt: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 font-mono">
                    <span className="text-purple-400 font-semibold">{pt.entity}: </span>
                    <span className="text-slate-200">{pt.label} ({pt.value}) </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Region: {pt.region}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default: PDF / Text document
    return (
      <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
        {source.content}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-[#12151e] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
                {source.fileName}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase">
                Type: {source.type} • Uploaded: {new Date(source.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {renderContent()}
        </div>

        <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
          <span>{source.description || 'Verified evidence source in active workspace'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-sans text-xs font-medium"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
