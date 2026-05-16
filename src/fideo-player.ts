import type { FideoAdapter, FideoPlayerInstance, FideoResolvedOptions } from './types';
import { createProvider } from './providers';
import { FideoControls } from './ui';
import { getResponsiveValue } from './utils/dom';

export class FideoPlayer implements FideoPlayerInstance {
  readonly element: HTMLVideoElement | HTMLIFrameElement;
  readonly wrapper: HTMLElement;
  readonly options: FideoResolvedOptions;
  readonly adapter: FideoAdapter;
  private controls?: FideoControls;
  private observer?: IntersectionObserver;
  private currentSource?: string;
  private resizeController = new AbortController();
  private lifecycleController = new AbortController();
  private activityTimer?: number;
  private resizeObserver?: ResizeObserver;
  private posterImage?: HTMLImageElement;
  private clickTarget?: HTMLButtonElement;
  private destroyed = false;
  private handleFullscreenChange = () => {
    const isFullscreen = document.fullscreenElement === this.wrapper;
    this.wrapper.classList.toggle('is-fullscreen', isFullscreen);
    if (this.options.background) {
      this.applyBackgroundCover();
    }
  };

  constructor(
    element: HTMLVideoElement | HTMLIFrameElement,
    options: FideoResolvedOptions,
    private onDestroy?: (element: HTMLVideoElement | HTMLIFrameElement, player: FideoPlayer) => void,
  ) {
    this.element = element;
    this.options = options;
    this.wrapper = this.wrapElement(element, options);
    this.configureElement();
    this.adapter = createProvider(options.provider, element, options);
    this.applyResponsiveMedia();

    if (options.controls) this.controls = new FideoControls(this.adapter, this.wrapper, options);
    this.bindAdapterEvents();
    this.bindClickToToggle();
    this.bindResponsiveMedia();
    this.bindBackgroundCover();
    this.bindViewportPlayback();
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);

    this.adapter.setVolume(options.volume).catch(() => undefined);
    this.adapter.setMuted(options.muted).catch(() => undefined);

