
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Shield, AlignLeft, Dumbbell, Brain, Zap, Heart, Palette, Flame, Users, Coins, Info } from 'lucide-react';
import { useAscension } from '../../contexts/AscensionContext';
import { Stat, Difficulty } from '../../types/types';
import { STAT_COLORS, DIFFICULTY_HEX } from '../../types/constants';

const MissionBriefingModal: React.FC = () => {
    const { state, dispatch } = useAscension();
    const { activeModal, modalData } = state.ui;

    if (activeModal !== 'missionBriefing' || !modalData) return null;

    const { item } = modalData;
    const statColor = STAT_COLORS[item.stat as Stat] || '#FFD35B';
    const difficultyColor = DIFFICULTY_HEX[item.difficulty as Difficulty] || '#4ADE80';

    const getSectorIcon = (stat: string) => {
        switch (stat.toUpperCase()) {
            case 'STR': return <Dumbbell size={24} />;
            case 'INT': return <Brain size={24} />;
            case 'DIS': return <Zap size={24} />;
            case 'HEA': return <Heart size={24} />;
            case 'CRT': return <Palette size={24} />;
            case 'SPR': return <Flame size={24} />;
            case 'REL': return <Users size={24} />;
            case 'FIN': return <Coins size={24} />;
            default: return <Info size={24} />;
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => dispatch.setModal('none')}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
                >
                    {/* Header Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: difficultyColor }} />
                    
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10" style={{ color: statColor }}>
                                    {getSectorIcon(item.stat)}
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Mission Briefing</h3>
                                    <h2 className="text-2xl font-black text-white leading-tight uppercase font-mono tracking-tighter">
                                        {item.title}
                                    </h2>
                                </div>
                            </div>
                            <button 
                                onClick={() => dispatch.setModal('none')}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Objectives */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <AlignLeft size={12} /> Objectives
                                </h4>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 min-h-[60px]">
                                    <p className="text-sm text-white/80 leading-relaxed italic">
                                        {item.description || "No specific intel provided."}
                                    </p>
                                </div>
                            </div>

                            {/* Footer Data */}
                            <div className="pt-4 border-t border-white/5 flex items-center justify-center">
                                <button 
                                    onClick={() => dispatch.setModal('none')}
                                    className="px-8 py-2.5 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                >
                                    Dismiss Briefing
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MissionBriefingModal;
