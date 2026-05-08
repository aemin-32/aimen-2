
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Coins, Shield, Plus, X, History, Box, Gift, Zap, Info } from 'lucide-react';
import { useAscension } from '../../contexts/AscensionContext';
import { useShop } from '../../contexts/ShopContext';
import StoreItemCard from '../cards/StoreItemCard'; 
import { StoreItem } from '../../types/shopTypes';
import { ItemIcon } from './profile/ItemIcon';
import { AnimatePresence, motion } from 'framer-motion';
import { NeoTactileButton } from '../ui/NeoTactileButton';

// ✨ PARTICLE EFFECT COMPONENT
const Particle: React.FC<{ x: number, y: number }> = ({ x, y }) => {
    const style = {
        left: x,
        top: y,
        '--tx': `${(Math.random() - 0.5) * 200}px`,
        '--ty': `${(Math.random() - 1) * 200}px`,
        '--rot': `${Math.random() * 360}deg`,
        backgroundColor: ['#fbbf24', '#fcd34d', '#ffffff', '#10b981'][Math.floor(Math.random() * 4)]
    } as React.CSSProperties;

    return <div className="absolute w-2 h-2 rounded-full animate-explode pointer-events-none z-50" style={style} />;
};

const ShopView: React.FC = () => {
  const { state } = useAscension();
  const { shopState, shopDispatch, getItemLimitInfo } = useShop(); // 👈 UPDATED
  const { storeItems } = shopState;
  const { user } = state;

  const [isAdding, setIsAdding] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCost, setNewItemCost] = useState(100);
  const [newItemIcon, setNewItemIcon] = useState('Gift');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  
  const ICONS = [
    'Gift', 'Coffee', 'Burger', 'Game', 'TV', 'Palette', 
    'Book', 'Music', 'Camera', 'Laptop', 'Trophy', 'Heart', 'Star',
    'Scroll', 'Zap', 'Shield', 'Flask', 'Crown'
  ];

  // 💥 Visual Effects State
  const [particles, setParticles] = useState<{id: number, x: number, y: number}[]>([]);

  // 🧬 Filter Logic
  const filterOwned = (item: StoreItem) => {
      if (item.isInfinite) return true;
      const info = getItemLimitInfo(item.id);
      return info.max === null || info.current < info.max;
  };

  const systemItems = storeItems.filter(i => i.type === 'system' && filterOwned(i));
  const artifactItems = storeItems.filter(i => i.type === 'artifact' && filterOwned(i));
  const avatarItems = storeItems.filter(i => i.type === 'avatar' && filterOwned(i));
  const redemptionItems = storeItems.filter(i => i.type === 'redemption' && filterOwned(i));
  const customItems = storeItems.filter(i => i.type === 'custom' && filterOwned(i));

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    
    shopDispatch.addStoreItem({
      id: `custom_${Date.now()}`,
      title: newItemTitle,
      cost: newItemCost,
      type: 'custom',
      description: 'A custom reward defined by you.',
      icon: newItemIcon,
      isInfinite: true
    });
    
    setNewItemTitle('');
    setNewItemIcon('Gift');
    setIsAdding(false);
  };

  const handleBuy = (id: string, e: { clientX: number, clientY: number }) => {
      const limitInfo = getItemLimitInfo(id);
      if (limitInfo.max !== null && limitInfo.current >= limitInfo.max) return;

      const success = shopDispatch.buyItem(id);
      
      if (success) {
          // Trigger Particles at click location
          const newParticles = Array.from({ length: 12 }).map((_, i) => ({
              id: Date.now() + i,
              x: e.clientX,
              y: e.clientY
          }));
          setParticles(prev => [...prev, ...newParticles]);
      }
  };

  // ... (rest of the component)
  // I need to find the map calls and update them

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* 💥 PARTICLES LAYER */}
      {particles.map((p, index) => (
          <div key={`${p.id}-${index}`} className="fixed w-2 h-2 rounded-full animate-[particle_0.8s_ease-out_forwards] pointer-events-none z-[100]" 
               style={{ 
                   left: p.x, 
                   top: p.y,
                   backgroundColor: ['#fbbf24', '#ffffff', '#10b981'][Math.floor(Math.random() * 3)],
                   boxShadow: '0 0 10px currentColor',
                   '--tx': `${(Math.random() - 0.5) * 200}px` as any,
                   '--ty': `${(Math.random() - 1) * 200}px` as any,
               } as React.CSSProperties} 
          />
      ))}

      {/* 🟢 HEADER & WALLET */}
      <div className="flex items-end justify-between mb-6 px-1">
        <div>
          <h2 className="text-2xl font-black text-life-text tracking-tight flex items-center gap-2">
            THE BAZAAR
          </h2>
          <p className="text-xs text-life-muted uppercase tracking-widest mt-1">
            Exchange Gold for Power & Pleasure
          </p>
        </div>
        <div className="flex items-center gap-2 text-life-gold bg-life-gold/5 px-3 py-1.5 rounded-lg border border-life-gold/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
            <Coins size={16} className="text-life-gold" />
            <span className="font-mono font-bold text-lg">{user.gold}</span>
        </div>
      </div>

      {/* 📦 SECTION 1: SYSTEM ARTIFACTS */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-life-muted px-1">
              <Box size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">System Upgrades</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {systemItems.map((item, idx) => (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + idx * 0.05 }}>
                    <StoreItemCard 
                        item={item}
                        canAfford={user.gold >= item.cost}
                        limitInfo={getItemLimitInfo(item.id)}
                        onBuy={(id) => {
                            const dummyEvent = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
                            handleBuy(id, dummyEvent);
                        }}
                        onInfo={(item) => setSelectedItem(item)}
                    />
                </motion.div>
            ))}
          </div>
      </motion.div>

      {/* ⚔️ SECTION 2: RARE ARTIFACTS */}
      {artifactItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <div className="flex items-center gap-2 mb-4 text-life-muted px-1">
                <Shield size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Rare Artifacts</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {artifactItems.map((item, idx) => (
                    <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + idx * 0.05 }}>
                        <StoreItemCard 
                            item={item}
                            canAfford={user.gold >= item.cost}
                            limitInfo={getItemLimitInfo(item.id)}
                            onBuy={(id) => {
                                const dummyEvent = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
                                handleBuy(id, dummyEvent);
                            }}
                            onInfo={(item) => setSelectedItem(item)}
                        />
                    </motion.div>
                ))}
            </div>
        </motion.div>
      )}

      {/* 👤 SECTION 2.5: AVATARS */}
      {avatarItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
            <div className="flex items-center gap-2 mb-4 text-life-muted px-1">
                <ShoppingBag size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Profile Avatars</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {avatarItems.map((item, idx) => (
                    <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + idx * 0.05 }}>
                        <StoreItemCard 
                            item={item}
                            canAfford={user.gold >= item.cost}
                            limitInfo={getItemLimitInfo(item.id)}
                            onBuy={(id) => {
                                const dummyEvent = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
                                handleBuy(id, dummyEvent);
                            }}
                            onInfo={(item) => setSelectedItem(item)}
                        />
                    </motion.div>
                ))}
            </div>
        </motion.div>
      )}

      {/* 🎁 SECTION 3: REAL WORLD REWARDS (Redemption + Custom) */}
      <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2 text-life-muted">
                  <Gift size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Real World Rewards</span>
              </div>
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="text-[10px] flex items-center gap-1 text-life-gold hover:text-white uppercase font-bold"
              >
                  <Plus size={12} /> Add Custom
              </button>
          </div>

          {/* Add Form */}
          {isAdding && (
              <form onSubmit={handleAddItem} className="mb-4 bg-life-black border border-zinc-800 p-3 rounded-lg animate-in fade-in">
                  <div className="flex gap-2 mb-3">
                      <input 
                        type="text" 
                        placeholder="Reward Name..." 
                        value={newItemTitle}
                        onChange={e => setNewItemTitle(e.target.value)}
                        className="flex-1 bg-transparent border-b border-zinc-800 text-xs text-white focus:outline-none focus:border-life-gold px-2"
                        autoFocus
                      />
                      <input 
                        type="number" 
                        placeholder="Cost" 
                        value={newItemCost}
                        min={0}
                        onChange={e => setNewItemCost(Number(e.target.value))}
                        className="w-16 bg-transparent border-b border-zinc-800 text-xs text-white focus:outline-none focus:border-life-gold text-center"
                      />
                  </div>
                  
                  <div className="flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap flex-1 max-w-[200px]">
                          {ICONS.map((icon, index) => (
                              <button 
                                key={`${icon}-${index}`}
                                type="button"
                                onClick={() => setNewItemIcon(icon)}
                                className={`p-1.5 rounded transition-all ${newItemIcon === icon ? 'bg-life-gold/20 text-life-gold border border-life-gold/30' : 'bg-life-muted/5 text-life-muted border border-transparent hover:border-zinc-700'}`}
                              >
                                  <ItemIcon icon={icon} size={14} />
                              </button>
                          ))}
                      </div>
                      <button type="submit" className="bg-life-gold text-life-black px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400">
                          Create
                      </button>
                  </div>
              </form>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Redemption Items (Injected) */}
            {redemptionItems.map((item, idx) => (
                <motion.div key={`redemption-${item.id}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + idx * 0.05 }} className="relative group">
                    <StoreItemCard 
                        item={item}
                        canAfford={user.gold >= item.cost}
                        limitInfo={getItemLimitInfo(item.id)}
                        onBuy={(id) => {
                             const dummyEvent = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
                             handleBuy(id, dummyEvent);
                        }}
                        onInfo={(item) => setSelectedItem(item)}
                    />
                    <button 
                        onClick={() => shopDispatch.deleteStoreItem(item.id)}
                        className="absolute -top-2 -right-2 bg-life-black border border-life-hard/30 text-life-hard p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={12} />
                    </button>
                </motion.div>
            ))}
            
            {/* Custom Items (User Added) */}
            {customItems.map((item, idx) => (
                <motion.div key={`custom-${item.id}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + (redemptionItems.length + idx) * 0.05 }} className="relative group">
                    <StoreItemCard 
                        item={item}
                        canAfford={user.gold >= item.cost}
                        limitInfo={getItemLimitInfo(item.id)}
                        onBuy={(id) => {
                             const dummyEvent = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
                             handleBuy(id, dummyEvent);
                        }}
                        onInfo={(item) => setSelectedItem(item)}
                    />
                    <button 
                        onClick={() => shopDispatch.deleteStoreItem(item.id)}
                        className="absolute -top-2 -right-2 bg-life-black border border-life-hard/30 text-life-hard p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={12} />
                    </button>
                </motion.div>
            ))}
            
            {customItems.length === 0 && redemptionItems.length === 0 && (
                <div className="col-span-2 py-8 text-center border-2 border-dashed border-zinc-800 rounded-xl">
                    <p className="text-[10px] text-life-muted">No custom rewards defined.</p>
                </div>
            )}
          </div>
      </div>
      
      {/* 📜 SECTION 3: TRANSACTION LOG (Modified to show + and -) */}
      <div className="mt-8 pt-8 border-t border-zinc-800">
         <div className="flex items-center gap-2 mb-4 text-life-muted px-1 opacity-60">
              <History size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Transaction Log (Last 100)</span>
         </div>
         
         <div className="space-y-1 opacity-70">
             {user.purchaseHistory.map((log, index) => {
                 const isXP = log.title.includes('[XP]');
                 const isAdd = log.cost < 0; // Negative cost = Gained
                 const absCost = Math.abs(log.cost);
                 const sign = isAdd ? '+' : '-';
                 
                 let colorClass = 'text-life-gold';
                 if (isXP) colorClass = 'text-life-easy'; // XP is Green/Easy
                 else if (isAdd) colorClass = 'text-green-400'; // Gold gain is Green
                 else colorClass = 'text-red-400'; // Gold spend is Red/Gold default
 
                 const currencyLabel = isXP ? 'XP' : 'G';
 
                 return (
                     <div key={log.id || `log-${index}`} className="flex justify-between items-center p-2 rounded bg-life-black border border-life-muted/10 text-[10px]">
                         <span className="text-life-text font-medium truncate flex-1 pr-2">{log.title.replace('[XP] ', '')}</span>
                         <div className="flex items-center gap-2">
                             <span className={`${colorClass} font-mono font-bold`}>{sign}{absCost} {currencyLabel}</span>
                             <span className="text-life-muted opacity-50 text-[9px]">{new Date(log.timestamp).toLocaleDateString()}</span>
                         </div>
                     </div>
                 );
             })}
             {user.purchaseHistory.length === 0 && (
                 <p className="text-[10px] text-life-muted italic text-center">No transaction data.</p>
             )}
         </div>
      </div>

      {/* 🟢 ITEM DETAILS MODAL */}
      <AnimatePresence>
        {selectedItem && (() => {
            const limitInfo = getItemLimitInfo(selectedItem.id);
            const isMaxed = limitInfo.max !== null && limitInfo.current >= limitInfo.max;
            const canAfford = user.gold >= selectedItem.cost;

            return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)} 
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  onClick={(e) => e.stopPropagation()} 
                  className="bg-life-paper w-full max-w-xs rounded-xl border border-zinc-800 p-5 shadow-2xl relative"
                >
                    <button onClick={() => setSelectedItem(null)} className="absolute top-3 right-3 text-life-muted hover:text-life-text transition-colors"><X size={20} /></button>
                    <div className="flex flex-col items-center text-center mb-6">
                        <motion.div 
                          initial={{ rotate: -10, scale: 0.8 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: 'spring', damping: 12 }}
                          className="w-20 h-20 rounded-full bg-life-black border border-zinc-800 flex items-center justify-center mb-3 text-life-gold shadow-inner"
                        >
                            <ItemIcon icon={selectedItem.icon} size={40} />
                        </motion.div>
                        <h3 className="font-black uppercase tracking-widest text-life-text">{selectedItem.title}</h3>
                        <div className="mt-2 flex items-center gap-2 justify-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-life-muted/10 text-life-muted border border-zinc-800">{selectedItem.type}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-life-gold/10 text-life-gold border border-life-gold/20">{selectedItem.cost} G</span>
                        </div>
                        
                        {limitInfo.max !== null && (
                            <div className={`mt-2 text-[10px] font-black uppercase tracking-widest ${isMaxed ? 'text-life-hard' : 'text-life-gold'}`}>
                                Current Stock: {limitInfo.current} / {limitInfo.max}
                            </div>
                        )}

                        <p className="text-xs text-life-muted mt-4 leading-relaxed">{selectedItem.description}</p>
                        
                        {selectedItem.effect && (
                            <div className="mt-4 w-full bg-life-black/50 p-3 rounded border border-zinc-800 text-left">
                                <h4 className="text-[9px] font-bold uppercase text-life-muted mb-1 flex items-center gap-1"><Zap size={10} /> Effect</h4>
                                <p className="text-[10px] text-life-text font-mono">
                                    {selectedItem.effect.type === 'xp_boost' && `+${selectedItem.effect.value * 100}% XP Gain`}
                                    {selectedItem.effect.type === 'gold_boost' && `+${selectedItem.effect.value * 100}% Gold Gain`}
                                    {selectedItem.effect.stat && ` (${selectedItem.effect.stat})`}
                                </p>
                            </div>
                        )}
                    </div>
                    <NeoTactileButton 
                      variant={canAfford && !isMaxed ? 'primary' : 'secondary'}
                      disabled={!canAfford || isMaxed}
                      onClick={() => {
                          if (canAfford && !isMaxed) {
                              const dummyEvent = { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
                              handleBuy(selectedItem.id, dummyEvent);
                              setSelectedItem(null);
                          }
                      }}
                      className="w-full py-3"
                    >
                        {isMaxed ? 'Max Capacity Reached' : canAfford ? 'Purchase Item' : 'Insufficient Funds'}
                    </NeoTactileButton>
                </motion.div>
            </motion.div>
            );
        })()}
      </AnimatePresence>

      <style>{`
        @keyframes particle {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ShopView;
