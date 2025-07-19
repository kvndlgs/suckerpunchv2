import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Character = {
  id: string;
  name: string;
  personality_prompt: string;
  voice_id: string;
  avatar_url: string;
  created_at: string;
};

export type Instrumental = {
  id: string;
  name: string;
  bpm: number;
  audio_url: string;
  genre: string;
  created_at: string;
};

export type Battle = {
  id: string;
  character1_id: string;
  character2_id: string;
  instrumental_id: string;
  winner_id?: string;
  created_at: string;
};

export type BattleVerse = {
  id: string;
  battle_id: string;
  character_id: string;
  verse_text: string;
  verse_order: number;
  audio_url?: string;
  created_at: string;
};