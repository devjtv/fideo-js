import type {
  FideoBreakpoints,
  FideoControlVisibility,
  FideoOptions,
  FideoPosters,
  FideoProviderName,
  FideoResolvedOptions,
  FideoSources,
  FideoViewportMode,
} from '../types';

const DEFAULT_BREAKPOINTS: FideoBreakpoints = {
  mobile: 767,
  tablet: 1024,
};

const TRUE_VALUES = new Set(['', 'true', '1', 'yes', 'on']);
const FALSE_VALUES = new Set(['false', '0', 'no', 'off']);

export const DEFAULT_SELECTOR = '[data-fideo]';

const DEFAULT_CONTROL_VISIBILITY: FideoControlVisibility = {
  play: true,
  timeline: true,
  currentTime: true,
  duration: true,
  volume: true,
  settings: true,
  fullscreen: true,
};

export function boolFromAttr(value: string | null | undefined, fallback: boolean): boolean {
  if (value == null) return fallback;
  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return fallback;
}

export function numberFromAttr(value: string | null | undefined, fallback: number): number {
  if (value == null || value.trim() === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function ratioFromValue(value: string | number | null | undefined, fallback: number): number {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : fallback;
  if (value == null || value.trim() === '') return fallback;

  const normalized = value.trim();
  const parts = normalized.split(/[:/]/).map((part) => Number(part.trim()));

  if (parts.length === 2 && parts.every((part) => Number.isFinite(part) && part > 0)) {
    return parts[0] / parts[1];
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function splitRates(value: string | null | undefined, fallback: number[]): number[] {
  if (!value) return fallback;
  const rates = value
    .split(',')
    .map((rate) => Number(rate.trim()))
    .filter((rate) => Number.isFinite(rate) && rate > 0);
  return rates.length ? rates : fallback;
}

export function inferProvider(
  element: HTMLVideoElement | HTMLIFrameElement,
  sources: FideoSources = {},
): FideoProviderName {
  if (element instanceof HTMLVideoElement) return 'html5';

  const candidates = [element.getAttribute('src') || element.src, sources.desktop, sources.tablet, sources.mobile].filter(
    (src): src is string => Boolean(src),
  );

  for (const src of candidates) {
    if (/youtube(?:-nocookie)?\.com|youtu\.be/i.test(src)) return 'youtube';
    if (/vimeo\.com/i.test(src)) return 'vimeo';
    if (/wistia\.(?:com|net)|fast\.wistia/i.test(src)) return 'wistia';
  }

  return 'html5';
}

export function parseViewportMode(value: string | null | undefined, fallback: FideoViewportMode): FideoViewportMode {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (FALSE_VALUES.has(normalized) || normalized === 'none') return false;
  if (normalized === 'play' || normalized === 'pause' || normalized === 'play-pause') return normalized;
  if (TRUE_VALUES.has(normalized)) return 'play-pause';
  return fallback;
}

export function readSources(element: HTMLElement): FideoSources {
  const data = element.dataset;
  return {
    desktop: data.fideoSrcDesktop || data.fideoSrc || undefined,
    tablet: data.fideoSrcTablet || undefined,
    mobile: data.fideoSrcMobile || undefined,
  };
}

export function readPosters(element: HTMLElement): FideoPosters {
  const data = element.dataset;
  return {
    desktop: data.fideoPosterDesktop || data.fideoPoster || undefined,
    tablet: data.fideoPosterTablet || undefined,
    mobile: data.fideoPosterMobile || undefined,
  };
}

export function resolveOptions(
  element: HTMLVideoElement | HTMLIFrameElement,
  options: FideoOptions = {},
): FideoResolvedOptions {
  const data = element.dataset;
  const breakpoints = {
    mobile: numberFromAttr(data.fideoBreakpointMobile, options.breakpoints?.mobile ?? DEFAULT_BREAKPOINTS.mobile),
    tablet: numberFromAttr(data.fideoBreakpointTablet, options.breakpoints?.tablet ?? DEFAULT_BREAKPOINTS.tablet),
  };
  const providerAttr = data.fideoProvider as FideoProviderName | 'auto' | undefined;
  const requestedProvider = options.provider ?? providerAttr ?? 'auto';
  const sources = { ...readSources(element), ...options.sources };
  const provider = requestedProvider === 'auto' ? inferProvider(element, sources) : requestedProvider;
  const viewportFallback = options.viewport ?? false;
  const background = boolFromAttr(data.fideoBackground, options.background ?? false);

  return {
    selector: options.selector ?? DEFAULT_SELECTOR,
    provider,
    autoplay: background || boolFromAttr(data.fideoAutoplay, options.autoplay ?? false),
    muted: background || boolFromAttr(data.fideoMuted, options.muted ?? false),
    loop: background || boolFromAttr(data.fideoLoop, options.loop ?? false),
    playsInline: background || boolFromAttr(data.fideoPlaysinline ?? data.fideoPlaysInline, options.playsInline ?? true),
    controls: boolFromAttr(data.fideoControls, options.controls ?? !background),
    background,
    controlVisibility: resolveControlVisibility(element, options.controlVisibility),
    viewport: parseViewportMode(data.fideoViewport, viewportFallback),
    viewportThreshold: numberFromAttr(data.fideoViewportThreshold, options.viewportThreshold ?? 0.35),
    volume: numberFromAttr(data.fideoVolume, options.volume ?? 1),
    playbackRates: splitRates(data.fideoPlaybackRates, options.playbackRates ?? [0.5, 1, 1.25, 1.5, 2]),
    backgroundAspectRatio: ratioFromValue(data.fideoBackgroundAspectRatio ?? options.backgroundAspectRatio, 16 / 9),
    sources,
    posters: { ...readPosters(element), ...options.posters },
    breakpoints,
    icons: options.icons ?? {},
    className: data.fideoClass || options.className || '',
    cssVars: {
      ...readCssVars(element),
      ...(options.cssVars ?? {}),
    },
    disabledProviders: options.disabledProviders ?? [],
  };
}

export function resolveControlVisibility(
  element: HTMLElement,
  options: Partial<FideoControlVisibility> = {},
): FideoControlVisibility {
  const data = element.dataset;
  const timeFallback = boolFromAttr(data.fideoShowTime, true);

  return {
    play: boolFromAttr(data.fideoShowPlay, options.play ?? DEFAULT_CONTROL_VISIBILITY.play),
    timeline: boolFromAttr(data.fideoShowTimeline, options.timeline ?? DEFAULT_CONTROL_VISIBILITY.timeline),
    currentTime: boolFromAttr(
      data.fideoShowCurrentTime,
      options.currentTime ?? timeFallback ?? DEFAULT_CONTROL_VISIBILITY.currentTime,
    ),
    duration: boolFromAttr(data.fideoShowDuration, options.duration ?? timeFallback ?? DEFAULT_CONTROL_VISIBILITY.duration),
    volume: boolFromAttr(data.fideoShowVolume, options.volume ?? DEFAULT_CONTROL_VISIBILITY.volume),
    settings: boolFromAttr(data.fideoShowSettings, options.settings ?? DEFAULT_CONTROL_VISIBILITY.settings),
    fullscreen: boolFromAttr(data.fideoShowFullscreen, options.fullscreen ?? DEFAULT_CONTROL_VISIBILITY.fullscreen),
  };
}

export function readCssVars(element: HTMLElement): Record<string, string> {
  const vars: Record<string, string> = {};
  const entries: Array<[string, string | undefined]> = [
    ['--fideo-accent', element.dataset.fideoAccent],
    ['--fideo-control-bg', element.dataset.fideoControlBg],
    ['--fideo-control-color', element.dataset.fideoControlColor],
    ['--fideo-track', element.dataset.fideoTrack],
    ['--fideo-track-fill', element.dataset.fideoTrackFill],
    ['--fideo-radius', element.dataset.fideoRadius],
  ];

  for (const [name, value] of entries) {
    if (value) vars[name] = value;
  }

  return vars;
}

export function getResponsiveValue<T extends FideoSources | FideoPosters>(
  values: T,
  breakpoints: FideoBreakpoints,
  width = window.innerWidth,
): string | undefined {
  if (width <= breakpoints.mobile) return values.mobile ?? values.tablet ?? values.desktop;
  if (width <= breakpoints.tablet) return values.tablet ?? values.desktop ?? values.mobile;
  return values.desktop ?? values.tablet ?? values.mobile;
}

export function addUrlParams(url: string, params: Record<string, string | number | boolean>): string {
  if (!url) return url;
  const parsed = new URL(url, window.location.href);
  for (const [key, value] of Object.entries(params)) {
    parsed.searchParams.set(key, String(value));
  }
  return parsed.toString();
}

export function normalizeYouTubeEmbedUrl(url: string): string {
  if (!url) return url;

  const parsed = new URL(url, window.location.href);
  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  let videoId: string | undefined;

  if (host === 'youtu.be') {
    videoId = parsed.pathname.split('/').filter(Boolean)[0];
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts[0] === 'embed') videoId = parts[1];
    if (parts[0] === 'watch') videoId = parsed.searchParams.get('v') ?? undefined;
    if (parts[0] === 'shorts') videoId = parts[1];
  }

  if (!videoId) {
    parsed.hostname = 'www.youtube-nocookie.com';
    return parsed.toString();
  }

  const normalized = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
  parsed.searchParams.forEach((value, key) => {
    if (key !== 'v') normalized.searchParams.set(key, value);
  });
  return normalized.toString();
}

export function normalizeVimeoEmbedUrl(url: string): string {
  if (!url) return url;

  const parsed = new URL(url, window.location.href);
  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  const parts = parsed.pathname.split('/').filter(Boolean);

  if (host === 'player.vimeo.com') {
    return parsed.toString();
  }

  if (host !== 'vimeo.com' || !parts[0]) {
    return parsed.toString();
  }

  const [videoId, hash] = parts;
  const normalized = new URL(`https://player.vimeo.com/video/${videoId}`);
  parsed.searchParams.forEach((value, key) => normalized.searchParams.set(key, value));
  if (hash && !normalized.searchParams.has('h')) normalized.searchParams.set('h', hash);

  return normalized.toString();
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
}

export function ensureElementId(element: HTMLElement, prefix = 'fideo'): string {
  if (!element.id) {
    element.id = `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }
  return element.id;
}
