// Web Audio API sound generator for Focus timer and Breathing cues

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playMicroWinTone() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Master gain envelope for a warm, clean mix
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.1, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    masterGain.connect(ctx.destination);

    // Tone 1: Warm fundamental body (E5 - 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.6, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.55);

    // Tone 2: Mid bell chime (B5 - 987.77 Hz) - 40ms offset
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.04);
    gain2.gain.setValueAtTime(0, now + 0.04);
    gain2.gain.linearRampToValueAtTime(0.7, now + 0.055);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.65);

    // Tone 3: Crystal resolve shimmer (G#6 - 1661.22 Hz) - 90ms offset
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1661.22, now + 0.09);
    gain3.gain.setValueAtTime(0, now + 0.09);
    gain3.gain.linearRampToValueAtTime(0.5, now + 0.105);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc3.connect(gain3);
    gain3.connect(masterGain);
    osc3.start(now + 0.09);
    osc3.stop(now + 0.7);
  } catch (e) {
    console.error('Audio play error:', e);
  }
}

export function playBreathingTone(phase: 'inhale' | 'hold' | 'exhale') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';

    const now = ctx.currentTime;
    if (phase === 'inhale') {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 3.8);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 2.0);
      gain.gain.linearRampToValueAtTime(0.01, now + 3.8);
    } else if (phase === 'hold') {
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 6.8);
      gain.gain.linearRampToValueAtTime(0.01, now + 7.0);
    } else {
      // exhale
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(165, now + 7.8);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 7.8);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + (phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8));
  } catch (e) {
    console.error('Breathing tone error:', e);
  }
}
