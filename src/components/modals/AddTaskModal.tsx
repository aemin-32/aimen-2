
import React, { useState } from 'react';
import { X, CheckSquare, Target, Crosshair, Terminal } from 'lucide-react';
import { useAscension } from '../../contexts/AscensionContext'; // نرجع خطوتين للوصول للسياق
import TaskForm from '../forms/TaskForm';      // نخرج من modals وندخل forms (جيران)
import HabitForm from '../forms/HabitForm';    // نفس الشيء
import RaidForm from '../forms/RaidForm';      // نفس الشيء
import InjectionForm from '../forms/InjectionForm'; // 👈 استيراد نموذج الحقن

type CreateType = 'mission' | 'protocol' | 'operation' | 'injection'; // 👈 إضافة نوع الحقن

const AddTaskModal: React.FC = () => {
  const { state, dispatch } = useAscension();
  const { modalData } = state.ui;

  // 🟢 INITIALIZE STATE BASED ON CONTEXT
  const [createType, setCreateType] = useState<CreateType>(() => {
      if (modalData) {
          if (modalData.editTask) return 'mission';
          if (modalData.editHabit) return 'protocol';
          if (modalData.defaultType) return modalData.defaultType as CreateType;
      }
      return 'mission';
  });

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
        dispatch.setModal('none');
    }, 200);
  };

  const handleModalClose = () => {
      // Direct close call passed to children
      dispatch.setModal('none');
  }

  return (
    <div 
        onClick={handleClose} // 👈 Close when clicking background
        className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-200 ${isClosing ? 'opacity-0 pointer-events-none' : 'animate-in fade-in bg-black/80 backdrop-blur-sm'}`}
    >
      
      <div 
        onClick={(e) => e.stopPropagation()} // 👈 Stop click from reaching background
        className={`
            bg-life-paper w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-life-muted/20 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]
            transition-transform duration-300 pb-[env(safe-area-inset-bottom)]
            ${isClosing ? 'translate-y-full sm:scale-95' : 'animate-in slide-in-from-bottom-full sm:zoom-in-95'}
        `}
      >
        {/* 🟢 MODAL HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-life-muted/20 bg-life-black/50 shrink-0">
            <h3 className="text-lg font-black tracking-tight text-life-text flex items-center gap-2">
                <span className="text-life-gold">///</span> COMMAND LINE
            </h3>
            <button 
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-life-muted hover:text-life-text hover:bg-life-muted/20 transition-all"
            >
                <X size={20} />
            </button>
        </div>

        {/* 🟢 TYPE SWITCHER (Fixed Top) */}
        <div className="px-4 py-3 bg-life-black/40 border-b border-life-muted/10 shrink-0">
            <div className="flex p-1 bg-life-black rounded-xl border border-life-muted/20 overflow-x-auto no-scrollbar gap-1">
                <button
                    onClick={() => setCreateType('mission')}
                    className={`flex-1 min-w-[70px] py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${createType === 'mission' ? 'bg-life-muted/30 text-white shadow-sm' : 'text-life-muted hover:text-life-silver'}`}
                >
                    <CheckSquare size={14} /> Mission
                </button>
                <button
                    onClick={() => setCreateType('protocol')}
                    className={`flex-1 min-w-[70px] py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${createType === 'protocol' ? 'bg-life-muted/30 text-white shadow-sm' : 'text-life-muted hover:text-life-silver'}`}
                >
                    <Target size={14} /> Protocol
                </button>
                <button
                    onClick={() => setCreateType('operation')}
                    className={`flex-1 min-w-[70px] py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${createType === 'operation' ? 'bg-life-muted/30 text-white shadow-sm' : 'text-life-muted hover:text-life-silver'}`}
                >
                    <Crosshair size={14} /> Raid
                </button>
                
                {/* 🟢 زر الحقن الجديد في أقصى اليمين */}
                <button
                    onClick={() => setCreateType('injection')}
                    className={`flex-1 min-w-[70px] py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${createType === 'injection' ? 'bg-life-easy/20 text-life-easy border border-life-easy/30 shadow-sm' : 'text-life-muted hover:text-life-easy'}`}
                >
                    <Terminal size={14} /> Inject
                </button>
            </div>
        </div>

        {/* 🟢 SCROLLABLE FORM BODY */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
            {createType === 'mission' && <TaskForm onClose={handleModalClose} inheritedData={modalData} />}
            {createType === 'protocol' && <HabitForm onClose={handleModalClose} inheritedData={modalData} />}
            {createType === 'operation' && <RaidForm onClose={handleModalClose} />}
            {/* 🟢 عرض نموذج الحقن */}
            {createType === 'injection' && <InjectionForm onClose={handleModalClose} />}
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
