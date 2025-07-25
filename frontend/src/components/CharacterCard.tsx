import React from 'react';
import { motion } from 'framer-motion';
import { Character } from '../lib/supabase';

interface CharacterCardProps {
  character: Character;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}


export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isSelected = false,
  onClick,
  disabled = false
}) => {
  return (
    <motion.div
      className={`relative z-50 p-[20px] bg-slate-900 rounded-[10px] cursor-pointer transition-all duration-300 
        after:content-[''] after:absolute after:w-full after:h-full
        after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2
        after:p-[22px] after:rounded-[11px] after:-z-[50] after:border-2 after:border-transparent after:bg-gradient-to-r 
        after:from-purple-600 after:via-gold-600 via-golden-400 after:to-amber-600 before:filter-[(blured, 1.5)] ${
        isSelected
          ? 'after:boder-2 after:border-amber-600'
          : 'after:border-2 after:border-transparent after:bg-slate-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring"}}
    >
      <div className="flex w-full h-auto items-center justify-start">
        <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden border-2 border-amber-600">
          <img
            src={character.avatar_url}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="ml-8">
          <h3 className="text-xl montserrat-bold text-white">{character.name}</h3>
          <p className="text-gray-300 montserrat-regular text-sm line-clamp-3">
            {/* character description */}
            {character.description}
          </p>
        </div>
        
        {isSelected && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <span className="montserrat-regular text-sm">✓</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};