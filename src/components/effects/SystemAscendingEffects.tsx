import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAscension } from '../../contexts/AscensionContext';

export const SystemAscendingEffects: React.FC = () => {
    const { state } = useAscension();
    const isActive = state.ui.systemAscending.isActive;
    const [showActivation, setShowActivation] = useState(false);

    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (isActive) {
            const interval = setInterval(() => setTick(t => t + 1), 1000);
            return () => clearInterval(interval);
        }
    }, [isActive]);

    useEffect(() => {
        if (isActive) {
            setShowActivation(true);
            const timer = setTimeout(() => setShowActivation(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [isActive]);

    if (!isActive && !showActivation) return null;

    const remainingTimeSeconds = state.ui.systemAscending.activationTime ? Math.max(0, 15 * 60 - (new Date().getTime() - new Date(state.ui.systemAscending.activationTime).getTime()) / 1000) : 0;
    const progressPercent = (remainingTimeSeconds / (15 * 60)) * 100;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* 🏎️ COUNTDOWN TIMER BAR (1px thin Neon Yellow) */}
            {isActive && (
                <div className="fixed top-0 left-0 right-0 h-[1px] z-[10000] bg-black/20">
                    <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                        className="h-full bg-[#faff00] shadow-[0_0_10px_#faff00]"
                    />
                </div>
            )}

            {/* 🛑 FULL SCREEN ACTIVATION OVERLAY (YELLOW SCAN LINE IGNITION) */}
            <AnimatePresence>
                {showActivation && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden"
                    >
                        {/* THE SCAN LINE (Moving Outward from center) */}
                        <motion.div 
                            initial={{ height: 0, opacity: 1, top: '50%' }}
                            animate={{ 
                                height: ['0%', '100%'],
                                top: ['50%', '0%'],
                                opacity: [1, 1, 0]
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute left-0 right-0 z-10 bg-gradient-to-b from-transparent via-[#faff00] to-transparent"
                            style={{ borderTop: '2px solid #faff00', borderBottom: '2px solid #faff00', boxShadow: '0 0 50px #faff00' }}
                        />

                        {/* CENTRAL IGNITION BURST */}
                        <motion.div 
                            initial={{ scaleX: 0, opacity: 1 }}
                            animate={{ 
                                scaleX: [0, 1.5],
                                opacity: [1, 0]
                            }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="absolute h-[4px] w-full bg-white z-20 shadow-[0_0_30px_#fff]"
                        />

                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ 
                                scale: [0.9, 1],
                                opacity: [0, 1]
                            }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="text-center relative z-30"
                        >
                            <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-[0_0_30px_#faff00]">
                                COMMENCING <br/> ASCENSION
                            </h1>
                            <div className="mt-4 flex justify-center gap-4">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: [0, 40, 0] }}
                                        transition={{ duration: 0.5, delay: 0.2 + i * 0.05, repeat: 1 }}
                                        className="w-[2px] bg-[#faff00] shadow-[0_0_10px_#faff00]"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ⚡ RADIANT LIGHT BEAMS BG (Neon Yellow rising) */}
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-black">
                {/* Rising Beams */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <motion.div 
                            key={`beam-${i}`}
                            initial={{ bottom: '-10%', height: '10%' }}
                            animate={{ 
                                bottom: '110%',
                                height: ['20%', '60%', '20%'],
                                opacity: [0, 0.15, 0]
                            }}
                            transition={{ 
                                duration: 3 + Math.random() * 4, 
                                repeat: Infinity, 
                                delay: Math.random() * 5,
                                ease: "linear"
                            }}
                            className="absolute bg-gradient-to-t from-yellow-400/20 via-yellow-200/40 to-transparent blur-[2px]"
                            style={{ 
                                left: `${(i / 19) * 100}%`, 
                                width: `${1 + Math.random() * 3}px` 
                            }}
                        />
                    ))}
                </div>
                
                {/* Global Glow */}
                <motion.div 
                    animate={{ 
                        opacity: [0.05, 0.1, 0.05]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute inset-0 bg-yellow-400/5"
                />
            </div>
        </>
    );
};
