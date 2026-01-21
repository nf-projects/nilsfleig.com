import React, { useState } from 'react';
import { Button } from './Button';
import { Clock, Delete, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (durationInSeconds: number) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(15);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customSeconds, setCustomSeconds] = useState(0);

  const getDurationInSeconds = (): number => {
    if (selectedPreset === 'custom') {
      return customMinutes * 60 + customSeconds;
    }
    return selectedPreset * 60;
  };

  const formatDuration = (): string => {
    const totalSeconds = getDurationInSeconds();
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    
    if (mins === 0) {
      return `${secs} Second${secs !== 1 ? 's' : ''}`;
    } else if (secs === 0) {
      return `${mins} Minute${mins !== 1 ? 's' : ''}`;
    } else {
      return `${mins} Min ${secs} Sec`;
    }
  };

  const handleCustomMinutesChange = (value: string) => {
    const num = parseInt(value) || 0;
    setCustomMinutes(Math.max(0, num));
  };

  const handleCustomSecondsChange = (value: string) => {
    const num = parseInt(value) || 0;
    setCustomSeconds(Math.max(0, Math.min(59, num)));
  };

  const durationInSeconds = getDurationInSeconds();
  const isValidDuration = durationInSeconds > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-2xl mx-auto animate-fade-in">
      <h1 className="font-serif text-5xl md:text-7xl mb-6 text-ink">Write</h1>
      <p className="font-sans text-gray-500 text-lg md:text-xl mb-12 max-w-lg leading-relaxed">
        A stream of consciousness experiment. 
        Write without judgment. Write without stopping.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 w-full">
        {/* Duration Selector */}
        <div className="flex flex-col items-center space-y-4 p-5 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <Clock className="w-8 h-8 text-ink opacity-80" />
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {[5, 10, 15].map((mins) => (
              <button
                key={mins}
                onClick={() => setSelectedPreset(mins)}
                className={`w-10 h-10 rounded-full font-serif text-lg flex items-center justify-center transition-all duration-200 ${
                  selectedPreset === mins
                    ? 'bg-ink text-white shadow-md scale-110'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                {mins}
              </button>
            ))}
            <button
              onClick={() => setSelectedPreset('custom')}
              className={`w-10 h-10 rounded-full font-serif text-sm flex items-center justify-center transition-all duration-200 ${
                selectedPreset === 'custom'
                  ? 'bg-ink text-white shadow-md scale-110'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
              title="Custom duration"
            >
              +
            </button>
          </div>
          
          {selectedPreset === 'custom' ? (
            <div className="flex flex-col items-center space-y-3 w-full">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={customMinutes || ''}
                  onChange={(e) => handleCustomMinutesChange(e.target.value)}
                  placeholder="0"
                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md font-serif text-lg focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                />
                <span className="text-gray-500 font-sans text-sm">min</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customSeconds || ''}
                  onChange={(e) => handleCustomSecondsChange(e.target.value)}
                  placeholder="0"
                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md font-serif text-lg focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
                />
                <span className="text-gray-500 font-sans text-sm">sec</span>
              </div>
              {!isValidDuration && (
                <p className="text-xs text-red-500">Enter a valid duration</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Minutes. Choose your commitment.</p>
          )}
        </div>

        <div className="flex flex-col items-center space-y-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <Delete className="w-8 h-8 text-ink opacity-80" />
          <h3 className="font-serif text-xl">No Return</h3>
          <p className="text-sm text-gray-500">Backspace is disabled. Embrace your mistakes.</p>
        </div>
        <div className="flex flex-col items-center space-y-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <Zap className="w-8 h-8 text-danger opacity-80" />
          <h3 className="font-serif text-xl">Keep Moving</h3>
          <p className="text-sm text-gray-500">Stop for a moment, and the screen fades to darkness. Keep writing to bring it back.</p>
        </div>
      </div>

      <Button 
        onClick={() => onStart(durationInSeconds)} 
        className="text-lg"
        disabled={!isValidDuration}
      >
        Begin {formatDuration()} Session
      </Button>
    </div>
  );
};
