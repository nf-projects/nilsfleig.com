/**
 * Core learning algorithms:
 * - FSRS: Free Spaced Repetition Scheduler for memory modeling
 * - IRT: Item Response Theory for ability estimation
 * - Card Selection: Priority-based card selection
 */

import {
  UserState,
  WordState,
  WordData,
  SessionState,
  CardType,
  QuizCard,
  TeachingCard,
  QuizOption,
} from '../types';

// ============================================================================
// Constants
// ============================================================================

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// FSRS parameters (simplified FSRS-4.5)
const FSRS = {
  initialStability: 0.5, // Days
  stabilityGrowth: 2.5, // Multiplier on successful recall
  stabilityDecay: 0.3, // Multiplier on failure
  difficultyIncrease: 0.2, // On failure
  difficultyDecrease: 0.05, // On success
  minStability: 0.1,
  maxStability: 365,
  minDifficulty: -3,
  maxDifficulty: 3,
};

// IRT parameters - aggressive binary search style
const IRT = {
  learningRate: 0.8, // Aggressive learning rate for fast convergence
  minUncertainty: 0.1, // Minimum uncertainty
  uncertaintyDecay: 0.85, // Faster uncertainty decay
};

// Card selection weights
const WEIGHTS = {
  urgency: 0.4,
  informationGain: 0.25,
  learningValue: 0.25,
  variety: 0.1,
};

// Reinforcement intervals (milliseconds)
const REINFORCEMENT_INTERVALS = [
  60 * 1000, // 1 minute
  5 * 60 * 1000, // 5 minutes
  15 * 60 * 1000, // 15 minutes
];

// ============================================================================
// FSRS Memory Model
// ============================================================================

/**
 * Calculate retrievability (probability of recall) given time elapsed and stability.
 * R(t) = exp(-t / S) where t is days and S is stability
 */
export function calculateRetrievability(
  lastSeen: number,
  stability: number,
  now: number = Date.now()
): number {
  if (stability <= 0 || lastSeen === 0) return 0;
  const daysSince = (now - lastSeen) / MS_PER_DAY;
  return Math.exp(-daysSince / stability);
}

/**
 * Update word state after a response using FSRS.
 */
export function updateWordStateAfterResponse(
  wordState: WordState,
  correct: boolean,
  now: number = Date.now()
): WordState {
  const updated = { ...wordState };
  updated.lastSeen = now;
  updated.exposureCount++;
  updated.lastResponse = correct ? 'correct' : 'incorrect';

  if (correct) {
    updated.correctCount++;

    // Grow stability
    const currentR = calculateRetrievability(
      wordState.lastSeen,
      wordState.stability,
      now
    );
    // Harder recall (lower R) = bigger stability gain
    const retrievabilityBonus = 1 + (1 - currentR) * 0.5;
    updated.stability = Math.min(
      FSRS.maxStability,
      Math.max(
        FSRS.minStability,
        (wordState.stability || FSRS.initialStability) *
          FSRS.stabilityGrowth *
          retrievabilityBonus
      )
    );

    // Decrease difficulty slightly
    updated.difficulty = Math.max(
      FSRS.minDifficulty,
      wordState.difficulty - FSRS.difficultyDecrease
    );

    // Graduate from learning to known
    if (
      updated.status === 'learning' &&
      updated.correctCount >= 2 &&
      updated.stability >= 1
    ) {
      updated.status = 'known';
    }
  } else {
    // Failure - decay stability
    updated.stability = Math.max(
      FSRS.minStability,
      (wordState.stability || FSRS.initialStability) * FSRS.stabilityDecay
    );

    // Increase difficulty
    updated.difficulty = Math.min(
      FSRS.maxDifficulty,
      wordState.difficulty + FSRS.difficultyIncrease
    );

    // Lapse if was known
    if (updated.status === 'known') {
      updated.status = 'lapsed';
      updated.lapseCount++;
    }
  }

  // Update retrievability
  updated.retrievability = 1.0; // Just seen

  return updated;
}

/**
 * Initialize word state after teaching card.
 */
export function initializeWordStateAfterTeaching(
  wordId: string,
  baseDifficulty: number,
  now: number = Date.now()
): WordState {
  return {
    wordId,
    status: 'learning',
    stability: FSRS.initialStability,
    difficulty: baseDifficulty,
    lastSeen: now,
    retrievability: 1.0,
    exposureCount: 1,
    correctCount: 0,
    lapseCount: 0,
    lastResponse: null,
    reinforcementsDue: REINFORCEMENT_INTERVALS.map((interval) => now + interval),
  };
}

