import React from 'react';
import { Search, Loader2, Sparkles, X, Terminal } from 'lucide-react';

interface QuestionInputProps {
  question: string;
  setQuestion: (q: string) => void;
  onInvestigate: () => void;
  isInvestigating: boolean;
  activeSourcesCount: number;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  setQuestion,
  onInvestigate,
  isInvestigating,
  activeSourcesCount,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isInvestigating && question.trim().length > 0) {
      onInvestigate();
    }
  };

  const sampleZeroShotQuestions = [
    'Which drone model generated the highest revenue in 2025, and did its flight hours exceed the previous generation?',
    'What was the total Q4 maintenance expenditure for the Falcon-X unit?',
    'Did the firmware v4.2 update improve battery efficiency during sub-zero operations?',
    'Exactly what time will the battery degradation reach critical failure on Falcon-X Unit #12 in November?',
  ];

  return (
    <div className="bg-[#10121c] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl mb-6">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="investigation-query"
          className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5"
        >
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          CrossMind Investigation Query
        </label>
        <span className="text-[11px] font-mono text-slate-500">
          Targeting {activeSourcesCount} active sources
        </span>
      </div>

      <div className="relative flex items-center mb-3">
        <div className="absolute left-3.5 text-purple-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          id="investigation-query"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask an unseen question across documents, tables, or charts..."
          disabled={isInvestigating}
          className="w-full pl-11 pr-28 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 text-sm font-medium transition-all outline-none"
        />

        {question && !isInvestigating && (
          <button
            onClick={() => setQuestion('')}
            className="absolute right-24 p-1 text-slate-400 hover:text-white"
            title="Clear query"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onInvestigate}
          disabled={isInvestigating || question.trim().length === 0}
          className="absolute right-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-1.5"
        >
          {isInvestigating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Investigate</span>
            </>
          )}
        </button>
      </div>

      {/* Suggested zero-shot queries */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] text-slate-500 font-mono">Zero-shot trials:</span>
        {sampleZeroShotQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setQuestion(q)}
            disabled={isInvestigating}
            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-purple-300 transition-colors truncate max-w-[280px] sm:max-w-md text-left"
            title={q}
          >
            "{q.length > 55 ? q.slice(0, 52) + '...' : q}"
          </button>
        ))}
      </div>
    </div>
  );
};
