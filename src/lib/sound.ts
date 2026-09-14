"use client";

/**
 * Sound effects via the Web Audio API. Most are synthesized (no files, no
 * licensing to track); a few slots can instead play real audio clips —
 * drop files into `public/sounds/` and list them in the arrays below, one
 * candidate per line. Each call randomly picks a clip and a playback pitch;
 * if a slot's array is empty, or the file fails to load, it falls back to
 * the synthesized sound automatically.
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

const MUTE_STORAGE_KEY = "dice-app-muted";
let muted = typeof window !== "undefined" && window.localStorage.getItem(MUTE_STORAGE_KEY) === "1";

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MUTE_STORAGE_KEY, value ? "1" : "0");
  }
}

/** Decoded-clip cache, keyed by URL, so repeated plays don't re-fetch/re-decode. */
const clipCache = new Map<string, Promise<AudioBuffer | null>>();

function loadClip(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  let cached = clipCache.get(url);
  if (!cached) {
    cached = fetch(url)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(String(res.status)))))
      .then((data) => ctx.decodeAudioData(data))
      .catch(() => null);
    clipCache.set(url, cached);
  }
  return cached;
}

/**
 * Plays a random clip from `urls` at a random pitch within `pitchRange`
 * (a `playbackRate` multiplier, so `[0.9, 1.1]` is ±10%). Falls back to
 * `fallback()` when there are no candidates, or the chosen clip can't be
 * loaded/decoded.
 */
function playRandomClip(urls: string[], pitchRange: [number, number], volume: number, fallback: () => void): void {
  const ctx = getContext();
  if (!ctx || urls.length === 0) {
    fallback();
    return;
  }

  const url = urls[Math.floor(Math.random() * urls.length)];
  void loadClip(ctx, url).then((buffer) => {
    if (!buffer) {
      fallback();
      return;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitchRange[0] + Math.random() * (pitchRange[1] - pitchRange[0]);
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(ctx.destination);
    source.start();
  });
}

/** A gain node with a fast linear attack and an exponential decay to silence. */
function envelope(ctx: AudioContext, attack: number, decay: number, peak: number): GainNode {
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peak, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
  return gain;
}

/** Real click clip for general button taps — no pitch variation, it's a neutral UI sound. */
const CLICK_CLIPS: string[] = ["/sounds/mouseclick.ogg"];

/** Fallback click if the clip is missing — short, crisp synthesized blip. */
function playSynthClick(): void {
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

/** Short, crisp UI click for general button taps. */
export function playClick(): void {
  if (muted) return;
  playRandomClip(CLICK_CLIPS, [1, 1], MASTER_VOLUME * 0.9, playSynthClick);
}

/** Real "die shuffle" clips for the Roll/OK FAB press — one is picked at random each press. */
const ROLL_PRESS_CLIPS: string[] = ["/sounds/dice-shake-1.ogg", "/sounds/dice-shake-2.ogg", "/sounds/dice-shake-3.ogg"];

/**
 * How long the longest roll-press clip runs (~1.52s) plus a small margin —
 * the actual roll (dice movement/throw sounds) should wait this long after
 * the Roll button is pressed so the shake sound finishes before the throw
 * sounds start, instead of the two overlapping and clashing.
 */
export const ROLL_PRESS_SOUND_DURATION_MS = 1550;

/** The Roll/OK FAB's own sound — lower and a touch richer, with a short upward pitch bend. */
function playSynthRollSound(): void {
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

export function playRollSound(): void {
  if (muted) return;
  playRandomClip(ROLL_PRESS_CLIPS, [0.95, 1.05], MASTER_VOLUME * 0.9, playSynthRollSound);
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

/** Real "die roll" clips for tumble ticks/landings — one is picked at random per tick. */
const DICE_ROLL_CLIPS: string[] = [
  "/sounds/die-throw-1.ogg",
  "/sounds/die-throw-2.ogg",
  "/sounds/die-throw-3.ogg",
  "/sounds/die-throw-4.ogg",
];

/** Die-size -> playbackRate multiplier, so bigger dice sound lower-pitched. */
const CLACK_PITCH: Partial<Record<number, number>> = {
  2: 1.35,
  4: 1.2,
  6: 1.0,
  8: 0.9,
  10: 0.82,
  12: 0.75,
  20: 0.65,
  100: 0.55,
};

/** A randomized ±10% pitch range around a die size's base pitch. */
function clackPitchRange(sides: number): [number, number] {
  const base = CLACK_PITCH[sides] ?? 1;
  return [base * 0.9, base * 1.1];
}

/**
 * One die's "clack" against the table — a filtered noise transient plus a
 * short low thud for body, pitched by the die's own size. `final` makes the
 * landing hit a little louder/longer than the mid-roll tumble ticks.
 */
function playSynthDiceClack(sides: number, final = false): void {
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

export function playDiceClack(sides: number, final = false): void {
  if (muted) return;
  const volume = final ? MASTER_VOLUME * 0.8 : MASTER_VOLUME * 0.55;
  playRandomClip(DICE_ROLL_CLIPS, clackPitchRange(sides), volume, () => playSynthDiceClack(sides, final));
}

/** Real fanfare clip for the result banner reveal — swap the file at this path to change it. */
const RESULT_CHIME_CLIPS: string[] = ["/sounds/roll-banner-chime.mp3"];

/** Fallback fanfare if the clip is missing — a quick ascending three-note arpeggio. */
function playSynthChime(): void {
  const ctx = getContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 784.0];
  notes.forEach((freq, i) => {
    const start = ctx.currentTime + i * 0.09;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, start);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(MASTER_VOLUME * 0.8, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.42);
  });
}

/** The result banner's fanfare, played once when it appears. */
export function playResultChime(): void {
  if (muted) return;
  playRandomClip(RESULT_CHIME_CLIPS, [1, 1], MASTER_VOLUME * 1.1, playSynthChime);
}
