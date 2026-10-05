// Low-Latency Audio Engine for Persona 3 Reload UI
let audioCtx: AudioContext | null = null;
let sfxAudioBuffer: AudioBuffer | null = null;
let closeMenuAudioBuffer: AudioBuffer | null = null;
let menuUtamaAudioBuffer: AudioBuffer | null = null;

const sfxAudioPool: HTMLAudioElement[] = [];
const closeMenuAudioPool: HTMLAudioElement[] = [];
const menuUtamaAudioPool: HTMLAudioElement[] = [];
let sfxPoolIndex = 0;
let closeMenuPoolIndex = 0;
let menuUtamaPoolIndex = 0;

let hasMenuUtamaSFXPlayed = false;
let isAudioInitialized = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass({ latencyHint: "interactive" });
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function initAudioEngine() {
  if (typeof window === "undefined" || isAudioInitialized) return;
  isAudioInitialized = true;

  // Pre-create light fallback HTMLAudioElement pools
  for (let i = 0; i < 3; i++) {
    const a = new Audio("/sfx/navigation.wav");
    a.preload = "auto";
    a.volume = 0.6;
    sfxAudioPool.push(a);

    const b = new Audio("/sfx/close-menu.mp3");
    b.preload = "auto";
    b.volume = 0.75;
    closeMenuAudioPool.push(b);

    const c = new Audio("/sfx/menu-utama.mp3");
    c.preload = "auto";
    c.volume = 0.95;
    menuUtamaAudioPool.push(c);
  }

  loadAudioBuffers();

  const unlock = () => {
    unlockAudioEngine();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
}

export async function loadAudioBuffers() {
  if (typeof window === "undefined") return;
  try {
    const ctx = getAudioContext();
    const [navRes, closeRes, menuRes] = await Promise.all([
      fetch("/sfx/navigation.wav"),
      fetch("/sfx/close-menu.mp3"),
      fetch("/sfx/menu-utama.mp3")
    ]);

    if (ctx) {
      if (navRes.ok && !sfxAudioBuffer) {
        const buf = await navRes.arrayBuffer();
        sfxAudioBuffer = await ctx.decodeAudioData(buf);
      }
      if (closeRes.ok && !closeMenuAudioBuffer) {
        const buf = await closeRes.arrayBuffer();
        closeMenuAudioBuffer = await ctx.decodeAudioData(buf);
      }
      if (menuRes.ok && !menuUtamaAudioBuffer) {
        const buf = await menuRes.arrayBuffer();
        menuUtamaAudioBuffer = await ctx.decodeAudioData(buf);
      }
    }
  } catch (_) {}
}

interface AudioChannelOptions {
  buffer: AudioBuffer | null;
  staticElId?: string;
  pool: HTMLAudioElement[];
  getPoolIdx: () => number;
  setPoolIdx: (v: number) => void;
  volume?: number;
  onPlaySuccess?: () => void;
}

function playAudioChannel({
  buffer,
  staticElId,
  pool,
  getPoolIdx,
  setPoolIdx,
  volume = 0.6,
  onPlaySuccess
}: AudioChannelOptions): boolean {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "running" && buffer) {
    try {
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      if (onPlaySuccess) onPlaySuccess();
      return true;
    } catch (_) {}
  }

  if (staticElId) {
    const el = document.getElementById(staticElId) as HTMLAudioElement | null;
    if (el) {
      try {
        el.currentTime = 0;
        el.volume = volume;
        const p = el.play();
        if (p !== undefined) {
          p.then(() => {
            if (onPlaySuccess) onPlaySuccess();
          }).catch(() => {});
        }
        return true;
      } catch (_) {}
    }
  }

  if (pool && pool.length > 0) {
    try {
      const idx = getPoolIdx();
      const sound = pool[idx];
      sound.currentTime = 0;
      sound.volume = volume;
      const sp = sound.play();
      if (sp !== undefined) {
        sp.then(() => {
          if (onPlaySuccess) onPlaySuccess();
        }).catch(() => {});
      }
      setPoolIdx((idx + 1) % pool.length);
      return true;
    } catch (_) {}
  }
  return false;
}

export function playSFX() {
  playAudioChannel({
    buffer: sfxAudioBuffer,
    staticElId: "sfx-navigation-el",
    pool: sfxAudioPool,
    getPoolIdx: () => sfxPoolIndex,
    setPoolIdx: (v) => {
      sfxPoolIndex = v;
    },
    volume: 0.6
  });
}

export function playCloseMenuSFX() {
  playAudioChannel({
    buffer: closeMenuAudioBuffer,
    staticElId: "sfx-close-menu-el",
    pool: closeMenuAudioPool,
    getPoolIdx: () => closeMenuPoolIndex,
    setPoolIdx: (v) => {
      closeMenuPoolIndex = v;
    },
    volume: 0.75
  });
}

export async function playMenuUtamaSFX(force = false) {
  if (hasMenuUtamaSFXPlayed && !force) return true;
  const ctx = getAudioContext();
  if (ctx && ctx.state !== "running") {
    try {
      await ctx.resume();
    } catch (_) {}
  }
  return playAudioChannel({
    buffer: menuUtamaAudioBuffer,
    staticElId: "sfx-menu-utama-el",
    pool: menuUtamaAudioPool,
    getPoolIdx: () => menuUtamaPoolIndex,
    setPoolIdx: (v) => {
      menuUtamaPoolIndex = v;
    },
    volume: 0.95,
    onPlaySuccess: () => {
      hasMenuUtamaSFXPlayed = true;
    }
  });
}

export async function unlockAudioEngine() {
  const ctx = getAudioContext();
  if (ctx) {
    if (ctx.state !== "running") {
      try {
        await ctx.resume();
      } catch (_) {}
    }
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (_) {}
  }
}

// --------------------------------------------------------------------------
// Background Music (Persona 3 Reload - Full Moon, Full Life)
// --------------------------------------------------------------------------
let bgmAudio: HTMLAudioElement | null = null;
let isBgmPlaying = false;
const BGM_DEFAULT_VOLUME = 0.22; // Comfortable subtle ambient volume

export function playBGM(volume = BGM_DEFAULT_VOLUME) {
  if (typeof window === "undefined") return;
  if (!bgmAudio) {
    bgmAudio = new Audio("/sfx/bgm.mp3");
    bgmAudio.loop = true;
    bgmAudio.preload = "auto";
  }
  bgmAudio.volume = volume;
  const playPromise = bgmAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isBgmPlaying = true;
      })
      .catch(() => {});
  }
}

export function pauseBGM() {
  if (bgmAudio && !bgmAudio.paused) {
    bgmAudio.pause();
    isBgmPlaying = false;
  }
}

export function toggleBGM(): boolean {
  if (!bgmAudio) {
    playBGM();
    return true;
  }
  if (bgmAudio.paused) {
    playBGM();
    return true;
  } else {
    pauseBGM();
    return false;
  }
}

export function isBGMActive(): boolean {
  return bgmAudio ? !bgmAudio.paused : false;
}
