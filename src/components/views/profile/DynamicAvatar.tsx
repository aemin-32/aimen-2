
import React from 'react';
import { UserProfile } from '../../../types/types';
import { getAvatarIcon } from '../../../utils/avatar-helpers';

interface DynamicAvatarProps {
    user: UserProfile;
    size?: number;
}

export const DynamicAvatar: React.FC<DynamicAvatarProps> = ({ user, size = 120 }) => {
    return (
        <div className="relative flex items-center justify-center select-none group" style={{ width: size, height: size }}>
            {/* Base Container with subtle glow */}
            <div className="absolute inset-0 bg-life-black border-2 border-zinc-800 rounded-full overflow-hidden flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:border-life-gold/50 group-hover:shadow-life-gold/20">
                {/* Character Icon */}
                <div className="text-white transform transition-transform duration-500 group-hover:scale-110">
                    {getAvatarIcon(user.avatarId, size * 0.6)}
                </div>
            </div>
        </div>
    );
};
