// ============================================================================
// Word Data (from static JSON)
// ============================================================================

export interface WordData {
  id: string;
  word: string;
  rank: number;
  difficulty: number;
  pos: string[];
  definitions: Definition[];
  ipa?: string;
  sentences: string[];
  cefr?: string;
}

export interface Definition {
  pos: string;
  def: string;
  examples?: string[];
}

// ============================================================================
// User State (stored in IndexedDB)
// ============================================================================

export interface UserState {
  id: string; // Always 'user'
  theta: number; // Ability estimate (-3 to +3, maps to word difficulty)
  thetaUncertainty: number; // Confidence (1.0 = uncertain, 0.1 = confident)
  totalKnown: number; // Words with status 'known'
  totalLearning: number; // Words with status 'learning'
  totalSeen: number; // Total unique words seen
  averageAccuracy: number; // Rolling accuracy on reviews
  sessionCount: number;
  createdAt: number;
  lastSessionAt: number;
}

export interface WordState {
  wordId: string;
  status: 'unseen' | 'learning' | 'known' | 'lapsed';

  // FSRS memory model
  stability: number; // S - days until retrievability drops to 90%
  difficulty: number; // User-specific difficulty (starts at base)
  lastSeen: number; // Timestamp
  retrievability: number; // Computed R = exp(-t/S)

  // History
  exposureCount: number;
  correctCount: number;
  lapseCount: number;
  lastResponse: 'correct' | 'incorrect' | null;

  // Reinforcement scheduling (for newly taught words)
  reinforcementsDue: number[]; // Timestamps for upcoming reinforcements
}

// ============================================================================
// Session State (in-memory only)
// ============================================================================

export interface SessionState {
  cardsShown: number;
  correctCount: number;
  incorrectCount: number;
  recentWordIds: string[]; // Last N words shown (for variety)
  recentCardTypes: CardType[]; // Last N card types
  startTime: number;
  newWordsLearned: number;
}

// ============================================================================
// Card Types
// ============================================================================

export type CardType = 'probe' | 'review' | 'teaching' | 'reinforcement';

export interface Card {
  wordId: string;
  cardType: CardType;
  word: WordData;
}

export interface QuizCard extends Card {
  cardType: 'probe' | 'review' | 'reinforcement';
  options: QuizOption[];
  correctIndex: number;
}

export interface TeachingCard extends Card {
  cardType: 'teaching';
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

// ============================================================================
// App State
// ============================================================================

export enum AppState {
  LOADING = 'loading',
  WELCOME = 'welcome',
  LEARNING = 'learning',
  STATS = 'stats',
}

// ============================================================================
// Response Types
// ============================================================================

export type ResponseRating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

export interface CardResponse {
  wordId: string;
  cardType: CardType;
  correct: boolean;
  responseTime: number; // milliseconds
  timestamp: number;
}
