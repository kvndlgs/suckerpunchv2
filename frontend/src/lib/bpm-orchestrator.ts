export class BPMOrchestrator {
  private bpm: number;
  private beatsPerBar: number = 4;
  private barsPerVerse: number = 4;

  constructor(bpm: number) {
    this.bpm = bpm;
  }

  // Calculate timing for verse playback
  calculateVerseTiming(verseText: string): {
    duration: number;
    wordTimings: Array<{ word: string; startTime: number; duration: number }>;
  } {
    const words = verseText.split(' ');
    const totalSyllables = this.countSyllables(verseText);
    
    // Calculate base timing
    const millisecondsPerBeat = (60 / this.bpm) * 1000;
    const totalBars = this.barsPerVerse;
    const totalDuration = (totalBars * this.beatsPerBar * millisecondsPerBeat);
    
    // Adjust for syllable density
    const adjustedDuration = Math.max(totalDuration, totalSyllables * 200);
    
    // Calculate word timings
    const wordTimings: Array<{ word: string; startTime: number; duration: number }> = [];
    let currentTime = 0;
    
    words.forEach((word, index) => {
      const wordSyllables = this.countSyllables(word);
      const wordDuration = (wordSyllables / totalSyllables) * adjustedDuration;
      
      wordTimings.push({
        word: word,
        startTime: currentTime,
        duration: wordDuration
      });
      
      currentTime += wordDuration;
    });

    return {
      duration: adjustedDuration,
      wordTimings
    };
  }

  // Add pauses between verses
  calculatePauseDuration(): number {
    const beatsPerPause = 2; // 2 beats pause between verses
    return (beatsPerPause * 60 / this.bpm) * 1000;
  }

  // Count syllables in text (simple heuristic)
  private countSyllables(text: string): number {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    return words.reduce((total, word) => {
      const syllables = word.match(/[aeiouy]+/g) || [];
      return total + Math.max(1, syllables.length);
    }, 0);
  }

  // Calculate total battle duration
  calculateBattleDuration(verses: string[]): number {
    const verseDurations = verses.map(verse => this.calculateVerseTiming(verse).duration);
    const pauseDuration = this.calculatePauseDuration();
    const totalPauses = verses.length - 1;
    
    return verseDurations.reduce((total, duration) => total + duration, 0) + 
           (totalPauses * pauseDuration);
  }

  // Synchronize verse with beat
  synchronizeWithBeat(verse: string, startTime: number = 0): {
    timing: ReturnType<BPMOrchestrator['calculateVerseTiming']>;
    beatSync: Array<{ beat: number; time: number }>;
  } {
    const timing = this.calculateVerseTiming(verse);
    const beatSync: Array<{ beat: number; time: number }> = [];
    
    const millisecondsPerBeat = (60 / this.bpm) * 1000;
    const totalBeats = Math.ceil(timing.duration / millisecondsPerBeat);
    
    for (let beat = 0; beat < totalBeats; beat++) {
      beatSync.push({
        beat: beat + 1,
        time: startTime + (beat * millisecondsPerBeat)
      });
    }

    return { timing, beatSync };
  }
}