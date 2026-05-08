
import React, { useEffect } from 'react';
import { useAscension } from '../../contexts/AscensionContext';
import { X, Award, Shield, Zap, TrendingUp, Calendar, Target, Activity, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAvatarIcon, AVATARS } from '../../utils/avatar-helpers';

const CharacterSheetModal: React.FC = () => {
    const { state, dispatch } = useAscension();
    const { user } = state;

    // 🏆 ACHIEVEMENT UNLOCKS
    useEffect(() => {
        const newUnlocks: string[] = [];
        
        // Level 10 Unlock
        if (user.level >= 10 && !user.unlockedAvatars.includes('avatar_king')) {
            newUnlocks.push('avatar_king');
        }
        
        // 50 Tasks Unlock
        if (user.metrics.totalTasksCompleted >= 50 && !user.unlockedAvatars.includes('avatar_warrior')) {
            newUnlocks.push('avatar_warrior');
        }

        if (newUnlocks.length > 0) {
            dispatch.updateUser({ unlockedAvatars: [...user.unlockedAvatars, ...newUnlocks] });
            newUnlocks.forEach(id => {
                const avatar = AVATARS.find(a => a.id === id);
                dispatch.addToast(`Achievement Unlocked: ${avatar?.name} Avatar`, 'level-up');
            });
        }
    }, [user.level, user.metrics.totalTasksCompleted]);

    const handleClose = () => {
        dispatch.setModal('none');
    };

    const handleSelectAvatar = (id: string) => {
        if (user.unlockedAvatars.includes(id)) {
            dispatch.updateUser({ avatarId: id });
            dispatch.addToast('Avatar Updated', 'success');
        }
    };

    const metrics = [
        { label: 'Total Tasks', value: user.metrics.totalTasksCompleted, icon: <Activity size={14} className="text-life-gold" /> },
        { label: 'Raids Won', value: user.metrics.totalRaidsWon, icon: <Award size={14} className="text-life-crimson" /> },
        { label: 'Gold Earned', value: `${user.metrics.totalGoldEarned}G`, icon: <Zap size={14} className="text-life-gold" /> },
        { label: 'Best Streak', value: `${user.metrics.highestStreak} Days`, icon: <TrendingUp size={14} className="text-life-easy" /> },
        { label: 'Shields Used', value: user.metrics.shieldsUsed, icon: <Shield size={14} className="text-life-diamond" /> },
        { label: 'Habits Fixed', value: user.metrics.habitsFixed, icon: <Target size={14} className="text-life-normal" /> },
    ];

    return (
        <div 
            onClick={handleClose}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
        >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-life-paper w-full max-w-md rounded-2xl border border-zinc-800 p-6 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-life-gold/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-life-crimson/5 blur-[60px] rounded-full -ml-16 -mb-16 pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-life-black border-2 border-zinc-800 flex items-center justify-center text-life-gold shadow-lg">
                            {getAvatarIcon(user.avatarId, 32)}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-life-text uppercase tracking-tight">{user.name}</h2>
                            <p className="text-xs text-life-gold font-mono uppercase tracking-widest">{user.title}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="p-2 hover:bg-white/5 rounded-full text-life-muted transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Avatar Selector */}
                <div className="mb-6 relative z-10">
                    <h3 className="text-[10px] font-black text-life-muted uppercase tracking-[0.2em] mb-3">Avatar Selection</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {AVATARS.map(avatar => {
                            const isUnlocked = user.unlockedAvatars.includes(avatar.id);
                            const isSelected = user.avatarId === avatar.id;
                            
                            return (
                                <button
                                    key={avatar.id}
                                    onClick={() => handleSelectAvatar(avatar.id)}
                                    className={`
                                        flex-shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all relative group
                                        ${isSelected ? 'border-life-gold bg-life-gold/10 text-life-gold' : 
                                          isUnlocked ? 'border-zinc-800 bg-life-black text-life-muted hover:border-zinc-700' : 
                                          'border-zinc-900 bg-life-black/50 text-zinc-800 cursor-not-allowed'}
                                    `}
                                >
                                    {isUnlocked ? getAvatarIcon(avatar.id, 20) : (
                                        <>
                                            {getAvatarIcon(avatar.id, 20)}
                                            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                                                <Lock size={14} className="text-zinc-500" />
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-life-black border border-zinc-800 text-life-text text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                        {isUnlocked ? avatar.name : `Locked: ${avatar.condition}`}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Level & XP */}
                <div className="bg-life-black/40 border border-zinc-800 rounded-xl p-4 mb-6 relative z-10">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Level {user.level}</span>
                        <span className="text-[10px] font-mono font-black text-[#FFD35B] drop-shadow-[0_0_10px_rgba(255,211,91,0.5)]">{user.currentXP} / {user.targetXP} XP</span>
                    </div>
                    <div className="h-3 bg-zinc-900 rounded-full overflow-hidden relative border border-zinc-800">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(user.currentXP / user.targetXP) * 100}%` }}
                            className="h-full bg-[#FFD35B] relative"
                            style={{ 
                                boxShadow: '0 0 15px #FFD35B, inset 0 0 5px #FFD35B'
                            }}
                        >
                            {/* 1px White Core */}
                            <div className="absolute inset-x-0 top-[1px] h-[1px] bg-white/90 rounded-full z-10" />
                            
                            {/* Light Bleed Pulse */}
                            <motion.div 
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-white blur-[3px] rounded-full"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                    {metrics.map((m, idx) => (
                        <div key={idx} className="bg-life-black/20 border border-zinc-800/50 rounded-lg p-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-life-black flex items-center justify-center border border-zinc-800">
                                {m.icon}
                            </div>
                            <div>
                                <p className="text-[8px] text-life-muted uppercase font-bold tracking-widest">{m.label}</p>
                                <p className="text-xs font-black text-life-text">{m.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* System Info */}
                <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between text-[9px] text-life-muted uppercase font-mono border-b border-zinc-800/50 pb-2">
                        <div className="flex items-center gap-2">
                            <Calendar size={10} />
                            <span>Last Online</span>
                        </div>
                        <span>{new Date(user.lastOnline).toLocaleString()}</span>
                    </div>
                </div>

                {/* Footer Action */}
                <button 
                    onClick={handleClose}
                    className="w-full mt-6 py-3 bg-life-gold text-life-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-life-gold/10"
                >
                    Close Dossier
                </button>
            </motion.div>
        </div>
    );
};

export default CharacterSheetModal;
