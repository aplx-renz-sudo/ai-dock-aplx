/**
 * DJ Mode — interactive audio-reactive experience.
 * Beat engine (Web Audio API), frequency analysis, overlay HUD,
 * 3D laser beams and dance floor.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ================================================================== */
/*  BEAT ENGINE                                                        */
/* ================================================================== */

class BeatEngine {
  private ctx: AudioContext;
  private analyser: AnalyserNode;
  private masterGain: GainNode;
  private dataArray: Uint8Array<ArrayBuffer>;
  private bpm = 128;
  private beatInterval: number;
  private nextBeatTime = 0;
  private beatCount = 0;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private demoMode = true;

  bassLevel = 0;
  midLevel = 0;
  highLevel = 0;

  constructor() {
    this.ctx = new AudioContext();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.78;
    this.dataArray = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.55;
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    this.beatInterval = 60 / this.bpm;
  }

  getAnalyser() {
    return this.analyser;
  }

  private paused = false;

  start() {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.ctx.resume();
    if (this.demoMode) {
      this.nextBeatTime = this.ctx.currentTime + 0.1;
      this.beatCount = 0;
      this.scheduleLoop();
    }
  }

  pause() {
    if (!this.running || this.paused) return;
    this.paused = true;
    if (this.timerId) clearTimeout(this.timerId);
    this.timerId = null;
    try {
      this.ctx.suspend();
    } catch { /* ignore */ }
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    try {
      this.ctx.resume();
    } catch { /* ignore */ }
    if (this.demoMode) {
      this.nextBeatTime = this.ctx.currentTime + 0.05;
      this.scheduleLoop();
    }
  }

  get isPaused() {
    return this.paused;
  }

  stop() {
    this.running = false;
    this.paused = false;
    if (this.timerId) clearTimeout(this.timerId);
    this.timerId = null;
    this.stopMic();
    try {
      this.ctx.suspend();
    } catch {
      /* ignore */
    }
  }

  async enableMic() {
    if (!this.running) return;
    this.stopDemo();
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      this.micSource = this.ctx.createMediaStreamSource(this.micStream);
      this.micSource.connect(this.analyser);
      this.demoMode = false;
    } catch {
      // mic denied, restart demo
      this.demoMode = true;
      this.nextBeatTime = this.ctx.currentTime + 0.1;
      this.beatCount = 0;
      this.scheduleLoop();
    }
  }

  disableMic() {
    this.stopMic();
    this.demoMode = true;
    if (this.running) {
      this.nextBeatTime = this.ctx.currentTime + 0.1;
      this.beatCount = 0;
      this.scheduleLoop();
    }
  }

  private stopMic() {
    this.micSource?.disconnect();
    this.micSource = null;
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.micStream = null;
  }

  /* ---- tab audio capture (for YouTube / any tab audio) ---- */

  private tabCaptureStream: MediaStream | null = null;
  private tabCaptureSource: MediaStreamAudioSourceNode | null = null;

  async enableTabCapture(): Promise<boolean> {
    if (!this.running) return false;
    try {
      // try audio-only first, fall back to audio+video if rejected
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          } as MediaTrackConstraints,
          video: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getDisplayMedia({
          audio: true,
          video: true,
        });
      }
      this.stopAllSources();
      this.tabCaptureStream = stream;
      this.tabCaptureSource = this.ctx.createMediaStreamSource(stream);
      this.tabCaptureSource.connect(this.analyser);
      this.demoMode = false;
      // auto-fallback when user stops sharing
      stream.getAudioTracks()[0]?.addEventListener("ended", () => {
        this.disableTabCapture();
        if (this.running) {
          this.demoMode = true;
          this.nextBeatTime = this.ctx.currentTime + 0.1;
          this.beatCount = 0;
          this.scheduleLoop();
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  disableTabCapture() {
    this.tabCaptureSource?.disconnect();
    this.tabCaptureSource = null;
    this.tabCaptureStream?.getTracks().forEach((t) => t.stop());
    this.tabCaptureStream = null;
  }

  private stopAllSources() {
    this.stopDemo();
    this.stopMic();
    this.disableTabCapture();
  }

  private stopDemo() {
    if (this.timerId) clearTimeout(this.timerId);
    this.timerId = null;
  }

  updateLevels() {
    this.analyser.getByteFrequencyData(this.dataArray);
    const bins = this.dataArray.length;

    let bass = 0;
    for (let i = 0; i < 10; i++) bass += this.dataArray[i];
    this.bassLevel = bass / (10 * 255);

    let mid = 0;
    for (let i = 10; i < 55; i++) mid += this.dataArray[i];
    this.midLevel = mid / (45 * 255);

    let high = 0;
    for (let i = 55; i < bins; i++) high += this.dataArray[i];
    this.highLevel = high / ((bins - 55) * 255);
  }

  private scheduleLoop() {
    if (!this.running || !this.demoMode) return;
    const lookahead = 0.15;
    while (this.nextBeatTime < this.ctx.currentTime + lookahead) {
      this.playBeat(this.nextBeatTime, this.beatCount);
      this.nextBeatTime += this.beatInterval / 2;
      this.beatCount++;
    }
    this.timerId = setTimeout(() => this.scheduleLoop(), 50);
  }

  private playBeat(time: number, beat: number) {
    const bar = beat % 16;
    if (bar % 4 === 0) this.kick(time);
    this.hihat(time, bar % 2 === 0 ? 0.38 : 0.18);
    if (bar === 4 || bar === 12) this.snare(time);
    if (bar % 4 === 0) {
      const notes = [55, 55, 65.41, 49];
      this.bassNote(time, notes[Math.floor(beat / 16) % 4]);
    }
  }

  private kick(time: number) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
    g.gain.setValueAtTime(0.9, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.35);
  }

  private hihat(time: number, vol: number) {
    const len = Math.floor(this.ctx.sampleRate * 0.05);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    src.connect(hp);
    hp.connect(g);
    g.connect(this.masterGain);
    src.start(time);
    src.stop(time + 0.06);
  }

  private snare(time: number) {
    const len = Math.floor(this.ctx.sampleRate * 0.15);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const n = this.ctx.createBufferSource();
    n.buffer = buf;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3000;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.55, time);
    ng.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    n.connect(bp);
    bp.connect(ng);
    ng.connect(this.masterGain);
    n.start(time);
    n.stop(time + 0.16);

    const osc = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);
    og.gain.setValueAtTime(0.45, time);
    og.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(og);
    og.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.11);
  }

  private bassNote(time: number, freq: number) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, time);
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(200, time);
    lp.frequency.exponentialRampToValueAtTime(80, time + 0.3);
    g.gain.setValueAtTime(0.3, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    osc.connect(lp);
    lp.connect(g);
    g.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.36);
  }

  destroy() {
    this.stop();
    this.ctx.close().catch(() => {});
  }
}

