
import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { StoreItem } from '../../../types/shopTypes';
import { ItemIcon } from './ItemIcon';

interface InventoryGridProps {
    items: StoreItem[];
    onSelectItem: (item: StoreItem) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({ items, onSelectItem }) => {
    // Group items by ID
    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.id]) {
            acc[item.id] = { ...item, count: 0 };
        }
        acc[item.id].count += 1;
        return acc;
    }, {} as Record<string, StoreItem & { count: number }>);

    const displayItems: (StoreItem & { count: number })[] = Object.values(groupedItems);

    return (
        <div className="mb-8 relative">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black text-life-muted uppercase tracking-[0.2em] flex items-center gap-2">
                    <Package size={12} className="text-life-gold" /> 
                    Inventory // {items.length} Units
                </h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800 to-transparent ml-4" />
            </div>

            {displayItems.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                    {displayItems.map((item) => (
                        <motion.button 
                            key={item.id}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelectItem(item)}
                            className="aspect-square bg-life-black rounded-lg border border-zinc-800 flex flex-col items-center justify-center gap-1 hover:border-life-gold/40 hover:bg-life-gold/5 transition-all relative group overflow-hidden"
                        >
                            {/* Scanner Line Effect */}
                            <motion.div 
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 w-full h-[1px] bg-life-gold/10 z-0 pointer-events-none"
                            />

                            {item.count > 1 && (
                                <span className="absolute top-1 right-1 z-10 bg-life-gold text-life-black text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-life-black">
                                    x{item.count}
                                </span>
                            )}
                            
                            <div className="text-life-gold group-hover:scale-110 transition-transform duration-300 relative z-10">
                                <ItemIcon icon={item.icon} size={24} />
                            </div>

                            {/* Item Type Indicator */}
                            <div className={`absolute bottom-0 left-0 w-full h-0.5 ${
                                item.type === 'artifact' ? 'bg-life-crimson' : 
                                item.type === 'system' ? 'bg-life-diamond' : 'bg-life-gold'
                            } opacity-30`} />
                        </motion.button>
                    ))}
                    
                    {/* Empty Slots to fill the grid (aesthetic) */}
                    {[...Array(Math.max(0, 4 - (displayItems.length % 4)))].map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-black/20 rounded-lg border border-zinc-900/50 border-dashed" />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-life-black/20">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-zinc-900/50 flex items-center justify-center text-zinc-700">
                        <Package size={20} />
                    </div>
                    <p className="text-[10px] text-life-muted uppercase tracking-widest opacity-40">Vault_Empty // No_Assets_Detected</p>
                </div>
            )}
        </div>
    );
};
