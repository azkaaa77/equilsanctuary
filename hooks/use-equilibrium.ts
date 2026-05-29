'use client';

import { useState, useMemo } from 'react';

export interface EquilibriumState {
  mood: number; // 0-10
  healingFactor: number; // 0-1
  spendingRatio: number; // 0-100 (impulse %)
  purposeScore: number; // 0-10
}

export function useEquilibriumScore() {
  const [state, setState] = useState<EquilibriumState>({
    mood: 8,
    healingFactor: 0.7,
    spendingRatio: 20,
    purposeScore: 7,
  });

  const score = useMemo(() => {
    // E = ((Mood × HealingFactor) + (100 − SpendingRatio) + (PurposeScore × 10)) / 30
    const calculated = (
      (state.mood * (1 + state.healingFactor)) + 
      (100 - state.spendingRatio) / 10 + 
      state.purposeScore
    ) * 3.33; // Scaling to ~100
    
    return Math.round(calculated);
  }, [state.mood, state.healingFactor, state.spendingRatio, state.purposeScore]);

  const updateMood = (mood: number) => setState(prev => ({ ...prev, mood }));
  const updateSpending = (ratio: number) => setState(prev => ({ ...prev, spendingRatio: ratio }));
  const updatePurpose = (purpose: number) => setState(prev => ({ ...prev, purposeScore: purpose }));

  return { ...state, score, updateMood, updateSpending, updatePurpose };
}
