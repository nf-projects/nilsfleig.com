'use client';

import React, { useEffect } from 'react';
import { TeachingCard as TeachingCardType } from '../types';

interface TeachingCardProps {
  card: TeachingCardType;
  onContinue: () => void;
}

export function TeachingCard({ card, onContinue }: TeachingCardProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onContinue]);
  const { word } = card;
  const primaryDef = word.definitions[0];

  return (
    <div
      className="flex min-h-screen cursor-pointer flex-col px-6 py-12"
      onClick={onContinue}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium uppercase tracking-wider text-blue-400">
          New Word
        </span>
      </div>

      {/* Word display */}
      <div className="flex flex-1 flex-col items-center">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-light tracking-tight">{word.word}</h2>
          <div className="mt-3 flex items-center justify-center gap-3 text-gray-500">
            {word.ipa && <span className="text-lg">{word.ipa}</span>}
            {word.pos.length > 0 && (
              <>
                <span className="text-gray-700">·</span>
                <span className="text-sm">{word.pos.join(', ')}</span>
              </>
            )}
          </div>
        </div>

        {/* Definition */}
        <div className="mb-8 max-w-md">
          <div className="rounded-lg bg-gray-900/50 p-6">
            <p className="text-lg leading-relaxed text-gray-200">
              {primaryDef?.def || 'Definition not available'}
            </p>
            {primaryDef?.examples && primaryDef.examples.length > 0 && (
              <p className="mt-4 text-sm italic text-gray-500">
                &ldquo;{primaryDef.examples[0]}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Additional definitions */}
        {word.definitions.length > 1 && (
          <div className="mb-8 max-w-md">
            <p className="mb-2 text-xs uppercase tracking-wider text-gray-600">
              Also
            </p>
            <div className="space-y-2">
              {word.definitions.slice(1, 3).map((def, i) => (
                <div key={i} className="text-sm text-gray-400">
                  <span className="text-gray-600">({def.pos})</span> {def.def}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Example sentences */}
        {word.sentences.length > 0 && (
          <div className="max-w-md">
            <p className="mb-3 text-xs uppercase tracking-wider text-gray-600">
              Examples
            </p>
            <div className="space-y-3">
              {word.sentences.slice(0, 2).map((sentence, i) => (
                <p key={i} className="text-sm leading-relaxed text-gray-400">
                  {highlightWord(sentence, word.word)}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Continue prompt */}
      <div className="pb-8 text-center">
        <p className="text-sm text-gray-600">
          Tap anywhere or press <span className="text-gray-400">Space</span> to
          continue
        </p>
      </div>
    </div>
  );
}

function highlightWord(sentence: string, word: string): React.ReactNode {
  const regex = new RegExp(`\\b(${word}\\w*)\\b`, 'gi');
  const parts = sentence.split(regex);

  return parts.map((part, i) => {
    if (part.toLowerCase().startsWith(word.toLowerCase())) {
      return (
        <span key={i} className="font-medium text-white">
          {part}
        </span>
      );
    }
    return part;
  });
}
