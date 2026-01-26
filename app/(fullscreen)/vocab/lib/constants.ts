/**
 * Configuration constants for the vocabulary learning system.
 */

// Session limits
export const MAX_NEW_WORDS_PER_SESSION = 15;
export const MAX_LEARNING_QUEUE_SIZE = 20;

// Variety tracking
export const RECENT_WORDS_TRACK = 10;
export const RECENT_CARD_TYPES_TRACK = 10;

// Target retrievability for review scheduling
export const TARGET_RETRIEVABILITY = 0.85;

// Cold start configuration
export const COLD_START_CARDS = 20;
export const COLD_START_EASY_WIN_RATE = 0.3; // 30% of cold start cards are easy wins

// UI timing
export const FEEDBACK_DISPLAY_MS = 1200;
export const AUTO_ADVANCE_MS = 1500;

// Data paths
export const WORDS_JSON_PATH = '/vocab/words.json';
export const DISTRACTORS_JSON_PATH = '/vocab/distractors.json';
