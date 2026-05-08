import React from 'react';
import { useAscension } from '../../../contexts/AscensionContext';
import { DailyMode } from '../../../types/types';
import { getHabitLevel, calculateFall } from '../../../utils/habitEngine';
import { HeroSection } from './HeroSection';
import { EvolutionGate } from './EvolutionGate';
import { FallSimulator } from './FallSimulator';
import { WeeklySurvivalLog } from './WeeklySurvivalLog';
import { NextCycleProtocol } from './NextCycleProtocol';

export const StreakDashboard: React.FC = () => {
    const { state, dispatch } = useAscension();
    const { user } = state;

    const progressPercent = Math.min(100, (user.dailyXP / user.dailyTarget) * 100);
    const isSafe = progressPercent >= 100;
    const displayStreak = isSafe ? user.streak + 1 : user.streak;

    // 1. FIBONACCI LOGIC CALCULATION
    const levelData = getHabitLevel(displayStreak);
    const potentialFallStreak = calculateFall(displayStreak);
    const streakLoss = displayStreak - potentialFallStreak;

    // 2. CIRCLE CONFIGURATION
    const radius = 100; // Slightly reduced to fit new UI
    const stroke = 10;  
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    // Colors
    const themeColor = isSafe ? "#10b981" : "#fbbf24"; 
    
    const glowStyle = {
        filter: isSafe 
            ? 'drop-shadow(0 0 10px rgba(16,185,129,0.6))' 
            : 'drop-shadow(0 0 10px rgba(251,191,36,0.6))',
        transition: 'stroke-dashoffset 1s ease-in-out, filter 0.5s ease'
    };

    // 3. WEEKLY CALENDAR LOGIC
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const currentDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDayIndex);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const isoKey = d.toISOString().split('T')[0];
        
        let outcome: 'pending' | 'success' | 'shield' | 'fail' | 'future' = 'future';
        
        if (i > currentDayIndex) {
            outcome = 'future';
        } else if (i === currentDayIndex) {
            if (user.dailyXP >= user.dailyTarget) outcome = 'success';
            else outcome = 'pending';
        } else {
            const historyStatus = user.streakHistory?.[isoKey];
            if (historyStatus) outcome = historyStatus as any;
            else outcome = 'fail'; 
        }

        return {
            label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
            date: d.getDate(),
            outcome
        };
    });

    const handleSetMode = (mode: DailyMode) => {
        dispatch.updateUser({ pendingMode: mode });
        dispatch.addToast(`Protocol Updated: ${mode.toUpperCase()}`, 'info');
    };

    return (
        <div className="flex flex-col items-center w-full">
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-life-muted mb-4 opacity-60">
                System Integrity
            </h2>

            <HeroSection 
                radius={radius}
                stroke={stroke}
                normalizedRadius={normalizedRadius}
                circumference={circumference}
                strokeDashoffset={strokeDashoffset}
                themeColor={themeColor}
                glowStyle={glowStyle}
                isSafe={isSafe}
                displayStreak={displayStreak}
                dailyXP={user.dailyXP}
                dailyTarget={user.dailyTarget}
                phaseColor={levelData.phaseColor}
            />

            <EvolutionGate 
                displayStreak={displayStreak}
                progress={levelData.progress}
                prevCheckpoint={levelData.prevCheckpoint}
            />

            <FallSimulator 
                streakLoss={streakLoss}
                potentialFallStreak={potentialFallStreak}
            />

            <WeeklySurvivalLog 
                shields={user.shields}
                weekDays={weekDays}
            />

            <NextCycleProtocol 
                pendingMode={user.pendingMode}
                handleSetMode={handleSetMode}
            />
        </div>
    );
};
