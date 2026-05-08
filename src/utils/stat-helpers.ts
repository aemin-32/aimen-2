import { Stat } from '../types/types';
import { Brain, Heart, Shield, Zap, Dumbbell, Palette, Crown, Coins, Users, Flame } from 'lucide-react';

export const getStatIcon = (stat: Stat) => {
    switch (stat) {
        case Stat.STR: return Dumbbell;
        case Stat.INT: return Brain;
        case Stat.DIS: return Zap;
        case Stat.HEA: return Heart;
        case Stat.CRT: return Palette;
        case Stat.SPR: return Flame;
        case Stat.REL: return Users;
        case Stat.FIN: return Coins;
        default: return Crown;
    }
};

export const getStatColor = (stat: Stat) => {
    switch (stat) {
        case Stat.STR: return '#FF3131'; // High-Voltage Red
        case Stat.INT: return '#BF00FF'; // Deep Purple
        case Stat.DIS: return '#00BFFF'; // Electric Blue
        case Stat.HEA: return '#39FF14'; // Emerald Green
        case Stat.CRT: return '#FF00FF'; // Neon Pink
        case Stat.SPR: return '#FFAC1C'; // Neon Orange
        case Stat.REL: return '#FFFF00'; // Neon Yellow
        case Stat.FIN: return '#00FFEF'; // Neon Cyan
        default: return '#ffffff';
    }
};
