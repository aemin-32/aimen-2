
import React from 'react';
import { User, UserRound, Sparkles, Cpu, Crown, Sword } from 'lucide-react';

export const AVATARS = [
    { id: 'default', name: 'Shadow Walker', icon: 'User', condition: 'Starting Avatar' },
    { id: 'avatar_ninja', name: 'Ninja', icon: 'UserRound', condition: 'Shop: 500G' },
    { id: 'avatar_wizard', name: 'Wizard', icon: 'Sparkles', condition: 'Shop: 500G' },
    { id: 'avatar_cyborg', name: 'Cyborg', icon: 'Cpu', condition: 'Shop: 1000G' },
    { id: 'avatar_king', name: 'King', icon: 'Crown', condition: 'Achievement: Reach Level 10' },
    { id: 'avatar_warrior', name: 'Warrior', icon: 'Sword', condition: 'Achievement: Complete 50 Tasks' },
    { id: 'avatar_zeus', name: 'Zeus', icon: 'Zap', condition: 'Shop: 10,000G' },
];

export const getAvatarIcon = (id: string, size: number = 24) => {
    switch (id) {
        case 'avatar_ninja': return <UserRound size={size} />;
        case 'avatar_wizard': return <Sparkles size={size} />;
        case 'avatar_cyborg': return <Cpu size={size} />;
        case 'avatar_king': return <Crown size={size} />;
        case 'avatar_warrior': return <Sword size={size} />;
        case 'avatar_zeus': return <img src="https://images.unsplash.com/photo-1620121692029-d088224efc74?w=400&q=80" className="avatar-zeus" alt="Zeus" />;
        default: return <User size={size} />;
    }
};
