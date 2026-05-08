import React from 'react';
import { TrendingUp, CheckCircle, Crosshair, Lock, Shield } from 'lucide-react';
import { LEVELS } from '../../../utils/habitEngine';

interface EvolutionGateProps {
    displayStreak: number;
    progress: number;
    prevCheckpoint: number;
}

export const EvolutionGate: React.FC<EvolutionGateProps> = ({
    displayStreak,
    progress,
    prevCheckpoint
}) => {
    return (
        <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2 text-life-muted/50">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Evolution Gate</span>
                </div>
                <span className="text-[9px] font-mono text-life-gold">{progress}% to Next</span>
            </div>
            
            <div className="relative py-4 bg-life-black/30 rounded-xl border border-life-muted/10">
                 {/* Connecting Line */}
                 <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-life-muted/10 -translate-y-1/2 z-0" />
                 
                 <div className="flex items-center gap-4 relative z-10 overflow-x-auto no-scrollbar pb-2 px-4 snap-x">
                    {LEVELS.map((lvl) => {
                        const isPassed = displayStreak >= lvl;
                        const isNext = !isPassed && displayStreak < lvl && (displayStreak >= (LEVELS[LEVELS.indexOf(lvl)-1] || 0));
                        const isSafetyNet = lvl === prevCheckpoint;

                        return (
                            <div key={lvl} className="flex flex-col items-center gap-2 min-w-[40px] snap-center shrink-0">
                                <div 
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all relative
                                        ${isPassed 
                                            ? 'bg-life-gold border-life-gold text-life-black shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                                            : isNext
                                                ? 'bg-life-black border-life-gold text-life-gold animate-pulse scale-110 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                                                : 'bg-life-black border-life-muted/20 text-life-muted/30'}
                                    `}
                                >
                                    {isPassed ? <CheckCircle size={14} /> : isNext ? <Crosshair size={14} /> : <Lock size={12} />}
                                    
                                    {/* Safety Net Indicator */}
                                    {isSafetyNet && (
                                        <div className="absolute -bottom-2 -right-2 bg-life-black border border-life-muted/50 rounded-full p-0.5" title="Safety Net">
                                            <Shield size={8} className="text-life-text" />
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[9px] font-mono font-bold ${isPassed || isNext ? 'text-life-text' : 'text-life-muted/30'}`}>
                                    {lvl}
                                </span>
                            </div>
                        );
                    })}
                 </div>
            </div>
        </div>
    );
};
