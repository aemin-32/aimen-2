
import React from 'react';
import { useAscension } from '../../contexts/AscensionContext';
import { Trophy, Star, X } from 'lucide-react';
import { playSound, playMonkSound, playTitanSound } from '../../utils/audio';
import BadgeAnimation from './BadgeAnimation';
import { motion, AnimatePresence } from 'framer-motion';

const BadgeUnlockModal: React.FC = () => {
    const { state, dispatch } = useAscension();
    const { modalData } = state.ui;

    React.useEffect(() => {
        if (modalData?.badge?.id === 'bdg_monk') {
            playMonkSound(modalData.tier);
        } else if (modalData?.badge?.id === 'bdg_titan') {
            playTitanSound(modalData.tier);
        } else if (modalData) {
            playSound('success');
        }
    }, [modalData]);

    if (!modalData || !modalData.badge) return null;

    const { badge, tier, rewards } = modalData;

    const handleClose = () => {
        dispatch.setModal('none');
    };

    // Style logic based on Tier
    let tierColor = 'text-gray-300 border-gray-300';
    let bgGlow = 'bg-gray-500';
    if (tier === 'gold') { tierColor = 'text-yellow-400 border-yellow-400'; bgGlow = 'bg-yellow-500'; }
    if (tier === 'diamond') { tierColor = 'text-cyan-400 border-cyan-400'; bgGlow = 'bg-cyan-500'; }
    if (tier === 'crimson') { tierColor = 'text-red-600 border-red-600'; bgGlow = 'bg-red-600'; }

    const isMonk = badge.id === 'bdg_monk';
    const isTitan = badge.id === 'bdg_titan';

    return (
        <div 
            onClick={handleClose} 
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300 ${(tier === 'crimson' && (isMonk || isTitan)) ? 'overflow-hidden' : ''}`}
        >
            {/* 🌌 FULL SCREEN EFFECTS FOR CRIMSON MONK / TITAN */}
            {tier === 'crimson' && (isMonk || isTitan) && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Liquid Ink / Fire Background */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.4, 0.2] }}
                        transition={{ duration: 2 }}
                        className={`absolute inset-0 ${isTitan ? 'bg-[conic-gradient(from_0deg,#7f1d1d22,#00000000,#7f1d1d22)]' : 'bg-[conic-gradient(from_0deg,#dc262622,#00000000,#dc262622)]'}`}
                    />
                    {/* Reality Warp / Screen Shake Simulation */}
                    <motion.div 
                        animate={{ 
                            x: [0, -5, 5, -5, 5, 0],
                            y: [0, 5, -5, 5, -5, 0]
                        }}
                        transition={{ duration: 0.2, repeat: 10, repeatDelay: 1 }}
                        className={`absolute inset-0 border-[20px] ${isTitan ? 'border-red-950/20' : 'border-red-900/10'}`}
                    />
                    {/* Global Effects */}
                    {isMonk ? (
                        /* Red Lightning for Monk */
                        [...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scaleX: [0, 3, 0],
                                    rotate: Math.random() * 360
                                }}
                                transition={{
                                    duration: 0.1,
                                    repeat: Infinity,
                                    repeatDelay: 2 + Math.random() * 3,
                                    ease: "linear"
                                }}
                                className="absolute w-full h-[2px] bg-red-500/40 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                                style={{ top: `${Math.random() * 100}%`, left: '0' }}
                            />
                        ))
                    ) : (
                        /* Fire/Embers for Titan */
                        [...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    y: [window.innerHeight, -100],
                                    x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                                    opacity: [0, 1, 0],
                                    scale: [1, 2, 1]
                                }}
                                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 5 }}
                                className="absolute w-2 h-2 bg-red-600 rounded-full blur-[2px]"
                                style={{ left: `${Math.random() * 100}%`, bottom: '-20px' }}
                            />
                        ))
                    )}
                </div>
            )}

            <div 
                onClick={(e) => e.stopPropagation()} 
                className="relative w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-50 slide-in-from-bottom-8 duration-700"
            >
                {/* 🎇 PARTICLES / GLOW */}
                <div className={`absolute inset-0 ${bgGlow} blur-[120px] opacity-20 rounded-full animate-pulse-slow pointer-events-none`} />

                {/* 🏅 ICON CONTAINER */}
                <div className="relative mb-6 group">
                    <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center bg-life-black shadow-[0_0_50px_currentColor] animate-bounce overflow-hidden ${tierColor}`}>
                        <BadgeAnimation 
                            badgeId={badge.id} 
                            tier={tier} 
                            icon={badge.icon} 
                            isUnlocked={true} 
                        />
                    </div>
                    {/* Rotating Stars */}
                    <div className="absolute inset-0 animate-[spin_4s_linear_infinite] pointer-events-none">
                        <Star size={24} className={`absolute -top-4 left-1/2 -translate-x-1/2 ${tierColor.split(' ')[0]} fill-current`} />
                        <Star size={24} className={`absolute -bottom-4 left-1/2 -translate-x-1/2 ${tierColor.split(' ')[0]} fill-current`} />
                    </div>
                </div>

                {/* 📜 TEXT */}
                <div className="space-y-2 mb-8 relative z-10">
                    <h3 className={`text-sm font-black uppercase tracking-[0.3em] ${tierColor.split(' ')[0]}`}>
                        Protocol Achievement
                    </h3>
                    <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-xl">
                        {badge.name}
                    </h1>
                    <div className={`inline-block px-3 py-1 rounded border text-xs font-black uppercase tracking-widest bg-black/50 ${tierColor}`}>
                        {tier} Rank
                    </div>
                </div>

                {/* 🎁 REWARDS */}
                <div className="flex gap-4 mb-8">
                    <div className="bg-life-paper/80 border border-life-muted/30 px-4 py-2 rounded-xl">
                        <span className="block text-[10px] text-life-muted uppercase font-bold">XP Gain</span>
                        <span className="text-lg font-mono font-bold text-white">+{rewards.xp}</span>
                    </div>
                    <div className="bg-life-paper/80 border border-life-muted/30 px-4 py-2 rounded-xl">
                        <span className="block text-[10px] text-life-muted uppercase font-bold">Gold</span>
                        <span className="text-lg font-mono font-bold text-life-gold">+{rewards.gold}</span>
                    </div>
                </div>

                {/* 👇 ACTION */}
                <button 
                    onClick={handleClose}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-black shadow-xl hover:scale-105 active:scale-95 transition-all ${bgGlow.replace('bg-', 'bg-')}`}
                >
                    Claim Glory
                </button>

            </div>
        </div>
    );
};

export default BadgeUnlockModal;
