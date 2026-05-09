import { BaseProvider } from './base';

export class Html5Provider extends BaseProvider {
  readonly provider = 'html5' as const;

  constructor(readonly element: HTMLVideoElement) {
    super();
    this.syncFromElement();
    this.bind();
  }

  async play(): Promise<void> {
    await this.element.play();
  }

  async pause(): Promise<void> {
    this.element.pause();
  }

  async seek(time: number): Promise<void> {
    this.element.currentTime = time;
  }

  async setVolume(volume: number): Promise<void> {
    this.element.volume = clamp(volume);
  }

  async setMuted(muted: boolean): Promise<void> {
    this.element.muted = muted;
  }

  async setPlaybackRate(rate: number): Promise<void> {
    this.element.playbackRate = rate;
  }

  async setSource(source: string): Promise<void> {
    if (this.element.currentSrc === source || this.element.src === source) return;
    const wasPaused = this.element.paused;
    this.element.src = source;
    this.element.load();
    if (!wasPaused) await this.play().catch(() => undefined);
  }

  setPoster(poster: string): void {
    this.element.poster = poster;
  }

  destroy(): void {
    this.element.pause();
  }

  private bind(): void {
    const events = ['play', 'pause', 'timeupdate', 'durationchange', 'loadedmetadata', 'volumechange', 'ratechange', 'progress', 'ended'];
    for (const eventName of events) {
      this.element.addEventListener(eventName, () => {
        this.syncFromElement();
        this.dispatchEvent(new CustomEvent(eventName, { detail: this.getState() }));
        this.dispatchEvent(new CustomEvent('change', { detail: this.getState() }));
      });
    }
  }

  private syncFromElement(): void {
    const duration = Number.isFinite(this.element.duration) ? this.element.duration : 0;
    const bufferedEnd = this.element.buffered.length ? this.element.buffered.end(this.element.buffered.length - 1) : 0;
    this.state = {
      currentTime: this.element.currentTime || 0,
      duration,
      volume: this.element.volume,
      muted: this.element.muted,
      paused: this.element.paused,
      playbackRate: this.element.playbackRate,
      buffered: duration > 0 ? bufferedEnd / duration : 0,
    };
  }
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
