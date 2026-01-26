'use client';

import React, { useState, useEffect } from 'react';
import { AppState, WordData, UserState } from './types';
import { getUserState, clearAllData } from './lib/db';
import { WORDS_JSON_PATH, DISTRACTORS_JSON_PATH } from './lib/constants';
import { WelcomeScreen } from './components/WelcomeScreen';
import { VocabFeed } from './components/VocabFeed';

export default function VocabPage() {
  const [appState, setAppState] = useState<AppState>(AppState.LOADING);
  const [words, setWords] = useState<WordData[]>([]);
  const [distractorPool, setDistractorPool] = useState<Record<string, string[]>>({});
  const [userState, setUserState] = useState<UserState | null>(null);

  // Hide header and footer on mount
  useEffect(() => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';

    // Restore on unmount
    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load word data and distractors in parallel
        const [wordsRes, distractorsRes, us] = await Promise.all([
          fetch(WORDS_JSON_PATH),
          fetch(DISTRACTORS_JSON_PATH),
          getUserState(),
        ]);

        if (!wordsRes.ok || !distractorsRes.ok) {
          throw new Error('Failed to load vocabulary data');
        }

        const wordsData = await wordsRes.json();
        const distractorsData = await distractorsRes.json();

        setWords(wordsData);
        setDistractorPool(distractorsData);
        setUserState(us);
        setAppState(AppState.WELCOME);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Still show welcome screen, error will be handled in VocabFeed
        setAppState(AppState.WELCOME);
      }
    }

    loadData();
  }, []);

  const handleStart = () => {
    setAppState(AppState.LEARNING);
  };

  const handleExit = () => {
    setAppState(AppState.WELCOME);
    // Reload user state to get updated stats
    getUserState().then(setUserState);
  };

  const handleReset = async () => {
    if (!confirm('This will delete all your progress. Are you sure?')) return;
    await clearAllData();
    setUserState(null);
    getUserState().then(setUserState);
  };

  if (appState === AppState.LOADING) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-gray-500">Loading vocabulary data...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-gray-700">
      {appState === AppState.WELCOME && (
        <WelcomeScreen
          onStart={handleStart}
          onReset={handleReset}
          stats={
            userState
              ? {
                  totalKnown: userState.totalKnown,
                  totalLearning: userState.totalLearning,
                  averageAccuracy: userState.averageAccuracy,
                }
              : undefined
          }
        />
      )}

      {appState === AppState.LEARNING && (
        <VocabFeed
          words={words}
          distractorPool={distractorPool}
          onExit={handleExit}
        />
      )}
    </main>
  );
}
