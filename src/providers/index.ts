import type { FideoAdapter, FideoProviderName, FideoResolvedOptions, FideoState } from '../types';
import { Html5Provider } from './html5';
import { VimeoProvider } from './vimeo';
import { WistiaProvider } from './wistia';
import { YouTubeProvider } from './youtube';

export function createProvider(
  provider: FideoProviderName,
  element: HTMLVideoElement | HTMLIFrameElement,
  options: FideoResolvedOptions,
): FideoAdapter {
  if (options.disabledProviders.includes(provider)) {
    throw new Error(`Fideo provider "${provider}" is disabled via disabledProviders.`);
  }

  if (provider === 'html5') {
    if (!(element instanceof HTMLVideoElement)) {
      throw new Error('Fideo html5 provider needs a <video> element.');
    }
    return new Html5Provider(element);
  }

  if (!(element instanceof HTMLIFrameElement)) {
    throw new Error(`Fideo ${provider} provider needs an <iframe> element.`);
  }

  if (options.lazy) return new LazyIframeProvider(provider, element, options);

  return createIframeProvider(provider, element, options);
}

function createIframeProvider(
  provider: Exclude<FideoProviderName, 'html5'>,
  element: HTMLIFrameElement,
  options: FideoResolvedOptions,
): FideoAdapter {
  if (provider === 'youtube') return new YouTubeProvider(element, options);
  if (provider === 'vimeo') return new VimeoProvider(element, options);
  return new WistiaProvider(element, options);
}

class LazyIframeProvider extends EventTarget implements FideoAdapter {
  readonly element: HTMLIFrameElement;
  readonly provider: Exclude<FideoProviderName, 'html5'>;
  private adapter?: FideoAdapter;
  private observer?: IntersectionObserver;
  private source: string;
  private destroyed = false;
  private pendingVolume: number;
  private pendingMuted: boolean;
  private state: FideoState;

  constructor(provider: Exclude<FideoProviderName, 'html5'>, element: HTMLIFrameElement, private options: FideoResolvedOptions) {
    super();
    this.provider = provider;
    this.element = element;
    this.source = element.getAttribute('src') || element.src;
    this.pendingVolume = options.volume;
    this.pendingMuted = options.muted;
    this.state = {
      currentTime: 0,
      duration: 0,
      volume: options.volume,
      muted: options.muted,
      paused: true,
      playbackRate: 1,
      buffered: 0,
    };

    if (this.source) {
      element.dataset.fideoLazySrc = this.source;
      element.removeAttribute('src');
    }

    this.observe();
  }

  async play(): Promise<void> {
    const adapter = await this.init();
    await adapter?.play();
  }

  async pause(): Promise<void> {
    if (!this.adapter) {
      this.update({ paused: true }, 'pause');
      return;
    }
    await this.adapter.pause();
  }

  async seek(time: number): Promise<void> {
    const adapter = await this.init();
    await adapter?.seek(time);
  }

  async setVolume(volume: number): Promise<void> {
    this.pendingVolume = clamp(volume);
    if (!this.adapter) {
      this.update({ volume: this.pendingVolume }, 'volumechange');
      return;
    }
    await this.adapter.setVolume(volume);
  }

  async setMuted(muted: boolean): Promise<void> {
    this.pendingMuted = muted;
    if (!this.adapter) {
      this.update({ muted }, 'volumechange');
      return;
    }
    await this.adapter.setMuted(muted);
  }

  async setPlaybackRate(rate: number): Promise<void> {
    const adapter = await this.init();
    await adapter?.setPlaybackRate(rate);
  }

  async setSource(source: string): Promise<void> {
    this.source = source;
    this.element.dataset.fideoLazySrc = source;
    if (!this.adapter) return;
    await this.adapter.setSource(source);
  }

  getState(): FideoState {
    return this.adapter?.getState() ?? { ...this.state };
  }

  destroy(): void {
    this.destroyed = true;
    this.observer?.disconnect();
    this.adapter?.destroy();
    if (!this.adapter) this.element.removeAttribute('src');
  }

  private observe(): void {
    if (!('IntersectionObserver' in window)) {
      this.init().catch(() => undefined);
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          this.init().catch(() => undefined);
        }
      },
      { rootMargin: this.options.lazyRootMargin, threshold: 0 },
    );
    this.observer.observe(this.element);
  }

  private async init(): Promise<FideoAdapter | undefined> {
    if (this.adapter || this.destroyed) return this.adapter;
    this.observer?.disconnect();
    if (this.source) this.element.src = this.source;

    const eagerOptions = { ...this.options, lazy: false };
    const adapter = createIframeProvider(this.provider, this.element, eagerOptions);
    this.adapter = adapter;
    this.bindAdapter(adapter);
    await adapter.setVolume(this.pendingVolume).catch(() => undefined);
    await adapter.setMuted(this.pendingMuted).catch(() => undefined);
    return adapter;
  }

  private bindAdapter(adapter: FideoAdapter): void {
    const events = ['play', 'pause', 'ended', 'timeupdate', 'volumechange', 'change', 'durationchange'];
    for (const eventName of events) {
      adapter.addEventListener(eventName, () => {
        this.state = adapter.getState();
        this.dispatchEvent(new CustomEvent(eventName, { detail: this.getState() }));
      });
    }
  }

  private update(patch: Partial<FideoState>, eventName = 'change'): void {
    this.state = { ...this.state, ...patch };
    this.dispatchEvent(new CustomEvent(eventName, { detail: this.getState() }));
  }
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
