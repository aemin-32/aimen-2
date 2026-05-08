
import React from 'react';
import { motion } from 'framer-motion';
import { BadgeTier } from '../../types/badgeTypes';

interface BadgeAnimationProps {
    badgeId: string;
    tier: BadgeTier;
    icon: string | React.ReactNode;
    isUnlocked: boolean;
}

const MonkArt = ({ tier, isUnlocked }: { tier: BadgeTier, isUnlocked: boolean }) => {
    const color = tier === 'silver' ? '#d1d5db' : 
                  tier === 'gold' ? '#fbbf24' : 
                  tier === 'diamond' ? '#22d3ee' : '#dc2626';

    return (
        <motion.svg 
            viewBox="0 0 100 100" 
            className={`w-20 h-20 ${!isUnlocked ? 'grayscale opacity-30' : ''}`}
            initial={false}
        >
            {/* Stylized Meditating Figure */}
            <motion.path
                d="M50 15c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7zM35 55c0-8 6-15 15-15s15 7 15 15v5H35v-5zM25 75c0-5 4-10 10-10h30c6 0 10 5 10 10s-4 10-10 10H35c-6 0-10-5-10-10z"
                fill={color}
                animate={tier === 'crimson' ? {
                    fill: ['#dc2626', '#7f1d1d', '#dc2626'],
                    scale: [1, 1.05, 1]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Heart/Core Glow */}
            <motion.circle
                cx="50" cy="50" r="4"
                fill="white"
                animate={{
                    scale: [1, 2, 1],
                    opacity: [0.3, 0.8, 0.3],
                    filter: [`blur(2px)`, `blur(6px)`, `blur(2px)`]
                }}
                transition={{ duration: 3, repeat: Infinity }}
            />
        </motion.svg>
    );
};

const TitanArt = ({ tier, isUnlocked }: { tier: BadgeTier, isUnlocked: boolean }) => {
    const color = tier === 'silver' ? '#94a3b8' : 
                  tier === 'gold' ? '#fbbf24' : 
                  tier === 'diamond' ? '#22d3ee' : '#dc2626';

    return (
        <motion.svg 
            viewBox="0 0 100 100" 
            className={`w-20 h-20 ${!isUnlocked ? 'grayscale opacity-30' : ''}`}
            initial={false}
        >
            {/* The Weight (Massive Stone) */}
            <motion.path
                d="M20 40 L80 40 L85 60 L15 60 Z"
                fill={tier === 'crimson' ? '#450a0a' : '#1e293b'}
                stroke={color}
                strokeWidth="2"
                animate={tier === 'silver' ? {
                    y: [0, -10, 0]
                } : tier === 'gold' ? {
                    y: [0, -15, 0],
                    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
                } : {
                    y: [0, -20, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* The Titan (Stylized Powerful Arm/Torso) */}
            <motion.path
                d="M50 85 L40 60 L60 60 L50 85 Z M40 60 L30 45 L40 40 L50 55 L60 40 L70 45 L60 60"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={tier === 'silver' ? {
                    scaleY: [1, 0.9, 1],
                    translateY: [0, 2, 0]
                } : {
                    scaleY: [1, 0.85, 1],
                    translateY: [0, 4, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Cracks / Power Lines (God of War style) */}
            {tier !== 'silver' && (
                <motion.path
                    d="M30 50 L35 55 M65 55 L70 50 M45 45 L50 40 L55 45"
                    stroke={color}
                    strokeWidth="1"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            )}

            {/* Crimson Elemental Effects */}
            {tier === 'crimson' && (
                <motion.circle
                    cx="50" cy="50" r="30"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="0.5"
                    strokeDasharray="5 5"
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
            )}
        </motion.svg>
    );
};

const BadgeAnimation: React.FC<BadgeAnimationProps> = ({ badgeId, tier, icon, isUnlocked }) => {
    if (badgeId === 'bdg_monk') {
        if (tier === 'silver') {
            return (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-life-black rounded-full">
                    <motion.div
                        animate={{
                            scale: [0.8, 1.2, 0.8],
                            opacity: [0.05, 0.15, 0.05],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-full h-full border border-white rounded-full"
                    />
                    <div className="relative z-10">
                        <MonkArt tier={tier} isUnlocked={isUnlocked} />
                    </div>
                </div>
            );
        }
        
        if (tier === 'gold') {
            return (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-life-black rounded-full">
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-[radial-gradient(circle,rgba(251,191,36,0.15)_0%,transparent_70%)]"
                    />
                    <div className="relative z-10">
                        <MonkArt tier={tier} isUnlocked={isUnlocked} />
                    </div>
                </div>
            );
        }

        if (tier === 'diamond') {
            return (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-life-black rounded-full">
                    {/* Crystalline Background Layers */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                rotate: [i * 45, i * 45 + 360],
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{
                                duration: 15 + i * 5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute w-32 h-32 border border-cyan-400/20"
                            style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                        />
                    ))}
                    
                    {/* Refraction Beams */}
                    <motion.div
                        animate={{ opacity: [0.2, 0.5, 0.2], x: [-20, 20, -20] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                    />
                    
                    <div className="relative z-10">
                        <MonkArt tier={tier} isUnlocked={isUnlocked} />
                    </div>
                </div>
            );
        }

        if (tier === 'crimson') {
            return (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-life-black rounded-full">
                    {/* Liquid Ink Swirls */}
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -360],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-[conic-gradient(from_0deg,#dc262622,#00000000,#dc262622)]"
                    />
                    
                    {/* Pulsing Core Shadow */}
                    <motion.div
                        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-24 h-24 bg-red-600/10 blur-2xl rounded-full"
                    />

                    {/* Red Lightning Arcs */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: [0, 1, 0],
                                scaleX: [0, 2, 0],
                                rotate: Math.random() * 360
                            }}
                            transition={{
                                duration: 0.15,
                                repeat: Infinity,
                                repeatDelay: 1 + Math.random() * 2,
                                ease: "easeOut"
                            }}
                            className="absolute w-full h-[1px] bg-red-500/80 shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                        />
                    ))}
                    
                    <div className="relative z-10">
                        <MonkArt tier={tier} isUnlocked={isUnlocked} />
                    </div>
                </div>
            );
        }
    }

    if (badgeId === 'bdg_titan') {
        if (tier === 'silver') {
            return (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-life-black rounded-full">
                    <motion.div
                        animate={{
                            y: [0, 5, 0],
                            opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-b from-slate-500/20 to-transparent"
                    />
                    <div className="relative z-10">
                        <TitanArt tier={tier} isUnlocked={isUnlocked} />
                    </div>
                </div>
            );
        }

        if (tier === 'gold') {
            return (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-life-black rounded-full">
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-full h-full bg-yellow-500/10 rounded-full blur-xl"
                    />
                    <div className="relative z-10">
                        <TitanArt tier={tier} isUnlocked={isUnlocked} />
                    </div>
                </div>
            );
        }

        if (tier === 'diamond') {
            return (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-life-black rounded-full">
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                rotate: i * 90,
                                opacity: [0.1, 0.3, 0.1],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                            className="absolute w-full h-1 bg-cyan-400/20 blur-sm"
                        />
                    ))}
                    <div className="relative z-10">
                        <TitanArt tier={tier} isUnlocked={isUnlocked} />
                    </div>
                </div>
            );
        }

        if (tier === 'crimson') {
            return (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-life-black rounded-full">
                    {/* Screen Shake Simulation for the container */}
                    <motion.div
                        animate={{
                            x: [-1, 1, -1, 1, 0],
                            y: [1, -1, 1, -1, 0]
                        }}
                        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2 }}
                        className="absolute inset-0 bg-red-950/20"
                    />
                    {/* Fire/Embers */}
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [100, -100],
                                x: [Math.random() * 20 - 10, Math.random() * 20 - 10],
                                opacity: [0, 1, 0]
                            }}
                            transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
                            className="absolute w-1 h-1 bg-red-500 rounded-full blur-[1px]"
                            style={{ left: `${Math.random() * 100}%`, bottom: '0' }}
                        />
                    ))}
                    <div className="relative z-10">
                        <TitanArt tier={tier} isUnlocked={isUnlocked} />
                    </div>
                </div>
            );
        }
    }

    // Default fallback for other badges
    return (
        <div className={`text-5xl ${!isUnlocked ? 'grayscale opacity-50' : ''}`}>
            {icon}
        </div>
    );
};

export default BadgeAnimation;
