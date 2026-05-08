
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dispatchDataBurst } from '../../effects/DataBurst';
import { Stat, UserProfile } from '../../../types/types';
import { Sparkles, TrendingUp, Brain } from 'lucide-react';
import { playSound } from '../../../utils/audio';

interface StatMilestoneTriggerProps {
    user: UserProfile;
}

export const StatMilestoneTrigger: React.FC<StatMilestoneTriggerProps> = ({ user }) => {
    const prevStats = useRef(user.stats);
    const [activeMilestone, setActiveMilestone] = useState<{ stat: Stat, value: number } | null>(null);

    useEffect(() => {
        const statsToWatch = [Stat.STR, Stat.INT];
        
        for (const stat of statsToWatch) {
            const currentVal = user.stats[stat] || 0;
            const prevVal = prevStats.current[stat] || 0;

            // Define milestone as every 10 points
            const currentMilestone = Math.floor(currentVal / 10);
            const prevMilestone = Math.floor(prevVal / 10);

            if (currentMilestone > prevMilestone && currentVal > 0) {
                // Milestone reached!
                triggerMilestone(stat, currentMilestone * 10);
            }
        }

        prevStats.current = user.stats;
    }, [user.stats]);

    const triggerMilestone = (stat: Stat, value: number) => {
        // 1. Digital Data Burst
        dispatchDataBurst();

        // 2. Sound
        playSound('level-up', user.preferences.soundEnabled);

        // 3. UI Overlay
        setActiveMilestone({ stat, value });

        // Auto close after 3 seconds
        setTimeout(() => {
            setActiveMilestone(null);
        }, 3000);
    };

    return (
        <AnimatePresence>
            {activeMilestone && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: -50 }}
                    className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center p-6"
                >
                    <div className="bg-life-black/80 backdrop-blur-xl border-2 border-life-gold rounded-2xl p-8 shadow-[0_0_50px_rgba(251,191,36,0.3)] flex flex-col items-center text-center max-w-xs relative overflow-hidden">
                        {/* Animated background glow */}
                        <div className={`absolute inset-0 opacity-20 ${activeMilestone.stat === Stat.STR ? 'bg-red-500' : 'bg-blue-500'} blur-3xl animate-pulse`} />
                        
                        <div className={`w-20 h-20 rounded-full ${activeMilestone.stat === Stat.STR ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-blue-500/20 text-blue-500 border-blue-500/30'} border-2 flex items-center justify-center mb-4 relative z-10 shadow-lg`}>
                            {activeMilestone.stat === Stat.STR ? <TrendingUp size={40} /> : <Brain size={40} />}
                        </div>

                        <h2 className="text-sm font-black text-life-gold uppercase tracking-[0.3em] mb-1 relative z-10">
                            Milestone Reached
                        </h2>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2 relative z-10">
                            {activeMilestone.stat === Stat.STR ? 'Strength' : 'Intelligence'} LVL {activeMilestone.value / 10}
                        </h3>
                        
                        <div className="flex items-center gap-2 relative z-10">
                            <Sparkles className="text-life-gold animate-spin-slow" size={16} />
                            <span className="text-[10px] font-mono text-life-muted tracking-widest uppercase">Attributes Evolved</span>
                            <Sparkles className="text-life-gold animate-spin-slow" size={16} />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