// ============================================================================
// IRT Ability Estimation
// ============================================================================

/**
 * Calculate probability of correct response given theta and difficulty.
 * P(correct) = 1 / (1 + exp(difficulty - theta))
 */
export function probabilityCorrect(theta: number, difficulty: number): number {
  return 1 / (1 + Math.exp(difficulty - theta));
}

/**
 * Update user theta after a response using IRT.
 * Binary search style: big jumps when uncertain, small adjustments when confident.
 */
export function updateUserStateAfterResponse(
  userState: UserState,
  wordDifficulty: number,
  correct: boolean
): UserState {
  const updated = { ...userState };

  // Binary search approach:
  // If correct on a hard word (above theta), jump UP toward that difficulty
  // If incorrect on an easy word (below theta), jump DOWN toward that difficulty
  const difficultyGap = wordDifficulty - userState.theta;

  if (correct) {
    // Correct answer: theta should be AT LEAST at word difficulty
    // Jump more aggressively when uncertain
    const jumpFactor = 0.5 + userState.thetaUncertainty * 0.5; // 0.5 to 1.0
    if (difficultyGap > 0) {
      // Word was harder than theta - big jump up
      updated.theta = userState.theta + difficultyGap * jumpFactor;
    } else {
      // Word was easier - small bump up
      updated.theta = userState.theta + 0.1 * userState.thetaUncertainty;
    }
  } else {
    // Incorrect: theta should be BELOW word difficulty
    const jumpFactor = 0.5 + userState.thetaUncertainty * 0.5;
    if (difficultyGap < 0) {
      // Word was easier than theta - big jump down
      updated.theta = userState.theta + difficultyGap * jumpFactor;
    } else {
      // Word was harder - move down toward it
      updated.theta = wordDifficulty - 0.3;
    }
  }

  updated.theta = Math.max(-3, Math.min(3, updated.theta));

  // Uncertainty shrinks faster with informative responses (words near theta)
  const informative = Math.abs(difficultyGap) < 1.0;
  const decayRate = informative ? IRT.uncertaintyDecay : IRT.uncertaintyDecay * 1.05;
  updated.thetaUncertainty = Math.max(
    IRT.minUncertainty,
    userState.thetaUncertainty * decayRate
  );

  // Update accuracy
  const alpha = 0.1;
  updated.averageAccuracy =
    alpha * (correct ? 1 : 0) + (1 - alpha) * userState.averageAccuracy;

  return updated;
}

// ============================================================================
// Card Selection Algorithm
// ============================================================================

interface CardCandidate {
  wordId: string;
  cardType: CardType;
  priority: number;
  word: WordData;
}

/**
 * Select the next card to show.
 */
