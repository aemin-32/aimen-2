
import React from 'react';
import { motion } from 'framer-motion';
import { StoreItem } from '../../types/shopTypes';
import { ItemIcon } from '../views/profile/ItemIcon';

interface StoreItemCardProps {
  item: StoreItem;
  canAfford: boolean;
  onBuy: (id: string) => void;
  onInfo: (item: StoreItem) => void;
  limitInfo: { current: number; max: number | null }; // 👈 NEW PROP
}

const StoreItemCard: React.FC<StoreItemCardProps> = ({ item, canAfford, onBuy, onInfo, limitInfo }) => {
  const isMaxed = limitInfo.max !== null && limitInfo.current >= limitInfo.max;

  return (
    <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={!isMaxed ? { y: -5, scale: 1.02 } : {}}
        whileTap={!isMaxed ? { scale: 0.98 } : {}}
        onClick={() => onInfo(item)}
        className={`
        relative flex flex-col p-4 rounded-xl border bg-life-paper transition-all duration-300 group cursor-pointer
        ${isMaxed 
            ? 'border-zinc-800 opacity-50 grayscale cursor-not-allowed' 
            : canAfford 
                ? 'border-zinc-800 hover:border-life-gold/50 shadow-lg hover:shadow-life-gold/5' 
                : 'border-zinc-800 opacity-60'}
    `}>
      
      {/* 🟢 HEADER */}
      <div className="flex justify-between items-start mb-3">
        <div className={`p-3 rounded-lg border bg-life-black transition-colors ${isMaxed ? 'border-zinc-800 text-life-muted' : canAfford ? 'border-life-gold/20 text-life-gold' : 'border-zinc-800 text-life-muted'}`}>
            <ItemIcon icon={item.icon} size={24} />
        </div>
        
        {/* Cost Tag */}
        <div className="flex flex-col items-end gap-1">
            <div className={`px-2 py-1 rounded text-xs font-mono font-bold border ${isMaxed ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : canAfford ? 'bg-life-gold/10 text-life-gold border-life-gold/20' : 'bg-life-muted/10 text-life-muted border-zinc-800'}`}>
                {item.cost} G
            </div>
            {limitInfo.max !== null && (
                <div className={`text-[9px] font-black uppercase tracking-tighter ${isMaxed ? 'text-life-hard' : 'text-life-muted'}`}>
                    Stock: {limitInfo.current}/{limitInfo.max}
                </div>
            )}
        </div>
      </div>

      {/* 🟢 CONTENT */}
      <h3 className="font-bold text-life-text mb-1 truncate">{item.title}</h3>
      <p className="text-xs text-life-muted leading-relaxed mb-4 flex-1 line-clamp-2">
        {item.description}
      </p>

      {/* 🟢 ACTION BUTTON */}
      <button
        onClick={(e) => {
            e.stopPropagation();
            if (canAfford && !isMaxed) onBuy(item.id);
        }}
        disabled={!canAfford || isMaxed}
        className={`
            w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95
            ${isMaxed
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : canAfford 
                    ? 'bg-life-gold text-life-black hover:bg-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.2)]' 
                    : 'bg-life-muted/10 text-life-muted cursor-not-allowed'}
        `}
      >
        {isMaxed ? 'Maxed Out' : canAfford ? 'Buy' : 'Locked'}
      </button>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none">
         <div className={`absolute top-0 right-0 w-4 h-4 -mr-2 -mt-2 rotate-45 transform ${isMaxed ? 'bg-zinc-700' : canAfford ? 'bg-life-gold' : 'bg-life-muted'}`} />
      </div>
    </motion.div>
  );
};

export default StoreItemCard;
