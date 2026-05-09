import { BaseProvider } from './base';
import { loadScript } from '../utils/script';

interface WistiaVideo {
  play(): void;
  pause(): void;
  time(seconds?: number): number;
  duration(): number;
  volume(value?: number): number;
  muted(): boolean;
  mute(): void;
  unmute(): void;
  playbackRate?(rate?: number): number;
  bind(eventName: string, callback: () => void): void;
  unbind(eventName: string): void;
}

declare global {
  interface Window {
    _wq?: Array<Record<string, unknown>>;
  }
}

export class WistiaProvider extends BaseProvider {
  readonly provider = 'wistia' as const;
  private video?: WistiaVideo;
  private ready: Promise<void>;
  private timer?: number;

  constructor(readonly element: HTMLIFrameElement) {
    super();
    const mediaId = getWistiaMediaId(element.src);
    this.ready = new Promise((resolve) => {
      window._wq = window._wq || [];
      window._wq.push({
        id: mediaId || '_all',
        onReady: (video: WistiaVideo) => {
          this.video = video;
          this.bind();
          this.sync();
          resolve();
        },
      });
    });
    loadScript('https://fast.wistia.com/assets/external/E-v1.js').catch(() => undefined);
  }

  async play(): Promise<void> {
    await this.ready;
    this.video?.play();
  }

  async pause(): Promise<void> {
    await this.ready;
    this.video?.pause();
  }

  async seek(time: number): Promise<void> {
    await this.ready;
    this.video?.time(time);
    this.sync();
  }

  async setVolume(volume: number): Promise<void> {
    await this.ready;
    this.video?.volume(clamp(volume));
    this.sync();
  }

  async setMuted(muted: boolean): Promise<void> {
    await this.ready;
    if (muted) this.video?.mute();
    else this.video?.unmute();
    this.sync();
  }

  async setPlaybackRate(rate: number): Promise<void> {
    await this.ready;
    this.video?.playbackRate?.(rate);
    this.sync();
  }

  async setSource(source: string): Promise<void> {
    this.element.src = source;
  }

  destroy(): void {
    if (this.timer) window.clearInterval(this.timer);
    this.video?.unbind('play');
    this.video?.unbind('pause');
    this.video?.unbind('end');
    this.video?.pause();
  }

  private bind(): void {
    this.video?.bind('play', () => {
      this.startTimer();
      this.dispatchEvent(new CustomEvent('play', { detail: this.getState() }));
    });
    this.video?.bind('pause', () => {
      this.stopTimer();
      this.dispatchEvent(new CustomEvent('pause', { detail: this.getState() }));
    });
    this.video?.bind('end', () => {
      this.stopTimer();
      this.dispatchEvent(new CustomEvent('ended', { detail: this.getState() }));
    });
  }

  private sync(): void {
    if (!this.video) return;
    this.update({
      currentTime: this.video.time() || 0,
      duration: this.video.duration() || 0,
      volume: this.video.volume(),
      muted: this.video.muted(),
      playbackRate: this.video.playbackRate?.() || 1,
    });
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

function getWistiaMediaId(src: string): string | undefined {
  return src.match(/(?:medias|iframe)\/([a-zA-Z0-9]+)/)?.[1];
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
