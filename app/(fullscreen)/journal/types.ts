export enum AppState {
  WELCOME = 'WELCOME',
  JOURNALING = 'JOURNALING',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
  ANALYZING = 'ANALYZING',
}

export interface AnalysisResult {
  summary: string;
  themes: string[];
  mood: string;
}

export interface JournalConfig {
  sessionDuration: number; // in seconds
  inactivityThreshold: number; // in seconds
}
