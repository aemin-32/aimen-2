
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { StoreItem, PurchaseLog } from '../types/shopTypes';
import { useAscension } from './AscensionContext';
import { playSound } from '../utils/audio';
import { Theme, Stat } from '../types/types';
import { usePersistence } from '../hooks/usePersistence';

interface ShopState {
    storeItems: StoreItem[];
}

interface ShopContextType {
    shopState: ShopState;
    shopDispatch: {
        buyItem: (itemId: string) => boolean;
        addStoreItem: (item: StoreItem) => void;
        addStoreItems: (items: StoreItem[]) => void;
        deleteStoreItem: (itemId: string) => void;
        restoreData: (storeItems: StoreItem[]) => void;
    };
    getItemLimitInfo: (itemId: string) => { current: number; max: number | null };
}

const STORAGE_KEY_SHOP = 'ASCENSION_SHOP_DATA';

// INITIAL STOCK logic remains the same...
const INITIAL_STOCK: StoreItem[] = [
    {
        id: 'item_shield_easy',
        title: 'Easy Shield',
        description: 'Prevents your EASY streak from resetting if you miss a day.',
        cost: 250,
        type: 'system',
        icon: 'Shield',
        isInfinite: true
    },
    {
        id: 'item_shield_normal',
        title: 'Normal Shield',
        description: 'Prevents your NORMAL streak from resetting if you miss a day.',
        cost: 500,
        type: 'system',
        icon: 'Shield',
        isInfinite: true
    },
    {
        id: 'item_shield_hard',
        title: 'Hard Shield',
        description: 'Prevents your HARD streak from resetting if you miss a day.',
        cost: 1000,
        type: 'system',
        icon: 'Shield',
        isInfinite: true
    },
    {
        id: 'item_battery',
        title: 'System Battery',
        description: 'Recharges all your shields (Easy, Normal, Hard) to their maximum capacity (3).',
        cost: 3000,
        type: 'system',
        icon: 'Zap',
        isInfinite: true
    },
    {
        id: 'avatar_ninja',
        title: 'Ninja Avatar',
        description: 'A stealthy warrior for your profile.',
        cost: 500,
        type: 'avatar',
        icon: 'UserRound',
        isInfinite: false
    },
    {
        id: 'avatar_wizard',
        title: 'Wizard Avatar',
        description: 'A master of the arcane arts.',
        cost: 500,
        type: 'avatar',
        icon: 'Sparkles',
        isInfinite: false
    },
    {
        id: 'avatar_cyborg',
        title: 'Cyborg Avatar',
        description: 'Half human, half machine.',
        cost: 1000,
        type: 'avatar',
        icon: 'Cpu',
        isInfinite: false
    },
    {
        id: 'avatar_zeus',
        title: 'Zeus Avatar',
        description: 'The King of Gods. Radiant and powerful.',
        cost: 10000,
        type: 'avatar',
        icon: 'Zap',
        isInfinite: false
    },
    {
        id: 'artifact_midas_gauntlet',
        title: 'Midas Gauntlet',
        description: 'Passive: +20% Gold from all sources.',
        cost: 2500,
        type: 'artifact',
        icon: 'Hand',
        isInfinite: false,
        effect: { type: 'gold_boost', value: 0.2 }
    },
    {
        id: 'artifact_scholar_scroll',
        title: 'Scholar Scroll',
        description: 'Passive: +15% Intelligence XP.',
        cost: 1500,
        type: 'artifact',
        icon: 'Scroll',
        isInfinite: false,
        effect: { type: 'xp_boost', value: 0.15, stat: Stat.INT }
    },
    {
        id: 'artifact_hercules_belt',
        title: 'Hercules Belt',
        description: 'Passive: +15% Strength XP.',
        cost: 1500,
        type: 'artifact',
        icon: 'Dumbbell',
        isInfinite: false,
        effect: { type: 'xp_boost', value: 0.15, stat: Stat.STR }
    },
    {
        id: 'artifact_zen_incense',
        title: 'Zen Incense',
        description: 'Passive: +20% Spirit XP.',
        cost: 1800,
        type: 'artifact',
        icon: 'Wind',
        isInfinite: false,
        effect: { type: 'xp_boost', value: 0.20, stat: Stat.SPR }
    },
    {
        id: 'artifact_comm_link',
        title: 'Neural Comm-Link',
        description: 'Passive: +20% Relations XP.',
        cost: 1800,
        type: 'artifact',
        icon: 'Radio',
        isInfinite: false,
        effect: { type: 'xp_boost', value: 0.20, stat: Stat.REL }
    },
    {
        id: 'artifact_gilded_vault',
        title: 'Gilded Vault',
        description: 'Passive: +20% Finance XP.',
        cost: 2000,
        type: 'artifact',
        icon: 'Briefcase',
        isInfinite: false,
        effect: { type: 'xp_boost', value: 0.20, stat: Stat.FIN }
    },
    {
        id: 'cosmetic_border_neon',
        title: 'Neon Pulse Border',
        description: 'A glowing cyan border for your profile card.',
        cost: 1200,
        type: 'cosmetic',
        icon: 'Square',
        isInfinite: false
    },
    {
        id: 'cosmetic_bg_nebula',
        title: 'Nebula Flow BG',
        description: 'An animated space background for your profile.',
        cost: 1500,
        type: 'cosmetic',
        icon: 'Image',
        isInfinite: false
    },
    {
        id: 'cosmetic_prefix_legendary',
        title: 'Legendary Prefix',
        description: 'Adds "LEGENDARY" before your name.',
        cost: 2000,
        type: 'cosmetic',
        icon: 'Type',
        isInfinite: false
    },
    {
        id: 'cosmetic_glitch',
        title: 'Glitch Protocol',
        description: 'Adds a digital glitch effect to your profile.',
        cost: 1800,
        type: 'cosmetic',
        icon: 'Zap',
        isInfinite: false
    },
    {
        id: 'cosmetic_prefix_exalted',
        title: 'Exalted Prefix',
        description: 'Adds "EXALTED" before your name.',
        cost: 5000,
        type: 'cosmetic',
        icon: 'Crown',
        isInfinite: false
    }
];

