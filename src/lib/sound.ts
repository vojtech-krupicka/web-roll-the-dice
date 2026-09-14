"use client";

/**
 * Small synthesized sound effects via the Web Audio API — no audio files,
 * so no licensing to track. Everything is short percussive blips/noise
 * bursts built from oscillators and a generated noise buffer.
 */

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

const MASTER_VOLUME = 0.25;

/** A gain node with a fast linear attack and an exponential decay to silence. */
function envelope(ctx: AudioContext, attack: number, decay: number, peak: number): GainNode {
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peak, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
  return gain;
}

/** Short, crisp UI click for general button taps. */
export function playClick(): void {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.05);

  const gain = envelope(ctx, 0.002, 0.05, MASTER_VOLUME * 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

/** The Roll/OK FAB's own sound — lower and a touch richer, with a short upward pitch bend. */
export function playRollSound(): void {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.09);

  const gain = envelope(ctx, 0.004, 0.13, MASTER_VOLUME * 0.7);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.18);
}

/** A short white-noise buffer, used as the raw material for percussive impacts. */
function noiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/** Die-size -> filter tone: bigger dice clack lower, smaller dice click higher. */
const CLACK_TONE: Partial<Record<number, number>> = {
  2: 2200,
  4: 2600,
  6: 2000,
  8: 1700,
  10: 1450,
  12: 1250,
  20: 1000,
  100: 750,
};

/**
 * One die's "clack" against the table — a filtered noise transient plus a
 * short low thud for body, pitched by the die's own size. `final` makes the
 * landing hit a little louder/longer than the mid-roll tumble ticks.
 */
export function playDiceClack(sides: number, final = false): void {
  const ctx = getContext();
  if (!ctx) return;

  const baseTone = CLACK_TONE[sides] ?? 1500;
  const tone = baseTone * (0.9 + Math.random() * 0.2);
  const now = ctx.currentTime;
  const volume = final ? MASTER_VOLUME * 0.6 : MASTER_VOLUME * 0.4;

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, final ? 0.07 : 0.05);
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = tone;
  bandpass.Q.value = 0.9;
  const noiseGain = envelope(ctx, 0.001, final ? 0.05 : 0.035, volume);
  noise.connect(bandpass).connect(noiseGain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + (final ? 0.09 : 0.07));

  const thud = ctx.createOscillator();
  thud.type = "sine";
  thud.frequency.setValueAtTime(Math.max(50, tone / 10), now);
  const thudGain = envelope(ctx, 0.001, final ? 0.07 : 0.045, volume * 0.7);
  thud.connect(thudGain).connect(ctx.destination);
  thud.start(now);
  thud.stop(now + (final ? 0.1 : 0.08));
}
