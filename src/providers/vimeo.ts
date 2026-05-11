import { BaseProvider } from './base';
import type { FideoResolvedOptions } from '../types';
import { addUrlParams, normalizeVimeoEmbedUrl } from '../utils/dom';
import { loadScript } from '../utils/script';

interface VimeoPlayer {
  play(): Promise<void>;
  pause(): Promise<void>;
  setCurrentTime(seconds: number): Promise<number>;
  setVolume(volume: number): Promise<number>;
  setMuted(muted: boolean): Promise<boolean>;
  setPlaybackRate(rate: number): Promise<number>;
  loadVideo(options: { url: string }): Promise<number>;
  getCurrentTime(): Promise<number>;
  getDuration(): Promise<number>;
  getVolume(): Promise<number>;
  getMuted(): Promise<boolean>;
  getPlaybackRate(): Promise<number>;
  on(eventName: string, callback: (event?: Record<string, number | boolean>) => void): void;
  off(eventName: string): void;
  destroy(): Promise<void>;
}

declare global {
  interface Window {
    Vimeo?: {
      Player: new (element: HTMLIFrameElement) => VimeoPlayer;
    };
  }
}

export class VimeoProvider extends BaseProvider {
  readonly provider = 'vimeo' as const;
  private player?: VimeoPlayer;
  private ready: Promise<void>;

  constructor(
    readonly element: HTMLIFrameElement,
    private options: FideoResolvedOptions,
  ) {
    super();
    const params: Record<string, string | number | boolean> = {
      api: 1,
      controls: 0,
      playsinline: 1,
    };
    if (this.options.autoplay) params.autoplay = 1;
    if (this.options.muted) params.muted = 1;
    if (this.options.loop) params.loop = 1;
    if (this.options.background) params.background = 1;
    this.element.src = addUrlParams(normalizeVimeoEmbedUrl(this.element.src), params);

    this.ready = loadScript('https://player.vimeo.com/api/player.js').then(() => {
      this.player = new window.Vimeo!.Player(this.element);
      this.bind();
      return this.sync();
    });
  }

  async play(): Promise<void> {
    await this.ready;
    this.player?.play();
  }

  async pause(): Promise<void> {
    await this.ready;
    this.player?.pause();
  }

  async seek(time: number): Promise<void> {
    await this.ready;
    await this.player?.setCurrentTime(time);
    await this.sync();
  }

  async setVolume(volume: number): Promise<void> {
    await this.ready;
    await this.player?.setVolume(clamp(volume));
    await this.sync();
  }

  async setMuted(muted: boolean): Promise<void> {
    await this.ready;
    await this.player?.setMuted(muted);
    await this.sync();
  }

  async setPlaybackRate(rate: number): Promise<void> {
    await this.ready;
    await this.player?.setPlaybackRate(rate).catch(() => undefined);
    await this.sync();
  }

  async setSource(source: string): Promise<void> {
    await this.ready;
    await this.player?.loadVideo({ url: addUrlParams(normalizeVimeoEmbedUrl(source), this.providerParams()) });
    await this.sync();
  }

  destroy(): void {
    this.player?.destroy();
  }

  private bind(): void {
    const events = ['play', 'pause', 'ended', 'timeupdate', 'volumechange', 'durationchange', 'playbackratechange'];
    for (const eventName of events) {
      this.player?.on(eventName, (event = {}) => {
        this.applyEvent(eventName, event);
        this.dispatchEvent(new CustomEvent(eventName, { detail: this.getState() }));
        this.dispatchEvent(new CustomEvent('change', { detail: this.getState() }));
      });
    }
  }

  private applyEvent(eventName: string, event: Record<string, number | boolean>): void {
    this.state = {
      ...this.state,
      currentTime: typeof event.seconds === 'number' ? event.seconds : this.state.currentTime,
      duration: typeof event.duration === 'number' ? event.duration : this.state.duration,
      volume: typeof event.volume === 'number' ? event.volume : this.state.volume,
      muted: typeof event.muted === 'boolean' ? event.muted : this.state.muted,
      paused: eventName === 'play' ? false : eventName === 'pause' || eventName === 'ended' ? true : this.state.paused,
    };
  }

  private async sync(): Promise<void> {
    if (!this.player) return;
    const [currentTime, duration, volume, muted, playbackRate] = await Promise.all([
      this.player.getCurrentTime().catch(() => 0),
      this.player.getDuration().catch(() => 0),
      this.player.getVolume().catch(() => 1),
      this.player.getMuted().catch(() => false),
      this.player.getPlaybackRate().catch(() => 1),
    ]);
    this.update({ currentTime, duration, volume, muted, playbackRate });
  }

  private postMessage(method: string, value?: unknown): void {
    const targetOrigin = new URL(this.element.src, window.location.href).origin;
    this.element.contentWindow?.postMessage(JSON.stringify({ method, value }), targetOrigin);
  }

  private providerParams(): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {
      api: 1,
      controls: 0,
      playsinline: 1,
    };
    if (this.options.autoplay) params.autoplay = 1;
    if (this.options.muted) params.muted = 1;
    if (this.options.loop) params.loop = 1;
    if (this.options.background) params.background = 1;
    return params;
  }
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
