import { Request, Response } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface AudioMixRequest {
  battleId: string;
  verses: Array<{
    audioUrl: string;
    order: number;
    characterName: string;
  }>;
  instrumentalUrl: string;
  bpm: number;
}

export const generateBattleVideo = async (req: Request, res: Response) => {
    if(req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed'});
    };

    try {
          const { battleId, verses, instrumentalUrl, bpm }: AudioMixRequest = req.body;
    
    const tempDir = path.join('/tmp', `battle_${battleId}_${uuidv4()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Download instrumental and verses
    const instrumentalPath = path.join(tempDir, 'instrumental.mp3');
    const versePaths: string[] = [];

    // Download instrumental
    await downloadFile(instrumentalUrl, instrumentalPath);

    // Download all verse audio files
    for (let i = 0; i < verses.length; i++) {
      const versePath = path.join(tempDir, `verse_${i}.mp3`);
      await downloadFile(verses[i].audioUrl, versePath);
      versePaths.push(versePath);
    }

    // Create the mixed audio
    const outputPath = path.join(tempDir, 'battle_mix.mp3');
    await mixAudioFiles(instrumentalPath, versePaths, outputPath, bpm);

    // Send the file
    const audioBuffer = fs.readFileSync(outputPath);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="battle_mix.mp3"');
    res.send(audioBuffer);

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

  } catch (error) {
    console.error('Audio mixing error:', error);
    res.status(500).json({ error: 'Failed to generate audio mix' });
  }

  async function downloadFile(url: string, destination: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}`);
  
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(destination, Buffer.from(buffer));
}

async function mixAudioFiles(
  instrumentalPath: string,
  versePaths: string[],
  outputPath: string,
  bpm: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Calculate timing based on BPM
    const beatsPerVerse = 16; // Assuming 16 bars per verse
    const secondsPerBeat = 60 / bpm;
    const verseGapSeconds = beatsPerVerse * secondsPerBeat;

    let command = ffmpeg();
    
    // Add instrumental as base
    command = command.input(instrumentalPath);
    
    // Add each verse with proper timing
    let currentTime = 0;
    versePaths.forEach((versePath, index) => {
      command = command.input(versePath);
      currentTime += index === 0 ? 0 : verseGapSeconds;
    });

    // Create filter complex for mixing
    let filterComplex = '[0:a]volume=0.3[instrumental];';
    
    versePaths.forEach((_, index) => {
      const inputIndex = index + 1;
      const startTime = index * verseGapSeconds;
      filterComplex += `[${inputIndex}:a]adelay=${Math.round(startTime * 1000)}|${Math.round(startTime * 1000)},volume=0.8[verse${index}];`;
    });

    // Mix all together
    const inputs = ['[instrumental]', ...versePaths.map((_, i) => `[verse${i}]`)];
    filterComplex += `${inputs.join('')}amix=inputs=${inputs.length}:duration=longest[out]`;

    command
      .complexFilter(filterComplex)
      .outputOptions(['-map', '[out]'])
      .audioCodec('libmp3lame')
      .audioBitrate('192k')
      .output(outputPath)
      .on('error', reject)
      .on('end', resolve)
      .run();
  });
    
}