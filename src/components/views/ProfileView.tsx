
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Award, X, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useAscension } from '../../contexts/AscensionContext';
import { useShop } from '../../contexts/ShopContext';
import { useSkills } from '../../contexts/SkillContext';
import { useBadges } from '../../contexts/BadgeContext';
import { useTasks } from '../../contexts/TaskContext'; 
import { useHabits } from '../../contexts/HabitContext'; 
import { useRaids } from '../../contexts/RaidContext'; 
import { useCampaign } from '../../contexts/CampaignContext'; 
import { StoreItem } from '../../types/shopTypes';
import { playSound } from '../../utils/audio';

// 🟢 NEW COMPONENTS
import { IdentityCard } from './profile/IdentityCard';
import { InventoryGrid } from './profile/InventoryGrid';
import { SettingsSection } from './profile/SettingsSection';
import { ItemIcon } from './profile/ItemIcon';
import { AttributeAnalysis } from './profile/AttributeAnalysis';
import { StatMilestoneTrigger } from './profile/StatMilestoneTrigger';
import { NeoTactileButton } from '../ui/NeoTactileButton';

const ProfileView: React.FC = () => {
  const { state, dispatch } = useAscension();
  const { shopState } = useShop(); 
  const { skillState } = useSkills(); 
  const { taskState } = useTasks(); 
  const { habitState } = useHabits(); 
  const { raidState } = useRaids(); 
  const { campaignState } = useCampaign(); 
  const { getAllBadges } = useBadges(); 

  const { user } = state;
  const { storeItems } = shopState; 

  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // 🧠 CALCULATE DYNAMIC TITLE
  const skills = skillState?.skills || [];
  const highestSkill = skills.length > 0 
    ? skills.reduce((prev, current) => (prev.level > current.level) ? prev : current, skills[0])
    : null;

  const dynamicTitle = highestSkill 
    ? `${highestSkill.rank} ${highestSkill.title}` 
    : user.title;

  const inventoryItems = user.inventory
    .map(id => storeItems.find(item => item.id === id))
    .filter(Boolean) as StoreItem[];

  const badgesCount = user.badges?.length || 0;
  const allBadges = getAllBadges();
  const featuredBadgesData = (user.featuredBadges || [])
    .map(id => allBadges.find(b => b.badge.id === id))
    .filter(Boolean);

  const handleUseItem = () => {
      if (selectedItem) {
          dispatch.useItem(selectedItem); 
          setSelectedItem(null);
      }
  };

  const handleExport = () => {
      const fullBackup = {
          user: state.user,
          badgesRegistry: state.badgesRegistry,
          ui: { ...state.ui, activeModal: 'none', modalData: null },
          tasks: taskState.tasks,
          taskCategories: taskState.categories,
          laws: taskState.laws,
          habits: habitState.habits,
          habitCategories: habitState.categories,
          raids: raidState.raids,
          skills: skillState.skills,
          storeItems: shopState.storeItems,
          campaign: campaignState.campaign,
          meta: {
              timestamp: new Date().toISOString(),
              version: "2.0",
              type: "full_backup"
          }
      };

      const dataStr = JSON.stringify(fullBackup, null, 2);
      dispatch.setModal('dataExchange', { 
          mode: 'export', 
          title: 'System Backup', 
          data: dataStr 
      });
  };

  const handleImport = () => {
      dispatch.setModal('dataExchange', { 
          mode: 'import', 
          title: 'System Uplink'
      });
  };

  const handleForceSleep = () => {
      dispatch.triggerDailyReset();
      dispatch.addToast('System Cycle Reset Initiated', 'success');
  };

  return (
    <div className="pb-24 animate-in fade-in zoom-in-95 duration-500 relative">
      <StatMilestoneTrigger user={user} />
      
      {/* 🟢 IDENTITY */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <IdentityCard 
            user={user}
            dynamicTitle={dynamicTitle}
            featuredBadgesData={featuredBadgesData as any}
        />
      </motion.div>

      {/* 🟢 HALL OF FAME SHORTCUT */}
      <motion.button 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => dispatch.setView('hall_of_fame')}
        className="w-full mb-6 bg-life-black border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-life-gold/50 hover:bg-life-gold/5 transition-all group shadow-lg"
      >
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-life-crimson/10 flex items-center justify-center text-life-crimson border border-life-crimson/20 group-hover:scale-110 transition-transform">
                  <Award size={20} />
              </div>
              <div className="text-left">
                  <h3 className="text-xs font-black text-life-text uppercase tracking-widest group-hover:text-life-gold transition-colors">Hall of Glory</h3>
                  <p className="text-[9px] text-life-muted uppercase tracking-[0.2em]">{badgesCount} Medals Secured</p>
              </div>
          </div>
          <ChevronRight size={20} className="text-life-muted group-hover:text-life-gold" />
      </motion.button>

      {/* 🟢 ATTRIBUTE ANALYSIS (NEW) */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <AttributeAnalysis user={user} />
      </motion.div>

      {/* 🟢 INVENTORY TOGGLE */}
      <motion.button 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsInventoryOpen(!isInventoryOpen)}
        className="w-full mb-4 bg-life-black border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-life-gold/50 hover:bg-life-gold/5 transition-all group shadow-lg"
      >
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-life-gold/10 flex items-center justify-center text-life-gold border border-life-gold/20 group-hover:scale-110 transition-transform">
                  <Package size={20} />
              </div>
              <div className="text-left">
                  <h3 className="text-xs font-black text-life-text uppercase tracking-widest group-hover:text-life-gold transition-colors">Inventory</h3>
                  <p className="text-[9px] text-life-muted uppercase tracking-[0.2em]">{inventoryItems.length} Items in Vault</p>
              </div>
          </div>
          {isInventoryOpen ? <ChevronUp size={20} className="text-life-gold" /> : <ChevronDown size={20} className="text-life-muted group-hover:text-life-gold" />}
      </motion.button>

      {/* 🟢 INVENTORY GRID */}
      <AnimatePresence>
        {isInventoryOpen && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
            >
                <div className="pb-4">
                    <InventoryGrid 
                        items={inventoryItems} 
                        onSelectItem={setSelectedItem} 
                    />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 🟢 SETTINGS (CLEAN VERSION) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <SettingsSection 
            user={user}
            dispatch={dispatch}
            onForceSleep={handleForceSleep}
            onExport={handleExport}
            onImport={handleImport}
        />
      </motion.div>

       {/* 🟢 ITEM MODAL */}
       <AnimatePresence>
         {selectedItem && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)} 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
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
                        <p className="text-[10px] text-life-muted mt-2 leading-relaxed uppercase">{selectedItem.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        {selectedItem.type === 'artifact' ? (
                            <NeoTactileButton 
                              variant={user.equippedItems.includes(selectedItem.id) ? 'secondary' : 'primary'}
                              onClick={() => {
                                  dispatch.toggleEquip(selectedItem.id);
                                  setSelectedItem(null);
                              }}
                              className="w-full py-4 text-xs"
                            >
                                {user.equippedItems.includes(selectedItem.id) ? 'Unequip Artifact' : 'Equip Artifact'}
                            </NeoTactileButton>
                        ) : selectedItem.type === 'avatar' && selectedItem.slot ? (
                          <NeoTactileButton 
                            variant={user.equippedAvatarParts?.[selectedItem.slot] === selectedItem.id ? 'secondary' : 'primary'}
                            onClick={() => {
                                dispatch.toggleEquipAvatarPart(selectedItem.id, selectedItem.slot!);
                                setSelectedItem(null);
                            }}
                            className="w-full py-4 text-xs"
                          >
                              {user.equippedAvatarParts?.[selectedItem.slot] === selectedItem.id ? `Unequip ${selectedItem.slot}` : `Equip to ${selectedItem.slot}`}
                          </NeoTactileButton>
                        ) : (
                            <NeoTactileButton 
                              variant="primary"
                              onClick={handleUseItem}
                              className="w-full py-4 text-xs"
                            >
                                Consume Item
                            </NeoTactileButton>
                        )}
                    </div>
                </motion.div>
            </motion.div>
         )}
       </AnimatePresence>

    </div>
  );
};

export default ProfileView;
