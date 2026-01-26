/**
 * IndexedDB wrapper for vocabulary learning state.
 *
 * Stores:
 * - userState: Single record with global learning state
 * - wordStates: Per-word learning state
 */

import { UserState, WordState } from '../types';

const DB_NAME = 'vocab-learner';
const DB_VERSION = 1;

const STORES = {
  userState: 'userState',
  wordStates: 'wordStates',
} as const;

let dbInstance: IDBDatabase | null = null;

// ============================================================================
// Database Initialization
// ============================================================================

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // User state store
      if (!db.objectStoreNames.contains(STORES.userState)) {
        db.createObjectStore(STORES.userState, { keyPath: 'id' });
      }

      // Word states store with indexes
      if (!db.objectStoreNames.contains(STORES.wordStates)) {
        const wordStore = db.createObjectStore(STORES.wordStates, {
          keyPath: 'wordId',
        });
        wordStore.createIndex('by-status', 'status', { unique: false });
        wordStore.createIndex('by-retrievability', 'retrievability', {
          unique: false,
        });
      }
    };
  });
}

// ============================================================================
// User State Operations
// ============================================================================

export function createDefaultUserState(): UserState {
  return {
    id: 'user',
    theta: 0.5, // Start at intermediate level (skip basic words like "the", "and")
    thetaUncertainty: 1.0, // High uncertainty initially
    totalKnown: 0,
    totalLearning: 0,
    totalSeen: 0,
    averageAccuracy: 0.5,
    sessionCount: 0,
    createdAt: Date.now(),
    lastSessionAt: Date.now(),
  };
}

export async function getUserState(): Promise<UserState> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.userState, 'readonly');
    const store = tx.objectStore(STORES.userState);
    const request = store.get('user');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        // Create default state if none exists
        const defaultState = createDefaultUserState();
        saveUserState(defaultState).then(() => resolve(defaultState));
      }
    };
  });
}

export async function saveUserState(state: UserState): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.userState, 'readwrite');
    const store = tx.objectStore(STORES.userState);
    const request = store.put(state);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============================================================================
// Word State Operations
// ============================================================================

export function createDefaultWordState(
  wordId: string,
  baseDifficulty: number
): WordState {
  return {
    wordId,
    status: 'unseen',
    stability: 0,
    difficulty: baseDifficulty,
    lastSeen: 0,
    retrievability: 0,
    exposureCount: 0,
    correctCount: 0,
    lapseCount: 0,
    lastResponse: null,
    reinforcementsDue: [],
  };
}

export async function getWordState(wordId: string): Promise<WordState | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.wordStates, 'readonly');
    const store = tx.objectStore(STORES.wordStates);
    const request = store.get(wordId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function saveWordState(state: WordState): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.wordStates, 'readwrite');
    const store = tx.objectStore(STORES.wordStates);
    const request = store.put(state);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getAllWordStates(): Promise<WordState[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.wordStates, 'readonly');
    const store = tx.objectStore(STORES.wordStates);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function getWordStatesByStatus(
  status: WordState['status']
): Promise<WordState[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.wordStates, 'readonly');
    const store = tx.objectStore(STORES.wordStates);
    const index = store.index('by-status');
    const request = index.getAll(status);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function getWordStatesMap(): Promise<Map<string, WordState>> {
  const states = await getAllWordStates();
  return new Map(states.map((s) => [s.wordId, s]));
}

// ============================================================================
// Bulk Operations
// ============================================================================

export async function saveWordStatesBatch(states: WordState[]): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.wordStates, 'readwrite');
    const store = tx.objectStore(STORES.wordStates);

    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();

    for (const state of states) {
      store.put(state);
    }
  });
}

// ============================================================================
// Export/Import for Backup
// ============================================================================

export async function exportData(): Promise<{
  userState: UserState;
  wordStates: WordState[];
}> {
  const [userState, wordStates] = await Promise.all([
    getUserState(),
    getAllWordStates(),
  ]);
  return { userState, wordStates };
}

export async function importData(data: {
  userState: UserState;
  wordStates: WordState[];
}): Promise<void> {
  await saveUserState(data.userState);
  await saveWordStatesBatch(data.wordStates);
}

export async function clearAllData(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      [STORES.userState, STORES.wordStates],
      'readwrite'
    );

    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();

    tx.objectStore(STORES.userState).clear();
    tx.objectStore(STORES.wordStates).clear();
  });
}
