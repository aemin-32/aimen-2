import React from 'react';
import { X } from 'lucide-react';
import { useAscension } from '../../../contexts/AscensionContext';
import { StreakDashboard } from './StreakDashboard';

const StreakModal: React.FC = () => {
    const { state, dispatch } = useAscension();
    const { user } = state;

    const progressPercent = Math.min(100, (user.dailyXP / user.dailyTarget) * 100);
    const isSafe = progressPercent >= 100;

    const handleClose = () => {
        dispatch.setModal('none');
    };

    return (
        <div 
            onClick={handleClose}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="bg-life-black border border-life-gold/20 w-full max-w-md rounded-[2rem] relative overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 flex flex-col max-h-[95vh]"
            >
                
                {/* Background Glow */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 blur-[90px] rounded-full pointer-events-none transition-colors duration-1000 ${isSafe ? 'bg-life-easy/5' : 'bg-life-gold/5'}`} />

                {/* Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-5 right-5 text-life-muted hover:text-white transition-colors z-20 bg-black/40 rounded-full p-1.5 backdrop-blur-sm"
                >
                    <X size={20} />
                </button>

                <div className="p-6 flex flex-col items-center relative z-10 overflow-y-auto no-scrollbar flex-1">
                    <StreakDashboard />
                </div>
            </div>
        </div>
    );
};

export default StreakModal;
