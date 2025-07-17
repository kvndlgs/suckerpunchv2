/*
  # SuckerPunch Database Schema

  1. New Tables
    - `characters`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `personality_prompt` (text)
      - `voice_id` (text) - ElevenLabs voice ID
      - `avatar_url` (text)
      - `created_at` (timestamp)
    
    - `instrumentals`
      - `id` (uuid, primary key)
      - `name` (text)
      - `bpm` (integer)
      - `audio_url` (text)
      - `genre` (text)
      - `created_at` (timestamp)
    
    - `battles`
      - `id` (uuid, primary key)
      - `character1_id` (uuid, foreign key)
      - `character2_id` (uuid, foreign key)
      - `instrumental_id` (uuid, foreign key)
      - `winner_id` (uuid, foreign key, nullable)
      - `created_at` (timestamp)
    
    - `battle_verses`
      - `id` (uuid, primary key)
      - `battle_id` (uuid, foreign key)
      - `character_id` (uuid, foreign key)
      - `verse_text` (text)
      - `verse_order` (integer)
      - `audio_url` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated users to create battles
*/

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  personality_prompt text NOT NULL,
  voice_id text NOT NULL,
  avatar_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Instrumentals table
CREATE TABLE IF NOT EXISTS instrumentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bpm integer NOT NULL,
  audio_url text NOT NULL,
  genre text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Battles table
CREATE TABLE IF NOT EXISTS battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character1_id uuid REFERENCES characters(id) NOT NULL,
  character2_id uuid REFERENCES characters(id) NOT NULL,
  instrumental_id uuid REFERENCES instrumentals(id) NOT NULL,
  winner_id uuid REFERENCES characters(id),
  created_at timestamptz DEFAULT now()
);

-- Battle verses table
CREATE TABLE IF NOT EXISTS battle_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid REFERENCES battles(id) NOT NULL,
  character_id uuid REFERENCES characters(id) NOT NULL,
  verse_text text NOT NULL,
  verse_order integer NOT NULL,
  audio_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE instrumentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_verses ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can read characters"
  ON characters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read instrumentals"
  ON instrumentals
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read battles"
  ON battles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read battle verses"
  ON battle_verses
  FOR SELECT
  TO public
  USING (true);

-- Public insert policies for battles and verses
CREATE POLICY "Anyone can create battles"
  ON battles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can create battle verses"
  ON battle_verses
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert default characters
INSERT INTO characters (name, personality_prompt, voice_id, avatar_url) VALUES
(
  'Realistic Fish Head',
  'You are the Realistic Fish Head news anchor from SpongeBob SquarePants. You speak in a serious, authoritative news reporter voice but about ridiculous topics. Your rap style is formal yet absurd, mixing news terminology with street slang. You often reference Bikini Bottom, underwater life, and breaking news. Your insults are delivered like news headlines.',
  'pNInz6obpgDQGcFmaJgB',
  'https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg?auto=compress&cs=tinysrgb&w=400'
),
(
  'Shaggy',
  'You are Shaggy from Scooby-Doo. You speak in a laid-back, hippie style with lots of "like" and "man" in your sentences. Your rap style is chill but surprisingly clever, mixing stoner humor with detective references. You often mention food, being scared, Scooby-Doo, and solving mysteries. Your insults are delivered in a confused but devastating way.',
  'yoZ06aMxZJJ28mfd3POQ',
  'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=400'
),
(
  'Batman 96',
  'You are Batman from the 1990s animated series. You speak in a deep, gravelly voice with dramatic intensity. Your rap style is dark and brooding, mixing gothic imagery with street justice themes. You often reference Gotham City, crime fighting, and your rogues gallery. Your insults are delivered with theatrical darkness and moral superiority.',
  'EXAVITQu4vr4xnSDxMaL',
  'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=400'
),
(
  'Peter Griffin',
  'You are Peter Griffin from Family Guy. You speak in a crude, loud, and often inappropriate way with a Boston accent. Your rap style is chaotic and offensive, mixing pop culture references with absurd family situations. You often mention Quahog, beer, TV shows, and your family. Your insults are delivered with oblivious confidence and are often self-deprecating.',
  'flq6f7yk4E4fJM5XTYuZ',
  'https://images.pexels.com/photos/1212487/pexels-photo-1212487.jpeg?auto=compress&cs=tinysrgb&w=400'
);

-- Insert default instrumentals
INSERT INTO instrumentals (name, bpm, audio_url, genre) VALUES
('Hard Trap Beat', 140, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'Trap'),
('Boom Bap Classic', 95, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'Boom Bap'),
('Drill Aggressive', 150, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'Drill'),
('Lo-Fi Chill', 85, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'Lo-Fi'),
('West Coast Funk', 100, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'West Coast'),
('East Coast Hardcore', 120, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'East Coast'),
('Southern Crunk', 130, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'Crunk'),
('Experimental Hip-Hop', 110, 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 'Experimental');