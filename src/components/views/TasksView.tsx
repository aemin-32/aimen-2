
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../../contexts/TaskContext';
import { useRaids } from '../../contexts/RaidContext';
import { useCampaign } from '../../contexts/CampaignContext';
import { useAscension } from '../../contexts/AscensionContext';
import { ChevronDown, ChevronUp, Archive, FolderPlus, Trash, Plus, ChevronRight, Pencil, Moon, Target, Scale, CheckCircle2, Calendar } from 'lucide-react';
import TaskCard from '../cards/TaskCard';
import { parseTimeCode } from '../../utils/campaignEngine';

// 🟢 NEW IMPORT
import { ActiveOperations } from './tasks/ActiveOperations';
import { LawsView } from './tasks/LawsView';

const TasksView: React.FC = () => {
  const { state, dispatch } = useAscension(); 
  const { taskState, taskDispatch } = useTasks();
  const { raidState, raidDispatch } = useRaids();
  const { campaignState } = useCampaign(); 
  
  const { tasks, categories } = taskState;
  const { raids } = raidState;
  const { campaign } = campaignState;
  const { showHighlights } = state.user.preferences; 
  const { tasksViewMode } = state.ui; 

  // UI States
  const [showArchivedSteps, setShowArchivedSteps] = useState(false);
  const [showBacklog, setShowBacklog] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false); 
  const [completedFilter, setCompletedFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [showSleepTasks, setShowSleepTasks] = useState(false);
  const [showCampaignTasks, setShowCampaignTasks] = useState(true); 
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());

  // Category UI States
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');

  const raidOperations = raids.filter(r => r.status === 'active').map(raid => {
        const nextStep = raid.steps.find(s => !s.isCompleted && !s.isLocked && !s.isArchived);
        if (!nextStep) return null;
        return { raid, step: nextStep };
    }).filter(Boolean) as { raid: typeof raids[0], step: typeof raids[0]['steps'][0] }[];

  const archivedRaidSteps = raids.flatMap(r => r.steps.filter(s => s.isArchived).map(s => ({ raid: r, step: s })));

  const today = state.ui.debugDate ? new Date(state.ui.debugDate) : new Date();
  today.setHours(0,0,0,0);

  let campaignWeekStart: Date | null = null;
  let campaignWeekEnd: Date | null = null;

  if (campaign.isActive && campaign.startDate) {
      const start = new Date(campaign.startDate);
      start.setHours(0,0,0,0);
      const currentWeekIdx = Math.max(0, campaign.currentWeek - 1);
      campaignWeekStart = new Date(start);
      campaignWeekStart.setDate(start.getDate() + (currentWeekIdx * 7));
      campaignWeekEnd = new Date(campaignWeekStart);
      campaignWeekEnd.setDate(campaignWeekStart.getDate() + 6);
      campaignWeekEnd.setHours(23,59,59,999);
  }

  const activeTasks: typeof tasks = [];
  const sleepingTasks: typeof tasks = [];
  const campaignWeekTasks: typeof tasks = [];
  const completedTasks: typeof tasks = [];
  const backlogTasks: typeof tasks = [];

  tasks.forEach(t => {
      if (t.isArchived) { backlogTasks.push(t); return; }
      if (t.isCompleted) { completedTasks.push(t); return; }

      if (t.isCampaign && campaign.isActive) {
          const { timeCode } = parseTimeCode(t.title);
          if (timeCode && timeCode.week > campaign.currentWeek) return; 
      }

      const taskDate = t.scheduledTime || t.deadline ? new Date(t.scheduledTime || t.deadline!) : null;
      if (taskDate) taskDate.setHours(0,0,0,0);
      const isFuture = taskDate && taskDate.getTime() > today.getTime();
      
      let isInCampaignWeek = false;
      if (t.isCampaign && campaignWeekStart && campaignWeekEnd && taskDate) {
          if (taskDate.getTime() >= campaignWeekStart.getTime() && taskDate.getTime() <= campaignWeekEnd.getTime()) isInCampaignWeek = true;
      }

      if (isInCampaignWeek) campaignWeekTasks.push(t);
      else if (isFuture) { if (!t.isCampaign) sleepingTasks.push(t); } 
      else activeTasks.push(t);
  });

  const filteredCompletedTasks = useMemo(() => {
    const now = state.ui.debugDate ? new Date(state.ui.debugDate) : new Date();
    
    return completedTasks.filter(t => {
        if (!t.completedAt) return false;
        const compDate = new Date(t.completedAt);
        
        if (completedFilter === 'today') {
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            return compDate >= todayStart;
        }
        if (completedFilter === 'week') {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - 7);
            return compDate >= weekStart;
        }
        if (completedFilter === 'month') {
            const monthStart = new Date(now);
            monthStart.setDate(now.getDate() - 30);
            return compDate >= monthStart;
        }
        return true;
    }).sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  }, [completedTasks, completedFilter, state.ui.debugDate]);

  const groupedCompletedTasks = useMemo(() => {
    const groups: { [date: string]: typeof tasks } = {};
    filteredCompletedTasks.forEach(t => {
        const date = new Date(t.completedAt!).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
        if (!groups[date]) groups[date] = [];
        groups[date].push(t);
    });
    return groups;
  }, [filteredCompletedTasks]);

  const handleCreateCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (newCatName.trim()) { taskDispatch.addCategory(newCatName); setNewCatName(''); setIsAddingCat(false); }
  };

  const handleUpdateCategory = (id: string) => {
      if(editCatName.trim()) { taskDispatch.renameCategory(id, editCatName); setEditingCatId(null); }
  };

  const openRaidStepDetails = (stepId: string, raidId: string) => dispatch.setModal('itemDetails', { itemId: stepId, parentId: raidId, type: 'raid_step' });

  const toggleNotes = (id: string) => setExpandedNotes(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const toggleSubtasksView = (id: string) => setExpandedSubtasks(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  const confirmDeleteCategory = (catId: string) => {
      const hasItems = tasks.some(t => t.categoryId === catId);
      if (hasItems) dispatch.setModal('confirmation', { title: 'Delete Section?', message: 'Items will be moved to Uncategorized.', confirmText: 'Delete', isDangerous: true, onConfirm: () => taskDispatch.deleteCategory(catId) });
      else taskDispatch.deleteCategory(catId);
  };

  const confirmDeleteTask = (taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      if (!task.isCompleted && !task.isArchived) dispatch.setModal('confirmation', { title: 'Abort Mission?', message: 'Abandoning incurs a penalty.', confirmText: 'Abort', isDangerous: true, onConfirm: () => taskDispatch.deleteTask(taskId) });
      else dispatch.setModal('confirmation', { title: 'Delete Log?', message: 'Permanently remove entry.', confirmText: 'Delete', isDangerous: true, onConfirm: () => taskDispatch.deleteTask(taskId) });
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 🟢 HEADER */}
      <div className="mb-6">
          <div className="flex items-end justify-between px-1">
            <div>
                <h2 className="text-2xl font-black text-life-text tracking-tight uppercase">
                    {tasksViewMode === 'missions' ? 'ACTIVE OPS' : 'THE CODEX'}
                </h2>
                <p className="text-xs text-life-muted uppercase tracking-widest mt-1">
                    {tasksViewMode === 'missions' 
                        ? `${activeTasks.length} Missions Pending`
                        : "Strict Liability Protocol"
                    }
                </p>
            </div>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${tasksViewMode === 'codex' ? 'border-red-500 text-red-500 bg-red-950/30' : 'border-life-gold text-life-gold bg-life-gold/10'}`}>
                {tasksViewMode === 'missions' ? (
                    <div className="w-5 h-5 rounded-full bg-life-gold/80" style={{ opacity: tasks.length > 0 ? (completedTasks.length / tasks.length) : 0 }} />
                ) : (
                    <Scale size={16} />
                )}
            </div>
          </div>
      </div>

      {tasksViewMode === 'codex' ? (
          <LawsView />
      ) : (
          <>
            {showHighlights && raidOperations.length > 0 && (
                <ActiveOperations 
                    raidOperations={raidOperations}
                    expandedNotes={expandedNotes}
                    expandedSubtasks={expandedSubtasks}
                    toggleNotes={toggleNotes}
                    toggleSubtasksView={toggleSubtasksView}
                    raidDispatch={raidDispatch}
                    openRaidStepDetails={openRaidStepDetails}
                />
            )}

            {campaignWeekTasks.length > 0 && (
                <div className="mb-4 animate-in slide-in-from-bottom-2">
                    <button onClick={() => setShowCampaignTasks(!showCampaignTasks)} className="w-full flex items-center justify-between p-3 rounded-xl border bg-indigo-950/10 border-indigo-500/20 hover:bg-indigo-900/20 transition-all group shadow-none">
                        <div className="flex items-center gap-3"><Target size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" /><div className="text-left"><span className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">Week {campaign.currentWeek} Objectives</span></div></div>
                        <div className="text-indigo-400/50">{showCampaignTasks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                    </button>
                    {showCampaignTasks && <div className="mt-2 pl-2 border-l-2 border-indigo-500/10 space-y-2">{campaignWeekTasks.map(task => <TaskCard key={task.id} task={task} onToggle={taskDispatch.toggleTask} onDelete={confirmDeleteTask} />)}</div>}
                </div>
            )}

            <div className="mb-4 flex justify-end">
                {isAddingCat ? (
                    <form onSubmit={handleCreateCategory} className="flex gap-2 animate-in fade-in">
                        <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Section Title..." autoFocus className="bg-life-black border border-zinc-800 rounded-lg px-3 py-1 text-xs text-life-text focus:border-life-gold outline-none" />
                        <button type="submit" className="text-life-gold hover:bg-life-gold/10 p-1 rounded"><Plus size={16} /></button>
                        <button type="button" onClick={() => setIsAddingCat(false)} className="text-life-muted hover:text-white p-1"><Plus size={16} className="rotate-45" /></button>
                    </form>
                ) : (
                    <button onClick={() => setIsAddingCat(true)} className="text-[10px] uppercase font-bold text-life-muted hover:text-life-gold flex items-center gap-1 transition-colors"><FolderPlus size={14} /> Add Section</button>
                )}
            </div>

            <div className="space-y-4 mb-4">
                {categories.map((cat, idx) => {
                    const catTasks = activeTasks.filter(t => t.categoryId === cat.id);
                    return (
                        <motion.div 
                            key={cat.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative"
                        >
                            <div className="flex items-center justify-between mb-2 group relative">
                                {editingCatId === cat.id ? (
                                    <div className="flex gap-2 w-full animate-in fade-in zoom-in-95">
                                        <input type="text" value={editCatName} onChange={(e) => setEditCatName(e.target.value)} className="bg-life-black border border-zinc-800 rounded px-2 py-0.5 text-xs text-life-text w-full focus:border-life-gold outline-none" autoFocus onBlur={() => handleUpdateCategory(cat.id)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat.id)} />
                                    </div>
                                ) : (
                                    <button onClick={() => taskDispatch.toggleCategory(cat.id)} className="flex items-center gap-2 text-life-muted hover:text-life-text transition-colors flex-1 text-left py-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-life-gold/80 group-hover:scale-110 transition-transform">{cat.isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}</span>
                                        <span className="text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">{cat.title}</span>
                                        <span className="text-[9px] bg-life-muted/10 px-1.5 rounded-full text-life-muted">{catTasks.length}</span>
                                    </button>
                                )}
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingCatId(cat.id); setEditCatName(cat.title); }} className="p-2 text-life-muted hover:text-white hover:bg-life-muted/10 rounded cursor-pointer transition-colors"><Pencil size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); confirmDeleteCategory(cat.id); }} className="p-2 text-life-muted hover:text-life-hard hover:bg-life-hard/10 rounded cursor-pointer transition-colors"><Trash size={14} /></button>
                                </div>
                            </div>
                            <AnimatePresence>
                                {!cat.isCollapsed && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-1 pl-1 pb-2">
                                            {catTasks.map(task => <TaskCard key={task.id} task={task} onToggle={taskDispatch.toggleTask} onDelete={confirmDeleteTask} />)}
                                            {catTasks.length === 0 && <div className="text-[10px] text-life-muted/40 italic pl-2">No active missions in section.</div>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}

                {activeTasks.filter(t => !t.categoryId).length > 0 && (
                    <div className="animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-2 text-life-muted/50 px-1"><span className="text-[10px] font-bold uppercase tracking-widest">General / Uncategorized</span></div>
                        <div className="space-y-1">{activeTasks.filter(t => !t.categoryId).map(task => <TaskCard key={task.id} task={task} onToggle={taskDispatch.toggleTask} onDelete={confirmDeleteTask} />)}</div>
                    </div>
                )}

                {activeTasks.length === 0 && raidOperations.length === 0 && campaignWeekTasks.length === 0 && <div className="py-8 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-life-paper/50"><p className="text-life-muted text-sm font-medium">All active missions cleared.</p></div>}
            </div>

            {sleepingTasks.length > 0 && (
                <div className="mb-6 animate-in slide-in-from-bottom-2">
                    <button onClick={() => setShowSleepTasks(!showSleepTasks)} className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-900 bg-[#050505] hover:bg-zinc-900/40 transition-all group shadow-none">
                        <div className="flex items-center gap-3"><Calendar size={16} className="text-life-muted group-hover:text-life-text transition-colors" /><div className="text-left"><span className="text-xs font-bold text-life-muted group-hover:text-life-text uppercase tracking-widest transition-colors">Upcoming ({sleepingTasks.length})</span></div></div>
                        <div className="text-life-muted/50">{showSleepTasks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                    </button>
                    {showSleepTasks && <div className="mt-2 pl-2 border-l border-zinc-800 space-y-2 opacity-80">{sleepingTasks.map(task => <div key={task.id} className="scale-95 origin-top-left"><TaskCard task={task} onToggle={taskDispatch.toggleTask} onDelete={confirmDeleteTask} /></div>)}</div>}
                </div>
            )}

            {backlogTasks.length > 0 && (
                <div className="mb-6">
                    <button onClick={() => setShowBacklog(!showBacklog)} className="w-full flex items-center justify-between p-2 rounded-lg border border-zinc-800 bg-life-black hover:bg-life-muted/5 transition-all group">
                        <div className="flex items-center gap-2 text-life-muted group-hover:text-life-gold"><Archive size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Mission Backlog ({backlogTasks.length})</span></div>
                        {showBacklog ? <ChevronUp size={14} className="text-life-muted" /> : <ChevronDown size={14} className="text-life-muted" />}
                    </button>
                    {showBacklog && (
                        <div className="space-y-2 mt-2 pl-2 border-l border-zinc-800">
                            {backlogTasks.map(task => <div key={task.id} className="opacity-70 grayscale hover:grayscale-0 transition-all"><TaskCard task={task} onToggle={() => taskDispatch.restoreTask(task.id)} onDelete={confirmDeleteTask} /></div>)}
                            <div className="text-center py-1 text-[9px] text-life-muted">Click Checkbox to Restore • Trash to Delete Permanently</div>
                        </div>
                    )}
                </div>
            )}

            {/* 🟢 COMPLETED LOG (UPDATED WITH FILTERS & GROUPING) */}
            {completedTasks.length > 0 && (
                <div className="mb-6">
                    <button 
                        onClick={() => setShowCompleted(!showCompleted)} 
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-zinc-800 bg-life-black hover:bg-life-muted/5 transition-all group"
                    >
                        <div className="flex items-center gap-2 text-life-muted group-hover:text-life-easy">
                            <CheckCircle2 size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Completed Log ({filteredCompletedTasks.length})</span>
                        </div>
                        {showCompleted ? <ChevronUp size={14} className="text-life-muted" /> : <ChevronDown size={14} className="text-life-muted" />}
                    </button>
                    
                    {showCompleted && (
                        <div className="mt-3 animate-in slide-in-from-top-1">
                            {/* Filter Tabs */}
                            <div className="flex gap-1 mb-4 px-1">
                                {(['today', 'week', 'month', 'all'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setCompletedFilter(f)}
                                        className={`flex-1 py-1 text-[9px] font-black uppercase tracking-widest rounded transition-all border ${
                                            completedFilter === f
                                                ? 'bg-life-gold/10 border-life-gold text-life-gold shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                                                : 'bg-black border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-6 pl-2 border-l border-zinc-800/50">
                                {Object.entries(groupedCompletedTasks).map(([date, dateTasks]) => (
                                    <div key={date}>
                                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 px-1">
                                            {date}
                                        </div>
                                        <div className="space-y-1">
                                            {dateTasks.map(task => (
                                                <div key={task.id} className="opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                                                    <TaskCard task={task} onToggle={taskDispatch.toggleTask} onDelete={confirmDeleteTask} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {filteredCompletedTasks.length === 0 && (
                                    <div className="text-center py-4 text-[10px] text-zinc-600 uppercase tracking-widest">
                                        No missions completed in this period
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
          </>
      )}
    </div>
  );
};

export default TasksView;
