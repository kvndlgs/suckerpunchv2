const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('Missing Groq API key in environment variables');
}

export async function generateRapVerse(
  characterPrompt: string,
  opponentName: string,
  verseNumber: number,
  bpm: number
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is not configured. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `${characterPrompt}

You are now in a rap battle against ${opponentName}. Generate a ${verseNumber === 1 ? 'first' : verseNumber === 2 ? 'second' : 'third'} verse for a rap battle. The beat is ${bpm} BPM.

Rules:
- Keep it to 8-12 lines
- Make it rhyme and flow well
- Stay in character
- Include clever wordplay and insults
- Reference your opponent
- Keep it entertaining, highly offensive and personal
- Make it sound like something your character would actually say`
          },
          {
            role: 'user',
            content: `Generate a rap verse for verse ${verseNumber} of the battle against ${opponentName}. BPM: ${bpm}`
          }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.9,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`Groq API Error: ${errorMessage}. Please check your API key and try again.`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Groq API');
    }
    
    return data.choices[0].message.content.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error while connecting to Groq API. Please check your internet connection.');
  }
}