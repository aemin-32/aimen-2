import React, { useState, useEffect, useRef } from 'react';
import { Stat, UserProfile } from '../../../types/types';
import { toRoman } from '../../../utils/roman-helpers';
import StatsRadar from '../../StatsRadar';
import { getStatIcon, getStatColor } from '../../../utils/stat-helpers';
import { Hexagon, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAscension } from '../../../contexts/AscensionContext';

// --- HOOK: The Balance Algorithm ---
const useBalanceAlgorithm = (stats: Record<Stat, number>) => {
    const xpValues = {
        [Stat.STR]: stats.STR || 0,
        [Stat.INT]: stats.INT || 0,
        [Stat.DIS]: stats.DIS || 0,
        [Stat.HEA]: stats.HEA || 0,
        [Stat.CRT]: stats.CRT || 0,
        [Stat.SPR]: stats.SPR || 0,
        [Stat.REL]: stats.REL || 0,
        [Stat.FIN]: stats.FIN || 0,
    };

    const maxXP = Math.max(...Object.values(xpValues));

    let globalTarget = 20;
    if (maxXP >= 1280) globalTarget = 2560;
    else if (maxXP >= 640) globalTarget = 1280;
    else if (maxXP >= 320) globalTarget = 640;
    else if (maxXP >= 160) globalTarget = 320;
    else if (maxXP >= 80) globalTarget = 160;
    else if (maxXP >= 40) globalTarget = 80;
    else if (maxXP >= 20) globalTarget = 40;

    return { xpValues, globalTarget };
};

// --- CONSTANTS ---
const STAT_FULL_NAMES: Record<Stat, string> = {
    [Stat.STR]: 'Strength',
    [Stat.INT]: 'Intelligence',
    [Stat.DIS]: 'Discipline',
    [Stat.HEA]: 'Health',
    [Stat.CRT]: 'Creativity',
    [Stat.SPR]: 'Spirit',
    [Stat.REL]: 'Relation',
    [Stat.FIN]: 'Finance',
};

// --- SUB-COMPONENT: Stat Data Row ---
interface StatRowProps {
    stat: Stat;
    xp: number;
    target: number;
    onIncrease?: (color: string) => void;
}

const StatDataRow: React.FC<StatRowProps> = ({ stat, xp, target, onIncrease }) => {
    const percentage = target > 0 ? Math.min((xp / target) * 100, 100) : 0;
    const Icon = getStatIcon(stat);
    const color = getStatColor(stat);
    const fullName = STAT_FULL_NAMES[stat] || stat;
    const prevXp = useRef(xp);
    const { state: lifeState } = useAscension();
    const isAscending = lifeState.ui.systemAscending.isActive;

    useEffect(() => {
        if (xp > prevXp.current) {
            onIncrease?.(color);
        }
        prevXp.current = xp;
    }, [xp, color, onIncrease]);

    return (
        <div 
            className="flex flex-col w-full mb-2 group cursor-pointer"
            onClick={() => onIncrease?.(color)}
        >
            {/* Top Row: Icon/Name & Numbers */}
            <div className="flex justify-between items-end px-0 mb-1">
                <div className="flex items-center gap-2">
                    <div className="flex flex-col leading-none gap-0.5">
                        <span className="font-bold text-[10px] text-white uppercase tracking-widest" style={{ textShadow: isAscending ? `0 0 10px ${color}` : 'none' }}>{fullName}</span>
                        <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                            <Icon size={10} style={{ color }} />
                            <span className="text-[8px] font-mono text-life-gold font-bold">{toRoman(Math.floor(xp / 20) + 1)}</span>
                        </div>
                    </div>
                </div>
                
                <p className="text-[10px] font-mono text-white/40 text-right leading-none" style={{ textShadow: isAscending ? `0 0 5px ${color}` : 'none' }}>
                    <motion.span 
                        key={xp}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: isAscending ? [1, 1.1, 1] : 1 }}
                        transition={isAscending ? { duration: 0.5, repeat: Infinity } : {}}
                        className="font-black text-xs inline-block"
                        style={{ color, textShadow: isAscending ? `0 0 15px ${color}` : `0 0 8px ${color}66` }}
                    >
                        {xp.toFixed(0)}
                    </motion.span>
                    <span className="ml-1">/ {target}</span>
                </p>
            </div>

            {/* Bottom Row: Real Neon Light Source Bar */}
            <div className="w-full bg-black/80 h-[3px] rounded-full relative border border-zinc-900/50">
                {/* Unlit Tube Background (Faint Color) */}
                <div 
                    className="absolute inset-0 rounded-full opacity-10"
                    style={{ backgroundColor: color }}
                />

                {/* Progress Fill with Neon Light Source Effect */}
                <motion.div 
                    className="h-full rounded-full relative z-10"
                    initial={{ width: 0 }}
                    animate={{ 
                        width: `${percentage}%`,
                        opacity: isAscending ? [0.4, 1, 0.6, 1] : 1
                    }}
                    style={{ 
                        backgroundColor: color,
                        boxShadow: isAscending ? `0 0 20px 4px ${color}` : 'none',
                    }}
                    transition={{ 
                        width: { type: 'spring', stiffness: 50, damping: 20 },
                        opacity: { duration: 0.5 }
                    }}
                >
                    {/* White Core (1px center line) - Only in Ascending */}
                    {isAscending && <div className="absolute inset-x-0 top-[1px] h-[1px] bg-white opacity-90 rounded-full" />}

                    {/* Ascending Rapid Pulse */}
                    {isAscending && (
                        <motion.div 
                            animate={{ opacity: [0, 0.6, 0] }}
                            transition={{ duration: 0.3, repeat: Infinity }}
                            className="absolute inset-0 bg-white rounded-full blur-[2px]"
                        />
                    )}

                    {/* Active Glow Pulse (only during increase/interaction) */}
                    <AnimatePresence>
                        {xp > prevXp.current && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 0.8 }}
                                className="absolute inset-0 z-20 rounded-full"
                                style={{ boxShadow: `0 0 20px ${color}` }}
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
interface AttributeAnalysisProps {
    user: UserProfile;
}

