'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type TimeContext = 'morning' | 'day' | 'evening' | 'night';

interface CircadianContextType {
  timeContext: TimeContext;
}

const CircadianContext = createContext<CircadianContextType | undefined>(undefined);

export function CircadianProvider({ children }: { children: React.ReactNode }) {
  const [timeContext, setTimeContext] = useState<TimeContext>('day');

  useEffect(() => {
    const updateTheme = () => {
      const now = new Date();
      const hour = now.getHours();
      const mins = now.getMinutes();

      if (hour >= 5 && hour < 11) {
        setTimeContext('morning');
      } else if (hour >= 11 && hour < 15) {
        setTimeContext('day');
      } else if ((hour >= 15 && hour < 18) || (hour === 18 && mins < 30)) {
        setTimeContext('evening');
      } else {
        setTimeContext('night');
      }
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CircadianContext.Provider value={{ timeContext }}>
      <div className={`transition-all duration-1000 ${
        timeContext === 'evening' ? 'sepia-[0.1]' : 
        timeContext === 'night' ? 'brightness-90 contrast-110' : ''
      }`}>
        {children}
      </div>
    </CircadianContext.Provider>
  );
}

export const useCircadian = () => {
  const context = useContext(CircadianContext);
  if (!context) throw new Error('useCircadian must be used within CircadianProvider');
  return context;
};
