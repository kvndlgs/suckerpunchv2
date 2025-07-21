import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Volume2 } from 'lucide-react';
import { Character, Instrumental, supabase } from '../lib/supabase';
import { CharacterCard } from './CharacterCard';
import { InstrumentalCard } from './InstrumentalCard';
import toast from 'react-hot-toast';

interface BattleSetupProps {
  onStartBattle: (character1: Character, character2: Character, instrumental: Instrumental) => void;
}

export const BattleSetup: React.FC<BattleSetupProps> = ({ onStartBattle }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [instrumentals, setInstrumentals] = useState<Instrumental[]>([]);
  const [selectedCharacter1, setSelectedCharacter1] = useState<Character | null>(null);
  const [selectedCharacter2, setSelectedCharacter2] = useState<Character | null>(null);
  const [selectedInstrumental, setSelectedInstrumental] = useState<Instrumental | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingInstrumental, setPlayingInstrumental] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Cleanup audio when component unmounts
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const fetchData = async () => {
    try {
      const [charactersResponse, instrumentalsResponse] = await Promise.all([
        supabase.from('characters').select('*'),
        supabase.from('instrumentals').select('*')
      ]);

      if (charactersResponse.error) throw charactersResponse.error;
      if (instrumentalsResponse.error) throw instrumentalsResponse.error;

      setCharacters(charactersResponse.data);
      setInstrumentals(instrumentalsResponse.data);
    } catch (error) {
      toast.error('Failed to load battle data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterSelect = (character: Character) => {
    if (!selectedCharacter1) {
      setSelectedCharacter1(character);
    } else if (!selectedCharacter2 && character.id !== selectedCharacter1.id) {
      setSelectedCharacter2(character);
    } else if (character.id === selectedCharacter1.id) {
      setSelectedCharacter1(null);
    } else if (character.id === selectedCharacter2?.id) {
      setSelectedCharacter2(null);
    }
  };

  const handleInstrumentalSelect = (instrumental: Instrumental) => {
    setSelectedInstrumental(instrumental);
  };

  const handlePlayInstrumental = (instrumental: Instrumental) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      setCurrentAudio(null);
    }

    if (playingInstrumental === instrumental.id) {
      setPlayingInstrumental(null);
      return;
    }

    // Play the actual instrumental file
    const audio = new Audio(instrumental.audio_url);
    audio.volume = muted ? 0 : volume;
    audio.loop = true;
    
    setPlayingInstrumental(instrumental.id);
    setCurrentAudio(audio);
    
    audio.onended = () => {
      setPlayingInstrumental(null);
      setCurrentAudio(null);
    };

    audio.onerror = () => {
      toast.error('Failed to load instrumental');
      setPlayingInstrumental(null);
      setCurrentAudio(null);
    };

    audio.play().catch((error) => {
      toast.error('Failed to play instrumental');
      console.error('Audio play error:', error);
      setPlayingInstrumental(null);
      setCurrentAudio(null);
    });

    // Auto-stop after 30 seconds for preview
    setTimeout(() => {
      if (playingInstrumental === instrumental.id && currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        setPlayingInstrumental(null);
        setCurrentAudio(null);
      }
    }, 30000);
  };

  const stopAllAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      setCurrentAudio(null);
    } else {
      setPlayingInstrumental(null);
    }
  };

  const canStartBattle = selectedCharacter1 && selectedCharacter2 && selectedInstrumental;

  const handleStartBattle = () => {
    // Stop any playing audio before starting battle
    stopAllAudio();
    
    if (canStartBattle) {
      onStartBattle(selectedCharacter1, selectedCharacter2, selectedInstrumental);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading battle arena...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
            <div className="w-full h-auto sticky flex items-center justify-center">
                    
            <img src='/logo.png' alt='SUCKERPUNCH' className="w-[250px] mx-auto py-8" />
            
      </div>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xl text-gray-300">Choose your contenders and instrumentals to start the battle!</p>
        </motion.div>

        {/* Character Selection */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <Swords className="w-8 h-8 mr-3 text-yellow-400" />
            Select Opponents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={selectedCharacter1?.id === character.id || selectedCharacter2?.id === character.id}
                onClick={() => handleCharacterSelect(character)}
                disabled={selectedCharacter1?.id === character.id || selectedCharacter2?.id === character.id ? false : 
                         (selectedCharacter1 && selectedCharacter2) ? true : false}
              />
            ))}
          </div>
        </motion.div>

        {/* Battle Preview */}
        {selectedCharacter1 && selectedCharacter2 && (
          <motion.div
            className="mb-12 p-6 bg-gray-800 rounded-xl border border-gray-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Battle Preview</h3>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <img
                  src={selectedCharacter1.avatar_url}
                  alt={selectedCharacter1.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2"
                />
                <p className="text-white font-semibold">{selectedCharacter1.name}</p>
              </div>
              <div className="text-4xl text-red-500">VS</div>
              <div className="text-center">
                <img
                  src={selectedCharacter2.avatar_url}
                  alt={selectedCharacter2.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2"
                />
                <p className="text-white font-semibold">{selectedCharacter2.name}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Instrumental Selection */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <Volume2 className="w-8 h-8 mr-3 text-purple-400" />
            Select Instrumental
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instrumentals.map((instrumental) => (
              <InstrumentalCard
                key={instrumental.id}
                instrumental={instrumental}
                isSelected={selectedInstrumental?.id === instrumental.id}
                onClick={() => handleInstrumentalSelect(instrumental)}
                onPlay={() => handlePlayInstrumental(instrumental)}
                isPlaying={playingInstrumental === instrumental.id}
              />
            ))}
          </div>
        </motion.div>

        {/* Start Battle Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button
            onClick={handleStartBattle}
            disabled={!canStartBattle}
            className={`px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
              canStartBattle
                ? 'bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canStartBattle ? 'START BATTLE!' : 'Select Contenders and instrumental to continue'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};