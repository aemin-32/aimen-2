
import React, { useState, useEffect } from 'react';
import { User, Shield, Flame, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- تصحيح المسارات (الرجوع خطوة واحدة ../ والدخول للمجلدات الصحيحة) ---
import { useAscension } from '../contexts/AscensionContext';
import { useSkills } from '../contexts/SkillContext';
import { playSound } from '../utils/audio';
import { EnergyRing } from './ui/EnergyRing';

const Header: React.FC = () => {
  const { state, dispatch } = useAscension();
  const { user } = state;
  const { skillState } = useSkills(); 

  // 🧠 CALCULATE DYNAMIC TITLE
  const skills = skillState?.skills || [];
  
  let displayTitle = user.title; // Default to user's main title

  const linkedSkill = (user.preferences.useSkillAsTitle && user.preferences.linkedSkillId)
    ? skills.find(s => s.id === user.preferences.linkedSkillId)
    : null;

  if (linkedSkill) {
      displayTitle = `${linkedSkill.rank} ${linkedSkill.title}`;
  } else {
      displayTitle = user.title; // Fallback to user title
      // Auto-evolve Ignite rank at Level 5
      if (displayTitle.toLowerCase() === 'initiate' && user.level >= 5) {
          displayTitle = 'Operative';
      }
  }

  const xpPercentage = Math.min(100, (user.currentXP / user.targetXP) * 100);

  // 🔥 DAILY SURVIVAL RING CALCULATIONS
  const dailyProgress = Math.min(100, (user.dailyXP / user.dailyTarget) * 100);
  const isSafe = dailyProgress >= 100;
  const radius = 18;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (dailyProgress / 100) * circumference;

  // 🔒 GOD MODE UNLOCK LOGIC (Kept as legacy easter egg)
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
      if (tapCount > 0) {
          const timer = setTimeout(() => setTapCount(0), 1000);
          return () => clearTimeout(timer);
      }
  }, [tapCount]);

  const handleIdentityClick = () => {
      setTapCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 5) {
              playSound('level-up', true);
              dispatch.setModal('devConsole');
              return 0;
          }
          return newCount;
      });

      // Standard Navigation (Single Tap)
      if (state.ui.currentView !== 'profile') {
          dispatch.setView('profile');
      }
  };

  const isAscending = state.ui.systemAscending.isActive;

  return (
    <header className="h-16 px-4 border-b border-zinc-800 flex items-center justify-between bg-life-black/60 backdrop-blur-xl z-20 shadow-lg transition-all duration-300 select-none sticky top-0">
      
      {/* 🟢 LEFT SECTION: IDENTITY (Clickable) */}
      <motion.div 
        onClick={handleIdentityClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 cursor-pointer group"
      >
        {/* Avatar & Level with Intensity Meter */}
        <div 
          className="relative p-1"
          onClick={(e) => {
            e.stopPropagation();
            dispatch.triggerAscension();
          }}
        >
          <EnergyRing size={48} />

          <div className="w-10 h-10 rounded-full bg-life-muted/20 border border-life-silver flex items-center justify-center relative overflow-hidden ring-1 ring-life-muted/50 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:border-white z-10">
            {linkedSkill && linkedSkill.icon ? (
              <span className="text-xl">{linkedSkill.icon}</span>
            ) : (
              <User size={20} className="text-life-silver group-hover:scale-110 transition-transform duration-500" />
            )}
            
            {/* Level Badge */}
            <motion.div 
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-0 right-0 bg-[#FFD35B] text-life-black text-[9px] font-black px-1.5 py-0.5 rounded-tl-md shadow-[0_0_10px_rgba(255,211,91,0.5)] z-10"
              style={{ textShadow: '0 0 2px rgba(0,0,0,0.2)' }}
            >
              <span style={{ textShadow: '0 0 8px #FFD35B' }}>L{user.level}</span>
            </motion.div>
            
            {/* Visual Feedback for Taps */}
            <AnimatePresence>
              {tapCount > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#FFFF00]/50" 
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Name & XP */}
        <div className="flex flex-col justify-center">
          <h1 className="text-sm font-bold leading-none tracking-wide text-life-text/90 mb-1.5 truncate max-w-[150px] sm:max-w-none group-hover:text-white transition-colors">
            {displayTitle.toUpperCase()} 
          </h1>
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[9px] text-[#FFD35B] font-black ${isAscending ? 'drop-shadow-[0_0_5px_rgba(255,211,91,0.5)]' : ''}`}>
              {user.currentXP}/{user.targetXP} XP
            </span>
            
            {/* Level XP Bar */}
            <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: isAscending ? 0.4 : 1, ease: "easeOut" }}
                className="h-full bg-[#FFD35B] relative"
                style={{ 
                  boxShadow: isAscending ? '0 0 12px #FFD35B, inset 0 0 4px #FFD35B' : 'none',
                }}
              >
                {/* Ignite Effects (Only during Ascension) */}
                {isAscending && (
                  <>
                    {/* 1px White Core */}
                    <div className="absolute inset-x-0 top-[0.5px] h-[0.5px] bg-white/90 rounded-full z-10" />
                    
                    {/* Light Bleed Pulse */}
                    <motion.div 
                      animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="absolute inset-0 bg-white blur-[2px] rounded-full"
                    />
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* 🟢 RIGHT SECTION: SETTINGS, ECONOMY & SURVIVAL */}
      <div className="flex items-center gap-3">
          
          {/* ⚙️ SETTINGS BUTTON */}
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => dispatch.setModal('devConsole')}
            className="p-2 rounded-full text-life-muted hover:text-life-gold hover:bg-life-gold/10 transition-all"
            title="System Settings"
          >
            <Settings size={20} />
          </motion.button>

          {/* 💰 Resources Container */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="hidden sm:flex flex-col items-end gap-0.5 mr-1"
          >
            <div className="flex items-center text-life-gold font-mono text-xs font-black">
                <span className="mr-1.5 text-xs animate-pulse">💰</span> {user.gold}
            </div>
          </motion.div>

          {/* 🛡️ Mobile Resource (Compact) */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="sm:hidden flex items-center gap-2 mr-1"
          >
             <div className="flex flex-col items-center justify-center w-8 h-8 rounded bg-life-gold/10 border border-life-gold/20">
                <span className="text-[8px] animate-pulse">💰</span>
                <span className="text-[9px] font-bold text-life-gold">{user.gold}</span>
             </div>
          </motion.div>

          {/* 🔥 STREAK WIDGET (With Survival Ring) - CLICKABLE */}
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => dispatch.setModal('streak')} // 👈 Opens Modal
            className="relative w-12 h-12 flex items-center justify-center group cursor-pointer"
          >
             
             {/* Progress Ring */}
             <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90 absolute z-0"
             >
                <circle
                    stroke="#333"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    opacity={0.3}
                />
                <circle
                    stroke={isSafe ? '#10b981' : '#fbbf24'} // Green if safe, Gold if pending
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: `stroke-dashoffset ${isAscending ? '0.4s' : '0.8s'} cubic-bezier(0.4, 0, 0.2, 1)` }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className={isSafe ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' : ''}
                />
             </svg>

             {/* Center Flame */}
             <div className={`
                w-8 h-8 rounded-full flex flex-col items-center justify-center z-10 transition-all duration-500
                ${isSafe ? 'bg-life-easy/10 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]' : 'bg-life-black'}
             `}>
                <Flame size={12} className={`
                    absolute -top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity 
                    ${isSafe ? 'text-life-easy fill-life-easy/50' : 'text-life-crimson fill-life-crimson/50'}
                `} />
                <span className="text-[6px] text-life-muted uppercase leading-none mt-0.5 tracking-tighter">Day</span>
                <span className={`text-sm font-black leading-none ${isSafe ? 'text-life-easy' : 'text-life-crimson'}`}>
                    {isSafe ? user.streak + 1 : user.streak}
                </span>
             </div>
          </motion.div>
      </div>
    </header>
  );
};

export default Header;
