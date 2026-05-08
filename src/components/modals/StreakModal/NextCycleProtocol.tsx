import React from 'react';
import { Zap } from 'lucide-react';
import { DailyMode } from '../../../types/types';
import { DAILY_TARGETS } from '../../../types/constants';

interface NextCycleProtocolProps {
    pendingMode: DailyMode;
    handleSetMode: (mode: DailyMode) => void;
}

export const NextCycleProtocol: React.FC<NextCycleProtocolProps> = ({
    pendingMode,
    handleSetMode
}) => {
    return (
        <div className="w-full pt-6 border-t border-life-muted/10">
            <div className="flex items-center justify-center gap-2 mb-5 text-life-muted/60">
                <Zap size={14} />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">Next Cycle Protocol</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {Object.values(DailyMode).map((mode) => {
                    const isSelected = pendingMode === mode;
                    const styles = {
                        [DailyMode.EASY]: { color: 'text-life-easy', border: 'border-life-easy', shadow: 'shadow-life-easy/20' },
                        [DailyMode.NORMAL]: { color: 'text-life-normal', border: 'border-life-normal', shadow: 'shadow-life-normal/20' },
                        [DailyMode.HARD]: { color: 'text-life-hard', border: 'border-life-hard', shadow: 'shadow-life-hard/20' },
                    };
                    const theme = styles[mode];
                    let label = '', xp = DAILY_TARGETS[mode], salary = 50;
                    if (mode === DailyMode.EASY) { label = 'Recover'; salary = 50; }
                    if (mode === DailyMode.NORMAL) { label = 'Maintain'; salary = 100; }
                    if (mode === DailyMode.HARD) { label = 'War'; salary = 200; }

                    return (
                        <button
                            key={mode}
                            onClick={() => handleSetMode(mode)}
                            className={`
                                relative flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-all duration-300
                                ${isSelected 
                                    ? `bg-transparent border-2 ${theme.border} ${theme.color} shadow-[0_0_20px_-5px] ${theme.shadow} scale-105` 
                                    : 'bg-life-black border border-life-muted/10 text-life-muted/50 hover:border-life-muted/30 hover:text-life-muted'}
                            `}
                        >
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-2">{label}</span>
                            <div className="flex flex-col items-center">
                                <span className="text-base sm:text-lg font-black font-mono tracking-tight">{xp} XP</span>
                                <span className="text-[10px] sm:text-xs opacity-80 font-mono mt-1">+{salary} G</span>
                            </div>
                            {isSelected && <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${theme.color.replace('text-', 'bg-')} shadow-[0_0_5px_currentColor] animate-pulse`} />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
