const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
  throw new Error('Missing ElevenLabs API key');
}

export async function generateSpeech(
  text: string,
  voiceId: string,
  bpm: number
): Promise<string> {
  // Calculate speech rate based on BPM
  const baseSpeed = 1.0;
  const speedMultiplier = Math.max(0.7, Math.min(1.3, bpm / 120));
  const adjustedSpeed = baseSpeed * speedMultiplier;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true,
        speed: adjustedSpeed,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate speech');
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}