import React from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

interface WeekDay {
    label: string;
    date: number;
    outcome: 'pending' | 'success' | 'shield' | 'fail' | 'future';
}

interface WeeklySurvivalLogProps {
    shields: { easy: number; normal: number; hard: number };
    weekDays: WeekDay[];
}

export const WeeklySurvivalLog: React.FC<WeeklySurvivalLogProps> = ({
    shields,
    weekDays
}) => {
    return (
        <div className="w-full mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4 px-2">
                <span className="text-[10px] sm:text-xs text-life-muted uppercase font-bold tracking-widest text-center sm:text-left">
                    Weekly Survival Log
                </span>
                <div className="flex flex-wrap justify-center items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-life-easy/10 border border-life-easy/20">
                        <Shield size={12} className="text-life-easy fill-life-easy/20" />
                        <span className="text-[10px] text-life-easy font-bold font-mono">
                            {shields.easy} <span className="text-life-easy/50 text-[8px] uppercase">EASY</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-life-normal/10 border border-life-normal/20">
                        <Shield size={12} className="text-life-normal fill-life-normal/20" />
                        <span className="text-[10px] text-life-normal font-bold font-mono">
                            {shields.normal} <span className="text-life-normal/50 text-[8px] uppercase">NORM</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-life-hard/10 border border-life-hard/20">
                        <Shield size={12} className="text-life-hard fill-life-hard/20" />
                        <span className="text-[10px] text-life-hard font-bold font-mono">
                            {shields.hard} <span className="text-life-hard/50 text-[8px] uppercase">HARD</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between bg-life-black/50 p-4 rounded-2xl border border-life-muted/10 backdrop-blur-sm">
                {weekDays.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2.5 flex-1">
                        <div className={`
                            w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all shadow-sm
                            ${day.outcome === 'success' ? 'bg-life-easy/10 border-life-easy text-life-easy shadow-[0_0_8px_rgba(16,185,129,0.15)]' :
                              day.outcome === 'shield' ? 'bg-life-diamond/10 border-life-diamond text-life-diamond' :
                              day.outcome === 'fail' ? 'bg-life-hard/10 border-life-hard text-life-hard' :
                              day.outcome === 'pending' ? 'bg-life-gold/5 border-life-gold text-life-gold animate-pulse' :
                              'bg-transparent border-transparent text-life-muted/10'}
                        `}>
                            {day.outcome === 'success' && <CheckCircle size={16} />}
                            {day.outcome === 'shield' && <Shield size={16} />}
                            {day.outcome === 'fail' && <XCircle size={16} />}
                            {day.outcome === 'pending' && <div className="w-2 h-2 bg-life-gold rounded-full shadow-[0_0_5px_currentColor]" />}
                            {day.outcome === 'future' && <div className="w-1.5 h-1.5 bg-life-muted/10 rounded-full" />}
                        </div>
                        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${day.outcome === 'future' ? 'text-life-muted/20' : 'text-life-muted'}`}>
                            {day.label[0]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
