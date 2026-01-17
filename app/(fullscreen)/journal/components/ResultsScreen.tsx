import React, { useEffect, useState } from 'react';
import { AnalysisResult, AppState } from '../types';
import { analyzeJournalEntry } from '../services/geminiService';
import { Button } from './Button';
import { Sparkles, RefreshCcw, Download, Copy, Check } from 'lucide-react';

interface ResultsScreenProps {
  state: AppState;
  text: string;
  onRetry: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ state, text, onRetry }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state === AppState.COMPLETED && text.length > 50) {
      setLoading(true);
      analyzeJournalEntry(text)
        .then(setAnalysis)
        .finally(() => setLoading(false));
    }
  }, [state, text]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    const date = new Date().toISOString().slice(0, 10);
    element.download = `write-${date}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (state === AppState.FAILED) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 animate-fade-in text-center">
        <h1 className="font-serif text-4xl md:text-6xl mb-6 text-gray-400">The thought is lost.</h1>
        <p className="font-sans text-gray-600 mb-12 max-w-md">
          Momentum is everything. You stopped for too long, and the stream dried up.
        </p>
        <Button onClick={onRetry} variant="secondary" className="border-gray-600 text-gray-300 hover:bg-gray-900">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-gray-200 pb-6 gap-6">
          <h1 className="font-serif text-4xl text-ink">Session Complete</h1>
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCopy} variant="secondary" className="text-sm px-4 py-2 flex items-center" title="Copy to clipboard">
              {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            
            <Button onClick={handleDownload} variant="secondary" className="text-sm px-4 py-2 flex items-center" title="Download text file">
              <Download className="w-4 h-4 mr-2" /> Save .txt
            </Button>

            <Button onClick={onRetry} variant="primary" className="text-sm px-4 py-2 flex items-center ml-2">
              <RefreshCcw className="w-4 h-4 mr-2" /> New Session
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Text Content */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-sans text-xs uppercase tracking-widest text-gray-400">Your Entry</h2>
            <div className="prose prose-lg font-serif text-gray-800 leading-relaxed whitespace-pre-wrap bg-white p-8 rounded-sm shadow-sm border border-gray-100">
              {text}
            </div>
          </div>

          {/* AI Analysis Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <h2 className="font-sans text-xs uppercase tracking-widest text-gray-400 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
              Insight
            </h2>

            {loading ? (
              <div className="flex flex-col space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-100 rounded-lg"></div>
              </div>
            ) : analysis ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div>
                  <h3 className="font-serif text-xl italic mb-2 text-ink">&ldquo;{analysis.mood}&rdquo;</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{analysis.summary}</p>
                </div>
                
                <div>
                  <h4 className="font-sans text-xs font-bold text-gray-400 uppercase mb-3">Recurring Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.themes.map((theme, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-100">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Write more to unlock analysis.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
