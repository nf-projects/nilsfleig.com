'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { QuizCard as QuizCardType } from '../types';

type Response = 'know' | 'not-sure' | 'dont-know';

interface QuizCardProps {
  card: QuizCardType;
  onAnswer: (correct: boolean, responseTime: number) => void;
}

export function QuizCard({ card, onAnswer }: QuizCardProps) {
  const [response, setResponse] = useState<Response | null>(null);
  const [responseTime, setResponseTime] = useState(0);
  const [startTime] = useState(Date.now());

  const handleResponse = useCallback(
    (r: Response) => {
      if (response !== null) return;

      const responseTime = Date.now() - startTime;
      setResponse(r);
      setResponseTime(responseTime);
    },
    [response, startTime]
  );

  const handleContinue = useCallback(() => {
    if (response === null) return;

    // Map response to correct/incorrect for algorithm
    // "know" = correct, "not-sure" and "dont-know" = incorrect
    const correct = response === 'know';
    onAnswer(correct, responseTime);
  }, [response, responseTime, onAnswer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If already responded, any key continues
      if (response !== null) {
        handleContinue();
        return;
      }

      switch (e.key.toLowerCase()) {
        case '1':
        case 'j':
          handleResponse('know');
          break;
        case '2':
        case 'k':
          handleResponse('not-sure');
          break;
        case '3':
        case 'l':
          handleResponse('dont-know');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [response, handleResponse, handleContinue]);

  const cardTypeLabel = {
    probe: 'ASSESSMENT',
    review: 'REVIEW',
    reinforcement: 'PRACTICE',
  }[card.cardType];

  const primaryDef = card.word.definitions[0];

  return (
    <div
      className="flex min-h-screen flex-col px-6 py-12"
      onClick={response !== null ? handleContinue : undefined}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {cardTypeLabel}
        </span>
      </div>

      {/* Word display */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <h2 className="text-5xl font-light tracking-tight">{card.word.word}</h2>
          {card.word.ipa && (
            <p className="mt-3 text-xl text-gray-500">{card.word.ipa}</p>
          )}
          {card.word.pos.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {card.word.pos.join(', ')}
            </p>
          )}
        </div>

        {/* Definition (shown after response) */}
        {response !== null && (
          <div className="mb-8 max-w-md animate-fade-in">
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
        )}
      </div>

      {/* Response buttons */}
      {response === null ? (
        <div className="space-y-3 pb-8">
          <div className="mb-4 text-center text-xs text-gray-600">
            Do you know this word?
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleResponse('know')}
              className="flex flex-col items-center rounded-lg border border-green-800 bg-green-900/20 p-4 transition-all hover:bg-green-900/40 active:scale-95"
            >
              <span className="text-lg font-medium text-green-400">Know</span>
              <span className="mt-1 text-xs text-gray-500">J or 1</span>
            </button>
            <button
              onClick={() => handleResponse('not-sure')}
              className="flex flex-col items-center rounded-lg border border-yellow-800 bg-yellow-900/20 p-4 transition-all hover:bg-yellow-900/40 active:scale-95"
            >
              <span className="text-lg font-medium text-yellow-400">
                Not Sure
              </span>
              <span className="mt-1 text-xs text-gray-500">K or 2</span>
            </button>
            <button
              onClick={() => handleResponse('dont-know')}
              className="flex flex-col items-center rounded-lg border border-red-800 bg-red-900/20 p-4 transition-all hover:bg-red-900/40 active:scale-95"
            >
              <span className="text-lg font-medium text-red-400">
                Don&apos;t Know
              </span>
              <span className="mt-1 text-xs text-gray-500">L or 3</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className="cursor-pointer pb-8 text-center"
          onClick={handleContinue}
        >
          <div
            className={`mb-4 inline-block rounded-full px-6 py-2 text-sm font-medium ${
              response === 'know'
                ? 'bg-green-500/20 text-green-400'
                : response === 'not-sure'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
            }`}
          >
            {response === 'know'
              ? 'Marked as known'
              : response === 'not-sure'
                ? 'Marked for review'
                : 'Will teach this word'}
          </div>
          <p className="text-sm text-gray-600">
            Press any key or tap to continue
          </p>
        </div>
      )}
    </div>
  );
}