    if (options.autoplay && !options.background) {
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
    if (this.destroyed) return;
    this.destroyed = true;
    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
    this.resizeController.abort();
    this.lifecycleController.abort();
    this.controls?.destroy();
    this.adapter.destroy();
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    if (this.activityTimer) window.clearTimeout(this.activityTimer);
    this.wrapper.classList.remove('is-ready');
    this.wrapper.classList.remove('has-poster', 'is-poster-visible');
    this.element.removeAttribute('data-fideo-ready');
    this.element.classList.remove('fideo__media');
    this.posterImage?.remove();
    this.clickTarget?.remove();
    if (this.element.parentElement === this.wrapper) {
      this.wrapper.before(this.element);
    }
    this.wrapper.remove();
    this.onDestroy?.(this.element, this);
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
    if (this.options.background) this.wrapper.classList.add('fideo--background');
    if (!this.options.controls) this.wrapper.classList.add('fideo--no-controls');
    this.wrapper.classList.add('is-ready');
    this.wrapper.classList.add('is-paused');
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
      this.element.preload = this.options.preload;
      this.element.setAttribute('playsinline', '');
    } else {
      this.element.allow = mergeAllow(this.element.allow, ['autoplay', 'fullscreen', 'picture-in-picture', 'encrypted-media']);
      this.element.setAttribute('allowfullscreen', '');
    }
  }

  private bindAdapterEvents(): void {
    const events = ['play', 'pause', 'ended', 'timeupdate', 'volumechange', 'change'];
    for (const eventName of events) {
      this.adapter.addEventListener(eventName, () => {
        this.syncPosterVisibility();
        this.syncPlaybackClasses();
        if (eventName === 'play') this.clearActivity();
        if (eventName === 'pause' || eventName === 'ended') this.wrapper.classList.remove('is-user-active');
        this.element.dispatchEvent(
          new CustomEvent(`fideo:${eventName}`, {
            bubbles: true,
            detail: {
              player: this,
              state: this.adapter.getState(),
            },
          }),
        );
      }, { signal: this.lifecycleController.signal });
    }
  }

  private bindClickToToggle(): void {
    if (!this.options.controls) return;

    const clickTarget = document.createElement('button');
    clickTarget.className = 'fideo__click-target';
    clickTarget.type = 'button';
    clickTarget.ariaLabel = 'Play or pause video';
    this.clickTarget = clickTarget;
    this.wrapper.prepend(clickTarget);

    clickTarget.addEventListener('click', () => {
      const state = this.adapter.getState();
      this.activateControls();
      if (state.paused) this.play().catch(() => undefined);
      else this.pause().catch(() => undefined);
    }, { signal: this.lifecycleController.signal });

    this.wrapper.addEventListener('pointermove', () => this.activateControls(), {
      passive: true,
      signal: this.lifecycleController.signal,
    });
    this.wrapper.addEventListener('pointerleave', () => this.clearActivity(), {
      passive: true,
      signal: this.lifecycleController.signal,
    });
  }

  private syncPlaybackClasses(): void {
    const paused = this.adapter.getState().paused;
    this.wrapper.classList.toggle('is-playing', !paused);
    this.wrapper.classList.toggle('is-paused', paused);
  }

  private activateControls(duration = 1800): void {
    this.wrapper.classList.add('is-user-active');
    if (this.activityTimer) window.clearTimeout(this.activityTimer);
    if (!duration || this.adapter.getState().paused) return;
    this.activityTimer = window.setTimeout(() => {
      this.wrapper.classList.remove('is-user-active');
    }, duration);
  }

  private clearActivity(): void {
    if (this.activityTimer) window.clearTimeout(this.activityTimer);
    if (!this.adapter.getState().paused) this.wrapper.classList.remove('is-user-active');
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
    window.addEventListener('resize', () => this.applyBackgroundCover(), {
      passive: true,
      signal: this.resizeController.signal,
    });
    window.addEventListener('orientationchange', () => this.applyBackgroundCover(), {
      passive: true,
      signal: this.resizeController.signal,
    });
  }

  private applyResponsiveMedia(): void {
    const poster = getResponsiveValue(this.options.posters, this.options.breakpoints);
    if (this.adapter.setPoster) this.adapter.setPoster(poster ?? '');
    this.applyPosterOverlay(poster);

    const source = getResponsiveValue(this.options.sources, this.options.breakpoints);
    if (source && source !== this.currentSource) {
      this.currentSource = source;
      this.syncPosterVisibility();
      this.adapter.setSource(source);
    }
  }

  private bindViewportPlayback(): void {
    const viewportMode = this.options.viewport || (this.options.background && this.options.autoplay ? 'play-pause' : false);
    if (!viewportMode) return;
    if (!('IntersectionObserver' in window)) {
      if (viewportMode === 'play' || viewportMode === 'play-pause') this.play().catch(() => undefined);
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= this.options.viewportThreshold;
        if (visible && (viewportMode === 'play' || viewportMode === 'play-pause')) {
          this.play().catch(() => undefined);
        }
        if (!visible && (viewportMode === 'pause' || viewportMode === 'play-pause')) {
          this.pause().catch(() => undefined);
        }
      },
      {
        threshold: [0, this.options.viewportThreshold, 1],
      },
    );

    this.observer.observe(this.wrapper);
  }

  private bindBackgroundCover(): void {
    if (!this.options.background) return;

    this.applyBackgroundCover();

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.applyBackgroundCover());
      this.resizeObserver.observe(this.wrapper);
    }
  }

  private applyBackgroundCover(): void {
    const isFullscreen = document.fullscreenElement === this.wrapper;
    if (isFullscreen) {
      this.element.style.width = '';
      this.element.style.height = '';
      this.element.style.left = '';
      this.element.style.top = '';
      return;
    }
    if (!this.options.background || this.element instanceof HTMLVideoElement || this.options.provider === 'wistia') return;

    const width = this.wrapper.clientWidth;
    const height = this.wrapper.clientHeight;
    if (!width || !height) return;

    const containerRatio = width / height;
    const mediaRatio = this.options.backgroundAspectRatio;
    let mediaWidth = width;
    let mediaHeight = height;

    if (containerRatio > mediaRatio) {
      mediaHeight = width / mediaRatio;
    } else {
      mediaWidth = height * mediaRatio;
    }

    this.element.style.width = `${mediaWidth}px`;
    this.element.style.height = `${mediaHeight}px`;
    this.element.style.left = `${(width - mediaWidth) / 2}px`;
    this.element.style.top = `${(height - mediaHeight) / 2}px`;
  }

  private applyPosterOverlay(poster?: string): void {
    if (!poster) {
      this.posterImage?.remove();
      this.posterImage = undefined;
      this.wrapper.classList.remove('has-poster', 'is-poster-visible');
      return;
    }

    const posterImage = this.ensurePosterImage();
    if (posterImage.getAttribute('src') !== poster) posterImage.src = poster;
    this.wrapper.classList.add('has-poster');
    this.syncPosterVisibility();
  }

  private ensurePosterImage(): HTMLImageElement {
    if (this.posterImage) return this.posterImage;

    const posterImage = document.createElement('img');
    posterImage.className = 'fideo__poster';
    posterImage.alt = '';
    posterImage.setAttribute('aria-hidden', 'true');
    posterImage.decoding = 'async';
    this.wrapper.insertBefore(posterImage, this.element.nextSibling);
    this.posterImage = posterImage;
    return posterImage;
  }

  private syncPosterVisibility(): void {
    const hasPoster = Boolean(this.posterImage?.getAttribute('src'));
    const showPoster = hasPoster && this.adapter.getState().paused;
    this.wrapper.classList.toggle('has-poster', hasPoster);
    this.wrapper.classList.toggle('is-poster-visible', showPoster);
  }
}

function mergeAllow(existing: string | undefined, additions: string[]): string {
  const parts = new Set(
    (existing ?? '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean),
  );
  additions.forEach((part) => parts.add(part));
  return Array.from(parts).join('; ');
}
