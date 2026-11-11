import React, { useState } from 'react';
import { X, Upload, FileText, Table as TableIcon, Image as ImageIcon, Plus } from 'lucide-react';
import { SourceType } from '../types';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSource: (source: { fileName: string; type: SourceType; content: string; description?: string }) => void;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  onClose,
  onAddSource,
}) => {
  const [fileName, setFileName] = useState('');
  const [type, setType] = useState<SourceType>('pdf');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !content.trim()) return;

    onAddSource({
      fileName: fileName.trim(),
      type,
      content: content.trim(),
      description: description.trim() || undefined,
    });

    setFileName('');
    setContent('');
    setDescription('');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    if (file.name.endsWith('.csv')) setType('csv');
    else if (file.name.endsWith('.pdf') || file.name.endsWith('.txt')) setType('pdf');
    else if (file.name.match(/\.(png|jpg|jpeg|svg|webp)$/i)) setType('image');

    const reader = new FileReader();
    if (file.type.startsWith('image/')) {
      reader.onload = (event) => {
        setContent(String(event.target?.result || ''));
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (event) => {
        setContent(String(event.target?.result || ''));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-[#12151e] border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">
              Paste or Add Evidence Source
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* File input / picker */}
          <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-center">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.txt,.csv,.json,.png,.jpg,.jpeg,.svg"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2 text-slate-300 hover:text-purple-300 transition-colors"
            >
              <Upload className="w-6 h-6 text-purple-400" />
              <span className="font-medium">Upload File (PDF text, CSV, or Image)</span>
              <span className="text-[10px] text-slate-500 font-mono">or paste contents directly below</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono mb-1">File Name</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. operations_report.pdf or metrics.csv"
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Modality Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SourceType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-purple-500 font-mono"
              >
                <option value="pdf">PDF / Text Document</option>
                <option value="csv">CSV / Tabular Ledger</option>
                <option value="chart">Chart / Graph Telemetry</option>
                <option value="image">Image Artifact</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Source Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Q4 Regional Operations & Audit Logs"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono mb-1">Content (Raw Text, CSV rows, or Base64)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw text, CSV rows, or base64 image data here..."
              rows={6}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              Add Source
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