export function selectNextCard(
  userState: UserState,
  wordStates: Map<string, WordState>,
  sessionState: SessionState,
  words: WordData[],
  distractorPool: Record<string, string[]>,
  now: number = Date.now()
): QuizCard | TeachingCard | null {
  const candidates: CardCandidate[] = [];

  // 1. Check for reinforcement cards (highest priority)
  for (const [wordId, ws] of Array.from(wordStates)) {
    if (ws.reinforcementsDue.length > 0 && ws.reinforcementsDue[0] <= now) {
      const word = words.find((w) => w.id === wordId);
      if (word) {
        candidates.push({
          wordId,
          cardType: 'reinforcement',
          priority: 1000,
          word,
        });
      }
    }
  }

  // 2. Check for review cards (retention risk)
  const TARGET_RETRIEVABILITY = 0.85;
  for (const [wordId, ws] of Array.from(wordStates)) {
    if (
      (ws.status === 'known' || ws.status === 'lapsed') &&
      ws.stability > 0
    ) {
      const R = calculateRetrievability(ws.lastSeen, ws.stability, now);
      if (R < TARGET_RETRIEVABILITY) {
        const word = words.find((w) => w.id === wordId);
        if (word) {
          const urgency = Math.max(0, TARGET_RETRIEVABILITY - R);
          candidates.push({
            wordId,
            cardType: 'review',
            priority: urgency * 100 * WEIGHTS.urgency,
            word,
          });
        }
      }
    }
  }

  // 3. Consider probe cards (if theta is uncertain or periodically)
  if (shouldProbe(userState, sessionState)) {
    const probeWord = selectProbeWord(userState, wordStates, words, sessionState.recentWordIds);
    if (probeWord) {
      const infoGain =
        userState.thetaUncertainty *
        probabilityCorrect(userState.theta, probeWord.difficulty) *
        (1 - probabilityCorrect(userState.theta, probeWord.difficulty));
      candidates.push({
        wordId: probeWord.id,
        cardType: 'probe',
        priority: infoGain * 100 * WEIGHTS.informationGain,
        word: probeWord,
      });
    }
  }

  // 4. Consider teaching cards
  if (shouldTeach(userState, wordStates, sessionState)) {
    const teachWord = selectTeachingWord(userState, wordStates, words, sessionState.recentWordIds);
    if (teachWord) {
      // Learning value: how useful is this word given user's level
      const levelMatch =
        1 - Math.abs(teachWord.difficulty - userState.theta) / 3;
      candidates.push({
        wordId: teachWord.id,
        cardType: 'teaching',
        priority: levelMatch * 100 * WEIGHTS.learningValue,
        word: teachWord,
      });
    }
  }

  // Apply variety penalties
  applyVarietyPenalties(candidates, sessionState);

  if (candidates.length === 0) {
    // Fallback: show a teaching card for the next unseen word at user's level
    const teachWord = selectTeachingWord(userState, wordStates, words, sessionState.recentWordIds);
    if (teachWord) {
      return createTeachingCard(teachWord);
    }
    return null;
  }

  // Sort by priority and pick the best
  candidates.sort((a, b) => b.priority - a.priority);
  const best = candidates[0];

  // Create the appropriate card type
  if (best.cardType === 'teaching') {
    return createTeachingCard(best.word);
  } else {
    return createQuizCard(
      best.word,
      best.cardType,
      words,
      distractorPool,
      userState.theta
    );
  }
}

function shouldProbe(
  userState: UserState,
  sessionState: SessionState
): boolean {
  // During calibration (high uncertainty), ALWAYS probe
  if (userState.thetaUncertainty > 0.3) return true;
  // After calibration, probe every ~5 cards to maintain accuracy
  if (sessionState.cardsShown % 5 === 0) return true;
  return false;
}

function shouldTeach(
  userState: UserState,
  wordStates: Map<string, WordState>,
  sessionState: SessionState
): boolean {
  // DON'T teach during calibration - focus on finding user's level first
  if (userState.thetaUncertainty > 0.3) return false;

  // Limit new words per session
  if (sessionState.newWordsLearned >= 10) return false;

  // Count learning words
  let learningCount = 0;
  for (const ws of Array.from(wordStates.values())) {
    if (ws.status === 'learning') learningCount++;
  }

  // Don't add more if queue is large
  if (learningCount >= 10) return false;

  return true;
}

function selectProbeWord(
  userState: UserState,
  wordStates: Map<string, WordState>,
  words: WordData[],
  recentWordIds: string[] = []
): WordData | null {
  // Binary search style: probe ABOVE current theta to find ceiling
  // The bigger the uncertainty, the bigger the jump
  const jumpSize = userState.thetaUncertainty * 1.5; // Jump 0.15 to 1.5 difficulty units
  const targetDifficulty = userState.theta + jumpSize;
  const minDifficulty = userState.theta - 0.5; // Don't probe much below current level

  // Find unseen or rarely seen words near target difficulty
  const candidates = words
    .filter((w) => {
      const ws = wordStates.get(w.id);
      const isUnseen = !ws || ws.status === 'unseen' || ws.exposureCount < 2;
      const isAppropriateLevel = w.difficulty >= minDifficulty;
      const notRecent = !recentWordIds.includes(w.id);
      return isUnseen && isAppropriateLevel && notRecent;
    })
    .map((w) => ({
      word: w,
      distance: Math.abs(w.difficulty - targetDifficulty),
    }))
    .sort((a, b) => a.distance - b.distance);

  // Add some randomness to avoid always picking the same word
  const topCandidates = candidates.slice(0, 10);
  if (topCandidates.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * Math.min(3, topCandidates.length));
  return topCandidates[randomIndex]?.word || null;
}

