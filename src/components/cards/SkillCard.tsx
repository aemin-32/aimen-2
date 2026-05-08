
import React from 'react';
import { motion } from 'framer-motion';
import { toRoman } from '../../utils/roman-helpers';
import { Brain, Dumbbell, Activity, Heart, Zap, Shield, AlertTriangle, Palette, Coins, Users, Flame } from 'lucide-react';
// --- تصحيح المسارات (العودة خطوتين للوراء ../../) ---
import { Skill, SkillRank } from '../../types/skillTypes';
import { Stat } from '../../types/types';
import { STAT_COLORS } from '../../types/constants';
import { useSkills } from '../../contexts/SkillContext';
interface SkillCardProps {
    skill: Skill;
}

const StatIcon = ({ stat, size = 14 }: { stat: Stat; size?: number }) => {
    switch (stat) {
        case Stat.STR: return <Dumbbell size={size} />;
        case Stat.INT: return <Brain size={size} />;
        case Stat.DIS: return <Zap size={size} />;
        case Stat.HEA: return <Heart size={size} />;
        case Stat.CRT: return <Palette size={size} />;
        case Stat.SPR: return <Flame size={size} />;
        case Stat.REL: return <Users size={size} />;
        case Stat.FIN: return <Coins size={size} />;
        default: return <Activity size={size} />;
    }
};

const RANK_COLORS: Record<SkillRank, string> = {
    'Novice': 'text-life-muted border-life-muted',
    'Adept': 'text-life-normal border-life-normal',
    'Expert': 'text-purple-400 border-purple-400',
    'Master': 'text-life-gold border-life-gold',
    'Grandmaster': 'text-life-diamond border-life-diamond',
};

const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
    const { skillDispatch } = useSkills(); // 👈 Access Context
    
    const progressPercent = Math.min(100, (skill.currentXP / skill.targetXP) * 100);
    const rankColorClass = RANK_COLORS[skill.rank] || RANK_COLORS['Novice'];
    const rankTextColor = rankColorClass.split(' ')[0]; 

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => skillDispatch.setActiveSkill(skill.id)} // 👈 Open Details on Click
            className={`
                relative bg-life-paper border rounded-xl overflow-hidden mb-3 transition-all duration-200 
                hover:bg-life-muted/5 cursor-pointer group 
                ${skill.isRusty ? 'border-orange-900/50' : 'border-zinc-800'}
            `}
        >
            
            {/* 🟢 RUST OVERLAY */}
            {skill.isRusty && (
                <div className="absolute top-2 right-2 text-orange-500 animate-pulse" title="Skill is Rusty! Perform tasks to restore.">
                    <AlertTriangle size={16} />
                </div>
            )}

            {/* 🟢 CARD BODY */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    {/* Header: Title & Icons */}
                    <div>
                        <h3 className={`text-base font-bold text-life-text flex items-center gap-2 ${skill.isRusty ? 'text-life-muted line-through opacity-70' : ''}`}>
                            {skill.title}
                        </h3>
                        {/* Parent Stats Badges */}
                        <div className="flex gap-1 mt-1">
                            {skill.relatedStats.map((stat) => (
                                <div 
                                    key={stat} 
                                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-life-black border border-zinc-800 text-[9px] font-bold"
                                    style={{ color: STAT_COLORS[stat], borderColor: `${STAT_COLORS[stat]}30` }}
                                >
                                    <StatIcon stat={stat} size={10} />
                                    <span>{stat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rank Badge */}
                    <div className={`px-2 py-1 rounded border bg-life-black text-[10px] uppercase font-black tracking-wider ${rankColorClass} bg-opacity-20`}>
                        {skill.rank}
                    </div>
                </div>

                {/* Description */}
                {skill.description && (
                    <p className="text-xs text-life-muted/60 mb-3 line-clamp-1">{skill.description}</p>
                )}

                {/* 🟢 PROGRESS BAR */}
                <div className="relative pt-1">
                    <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                        <span className={rankTextColor}>{toRoman(skill.level)}</span>
                        <span className="text-[#FFD35B] drop-shadow-[0_0_5px_rgba(255,211,91,0.3)]">{skill.currentXP} / {skill.targetXP} XP</span>
                    </div>
                    <div className="h-1.5 w-full bg-life-black rounded-full overflow-hidden border border-zinc-800 relative">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className={`h-full transition-all duration-700 relative ${skill.isRusty ? 'bg-life-muted' : 'bg-[#FFD35B]'}`}
                            style={{ 
                                boxShadow: !skill.isRusty ? '0 0 10px #FFD35B' : 'none',
                            }} 
                        >
                            {!skill.isRusty && (
                                <>
                                    {/* 1px White Core */}
                                    <div className="absolute inset-x-0 top-[0.5px] h-[0.5px] bg-white/80 rounded-full z-10" />
                                    
                                    {/* Light Bleed */}
                                    <div className="absolute inset-0 bg-white blur-[1px] opacity-20" />
                                </>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SkillCard;
