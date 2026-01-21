import React, { useState, useEffect, useRef } from 'react';
import { JournalConfig } from '../types';

interface JournalSessionProps {
  config: JournalConfig;
  onComplete: (text: string) => void;
  onFail: () => void;
}

export const JournalSession: React.FC<JournalSessionProps> = ({ config, onComplete, onFail }) => {
  const [text, setText] = useState('');
  const [timeLeft, setTimeLeft] = useState(config.sessionDuration);
  const [inactivityTime, setInactivityTime] = useState(0); // in ms
  const [nudge, setNudge] = useState<string | null>(null);

  const lastKeystrokeRef = useRef<number>(Date.now());
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const FADE_START_MS = 2000; // Start fading after 2s
  const FULL_BLACK_MS = config.inactivityThreshold * 1000; // Fully black at threshold

  // Initial focus
  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  // Session Timer
  useEffect(() => {
    sessionIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(sessionIntervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
    };
  }, []);

  // Check for completion
  useEffect(() => {
    if (timeLeft === 0) {
      onComplete(text);
    }
  }, [timeLeft, text, onComplete]);

  // Inactivity Loop
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const diff = now - lastKeystrokeRef.current;
      setInactivityTime(diff);
    }, 100); // Check every 100ms

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      triggerNudge();
      return;
    }
    // Update timestamp
    lastKeystrokeRef.current = Date.now();
    setInactivityTime(0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    lastKeystrokeRef.current = Date.now();
  };

  const triggerNudge = () => {
    const nudges = [
      "Don't look back.",
      "Keep moving forward.",
      "No regrets.",
      "Flow only.",
      "Let it go."
    ];
    setNudge(nudges[Math.floor(Math.random() * nudges.length)]);
    setTimeout(() => setNudge(null), 1500);
  };

  // Calculate opacity based on inactivity
  // 0 -> FADE_START_MS: opacity 0
  // FADE_START_MS -> FULL_BLACK_MS: opacity 0 -> 1
  const darknessOpacity = Math.min(1, Math.max(0, (inactivityTime - FADE_START_MS) / (FULL_BLACK_MS - FADE_START_MS)));
  
  // Format timer
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-paper transition-colors duration-1000">
      
      {/* Darkness Overlay - Solid black that fades in */}
      <div 
        className="pointer-events-none absolute inset-0 z-50 bg-black transition-opacity duration-200"
        style={{
          opacity: darknessOpacity
        }}
      />
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div className="text-ink font-sans text-sm tracking-widest uppercase opacity-50">
          Write
        </div>
        <div className="font-mono text-xl text-ink transition-colors duration-300">
          {formattedTime}
        </div>
      </div>

      {/* Main writing area */}
      <div className="w-full h-full flex items-center justify-center p-4 md:p-12 lg:p-24 relative z-0">
        <textarea
          ref={textAreaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="w-full h-full bg-transparent resize-none border-none outline-none font-serif text-2xl md:text-3xl leading-relaxed text-ink placeholder-gray-300 focus:ring-0"
          placeholder="Start typing. Don't stop..."
          autoFocus
        />
      </div>

      {/* Nudge Toast */}
      {nudge && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-ink text-white px-6 py-2 rounded-full shadow-xl animate-fade-in z-30">
          <span className="font-sans text-sm tracking-wide">{nudge}</span>
        </div>
      )}
    </div>
  );
};