/* ================================================================== */
/*  CONTEXT                                                             */
/* ================================================================== */

interface DJState {
  active: boolean;
  paused: boolean;
  bassLevel: number;
  midLevel: number;
  highLevel: number;
  micActive: boolean;
  tabCaptured: boolean;
  youtubeVideoId: string | null;
  startDJ: () => void;
  stopDJ: () => void;
  togglePause: () => void;
  toggleMic: () => void;
  captureTab: () => Promise<boolean>;
  loadYouTube: (url: string) => void;
}

const DJCtx = createContext<DJState>({
  active: false,
  paused: false,
  bassLevel: 0,
  midLevel: 0,
  highLevel: 0,
  micActive: false,
  tabCaptured: false,
  youtubeVideoId: null,
  startDJ: () => {},
  stopDJ: () => {},
  togglePause: () => {},
  toggleMic: () => {},
  captureTab: async () => false,
  loadYouTube: () => {},
});

export const useDJ = () => useContext(DJCtx);

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
    /^([\w-]{11})$/, // bare video ID
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function DJProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [levels, setLevels] = useState({ bass: 0, mid: 0, high: 0 });
  const [micActive, setMicActive] = useState(false);
  const [tabCaptured, setTabCaptured] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const engineRef = useRef<BeatEngine | null>(null);
  const rafRef = useRef(0);

  const startDJ = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new BeatEngine();
    }
    engineRef.current.start();
    setActive(true);
    setPaused(false);
    setMicActive(false);
    setTabCaptured(false);

    const tick = () => {
      const e = engineRef.current;
      if (!e) return;
      e.updateLevels();
      setLevels({ bass: e.bassLevel, mid: e.midLevel, high: e.highLevel });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopDJ = useCallback(() => {
    engineRef.current?.stop();
    cancelAnimationFrame(rafRef.current);
    setActive(false);
    setPaused(false);
    setMicActive(false);
    setTabCaptured(false);
    setYoutubeVideoId(null);
    setLevels({ bass: 0, mid: 0, high: 0 });
  }, []);

  const togglePause = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    if (e.isPaused) {
      e.resume();
      setPaused(false);
    } else {
      e.pause();
      setPaused(true);
    }
  }, []);

  const toggleMic = useCallback(async () => {
    const e = engineRef.current;
    if (!e) return;
    if (micActive) {
      e.disableMic();
      setMicActive(false);
    } else {
      e.disableTabCapture();
      setTabCaptured(false);
      await e.enableMic();
      setMicActive(true);
    }
  }, [micActive]);

  const captureTab = useCallback(async (): Promise<boolean> => {
    const e = engineRef.current;
    if (!e) return false;
    const ok = await e.enableTabCapture();
    setTabCaptured(ok);
    if (ok) setMicActive(false);
    return ok;
  }, []);

  const loadYouTube = useCallback((url: string) => {
    const id = extractYouTubeId(url);
    setYoutubeVideoId(id);
  }, []);

  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const value = useMemo<DJState>(
    () => ({
      active,
      paused,
      bassLevel: levels.bass,
      midLevel: levels.mid,
      highLevel: levels.high,
      micActive,
      tabCaptured,
      youtubeVideoId,
      startDJ,
      stopDJ,
      togglePause,
      toggleMic,
      captureTab,
      loadYouTube,
    }),
    [active, paused, levels.bass, levels.mid, levels.high, micActive, tabCaptured, youtubeVideoId, startDJ, stopDJ, togglePause, toggleMic, captureTab, loadYouTube],
  );

  return <DJCtx.Provider value={value}>{children}</DJCtx.Provider>;
}

