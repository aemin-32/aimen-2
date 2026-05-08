import React from 'react';
import { Flame } from 'lucide-react';

interface HeroSectionProps {
    radius: number;
    stroke: number;
    normalizedRadius: number;
    circumference: number;
    strokeDashoffset: number;
    themeColor: string;
    glowStyle: React.CSSProperties;
    isSafe: boolean;
    displayStreak: number;
    dailyXP: number;
    dailyTarget: number;
    phaseColor: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    radius,
    stroke,
    normalizedRadius,
    circumference,
    strokeDashoffset,
    themeColor,
    glowStyle,
    isSafe,
    displayStreak,
    dailyXP,
    dailyTarget,
    phaseColor
}) => {
    return (
        <div className="relative flex items-center justify-center mb-6" style={{ width: radius * 2.2, height: radius * 2.2 }}>
            <svg
                height={radius * 2.2}
                width={radius * 2.2}
                className="overflow-visible transform rotate-90"
            >
                <circle
                    stroke="#1a1a1a"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius * 1.1}
                    cy={radius * 1.1}
                />
                <circle
                    stroke={themeColor}
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, ...glowStyle }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius * 1.1}
                    cy={radius * 1.1}
                />
            </svg>

            {/* Center Stats */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <div className={`text-6xl font-black drop-shadow-md flex items-center gap-1 leading-[0.8] tracking-tighter ${isSafe ? 'text-life-easy' : 'text-life-gold'}`}>
                    {displayStreak} 
                </div>
                
                <div className="flex items-center gap-1.5 text-life-muted mt-2 mb-2">
                    <Flame size={14} className={isSafe ? 'fill-life-easy text-life-easy' : 'fill-life-gold text-life-gold'} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Days Active</span>
                </div>

                {/* Phase Badge (Using Habit Engine Phase) */}
                <div className={`inline-flex items-center px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${phaseColor} bg-black/50 backdrop-blur-sm`}>
                    <span className="text-[#FFFF00] mr-1">{dailyXP}</span> / {dailyTarget} XP
                </div>
            </div>
        </div>
    );
};
