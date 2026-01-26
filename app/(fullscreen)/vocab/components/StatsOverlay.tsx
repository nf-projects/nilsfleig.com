'use client';

import React from 'react';
import { UserState, SessionState } from '../types';

interface StatsOverlayProps {
  userState: UserState;
  session: SessionState;
  onClose: () => void;
  onExport: () => void;
  onReset: () => void;
}

export function StatsOverlay({
  userState,
  session,
  onClose,
  onExport,
  onReset,
}: StatsOverlayProps) {
  const sessionAccuracy =
    session.correctCount + session.incorrectCount > 0
      ? Math.round(
          (session.correctCount /
            (session.correctCount + session.incorrectCount)) *
            100
        )
      : 0;

  const estimatedVocabSize = Math.round(
    Math.pow(10, ((userState.theta + 3) / 6) * Math.log10(20000))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex flex-1 flex-col overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-light">Statistics</h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 p-2 text-gray-400 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Session stats */}
        <div className="mb-8">
          <h3 className="mb-4 text-sm uppercase tracking-wider text-gray-500">
            This Session
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Cards" value={session.cardsShown} />
            <StatCard
              label="Accuracy"
              value={`${sessionAccuracy}%`}
              color={
                sessionAccuracy >= 80
                  ? 'green'
                  : sessionAccuracy >= 60
                    ? 'yellow'
                    : 'red'
              }
            />
            <StatCard
              label="Correct"
              value={session.correctCount}
              color="green"
            />
            <StatCard
              label="New Words"
              value={session.newWordsLearned}
              color="blue"
            />
          </div>
        </div>

        {/* Overall stats */}
        <div className="mb-8">
          <h3 className="mb-4 text-sm uppercase tracking-wider text-gray-500">
            Overall Progress
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Words Known" value={userState.totalKnown} />
            <StatCard label="Learning" value={userState.totalLearning} />
            <StatCard label="Total Seen" value={userState.totalSeen} />
            <StatCard
              label="Avg Accuracy"
              value={`${Math.round(userState.averageAccuracy * 100)}%`}
            />
          </div>
        </div>

        {/* Level indicator */}
        <div className="mb-8">
          <h3 className="mb-4 text-sm uppercase tracking-wider text-gray-500">
            Estimated Level
          </h3>
          <div className="rounded-lg bg-gray-900/50 p-4">
            <div className="text-3xl font-light">
              ~{estimatedVocabSize.toLocaleString()} words
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Based on your assessment results
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>Beginner</span>
                <span>Advanced</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${((userState.theta + 3) / 6) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-3">
          <button
            onClick={onExport}
            className="w-full rounded-lg bg-gray-900 py-3 text-sm text-gray-300 hover:bg-gray-800"
          >
            Export Progress
          </button>
          <button
            onClick={onReset}
            className="w-full rounded-lg bg-gray-900 py-3 text-sm text-red-400 hover:bg-gray-800"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: 'green' | 'yellow' | 'red' | 'blue';
}) {
  const colorClasses: Record<string, string> = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  };

  const colorClass = color ? colorClasses[color] : '';

  return (
    <div className="rounded-lg bg-gray-900/50 p-4">
      <div className={`text-2xl font-medium ${colorClass}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
