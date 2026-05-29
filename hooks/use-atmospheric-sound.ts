'use client';

import { useEffect, useRef } from 'react';

export function useAtmosphericSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initSound = () => {
      if (audioContextRef.current) return;

      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Create a very subtle ambient drone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(40, ctx.currentTime);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(40.5, ctx.currentTime);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.02, ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.connect(ctx.destination);

      osc1.connect(gain);
      osc2.connect(gain);

      osc1.start();
      osc2.start();
      lfo.start();
    };

    const handleFirstInteraction = () => {
      initSound();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);
}
