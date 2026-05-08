
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Campaign } from '../types/campaignTypes';
import { useAscension } from './AscensionContext';
import { useTasks } from './TaskContext';
import { useRaids } from './RaidContext';
import { useHabits } from './HabitContext';
import { useSkills } from './SkillContext';
import { playSound } from '../utils/audio';

interface CampaignState {
    campaign: Campaign;
}

interface CampaignContextType {
    campaignState: CampaignState;
    campaignDispatch: {
        initCampaign: (data: { 
            title: string, 
            startDate: string, 
            strategicGoal: string, 
            activeFronts: string[], 
            intensityTarget: number,
            statTargets: Record<string, number>, 
            stakedGold: number 
        }) => void;
        toggleFreeze: () => void;
        resetCampaign: () => void;
        completeCampaign: (goldReward: number, xpReward: number) => void; 
        updateStartDate: (newDate: string) => void;
        restoreData: (newCampaign: Campaign) => void;
        saveMission: (taskData: any) => void;
    };
    evaluateWeekPerformance: (weekNum: number) => { isWin: boolean, currentPoints: number, targetPoints: number };
}

const STORAGE_KEY_CAMPAIGN = 'ASCENSION_CAMPAIGN_DATA_V2';

const DEFAULT_CAMPAIGN: Campaign = {
    id: 'campaign_root',
    title: '',
    startDate: null,
    isFrozen: false,
    currentWeek: 0,
    currentDay: 0,
    totalWeeks: 12,
    stakedGold: 0,
    results: Array(12).fill('pending'),
    streakBonus: 0,
    lastEvaluatedWeek: 0,
    isActive: false
};

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { state: lifeState, dispatch: lifeDispatch } = useAscension();
    const soundEnabled = lifeState.user.preferences.soundEnabled;

    // 🛡️ Safe Loader
    const safeLoad = (): Campaign => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_CAMPAIGN);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn("Failed to load campaign persistence:", e);
        }
        return DEFAULT_CAMPAIGN;
    };

    const [campaign, setCampaign] = useState<Campaign>(safeLoad);
    const { taskState, taskDispatch } = useTasks();
    const { raidState } = useRaids();
    const { habitState } = useHabits();
    const { skillState } = useSkills();

    // 🟢 SYNC BONUS TO CORE
    useEffect(() => {
        if (campaign.isActive && campaign.streakBonus !== lifeState.user.campaignBonus) {
            lifeDispatch.updateUser({ campaignBonus: campaign.streakBonus });
        } else if (!campaign.isActive && lifeState.user.campaignBonus !== 0) {
            lifeDispatch.updateUser({ campaignBonus: 0 });
        }
    }, [campaign.isActive, campaign.streakBonus, lifeState.user.campaignBonus]);

    // 🟢 ATTRIBUTE POINT CALCULATOR
    const getPointsFromDifficulty = (difficulty: string) => {
        if (difficulty === 'hard') return 2;
        if (difficulty === 'normal' || difficulty === 'medium') return 1;
        return 0.5; // easy
    };

    // 🟢 EFFICIENCY EVALUATOR (Now based on Attribute Points)
    const evaluateWeekPerformance = (weekNum: number) => {
        if (!campaign.startDate || weekNum < 1 || weekNum > 12) return { isWin: false, currentPoints: 0, targetPoints: 0 };
        
        const start = new Date(campaign.startDate);
        if (isNaN(start.getTime())) return { isWin: false, currentPoints: 0, targetPoints: 0 };
        
        const wStart = new Date(start.getTime() + (weekNum - 1) * 7 * 86400000);
        wStart.setHours(0,0,0,0);
        const wEnd = new Date(wStart.getTime() + 6 * 86400000);
        wEnd.setHours(23,59,59,999);

        const fronts = campaign.activeFronts || [];
        
        // Calculate Total Target for the week
        const weeklyTarget = campaign.intensityTarget || 5;

        // Helper to get total campaign-relevant points from an item
        const getRelevantPoints = (stat: string, difficulty: string, skillId?: string) => {
            const statReward = getPointsFromDifficulty(difficulty);
            const linkedSkill = skillId ? skillState.skills.find(s => s.id === skillId) : undefined;
            
            const targetStats = linkedSkill?.relatedStats?.length 
                ? linkedSkill.relatedStats as string[] 
                : [stat];
            
            const rewardPerStat = statReward / targetStats.length;
            
            // Sum points that land on our active fronts
            return targetStats.reduce((sum, s) => {
                return sum + (fronts.includes(s) ? rewardPerStat : 0);
            }, 0);
        };

        // Sum Points from Tasks
        const weekPointsFromTasks = taskState.tasks.reduce((sum, t) => {
            if (t.isArchived || !t.isCompleted) return sum;
            
            // Determine relevant date for points
            // For missions with a deadline, the deadline determines the week
            // For unplanned missions (no deadline), the completion date determines the week
            const dateToEvaluate = t.deadline || t.completedAt;
            if (!dateToEvaluate) return sum;

            const d = new Date(dateToEvaluate);
            if (d < wStart || d > wEnd) return sum;
            
            return sum + getRelevantPoints(t.stat, t.difficulty, t.skillId);
        }, 0);

        // Sum Points from Habits
        const weekPointsFromHabits = habitState.habits.reduce((sum, h) => {
            if (h.isArchived) return sum; 
            
            // Count completions in history that fell within this week
            const weeklyCompletions = h.history.filter(iso => {
                const d = new Date(iso);
                return d >= wStart && d <= wEnd;
            }).length;

            if (weeklyCompletions === 0) return sum;

            return sum + (weeklyCompletions * getRelevantPoints(h.stat, h.difficulty, h.skillId));
        }, 0);

        // Sum Points from Raids
        const weekPointsFromRaids = raidState.raids.reduce((sum, raid) => {
            if (raid.status === 'archived') return sum;

            const completedStepsInWeek = raid.steps.filter(step => {
                if (!step.scheduledDate || step.isArchived || !step.isCompleted) return false;
                const d = new Date(step.scheduledDate);
                return d >= wStart && d <= wEnd;
            });

            return sum + completedStepsInWeek.reduce((stepSum, step) => {
                const stepDifficulty = step.difficulty || raid.difficulty;
                // Raids can override stat on step level, or fallback to raid base stats (raid.stats[0])
                const raidBaseStat = raid.stats && raid.stats.length > 0 ? raid.stats[0] : 'STR';
                const stepStat = step.stat || raidBaseStat;
                const isStatOverridden = step.stat && (!raid.stats || step.stat !== raid.stats[0]);
                const stepSkillId = isStatOverridden ? undefined : raid.skillId;

                return stepSum + getRelevantPoints(stepStat, stepDifficulty, stepSkillId);
            }, 0);
        }, 0);

        const totalPointsEarning = weekPointsFromTasks + weekPointsFromHabits + weekPointsFromRaids;
        
        return {
            isWin: totalPointsEarning >= weeklyTarget,
            currentPoints: totalPointsEarning,
            targetPoints: weeklyTarget
        };
    };

    // 🟢 EFFICIENCY EVALUATOR (Legacy support or for simple display)
    const evaluateEfficiency = (weekNum: number): number => {
        const perf = evaluateWeekPerformance(weekNum);
        if (perf.targetPoints === 0) return 0;
        return Math.min(100, Math.round((perf.currentPoints / perf.targetPoints) * 100));
    };

    // 🟢 WEEKLY CLOSURE PROTOCOL
    useEffect(() => {
        if (!campaign.isActive || !campaign.startDate) return;
        
        // We evaluate weeks that have passed
        // If currentWeek is 2, we should evaluate Week 1
        const targetWeek = campaign.currentWeek - 1;

        if (targetWeek > 0 && targetWeek > campaign.lastEvaluatedWeek && targetWeek <= 12) {
            const performance = evaluateWeekPerformance(targetWeek);
            const isWin = performance.isWin;
            
            setCampaign(prev => {
                const newResults = [...prev.results];
                newResults[targetWeek - 1] = isWin ? 'win' : 'loss';

                // Streak Logic
                let newStreakBonus = prev.streakBonus;
                
                if (!isWin) {
                    newStreakBonus = 0;
                    lifeDispatch.addToast(`WEEK ${targetWeek} FAILED (Target: ${performance.targetPoints} Pts // Earned: ${performance.currentPoints} Pts)`, 'error');
                } else {
                    // Count consecutive wins at the end
                    let streakCount = 0;
                    for (let i = targetWeek - 1; i >= 0; i--) {
                        if (newResults[i] === 'win') streakCount++;
                        else break;
                    }
                    
                    if (streakCount >= 2) {
                        newStreakBonus = (streakCount - 1) * 0.05;
                        lifeDispatch.addToast(`WEEK ${targetWeek} SUCCESS! WIN STREAK: ${streakCount}`, 'success');
                    } else {
                        lifeDispatch.addToast(`WEEK ${targetWeek} SUCCESS!`, 'success');
                    }
                }

                // Penalty Logic
                let newStakedGold = prev.stakedGold || 0;
                if (!isWin && newStakedGold > 0) {
                    const penalty = Math.floor(newStakedGold * 0.10);
                    newStakedGold -= penalty;
                    lifeDispatch.addToast(`PENALTY: ${penalty} Gold Forfeited`, 'error');
                }

                return {
                    ...prev,
                    results: newResults,
                    streakBonus: newStreakBonus,
                    stakedGold: newStakedGold,
                    lastEvaluatedWeek: targetWeek
                };
            });
        }
    }, [campaign.currentWeek, campaign.isActive, taskState.tasks, raidState.raids, habitState.habits]);

    useEffect(() => {
        if (!campaign.startDate || !campaign.isActive) return;

        const calculateTime = () => {
            if (campaign.isFrozen) return;

            const debugDate = lifeState.ui.debugDate;
            const now = debugDate ? new Date(debugDate) : new Date();
            
            const start = new Date(campaign.startDate!);
            if (isNaN(start.getTime())) return;
            
            // Normalize dates to midnight for calendar-day calculation
            const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const diffTime = nowMidnight.getTime() - startMidnight.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                setCampaign(prev => ({ ...prev, currentWeek: 0, currentDay: 0 }));
            } else {
                const week = Math.floor(diffDays / 7) + 1;
                const day = (diffDays % 7) + 1;
                const cappedWeek = Math.min(week, 13);
                
                setCampaign(prev => {
                    if (prev.currentWeek !== cappedWeek || prev.currentDay !== day) {
                        return { ...prev, currentWeek: cappedWeek, currentDay: day };
                    }
                    return prev;
                });
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 60000); 
        return () => clearInterval(interval);
    }, [campaign.startDate, campaign.isActive, campaign.isFrozen, lifeState.ui.debugDate]);

    useEffect(() => {
        const saveTimeout = setTimeout(() => {
            // Always save if active, or if key exists to allow "reset" state to persist
            if (campaign.isActive || localStorage.getItem(STORAGE_KEY_CAMPAIGN)) {
                localStorage.setItem(STORAGE_KEY_CAMPAIGN, JSON.stringify(campaign));
            }
        }, 500);
        return () => clearTimeout(saveTimeout);
    }, [campaign]);

    // Actions
    const initCampaign = (data: { 
        title: string, 
        startDate: string, 
        strategicGoal: string, 
        activeFronts: string[], 
        intensityTarget: number,
        statTargets: Record<string, number>, 
        stakedGold: number 
    }) => {
        // Deduct gold
        if (data.stakedGold > lifeState.user.gold) {
            lifeDispatch.addToast('Insufficient Gold for Stake', 'error');
            return;
        }

        lifeDispatch.updateUser({ gold: lifeState.user.gold - data.stakedGold });

        const newCampaign: Campaign = {
            ...DEFAULT_CAMPAIGN,
            id: `cmp_${Date.now()}`,
            title: data.title,
            startDate: data.startDate,
            strategicGoal: data.strategicGoal,
            activeFronts: data.activeFronts,
            intensityTarget: data.intensityTarget,
            statTargets: data.statTargets,
            stakedGold: data.stakedGold,
            isActive: true,
        };
        playSound('success', soundEnabled);
        setCampaign(newCampaign);
        lifeDispatch.addToast('Operation Tempo Initiated', 'success');
    };

    const toggleFreeze = () => {
        const newState = !campaign.isFrozen;
        setCampaign(prev => ({ ...prev, isFrozen: newState }));
        playSound('click', soundEnabled);
        lifeDispatch.addToast(newState ? 'Timeline Frozen ❄️' : 'Timeline Resumed ▶️', 'info');
    };

    const resetCampaign = () => {
        const staked = campaign.stakedGold || 0;
        const penalty = Math.floor(staked * 0.5);
        const refund = staked - penalty;
        
        // Return 50% of the staked gold
        lifeDispatch.updateUser({ gold: lifeState.user.gold + refund });
        setCampaign(DEFAULT_CAMPAIGN);
        playSound('delete', soundEnabled);
        lifeDispatch.addToast(`Campaign Aborted. ${penalty} Gold Forfeited.`, 'error');
    };

    const completeCampaign = (goldReward: number, xpReward: number) => {
        // Add rewards to user profile
        lifeDispatch.updateUser({ 
            gold: lifeState.user.gold + goldReward,
            currentXP: lifeState.user.currentXP + xpReward
        });
        
        setCampaign(DEFAULT_CAMPAIGN);
        playSound('level-up', soundEnabled);
        lifeDispatch.addToast(`Harvest Complete! +${goldReward} Gold, +${xpReward} XP.`, 'success');
    };

    const updateStartDate = (newDate: string) => {
        setCampaign(prev => ({ ...prev, startDate: newDate }));
        playSound('click', soundEnabled);
        lifeDispatch.addToast('Timeline Shifted', 'info');
    };

    const restoreData = (newCampaign: Campaign) => {
        setCampaign(newCampaign);
        lifeDispatch.addToast('Campaign Restored', 'success');
    };

    const saveMission = (taskData: any) => {
        taskDispatch.addTask({
            ...taskData,
            isCampaign: true
        });
        lifeDispatch.addToast('Campaign Mission Logged', 'success');
    };

    return (
        <CampaignContext.Provider value={{ 
            campaignState: { campaign }, 
            campaignDispatch: { initCampaign, toggleFreeze, resetCampaign, completeCampaign, updateStartDate, restoreData, saveMission },
            evaluateWeekPerformance // Expose for HUD
        }}>
            {children}
        </CampaignContext.Provider>
    );
};

export const useCampaign = () => {
    const context = useContext(CampaignContext);
    if (context === undefined) {
        throw new Error('useCampaign must be used within a CampaignProvider');
    }
    return context;
};
