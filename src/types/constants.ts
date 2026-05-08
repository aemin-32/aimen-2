
import { Difficulty, Stat, DailyMode } from './types';

export const DIFFICULTY_COLORS = {
  [Difficulty.EASY]: 'border-life-easy text-life-easy',
  [Difficulty.NORMAL]: 'border-life-normal text-life-normal',
  [Difficulty.HARD]: 'border-life-hard text-life-hard',
};

export const DIFFICULTY_BG = {
  [Difficulty.EASY]: 'bg-life-easy/10',
  [Difficulty.NORMAL]: 'bg-life-normal/10',
  [Difficulty.HARD]: 'bg-life-hard/10',
};

export const DIFFICULTY_HEX = {
  [Difficulty.EASY]: '#4ADE80',
  [Difficulty.NORMAL]: '#3B82F6',
  [Difficulty.HARD]: '#EF4444',
};

export const STAT_COLORS = {
  [Stat.STR]: '#FF003C', // Neon Red
  [Stat.INT]: '#BC13FE', // Neon Purple
  [Stat.DIS]: '#00FFFF', // Neon Blue
  [Stat.HEA]: '#39FF14', // Neon Green
  [Stat.CRT]: '#FF00FF', // Neon Magenta
  [Stat.SPR]: '#FF003C', // Reuse Red for Spirit or find another
  [Stat.REL]: '#00FF9F', // Neon Teal
  [Stat.FIN]: '#FFD700', // Neon Gold
};

// 🆕 DAILY TARGETS (Survival Modes)
export const DAILY_TARGETS = {
    [DailyMode.EASY]: 300,
    [DailyMode.NORMAL]: 400,
    [DailyMode.HARD]: 500,
};

// 🆕 MILESTONE BONUSES (Austerity Measures)
export const MILESTONE_REWARDS: Record<number, number> = {
    7: 300,
    21: 1000,
    50: 2500,
    100: 5000,
};

// ⚖️ UNIVERSAL LAW: REWARDS (Success)
export const REWARDS = {
    [Difficulty.EASY]: { xp: 20, gold: 10 },
    [Difficulty.NORMAL]: { xp: 50, gold: 30 },
    [Difficulty.HARD]: { xp: 100, gold: 100 }, 
};

// ⚖️ UNIVERSAL LAW: PENALTIES (Failure/Give Up)
export const PENALTIES = {
    [Difficulty.EASY]: { xp: 50, gold: 20, stat: 2 }, 
    [Difficulty.NORMAL]: { xp: 30, gold: 10, stat: 1 },
    [Difficulty.HARD]: { xp: 10, gold: 0, stat: 0 },   
};

export const APP_VERSION = '1.1.0';
export const CURRENCY_SYMBOL = 'G';
