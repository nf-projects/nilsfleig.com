'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserState,
  WordState,
  WordData,
  SessionState,
  QuizCard as QuizCardType,
  TeachingCard as TeachingCardType,
  CardType,
} from '../types';
import {
  selectNextCard,
  updateUserStateAfterResponse,
  updateWordStateAfterResponse,
  initializeWordStateAfterTeaching,
  popReinforcement,
} from '../lib/algorithms';
import {
  getUserState,
  saveUserState,
  getWordStatesMap,
  saveWordState,
  getWordState,
  createDefaultWordState,
} from '../lib/db';
import { RECENT_WORDS_TRACK, RECENT_CARD_TYPES_TRACK } from '../lib/constants';

// Dev logging
async function logEvent(event: string, data: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    try {
      await fetch('/api/vocab-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, ...data }),
      });
    } catch (e) {
      // Ignore logging errors
    }
  }
}
import { QuizCard } from './QuizCard';
import { TeachingCard } from './TeachingCard';
import { ProgressBar } from './ProgressBar';
import { StatsOverlay } from './StatsOverlay';

interface VocabFeedProps {
  words: WordData[];
  distractorPool: Record<string, string[]>;
  onExit: () => void;
}

export function VocabFeed({ words, distractorPool, onExit }: VocabFeedProps) {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [wordStates, setWordStates] = useState<Map<string, WordState>>(
    new Map()
  );
  const [session, setSession] = useState<SessionState>({
    cardsShown: 0,
    correctCount: 0,
    incorrectCount: 0,
    recentWordIds: [],
    recentCardTypes: [],
    startTime: Date.now(),
    newWordsLearned: 0,
  });
  const [currentCard, setCurrentCard] = useState<
    QuizCardType | TeachingCardType | null
  >(null);
  const [showStats, setShowStats] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    async function loadState() {
      try {
        const [us, ws] = await Promise.all([
          getUserState(),
          getWordStatesMap(),
        ]);
        setUserState(us);
        setWordStates(ws);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load state:', error);
        setIsLoading(false);
      }
    }
    loadState();
  }, []);

  // Select next card when state changes
  useEffect(() => {
    if (isLoading || !userState || currentCard) return;

    const nextCard = selectNextCard(
      userState,
      wordStates,
      session,
      words,
      distractorPool
    );
    setCurrentCard(nextCard);
  }, [
    isLoading,
    userState,
    wordStates,
    session,
    words,
    distractorPool,
    currentCard,
  ]);

  const handleQuizAnswer = useCallback(
    async (correct: boolean, responseTime: number) => {
      if (!currentCard || !userState) return;

      const card = currentCard as QuizCardType;

      // Log the response
      logEvent('quiz_response', {
        word: card.word.word,
        wordId: card.wordId,
        cardType: card.cardType,
        correct,
        responseTime,
        wordDifficulty: card.word.difficulty,
        wordRank: card.word.rank,
        userTheta: userState.theta,
        userUncertainty: userState.thetaUncertainty,
        sessionCards: session.cardsShown,
      });

      // Update user state (IRT)
      const newUserState = updateUserStateAfterResponse(
        userState,
        card.word.difficulty,
        correct
      );

      // Get or create word state
      let ws = wordStates.get(card.wordId);
      if (!ws) {
        ws = createDefaultWordState(card.wordId, card.word.difficulty);
      }

      // Update word state (FSRS)
      let newWordState = updateWordStateAfterResponse(ws, correct);

      // Handle reinforcement completion
      if (card.cardType === 'reinforcement') {
        newWordState = popReinforcement(newWordState);
      }

      // Update counts
      if (newWordState.status === 'known' && ws.status !== 'known') {
        newUserState.totalKnown++;
        newUserState.totalLearning = Math.max(
          0,
          newUserState.totalLearning - 1
        );
      }

      // Log theta update
      logEvent('theta_update', {
        oldTheta: userState.theta,
        newTheta: newUserState.theta,
        oldUncertainty: userState.thetaUncertainty,
        newUncertainty: newUserState.thetaUncertainty,
        wordDifficulty: card.word.difficulty,
        correct,
      });

      // Save to IndexedDB
      await Promise.all([
        saveUserState(newUserState),
        saveWordState(newWordState),
      ]);

      // Update local state
      setUserState(newUserState);
      setWordStates((prev) => new Map(prev).set(card.wordId, newWordState));
      setSession((prev) => ({
        ...prev,
        cardsShown: prev.cardsShown + 1,
        correctCount: prev.correctCount + (correct ? 1 : 0),
        incorrectCount: prev.incorrectCount + (correct ? 0 : 1),
        recentWordIds: [...prev.recentWordIds, card.wordId].slice(
          -RECENT_WORDS_TRACK
        ),
        recentCardTypes: [...prev.recentCardTypes, card.cardType].slice(
          -RECENT_CARD_TYPES_TRACK
        ),
      }));

      // Clear current card to trigger next selection
      setCurrentCard(null);
    },
    [currentCard, userState, wordStates]
  );

  const handleTeachingContinue = useCallback(async () => {
    if (!currentCard || !userState) return;

    const card = currentCard as TeachingCardType;

    // Log the teaching card
    logEvent('teaching_shown', {
      word: card.word.word,
      wordId: card.wordId,
      wordDifficulty: card.word.difficulty,
      wordRank: card.word.rank,
      userTheta: userState.theta,
      sessionCards: session.cardsShown,
      newWordsThisSession: session.newWordsLearned,
    });

    // Initialize word state for newly taught word
    const newWordState = initializeWordStateAfterTeaching(
      card.wordId,
      card.word.difficulty
    );

    // Update user state counts
    const newUserState = {
      ...userState,
      totalLearning: userState.totalLearning + 1,
      totalSeen: userState.totalSeen + 1,
    };

    // Save to IndexedDB
    await Promise.all([
      saveUserState(newUserState),
      saveWordState(newWordState),
    ]);

    // Update local state
    setUserState(newUserState);
    setWordStates((prev) => new Map(prev).set(card.wordId, newWordState));
    setSession((prev) => ({
      ...prev,
      cardsShown: prev.cardsShown + 1,
      newWordsLearned: prev.newWordsLearned + 1,
      recentWordIds: [...prev.recentWordIds, card.wordId].slice(
        -RECENT_WORDS_TRACK
      ),
      recentCardTypes: [...prev.recentCardTypes, 'teaching' as CardType].slice(
        -RECENT_CARD_TYPES_TRACK
      ),
    }));

    // Clear current card to trigger next selection
    setCurrentCard(null);
  }, [currentCard, userState]);

  const handleExport = useCallback(async () => {
    const data = {
      userState,
      wordStates: Array.from(wordStates.entries()),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocab-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [userState, wordStates]);

  const handleReset = useCallback(async () => {
    if (!confirm('This will delete all your progress. Are you sure?')) return;

    const { clearAllData } = await import('../lib/db');
    await clearAllData();
    window.location.reload();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-gray-500">No more cards available</div>
          <button
            onClick={onExit}
            className="rounded-lg bg-white px-6 py-2 text-black"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ProgressBar session={session} theta={userState?.theta ?? 0} onShowStats={() => setShowStats(true)} />

      <div className="pt-12">
        {currentCard.cardType === 'teaching' ? (
          <TeachingCard
            card={currentCard as TeachingCardType}
            onContinue={handleTeachingContinue}
          />
        ) : (
          <QuizCard
            card={currentCard as QuizCardType}
            onAnswer={handleQuizAnswer}
          />
        )}
      </div>

      {showStats && userState && (
        <StatsOverlay
          userState={userState}
          session={session}
          onClose={() => setShowStats(false)}
          onExport={handleExport}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
