import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FallSimulatorProps {
    streakLoss: number;
    potentialFallStreak: number;
}

export const FallSimulator: React.FC<FallSimulatorProps> = ({
    streakLoss,
    potentialFallStreak
}) => {
    return (
        <div className="w-full bg-life-hard/5 rounded-2xl p-5 border border-life-hard/30 flex flex-col gap-3 relative overflow-hidden mb-8 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-life-hard" />
            <div className="flex justify-between items-center pl-2">
                <div className="flex items-center gap-2.5">
                    <AlertTriangle size={18} className="text-life-hard animate-pulse" />
                    <span className="text-xs sm:text-sm font-black uppercase text-life-hard tracking-widest">Failure Consequence</span>
                </div>
                <span className="text-xs font-black text-life-hard uppercase bg-life-hard/20 px-3 py-1 rounded-md border border-life-hard/30">Streak -{streakLoss}</span>
            </div>
            <div className="text-sm sm:text-base text-life-text pl-9 leading-relaxed mt-1">
                If daily target is missed, streak falls to <span className="font-mono font-black text-life-gold bg-life-gold/10 px-2 py-0.5 rounded mx-1">{potentialFallStreak}</span> (Safety Net).
            </div>
        </div>
    );
};