const ShopContext = createContext<ShopContextType | undefined>(undefined);

// Migration Logic
const migrateShopState = (data: any): { storeItems: StoreItem[] } => {
    const rawItems = Array.isArray(data) ? data : (data.storeItems || []);
    // Ensure unique items
    const seenIds = new Set();
    const uniqueItems: StoreItem[] = [];
    for (const item of rawItems) {
        // Remove old generic shield
        if (item.id === 'item_shield') continue;

        if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            if (item.id === 'item_shield_easy') item.cost = 250;
            if (item.id === 'item_shield_normal') item.cost = 500;
            if (item.id === 'item_shield_hard') item.cost = 1000;
            uniqueItems.push(item);
        }
    }

    // Ensure new shields, battery, and ZEUS are present
    const newSystemItems = ['item_shield_easy', 'item_shield_normal', 'item_shield_hard', 'item_battery', 'avatar_zeus'];
    for (const itemId of newSystemItems) {
        if (!seenIds.has(itemId)) {
            const systemItem = INITIAL_STOCK.find(i => i.id === itemId);
            if (systemItem) {
                uniqueItems.push(systemItem);
                seenIds.add(itemId);
            }
        }
    }

    return {
        storeItems: uniqueItems.length > 0 ? uniqueItems : INITIAL_STOCK
    };
};

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { state: lifeState, dispatch: lifeDispatch } = useAscension();
    const { user } = lifeState;
    const soundEnabled = user.preferences.soundEnabled;

    // 🟢 USE PERSISTENCE HOOK
    const [state, setState] = usePersistence<{ storeItems: StoreItem[] }>(
        'ASCENSION_SHOP_DATA',
        { storeItems: INITIAL_STOCK },
        'shop_data',
        migrateShopState
    );
    const { storeItems } = state;

    // 🧹 DEDUPLICATION & CLEANUP: Ensure no duplicate IDs exist
    useEffect(() => {
        setState(prev => {
            const seenIds = new Set();
            const uniqueItems: StoreItem[] = [];
            
            for (const item of prev.storeItems) {
                if (!seenIds.has(item.id)) {
                    seenIds.add(item.id);
                    uniqueItems.push(item);
                }
            }
            
            if (uniqueItems.length !== prev.storeItems.length) {
                console.log("🧹 ShopContext: Removed duplicate items.");
                return { ...prev, storeItems: uniqueItems };
            }
            return prev;
        });
    }, []); // Run once on mount

    // Transaction Engine
    const buyItem = (itemId: string): boolean => {
        const item = storeItems.find(i => i.id === itemId);
        if (!item) return false;

        if (user.gold < item.cost) {
            playSound('error', soundEnabled);
            lifeDispatch.addToast('Insufficient Funds', 'error');
            return false;
        }

        if (itemId === 'item_shield_easy' && user.shields.easy >= 3) {
            lifeDispatch.addToast('🛡️ Max Easy Shield Capacity (3) Reached', 'error');
            playSound('error', soundEnabled);
            return false;
        }
        if (itemId === 'item_shield_normal' && user.shields.normal >= 3) {
            lifeDispatch.addToast('🛡️ Max Normal Shield Capacity (3) Reached', 'error');
            playSound('error', soundEnabled);
            return false;
        }
        if (itemId === 'item_shield_hard' && user.shields.hard >= 3) {
            lifeDispatch.addToast('🛡️ Max Hard Shield Capacity (3) Reached', 'error');
            playSound('error', soundEnabled);
            return false;
        }

        if ((item.type === 'system' || item.type === 'artifact' || item.type === 'avatar') && !item.isInfinite && user.inventory.includes(itemId)) {
            lifeDispatch.addToast('Already Owned', 'error');
            return false;
        }

        const newGold = user.gold - item.cost;
        const updates: any = { gold: newGold };
        
        if (itemId === 'item_shield_easy') {
            updates.shields = { ...user.shields, easy: user.shields.easy + 1 };
            lifeDispatch.addToast(`Easy Shield Acquired! (${updates.shields.easy}/3)`, 'info');
        } else if (itemId === 'item_shield_normal') {
            updates.shields = { ...user.shields, normal: user.shields.normal + 1 };
            lifeDispatch.addToast(`Normal Shield Acquired! (${updates.shields.normal}/3)`, 'info');
        } else if (itemId === 'item_shield_hard') {
            updates.shields = { ...user.shields, hard: user.shields.hard + 1 };
            lifeDispatch.addToast(`Hard Shield Acquired! (${updates.shields.hard}/3)`, 'info');
        }
        else if (item.type === 'avatar') {
            updates.unlockedAvatars = [...user.unlockedAvatars, itemId];
            updates.avatarId = itemId;
            updates.inventory = [...user.inventory, itemId];
            lifeDispatch.addToast(`Avatar Unlocked: ${item.title}`, 'success');
        }
        else if (item.type === 'system' && !item.isInfinite) {
            updates.inventory = [...user.inventory, itemId];
            
            if (itemId === 'item_theme_gold') {
                const goldTheme: Theme = {
                    id: 'gold',
                    name: 'Midas Touch',
                    colors: {
                        '--color-life-black': '#1a1200',
                        '--color-life-paper': '#261a00',
                        '--color-life-gold': '#ffd700',
                        '--color-life-text': '#fffae6'
                    }
                };
                lifeDispatch.addTheme(goldTheme);
                lifeDispatch.setTheme('gold');
                lifeDispatch.addToast('Gold Theme Activated', 'success');
            } else if (itemId === 'item_theme_cyberpunk') {
                const cyberTheme: Theme = {
                    id: 'cyberpunk',
                    name: 'Neon City',
                    colors: {
                        '--color-life-black': '#020617', 
                        '--color-life-paper': '#0f172a', 
                        '--color-life-gold': '#22d3ee',  
                        '--color-life-text': '#e0f2fe'   
                    }
                };
                lifeDispatch.addTheme(cyberTheme);
                lifeDispatch.setTheme('cyberpunk');
                lifeDispatch.addToast('Cyberpunk Protocol Activated', 'level-up');
            } else {
                lifeDispatch.addToast(`Acquired: ${item.title}`, 'success');
            }

        } else if (item.type === 'artifact') {
             updates.inventory = [...user.inventory, itemId];
             lifeDispatch.addToast(`Artifact Acquired: ${item.title}`, 'success');
             setTimeout(() => lifeDispatch.addToast("Equip it in Profile to activate.", 'info'), 1500);

        } else if (item.type === 'cosmetic') {
            const cosmetics = { ...user.profileCosmetics };
            if (item.id.includes('border')) cosmetics.borderId = item.id.replace('cosmetic_border_', '');
            if (item.id.includes('bg')) cosmetics.backgroundId = item.id.replace('cosmetic_bg_', '');
            if (item.id.includes('prefix')) {
                cosmetics.titlePrefixId = item.id.replace('cosmetic_prefix_', '');
            }
            if (item.id === 'cosmetic_glitch') cosmetics.glitchEffect = true;

            updates.profileCosmetics = cosmetics;
            updates.inventory = [...user.inventory, itemId];
            lifeDispatch.addToast(`Cosmetic Activated: ${item.title}`, 'success');
        } else if (item.id === 'item_potion_xp') {
             updates.inventory = [...user.inventory, itemId]; 
             lifeDispatch.addToast('Potion stored in Inventory', 'success');
        } else if (item.id === 'item_battery') {
             updates.shields = { easy: 3, normal: 3, hard: 3 };
             lifeDispatch.addToast('All Shields Fully Recharged!', 'level-up');
        } else {
            updates.inventory = [...user.inventory, itemId];
            lifeDispatch.addToast(`Voucher Acquired: ${item.title}`, 'success');
        }

        const newLog: PurchaseLog = {
            id: `log_${Date.now()}`,
            itemId: item.id,
            title: item.title,
            cost: item.cost,
            timestamp: new Date().toISOString()
        };
        updates.purchaseHistory = [newLog, ...(user.purchaseHistory || [])].slice(0, 50);

        lifeDispatch.updateUser(updates);
        playSound('coin', soundEnabled);
        
        return true; 
    };

    const addStoreItem = (item: StoreItem) => {
        setState(prev => {
            // Check by ID first for updates
            const existingIndex = prev.storeItems.findIndex(i => i.id === item.id);
            if (existingIndex >= 0) {
                const newItems = [...prev.storeItems];
                newItems[existingIndex] = item;
                return { ...prev, storeItems: newItems };
            }
            // Fallback check by title to prevent duplicates if ID is different (optional, but good for UX)
            if (prev.storeItems.some(i => i.title === item.title)) return prev;
            return { ...prev, storeItems: [...prev.storeItems, item] };
        });
        playSound('click', soundEnabled);
    };

    const addStoreItems = (items: StoreItem[]) => {
        setState(prev => {
            let newItems = [...prev.storeItems];
            let addedCount = 0;

            items.forEach(item => {
                const existingIndex = newItems.findIndex(i => i.id === item.id);
                if (existingIndex >= 0) {
                    // Update existing
                    newItems[existingIndex] = item;
                } else {
                    // Add new if title doesn't exist (or maybe allow duplicate titles? Let's restrict for now)
                    if (!newItems.some(i => i.title === item.title)) {
                        newItems.push(item);
                        addedCount++;
                    }
                }
            });
            
            return { ...prev, storeItems: newItems };
        });
        playSound('level-up', soundEnabled);
    };

    const deleteStoreItem = (itemId: string) => {
        if(confirm("Remove this item from the market?")) {
            setState(prev => ({ ...prev, storeItems: prev.storeItems.filter(i => i.id !== itemId) }));
            playSound('delete', soundEnabled);
        }
    };

    const restoreData = (newStoreItems: StoreItem[]) => {
        setState({ storeItems: newStoreItems });
        lifeDispatch.addToast('Market Restored', 'success');
    };

    const getItemLimitInfo = (itemId: string): { current: number; max: number | null } => {
        if (itemId === 'item_shield_easy') return { current: user.shields.easy, max: 3 };
        if (itemId === 'item_shield_normal') return { current: user.shields.normal, max: 3 };
        if (itemId === 'item_shield_hard') return { current: user.shields.hard, max: 3 };
        
        const item = storeItems.find(i => i.id === itemId);
        if (item && !item.isInfinite) {
            const isOwned = user.inventory.includes(itemId) || 
                            user.unlockedAvatars.includes(itemId) || 
                            user.equippedItems.includes(itemId);
            return { current: isOwned ? 1 : 0, max: 1 };
        }
        
        return { current: 0, max: null };
    };

    return (
        <ShopContext.Provider value={{ 
            shopState: { storeItems }, 
            shopDispatch: { buyItem, addStoreItem, addStoreItems, deleteStoreItem, restoreData },
            getItemLimitInfo
        }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};
