import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isDanger, setIsDanger] = useState(false);

  const lastKeystrokeRef = useRef<number>(Date.now());
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const DANGER_THRESHOLD_MS = 4000; // Start warning at 4s
  const FAILURE_THRESHOLD_MS = config.inactivityThreshold * 1000;

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

      if (diff > DANGER_THRESHOLD_MS) {
        setIsDanger(true);
      } else {
        setIsDanger(false);
      }

      if (diff >= FAILURE_THRESHOLD_MS) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onFail();
      }
    }, 100); // Check every 100ms

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [FAILURE_THRESHOLD_MS, onFail]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      triggerNudge();
      return;
    }
    // Update timestamp
    lastKeystrokeRef.current = Date.now();
    setIsDanger(false);
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

  // Calculate opacity/color based on danger
  const dangerProgress = Math.max(0, (inactivityTime - DANGER_THRESHOLD_MS) / (FAILURE_THRESHOLD_MS - DANGER_THRESHOLD_MS));
  
  // Format timer
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-paper transition-colors duration-1000"
         style={{ 
           backgroundColor: isDanger ? `rgba(253, 251, 247, ${1 - dangerProgress})` : '#fdfbf7' 
         }}>
      
      {/* Visual Danger Overlay - Vignette effect that grows */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
        style={{
          background: 'radial-gradient(circle, transparent 50%, #1a1a1a 100%)',
          opacity: isDanger ? dangerProgress * 0.8 : 0
        }}
      />
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div className="text-ink font-sans text-sm tracking-widest uppercase opacity-50">
          Write
        </div>
        <div className={`font-mono text-xl transition-colors duration-300 ${isDanger ? 'text-red-600' : 'text-ink'}`}>
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

      {/* Danger Text Indicator */}
      {isDanger && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-danger font-sans text-sm tracking-[0.2em] animate-pulse z-20">
           {(FAILURE_THRESHOLD_MS - inactivityTime) / 1000 < 2 ? "FADING..." : "KEEP WRITING"}
        </div>
      )}
    </div>
  );
};