export const AttributeAnalysis: React.FC<AttributeAnalysisProps> = ({ user }) => {
    const [viewMode, setViewMode] = useState<'graph' | 'data'>('data');
    const [pulseColor, setPulseColor] = useState<string | null>(null);
    const { state: lifeState } = useAscension();
    const isAscending = lifeState.ui.systemAscending.isActive;
    const { xpValues, globalTarget } = useBalanceAlgorithm(user.stats);

    const statsOrder: Stat[] = [Stat.STR, Stat.INT, Stat.DIS, Stat.HEA, Stat.CRT, Stat.SPR, Stat.REL, Stat.FIN];

    const handleStatPulse = (color: string) => {
        setPulseColor(color);
        setTimeout(() => setPulseColor(null), 1000);
    };

    return (
        <div className="bg-life-black border border-zinc-900 rounded-xl p-4 mb-4 shadow-2xl relative overflow-hidden group transition-all duration-500">
            {/* 🌈 CHROMATIC PULSE OVERLAY (Subtle) */}
            <AnimatePresence>
                {pulseColor && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.05 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{ backgroundColor: pulseColor, filter: 'blur(40px)' }}
                    />
                )}
            </AnimatePresence>

            {/* Pulsing Border (Subtle) */}
            {pulseColor && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    className="absolute inset-0 z-0 border rounded-xl pointer-events-none"
                    style={{ borderColor: pulseColor }}
                />
            )}
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-life-muted/30 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-life-muted/30 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-life-muted/30 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-life-muted/30 rounded-br-lg"></div>

            {/* Header & Toggle */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all duration-300 ${isAscending ? 'text-white' : 'text-life-text'}`}
                        style={{ textShadow: isAscending ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none' }}>
                        <span className={isAscending ? 'text-red-500 animate-pulse' : 'text-life-gold'}>⬡</span> Attribute Analysis
                    </h3>
                </div>
                
                <div className="flex items-center bg-black border border-zinc-800 p-1 rounded-lg gap-1">
                    <button 
                        onClick={() => setViewMode('graph')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${viewMode === 'graph' ? 'bg-life-gold text-black shadow-sm' : 'text-life-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <Hexagon size={12} className={viewMode === 'graph' ? 'fill-black stroke-black' : ''} />
                        Graph
                    </button>
                    <button 
                        onClick={() => setViewMode('data')}
                        className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${viewMode === 'data' ? 'bg-life-gold text-black shadow-sm' : 'text-life-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <List size={14} />
                        Data
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="animate-in fade-in zoom-in-95 duration-300">
                {viewMode === 'graph' ? (
                    <div className="relative h-64 flex items-center justify-center">
                        <StatsRadar stats={user.stats} maxVal={globalTarget} />
                    </div>
                ) : (
                    <div className="space-y-3 py-1">
                        {statsOrder.map(stat => (
                            <StatDataRow 
                                key={stat}
                                stat={stat}
                                xp={xpValues[stat]}
                                target={globalTarget}
                                onIncrease={handleStatPulse}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
