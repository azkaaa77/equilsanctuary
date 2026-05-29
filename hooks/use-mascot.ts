// /hooks/use-mascot.ts
import { useState, useEffect } from 'react';

export const useMascot = () => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mood, setMood] = useState<'neutral' | 'curious' | 'happy'>('neutral');

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  return { isBlinking, mood, setMood };
};
