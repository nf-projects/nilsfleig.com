'use client';

import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
  onReset: () => void;
  stats?: {
    totalKnown: number;
    totalLearning: number;
    averageAccuracy: number;
  };
}

export function WelcomeScreen({ onStart, onReset, stats }: WelcomeScreenProps) {
  const isReturningUser = stats && stats.totalKnown > 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-light tracking-tight">Vocabulary</h1>

        <p className="mb-8 text-lg text-gray-400">
          {isReturningUser
            ? 'Continue building your vocabulary'
            : 'Learn words through adaptive spaced repetition'}
        </p>

        {isReturningUser && stats && (
          <div className="mb-8 grid grid-cols-3 gap-4 rounded-lg bg-gray-900/50 p-4">
            <div>
              <div className="text-2xl font-medium">{stats.totalKnown}</div>
              <div className="text-xs text-gray-500">Known</div>
            </div>
            <div>
              <div className="text-2xl font-medium">{stats.totalLearning}</div>
              <div className="text-xs text-gray-500">Learning</div>
            </div>
            <div>
              <div className="text-2xl font-medium">
                {Math.round(stats.averageAccuracy * 100)}%
              </div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
          </div>
        )}

        <button
          onClick={onStart}
          className="w-full rounded-lg bg-white px-8 py-4 text-lg font-medium text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isReturningUser ? 'Continue Learning' : 'Start Learning'}
        </button>

        <button
          onClick={onReset}
          className="mt-4 w-full rounded-lg border border-gray-700 px-8 py-3 text-sm text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-300"
        >
          Reset Progress
        </button>

        {!isReturningUser && (
          <p className="mt-6 text-sm text-gray-500">
            The system adapts to your level automatically.
            <br />
            No signup required.
          </p>
        )}
      </div>
    </div>
  );
}
