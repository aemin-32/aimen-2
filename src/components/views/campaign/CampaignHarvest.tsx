
import React from 'react';
import { Wheat, Trophy, Crown } from 'lucide-react';

interface HarvestStats {
    grade: string;
    completionRate: number;
    totalTasks: number;
    completedTasks: number;
    raidCount: number;
    wins: number;
    goldReward: number;
    xpReward: number;
    stakedGold: number;
}

interface CampaignHarvestProps {
    stats: HarvestStats;
    currentWeek: number;
    onComplete: () => void;
}

export const CampaignHarvest: React.FC<CampaignHarvestProps> = ({ stats, currentWeek, onComplete }) => {
    const isLocked = currentWeek < 13;
    const gradeColor = stats.grade === 'S' ? 'text-life-diamond' : stats.grade === 'A' ? 'text-life-gold' : stats.grade === 'F' ? 'text-life-hard' : 'text-life-text';

    return (
        <div className="relative overflow-hidden rounded-2xl border-2 border-life-gold bg-life-black p-6 shadow-[0_0_30px_rgba(251,191,36,0.15)] animate-in zoom-in-95 duration-700">
            {/* Background FX */}
            <div className="absolute inset-0 bg-life-gold/5 animate-pulse-slow pointer-events-none" />
            <div className="absolute -right-10 -top-10 opacity-10 rotate-12">
                <Wheat size={150} className="text-life-gold" />
            </div>

            <div className="relative z-10 text-center">
                <h3 className="text-xs font-black text-life-gold uppercase tracking-[0.3em] mb-4">The Harvest is Here</h3>
                
                {/* 🏆 GRADE */}
                <div className="flex flex-col items-center mb-6">
                    <div className={`text-6xl font-black ${gradeColor} drop-shadow-2xl`}>
                        {stats.grade}
                    </div>
                    <div className="text-xs text-life-muted font-bold uppercase tracking-widest mt-2 border-t border-b border-life-muted/20 py-1 px-4">
                        Campaign Rank
                    </div>
                </div>

                {/* 📊 STATS GRID */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-life-paper/50 p-3 rounded-xl border border-life-muted/20">
                        <div className="text-2xl font-black text-life-gold">${stats.goldReward}</div>
                        <div className="text-[9px] text-life-muted uppercase tracking-widest">Gold Received</div>
                    </div>
                    <div className="bg-life-paper/50 p-3 rounded-xl border border-life-muted/20">
                        <div className="text-2xl font-black text-life-diamond">+{stats.xpReward}</div>
                        <div className="text-[9px] text-life-muted uppercase tracking-widest">XP Surge</div>
                    </div>
                    <div className="bg-life-paper/50 p-3 rounded-xl border border-life-muted/20 col-span-2 flex items-center justify-between px-6">
                        <div className="text-left">
                            <div className="text-xl font-black text-life-text">{stats.wins} <span className="text-life-muted text-sm">/ 12</span></div>
                            <div className="text-[9px] text-life-muted uppercase tracking-widest">Ops Completed</div>
                        </div>
                        <Trophy size={24} className="text-life-gold opacity-50" />
                    </div>
                </div>

                {/* 🧨 REAP BUTTON */}
                <button 
                    onClick={onComplete}
                    disabled={isLocked}
                    className={`w-full py-4 font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                        isLocked 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5' 
                        : 'bg-life-gold hover:bg-yellow-400 text-life-black shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-105 active:scale-95'
                    }`}
                >
                    {isLocked ? <Crown size={20} className="opacity-30" /> : <Crown size={20} strokeWidth={3} />}
                    {isLocked ? 'Cycle Incomplete' : 'CLAIM REWARDS'}
                </button>
                
                <p className="text-[9px] text-life-muted mt-3 opacity-60">
                    Archiving this campaign will reset the timeline for the next 12-week cycle.
                </p>
            </div>
        </div>
    );
};
