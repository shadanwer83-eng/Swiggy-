/**
 * Swiggy Audio Sound System (Web Audio API Synthesizer)
 * Self-contained sound effects for order confirmation, delivery alerts & chimes.
 */
class SwiggySoundManager {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound(enable) {
    if (typeof enable === 'boolean') {
      this.soundEnabled = enable;
    } else {
      this.soundEnabled = !this.soundEnabled;
    }
    return this.soundEnabled;
  }

  // Play a multi-tone chime (e.g. Swiggy order placed)
  playOrderPlaced() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.25, 'triangle', 0.15);
      }, idx * 120);
    });
  }

  // Milestone Notification Ping (Notification chime)
  playNotificationPing() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    this.playTone(880, 0.1, 'sine', 0.18); // A5
    setTimeout(() => {
      this.playTone(1320, 0.25, 'sine', 0.2); // E6
    }, 110);
  }

  // Rider Arrived or Delivery Completed Fanfare
  playDeliveredFanfare() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const melody = [587.33, 659.25, 783.99, 880, 1046.50];
    melody.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sine', 0.2);
      }, idx * 130);
    });
  }

  // Low gentle click for UI buttons
  playClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;
    this.playTone(600, 0.04, 'sine', 0.05);
  }

  playTone(frequency, duration, type = 'sine', volume = 0.15) {
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio playback not allowed yet without user interaction:", e);
    }
  }
}

window.soundManager = new SwiggySoundManager();

