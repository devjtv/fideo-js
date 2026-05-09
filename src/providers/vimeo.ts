import { BaseProvider } from './base';
import { addUrlParams } from '../utils/dom';
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

  constructor(readonly element: HTMLIFrameElement) {
    super();
    this.element.src = addUrlParams(this.element.src, {
      controls: 0,
      playsinline: 1,
    });

    this.ready = loadScript('https://player.vimeo.com/api/player.js').then(() => {
      this.player = new window.Vimeo!.Player(this.element);
      this.bind();
      return this.sync();
    });
  }

  async play(): Promise<void> {
    await this.ready;
    await this.player?.play();
  }

  async pause(): Promise<void> {
    await this.ready;
    await this.player?.pause();
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
    await this.player?.loadVideo({ url: source });
    await this.sync();
  }

  destroy(): void {
    this.player?.destroy();
  }

  private bind(): void {
    const events = ['play', 'pause', 'ended', 'timeupdate', 'volumechange', 'durationchange', 'playbackratechange'];
    for (const eventName of events) {
      this.player?.on(eventName, (event = {}) => {
        this.applyEvent(event);
        this.dispatchEvent(new CustomEvent(eventName, { detail: this.getState() }));
        this.dispatchEvent(new CustomEvent('change', { detail: this.getState() }));
      });
    }
  }

  private applyEvent(event: Record<string, number | boolean>): void {
    this.state = {
      ...this.state,
      currentTime: typeof event.seconds === 'number' ? event.seconds : this.state.currentTime,
      duration: typeof event.duration === 'number' ? event.duration : this.state.duration,
      volume: typeof event.volume === 'number' ? event.volume : this.state.volume,
      muted: typeof event.muted === 'boolean' ? event.muted : this.state.muted,
      paused: typeof event.paused === 'boolean' ? event.paused : this.state.paused,
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
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
