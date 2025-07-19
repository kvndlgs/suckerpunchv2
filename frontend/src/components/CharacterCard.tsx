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
      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'border-yellow-400 bg-yellow-400/10'
          : 'border-gray-600 hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gray-500">
          <img
            src={character.avatar_url}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{character.name}</h3>
          <p className="text-gray-300 text-sm line-clamp-3">
            {/* character description */}
            {character.description}
          </p>
        </div>
        
        {isSelected && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <span className="text-black text-sm font-bold">✓</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};