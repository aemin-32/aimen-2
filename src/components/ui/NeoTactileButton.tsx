
import React from 'react';
import { motion } from 'framer-motion';

interface NeoTactileButtonProps {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export const NeoTactileButton: React.FC<NeoTactileButtonProps> = ({ 
    children, 
    onClick, 
    className = "", 
    variant = 'primary',
    disabled = false,
    type = 'button'
}) => {
    const variants = {
        primary: 'bg-life-gold text-life-black hover:bg-yellow-400 border-life-gold shadow-[0_4px_0_rgba(180,130,0,1)] active:shadow-none active:translate-y-[4px]',
        secondary: 'bg-life-black text-life-gold border-zinc-800 hover:border-life-gold/50 shadow-[0_4px_0_rgba(20,20,20,1)] active:shadow-none active:translate-y-[4px]',
        danger: 'bg-life-hard text-white hover:bg-red-600 border-life-hard shadow-[0_4px_0_rgba(150,0,0,1)] active:shadow-none active:translate-y-[4px]',
        success: 'bg-life-easy text-life-black hover:bg-emerald-400 border-life-easy shadow-[0_4px_0_rgba(0,100,0,1)] active:shadow-none active:translate-y-[4px]',
    };

    return (
        <motion.button
            type={type}
            disabled={disabled}
            onClick={onClick}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className={`
                px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] 
                transition-all duration-75 border-b-[4px]
                flex items-center justify-center gap-2
                ${variants[variant]}
                ${disabled ? 'opacity-50 grayscale cursor-not-allowed shadow-none translate-y-0 border-b-0' : 'cursor-pointer'}
                ${className}
            `}
        >
            {children}
        </motion.button>
    );
};
