import React from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Pause } from 'lucide-react';
import { Instrumental } from '../lib/supabase';

interface InstrumentalCardProps {
  instrumental: Instrumental;
  isSelected?: boolean;
  onClick?: () => void;
  onPlay?: () => void;
  isPlaying?: boolean;
}

export const InstrumentalCard: React.FC<InstrumentalCardProps> = ({
  instrumental,
  isSelected = false,
  onClick,
  onPlay,
  isPlaying = false
}) => {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.();
  };

  return (
    <motion.div
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'border-purple-400 bg-purple-400/10'
          : 'border-gray-600 hover:border-gray-400'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <img src={instrumental.cover_url} alt={instrumental.name} className="w-full object-cover h-full" />
          </div>
          
          <div>
            <h3 className="text-white font-semibold">{instrumental.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{instrumental.bpm} BPM</span>
              <span>•</span>
              <span>{instrumental.genre}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handlePlayClick}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
      
      {isSelected && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <span className="text-black text-sm font-bold">✓</span>
        </motion.div>
      )}
    </motion.div>
  );
};