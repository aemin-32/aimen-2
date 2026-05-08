import React from 'react';
import { AscensionState, UserProfile, ViewState, ModalType, Toast, Theme, Stat } from '../../types/types';
import { StoreItem } from '../../types/shopTypes';
import { BadgeDefinition } from '../../types/badgeTypes';
import { playSound } from '../../utils/audio';
import { requestNotificationPermission } from '../../utils/notifications';
import { calculateMidnightUpdates } from '../ascension_internals/midnightStrategy';

export const useDispatch = (state: AscensionState, setState: React.Dispatch<React.SetStateAction<AscensionState>>) => {
    const soundEnabled = state.user.preferences.soundEnabled;

    const updateUser = (updates: Partial<UserProfile>) => setState(prev => ({ ...prev, user: { ...prev.user, ...updates } }));
    const setView = (view: ViewState) => { if (view !== state.ui.currentView) { playSound('click', soundEnabled); window.history.pushState({ view }, '', ''); setState(prev => ({ ...prev, ui: { ...prev.ui, currentView: view } })); }};
    const setHabitsViewMode = (mode: 'list' | 'calendar') => { playSound('click', soundEnabled); setState(prev => ({ ...prev, ui: { ...prev.ui, habitsViewMode: mode } })); };
    const setTasksViewMode = (mode: 'missions' | 'codex') => { playSound('click', soundEnabled); setState(prev => ({ ...prev, ui: { ...prev.ui, tasksViewMode: mode } })); };
    const setModal = (modal: ModalType, data?: any) => { if (modal !== 'none') playSound('click', soundEnabled); setState(prev => ({ ...prev, ui: { ...prev.ui, activeModal: modal, modalData: data ?? null } })); };
    const removeToast = (id: string) => setState(prev => ({ ...prev, ui: { ...prev.ui, toasts: prev.ui.toasts.filter(t => t.id !== id) } }));
    const addToast = (message: string, type: Toast['type'] = 'info') => { 
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; 
        setState(prev => ({ 
          ...prev, 
          ui: { 
            ...prev.ui, 
            toasts: [...prev.ui.toasts, { id, message, type, timestamp: new Date().toISOString() }], 
            systemLogs: [{ id, message, type: type as string, timestamp: new Date().toISOString() }, ...(prev.ui.systemLogs || [])].slice(0, 100) 
          } 
        })); 
        setTimeout(() => removeToast(id), 3000); 
    };
    const startFocusSession = (itemId: string, durationMinutes: number, type: 'task' | 'habit' | 'raid_step' = 'task') => { playSound('click', soundEnabled); setState(prev => ({ ...prev, ui: { ...prev.ui, focusSession: { itemId, startTime: new Date().toISOString(), durationMinutes, isActive: true, itemType: type } } })); };
    const endFocusSession = () => setState(prev => ({ ...prev, ui: { ...prev.ui, focusSession: null } }));
    const toggleSound = () => updateUser({ preferences: { ...state.user.preferences, soundEnabled: !state.user.preferences.soundEnabled } });
    const enableNotifications = async (): Promise<boolean> => {
        const granted = await requestNotificationPermission();
        updateUser({ preferences: { ...state.user.preferences, deviceNotificationsEnabled: granted } });
        addToast(granted ? 'Notifications Enabled' : 'Permission Denied', granted ? 'success' : 'error');
        return granted;
    };
    const togglePreference = (key: keyof UserProfile['preferences']) => {
        if (key === 'deviceNotificationsEnabled' && !state.user.preferences.deviceNotificationsEnabled) { enableNotifications(); return; }
        updateUser({ preferences: { ...state.user.preferences, [key]: !state.user.preferences[key] } });
        playSound('click', soundEnabled);
    };
    const setDayStartHour = (hour: number) => {
        updateUser({ preferences: { ...state.user.preferences, dayStartHour: hour } });
        addToast(`Day Start set to ${hour}:00`, 'info');
    };

    const registerCompletion = (difficulty: string) => {
        const now = new Date();
        const windowStart = new Date(now.getTime() - 90 * 60 * 1000); // 90-minute window
        
        let points = 1; // Default EASY
        if (difficulty === 'normal') points = 2;
        if (difficulty === 'hard') points = 4;

        setState(prev => {
            const recent = [...prev.ui.systemAscending.recentCompletions, { timestamp: now.toISOString(), points }]
                .filter(item => new Date(item.timestamp) > windowStart);
            
            let activationTime = prev.ui.systemAscending.activationTime;

            if (prev.ui.systemAscending.isActive) {
                activationTime = now.toISOString(); // Reset 15m timer
            }

            return {
                ...prev,
                ui: {
                    ...prev.ui,
                    systemAscending: {
                        ...prev.ui.systemAscending,
                        recentCompletions: recent,
                        activationTime
                    }
                }
            };
        });
    };

    const triggerAscension = () => {
        const now = new Date();
        setState(prev => {
            const totalPoints = prev.ui.systemAscending.recentCompletions.reduce((sum, item) => sum + item.points, 0);
            
            if (totalPoints >= 12 && !prev.ui.systemAscending.isActive) {
                playSound('crit', soundEnabled);
                return {
                    ...prev,
                    ui: {
                        ...prev.ui,
                        systemAscending: {
                            ...prev.ui.systemAscending,
                            isActive: true,
                            activationTime: now.toISOString()
                        }
                    }
                };
            }
            return prev;
        });
    };

    const resetSystem = () => { localStorage.clear(); playSound('delete', soundEnabled); window.location.reload(); };
    const completeOnboarding = (name: string, title: string, focusStat: Stat) => updateUser({ name, title, hasOnboarded: true, stats: { ...state.user.stats, [focusStat]: state.user.stats[focusStat] + 2 } });
    const useItem = (item: StoreItem) => {
        let newInventory = [...state.user.inventory];
        const shouldConsume = item.type === 'custom' || item.type === 'redemption' || !item.isInfinite;
        if (shouldConsume) {
            const index = newInventory.indexOf(item.id);
            if (index > -1) newInventory.splice(index, 1);
        }
        if (item.id === 'item_potion_xp') { updateUser({ currentXP: state.user.currentXP + 500, inventory: newInventory }); playSound('level-up', soundEnabled); addToast('Potion Consumed: +500 XP', 'success'); }
        else { updateUser({ inventory: newInventory }); addToast(`${item.title} Used`, 'info'); }
    };
    const toggleEquip = (itemId: string) => {
        let newEquipped = [...state.user.equippedItems];
        if (newEquipped.includes(itemId)) { newEquipped = newEquipped.filter(id => id !== itemId); addToast('Artifact Unequipped', 'info'); }
        else { if (newEquipped.length >= 3) { addToast('Max 3 Artifacts', 'error'); return; } newEquipped.push(itemId); addToast('Artifact Equipped', 'success'); }
        updateUser({ equippedItems: newEquipped }); playSound('click', soundEnabled);
    };
    const addBadge = (badge: BadgeDefinition) => { if (state.badgesRegistry.some(b => b.id === badge.id)) return; setState(prev => ({ ...prev, badgesRegistry: [...prev.badgesRegistry, badge] })); };
    const awardBadge = (badgeId: string) => { if (!state.user.badges.includes(badgeId)) { updateUser({ badges: [...state.user.badges, badgeId] }); addToast('New Badge!', 'level-up'); playSound('level-up', soundEnabled); }};
    const addTheme = (theme: Theme) => { if (state.user.unlockedThemes.some(t => t.id === theme.id)) return; updateUser({ unlockedThemes: [...state.user.unlockedThemes, theme] }); };
    const deleteTheme = (themeId: string) => { if (state.user.preferences.theme === themeId) setTheme(state.user.unlockedThemes[0].id); updateUser({ unlockedThemes: state.user.unlockedThemes.filter(t => t.id !== themeId) }); addToast('Theme Deleted', 'info'); };
    const setTheme = (themeId: string) => { updateUser({ preferences: { ...state.user.preferences, theme: themeId } }); playSound('click', soundEnabled); };
    const importData = (jsonData: string) => { try { const data = JSON.parse(jsonData); if (!data.user) throw new Error(); setState(data); addToast('System Restored', 'success'); playSound('level-up', soundEnabled); } catch { addToast('Import Failed', 'error'); }};
    const exportData = () => JSON.stringify(state, null, 2);
    const triggerDailyReset = () => { 
        const { newUser, toastMessage, toastType, newBadge } = calculateMidnightUpdates(state.user, state.ui.debugDate); 
        let updatedRegistry = state.badgesRegistry;
        if (newBadge) {
            updatedRegistry = [...state.badgesRegistry, newBadge];
            if (!newUser.badges.includes(newBadge.id)) {
                  newUser.badges.push(newBadge.id);
                  newUser.badgeTiers[newBadge.id] = 'gold'; 
                  if (!newUser.badgeHistory[newBadge.id]) newUser.badgeHistory[newBadge.id] = {};
                  newUser.badgeHistory[newBadge.id]['gold'] = new Date().toISOString();
            }
        }
        setState(prev => ({ 
            ...prev, 
            user: newUser, 
            badgesRegistry: updatedRegistry
        }));
        addToast(toastMessage, toastType); 
        playSound('level-up', soundEnabled); 
    };
    const setDebugDate = (date: string | null) => setState(prev => ({ ...prev, ui: { ...prev.ui, debugDate: date } }));
    const setCustomAudio = (file: File) => { const url = URL.createObjectURL(file); setState(prev => ({ ...prev, ui: { ...prev.ui, customAudio: { name: file.name, url } } })); addToast(`Audio Loaded: ${file.name}`, 'success'); };

    const toggleEquipAvatarPart = (itemId: string, slot: string) => {
        const newParts = { ...state.user.equippedAvatarParts };
        if (newParts[slot] === itemId) {
            delete newParts[slot];
            addToast('Avatar Part Unequipped', 'info');
        } else {
            newParts[slot] = itemId;
            addToast('Avatar Part Equipped', 'success');
        }
        updateUser({ equippedAvatarParts: newParts });
        playSound('click', soundEnabled);
    };

    return {
        updateUser,
        setView,
        setHabitsViewMode,
        setTasksViewMode,
        setModal,
        useItem,
        addBadge,
        addTheme,
        deleteTheme,
        awardBadge,
        addToast,
        removeToast,
        resetSystem,
        toggleSound,
        togglePreference,
        setTheme,
        importData,
        exportData,
        triggerDailyReset,
        setDebugDate,
        startFocusSession,
        endFocusSession,
        completeOnboarding,
        toggleEquip,
        toggleEquipAvatarPart,
        enableNotifications,
        setCustomAudio,
        setDayStartHour,
        registerCompletion,
        triggerAscension,
    };
};