// /hooks/use-circadian.ts
import { useState, useEffect } from 'react';

export const useCircadian = () => {
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'evening' | 'night'>('day');

  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 18) setTimeOfDay('day');
      else if (hour >= 18 && hour < 22) setTimeOfDay('evening');
      else setTimeOfDay('night');
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  return { timeOfDay };
};
