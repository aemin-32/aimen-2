
import React from 'react';
import { 
  Shield, FlaskConical, Coffee, Palette, Activity, Gift, ShoppingBag, 
  Scroll, Gamepad2, Monitor, Utensils, Square, Image, Type, Zap, Crown,
  Book, Music, Camera, Laptop, Trophy, Heart, Star
} from 'lucide-react';

export const ItemIcon = ({ icon, size = 16 }: { icon: string; size?: number }) => {
  switch (icon) {
    case 'Shield': return <Shield size={size} />;
    case 'Flask': return <FlaskConical size={size} />;
    case 'Coffee': return <Coffee size={size} />;
    case 'Palette': return <Palette size={size} />;
    case 'Burger': return <Utensils size={size} />;
    case 'Gift': return <Gift size={size} />;
    case 'Zap': return <Zap size={size} />;
    case 'Scroll': return <Scroll size={size} />;
    case 'Game': return <Gamepad2 size={size} />;
    case 'TV': return <Monitor size={size} />;
    case 'Book': return <Book size={size} />;
    case 'Music': return <Music size={size} />;
    case 'Camera': return <Camera size={size} />;
    case 'Laptop': return <Laptop size={size} />;
    case 'Trophy': return <Trophy size={size} />;
    case 'Heart': return <Heart size={size} />;
    case 'Star': return <Star size={size} />;
    case 'Square': return <Square size={size} />;
    case 'Image': return <Image size={size} />;
    case 'Type': return <Type size={size} />;
    case 'Crown': return <Crown size={size} />;
    default: return <ShoppingBag size={size} />;
  }
};