/* ================================================================== */
/*  HTML OVERLAY — futuristic DJ HUD                                   */
/* ================================================================== */

function extractYouTubeIdFromInput(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
    /^([\w-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return null;
}

export function DJOverlay() {
  const {
    active, paused, bassLevel, midLevel, highLevel,
    micActive, tabCaptured, youtubeVideoId,
    togglePause, toggleMic, stopDJ, captureTab, loadYouTube,
  } = useDJ();
  const [bars, setBars] = useState<number[]>(new Array(32).fill(0));
  const [ytInput, setYtInput] = useState("");
  const [showYouTube, setShowYouTube] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      setBars((prev) => {
        const next = [...prev];
        for (let i = 0; i < 10; i++)
          next[i] = bassLevel * 0.8 + Math.random() * 0.15;
        for (let i = 10; i < 22; i++)
          next[i] = midLevel * 0.7 + Math.random() * 0.12;
        for (let i = 22; i < 32; i++)
          next[i] = highLevel * 0.6 + Math.random() * 0.1;
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, bassLevel, midLevel, highLevel]);

  const handleLoadYouTube = () => {
    const id = extractYouTubeIdFromInput(ytInput.trim());
    if (id) loadYouTube(id);
  };

  const handleCaptureTab = async () => {
    setCapturing(true);
    await captureTab();
    setCapturing(false);
  };

  if (!active) return null;

  const trackLabel = tabCaptured
    ? "Tab Audio — Live"
    : youtubeVideoId
      ? "YouTube Stream"
      : micActive
        ? "Microphone — Live"
        : paused
          ? "Aplx Beats — Paused"
          : "Aplx Beats — Demo Track";
  const bpmLabel = paused ? "Paused" : tabCaptured || micActive ? "Analyzing…" : "128 BPM · Electronic";

  return (
    <>
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-5">
      <div
        className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-black/60 p-5 backdrop-blur-2xl shadow-[0_0_60px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]"
        style={{
          transform: `translateY(${bassLevel * -3}px)`,
          transition: "transform 0.05s ease-out",
        }}
      >
        {/* header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300/90">
              DJ Mode
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* pause / play */}
            <button
              onClick={togglePause}
              className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-300 transition-all hover:bg-white/10"
            >
              {paused ? "▶ Play" : "❚❚"}
            </button>
            <button
              onClick={() => setShowYouTube((v) => !v)}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                showYouTube || youtubeVideoId
                  ? "border-red-400/50 bg-red-500/20 text-red-300"
                  : "border-white/15 bg-white/[0.06] text-slate-400 hover:bg-white/10"
              }`}
            >
              ▶ YT
            </button>
            <button
              onClick={() => toggleMic()}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                micActive
                  ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-300"
                  : "border-white/15 bg-white/[0.06] text-slate-400 hover:bg-white/10"
              }`}
            >
              {micActive ? "🎤 Live" : "🎤 Mic"}
            </button>
            <button
              onClick={() => stopDJ()}
              className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 transition-all hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        </div>

        {/* YouTube URL input panel (only when no video loaded yet) */}
        {showYouTube && !youtubeVideoId && (
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Stream through YouTube
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={ytInput}
                onChange={(e) => setYtInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLoadYouTube()}
                placeholder="Paste YouTube URL or video ID…"
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] text-white placeholder-slate-500 outline-none focus:border-red-400/40"
              />
              <button
                onClick={handleLoadYouTube}
                className="shrink-0 rounded-lg border border-red-400/30 bg-red-500/[0.1] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300 transition-all hover:bg-red-500/20"
              >
                Load
              </button>
            </div>
          </div>
        )}

        {/* capture button row (shown when video is loaded) */}
        {youtubeVideoId && (
          <div className="mb-3 flex items-center justify-center gap-2">
            <button
              onClick={handleCaptureTab}
              disabled={capturing || tabCaptured}
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                tabCaptured
                  ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300"
                  : capturing
                    ? "border-yellow-400/40 bg-yellow-500/10 text-yellow-300 animate-pulse"
                    : "border-cyan-400/30 bg-cyan-500/[0.1] text-cyan-300 hover:bg-cyan-500/20"
              }`}
            >
              {tabCaptured ? "✓ Audio Captured" : capturing ? "Select this tab…" : "🎙 Capture Tab Audio"}
            </button>
            <button
              onClick={() => { loadYouTube(""); setYtInput(""); }}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Change video
            </button>
          </div>
        )}

        {tabCaptured && (
          <p className="mb-2 text-center text-[9px] text-emerald-400/70">
            Audio captured — visuals are reacting to your stream.
          </p>
        )}

        {/* now playing */}
        <div className="mb-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
            ♫ Now Playing
          </p>
          <p className="font-display text-sm font-bold tracking-wide text-white/95">
            {trackLabel}
          </p>
          <p className="text-[10px] text-cyan-400/70">
            {bpmLabel}
          </p>
        </div>

        {/* equalizer bars */}
        <div className="mb-3 flex items-end justify-center gap-[2px] h-12">
          {bars.map((v, i) => {
            const hue =
              i < 10 ? 185 : i < 22 ? 270 : 210;
            return (
              <div
                key={i}
                className="w-[5px] rounded-t-sm"
                style={{
                  height: `${Math.max(3, v * 100)}%`,
                  backgroundColor: `hsla(${hue}, 80%, 65%, ${0.5 + v * 0.5})`,
                  boxShadow:
                    v > 0.5
                      ? `0 0 6px hsla(${hue}, 80%, 65%, 0.4)`
                      : "none",
                  transition: "height 0.06s ease-out",
                }}
              />
            );
          })}
        </div>

        {/* level meters */}
        <div className="flex justify-center gap-4">
          {[
            { label: "BASS", value: bassLevel, color: "rgb(34,211,238)" },
            { label: "MID", value: midLevel, color: "rgb(168,85,247)" },
            { label: "HIGH", value: highLevel, color: "rgb(99,182,255)" },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-1">
              <div className="h-16 w-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
                <div
                  className="w-full rounded-full transition-all duration-75"
                  style={{
                    height: `${m.value * 100}%`,
                    backgroundColor: m.color,
                    boxShadow: `0 0 8px ${m.color}66`,
                    marginTop: `${(1 - m.value) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[8px] font-bold tracking-wider text-slate-500">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── YouTube PiP window (bottom-right corner) ── */}
    {youtubeVideoId && (
      <div
        className="pointer-events-auto fixed bottom-20 right-4 z-50 overflow-hidden rounded-xl border border-red-400/25 bg-black/80 shadow-[0_0_40px_rgba(239,68,68,0.15)] backdrop-blur-xl"
        style={{
          width: 220,
          transform: `scale(${1 + bassLevel * 0.03})`,
          transition: "transform 0.08s ease-out",
        }}
      >
        {/* top bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${tabCaptured ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
              {tabCaptured ? "Live" : "YouTube"}
            </span>
          </div>
          <button
            onClick={() => { loadYouTube(""); setYtInput(""); }}
            className="text-[9px] text-slate-500 hover:text-red-400"
          >
            ✕
          </button>
        </div>
        {/* embedded player */}
        <div className="relative" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&controls=1`}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="YouTube player"
          />
        </div>
        {/* mini level bar */}
        <div className="flex items-end justify-center gap-[1px] px-2 py-1.5" style={{ height: 18 }}>
          {Array.from({ length: 16 }).map((_, i) => {
            const v = i < 5 ? bassLevel : i < 11 ? midLevel : highLevel;
            return (
              <div
                key={i}
                className="w-[3px] rounded-t-sm"
                style={{
                  height: `${Math.max(15, v * 100)}%`,
                  backgroundColor: i < 5 ? "rgb(34,211,238)" : i < 11 ? "rgb(168,85,247)" : "rgb(99,182,255)",
                  transition: "height 0.06s ease-out",
                }}
              />
            );
          })}
        </div>
      </div>
    )}
    </>
  );
}

/* ================================================================== */
/*  3D — LASERS                                                         */
/* ================================================================== */

const LASER_COUNT = 14;
const LASER_LENGTH = 35;
const LASER_COLORS = [
  "#22d3ee",
  "#a855f7",
  "#38bdf8",
  "#c084fc",
  "#06b6d4",
  "#818cf8",
];

export function DJLasers() {
  const { active, bassLevel, midLevel } = useDJ();
  const groupRef = useRef<THREE.Group>(null);
  const laserRefs = useRef<THREE.Mesh[]>([]);

  // spread: each laser fans out slightly from the center-Z axis
  const spread = useMemo(() => {
    return Array.from({ length: LASER_COUNT }, (_, i) => {
      const angle = ((i / LASER_COUNT) - 0.5) * Math.PI * 0.4; // fan ±36° horizontally
      const tilt = (((i % 3) / 2) - 0.5) * 0.15; // slight vertical spread
      return { angle, tilt };
    });
  }, []);

  const bassRef = useRef(0);
  const laserIntensity = useRef(0);

  useFrame((state, dt) => {
    if (!groupRef.current || !active) {
      if (groupRef.current) groupRef.current.visible = false;
      return;
    }
    const t = state.clock.elapsedTime;
    bassRef.current = bassLevel;

    // lasers activate on heavy bass — threshold at 0.35, ramp up to full at 0.6
    const BASS_THRESHOLD = 0.35;
    const BASS_PEAK = 0.6;
    const targetIntensity = bassLevel > BASS_THRESHOLD
      ? Math.min(1, (bassLevel - BASS_THRESHOLD) / (BASS_PEAK - BASS_THRESHOLD))
      : 0;
    // smooth ramp up fast, fade out slow for a punchy feel
    const speed = targetIntensity > laserIntensity.current ? 12 : 4;
    laserIntensity.current += (targetIntensity - laserIntensity.current) * Math.min(1, dt * speed);

    // hide the whole group when intensity is near zero
    if (laserIntensity.current < 0.01) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    for (let i = 0; i < LASER_COUNT; i++) {
      const mesh = laserRefs.current[i];
      if (!mesh) continue;
      const s = spread[i];
      const intensity = laserIntensity.current;

      // sweep left/right and tilt up/down — wider sweep when bass is strong
      const sweepX = Math.sin(t * (0.4 + (i % 3) * 0.15) + i * 1.3) * (0.12 + intensity * 0.35);
      const sweepY = Math.sin(t * 0.35 + i * 0.7) * (0.08 + intensity * 0.25);

      mesh.rotation.set(
        s.tilt + sweepY,
        s.angle + sweepX,
        0,
      );

      // opacity driven by bass intensity
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = intensity * (0.7 + Math.sin(t * 3 + i) * 0.15);

      // scale length with intensity
      mesh.scale.y = 1 + intensity * 0.8;
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef} visible={false}>
      {Array.from({ length: LASER_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) laserRefs.current[i] = el;
          }}
          position={[0, 0.1, 0]}
        >
          <cylinderGeometry args={[0.018, 0.018, LASER_LENGTH, 4]} />
          <meshBasicMaterial
            color={LASER_COLORS[i % LASER_COLORS.length]}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ================================================================== */
/*  3D — DANCE FLOOR                                                    */
/* ================================================================== */

const FLOOR_SIZE = 22;
const FLOOR_GRID = 18;

export function DJFloor() {
  const { active, bassLevel, midLevel } = useDJ();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const timeRef = useRef(0);

  useFrame((_, dt) => {
    if (!meshRef.current || !active) {
      if (meshRef.current) meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;
    timeRef.current += dt;
    const t = timeRef.current;

    const half = FLOOR_GRID / 2;
    const cellSize = FLOOR_SIZE / FLOOR_GRID;

    for (let x = 0; x < FLOOR_GRID; x++) {
      for (let z = 0; z < FLOOR_GRID; z++) {
        const idx = x * FLOOR_GRID + z;
        const wx = (x - half) * cellSize;
        const wz = (z - half) * cellSize;
        const dist = Math.sqrt(wx * wx + wz * wz);

        // wave from center
        const wave =
          Math.sin(dist * 0.6 - t * 4) * 0.5 + 0.5;
        const beat = bassLevel * 0.7 + wave * 0.3;

        dummy.position.set(wx, -3.8, wz);
        dummy.scale.set(cellSize * 0.88, 0.01, cellSize * 0.88);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx, dummy.matrix);

        // color: cyan near center, purple further out
        const hue = 0.5 + dist * 0.008 + midLevel * 0.1;
        const sat = 0.6 + beat * 0.4;
        const light = 0.15 + beat * 0.45;
        col.setHSL(hue % 1, sat, light);
        meshRef.current.setColorAt(idx, col);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
  });

  if (!active) return null;

  const total = FLOOR_GRID * FLOOR_GRID;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, total]} visible={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/* ================================================================== */
/*  3D — DISCO BALL                                                     */
/* ================================================================== */

export function DJDiscoBall() {
  const { active, bassLevel } = useDJ();
  const ref = useRef<THREE.Group>(null);
  const spotsRef = useRef<THREE.InstancedMesh>(null);
  const spotCount = 40;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const spotPositions = useMemo(() => {
    return Array.from({ length: spotCount }, () => ({
      radius: 8 + Math.random() * 16,
      angle: Math.random() * Math.PI * 2,
      y: (Math.random() - 0.5) * 10,
      speed: 0.3 + Math.random() * 0.8,
    }));
  }, []);

  useFrame((state, dt) => {
    if (!ref.current || !active) {
      if (ref.current) ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y += dt * 0.6;
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.15;

    // light spots
    if (spotsRef.current) {
      for (let i = 0; i < spotCount; i++) {
        const s = spotPositions[i];
        const a = s.angle + t * s.speed;
        dummy.position.set(
          Math.cos(a) * s.radius,
          s.y + Math.sin(t * 2 + i) * 0.5,
          Math.sin(a) * s.radius,
        );
        const sc = 0.08 + bassLevel * 0.15;
        dummy.scale.setScalar(sc);
        dummy.updateMatrix();
        spotsRef.current.setMatrixAt(i, dummy.matrix);
      }
      spotsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <group>
      <group ref={ref} position={[0, 3.5, 0]}>
        <mesh>
          <icosahedronGeometry args={[0.45, 1]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.95}
            roughness={0.05}
          />
        </mesh>
        {/* small mirror facets */}
        {Array.from({ length: 24 }).map((_, i) => {
          const phi = Math.acos(2 * ((i + 0.5) / 24) - 1);
          const theta = Math.PI * (1 + Math.sqrt(5)) * i;
          return (
            <mesh
              key={i}
              position={[
                0.47 * Math.sin(phi) * Math.cos(theta),
                0.47 * Math.cos(phi),
                0.47 * Math.sin(phi) * Math.sin(theta),
              ]}
              scale={[0.06, 0.06, 0.01]}
            >
              <planeGeometry />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>

      {/* reflected light spots */}
      <instancedMesh ref={spotsRef} args={[undefined, undefined, spotCount]}>
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}

/* ================================================================== */
/*  3D — BEAT PARTICLES                                                 */
/* ================================================================== */

const PARTICLE_COUNT = 60;

export function DJBeatParticles() {
  const { active, bassLevel } = useDJ();
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        radius: 2 + Math.random() * 12,
        angle: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * 8,
        speed: 0.2 + Math.random() * 0.6,
        ySpeed: 0.1 + Math.random() * 0.3,
        size: 0.03 + Math.random() * 0.06,
      })),
    [],
  );

  useFrame((state) => {
    if (!ref.current || !active) {
      if (ref.current) ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      const a = p.angle + t * p.speed;
      const r = p.radius + Math.sin(t * p.ySpeed + i) * 1.5;
      dummy.position.set(
        Math.cos(a) * r,
        p.y + Math.sin(t * p.ySpeed * 2 + i * 0.5) * 2,
        Math.sin(a) * r,
      );
      const s = p.size * (0.8 + bassLevel * 1.5);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);

      const hue = (0.5 + i * 0.01) % 1;
      col.setHSL(hue, 0.7, 0.6 + bassLevel * 0.3);
      ref.current.setColorAt(i, col);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor)
      ref.current.instanceColor.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
