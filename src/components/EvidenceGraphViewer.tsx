import React, { useState } from 'react';
import {
  GitBranch,
  Filter,
  Info,
  Maximize2,
  X,
  FileText,
  HelpCircle,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { EvidenceGraphData, GraphNode } from '../types';

interface EvidenceGraphViewerProps {
  graph: EvidenceGraphData;
}

export const EvidenceGraphViewer: React.FC<EvidenceGraphViewerProps> = ({ graph }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="bg-[#12151e] border border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500 font-mono">
        Evidence graph will be dynamically constructed upon investigation.
      </div>
    );
  }

  const filteredNodes = filterType === 'all'
    ? graph.nodes
    : graph.nodes.filter((n) => n.type === filterType);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'source':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'evidence':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'entity':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'reasoning':
        return 'bg-violet-500/10 text-violet-300 border-violet-500/30';
      case 'conclusion':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800/40 text-slate-300 border-slate-700';
    }
  };

  const getNodeBadge = (type: string) => {
    switch (type) {
      case 'source':
        return 'SOURCE FILE';
      case 'evidence':
        return 'FACTUAL EVIDENCE';
      case 'entity':
        return 'ENTITY';
      case 'reasoning':
        return 'REASONING';
      case 'conclusion':
        return 'CONCLUSION';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="bg-[#0f1118] border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            EVIDENCE GRAPH
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {graph.nodes.length} Nodes • {graph.edges.length} Edges
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {['all', 'source', 'evidence', 'entity', 'reasoning', 'conclusion'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-0.5 rounded text-[11px] border capitalize transition-all ${
                filterType === t
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Node Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {filteredNodes.map((node) => (
          <div
            key={node.id}
            onClick={() => setSelectedNode(node)}
            className={`p-2.5 rounded-lg border cursor-pointer transition-all hover:border-slate-600 flex flex-col justify-between ${getNodeColor(
              node.type
            )}`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/40">
                  {getNodeBadge(node.type)}
                </span>
                <span className="text-[9px] font-mono text-slate-400">{node.id.slice(0, 10)}</span>
              </div>
              <p className="text-xs font-medium text-slate-200 line-clamp-2">
                {node.label}
              </p>
            </div>

            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10 text-[10px] font-mono">
              <span className="text-slate-400 truncate max-w-[160px]">
                {node.data?.location || node.data?.sourceFileName || node.data?.operation || 'Node'}
              </span>
              <span className="text-indigo-400 hover:underline shrink-0">Inspect →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="mt-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800 animate-in fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-mono uppercase font-bold text-slate-200">
                Node Details: {selectedNode.type.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-100 font-medium">{selectedNode.label}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/60 p-2 rounded border border-slate-800">
              {Object.entries(selectedNode.data || {}).map(([key, value]) => (
                <div key={key} className="truncate">
                  <span className="text-slate-500 capitalize">{key}: </span>
                  <span className="text-slate-300">{String(value)}</span>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-mono text-slate-400 pt-1">
              <span className="text-indigo-400 font-semibold">Graph Links: </span>
              {graph.edges
                .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                .map((e) => `${e.relationshipType} (${e.label || ''})`)
                .join(' • ') || 'Root link'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
