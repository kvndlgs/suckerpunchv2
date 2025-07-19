import { Request, Response } from 'express';
import { createCanvas, loadImage } from 'canvas';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface VideoGenerationRequest {
  battleId: string;
  character1: { name: string; avatar: string };
  character2: { name: string; avatar: string };
  winner: string;
  verses: Array<{
    characterId: string;
    text: string;
    order: number;
  }>;
  instrumental: string;
}

export const generateBattleVideo = async (req: Request, res: Response ) => {
    if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

   try {
    const data: VideoGenerationRequest = req.body;
    
    const tempDir = path.join('/tmp', `video_${data.battleId}_${uuidv4()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Generate video frames for each verse
    const framesPaths: string[] = [];
    
    for (let i = 0; i < data.verses.length; i++) {
      const verse = data.verses[i];
      const character = verse.characterId === 'char1' ? data.character1 : data.character2;
      
      const framePath = await generateVerseFrame(
        character,
        verse.text,
        Math.floor(i / 2) + 1,
        tempDir,
        i
      );
      framesPaths.push(framePath);
    }

    // Create video from frames
    const outputPath = path.join(tempDir, 'battle_video.mp4');
    await createVideoFromFrames(framesPaths, outputPath);

    // Send the file
    const videoBuffer = fs.readFileSync(outputPath);
    
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="battle_video.mp4"');
    res.send(videoBuffer);

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: 'Failed to generate video' });
  }

  async function generateVerseFrame(
  character: { name: string; avatar: string },
  verseText: string,
  verseNumber: number,
  tempDir: string,
  frameIndex: number
): Promise<string> {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1920, 1080);

  // Character avatar
  try {
    const avatar = await loadImage(character.avatar);
    ctx.drawImage(avatar, 100, 100, 200, 200);
  } catch (error) {
    // Fallback circle if avatar fails to load
    ctx.fillStyle = '#4a5568';
    ctx.beginPath();
    ctx.arc(200, 200, 100, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Character name
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 48px Arial';
  ctx.fillText(`${character.name} - Verse ${verseNumber}`, 350, 200);

  // Verse text (wrap text)
  ctx.fillStyle = '#ffffff';
  ctx.font = '36px Arial';
  const lines = wrapText(ctx, verseText, 350, 1500);
  lines.forEach((line, index) => {
    ctx.fillText(line, 350, 300 + index * 50);
  });

  // Save frame
  const framePath = path.join(tempDir, `frame_${frameIndex}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(framePath, buffer);

  return framePath;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

async function createVideoFromFrames(framesPaths: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create image list file for ffmpeg
    const imageListPath = path.join(path.dirname(outputPath), 'images.txt');
    const imageList = framesPaths.map(frame => `file '${frame}'`).join('\n');
    fs.writeFileSync(imageListPath, imageList);

    ffmpeg()
      .input(imageListPath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions([
        '-c:v', 'libx264',
        '-r', '1', // 1 FPS (each frame shows for 1 second)
        '-pix_fmt', 'yuv420p'
      ])
      .output(outputPath)
      .on('error', reject)
      .on('end', resolve)
      .run();
  });
 }
}