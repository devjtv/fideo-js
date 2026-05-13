import { BaseProvider } from './base';
import type { FideoResolvedOptions } from '../types';
import { addUrlParams, ensureElementId, normalizeYouTubeEmbedUrl } from '../utils/dom';

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

  constructor(
    readonly element: HTMLIFrameElement,
    private options: FideoResolvedOptions,
  ) {
    super();
    if (this.options.muted) this.state.muted = true;
    const normalizedUrl = normalizeYouTubeEmbedUrl(this.element.src);
    const params: Record<string, string | number | boolean> = {
      enablejsapi: 1,
      playsinline: 1,
      controls: 0,
      rel: 0,
      origin: window.location.origin,
    };
    if (this.options.autoplay) params.autoplay = 1;
    if (this.options.muted) params.mute = 1;
    if (this.options.loop) {
      params.loop = 1;
      const videoId = getYouTubeEmbedId(normalizedUrl);
      if (videoId) params.playlist = videoId;
    }
    this.element.src = addUrlParams(normalizedUrl, params);
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
    const normalizedUrl = normalizeYouTubeEmbedUrl(source);
    const videoId = getYouTubeEmbedId(normalizedUrl);
    const url = this.options.loop && videoId ? addUrlParams(normalizedUrl, { loop: 1, playlist: videoId }) : normalizedUrl;
    this.player?.loadVideoByUrl(url);
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
  }

  private sync(): void {
    if (!this.player) return;
    const duration = this.player.getDuration?.() || 0;
    const paused = this.state.paused;
    this.state = {
      currentTime: this.player.getCurrentTime?.() || 0,
      duration,
      volume: (this.player.getVolume?.() ?? 100) / 100,
      muted: this.player.isMuted?.() ?? false,
      paused,
      playbackRate: this.player.getPlaybackRate?.() || 1,
      buffered: 0,
    };
  }

  private startTimer(): void {
    this.state.paused = false;
    if (this.timer) return;
    this.timer = window.setInterval(() => {
      this.sync();
      this.dispatchEvent(new CustomEvent('timeupdate', { detail: this.getState() }));
    }, 250);
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

function getYouTubeEmbedId(url: string): string | undefined {
  if (!url) return undefined;
  const parsed = new URL(url, window.location.href);
  const parts = parsed.pathname.split('/').filter(Boolean);
  return parts[0] === 'embed' ? parts[1] : undefined;
}
