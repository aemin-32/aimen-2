
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HoldButtonProps {
    onComplete: () => void;
    children: React.ReactNode;
    className?: string;
    holdDuration?: number; // in ms
    color?: string;
}

export const HoldButton: React.FC<HoldButtonProps> = ({ 
    onComplete, 
    children, 
    className = "", 
    holdDuration = 1500,
    color = "rgba(220, 38, 38, 0.5)" // Default to a red-ish color (life-hard)
}) => {
    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    const startHold = () => {
        setIsHolding(true);
        setProgress(0);
        startTimeRef.current = Date.now();
        
        const updateProgress = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min(1, elapsed / holdDuration);
            setProgress(newProgress);
            
            if (newProgress < 1) {
                timerRef.current = setTimeout(updateProgress, 16); // ~60fps
            } else {
                onComplete();
                cancelHold();
            }
        };
        
        timerRef.current = setTimeout(updateProgress, 16);
    };

    const cancelHold = () => {
        setIsHolding(false);
        setProgress(0);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <button
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            className={`relative overflow-hidden ${className}`}
        >
            <div className="relative z-10">{children}</div>
            {isHolding && (
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    className="absolute inset-0 z-0 opacity-30"
                    style={{ backgroundColor: color }}
                />
            )}
            <div className="absolute inset-0 bg-white/5 z-0" />
        </button>
    );
};
