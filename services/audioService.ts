
import { BACKGROUND_MUSIC_URL } from '../constants';

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private melodyInterval: any = null;
  private isPlaying: boolean = false;
  private bgMusic: HTMLAudioElement | null = null;

  constructor() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("AudioContext not supported");
    }
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async tryAutoplay() {
    this.init();
    
    // Tenta tocar o MP3 se existir URL
    if (BACKGROUND_MUSIC_URL && !this.bgMusic) {
      this.bgMusic = new Audio(BACKGROUND_MUSIC_URL);
      this.bgMusic.loop = true;
      this.bgMusic.volume = 0.4; // Volume agradável
    }

    if (this.bgMusic && !this.isPlaying && !this.isMuted) {
      try {
        await this.bgMusic.play();
        this.isPlaying = true;
      } catch (e) {
        // Autoplay bloqueado, aguarda interação
      }
    } else if (!BACKGROUND_MUSIC_URL) {
      // Fallback para sintetizador apenas se não tiver MP3
      this.playBackgroundMelody(); 
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    // Força play no MP3 se estiver pausado
    if (this.bgMusic && this.bgMusic.paused && !this.isMuted) {
      this.bgMusic.play().catch(() => {});
      this.isPlaying = true;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.bgMusic) {
      if (this.isMuted) {
        this.bgMusic.pause();
        this.isPlaying = false;
      } else {
        this.bgMusic.play().catch(() => {});
        this.isPlaying = true;
      }
    } else {
      if (this.isMuted) {
        this.stopMelody();
      } else {
        this.playBackgroundMelody();
      }
    }
    return this.isMuted;
  }

  // --- SINTETIZADOR (SFX) ---
  
  playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (this.isMuted) return;
    this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {});
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  // Fallback Melody (Só toca se não tiver MP3)
  playBackgroundMelody() {
    if (BACKGROUND_MUSIC_URL) return; // Aborta se tiver MP3
    if (this.isMuted || this.isPlaying) return;
    
    this.init();
    this.isPlaying = true;

    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25]; 
    let i = 0;

    this.melodyInterval = setInterval(() => {
      if (this.isMuted) return;
      this.playTone(notes[i], 0.6, 'sine', 0.05);
      i = (i + 1) % notes.length;
    }, 800);
  }

  stopMelody() {
    if (this.melodyInterval) {
      clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }
    this.isPlaying = false;
  }

  // SFX
  playZap() { this.playTone(800, 0.1, 'sawtooth', 0.05); }
  playCollect() { 
    this.playTone(1200, 0.1, 'sine', 0.1);
    setTimeout(() => this.playTone(1800, 0.2, 'sine', 0.1), 100);
  }
  playJump() { this.playTone(300, 0.1, 'square', 0.05); }
  playWin() {
    this.playTone(523.25, 0.2, 'triangle', 0.2);
    setTimeout(() => this.playTone(659.25, 0.2, 'triangle', 0.2), 200);
    setTimeout(() => this.playTone(783.99, 0.4, 'triangle', 0.2), 400);
  }
  playError() { this.playTone(150, 0.3, 'sawtooth', 0.2); }
}

export const audioService = new AudioService();