function selectTeachingWord(
  userState: UserState,
  wordStates: Map<string, WordState>,
  words: WordData[],
  recentWordIds: string[] = []
): WordData | null {
  // Select unseen word slightly below user's level (for success)
  // But NOT too far below - skip words that are trivially easy
  const targetDifficulty = userState.theta - 0.3;
  const minDifficulty = userState.theta - 1.5; // Don't teach words way below level

  const candidates = words
    .filter((w) => {
      const ws = wordStates.get(w.id);
      const isUnseen = !ws || ws.status === 'unseen';
      const isAppropriateLevel = w.difficulty >= minDifficulty;
      const notRecent = !recentWordIds.includes(w.id);
      return isUnseen && isAppropriateLevel && notRecent;
    })
    .map((w) => ({
      word: w,
      // Score by closeness to target difficulty (not by rank)
      score: 1 - Math.abs(w.difficulty - targetDifficulty) / 3,
    }))
    .sort((a, b) => b.score - a.score);

  // Add some randomness among top candidates
  const topCandidates = candidates.slice(0, 10);
  if (topCandidates.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * Math.min(5, topCandidates.length));
  return topCandidates[randomIndex]?.word || null;
}

function applyVarietyPenalties(
  candidates: CardCandidate[],
  sessionState: SessionState
): void {
  // Penalize recently shown words
  for (const c of candidates) {
    if (sessionState.recentWordIds.includes(c.wordId)) {
      c.priority *= 0.3;
    }
  }

  // Penalize card types shown too frequently
  const recentTypes = sessionState.recentCardTypes.slice(-5);
  for (const c of candidates) {
    const typeCount = recentTypes.filter((t) => t === c.cardType).length;
    if (typeCount >= 3) {
      c.priority *= 0.5;
    }
  }
}

// ============================================================================
// Card Creation
// ============================================================================

function createTeachingCard(word: WordData): TeachingCard {
  return {
    wordId: word.id,
    cardType: 'teaching',
    word,
  };
}

function createQuizCard(
  word: WordData,
  cardType: 'probe' | 'review' | 'reinforcement',
  words: WordData[],
  distractorPool: Record<string, string[]>,
  userTheta: number
): QuizCard {
  const correctDef =
    word.definitions[0]?.def || 'Definition not available';

  // Get distractors from pool at similar difficulty
  const bandKey = (Math.round(word.difficulty * 2) / 2).toFixed(1);
  let pool = distractorPool[bandKey] || distractorPool['0.0'] || [];

  // Filter out the correct answer and similar definitions
  pool = pool.filter(
    (d) =>
      d !== correctDef &&
      !d.toLowerCase().includes(word.word.toLowerCase()) &&
      !correctDef.toLowerCase().includes(d.toLowerCase().split(' ')[0])
  );

  // Fallback: use definitions from other words at similar difficulty
  if (pool.length < 3) {
    const fallbackWords = words
      .filter(
        (w) =>
          w.id !== word.id &&
          Math.abs(w.difficulty - word.difficulty) < 1 &&
          w.definitions.length > 0
      )
      .slice(0, 20);

    for (const fw of fallbackWords) {
      if (pool.length >= 10) break;
      const def = fw.definitions[0]?.def;
      if (def && def !== correctDef) {
        pool.push(def);
      }
    }
  }

  // Shuffle and pick 3 distractors
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, 3);

  // Create options with correct answer at random position
  const options: QuizOption[] = distractors.map((d) => ({
    text: d,
    isCorrect: false,
  }));
  const correctIndex = Math.floor(Math.random() * 4);
  options.splice(correctIndex, 0, { text: correctDef, isCorrect: true });

  // Ensure exactly 4 options
  while (options.length < 4) {
    options.push({ text: 'No definition available', isCorrect: false });
  }

  return {
    wordId: word.id,
    cardType,
    word,
    options: options.slice(0, 4),
    correctIndex,
  };
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Recalculate retrievability for all word states.
 * Call this after a long absence.
 */
export function recalculateRetrievabilities(
  wordStates: WordState[],
  now: number = Date.now()
): WordState[] {
  return wordStates.map((ws) => ({
    ...ws,
    retrievability: calculateRetrievability(ws.lastSeen, ws.stability, now),
  }));
}

/**
 * Pop the first due reinforcement from a word state.
 */
export function popReinforcement(wordState: WordState): WordState {
  return {
    ...wordState,
    reinforcementsDue: wordState.reinforcementsDue.slice(1),
  };
}
