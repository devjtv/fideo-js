import { BaseProvider } from './base';
import type { FideoResolvedOptions } from '../types';
import { loadScript } from '../utils/script';

declare global {
  interface HTMLElementTagNameMap {
    'wistia-player': HTMLElement & {
      mediaId: string;
      play(): void;
      pause(): void;
      currentTime: number;
      duration: number;
      volume: number;
      muted: boolean;
      playbackRate: number;
      state: string;
    };
  }
}

export class WistiaProvider extends BaseProvider {
  readonly provider = 'wistia' as const;
  readonly element: HTMLIFrameElement;
  private player?: HTMLElement;
  private ready: Promise<void>;
  private mediaId: string;
  private destroyed = false;
  private readyResolver?: () => void;

  constructor(iframe: HTMLIFrameElement, private options: FideoResolvedOptions) {
    super();
    this.element = iframe;
    if (this.options.muted) this.state.muted = true;

    this.mediaId = getWistiaMediaId(iframe.src);

    const player = document.createElement('wistia-player');
    player.setAttribute('media-id', this.mediaId);
    player.setAttribute('aspect', '1.7777777777777777');

    if (this.options.controls !== false) {
      player.setAttribute('controls-visible-on-load', 'false');
    }
    if (this.options.autoplay) {
      player.setAttribute('auto-play', '');
    }
    if (this.options.muted) {
      player.setAttribute('muted', '');
    }
    if (this.options.loop) {
      player.setAttribute('end-video-behavior', 'loop');
    }
    if (this.options.background) {
      player.setAttribute('fit-strategy', 'cover');
    }

    player.classList.add('fideo__media');
    player.setAttribute('data-fideo-ready', 'true');
    player.style.position = 'relative';
    player.style.zIndex = '0';
    player.style.display = 'block';
    player.style.width = '100%';
    player.style.height = '100%';
    player.style.border = '0';

    iframe.before(player);
    iframe.remove();

    this.player = player;

    const embedScript = document.createElement('script');
    embedScript.src = `https://fast.wistia.com/embed/${this.mediaId}.js`;
    embedScript.type = 'module';
    embedScript.async = true;
    const loadEmbed = new Promise<void>((resolve, reject) => {
      embedScript.addEventListener('load', () => resolve());
      embedScript.addEventListener('error', () => reject(new Error(`Could not load Wistia embed ${this.mediaId}.`)));
    });
    document.head.appendChild(embedScript);

    this.ready = Promise.all([loadScript('https://fast.wistia.com/player.js'), loadEmbed]).then(
      () =>
        new Promise<void>((resolve) => {
          this.readyResolver = resolve;
          if (this.destroyed) {
            resolve();
            return;
          }
          player.addEventListener('api-ready', () => {
            if (this.destroyed) {
              resolve();
              return;
            }
            this.bind();
            this.sync();
            resolve();
          }, { once: true });
        }),
    );
  }

  async play(): Promise<void> {
    await this.ready;
    if (this.destroyed) return;
    (this.player as any)?.play();
  }

  async pause(): Promise<void> {
    await this.ready;
    if (this.destroyed) return;
    (this.player as any)?.pause();
  }

  async seek(time: number): Promise<void> {
    await this.ready;
    if (this.destroyed) return;
    if (this.player) (this.player as any).currentTime = time;
    this.sync();
  }

  async setVolume(volume: number): Promise<void> {
    await this.ready;
    if (this.destroyed) return;
    if (this.player) (this.player as any).volume = clamp(volume);
    this.sync('volumechange');
  }

  async setMuted(muted: boolean): Promise<void> {
    await this.ready;
    if (this.destroyed) return;
    if (this.player) (this.player as any).muted = muted;
    this.sync('volumechange');
  }

  async setPlaybackRate(rate: number): Promise<void> {
    await this.ready;
    if (this.destroyed) return;
    if (this.player) (this.player as any).playbackRate = rate;
    this.sync();
  }

  async setSource(source: string): Promise<void> {
    if (this.destroyed) return;
    const newId = getWistiaMediaId(source);
    if (newId && this.player) {
      (this.player as any).mediaId = newId;
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.player?.remove();
    this.readyResolver?.();
  }

  private bind(): void {
    const p = this.player;
    if (!p) return;

    p.addEventListener('play', () => {
      this.update({ paused: false }, 'play');
    });
    p.addEventListener('pause', () => {
      this.update({ paused: true }, 'pause');
    });
    p.addEventListener('ended', () => {
      this.update({ paused: true }, 'ended');
    });
    p.addEventListener('time-update', () => {
      if (!this.player) return;
      const ct = (this.player as any).currentTime ?? 0;
      this.update({ currentTime: ct }, 'timeupdate');
    });
    p.addEventListener('volume-change', () => {
      this.sync();
    });
    p.addEventListener('mute-change', () => {
      this.sync();
    });
  }

  private sync(eventName = 'change'): void {
    if (!this.player) return;
    const p = this.player as any;
    this.update({
      currentTime: p.currentTime ?? 0,
      duration: p.duration ?? 0,
      volume: p.volume ?? 1,
      muted: p.muted ?? false,
      playbackRate: p.playbackRate ?? 1,
    }, eventName);
  }
}

function getWistiaMediaId(src: string): string {
  return src.match(/(?:medias|iframe)\/([a-zA-Z0-9]+)/)?.[1] ?? '';
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
