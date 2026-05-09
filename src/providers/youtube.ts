import { BaseProvider } from './base';
import { addUrlParams, ensureElementId } from '../utils/dom';

type YouTubeState = -1 | 0 | 1 | 2 | 3 | 5;

interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  setPlaybackRate(rate: number): void;
  loadVideoByUrl(url: string): void;
  getCurrentTime(): number;
  getDuration(): number;
  getVolume(): number;
  isMuted(): boolean;
  getPlaybackRate(): number;
  destroy(): void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          events?: {
            onReady?: () => void;
            onStateChange?: (event: { data: YouTubeState }) => void;
          };
        },
      ) => YouTubePlayer;
      PlayerState: {
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | undefined;

export class YouTubeProvider extends BaseProvider {
  readonly provider = 'youtube' as const;
  private player?: YouTubePlayer;
  private ready: Promise<void>;
  private readyResolver?: () => void;
  private timer?: number;

  constructor(readonly element: HTMLIFrameElement) {
    super();
    this.element.src = addUrlParams(this.element.src, {
      enablejsapi: 1,
      playsinline: 1,
      controls: 0,
      rel: 0,
      origin: window.location.origin,
    });
    const id = ensureElementId(this.element, 'fideo-youtube');

    this.ready = new Promise((resolve) => {
      this.readyResolver = resolve;
    });

    loadYouTubeApi().then(() => {
      this.player = new window.YT!.Player(id, {
        events: {
          onReady: () => {
            this.sync();
            this.readyResolver?.();
          },
          onStateChange: ({ data }) => this.handleStateChange(data),
        },
      });
    });
  }

  async play(): Promise<void> {
    await this.ready;
    this.player?.playVideo();
  }

  async pause(): Promise<void> {
    await this.ready;
    this.player?.pauseVideo();
  }

  async seek(time: number): Promise<void> {
    await this.ready;
    this.player?.seekTo(time, true);
    this.sync();
  }

  async setVolume(volume: number): Promise<void> {
    await this.ready;
    this.player?.setVolume(Math.round(clamp(volume) * 100));
    this.sync();
  }

  async setMuted(muted: boolean): Promise<void> {
    await this.ready;
    if (muted) this.player?.mute();
    else this.player?.unMute();
    this.sync();
  }

  async setPlaybackRate(rate: number): Promise<void> {
    await this.ready;
    this.player?.setPlaybackRate(rate);
    this.sync();
  }

  async setSource(source: string): Promise<void> {
    await this.ready;
    this.player?.loadVideoByUrl(source);
  }

  destroy(): void {
    if (this.timer) window.clearInterval(this.timer);
    this.player?.destroy();
  }

  private handleStateChange(state: YouTubeState): void {
    this.sync();
    if (state === 1) {
      this.startTimer();
      this.dispatchEvent(new CustomEvent('play', { detail: this.getState() }));
    }
    if (state === 2) {
      this.stopTimer();
      this.dispatchEvent(new CustomEvent('pause', { detail: this.getState() }));
    }
    if (state === 0) {
      this.stopTimer();
      this.dispatchEvent(new CustomEvent('ended', { detail: this.getState() }));
    }
    this.dispatchEvent(new CustomEvent('change', { detail: this.getState() }));
  }

  private sync(): void {
    if (!this.player) return;
    const duration = this.player.getDuration?.() || 0;
    this.state = {
      currentTime: this.player.getCurrentTime?.() || 0,
      duration,
      volume: (this.player.getVolume?.() ?? 100) / 100,
      muted: this.player.isMuted?.() ?? false,
      paused: this.state.paused,
      playbackRate: this.player.getPlaybackRate?.() || 1,
      buffered: 0,
    };
    this.dispatchEvent(new CustomEvent('change', { detail: this.getState() }));
  }

  private startTimer(): void {
    this.state.paused = false;
    if (this.timer) return;
    this.timer = window.setInterval(() => this.sync(), 500);
  }

  private stopTimer(): void {
    this.state.paused = true;
    if (this.timer) window.clearInterval(this.timer);
    this.timer = undefined;
  }
}

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<void>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => reject(new Error('Could not load the YouTube IFrame API.'));
    document.head.append(script);
  });

  return youtubeApiPromise;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
