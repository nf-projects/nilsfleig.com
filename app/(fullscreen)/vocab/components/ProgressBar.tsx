'use client';

import React from 'react';
import { SessionState } from '../types';

interface ProgressBarProps {
  session: SessionState;
  theta: number;
  onShowStats: () => void;
}

export function ProgressBar({ session, theta, onShowStats }: ProgressBarProps) {
  const accuracy =
    session.cardsShown > 0
      ? Math.round(
          (session.correctCount / (session.correctCount + session.incorrectCount || 1)) *
            100
        )
      : 0;

  // Convert theta (-3 to +3) to a readable level
  const getLevelLabel = (t: number): string => {
    if (t < -2) return 'Beginner';
    if (t < -1) return 'Elementary';
    if (t < 0) return 'Intermediate';
    if (t < 1) return 'Upper-Int';
    if (t < 2) return 'Advanced';
    return 'Expert';
  };

  return (
    <div className="fixed left-0 right-0 top-0 z-10 bg-black/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Skill level */}
        <div className="text-sm">
          <span className="text-gray-500">Level:</span>{' '}
          <span className="font-medium text-purple-400">
            {getLevelLabel(theta)}
          </span>
          <span className="ml-1 text-xs text-gray-600">
            ({(theta * 10).toFixed(1)})
          </span>
        </div>

        {/* Center: Accuracy */}
        <button
          onClick={onShowStats}
          className="flex items-center gap-2 rounded-full bg-gray-900/50 px-3 py-1"
        >
          <span className="text-sm text-gray-400">
            {session.correctCount}/{session.correctCount + session.incorrectCount}
          </span>
          <span
            className={`text-sm font-medium ${
              accuracy >= 80
                ? 'text-green-400'
                : accuracy >= 60
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }`}
          >
            {accuracy}%
          </span>
        </button>

        {/* Right: Card count */}
        <div className="text-sm text-gray-400">
          <span className="font-medium text-white">{session.cardsShown}</span>{' '}
          cards
        </div>
      </div>
    </div>
  );
}
