import type { AudioManager } from '../types';

export class SoundSystem implements AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private masterVolume: number = 0.5;
  private isInitialized: boolean = false;

  async init(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.createSounds();
      this.isInitialized = true;
      console.log('Sound system initialized');
    } catch (error) {
      console.warn('Sound system initialization failed:', error);
    }
  }

  private async createSounds(): Promise<void> {
    const soundDefinitions = {
      click: { frequency: 800, duration: 0.1, type: 'sine' },
      success: { frequency: 1200, duration: 0.3, type: 'triangle' },
      error: { frequency: 300, duration: 0.5, type: 'sawtooth' },
      notification: { frequency: 600, duration: 0.2, type: 'square' },
      startup: { frequency: 440, duration: 1.0, type: 'sine' },
      shutdown: { frequency: 220, duration: 0.8, type: 'sine' }
    };

    for (const [id, config] of Object.entries(soundDefinitions)) {
      const buffer = await this.generateTone(config.frequency, config.duration, config.type as OscillatorType);
      this.sounds.set(id, buffer);
    }
  }

  private async generateTone(frequency: number, duration: number, type: OscillatorType): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'triangle':
          sample = 2 * Math.abs(2 * (frequency * t - Math.floor(frequency * t + 0.5))) - 1;
          break;
        case 'sawtooth':
          sample = 2 * (frequency * t - Math.floor(frequency * t + 0.5));
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
      }

      const envelope = Math.exp(-t * 3);
      data[i] = sample * envelope;
    }

    return buffer;
  }

  playSound(id: string, volume: number = 1): void {
    if (!this.isInitialized || !this.audioContext) return;

    const buffer = this.sounds.get(id);
    if (!buffer) {
      console.warn(`Sound '${id}' not found`);
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = this.masterVolume * volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  stopSound(id: string): void {
    console.log(`Stopping sound: ${id}`);
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  async loadSound(id: string, url: string): Promise<void> {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(id, audioBuffer);
    } catch (error) {
      console.warn(`Failed to load sound '${id}':`, error);
    }
  }

  playClickSound(): void {
    this.playSound('click', 0.3);
  }

  playSuccessSound(): void {
    this.playSound('success', 0.5);
  }

  playErrorSound(): void {
    this.playSound('error', 0.4);
  }

  playNotificationSound(): void {
    this.playSound('notification', 0.6);
  }

  playStartupSound(): void {
    this.playSound('startup', 0.7);
  }

  playShutdownSound(): void {
    this.playSound('shutdown', 0.7);
  }

  createAdvancedEffect(type: 'sweep' | 'pulse' | 'glitch'): void {
    if (!this.audioContext) return;

    switch (type) {
      case 'sweep':
        this.createFrequencySweep();
        break;
      case 'pulse':
        this.createPulseEffect();
        break;
      case 'glitch':
        this.createGlitchEffect();
        break;
    }
  }

  private createFrequencySweep(): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  private createPulseEffect(): void {
    if (!this.audioContext) return;

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playSound('click', 0.2);
      }, i * 100);
    }
  }

  private createGlitchEffect(): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = 440;

    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();

    lfo.type = 'sine';
    lfo.frequency.value = 10;
    lfoGain.gain.value = 100;

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    gainNode.gain.setValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    lfo.start();
    oscillator.start();
    
    lfo.stop(this.audioContext.currentTime + 0.3);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  getAvailableSounds(): string[] {
    return Array.from(this.sounds.keys());
  }

  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.sounds.clear();
    this.isInitialized = false;
  }
}
