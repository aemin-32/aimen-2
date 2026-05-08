
import React, { useState } from 'react';
import { Target, Play, Shield, Zap, TrendingUp, Heart, Palette, Brain, Users, Coins, Check, Dumbbell, Flame } from 'lucide-react';
import { Stat } from '../../../types/types';
import { useAscension } from '../../../contexts/AscensionContext';

interface CampaignSetupProps {
    onStart: (data: { 
        title: string, 
        startDate: string, 
        strategicGoal: string, 
        activeFronts: string[], 
        intensityTarget: number,
        statTargets: Record<string, number>, 
        stakedGold: number 
    }) => void;
}

const STAT_INFO: Record<Stat, { icon: React.ElementType, color: string, glow: string }> = {
    [Stat.STR]: { icon: Dumbbell, color: '#DC2626', glow: 'rgba(220, 38, 38, 0.4)' },
    [Stat.DIS]: { icon: Shield, color: '#EAB308', glow: 'rgba(234, 179, 8, 0.4)' },
    [Stat.HEA]: { icon: Heart, color: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
    [Stat.INT]: { icon: Brain, color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)' },
    [Stat.CRT]: { icon: Palette, color: '#D946EF', glow: 'rgba(217, 70, 239, 0.3)' },
    [Stat.SPR]: { icon: Flame, color: '#6366F1', glow: 'rgba(99, 102, 241, 0.3)' },
    [Stat.REL]: { icon: Users, color: '#F43F5E', glow: 'rgba(244, 63, 94, 0.3)' },
    [Stat.FIN]: { icon: Coins, color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.3)' },
};

export const CampaignSetup: React.FC<CampaignSetupProps> = ({ onStart }) => {
    const { state } = useAscension();
    const [setupTitle, setSetupTitle] = useState('');
    const [strategicGoal, setStrategicGoal] = useState('');
    const [setupDate, setSetupDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeFronts, setActiveFronts] = useState<string[]>([]);
    const [intensityTarget, setIntensityTarget] = useState(5.0);
    const [stakedGold, setStakedGold] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (setupTitle && activeFronts.length > 0) {
            onStart({
                title: setupTitle,
                startDate: setupDate,
                strategicGoal: setupTitle, // Use title as goal if removed from UI
                activeFronts,
                intensityTarget,
                statTargets: {}, // Removed individual targets
                stakedGold
            });
        }
    };

    const toggleFront = (stat: string) => {
        if (activeFronts.includes(stat)) {
            setActiveFronts(prev => prev.filter(f => f !== stat));
        } else if (activeFronts.length < 3) {
            setActiveFronts(prev => [...prev, stat]);
        }
    };

    const maxGold = state.user.gold;

    return (
        <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-black border border-[#EAB308]/30 rounded-lg flex items-center justify-center mx-auto mb-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    <Target size={32} className="text-[#EAB308]" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-[-0.05em] uppercase mb-2 [font-family:'Space_Grotesk',sans-serif]">Tactical Briefing</h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] max-w-xs mx-auto font-bold">
                    Define the campaign parameters.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-lg mx-auto">
                {/* 🟢 OPERATION COMMAND */}
                <div className="bg-[#0A0A0A] border border-[#EAB308]/20 p-6 rounded-xl relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.7)]">
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#EAB308]/40 to-transparent" />
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-3 [font-family:monospace] border-l border-zinc-700 pl-3">
                                01. OPERATION NAME
                            </label>
                            <input 
                                type="text" 
                                value={setupTitle}
                                onChange={(e) => setSetupTitle(e.target.value)}
                                placeholder="PROJECT ASCENSION"
                                className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-white focus:border-[#EAB308]/60 transition-all outline-none font-black uppercase placeholder:text-zinc-800 tracking-[0.1em] text-sm"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-3 [font-family:monospace] border-l border-zinc-700 pl-3">
                                02. START DATE
                            </label>
                            <input 
                                type="date" 
                                value={setupDate}
                                onChange={(e) => setSetupDate(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-[#EAB308] focus:border-[#EAB308]/60 transition-all outline-none font-mono font-bold uppercase text-[10px]"
                            />
                        </div>
                    </div>
                </div>

                {/* 🟢 THE FRONTS selection */}
                <div className="bg-[#0A0A0A] border border-[#EAB308]/20 p-6 rounded-xl relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.7)]">
                    <label className="block text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-6 [font-family:monospace] border-l border-zinc-700 pl-3">
                        03. STRATEGIC FRONT & INTENSITY
                    </label>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {Object.values(Stat).map((stat) => {
                            const info = STAT_INFO[stat];
                            const Icon = info.icon;
                            const isActive = activeFronts.includes(stat);
                            
                            return (
                                <button
                                    key={stat}
                                    type="button"
                                    onClick={() => toggleFront(stat)}
                                    className={`relative p-4 border rounded-sm transition-all duration-500 flex flex-col items-center gap-2 overflow-hidden group ${
                                        isActive 
                                        ? 'bg-black border-2' 
                                        : 'bg-black/40 border-white/5 opacity-40 grayscale hover:opacity-60'
                                    }`}
                                    style={{ 
                                        boxShadow: isActive ? `0 0 20px ${info.glow}, inset 0 0 10px ${info.glow}` : 'none',
                                        borderColor: isActive ? info.color : undefined
                                    }}
                                >
                                    {isActive && (
                                        <div 
                                            className="absolute inset-0 opacity-10 pointer-events-none"
                                            style={{ background: `radial-gradient(circle at center, ${info.color}, transparent)` }}
                                        />
                                    )}

                                    <div className={`transition-transform duration-500 ${isActive ? 'scale-110' : ''}`}>
                                        <Icon size={18} style={{ color: isActive ? info.color : '#666' }} />
                                    </div>
                                    <span className={`text-[9px] font-black tracking-[0.2em] uppercase ${isActive ? 'text-white' : 'text-zinc-500'}`}>{stat}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Weekly Intensity <span className="text-[#EAB308] opacity-100">[{intensityTarget.toFixed(1)} PTS]</span></span>
                            <span className="text-[8px] font-mono font-bold text-zinc-500">TASK SCORE: E 0.5 | N 1.0 | H 2.0</span>
                        </div>
                        
                        <input 
                            type="range"
                            min="1"
                            max="20"
                            step="0.5"
                            value={intensityTarget}
                            onChange={(e) => setIntensityTarget(parseFloat(e.target.value))}
                            className="w-full h-0.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-[#EAB308] hover:accent-yellow-400"
                        />
                    </div>

                    {activeFronts.length === 0 && (
                        <p className="mt-6 text-[9px] text-red-500/70 uppercase font-bold italic text-center">
                            Select at least one active front.
                        </p>
                    )}
                </div>

                {/* 🟢 THE STAKE (Gold) */}
                <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-xl relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.7)]">
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    
                    <div className="flex justify-between items-center mb-6">
                        <label className="block text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em] [font-family:monospace] border-l border-zinc-700 pl-3">
                            04. THE ESCROW STAKE
                        </label>
                        <div className="text-[10px] font-mono font-black text-[#EAB308] bg-black border border-[#EAB308]/20 px-2 py-1 rounded">
                           ${stakedGold} / ${maxGold}
                        </div>
                    </div>

                    <input 
                        type="range"
                        min="0"
                        max={maxGold}
                        step="10"
                        value={stakedGold}
                        onChange={(e) => setStakedGold(parseInt(e.target.value))}
                        className="w-full h-0.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#EAB308]"
                    />
                    
                    <div className="flex justify-between mt-4">
                        {[0, 25, 50, 75, 100].map(p => (
                            <button 
                                key={p} 
                                type="button" 
                                onClick={() => setStakedGold(Math.floor((p/100) * maxGold))}
                                className="text-[8px] font-black text-zinc-600 hover:text-white uppercase tracking-tighter"
                            >
                                {p}%
                            </button>
                        ))}
                    </div>

                    <p className="mt-6 text-[9px] text-zinc-600 italic text-center uppercase tracking-widest font-bold">
                        Penalty applied if campaign objective is not met.
                    </p>
                </div>

                <button 
                    type="submit"
                    disabled={!setupTitle || activeFronts.length === 0}
                    className={`w-full py-5 rounded-none font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all border [font-family:monospace]
                        ${setupTitle && activeFronts.length > 0 
                            ? 'bg-[#EAB308] text-black border-black/20 hover:opacity-90 active:scale-[0.98]' 
                            : 'bg-zinc-900/50 border-white/5 text-zinc-700 cursor-not-allowed'}
                    `}
                >
                    <Play size={14} fill="currentColor" /> START CAMPAIGN
                </button>
            </form>
        </div>
    );
};
