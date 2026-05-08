
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Snowflake, RotateCcw, Eye, Clock, Plus, CheckCircle, CheckSquare, Crosshair, ChevronDown, Lock, AlertTriangle, Check } from 'lucide-react';
import { useCampaign } from '../../contexts/CampaignContext';
import { useTasks } from '../../contexts/TaskContext';
import { useHabits } from '../../contexts/HabitContext';
import { useRaids } from '../../contexts/RaidContext';
import { useAscension } from '../../contexts/AscensionContext';
import { Task } from '../../types/taskTypes';
import { RaidStep } from '../../types/raidTypes';
import { Difficulty, Stat } from '../../types/types';
import { HoldButton } from '../ui/HoldButton';
import { safeDate, formatHeaderDate, addDays } from '../../utils/dateUtils';
import { checkHabitActive } from '../../utils/habitEngine';

// 🟢 IMPORT NEW COMPONENTS
import { CampaignSetup } from './campaign/CampaignSetup';
import { CampaignHarvest } from './campaign/CampaignHarvest';

const difficultyToNumber = (d: any): number => {
    if (typeof d === 'number') return d;
    if (d === Difficulty.EASY) return 1;
    if (d === Difficulty.NORMAL) return 2;
    if (d === Difficulty.HARD) return 3;
    return 1;
};

