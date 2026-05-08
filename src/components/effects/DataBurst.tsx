
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

export const DataBurstManager: React.FC = () => {
    const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);

    const triggerBurst = useCallback((e: any) => {
        const { x, y } = e.detail || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        setBursts(prev => [...prev, { id: Date.now(), x, y }]);
    }, []);

    useEffect(() => {
        window.addEventListener('trigger-data-burst' as any, triggerBurst);
        return () => window.removeEventListener('trigger-data-burst' as any, triggerBurst);
    }, [triggerBurst]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[10000]">
            <AnimatePresence>
                {bursts.map(burst => (
                    <DataBurst 
                        key={burst.id} 
                        x={burst.x} 
                        y={burst.y} 
                        onComplete={() => setBursts(prev => prev.filter(b => b.id !== burst.id))} 
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

const DataBurst: React.FC<{ x: number; y: number; onComplete: () => void }> = ({ x, y, onComplete }) => {
    const [particles] = useState(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            // Narrow horizontal spread, small square pixels
            tx: (Math.random() - 0.5) * 200,
            ty: (Math.random() - 0.5) * 40,
            size: Math.random() > 0.5 ? 4 : 6,
            delay: Math.random() * 0.1
        }));
    });

    useEffect(() => {
        const timer = setTimeout(onComplete, 600);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="absolute" style={{ left: x, top: y }}>
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ 
                        x: p.tx, 
                        y: p.ty, 
                        opacity: 0,
                        scale: [1, 1.2, 0.5]
                    }}
                    transition={{ 
                        duration: 0.5, 
                        delay: p.delay,
                        ease: "easeOut"
                    }}
                    className="absolute bg-[#00FFFF] shadow-[0_0_10px_#00FFFF]"
                    style={{ 
                        width: p.size, 
                        height: p.size,
                    }}
                />
            ))}
        </div>
    );
};

export const dispatchDataBurst = (x?: number, y?: number) => {
    window.dispatchEvent(new CustomEvent('trigger-data-burst', { detail: { x: x || window.innerWidth / 2, y: y || window.innerHeight / 2 } }));
};
