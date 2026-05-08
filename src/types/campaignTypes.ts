
// 🏛️ MODULE 11: CAMPAIGN ENTITIES (12-WEEK YEAR)

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  strategicGoal?: string;
  activeFronts?: string[];
  stakedGold?: number;
  
  // ⚓ Zero Point Protocol
  startDate: string | null; // ISO Date String (If null, campaign hasn't started)
  isFrozen: boolean;
  
  // Structure
  currentWeek: number; // Calculated live
  currentDay: number;  // Calculated live
  totalWeeks: number;  // Fixed at 12 + 1 (Harvest)
  
  // Tracking
  results: ('win' | 'loss' | 'pending')[]; // 12 slots for results
  streakBonus: number; // Cumulative XP bonus (e.g. 0.05, 0.10)
  lastEvaluatedWeek: number; // To track closures
  intensityTarget?: number; // Global weekly point target
  statTargets?: Record<string, number>; // e.g. { DIS: 20, STR: 15 }
  
  // Meta
  isActive: boolean;
}
