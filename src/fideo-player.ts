import type { FideoAdapter, FideoPlayerInstance, FideoResolvedOptions } from './types';
import { createProvider } from './providers';
import { FideoControls } from './ui';
import { getResponsiveValue } from './utils/dom';

export class FideoPlayer implements FideoPlayerInstance {
  readonly element: HTMLVideoElement | HTMLIFrameElement;
  readonly wrapper: HTMLElement;
  readonly options: FideoResolvedOptions;
  private adapter: FideoAdapter;
  private controls?: FideoControls;
  private observer?: IntersectionObserver;
  private currentSource?: string;
  private resizeController = new AbortController();

  constructor(element: HTMLVideoElement | HTMLIFrameElement, options: FideoResolvedOptions) {
    this.element = element;
    this.options = options;
    this.wrapper = this.wrapElement(element, options);
    this.configureElement();
    this.adapter = createProvider(options.provider, element);
    this.applyResponsiveMedia();

    if (options.controls) this.controls = new FideoControls(this.adapter, this.wrapper, options);
    this.bindAdapterEvents();
    this.bindResponsiveMedia();
    this.bindViewportPlayback();

    this.adapter.setVolume(options.volume);
    this.adapter.setMuted(options.muted);

    if (options.autoplay) {
      this.play().catch(() => undefined);
    }
  }

  play(): Promise<void> {
    return this.adapter.play();
  }

  pause(): Promise<void> {
    return this.adapter.pause();
  }

  destroy(): void {
    this.observer?.disconnect();
    this.resizeController.abort();
    this.controls?.destroy();
    this.adapter.destroy();
    this.wrapper.classList.remove('is-ready');
    this.element.removeAttribute('data-fideo-ready');
  }

  private wrapElement(element: HTMLVideoElement | HTMLIFrameElement, options: FideoResolvedOptions): HTMLElement {
    if (element.parentElement?.classList.contains('fideo')) {
      return element.parentElement;
    }

    const wrapper = document.createElement('div');
    wrapper.className = ['fideo', options.className].filter(Boolean).join(' ');
    element.before(wrapper);
    wrapper.append(element);
    return wrapper;
  }

  private configureElement(): void {
    this.wrapper.classList.add(`fideo--${this.options.provider}`);
    this.wrapper.classList.add('is-ready');
    this.element.classList.add('fideo__media');
    this.element.setAttribute('data-fideo-ready', 'true');

    for (const [name, value] of Object.entries(this.options.cssVars)) {
      this.wrapper.style.setProperty(name, value);
    }

    if (this.element instanceof HTMLVideoElement) {
      this.element.controls = false;
      this.element.loop = this.options.loop;
      this.element.muted = this.options.muted;
      this.element.playsInline = this.options.playsInline;
      this.element.setAttribute('playsinline', '');
    } else {
      this.element.allow = mergeAllow(this.element.allow, ['autoplay', 'fullscreen', 'picture-in-picture']);
      this.element.setAttribute('allowfullscreen', '');
    }
  }

  private bindAdapterEvents(): void {
    const events = ['play', 'pause', 'ended', 'timeupdate', 'volumechange', 'change'];
    for (const eventName of events) {
      this.adapter.addEventListener(eventName, () => {
        this.element.dispatchEvent(
          new CustomEvent(`fideo:${eventName}`, {
            bubbles: true,
            detail: {
              player: this,
              state: this.adapter.getState(),
            },
          }),
        );
      });
    }
  }

  private bindResponsiveMedia(): void {
    window.addEventListener('resize', () => this.applyResponsiveMedia(), {
      passive: true,
      signal: this.resizeController.signal,
    });
    window.addEventListener('orientationchange', () => this.applyResponsiveMedia(), {
      passive: true,
      signal: this.resizeController.signal,
    });
  }

  private applyResponsiveMedia(): void {
    const poster = getResponsiveValue(this.options.posters, this.options.breakpoints);
    if (poster && this.adapter.setPoster) this.adapter.setPoster(poster);

    const source = getResponsiveValue(this.options.sources, this.options.breakpoints);
    if (source && source !== this.currentSource) {
      this.currentSource = source;
      this.adapter.setSource(source);
    }
  }

  private bindViewportPlayback(): void {
    if (!this.options.viewport || !('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= this.options.viewportThreshold;
        if (visible && (this.options.viewport === 'play' || this.options.viewport === 'play-pause')) {
          this.play().catch(() => undefined);
        }
        if (!visible && (this.options.viewport === 'pause' || this.options.viewport === 'play-pause')) {
          this.pause().catch(() => undefined);
        }
      },
      {
        threshold: [0, this.options.viewportThreshold, 1],
      },
    );

    this.observer.observe(this.wrapper);
  }
}

function mergeAllow(existing: string, additions: string[]): string {
  const parts = new Set(
    existing
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean),
  );
  additions.forEach((part) => parts.add(part));
  return Array.from(parts).join('; ');
}
