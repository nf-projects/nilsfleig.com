import React, { useState } from 'react';
import { Button } from './Button';
import { Clock, Delete, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (durationInSeconds: number) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [duration, setDuration] = useState(15);

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
          <div className="flex items-center gap-2">
            {[5, 10, 15].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`w-10 h-10 rounded-full font-serif text-lg flex items-center justify-center transition-all duration-200 ${
                  duration === mins
                    ? 'bg-ink text-white shadow-md scale-110'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                {mins}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">Minutes. Choose your commitment.</p>
        </div>

        <div className="flex flex-col items-center space-y-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <Delete className="w-8 h-8 text-ink opacity-80" />
          <h3 className="font-serif text-xl">No Return</h3>
          <p className="text-sm text-gray-500">Backspace is disabled. Embrace your mistakes.</p>
        </div>
        <div className="flex flex-col items-center space-y-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <Zap className="w-8 h-8 text-danger opacity-80" />
          <h3 className="font-serif text-xl">Keep Moving</h3>
          <p className="text-sm text-gray-500">Stop for 7 seconds, and the session is lost.</p>
        </div>
      </div>

      <Button onClick={() => onStart(duration * 60)} className="text-lg">
        Begin {duration} Minute Session
      </Button>
    </div>
  );
};
