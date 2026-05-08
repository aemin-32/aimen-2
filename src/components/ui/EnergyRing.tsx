
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAscension } from '../../contexts/AscensionContext';

interface EnergyRingProps {
    size: number;
    strokeWidth?: number;
}

export const EnergyRing: React.FC<EnergyRingProps> = ({ size, strokeWidth = 2 }) => {
    const { state } = useAscension();
    const points = state.ui.systemAscending.recentCompletions.reduce((sum, c) => sum + c.points, 0);
    const isAscending = state.ui.systemAscending.isActive;
    
    const [lastPoints, setLastPoints] = useState(points);
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        if (points > lastPoints) {
            setFlash(true);
            const timer = setTimeout(() => setFlash(false), 800);
            setLastPoints(points);
            return () => clearTimeout(timer);
        } else if (points < lastPoints) {
            setLastPoints(points);
        }
    }, [points, lastPoints]);

    if (isAscending) return null;

    const radius = (size - 4) / 2; // Keep it slightly inside the SVG container
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(100, (points / 12) * 100) / 100;
    const offset = circumference - progress * circumference;

    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <motion.svg
                className="absolute inset-0 z-0 pointer-events-none"
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ rotate: -90 }}
            >
                {/* Background Track (Dark Blue) */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#003333"
                    strokeWidth={strokeWidth}
                    className="opacity-30"
                />

                {/* CYAN RESONANCE: Pulsing outward ring */}
                <AnimatePresence>
                    {points >= 12 && (
                        <motion.circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="#00FFFF"
                            strokeWidth={strokeWidth / 2}
                            initial={{ opacity: 0.8, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.3 }}
                            transition={{ 
                                duration: 1.5, 
                                repeat: Infinity, 
                                ease: "easeOut"
                            }}
                        />
                    )}
                </AnimatePresence>
                
                {/* Flash Effect */}
                <AnimatePresence>
                    {flash && (
                        <motion.circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="#00FFFF"
                            strokeWidth={strokeWidth * 2}
                            initial={{ opacity: 0.8, scale: 0.95 }}
                            animate={{ opacity: 0, scale: 1.15 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    )}
                </AnimatePresence>

                {/* Glowing Fill (Electric Cyan) */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#00FFFF"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    animate={{ 
                        strokeDashoffset: offset,
                        filter: points >= 12 
                            ? ['drop-shadow(0 0 4px #00FFFF)', 'drop-shadow(0 0 15px #00FFFF)', 'drop-shadow(0 0 4px #00FFFF)'] 
                            : flash ? 'drop-shadow(0 0 12px #00FFFF)' : 'drop-shadow(0 0 4px #00FFFF)',
                        strokeWidth: points >= 12 ? [strokeWidth, strokeWidth + 0.5, strokeWidth] : strokeWidth
                    }}
                    transition={{ 
                        strokeDashoffset: { duration: 0.5 },
                        filter: { duration: points >= 12 ? 0.2 : 0.4, repeat: points >= 12 ? Infinity : 0 },
                        strokeWidth: { duration: 0.2, repeat: points >= 12 ? Infinity : 0 }
                    }}
                    strokeDasharray={circumference}
                    className="transition-all duration-500 ease-out"
                />
            </motion.svg>
        </div>
    );
};
