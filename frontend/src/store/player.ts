import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  user?: { name: string; handle: string };
  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };
  duration: number;
  play_count?: number;
  genre?: string;
}

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  loading: boolean;

  currentTrack: () => Track | null;
  playQueue: (tracks: Track[], startIndex: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  stop: () => void;
}

// URL del stream de Audius (se puede reproducir directamente en <audio>)
const streamUrl = (trackId: string) =>
  `https://api.audius.co/v1/tracks/${trackId}/stream?app_name=UrukaisKlick`;

// Elemento <audio> único, fuera de React
let audio: HTMLAudioElement | null = null;
let bound = false;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
    audio.preload = 'metadata';
  }
  return audio;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.5,
  loading: false,

  currentTrack: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < 0 || currentIndex >= queue.length) return null;
    return queue[currentIndex];
  },

  playQueue: (tracks, startIndex) => {
    const track = tracks[startIndex];
    if (!track) return;

    set({
      queue: tracks,
      currentIndex: startIndex,
      progress: 0,
      duration: track.duration ?? 0,
      loading: true,
    });

    const a = getAudio();
    a.src = streamUrl(track.id);
    a.volume = get().volume;
    a.play()
      .then(() => set({ isPlaying: true, loading: false }))
      .catch((err) => {
        console.error('Error al reproducir:', err);
        set({ isPlaying: false, loading: false });
      });
  },

  toggle: () => {
    const a = getAudio();
    if (!a.src) return;
    if (a.paused) {
      a.play()
        .then(() => set({ isPlaying: true }))
        .catch(() => {});
    } else {
      a.pause();
      set({ isPlaying: false });
    }
  },

  next: () => {
    const { queue, currentIndex } = get();
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      get().playQueue(queue, currentIndex + 1);
    } else {
      set({ isPlaying: false });
    }
  },

  prev: () => {
    const a = getAudio();
    if (a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    const { queue, currentIndex } = get();
    if (currentIndex > 0) {
      get().playQueue(queue, currentIndex - 1);
    }
  },

  seek: (seconds) => {
    const a = getAudio();
    a.currentTime = seconds;
    set({ progress: seconds });
  },

  setVolume: (v) => {
    const a = getAudio();
    a.volume = v;
    set({ volume: v });
  },

  stop: () => {
    const a = getAudio();
    a.pause();
    a.src = '';
    set({
      isPlaying: false,
      currentIndex: -1,
      queue: [],
      progress: 0,
      duration: 0,
    });
  },
}));

// Listeners globales (una sola vez)
function setupListeners() {
  if (bound) return;
  bound = true;
  const a = getAudio();

  a.addEventListener('timeupdate', () => {
    usePlayer.setState({ progress: a.currentTime });
  });

  a.addEventListener('loadedmetadata', () => {
    if (!isNaN(a.duration)) {
      usePlayer.setState({ duration: a.duration });
    }
  });

  a.addEventListener('ended', () => {
    usePlayer.getState().next();
  });

  a.addEventListener('play', () => {
    usePlayer.setState({ isPlaying: true });
  });

  a.addEventListener('pause', () => {
    usePlayer.setState({ isPlaying: false });
  });

  a.addEventListener('error', () => {
    console.error('Error de audio');
    usePlayer.setState({ isPlaying: false, loading: false });
  });
}

setupListeners();

// Helpers de formato
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
