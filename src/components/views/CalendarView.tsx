
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    RefreshCw, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, Circle, 
    Plus, Crosshair, Target, Coffee, Zap, Info, X, Settings, AlertTriangle, ArrowRight,
    Heart, Brain, Dumbbell, Sword, Wind, Users, CircleDollarSign, Palette, Coins, Flame, Pencil,
    GripVertical, ChevronDown, ChevronUp
} from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import { useHabits } from '../../contexts/HabitContext';
import { useTasks } from '../../contexts/TaskContext';
import { useAscension } from '../../contexts/AscensionContext';
import { checkHabitActive } from '../../utils/habitEngine';
import { playSound } from '../../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { STAT_COLORS, DIFFICULTY_COLORS, DIFFICULTY_HEX } from '../../types/constants';
import { Stat, Difficulty } from '../../types/types';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getTaskPoints = (difficulty: Difficulty) => {
    switch (difficulty) {
        case Difficulty.HARD: return 2.0;
        case Difficulty.NORMAL: return 1.0;
        case Difficulty.EASY: return 0.5;
        default: return 1.0;
    }
};

const getSectorIcon = (sector: string) => {
    switch (sector.toUpperCase()) {
        case 'STRENGTH':
        case 'STR': return <Dumbbell size={10} />;
        case 'INTELLIGENCE':
        case 'INT': return <Brain size={10} />;
        case 'DISCIPLINE':
        case 'DIS': return <Zap size={10} />;
        case 'HEALTH':
        case 'HEA': return <Heart size={10} />;
        case 'CREATIVITY':
        case 'CRT': return <Palette size={10} />;
        case 'SPIRIT':
        case 'SPR': return <Flame size={10} />;
        case 'RELATIONS':
        case 'REL': return <Users size={10} />;
        case 'FINANCE':
        case 'FIN': return <Coins size={10} />;
        default: return <Zap size={10} />;
    }
};

const getStatDisplayName = (stat: Stat) => {
    const mapping: Record<string, string> = {
        'STR': 'STRENGTH',
        'INT': 'INTELLIGENCE',
        'DIS': 'DISCIPLINE',
        'HEA': 'HEALTH',
        'CRT': 'CREATIVITY',
        'SPR': 'SPIRIT',
        'REL': 'RELATIONS',
        'FIN': 'FINANCE'
    };
    return mapping[stat] || stat;
};

interface StagingItemProps {
    item: any;
    isRestDaySelected: boolean;
    onEdit: (id: string, type: string) => void;
    onDelete: (id: string, type: string) => void;
    onSchedule: (targetHour: number, item: any) => void;
    onFlashSlot: (hour: number) => void;
}

const StagingItem = ({ item, isRestDaySelected, onEdit, onDelete, onSchedule, onFlashSlot }: StagingItemProps) => {
    const controls = useDragControls();
    const lastTap = useRef<{ id: string; time: number } | null>(null);
    const diffColor = DIFFICULTY_HEX[item.difficulty] || '#4ADE80';
    const statColor = STAT_COLORS[item.stat] || '#FFD35B';

    return (
        <Reorder.Item 
            value={item}
            dragListener={false}
            dragControls={controls}
            className="relative"
        >
            <div className="relative group/await-chip">
                <motion.div 
                    drag={!isRestDaySelected}
                    dragSnapToOrigin
                    onDragEnd={(e, info) => {
                        if (isRestDaySelected) return;
                        const elements = document.elementsFromPoint(info.point.x, info.point.y);
                        const slotElement = elements.find(el => el.getAttribute('data-slot-hour'));
                        if (slotElement) {
                            const targetHour = parseInt(slotElement.getAttribute('data-slot-hour') || '9');
                            onSchedule(targetHour, item);
                        }
                    }}
                    onClick={() => {
                        if (isRestDaySelected) return;
                        // Fast schedule logic could go here or be passed down
                    }}
                    onTap={() => {
                        const now = Date.now();
                        if (lastTap.current?.id === item.id && (now - lastTap.current.time) < 400) {
                            onEdit(item.id, 'briefing');
                        } else {
                            lastTap.current = { id: item.id, time: now };
                        }
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                    className="bg-[#050505] rounded-lg border border-white/5 h-10 w-full flex items-center justify-between px-3 group/chip transition-colors relative z-10"
                >
                    <div className="flex items-center gap-3 w-full overflow-hidden">
                        <div 
                            className="p-1 cursor-ns-resize text-white/10 group-hover/chip:text-white/30 transition-colors"
                            onPointerDown={(e) => controls.start(e)}
                        >
                            <GripVertical size={14} />
                        </div>
                        <div className="w-[2px] h-3 shrink-0" style={{ backgroundColor: isRestDaySelected ? '#64748b' : diffColor }} />
                        <span className="truncate uppercase tracking-tight text-white/90 font-bold text-[10px]">{item.title}</span>
                    </div>

                    <div className="shrink-0 ml-2" style={{ color: isRestDaySelected ? '#64748b' : statColor }}>
                        {getSectorIcon(item.stat)}
                    </div>
                </motion.div>
                
                {!isRestDaySelected && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-1 flex items-center gap-0.5 z-20 opacity-0 group-hover/await-chip:opacity-100 transition-opacity pr-2 bg-gradient-to-l from-black via-black to-transparent pl-4 h-full pointer-events-none group-hover/await-chip:pointer-events-auto">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(item.id, item.type);
                            }}
                            className="p-1 text-white/40 hover:text-white transition-opacity"
                        >
                            <Pencil size={10} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.id, item.type);
                            }}
                            className="p-1 text-white/40 hover:text-red-400 transition-opacity"
                        >
                            <X size={10} />
                        </button>
                    </div>
                )}
            </div>
        </Reorder.Item>
    );
};

