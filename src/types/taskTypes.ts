
import { Difficulty, Stat, Reminder } from './types';

// 🏛️ MODULE 01: TASK ENTITIES

export interface Subtask {
    id: string;
    title: string;
    isCompleted: boolean;
}

export interface TaskCategory {
    id: string;
    title: string;
    isCollapsed: boolean;
}

// ⚖️ THE LAW ENTITY
export interface Law {
    id: string;
    title: string;
    penaltyType: 'gold' | 'xp' | 'stat';
    penaltyValue: number;
    statTarget?: Stat; // Only used if penaltyType is 'stat'
    timesBroken: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  stat: Stat;
  skillId?: string; 
  isCompleted: boolean;
  completedAt?: string; // ISO Date of completion
  
  // 🆕 Step 2: Tactical Granularity
  subtasks: Subtask[]; 

  // Organization
  categoryId?: string; 
  isArchived?: boolean; 

  // Timer Logic
  isTimed: boolean;
  durationMinutes?: number;
  
  deadline?: string; // This acts as the visual deadline
  
  // ⏰ SCHEDULING & REMINDERS (Updated)
  scheduledTime?: string; // ISO Date Time
  reminders?: Reminder[]; // 👈 Multiple reminders support

  // 📝 NARRATIVE LAYER (New)
  stakes?: string; // What happens if I fail?
  notes?: string;  // Detailed tactical notes

  // 🆕 G12 MARKER
  isCampaign?: boolean; // True if part of 12 Week Year
  
  // 🗓️ CALENDAR C30 MARKER (New)
  isCalendarEvent?: boolean; // True if created via Calendar
}
