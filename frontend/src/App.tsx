import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BattleSetup } from './components/BattleSetup';
import { BattleArena } from './components/BattleArena';
import { Character, Instrumental } from './lib/supabase';
import './app.css';

type AppState = 'setup' | 'battle';

interface BattleConfig {
  character1: Character;
  character2: Character;
  instrumental: Instrumental;
}

function App() {
  const [currentState, setCurrentState] = useState<AppState>('setup');
  const [battleConfig, setBattleConfig] = useState<BattleConfig | null>(null);

  const handleStartBattle = (character1: Character, character2: Character, instrumental: Instrumental) => {
    setBattleConfig({ character1, character2, instrumental });
    setCurrentState('battle');
  };

  const handleBackToSetup = () => {
    setCurrentState('setup');
    setBattleConfig(null);
  };

  return (
    <div className="App">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
          },
        }}
      />
      
      {currentState === 'setup' && (
        <BattleSetup onStartBattle={handleStartBattle} />
      )}
      
      {currentState === 'battle' && battleConfig && (
        <BattleArena
          character1={battleConfig.character1}
          character2={battleConfig.character2}
          instrumental={battleConfig.instrumental}
          onBack={handleBackToSetup}
        />
      )}
    </div>
  );
}

export default App;