const CalendarView: React.FC = () => {
    const { habitState, habitDispatch } = useHabits();
    const { taskState, taskDispatch } = useTasks();
    const { state: lifeState, dispatch } = useAscension();
    const { user } = lifeState;

    // 📅 STATE
    const [currentDate, setCurrentDate] = useState(new Date()); // For Month Navigation
    const [selectedDate, setSelectedDate] = useState(new Date()); // For Day Selection
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isStagingCollapsed, setIsStagingCollapsed] = useState(false);
    const [stagingItems, setStagingItems] = useState<any[]>([]);
    const [flashingSlot, setFlashingSlot] = useState<number | null>(null);
    const [isHoveringReserve, setIsHoveringReserve] = useState(false);

    // Update staging items whenever tasks or habits change
    useEffect(() => {
        const unscheduled = [
            ...taskState.tasks.filter(t => !t.isCompleted && (!t.scheduledTime || t.scheduledTime === '')).map(t => ({
                id: t.id,
                title: t.title,
                type: 'task' as const,
                stat: t.stat,
                difficulty: t.difficulty,
                scheduledTime: t.scheduledTime,
                isCompleted: t.isCompleted
            })),
            ...habitState.habits.filter(h => (!h.scheduledTime || h.scheduledTime === '')).map(h => ({
                id: h.id,
                title: h.title,
                type: 'habit' as const,
                stat: h.stat,
                difficulty: h.difficulty,
                scheduledTime: h.scheduledTime,
                isCompleted: false
            }))
        ];
        
        // Preserve existing order if possible
        setStagingItems(prev => {
            const preserved = prev.filter(p => unscheduled.some(u => u.id === p.id));
            const added = unscheduled.filter(u => !prev.some(p => p.id === u.id));
            return [...preserved, ...added];
        });
    }, [taskState.tasks, habitState.habits]);
    const lastTap = useRef<{ id: string; time: number } | null>(null);
    const timelineContainerRef = useRef<HTMLDivElement>(null);

    // 🌪️ MISSION RECOVERY ENGINE
    // Automatically returns uncompleted MISSIONS to Staging if their hour has passed.
    // Protocols (Habits) are anchored and never recovered automatically.
    React.useEffect(() => {
        const now = new Date();
        const overdueMissions = taskState.tasks.filter(t => 
            !t.isCompleted && 
            t.scheduledTime && 
            new Date(t.scheduledTime) < now
        );

        if (overdueMissions.length > 0) {
            overdueMissions.forEach(t => {
                taskDispatch.updateTask(t.id, { scheduledTime: "" });
            });
            dispatch.addToast(`${overdueMissions.length} Missed Objectives Returned to Staging`, 'info');
        }
    }, [taskState.tasks, taskDispatch]);

    // 🎯 CHRONO-SCROLL FOCUS
    // Automatically centers the current system hour when deployment map is opened.
    React.useEffect(() => {
        if (isDrawerOpen && timelineContainerRef.current) {
            const currentHour = new Date().getHours();
            // Slight delay allows for layout stabilization and animation entrance
            const scrollTimeout = setTimeout(() => {
                const targetSlot = timelineContainerRef.current?.querySelector(`[data-slot-hour="${currentHour}"]`);
                if (targetSlot) {
                    targetSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
            return () => clearTimeout(scrollTimeout);
        }
    }, [isDrawerOpen, selectedDate]);

    // 🧮 CALENDAR MATH
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        playSound('click', true);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        playSound('click', true);
    };

    const handleSelectDay = (day: number) => {
        const newDate = new Date(year, month, day);
        setSelectedDate(newDate);
        setIsDrawerOpen(true);
        playSound('click', true);
    };

    // 🕵️‍♀️ DATA PROJECTION ENGINE
    const getItemsForDate = (date: Date) => {
        const isoDateString = date.toISOString();
        const dateStr = date.toISOString().split('T')[0];

        // 1. Habits (Projected)
        const activeHabits = habitState.habits.filter(h => {
            const created = new Date(h.createdAt);
            if (date < created && date.toDateString() !== created.toDateString()) return false;
            return checkHabitActive(h, isoDateString);
        }).map(h => {
            // Projected scheduled time for habits (recurring)
            let projectedTime = h.scheduledTime;
            if (h.scheduledTime) {
                const schedDate = new Date(h.scheduledTime);
                const d = new Date(date);
                d.setHours(schedDate.getHours(), schedDate.getMinutes(), schedDate.getSeconds(), schedDate.getMilliseconds());
                projectedTime = d.toISOString();
            }
            
            return {
                id: h.id,
                title: h.title,
                type: 'habit' as const,
                isCompleted: h.history.some(d => d.startsWith(dateStr)),
                stat: h.stat,
                difficulty: h.difficulty,
                scheduledTime: projectedTime
            };
        });

        // 2. Tasks (Scheduled)
        const scheduledTasks = taskState.tasks.filter(t => {
            if (!t.deadline && !t.scheduledTime) return false;
            const tDate = t.scheduledTime ? new Date(t.scheduledTime) : new Date(t.deadline!);
            return tDate.toDateString() === date.toDateString();
        }).map(t => ({
            id: t.id,
            title: t.title,
            type: 'task' as const,
            isCompleted: t.isCompleted,
            stat: t.stat,
            difficulty: t.difficulty,
            scheduledTime: t.scheduledTime || t.deadline
        }));

        return [...activeHabits, ...scheduledTasks];
    };

    // Memoize the selected day's items
    const selectedDayItems = useMemo(() => getItemsForDate(selectedDate), [selectedDate, habitState.habits, taskState.tasks]);

    // 📈 SECTOR IMPACT CALCULATION
    const sectorImpact = useMemo(() => {
        const impact: Record<string, number> = {};
        selectedDayItems.forEach(item => {
            const points = getTaskPoints(item.difficulty);
            impact[item.stat] = (impact[item.stat] || 0) + points;
        });
        return impact;
    }, [selectedDayItems]);

    // Color mapping for sectors (High Saturation Neon)
    const sectorColorMap: Record<string, string> = {
        'STRENGTH': '#FF003C', // Neon Red
        'INTELLIGENCE': '#BC13FE', // Neon Purple
        'DISCIPLINE': '#00FFFF', // Neon Blue
        'HEALTH': '#39FF14', // Neon Green
        'SPIRIT': '#FF00FF', // Neon Magenta
        'RELATIONS': '#00FF9F', // Neon Teal
        'FINANCE': '#FFD700', // Neon Gold/Yellow
    };

    // ⚠️ OVERDUE LOGIC
    const overdueMissions = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return taskState.tasks.filter(t => {
            if (t.isCompleted) return false;
            const tDate = t.scheduledTime ? new Date(t.scheduledTime) : (t.deadline ? new Date(t.deadline) : null);
            if (!tDate) return false;
            const tDateStr = tDate.toISOString().split('T')[0];
            return tDateStr < todayStr;
        });
    }, [taskState.tasks]);

    const syncOverdueToToday = () => {
        const today = new Date();
        today.setHours(9, 0, 0, 0);
        const isoToday = today.toISOString();
        
        overdueMissions.forEach(t => {
            taskDispatch.updateTask(t.id, {
                scheduledTime: isoToday,
                deadline: new Date(today.getTime() + 8 * 3600000).toISOString()
            });
        });
        
        dispatch.addToast(`${overdueMissions.length} Missions Relocated to Today`, 'success');
        playSound('level-up', true);
    };

    const deployMissionToToday = (taskId: string) => {
        const t = taskState.tasks.find(x => x.id === taskId);
        if (!t) return;

        const today = new Date();
        today.setHours(9, 0, 0, 0);
        
        taskDispatch.updateTask(t.id, {
            scheduledTime: today.toISOString(),
            deadline: new Date(today.getTime() + 8 * 3600000).toISOString()
        });
        
        dispatch.addToast('Mission Deployed to Today', 'success');
        playSound('success', true);
    };

    const handleEditMission = (taskId: string) => {
        setIsDrawerOpen(false);
        const t = taskState.tasks.find(x => x.id === taskId);
        if (t) {
            dispatch.setModal('addTask', { editTask: t });
        }
    };

    // Check presence for dots
    const hasMissionOnDate = (date: Date) => {
        const tasksOnDate = taskState.tasks.filter(t => {
            if (t.isCompleted) return false;
            if (!t.deadline && !t.scheduledTime) return false;
            const tDate = t.scheduledTime ? new Date(t.scheduledTime) : new Date(t.deadline!);
            return tDate.toDateString() === date.toDateString();
        });
        return tasksOnDate.length > 0;
    };

    const isRestDayOnDate = (date: Date) => {
        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        const dateStr = offsetDate.toISOString().split('T')[0];
        return user.restDays && user.restDays.includes(dateStr);
    };

    // 🟢 ACTIONS
    const handleAddTask = () => {
        if (isRestDaySelected) return;
        // Close drawer immediately to prevent UI stacking
        setIsDrawerOpen(false);
        
        const offsetDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
        const isoDate = offsetDate.toISOString().split('T')[0];
        
        dispatch.setModal('addTask', { 
            defaultType: 'mission',
            date: isoDate,
            origin: 'calendar'
        });
    };

    const toggleRestDay = () => {
        const offsetDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
        const dateStr = offsetDate.toISOString().split('T')[0];
        let newRestDays = [...(user.restDays || [])];
        
        if (newRestDays.includes(dateStr)) {
            newRestDays = newRestDays.filter(d => d !== dateStr);
            dispatch.addToast('Rest Day Cancelled', 'info');
        } else {
            newRestDays.push(dateStr);
            dispatch.addToast('Rest Day Scheduled', 'success');
        }
        
        dispatch.updateUser({ restDays: newRestDays });
        playSound('level-up', true);
    };

    const getSelectedDayStr = () => {
        const offsetDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
        return offsetDate.toISOString().split('T')[0];
    };
    const selectedDayStr = getSelectedDayStr();
    const isRestDaySelected = user.restDays && user.restDays.includes(selectedDayStr);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500 relative pb-20">
            
            {/* ⚠️ OVERDUE OBJECTIVES SECTION */}
            {overdueMissions.length > 0 && (
                <div className="bg-[#121212] border border-red-900/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-red-500 animate-pulse" />
                            <h3 className="text-[10px] font-black uppercase text-red-500 tracking-[0.3em]">Overdue Objectives</h3>
                        </div>
                        {!isRestDaySelected && (
                            <button 
                                onClick={syncOverdueToToday}
                                className="bg-black/40 border border-[#FF1F1F] text-[#FF1F1F] text-[9px] font-black px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(255,31,31,0.3)] hover:bg-[#FF1F1F]/10 hover:shadow-[0_0_25px_rgba(255,31,31,0.5)] active:scale-95 transition-all flex items-center gap-2"
                            >
                                SYNC TO TODAY <ArrowRight size={10} />
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                        {overdueMissions.map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                                <span className="text-[11px] font-bold text-white/70 uppercase truncate max-w-[200px]">{t.title}</span>
                                <span className="text-[9px] font-mono text-red-400/60 font-bold">{new Date(t.deadline || t.scheduledTime!).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 🟦 SQUARE 1: MONTHLY CALENDAR */}
            <div className="bg-life-paper border border-zinc-800 rounded-2xl p-4 shadow-lg overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-life-muted/10 rounded-full text-life-muted hover:text-white transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <h3 className="text-sm font-black text-life-text uppercase tracking-widest">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-life-muted/10 rounded-full text-life-muted hover:text-white transition-colors">
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEKDAYS.map((d, i) => (
                        <div key={i} className="text-center text-[9px] font-bold text-life-muted/50 py-1">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(year, month, day);
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        const hasMission = hasMissionOnDate(date);
                        const isRestDay = isRestDayOnDate(date);

                        return (
                            <button
                                key={day}
                                onClick={() => handleSelectDay(day)}
                                className={`
                                    aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all duration-200
                                    ${isSelected 
                                        ? 'bg-white text-black font-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-110 z-10' 
                                        : 'hover:bg-white/5 text-life-text'}
                                    ${isToday && !isSelected ? 'border border-[#FFFF00]/50 text-[#FFFF00]' : ''}
                                `}
                            >
                                <span className="text-xs">{day}</span>
                                <div className="flex gap-0.5 mt-0.5">
                                    {hasMission && <div className={`w-[3px] h-[3px] rounded-full ${isSelected ? 'bg-black' : 'bg-[#FFFF00] shadow-[0_0_4px_#FFFF00]'}`} />}
                                    {isRestDay && <div className={`w-[3px] h-[3px] rounded-full ${isSelected ? 'bg-black' : 'bg-[#3b82f6]'}`} />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 🟦 SQUARE 2: DAILY AGENDA (TRANSFORMED INTO TACTICAL LIST) */}
            <div className="bg-life-black border border-zinc-800 rounded-2xl p-0 overflow-hidden shadow-lg flex flex-col max-h-[300px]">
                <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-life-paper/50 shrink-0">
                    <h4 className="text-[10px] font-black uppercase text-life-muted tracking-widest">Selected Sector Agenda</h4>
                    <span className="text-[10px] font-mono text-life-muted">{selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                </div>
                
                {/* 📊 EXPECTED SECTOR IMPACT */}
                <div className="px-3 py-2 bg-black/40 border-b border-white/5 shrink-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Expected Sector Impact</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(sectorImpact).length > 0 ? (
                            Object.entries(sectorImpact).map(([stat, points]) => (
                                <div key={stat} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: STAT_COLORS[stat as Stat] || '#FACC15' }} />
                                    <span className="text-[8px] font-black text-white/80 uppercase">{stat} {points % 1 === 0 ? points : points.toFixed(1)}</span>
                                </div>
                            ))
                        ) : (
                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Minimal Influence Detected</span>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                    {selectedDayItems.length > 0 ? (
                        <div className="space-y-2">
                            {selectedDayItems
                                .sort((a, b) => {
                                    const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : 0;
                                    const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : 0;
                                    return timeA - timeB;
                                })
                                .map((item, idx) => {
                                    const diffColor = DIFFICULTY_HEX[item.difficulty] || '#4ADE80';
                                    const time = item.scheduledTime 
                                        ? new Date(item.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                                        : '--:--';
                                    
                                    return (
                                        <div key={idx} className="flex items-center gap-3 bg-black border border-white/5 rounded-lg h-10 relative overflow-hidden group hover:border-white/10 transition-colors">
                                            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: isRestDaySelected ? '#64748b' : diffColor }} />
                                            
                                            <div className="pl-4 flex items-center gap-3 w-full pr-3 text-left">
                                                <span className="text-[9px] font-mono text-white/40 shrink-0">{time}</span>
                                                <span className="text-[11px] font-bold text-white truncate flex-1 uppercase tracking-tight">{item.title}</span>
                                                <div className="shrink-0 flex items-center gap-1.5" style={{ color: isRestDaySelected ? '#64748b' : STAT_COLORS[item.stat as Stat] }}>
                                                    {item.type === 'habit' && <RefreshCw size={8} className="opacity-40" />}
                                                    <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                                                        {getSectorIcon(item.stat)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-6 opacity-40">
                            <Crosshair size={24} className="mb-2 text-white" />
                            <p className="text-[10px] text-white font-black uppercase tracking-[0.2em] text-center">Station Idle - No Deployments Scheduled</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 🗄️ DAILY BRIEFING DRAWER */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />

                        {/* Drawer */}
                        <motion.div 
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#0a0a0a]/95 border-t border-white/10 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-[101] backdrop-blur-xl px-6 pb-12 pt-8"
                        >
                            {/* Handle Bar */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full" />
                            
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-[#FFFF00] animate-pulse" />
                                        <h2 className="text-white font-black text-xs uppercase tracking-[0.3em]">Daily Briefing</h2>
                                    </div>
                                    <h1 className="text-2xl font-black text-white font-mono">
                                        {selectedDate.toLocaleDateString('en-US', { day: '2-digit', month: 'long' }).toUpperCase()}
                                    </h1>
                                </div>
                                <button 
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Deployment Timeline HUD */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Deployment Map</h3>
                                        <div className="flex gap-2">
                                            {isRestDaySelected && (
                                                <motion.span 
                                                    animate={{ 
                                                        boxShadow: [
                                                            '0 0 10px rgba(59,130,246,0.4)',
                                                            '0 0 25px rgba(59,130,246,0.8)',
                                                            '0 0 10px rgba(59,130,246,0.4)'
                                                        ]
                                                    }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                    className="text-[9px] font-black text-white uppercase tracking-tighter bg-[#3b82f6] px-2 py-0.5 rounded"
                                                >
                                                    REST MODE ACTIVE
                                                </motion.span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div 
                                        ref={timelineContainerRef}
                                        className={`h-[430px] overflow-y-auto pr-2 custom-scrollbar bg-black/40 rounded-3xl border border-white/5 relative transition-all duration-500 ${isRestDaySelected ? 'opacity-40' : 'opacity-100'}`}
                                    >
                                        <div className={isRestDaySelected ? 'pointer-events-none' : ''}>
                                            {/* 📦 STICKY STAGING AREA */}
                                            <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5 mb-4 shadow-xl">
                                                <div className="p-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#EAB308] shadow-[0_0_8px_#EAB308]" />
                                                        <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">Tactical Reserve</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {stagingItems.length > 0 && (
                                                            <span className="text-[8px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded uppercase">{stagingItems.length} ACTIVE</span>
                                                        )}
                                                        <button 
                                                            onClick={() => setIsStagingCollapsed(!isStagingCollapsed)}
                                                            className="p-1 hover:bg-white/5 rounded transition-colors text-white/40 hover:text-white"
                                                        >
                                                            {isStagingCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {!isStagingCollapsed && (
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ 
                                                                height: 'auto', 
                                                                opacity: 1,
                                                                boxShadow: isHoveringReserve ? '0 0 20px #EAB308' : 'none',
                                                                borderColor: isHoveringReserve ? '#EAB308' : 'rgba(234, 179, 8, 0.3)'
                                                            }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="px-3 pb-4"
                                                        >
                                                            <div 
                                                                data-drop-zone="reserve"
                                                                className={`border border-dashed rounded-2xl p-2 bg-[#050505]/80 transition-colors duration-300 ${isHoveringReserve ? 'border-[#EAB308] bg-[#EAB308]/5' : 'border-[#EAB308]/30'}`}
                                                            >
                                                                {stagingItems.length === 0 ? (
                                                                    <div className="py-6 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                                                                        <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em]">Station Idle - All Systems Deployed</span>
                                                                    </div>
                                                                ) : (
                                                                    <Reorder.Group 
                                                                        axis="y" 
                                                                        values={stagingItems} 
                                                                        onReorder={setStagingItems}
                                                                        className="flex flex-col gap-1 max-h-[135px] overflow-y-auto pr-1 custom-scrollbar"
                                                                    >
                                                                        {stagingItems.map(item => (
                                                                            <StagingItem 
                                                                                key={item.id}
                                                                                item={item}
                                                                                isRestDaySelected={isRestDaySelected}
                                                                                onFlashSlot={setFlashingSlot}
                                                                                onEdit={(id, type) => {
                                                                                    if (type === 'briefing') {
                                                                                        const fullItem = item.type === 'task' 
                                                                                            ? taskState.tasks.find(t => t.id === id) 
                                                                                            : habitState.habits.find(h => h.id === id);
                                                                                        dispatch.setModal('missionBriefing', { item: fullItem });
                                                                                        playSound('level-up', true);
                                                                                    } else if (item.type === 'task') {
                                                                                        handleEditMission(id);
                                                                                    } else {
                                                                                        const habit = habitState.habits.find(h => h.id === id);
                                                                                        if (habit) dispatch.setModal('addTask', { editHabit: habit });
                                                                                    }
                                                                                }}
                                                                                onDelete={(id, type) => {
                                                                                    if (type === 'task') {
                                                                                        taskDispatch.deleteTask(id);
                                                                                    } else {
                                                                                        habitDispatch.deleteHabit(id);
                                                                                    }
                                                                                    playSound('click', true);
                                                                                }}
                                                                                onSchedule={(targetHour, item) => {
                                                                                    const itemsInTarget = selectedDayItems.filter(m => {
                                                                                        if (m.isCompleted) return false;
                                                                                        return m.scheduledTime && new Date(m.scheduledTime).getHours() === targetHour;
                                                                                    });
                                                                                    
                                                                                    const currentPoints = itemsInTarget.reduce((sum, m) => sum + getTaskPoints(m.difficulty), 0);
                                                                                    const itemPoints = getTaskPoints(item.difficulty);

                                                                                    if (currentPoints + itemPoints <= 2.0) {
                                                                                        const scheduledDate = new Date(selectedDate);
                                                                                        scheduledDate.setHours(targetHour, 0, 0, 0);
                                                                                        
                                                                                        if (item.type === 'task') {
                                                                                            taskDispatch.updateTask(item.id, { scheduledTime: scheduledDate.toISOString() });
                                                                                        } else {
                                                                                            habitDispatch.updateHabit(item.id, { scheduledTime: scheduledDate.toISOString() });
                                                                                        }
                                                                                        playSound('level-up', true);
                                                                                        dispatch.addToast(`Deployed to ${targetHour}:00`, 'success');
                                                                                    } else {
                                                                                        setFlashingSlot(targetHour);
                                                                                        setTimeout(() => setFlashingSlot(null), 800);
                                                                                        dispatch.addToast('Sector Capacity Exceeded (MAX 2.0pts)', 'error');
                                                                                        playSound('click', true);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </Reorder.Group>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                        <div className="relative pt-4">
                                            {Array.from({ length: 17 }, (_, i) => i + 6).map((hour) => {
                                                const hourStr = hour.toString().padStart(2, '0');
                                                const timeLabel = `${hourStr}:00`;
                                                const isCurrentHour = new Date().getHours() === hour && new Date().toDateString() === selectedDate.toDateString();
                                                
                                                // Restoration of filters
                                                const missionsInSlot = selectedDayItems.filter(item => {
                                                    if (item.isCompleted) return false;
                                                    if (!item.scheduledTime || !item.scheduledTime.includes('T')) return false;
                                                    return new Date(item.scheduledTime).getHours() === hour;
                                                }).sort((a, b) => {
                                                    // Habits first, then Missions
                                                    if (a.type === b.type) return a.title.localeCompare(b.title);
                                                    return a.type === 'habit' ? -1 : 1;
                                                });

                                                const hasNextMission = selectedDayItems.some(item => {
                                                    if (item.isCompleted) return false;
                                                    if (!item.scheduledTime || !item.scheduledTime.includes('T')) return false;
                                                    return new Date(item.scheduledTime).getHours() === hour + 1;
                                                });

                                                const totalPointsInSlot = missionsInSlot.reduce((sum, item) => {
                                                    return sum + getTaskPoints(item.difficulty);
                                                }, 0);

                                                const missionCount = missionsInSlot.length;

                                                return (
                                                    <div 
                                                        key={hour} 
                                                        data-slot-hour={hour} 
                                                        className={`relative group/slot h-[60px] mb-4 transition-all duration-500 rounded-xl ${flashingSlot === hour ? 'bg-red-500/20 ring-1 ring-red-500/50' : ''} ${isCurrentHour ? 'bg-white/[0.03] ring-1 ring-white/5' : ''}`}
                                                    >
                                                        {/* ➕ SLOT EXPANDER [+] - Only show if capacity remains AND NOT EMPTY (corner trigger) */}
                                                        {totalPointsInSlot < 2.0 && missionCount > 0 && !isRestDaySelected && (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const offsetDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
                                                                    const isoDate = offsetDate.toISOString().split('T')[0];
                                                                    setIsDrawerOpen(false);
                                                                    dispatch.setModal('addTask', { 
                                                                        defaultType: 'mission',
                                                                        date: isoDate,
                                                                        origin: 'calendar',
                                                                        hour: hour
                                                                    });
                                                                }}
                                                                className="absolute top-0 -right-2 p-1 opacity-20 hover:opacity-100 text-white transition-opacity z-50 bg-black/40 rounded-full"
                                                                title="Add Mission to this Slot"
                                                            >
                                                                <Plus size={12} strokeWidth={1} />
                                                            </button>
                                                        )}

                                                        <div className="flex items-center gap-4 h-full">
                                                            <div className={`w-10 text-[9px] leading-none shrink-0 text-center transition-all duration-500 ${isCurrentHour ? 'text-white font-black drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] scale-110' : 'font-sans text-white/40'}`}>
                                                                {timeLabel}
                                                            </div>

                                                            <div className="flex-1 relative flex gap-1 h-full items-center justify-center">
                                                                {/* ➕ CENTERED ADD BUTTON (IF EMPTY) */}
                                                                {missionCount === 0 && !isRestDaySelected && (
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const offsetDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
                                                                            const isoDate = offsetDate.toISOString().split('T')[0];
                                                                            setIsDrawerOpen(false);
                                                                            dispatch.setModal('addTask', { 
                                                                                defaultType: 'mission',
                                                                                date: isoDate,
                                                                                origin: 'calendar',
                                                                                hour: hour
                                                                            });
                                                                        }}
                                                                        className="absolute inset-0 flex items-center justify-center opacity-60 hover:opacity-100 text-white transition-opacity z-20 group-hover/slot:scale-110"
                                                                        title="Deploy Mission"
                                                                    >
                                                                        <Plus size={20} strokeWidth={1} />
                                                                    </button>
                                                                )}
                                                                {missionCount > 0 && (
                                                                    <div className="flex gap-1 flex-1 h-full items-center justify-center">
                                                                        {missionsInSlot.map((item) => {
                                                                            const statColor = STAT_COLORS[item.stat] || '#FFD35B';
                                                                            const diffColor = DIFFICULTY_HEX[item.difficulty] || '#4ADE80';
                                                                            // Logic: 1 = 100%, 2 = 50%, >=3 = split equally
                                                                            const widthPercent = 100 / missionCount;
                                                                            
                                                                            return (
                                                                                <motion.div 
                                                                                    key={item.id}
                                                                                    layout
                                                                                    drag={isRestDaySelected ? false : "y"}
                                                                                    dragConstraints={{ top: 0, bottom: 0 }}
                                                                                    onDrag={(e, info) => {
                                                                                        const elements = document.elementsFromPoint(info.point.x, info.point.y);
                                                                                        const isOverReserve = elements.some(el => el.getAttribute('data-drop-zone') === 'reserve');
                                                                                        if (isOverReserve !== isHoveringReserve) {
                                                                                            setIsHoveringReserve(isOverReserve);
                                                                                        }
                                                                                    }}
                                                                                    onDragEnd={(e, info) => {
                                                                                        setIsHoveringReserve(false);
                                                                                        const elements = document.elementsFromPoint(info.point.x, info.point.y);
                                                                                        const isOverReserve = elements.some(el => el.getAttribute('data-drop-zone') === 'reserve');
                                                                                        
                                                                                        if (isOverReserve) {
                                                                                            // Return to Base logic
                                                                                            if (item.type === 'task') {
                                                                                                taskDispatch.updateTask(item.id, { scheduledTime: "" });
                                                                                            } else {
                                                                                                habitDispatch.updateHabit(item.id, { scheduledTime: "" });
                                                                                            }
                                                                                            playSound('level-up', true);
                                                                                            dispatch.addToast('Mission Returned to Tactical Reserve', 'info');
                                                                                            return;
                                                                                        }

                                                                                        const shift = Math.round(info.offset.y / 76); // Adjusted for slot height + mb
                                                                                        if (shift !== 0 && item.scheduledTime) {
                                                                                            const currentTime = new Date(item.scheduledTime);
                                                                                            const currentHours = currentTime.getHours();
                                                                                            const targetHour = currentHours + shift;
                                                                                            
                                                                                            if (targetHour >= 6 && targetHour <= 22) {
                                                                                                const itemsInTarget = selectedDayItems.filter(m => {
                                                                                                    if (m.isCompleted || m.id === item.id) return false;
                                                                                                    return m.scheduledTime && new Date(m.scheduledTime).getHours() === targetHour;
                                                                                                });
                                                                                                
                                                                                                const targetPoints = itemsInTarget.reduce((sum, m) => {
                                                                                                    return sum + getTaskPoints(m.difficulty);
                                                                                                }, 0);
                                                                                                
                                                                                                const itemPoints = getTaskPoints(item.difficulty);
                                                                                                
                                                                                                if (targetPoints + itemPoints <= 2.0) {
                                                                                                    const newDate = new Date(item.scheduledTime);
                                                                                                    newDate.setHours(targetHour);
                                                                                                    
                                                                                                    if (item.type === 'task') {
                                                                                                        taskDispatch.updateTask(item.id, { scheduledTime: newDate.toISOString() });
                                                                                                    } else {
                                                                                                        habitDispatch.updateHabit(item.id, { scheduledTime: newDate.toISOString() });
                                                                                                    }
                                                                                                    playSound('click', true);
                                                                                                } else {
                                                                                                    setFlashingSlot(targetHour);
                                                                                                    setTimeout(() => setFlashingSlot(null), 800);
                                                                                                    dispatch.addToast('Sector Capacity Exceeded (MAX 2.0pts)', 'error');
                                                                                                    playSound('click', true);
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }}
                                                                                    onTap={() => {
                                                                                        const now = Date.now();
                                                                                        if (lastTap.current?.id === item.id && (now - lastTap.current.time) < 400) {
                                                                                            // Map item to full data if possible
                                                                                            let fullItem: any = item;
                                                                                            if (item.type === 'task') {
                                                                                                fullItem = taskState.tasks.find(t => t.id === item.id) || item;
                                                                                            } else {
                                                                                                fullItem = habitState.habits.find(h => h.id === item.id) || item;
                                                                                            }
                                                                                            dispatch.setModal('missionBriefing', { item: fullItem });
                                                                                            playSound('level-up', true);
                                                                                            lastTap.current = null;
                                                                                        } else {
                                                                                            lastTap.current = { id: item.id, time: now };
                                                                                        }
                                                                                    }}
                                                                                    whileHover={{ 
                                                                                        boxShadow: `0 0 15px ${diffColor}66`,
                                                                                        borderColor: diffColor,
                                                                                        scale: 1.02
                                                                                    }}
                                                                                    whileDrag={{ 
                                                                                        scale: 1.1, 
                                                                                        boxShadow: `0 0 40px ${diffColor}CC`,
                                                                                        borderColor: diffColor,
                                                                                        zIndex: 100
                                                                                    }}
                                                                                    whileTap={{ 
                                                                                        boxShadow: `0 0 30px ${diffColor}`,
                                                                                        transition: { duration: 0.1 }
                                                                                    }}
                                                                                    className="bg-[#050505] rounded-xl relative overflow-hidden group/card cursor-grab active:cursor-grabbing z-10 transition-all border-[1px] h-full flex-1"
                                                                                    style={{ 
                                                                                        borderColor: isCurrentHour ? diffColor : 'rgba(255,255,255,0.15)',
                                                                                        boxShadow: isCurrentHour ? `0 0 4px ${diffColor}` : 'none',
                                                                                        maxWidth: missionCount === 4 ? 'calc(25% - 3px)' : 'none'
                                                                                    }}
                                                                                >
                                                                                    {/* ✨ SHIMMER REFLECTION */}
                                                                                    <motion.div 
                                                                                        className={`absolute inset-0 z-20 pointer-events-none opacity-0 ${(!isRestDaySelected && !isCurrentHour) ? 'group-hover/card:opacity-100 group-active/card:opacity-100' : ''}`}
                                                                                        animate={{ 
                                                                                            backgroundPosition: ['150% 150%', '-50% -50%']
                                                                                        }}
                                                                                        transition={{ 
                                                                                            duration: 2, 
                                                                                            repeat: Infinity, 
                                                                                            ease: "linear"
                                                                                        }}
                                                                                        style={{
                                                                                            background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                                                                                            backgroundSize: '200% 200%'
                                                                                        }}
                                                                                    />

                                                                                    {/* 🛡️ FORCE VERTICAL ACCENT BAR (MANDATORY FULL HEIGHT) */}
                                                                                    <div className="absolute top-0 left-0 bottom-0 w-[3px] z-30" style={{ backgroundColor: isRestDaySelected ? '#64748b' : diffColor }} />
                                                                                    
                                                                                    {/* ✍️ CONTROL HUB (TOP-RIGHT) */}
                                                                                    {!isRestDaySelected && (
                                                                                        <div className={`absolute top-1 right-1 flex items-center gap-1 z-40 transition-opacity ${missionCount === 4 ? 'opacity-10 group-hover/card:opacity-100' : 'opacity-30 group-hover/card:opacity-100'}`}>
                                                                                            <button 
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    if (item.type === 'task') {
                                                                                                        handleEditMission(item.id);
                                                                                                    } else {
                                                                                                        const habit = habitState.habits.find(h => h.id === item.id);
                                                                                                        if (habit) dispatch.setModal('addTask', { editHabit: habit });
                                                                                                    }
                                                                                                }}
                                                                                                className="p-0.5 text-white transition-opacity"
                                                                                                title="Edit Item"
                                                                                            >
                                                                                                <Pencil size={missionCount >= 3 ? 8 : 10} strokeWidth={1} />
                                                                                            </button>
                                                                                            <button 
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    if (item.type === 'task') {
                                                                                                        taskDispatch.deleteTask(item.id);
                                                                                                    } else {
                                                                                                        habitDispatch.deleteHabit(item.id);
                                                                                                    }
                                                                                                    playSound('click', true);
                                                                                                }}
                                                                                                className="p-0.5 text-white hover:text-red-400 transition-all font-light"
                                                                                                title="Scrub Mission"
                                                                                            >
                                                                                                <X size={missionCount >= 3 ? 8 : 10} strokeWidth={1} />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* 🟢 DROP PULSE EFFECT (Managed via layout transition) */}
                                                                                    <motion.div 
                                                                                        className="absolute inset-0 pointer-events-none z-0"
                                                                                        initial={false}
                                                                                        animate={{ 
                                                                                            boxShadow: ["0 0 0px transparent", `inset 0 0 20px ${diffColor}44`, "0 0 0px transparent"] 
                                                                                        }}
                                                                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                                                                    />
                                                                                    
                                                                                    {/* ➕ FAR-LEFT INDICATOR / BUTTON - Only show if capacity remains */}
                                                                                    {totalPointsInSlot < 4 && missionCount < 4 && (
                                                                                        <button 
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                const offsetDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
                                                                                                const isoDate = offsetDate.toISOString().split('T')[0];
                                                                                                setIsDrawerOpen(false);
                                                                                                dispatch.setModal('addTask', { 
                                                                                                    defaultType: 'mission',
                                                                                                    date: isoDate,
                                                                                                    origin: 'calendar',
                                                                                                    hour: hour
                                                                                                });
                                                                                            }}
                                                                                            className="absolute left-[6px] top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100 text-white transition-opacity z-40"
                                                                                            title="Add Mission to this Slot"
                                                                                        >
                                                                                            <Plus size={10} strokeWidth={1} />
                                                                                        </button>
                                                                                    )}

                                                                                    <div className="flex h-full items-center justify-center px-2 py-1.5 overflow-hidden">
                                                                                        <div className="flex flex-col items-center gap-1 w-full h-full justify-center overflow-hidden">
                                                                                            {missionCount < 4 ? (
                                                                                                <>
                                                                                                    {missionCount <= 2 && (
                                                                                                        <span className="text-[10px] font-black text-white truncate text-center w-full uppercase tracking-tight">
                                                                                                            {item.title}
                                                                                                        </span>
                                                                                                    )}
                                                                                                    
                                                                                                    <div className="flex items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-[0.1em]" style={{ color: isRestDaySelected ? '#64748b' : statColor }}>
                                                                                                        {item.type === 'habit' && <RefreshCw size={8} className="opacity-40 shrink-0" />}
                                                                                                        {getSectorIcon(item.stat)}
                                                                                                        {missionCount === 1 ? (
                                                                                                            <span className="truncate">{getStatDisplayName(item.stat)} SECTOR</span>
                                                                                                        ) : (
                                                                                                            <span className="font-bold">{item.stat}</span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </>
                                                                                            ) : (
                                                                                                <div className="flex flex-col items-center gap-0.5" style={{ color: isRestDaySelected ? '#64748b' : statColor }}>
                                                                                                    {item.type === 'habit' && <RefreshCw size={7} className="opacity-40" />}
                                                                                                    <div className="text-[12px]">
                                                                                                        {getSectorIcon(item.stat)}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </motion.div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button 
                                        onClick={handleAddTask}
                                        className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#FACC15] text-black font-black uppercase text-[10px] tracking-widest transition-all font-sans border border-[#DAB110] active:scale-95"
                                    >
                                        <Plus size={14} color="#000000" />
                                        Pre-Load Mission
                                    </button>
                                    
                                    <button 
                                        onClick={toggleRestDay}
                                        className={`flex items-center justify-center gap-2 p-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all font-sans border active:scale-95 ${isRestDaySelected ? 'bg-[#3B82F6] text-black border-[#1D4ED8]' : 'bg-[#3B82F6] text-black border-[#1D4ED8]'}`}
                                    >
                                        <Coffee size={14} color="#000000" />
                                        {isRestDaySelected ? 'Cancel Rest' : 'Schedule Rest'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

    export default CalendarView;
