import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Crown } from 'lucide-react';
import { Character, Instrumental, supabase } from '../lib/supabase';
import { generateRapVerse } from '../lib/groq';
import { generateSpeech } from '../lib/elevenlabs';
import { BPMOrchestrator } from '../lib/bpm-orchestrator';
import toast from 'react-hot-toast';

interface BattleArenaProps {
  character1: Character;
  character2: Character;
  instrumental: Instrumental;
  onBack: () => void;
}

interface BattleState {
  verses: Array<{
    characterId: string;
    text: string;
    audioUrl?: string;
    order: number;
  }>;
  currentVerse: number;
  isPlaying: boolean;
  isGenerating: boolean;
  battleId?: string;
  winner?: Character;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  character1,
  character2,
  instrumental,
  onBack
}) => {
  const [battleState, setBattleState] = useState<BattleState>({
    verses: [],
    currentVerse: -1,
    isPlaying: false,
    isGenerating: false,
  });
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const instrumentalAudioRef = useRef<HTMLAudioElement | null>(null);
  const verseAudioRef = useRef<HTMLAudioElement | null>(null);
  const orchestratorRef = useRef<BPMOrchestrator | null>(null);

  useEffect(() => {
    // Update instrumental volume when volume or mute changes
    if (instrumentalAudioRef.current) {
      instrumentalAudioRef.current.volume = muted ? 0 : volume * 0.4;
    }
    if (verseAudioRef.current) {
      verseAudioRef.current.volume = muted ? 0 : volume * 0.8;
    }
  }, [muted, volume]);

  useEffect(() => {
    orchestratorRef.current = new BPMOrchestrator(instrumental.bpm);
    generateBattle();
    
    // Cleanup audio on unmount
    return () => {
      if (instrumentalAudioRef.current) {
        instrumentalAudioRef.current.pause();
        instrumentalAudioRef.current.src = '';
      }
      if (verseAudioRef.current) {
        verseAudioRef.current.pause();
        verseAudioRef.current.src = '';
      }
    };
  }, []);

  const generateBattle = async () => {
    setBattleState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      // Create battle record
      const { data: battleData, error: battleError } = await supabase
        .from('battles')
        .insert({
          character1_id: character1.id,
          character2_id: character2.id,
          instrumental_id: instrumental.id,
        })
        .select()
        .single();

      if (battleError) throw battleError;

      const battleId = battleData.id;
      const verses: BattleState['verses'] = [];

      // Generate verses alternating between characters
      for (let i = 0; i < 6; i++) {
        const isCharacter1Turn = i % 2 === 0;
        const currentCharacter = isCharacter1Turn ? character1 : character2;
        const opponent = isCharacter1Turn ? character2 : character1;
        const verseNumber = Math.floor(i / 2) + 1;

        // Generate verse text
        const verseText = await generateRapVerse(
          currentCharacter.personality_prompt,
          opponent.name,
          verseNumber,
          instrumental.bpm
        );

        // Generate audio
        const audioUrl = await generateSpeech(
          verseText,
          currentCharacter.voice_id,
          instrumental.bpm
        );

        // Save verse to database
        await supabase.from('battle_verses').insert({
          battle_id: battleId,
          character_id: currentCharacter.id,
          verse_text: verseText,
          verse_order: i + 1,
          audio_url: audioUrl,
        });

        verses.push({
          characterId: currentCharacter.id,
          text: verseText,
          audioUrl,
          order: i + 1,
        });
      }

      // Determine winner (simple random for now, could be improved with scoring)
      const winner = Math.random() > 0.5 ? character1 : character2;
      
      await supabase
        .from('battles')
        .update({ winner_id: winner.id })
        .eq('id', battleId);

      setBattleState(prev => ({
        ...prev,
        verses,
        battleId,
        winner,
        isGenerating: false,
      }));

      toast.success('Battle generated! Ready to play!');
    } catch (error) {
      toast.error('Failed to generate battle');
      console.error('Error generating battle:', error);
      setBattleState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const playBattle = async () => {
    if (!orchestratorRef.current || battleState.verses.length === 0) return;

    // Start instrumental background music
    startInstrumentalLoop();

    setBattleState(prev => ({ ...prev, isPlaying: true, currentVerse: 0 }));

    for (let i = 0; i < battleState.verses.length; i++) {
      const verse = battleState.verses[i];
      setBattleState(prev => ({ ...prev, currentVerse: i }));

      if (verse.audioUrl) {
        // Play verse audio
        if (verseAudioRef.current) {
          verseAudioRef.current.pause();
          verseAudioRef.current.src = '';
        }
        
        verseAudioRef.current = new Audio(verse.audioUrl);
        verseAudioRef.current.volume = muted ? 0 : volume * 0.8; // Slightly lower for verses
        
        await new Promise<void>((resolve) => {
          if (verseAudioRef.current) {
            verseAudioRef.current.onended = () => resolve();
            verseAudioRef.current.play().catch(() => resolve()); // Handle play errors
          } else {
            resolve();
          }
        });

        // Add pause between verses
        if (i < battleState.verses.length - 1) {
          const pauseDuration = orchestratorRef.current.calculatePauseDuration();
          await new Promise(resolve => setTimeout(resolve, pauseDuration));
        }
      }
    }

    // Stop instrumental
    stopInstrumental();

    setBattleState(prev => ({ ...prev, isPlaying: false, currentVerse: -1 }));
  };

  const pauseBattle = () => {
    // Pause all audio
    if (instrumentalAudioRef.current) {
      instrumentalAudioRef.current.pause();
    }
    if (verseAudioRef.current) {
      verseAudioRef.current.pause();
    }
    
    setBattleState(prev => ({ ...prev, isPlaying: false }));
  };

  const startInstrumentalLoop = () => {
    // Play the actual instrumental file
    if (instrumentalAudioRef.current) {
      instrumentalAudioRef.current.pause();
      instrumentalAudioRef.current.src = '';
    }

    instrumentalAudioRef.current = new Audio(instrumental.audio_url);
    instrumentalAudioRef.current.volume = muted ? 0 : volume * 0.4; // Lower volume for background
    instrumentalAudioRef.current.loop = true;

    instrumentalAudioRef.current.onerror = () => {
      console.error('Failed to load instrumental audio');
    };

    instrumentalAudioRef.current.play().catch((error) => {
      console.error('Failed to play instrumental:', error);
    });
  };

  const stopInstrumental = () => {
    if (instrumentalAudioRef.current) {
      instrumentalAudioRef.current.pause();
      instrumentalAudioRef.current = null;
    }
  };

  const getCurrentCharacter = () => {
    if (battleState.currentVerse === -1) return null;
    const verse = battleState.verses[battleState.currentVerse];
    return verse.characterId === character1.id ? character1 : character2;
  };

  const getCurrentVerse = () => {
    if (battleState.currentVerse === -1) return null;
    return battleState.verses[battleState.currentVerse];
  };

  if (battleState.isGenerating) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <h2 className="text-2xl font-bold text-white mb-2">Generating Battle...</h2>
          <p className="text-gray-300">This may take a moment while we create the perfect rap battle!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-red-500 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Back to Setup</span>
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
              BATTLE ARENA
            </h1>
            <p className="text-gray-300">{instrumental.name} - {instrumental.bpm} BPM</p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              {muted ? (
                <VolumeX className="w-6 h-6 text-gray-400" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20"
            />
          </div>
        </div>

        {/* Battle Display */}
        <div className="max-w-6xl mx-auto">
          {/* Characters */}
          <div className="flex items-center justify-between mb-12">
            <motion.div
              className={`text-center ${getCurrentCharacter()?.id === character1.id ? 'scale-110' : 'scale-100'}`}
              animate={{ scale: getCurrentCharacter()?.id === character1.id ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <img
                  src={character1.avatar_url}
                  alt={character1.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-yellow-400"
                />
                {battleState.winner?.id === character1.id && (
                  <Crown className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">{character1.name}</h2>
            </motion.div>

            <div className="text-center">
              <div className="text-6xl font-bold text-red-500 mb-4">VS</div>
              <div className="flex space-x-4">
                <button
                  onClick={battleState.isPlaying ? pauseBattle : playBattle}
                  disabled={battleState.verses.length === 0}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  {battleState.isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            <motion.div
              className={`text-center ${getCurrentCharacter()?.id === character2.id ? 'scale-110' : 'scale-100'}`}
              animate={{ scale: getCurrentCharacter()?.id === character2.id ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <img
                  src={character2.avatar_url}
                  alt={character2.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-yellow-400"
                />
                {battleState.winner?.id === character2.id && (
                  <Crown className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">{character2.name}</h2>
            </motion.div>
          </div>

          {/* Verse Display */}
          <div className="bg-gray-800 rounded-xl p-8 mb-8 min-h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {getCurrentVerse() ? (
                <motion.div
                  key={battleState.currentVerse}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="mb-6">
                    <span className="text-yellow-400 font-bold text-lg">
                      {getCurrentCharacter()?.name} - Verse {Math.floor(battleState.currentVerse / 2) + 1}
                    </span>
                  </div>
                  <div className="text-white text-xl leading-relaxed whitespace-pre-line">
                    {getCurrentVerse()?.text}
                  </div>
                </motion.div>
              ) : battleState.winner ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-4xl font-bold text-white mb-2">WINNER!</h2>
                  <p className="text-2xl text-yellow-400 font-bold">{battleState.winner.name}</p>
                </motion.div>
              ) : (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Ready to Battle!</h2>
                  <p className="text-gray-300">Click play to start the rap battle</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-yellow-400 to-red-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(battleState.currentVerse + 1) / battleState.verses.length * 100}%`
              }}
            />
          </div>

          {/* Verse List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {battleState.verses.map((verse, index) => {
              const character = verse.characterId === character1.id ? character1 : character2;
              const isActive = index === battleState.currentVerse;
              const isCompleted = index < battleState.currentVerse;

              return (
                <motion.div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isActive
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : isCompleted
                      ? 'border-green-400 bg-green-400/10'
                      : 'border-gray-600 bg-gray-800'
                  }`}
                  initial={{ opacity: 0, x: verse.characterId === character1.id ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={character.avatar_url}
                      alt={character.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-white font-semibold">
                      {character.name} - Verse {Math.floor(index / 2) + 1}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {verse.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};