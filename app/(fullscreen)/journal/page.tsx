'use client';

import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { JournalSession } from './components/JournalSession';
import { ResultsScreen } from './components/ResultsScreen';
import { AppState } from './types';

// Configuration constants
const INACTIVITY_THRESHOLD = 7; // 7 seconds

export default function JournalPage() {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [journalText, setJournalText] = useState('');
  const [sessionDuration, setSessionDuration] = useState(900); // Default 15 mins

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

  const handleStart = (duration: number) => {
    setSessionDuration(duration);
    setAppState(AppState.JOURNALING);
    setJournalText('');
  };

  const handleComplete = (text: string) => {
    setJournalText(text);
    setAppState(AppState.COMPLETED);
  };

  const handleFail = () => {
    setJournalText(''); // Wipe the text on failure to be ruthless
    setAppState(AppState.FAILED);
  };

  const handleRetry = () => {
    setAppState(AppState.WELCOME);
    setJournalText('');
  };

  return (
    <main className="min-h-screen w-full bg-paper text-ink selection:bg-gray-200">
      {appState === AppState.WELCOME && (
        <WelcomeScreen onStart={handleStart} />
      )}
      
      {appState === AppState.JOURNALING && (
        <JournalSession 
          config={{ 
            sessionDuration: sessionDuration, 
            inactivityThreshold: INACTIVITY_THRESHOLD 
          }}
          onComplete={handleComplete}
          onFail={handleFail}
        />
      )}

      {(appState === AppState.COMPLETED || appState === AppState.FAILED) && (
        <ResultsScreen 
          state={appState}
          text={journalText}
          onRetry={handleRetry}
        />
      )}
    </main>
  );
}
