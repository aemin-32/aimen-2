
import React, { useEffect, useState } from 'react';
import { useAscension } from './contexts/AscensionContext';
import Navigation from './components/Navigation';
import Header from './components/Header';
import FocusMode from './components/focus/FocusMode';
import OnboardingSequence from './components/OnboardingSequence';
import NotificationManager from './components/NotificationManager';

import TasksView from './components/views/TasksView';
import HabitsView from './components/views/HabitsView';
import RaidsView from './components/views/RaidsView';
import ShopView from './components/views/ShopView';
import ProfileView from './components/views/ProfileView';
import CampaignView from './components/views/CampaignView';
import SkillsView from './components/views/SkillsView';

import SkillDetails from './components/modals/SkillDetails';
import HabitDetails from './components/modals/HabitDetails';
import MissionBriefingModal from './components/modals/MissionBriefingModal';
import AddTaskModal from './components/modals/AddTaskModal';
import LevelUpModal from './components/modals/LevelUpModal';
import StreakModal from './components/modals/StreakModal';
import DeveloperConsole from './components/modals/DeveloperConsole';
import ItemDetailsModal from './components/modals/ItemDetailsModal';
import ResetConfirmModal from './components/modals/ResetConfirmModal';
import ConfirmationModal from './components/modals/ConfirmationModal';
import LootModal from './components/modals/LootModal';
import QuickSubtaskModal from './components/modals/QuickSubtaskModal';
import DataExchangeModal from './components/modals/DataExchangeModal';
import QuestForgeModal from './components/modals/QuestForgeModal';
import HabitProtocolModal from './components/modals/HabitProtocolModal';
import EconomyProtocolModal from './components/modals/EconomyProtocolModal';
import RaidProtocolModal from './components/modals/RaidProtocolModal';
import SkillProtocolModal from './components/modals/SkillProtocolModal';
import ShopProtocolModal from './components/modals/ShopProtocolModal';
import CodexArbiterModal from './components/modals/CodexArbiterModal';
import BadgeProtocolModal from './components/modals/BadgeProtocolModal';
import GuidesMenuModal from './components/modals/GuidesMenuModal';
import CharacterSheetModal from './components/modals/CharacterSheetModal';

import HallOfFame from './components/badges/HallOfFame';
import BadgeUnlockModal from './components/badges/BadgeUnlockModal';
import ToastContainer from './components/ToastContainer'; 
import { SystemAscendingEffects } from './components/effects/SystemAscendingEffects';
import { DataBurstManager } from './components/effects/DataBurst';
import { MotionConfig } from 'framer-motion';

const MainContent: React.FC = () => {
  const { state, dispatch } = useAscension();
  const { ui, user } = state;
  const [shake, setShake] = useState(false);
  const isAscending = state.ui.systemAscending.isActive;

  useEffect(() => {
    document.body.setAttribute('data-ascending', isAscending ? 'true' : 'false');
  }, [isAscending]);

  useEffect(() => {
      const handleShake = () => {
          setShake(true);
          setTimeout(() => setShake(false), 500);
      };
      window.addEventListener('trigger-shake', handleShake);
      return () => window.removeEventListener('trigger-shake', handleShake);
  }, []);

  if (!user.hasOnboarded) {
      return <OnboardingSequence />;
  }

  const renderContent = () => {
    switch (ui.currentView) {
      case 'profile': return <ProfileView />;
      case 'shop': return <ShopView />;
      case 'tasks': return <TasksView />;
      case 'habits': return <HabitsView />;
      case 'raids': return <RaidsView />;
      case 'campaign': return <CampaignView />;
      case 'skills': return <SkillsView />; 
      case 'hall_of_fame': return <HallOfFame />;
      default: return null;
    }
  };

  return (
    <MotionConfig transition={{ duration: isAscending ? 0.15 : 0.3, ease: isAscending ? "linear" : "easeInOut" }}>
    <div className={`flex flex-col h-[100dvh] bg-life-black text-life-text overflow-hidden select-none font-sans ${shake ? 'animate-shake' : ''} pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`}>
        <SystemAscendingEffects />
        <DataBurstManager />
        <NotificationManager />
        <ToastContainer />
        <Header />
        <main className="flex-1 overflow-y-auto relative p-4 scroll-smooth">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
            
            <div className="max-w-md mx-auto h-full">
                {renderContent()}
            </div>
        </main>

        {ui.activeModal === 'addTask' && <AddTaskModal />}
        {ui.activeModal === 'levelUp' && <LevelUpModal />} 
        {ui.activeModal === 'badgeUnlock' && <BadgeUnlockModal />}
        {ui.activeModal === 'streak' && <StreakModal />} 
        {ui.activeModal === 'devConsole' && <DeveloperConsole />} 
        {ui.activeModal === 'itemDetails' && <ItemDetailsModal />}
        {ui.activeModal === 'resetConfirm' && <ResetConfirmModal />} 
        {ui.activeModal === 'confirmation' && <ConfirmationModal />} 
        {ui.activeModal === 'loot' && <LootModal />} 
        {ui.activeModal === 'quickSubtask' && <QuickSubtaskModal />} 
        {ui.activeModal === 'dataExchange' && <DataExchangeModal />} 
        {ui.activeModal === 'questForge' && <QuestForgeModal />}
        {ui.activeModal === 'habitProtocol' && <HabitProtocolModal />}
        {ui.activeModal === 'economyProtocol' && <EconomyProtocolModal />}
        {ui.activeModal === 'raidProtocol' && <RaidProtocolModal />}
        {ui.activeModal === 'skillProtocol' && <SkillProtocolModal />}
        {ui.activeModal === 'shopProtocol' && <ShopProtocolModal />}
        {ui.activeModal === 'codexArbiter' && <CodexArbiterModal />}
        {ui.activeModal === 'badgeProtocol' && <BadgeProtocolModal />}
        {ui.activeModal === 'guidesMenu' && <GuidesMenuModal />}
        {ui.activeModal === 'characterSheet' && <CharacterSheetModal />}
        {ui.activeModal === 'missionBriefing' && <MissionBriefingModal />}
        
        <FocusMode /> 
        <SkillDetails />
        <HabitDetails /> 
        <Navigation />
    </div>
    </MotionConfig>
  );
};

const App: React.FC = () => {
  return <MainContent />;
};

export default App;