// 🛡️ SUB-COMPONENT: TACTICAL ITEM (Minimal Row)
const TacticalItem: React.FC<{ 
    title: string, isCompleted: boolean, type: 'mission' | 'raid', 
    onToggle: () => void, onOpenDetails: () => void, colorClass: string, difficulty?: any
}> = ({ title, isCompleted, type, onToggle, onOpenDetails, colorClass, difficulty = 1 }) => {
    const diffNum = difficultyToNumber(difficulty);
    const points = diffNum === 3 ? '2.0' : diffNum === 2 ? '1.0' : '0.5';

    return (
        <div 
            onClick={(e) => { e.stopPropagation(); onOpenDetails(); }} 
            className={`group flex items-center gap-3 p-2 border relative transition-all cursor-pointer rounded-md ${
                isCompleted 
                ? 'bg-black border-[#EAB308]/40 shadow-[0_0_12px_rgba(234,179,8,0.1)]' 
                : 'bg-black border-white/10 hover:border-[#EAB308]/40 hover:bg-white/[0.02]'
            }`}
        >
            {/* Tactical Gold Indicator Line */}
            <div className={`absolute left-0 top-2 bottom-2 w-0.5 transition-all rounded-full ${isCompleted ? 'bg-zinc-700 shadow-none' : 'bg-[#EAB308] shadow-[0_0_8px_rgba(234,179,8,0.6)]'}`} />

            <div 
                onClick={(e) => { e.stopPropagation(); onToggle(); }} 
                className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-all cursor-pointer z-10 ml-0.5 ${
                    isCompleted 
                    ? 'bg-[#EAB308] border border-[#EAB308] shadow-[0_0_10px_rgba(234,179,8,0.4)]' 
                    : 'bg-black/50 border border-white/20 text-transparent hover:border-[#EAB308]'
                }`}
            >
                <Check size={14} strokeWidth={4} className={`text-white transition-transform duration-300 ${isCompleted ? 'scale-100' : 'scale-0'}`} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <div className={`text-[11px] font-bold uppercase tracking-tight truncate transition-all duration-300 ${isCompleted ? 'line-through decoration-white decoration-2 text-white/40' : 'text-white'}`}>
                        {title}
                    </div>
                    {!isCompleted && (
                        <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[8px] font-black text-white/90 font-mono tracking-tighter">+{points}</span>
                            <span className="text-[7px] font-black text-white/40 tracking-tighter">PTS</span>
                        </div>
                    )}
                </div>
            </div>

            {type === 'raid' && (
                <div className="px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest bg-life-gold/10 text-life-gold border border-life-gold/20">
                    OP
                </div>
            )}
        </div>
    );
};

const CampaignView: React.FC = () => {
  const { campaignState, campaignDispatch, evaluateWeekPerformance } = useCampaign();
  const { taskState, taskDispatch } = useTasks();
  const { habitState, habitDispatch } = useHabits();
  const { raidState, raidDispatch } = useRaids();
  const { state, dispatch } = useAscension(); 
  
  const { campaign } = campaignState;
  const { unlockAllWeeks } = state.user.preferences;
  const [expandedWeekId, setExpandedWeekId] = useState<number | null>(null);
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});

  const toggleDayCollapse = (dayId: string) => {
    setCollapsedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  const handleAbortCampaign = () => {
      const penalty = Math.floor((campaign.stakedGold || 0) * 0.5);
      dispatch.setModal('confirmation', {
          title: 'Abort Campaign Protocol',
          message: `DANGER: Terminating timeline will result in a 50% FORFEIT of your staked gold (${penalty} Gold). This action is irreversible. Proceed with termination?`,
          confirmText: 'Confirm Total Abort',
          isDangerous: true,
          onConfirm: () => campaignDispatch.resetCampaign()
      });
  };

  const getWeekRange = (startIso: string, weekNum: number) => {
      const start = safeDate(startIso);
      const wStart = addDays(start, (weekNum - 1) * 7);
      const wEnd = addDays(wStart, 6);
      return `${formatHeaderDate(wStart)} - ${formatHeaderDate(wEnd)}`;
  };

  const getDayLabel = (startIso: string, weekNum: number, dayNum: number) => {
      const start = safeDate(startIso);
      const target = addDays(start, ((weekNum - 1) * 7) + (dayNum - 1));
      
      // Defensively check for invalid date before calling methods that might throw RangeError
      if (isNaN(target.getTime())) return `${dayNum.toString().padStart(2, '0')} DAY`;
      
      const day = target.getDate().toString().padStart(2, '0');
      let weekday = 'DAY';
      try {
          weekday = target.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      } catch (e) {
          console.error("Weekday formatting error", e);
      }
      return `${day} ${weekday}`;
  };

  const toYMD = (input: any) => {
    if (!input) return "";
    
    // If it's a string, try to extract the YYYY-MM-DD part directly to stay absolute
    if (typeof input === 'string') {
        const match = input.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) return match[1];
    }
    
    // Fallback for Date objects or other formats - use safeDate consistently
    const d = safeDate(input);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const getDayIso = (startIso: string, weekNum: number, dayNum: number) => {
    const start = safeDate(startIso);
    const target = addDays(start, ((weekNum - 1) * 7) + (dayNum - 1));
    if (isNaN(target.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T12:00`;
  };

  const getWeekItems = (weekNum: number) => {
      if (!campaign.startDate) return { weekTasks: [], weekRaidSteps: [], weekHabits: [] };
      const start = safeDate(campaign.startDate);
      const wStart = addDays(start, (weekNum - 1) * 7);
      wStart.setHours(0,0,0,0);
      const wEnd = addDays(wStart, 6);
      wEnd.setHours(23,59,59,999);

      const fronts = campaign.activeFronts || [];

      // Filter tasks by week and Active Fronts
      const weekTasks = taskState.tasks.filter(t => {
          if (t.isArchived) return false;
          // Only include if in active fronts
          if (fronts.length > 0 && !fronts.includes(t.stat as Stat)) return false;
          
          if (!t.deadline) {
              // Unplanned tasks: stay in current week items for potential 'LIVE' display
              return weekNum === campaign.currentWeek;
          }

          const taskYMD = toYMD(t.deadline);
          
          // Calculate valid YMDs for this specific week
          const weekStart = addDays(safeDate(campaign.startDate!), (weekNum - 1) * 7);
          const weekYMDs = Array.from({ length: 7 }).map((_, i) => toYMD(addDays(weekStart, i)));
          
          return weekYMDs.includes(taskYMD);
      });

      const weekRaidSteps: Array<{ raidId: string, raidTitle: string, step: RaidStep }> = [];
      raidState.raids.forEach(raid => {
          if (raid.status === 'archived') return;
          raid.steps.forEach(step => {
              if (step.scheduledDate && !step.isArchived) {
                  const d = safeDate(step.scheduledDate);
                  if (d >= wStart && d <= wEnd) {
                      // Check if raid stats are in active fronts
                      const raidStats = raid.stats || [];
                      const isLinkedToFront = fronts.length === 0 || raidStats.some(s => fronts.includes(s as Stat));
                      
                      if (isLinkedToFront) {
                        weekRaidSteps.push({ raidId: raid.id, raidTitle: raid.title, step });
                      }
                  }
              }
          });
      });

      // Filter habits: ONLY for current week and day, matching fronts
      let weekHabits: any[] = [];
      if (weekNum === campaign.currentWeek) {
          weekHabits = habitState.habits.filter(h => {
              if (h.isArchived) return false;
              // Must match active fronts
              if (fronts.length > 0 && !fronts.includes(h.stat as Stat)) return false;
              
              // Only active if it matches the current day's activation logic
              // and the user requirement: "Habits ONLY manifest in the Campaign list for the 'LIVE' (current) day."
              // We'll filter further in the day loop.
              return true;
          });
      }

      return { weekTasks, weekRaidSteps, weekHabits };
  };

  const calculateHarvestStats = () => {
      if (!campaign.startDate) return { grade: 'F', completionRate: 0, totalTasks: 0, completedTasks: 0, raidCount: 0, wins: 0, goldReward: 0, xpReward: 0, stakedGold: 0 };
      
      const wins = campaign.results.filter(r => r === 'win').length;
      
      let grade = 'F';
      let goldMultiplier = 0;
      let xpReward = 0;

      if (wins >= 12) {
          grade = 'S';
          goldMultiplier = 2.5; // Stake + 150%
          xpReward = 1000;
      } else if (wins >= 10) {
          grade = 'A';
          goldMultiplier = 2.0; // Stake + 100%
          xpReward = 750;
      } else if (wins >= 7) {
          grade = 'B';
          goldMultiplier = 1.5; // Stake + 50%
          xpReward = 500;
      } else if (wins === 6) {
          grade = 'C';
          goldMultiplier = 1.0; // Stake Return
          xpReward = 250;
      } else {
          grade = 'F';
          goldMultiplier = 0; // 0 Return
          xpReward = 0;
      }

      const stakedGold = campaign.stakedGold || 0;
      const goldReward = Math.floor(stakedGold * goldMultiplier);

      const start = safeDate(campaign.startDate);
      let totalTasks = 0, completedTasks = 0, raidCount = 0;
      taskState.tasks.forEach(t => {
          if (t.isArchived) return;
          if (t.deadline && safeDate(t.deadline) >= start) {
              totalTasks++;
              if (t.isCompleted) completedTasks++;
          }
      });
      raidState.raids.forEach(r => { if (r.status === 'completed') raidCount++; });
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return { 
          grade, 
          completionRate, 
          totalTasks, 
          completedTasks, 
          raidCount, 
          wins, 
          goldReward, 
          xpReward,
          stakedGold
      };
  };

  if (!campaign.isActive || !campaign.startDate) {
      return <CampaignSetup onStart={campaignDispatch.initCampaign} />;
  }

  const isHarvestWeek = campaign.currentWeek >= 13;
  const progressPercent = Math.min(100, ((campaign.currentWeek - 1) / 12) * 100);
  const weeks = Array.from({ length: 13 }, (_, i) => i + 1);

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between mb-6 px-1">
        <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase truncate max-w-[200px] sm:max-w-none">{campaign.title}</h2>
            {campaign.strategicGoal && (
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 max-w-md italic">
                    "{campaign.strategicGoal}"
                </p>
            )}
            <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider ${campaign.isFrozen ? 'bg-blue-500/20 text-blue-400' : 'bg-life-gold/20 text-life-gold'}`}>
                    {campaign.isFrozen ? '❄️ Frozen' : isHarvestWeek ? '🌾 Harvest' : `Week ${campaign.currentWeek} / 12`}
                </span>
                {!isHarvestWeek && <span className="text-[10px] text-life-muted uppercase tracking-widest">• Day {campaign.currentDay}</span>}
                
                {/* Active Fronts Indicators */}
                {campaign.activeFronts && campaign.activeFronts.length > 0 && (
                    <div className="flex gap-1 ml-2 border-l border-zinc-800 pl-3">
                        {campaign.activeFronts.map(front => (
                            <span key={front} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/5 uppercase tracking-tighter">
                                {front}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className="text-life-gold opacity-50 flex items-center gap-2">
            {unlockAllWeeks && <span title="Horus Eye Active"><Eye size={16} className="animate-pulse text-life-crimson" /></span>}
            <Target size={24} />
        </div>
      </div>

      <div className="mb-8">
          <div className="h-2 w-full bg-life-black rounded-full overflow-hidden border border-life-muted/20 relative">
              <div className={`h-full transition-all duration-1000 ${campaign.isFrozen ? 'bg-blue-500' : 'bg-life-gold'}`} style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-life-muted uppercase font-mono">
              <span>Start</span><span>Week 6</span><span>Harvest</span>
          </div>
      </div>

      {/* 🟢 HARVEST TRACKER PIPS */}
      <div className="mb-6 flex items-center justify-between px-2 bg-black/20 p-2 rounded-lg border border-white/5">
        <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mr-2">Status</div>
        <div className="flex gap-1.5 flex-1 justify-center">
            {Array.from({ length: 12 }).map((_, i) => {
                const weekNum = i + 1;
                const result = campaign.results[i];
                const isCurrent = weekNum === campaign.currentWeek;
                const perf = evaluateWeekPerformance(weekNum);
                
                // LIVE HUD SYNC: Overwrite result for current week if target is met
                const effectiveResult = (isCurrent && perf.isWin) ? 'win' : result;
                
                let color = 'bg-zinc-800';
                if (effectiveResult === 'win') color = 'bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)] border border-[#10B981]/20';
                if (effectiveResult === 'loss') color = 'bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.4)] border border-[#EF4444]/20';
                if (isCurrent && effectiveResult === 'pending') color = 'bg-zinc-700 animate-pulse border border-white/20';

                return (
                    <div 
                        key={i} 
                        className={`w-2.5 h-2.5 rounded-[2px] transition-all duration-500 ${color}`}
                        title={effectiveResult === 'pending' ? `Week ${weekNum}` : `Week ${weekNum}: ${effectiveResult.toUpperCase()}`}
                    >
                        <div className="w-full h-full border border-white/10 rounded-[2px]" />
                    </div>
                );
            })}
        </div>
        {(() => {
            const losses = campaign.results.filter(r => r === 'loss').length;
            let statusLabel = 'NEUTRAL';
            let statusColor = 'text-white';
            
            if (losses === 0) {
                statusLabel = 'DOMINATING';
                statusColor = 'text-[#10B981]';
            } else if (losses <= 2) {
                statusLabel = 'OPERATIONAL';
                statusColor = 'text-white';
            } else if (losses === 3) {
                statusLabel = 'VULNERABLE';
                statusColor = 'text-life-gold';
            } else {
                statusLabel = 'CRITICAL';
                statusColor = 'text-red-500';
            }

            return (
                <div className={`text-[8px] font-black uppercase tracking-widest ml-2 transition-colors duration-500 ${statusColor}`}>
                    {statusLabel}
                </div>
            );
        })()}
      </div>

      <div className="space-y-3">
          {weeks.map((weekNum, idx) => {
              const isPast = weekNum < campaign.currentWeek;
              const isActuallyActive = weekNum === campaign.currentWeek;
              const isActiveView = isActuallyActive || (unlockAllWeeks && !isPast);
              const isHarvest = weekNum === 13;
              const dateRange = getWeekRange(campaign.startDate!, weekNum);
              const { weekTasks, weekRaidSteps } = getWeekItems(weekNum);
              const hasItems = weekTasks.length > 0 || weekRaidSteps.length > 0;
              
              const performance = evaluateWeekPerformance(weekNum);
              const weekProgress = performance.targetPoints > 0 ? Math.round((performance.currentPoints / performance.targetPoints) * 100) : 0;
              const isWin = performance.isWin;

              if (isHarvest) {
                  return (
                    <motion.div
                      key={weekNum}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                        <CampaignHarvest 
                            stats={calculateHarvestStats()} 
                            currentWeek={campaign.currentWeek}
                            onComplete={() => {
                                const h = calculateHarvestStats();
                                campaignDispatch.completeCampaign(h.goldReward, h.xpReward);
                            }} 
                        />
                    </motion.div>
                  );
              }

              if (isPast) {
                  const isExpanded = expandedWeekId === weekNum;
                  return (
                      <motion.div
                        key={weekNum}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div onClick={() => setExpandedWeekId(isExpanded ? null : weekNum)} className={`border-l-4 rounded-r-lg bg-life-black transition-all cursor-pointer group ${isExpanded ? 'border-life-muted/50 bg-life-paper pb-2' : 'border-life-muted/20 opacity-60 hover:opacity-100'}`}>
                            <div className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-life-muted/20 flex items-center justify-center text-[10px] font-bold text-life-muted">W{weekNum}</div>
                                    <div>
                                        <h4 className={`text-xs font-bold transition-colors flex items-center gap-2 ${isWin ? 'text-[#10B981]' : 'text-life-muted'} group-hover:text-life-text`}>
                                            <span className="line-through">Week {weekNum}</span>
                                            {isWin ? (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] no-underline font-black border border-[#10B981]/30">SECURED</span>
                                            ) : (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 no-underline font-black">LOST</span>
                                            )}
                                        </h4>
                                        <p className="text-[9px] text-life-muted/50 font-mono mt-0.5">{dateRange} • LOAD: {performance.currentPoints.toFixed(1)} / {performance.targetPoints.toFixed(1)} PTS</p>
                                    </div>
                                </div>
                                <div className="text-life-muted">{isExpanded ? <ChevronDown size={14} /> : <CheckCircle size={14} />}</div>
                            </div>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-3 pt-0 pb-2">
                                            <div className="h-px w-full bg-life-muted/10 mb-2" />
                                            {hasItems ? <div className="space-y-1 opacity-70">{weekTasks.map(t => <div key={t.id} className="flex items-center gap-2 text-[10px] text-life-muted line-through"><CheckSquare size={10} /> {t.title}</div>)}{weekRaidSteps.map(({ raidTitle, step }) => <div key={step.id} className="flex items-center gap-2 text-[10px] text-life-muted line-through"><Crosshair size={10} /> {raidTitle}: {step.title}</div>)}</div> : <p className="text-[10px] text-life-muted italic">No logs recorded.</p>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                      </motion.div>
                  );
              }

              if (isActiveView) {
                  const { weekTasks, weekRaidSteps, weekHabits } = getWeekItems(weekNum);
                  return (
                      <motion.div
                        key={weekNum}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className={`relative rounded-xl border transition-all duration-700 ${isActuallyActive ? 'border-[#EAB308] bg-[#0A0A0A] shadow-[0_0_40px_rgba(234,179,8,0.1)] ring-1 ring-[#EAB308]/20' : 'border-white/5 bg-black/40 border-dashed'} overflow-hidden`}>
                            <AnimatePresence>
                                {campaign.isFrozen && isActuallyActive && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px] z-10 flex items-center justify-center border border-blue-500/30 rounded-xl"
                                    >
                                        <div className="bg-life-black px-4 py-2 rounded-full border border-blue-500 text-blue-400 flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-xl"><Snowflake size={14} className="animate-spin-slow" /> Timeline Frozen</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                             <div className={`p-5 border-b border-white/5 flex justify-between items-start ${isActuallyActive ? 'bg-gradient-to-r from-[#EAB308]/5 to-transparent' : 'bg-transparent'}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-black uppercase tracking-[0.2em] ${isWin ? 'text-[#10B981]' : isActuallyActive ? 'text-white' : 'text-zinc-500'}`}>
                                            Week {weekNum}
                                        </span>
                                        {isActuallyActive && <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-lg ${isWin ? 'bg-[#10B981] shadow-[#10B981]/50' : 'bg-red-600 shadow-red-600/80'}`} />}
                                        <span className="text-[10px] font-mono text-zinc-500 ml-2 font-bold select-none opacity-60">TARGET: {performance.targetPoints.toFixed(1)} PTS</span>
                                    </div>
                                    <div className="text-[11px] font-black text-white flex items-center gap-2 uppercase tracking-widest">
                                        {isActuallyActive && <Clock size={12} className={isWin ? 'text-[#10B981]' : 'text-[#EAB308]'} />} {performance.currentPoints.toFixed(1)} / {performance.targetPoints.toFixed(1)} <span className="text-[9px] text-zinc-600">PTS SECURED</span>
                                    </div>
                                </div>
                                {isActuallyActive && (
                                    <div className="flex items-center gap-2">
                                        <div className={`text-[9px] px-3 py-1.5 rounded-sm font-black uppercase tracking-[0.25em] border transition-all ${isWin ? 'bg-[#10B981] text-black border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-black border-white/10 text-zinc-500'}`}>
                                            {isWin ? 'SECURED' : `${Math.min(100, Math.round((performance.currentPoints / performance.targetPoints) * 100))}%`}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 🟢 PROGRESS BAR (OBSIDIAN PRO) */}
                            {isActuallyActive && (
                                <div className="mx-4 mb-2">
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (performance.currentPoints / performance.targetPoints) * 100)}%` }}
                                            className={`h-full rounded-full ${isWin ? 'bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-zinc-800 to-zinc-500 opacity-50'}`}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="p-2 space-y-2">
                                {[1, 2, 3, 4, 5, 6, 7].map(dayNum => {
                                    const isToday = dayNum === campaign.currentDay && isActuallyActive;
                                    const dayIso = getDayIso(campaign.startDate!, weekNum, dayNum);
                                    
                                    const targetDayDate = addDays(safeDate(campaign.startDate!), (((weekNum - 1) * 7) + (dayNum - 1)));
                                    const targetYMD = toYMD(targetDayDate);

                                    // ABSOLUTE CHRONOLOGICAL FILTERING
                                    const dayTasks = weekTasks.filter(t => {
                                        const taskDeadline = t.deadline ? toYMD(t.deadline) : null;
                                        
                                        if (!taskDeadline) {
                                            // Unplanned missions ONLY manifest in the 'LIVE' box of the current week
                                            return isToday;
                                        }

                                        // Planned missions MUST match the box date exactly
                                        return taskDeadline === targetYMD;
                                    });

                                    const daySteps = weekRaidSteps.filter(({ step }) => {
                                        if (!step.scheduledDate) return false;
                                        return toYMD(step.scheduledDate) === targetYMD;
                                    });
                                    
                                    // Habits: Only show in "LIVE" day list
                                    const dayHabits = isToday ? weekHabits.filter(h => checkHabitActive(h, dayIso)) : [];
                                    
                                    const hasDayItems = dayTasks.length > 0 || daySteps.length > 0 || dayHabits.length > 0;
                                    if (!isToday && !hasDayItems) return null; 

                                    const dayId = `week-${weekNum}-day-${dayNum}`;
                                    const isPastDay = (weekNum < campaign.currentWeek) || (weekNum === campaign.currentWeek && dayNum < campaign.currentDay);
                                    const isCollapsed = collapsedDays[dayId] !== undefined ? collapsedDays[dayId] : isPastDay;

                                    return (
                                        <div key={dayId} className={`rounded-lg border ${isToday ? 'border-[#EAB308]/30 bg-white/[0.02] shadow-inner' : 'border-white/5 bg-black'} transition-all duration-300 relative overflow-hidden`}>
                                            {isToday && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EAB308]" />}
                                            <div 
                                                onClick={() => toggleDayCollapse(dayId)}
                                                className="flex items-center justify-between p-2 cursor-pointer hover:bg-white/[0.02] select-none"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-[#EAB308]' : 'text-zinc-500'}`}>Day {dayNum}</span>
                                                    <span className="text-[9px] text-white font-mono font-bold">{getDayLabel(campaign.startDate!, weekNum, dayNum)}</span>
                                                    {isPastDay && (
                                                        <ChevronDown size={10} className={`text-zinc-600 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isToday && <span className="text-[8px] px-1.5 py-0.5 rounded bg-life-gold text-black font-black uppercase animate-pulse">Live</span>}
                                                    {isToday && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                dispatch.setModal('addTask', { 
                                                                    date: getDayIso(campaign.startDate!, weekNum, dayNum), 
                                                                    origin: 'campaign',
                                                                    isCampaign: true,
                                                                    allowedFronts: campaign.activeFronts || []
                                                                });
                                                            }} 
                                                            className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-[#EAB308] text-zinc-500 hover:text-black transition-all active:scale-90" 
                                                            title="Tactical Insert"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <AnimatePresence initial={false}>
                                                {!isCollapsed && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                    >
                                                        <div className="px-2 pb-2 pt-0 space-y-1">
                                                            {hasDayItems ? (
                                                                <>
                                                                    {dayHabits.map(h => (
                                                                        <TacticalItem 
                                                                            key={`habit-${h.id}`} 
                                                                            title={`Habit: ${h.title}`} 
                                                                            isCompleted={h.status === 'completed'} 
                                                                            type="mission" 
                                                                            onToggle={() => habitDispatch.processHabit(h.id, h.status === 'completed' ? 'pending' : 'completed')} 
                                                                            onOpenDetails={() => dispatch.setModal('itemDetails', { itemId: h.id, type: 'habit' })} 
                                                                            colorClass="text-life-diamond" 
                                                                            difficulty={h.difficulty || 1}
                                                                        />
                                                                    ))}
                                                                    {dayTasks.map(t => (
                                                                        <TacticalItem 
                                                                            key={`task-${t.id}`} 
                                                                            title={t.title} 
                                                                            isCompleted={t.isCompleted} 
                                                                            type="mission" 
                                                                            onToggle={() => taskDispatch.toggleTask(t.id)} 
                                                                            onOpenDetails={() => dispatch.setModal('itemDetails', { itemId: t.id, type: 'task' })} 
                                                                            colorClass="text-white" 
                                                                            difficulty={t.difficulty || 1}
                                                                        />
                                                                    ))}
                                                                    {daySteps.map(({ raidId, raidTitle, step }) => (
                                                                        <TacticalItem 
                                                                            key={`step-${step.id}`} 
                                                                            title={`${raidTitle}: ${step.title}`} 
                                                                            isCompleted={step.isCompleted} 
                                                                            type="raid" 
                                                                            onToggle={() => raidDispatch.toggleRaidStep(raidId, step.id)} 
                                                                            onOpenDetails={() => dispatch.setModal('itemDetails', { itemId: step.id, parentId: raidId, type: 'raid_step' })} 
                                                                            colorClass="text-life-hard" 
                                                                            difficulty={step.difficulty || 1}
                                                                        />
                                                                    ))}
                                                                </>
                                                            ) : (
                                                                <div className="text-[9px] text-zinc-700/50 italic text-center py-3 border border-dashed border-white/5 rounded uppercase tracking-widest font-bold">
                                                                    DEPLOY OBJECTIVES TO COMMENCE
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                      </motion.div>
                  );
              }

              return (
                  <motion.div
                    key={weekNum}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                      <div className="border border-life-muted/10 rounded-xl bg-life-black opacity-60 hover:opacity-100 transition-opacity">
                          <div className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-life-muted/10 flex items-center justify-center text-xs font-bold text-life-muted">{weekNum}</div>
                                  <div>
                                      <h4 className="text-xs font-bold text-life-text uppercase tracking-wider">Week {weekNum}</h4>
                                      <p className="text-[9px] text-life-muted font-mono">{dateRange} • TARGET: {performance.targetPoints.toFixed(1)} PTS</p>
                                  </div>
                              </div>
                              <Lock size={14} className="text-life-muted/30" />
                          </div>
                          {hasItems && (
                              <div className="px-3 pb-3 pt-0">
                                  <div className="h-px w-full bg-life-muted/10 mb-2" />
                                  <div className="flex flex-wrap gap-1">
                                      {weekTasks.map(t => <div key={t.id} className="w-2 h-2 rounded-full bg-life-muted" title={t.title} />)}
                                      {weekRaidSteps.map(({ raidTitle, step }) => <div key={step.id} className="w-2 h-2 rounded-full bg-life-hard" title={`${raidTitle}: ${step.title}`} />)}
                                  </div>
                              </div>
                          )}
                      </div>
                  </motion.div>
              );
          })}
      </div>

      <div className="mt-8 pt-8 border-t border-life-muted/10 flex justify-between items-center">
          <button onClick={campaignDispatch.toggleFreeze} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${campaign.isFrozen ? 'text-blue-400 hover:text-blue-300' : 'text-life-muted hover:text-blue-400'}`}><Snowflake size={14} className={campaign.isFrozen ? 'animate-pulse' : ''} /> {campaign.isFrozen ? 'Resume Timeline' : 'Freeze Time'}</button>
          
          <HoldButton 
            onComplete={handleAbortCampaign} 
            className="flex items-center gap-2 px-4 py-2 rounded border border-white/5 bg-black/40 text-[10px] font-bold uppercase tracking-widest text-life-muted hover:text-life-hard hover:border-life-hard/30 transition-all active:scale-95 overflow-hidden"
          >
            <RotateCcw size={14} /> Hold to Abort
          </HoldButton>
      </div>
    </div>
  );
};

export default CampaignView;
