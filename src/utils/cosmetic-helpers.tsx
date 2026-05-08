
import React from 'react';

export const getProfileBorder = (borderId?: string) => {
    switch (borderId) {
        case 'neon_pulse':
            return 'border-2 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-pulse';
        case 'golden_legacy':
            return 'border-2 border-life-gold shadow-[0_0_20px_rgba(251,191,36,0.4)]';
        case 'glitch_void':
            return 'border-2 border-red-600 shadow-[2px_2px_0_rgba(220,38,38,0.5),-2px_-2px_0_rgba(34,211,238,0.5)]';
        case 'obsidian_plate':
            return 'border-4 border-zinc-900 bg-zinc-950';
        default:
            return 'border border-zinc-800';
    }
};

export const getProfileBackground = (backgroundId?: string) => {
    switch (backgroundId) {
        case 'matrix_rain':
            return 'bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")] bg-repeat opacity-20';
        case 'nebula_flow':
            return 'bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black';
        case 'cyber_grid':
            return 'bg-[linear-gradient(rgba(18,18,18,0.8),rgba(18,18,18,0.8)),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]';
        case 'crimson_haze':
            return 'bg-gradient-to-t from-red-900/20 to-transparent';
        default:
            return 'bg-gradient-to-b from-life-gold/5 to-transparent';
    }
};

export const getTitlePrefix = (prefixId?: string) => {
    switch (prefixId) {
        case 'legendary': return 'LEGENDARY ';
        case 'corrupted': return 'CORRUPTED ';
        case 'exalted': return 'EXALTED ';
        case 'ghost': return 'GHOST ';
        default: return '';
    }
};
