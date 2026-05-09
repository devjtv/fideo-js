export type FideoProviderName = 'html5' | 'youtube' | 'vimeo' | 'wistia';

export type FideoViewportMode = false | 'play' | 'pause' | 'play-pause';

export interface FideoBreakpoints {
  mobile: number;
  tablet: number;
}

export interface FideoSources {
  desktop?: string;
  tablet?: string;
  mobile?: string;
}

export interface FideoPosters {
  desktop?: string;
  tablet?: string;
  mobile?: string;
}

export interface FideoIcons {
  play?: string;
  pause?: string;
  volume?: string;
  muted?: string;
  settings?: string;
  fullscreen?: string;
}

export interface FideoControlVisibility {
  play: boolean;
  timeline: boolean;
  currentTime: boolean;
  duration: boolean;
  volume: boolean;
  settings: boolean;
  fullscreen: boolean;
}

export interface FideoOptions {
  selector?: string;
  provider?: FideoProviderName | 'auto';
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  controlVisibility?: Partial<FideoControlVisibility>;
  viewport?: FideoViewportMode;
  viewportThreshold?: number;
  volume?: number;
  playbackRates?: number[];
  sources?: FideoSources;
  posters?: FideoPosters;
  breakpoints?: Partial<FideoBreakpoints>;
  icons?: FideoIcons;
  className?: string;
  cssVars?: Record<string, string>;
}

export interface FideoResolvedOptions extends Omit<FideoOptions, 'provider' | 'breakpoints' | 'controlVisibility'> {
  provider: FideoProviderName;
  selector: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  playsInline: boolean;
  controls: boolean;
  controlVisibility: FideoControlVisibility;
  viewport: FideoViewportMode;
  viewportThreshold: number;
  volume: number;
  playbackRates: number[];
  breakpoints: FideoBreakpoints;
  sources: FideoSources;
  posters: FideoPosters;
  icons: FideoIcons;
  className: string;
  cssVars: Record<string, string>;
}

export interface FideoState {
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  paused: boolean;
  playbackRate: number;
  buffered: number;
}

export interface FideoAdapter extends EventTarget {
  readonly element: HTMLVideoElement | HTMLIFrameElement;
  readonly provider: FideoProviderName;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(time: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  setPlaybackRate(rate: number): Promise<void>;
  setSource(source: string): Promise<void>;
  setPoster?(poster: string): void;
  getState(): FideoState;
  destroy(): void;
}

export interface FideoInitResult {
  players: FideoPlayerInstance[];
  destroy(): void;
}

export interface FideoPlayerInstance {
  readonly element: HTMLVideoElement | HTMLIFrameElement;
  readonly wrapper: HTMLElement;
  readonly options: FideoResolvedOptions;
  play(): Promise<void>;
  pause(): Promise<void>;
  destroy(): void;
}
