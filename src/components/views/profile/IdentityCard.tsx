
import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, Zap } from 'lucide-react';
import { UserProfile, Stat } from '../../../types/types';
import { BadgeProgress } from '../../../types/badgeTypes';
import { useAscension } from '../../../contexts/AscensionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarIcon } from '../../../utils/avatar-helpers';
import { EnergyRing } from '../../ui/EnergyRing';

import { getProfileBorder, getProfileBackground, getTitlePrefix } from '../../../utils/cosmetic-helpers';
import { DynamicAvatar } from './DynamicAvatar';

interface IdentityCardProps {
    user: UserProfile;
    dynamicTitle: string;
    featuredBadgesData: BadgeProgress[];
}

export const IdentityCard: React.FC<IdentityCardProps> = ({ user, dynamicTitle, featuredBadgesData }) => {
    const { state: lifeState, dispatch } = useAscension();
    const isAscending = lifeState.ui.systemAscending.isActive;
    const points = lifeState.ui.systemAscending.recentCompletions.reduce((sum, item) => sum + item.points, 0);
    const isPrimed = points >= 12 && !isAscending;

    const [remainingTime, setRemainingTime] = useState(0);

    useEffect(() => {
        if (isAscending && lifeState.ui.systemAscending.activationTime) {
            const timer = setInterval(() => {
                const now = new Date().getTime();
                const activationTime = new Date(lifeState.ui.systemAscending.activationTime!).getTime();
                const timeLeft = Math.max(0, 15 * 60 - (now - activationTime) / 1000);
                setRemainingTime(timeLeft);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isAscending, lifeState.ui.systemAscending.activationTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const [milestoneReached, setMilestoneReached] = useState<string | null>(null);
    const cosmetics = user.profileCosmetics || {};

    // 🏆 REWARD LOOP: Detect Stat Milestones
    useEffect(() => {
        const milestones = [10, 20, 40, 60, 80, 100];
        const stats = user.stats;
        
        // Check if any stat just hit a milestone
        for (const stat of Object.keys(stats) as Stat[]) {
            const val = stats[stat];
            if (milestones.includes(val)) {
                // To avoid repeating the animation, we could store the last seen milestone in local storage or state
                // For now, we'll trigger it when the component mounts if they are AT a milestone
                setMilestoneReached(`${stat} Milestone: ${val}`);
                setTimeout(() => setMilestoneReached(null), 4000);
                break;
            }
        }
    }, [user.stats]);

    const handleOpenSheet = () => {
        dispatch.setModal('characterSheet');
    };

    const borderClass = getProfileBorder(cosmetics.borderId);
    const bgClass = getProfileBackground(cosmetics.backgroundId);
    const prefix = getTitlePrefix(cosmetics.titlePrefixId);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleOpenSheet}
            className={`bg-life-paper rounded-xl p-6 mb-6 relative overflow-hidden group cursor-pointer transition-all shadow-lg ${borderClass}`}
        >
            {/* 🎆 MILESTONE ANIMATION OVERLAY */}
            <AnimatePresence>
                {milestoneReached && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-life-gold/20 backdrop-blur-sm pointer-events-none"
                    >
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="text-white mb-2"
                        >
                            <Sparkles size={48} />
                        </motion.div>
                        <h3 className="text-white font-black text-xl uppercase tracking-[0.3em] drop-shadow-lg">
                            {milestoneReached}
                        </h3>
                        <p className="text-life-gold text-[10px] font-bold uppercase mt-1">Attribute Evolution Detected</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Layer */}
            <div className={`absolute inset-0 pointer-events-none z-0 ${bgClass}`} />
            
            {/* Glitch Overlay (Optional Cosmetic) */}
            {cosmetics.glitchEffect && (
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay animate-pulse bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            )}
            
            {/* Header Section */}
            <div className="flex items-center gap-5 mb-6 relative z-10">
                <div 
                    className="flex-shrink-0 relative p-1 cursor-pointer"
                    onClick={() => dispatch.triggerAscension()}
                >
                    <EnergyRing size={88} />
                    <DynamicAvatar user={user} size={80} />
                </div>
                
                <div className="flex flex-col">
                    <h2 className={`text-2xl font-black tracking-tight uppercase group-hover:text-life-gold transition-all leading-tight ${isAscending ? 'text-white' : 'text-life-text'}`}
                        style={{ textShadow: isAscending ? '0 0 15px rgba(255, 255, 255, 0.4)' : 'none' }}>
                        <span className={`${isAscending ? 'text-red-500' : 'text-life-gold'} opacity-50 mr-1`}>{prefix}</span>
                        {user.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                        {/* ASCENSION STATUS MODULE */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-white/5 backdrop-blur-sm">
                            <Zap 
                                size={10} 
                                className={
                                    isAscending ? "text-[#FFD35B] animate-pulse" : 
                                    isPrimed ? "text-[#00FFFF] animate-pulse" : 
                                    "text-life-muted"
                                } 
                            />
                            
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black tracking-widest uppercase transition-all duration-500 font-mono ${
                                    isAscending ? 'text-[#FFD35B] drop-shadow-[0_0_5px_#FFD35B]' : 
                                    isPrimed ? 'text-[#00FFFF] drop-shadow-[0_0_5px_#00FFFF]' : 
                                    'text-life-muted/60'
                                }`}>
                                    {isAscending ? `ASCENDING: 2.0x` : isPrimed ? 'READY TO ASCEND' : 'SYSTEM: STANDBY'}
                                </span>
                                
                                {isAscending && (
                                    <>
                                        <div className="w-[1px] h-2 bg-white/10" />
                                        <span className="text-[9px] font-mono font-black text-white/90">
                                            {formatTime(remainingTime)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <span className={`text-[9px] font-mono tracking-widest uppercase transition-all ${isAscending ? 'text-[#FFD35B] opacity-100' : 'text-life-muted opacity-60'}`}
                            style={{ textShadow: isAscending ? '0 0 8px #FFD35B' : 'none' }}>
                            {dynamicTitle}
                        </span>
                    </div>
                </div>
            </div>
            
            {featuredBadgesData.length > 0 && (
                <div className="flex justify-start gap-2 mb-6 relative z-10">
                    {featuredBadgesData.map(data => {
                        const tier = data!.currentTier;
                        let color = 'text-gray-400';
                        if (tier === 'gold') color = 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]';
                        if (tier === 'diamond') color = 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]';
                        if (tier === 'crimson') color = 'text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]';
                        
                        return (
                            <motion.div 
                                key={data!.badge.id} 
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                className="relative group/badge cursor-help" 
                                title={data!.badge.name}
                            >
                                <div className={`w-8 h-8 rounded-full bg-life-black border border-zinc-800 flex items-center justify-center ${color}`}>
                                    <span className="text-sm">{data!.badge.icon}</span>
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-life-paper bg-current ${color}`} />
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* XP Progress Bar */}
            <div className={`bg-black/60 rounded-lg p-3 backdrop-blur-md border relative z-10 transition-all duration-300 ${isAscending ? 'border-[#FFD35B]/50 shadow-[0_0_20px_rgba(255,211,91,0.2)]' : 'border-zinc-800'}`}>
                <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                    <div className="flex items-center gap-1 text-white" style={{ textShadow: isAscending ? '0 0 10px rgba(255, 211, 91, 0.4)' : 'none' }}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAscending ? 'animate-pulse bg-[#FFD35B] shadow-[0_0_8px_#FFD35B]' : 'bg-[#FFD35B]'}`} />
                        <span>XP Progress</span>
                    </div>
                    <div className="text-white/40">
                        <span className="text-[#FFD35B]" style={{ textShadow: isAscending ? '0 0 10px #FFD35B' : 'none' }}>{user.currentXP}</span>
                        <span className="ml-1">/ {user.targetXP}</span>
                    </div>
                </div>
                <div className="h-[4px] bg-black/80 rounded-full relative border border-zinc-900/50 overflow-hidden">
                    {/* Unlit Tube Track */}
                    <div className="absolute inset-0 rounded-full opacity-10 bg-[#FFD35B]" />

                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                            width: `${Math.min(100, (user.currentXP / user.targetXP) * 100)}%`,
                        }}
                        transition={{ 
                            width: { type: "spring", stiffness: 40, damping: 12 },
                        }}
                        className="h-full relative z-10 rounded-full bg-[#FFD35B]" 
                        style={{ 
                            boxShadow: isAscending ? '0 0 15px #FFD35B, inset 0 0 4px #FFD35B' : 'none',
                        }}
                    >
                        {/* Ignite Effects (Only during Ascension) */}
                        {isAscending && (
                          <>
                            {/* 1px White Core */}
                            <div className="absolute inset-x-0 top-[1px] h-[1px] bg-white/90 rounded-full z-10" />
                            
                            {/* Light Bleed Pulse */}
                            <motion.div 
                                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="absolute inset-0 bg-white blur-[2px] rounded-full"
                            />
                          </>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Click Indicator */}
            <div className="absolute top-3 right-3 text-life-muted/30 group-hover:text-life-gold/50 transition-colors">
                <ChevronRight size={16} />
            </div>
        </motion.div>
    );
};
