import './styles.css';
import { FideoPlayer } from './fideo-player';
import type { FideoInitResult, FideoOptions, FideoPlayerInstance } from './types';
import { DEFAULT_SELECTOR, resolveOptions } from './utils/dom';

const instances = new WeakMap<Element, FideoPlayer>();

export class Fideo {
  static init(options: FideoOptions = {}): FideoInitResult {
    return initFideo(options);
  }

  static mount(element: HTMLVideoElement | HTMLIFrameElement, options: FideoOptions = {}): FideoPlayerInstance {
    return mountFideo(element, options);
  }
}

export function initFideo(options: FideoOptions = {}): FideoInitResult {
  const selector = options.selector ?? DEFAULT_SELECTOR;
  const elements = Array.from(document.querySelectorAll<HTMLVideoElement | HTMLIFrameElement>(selector)).filter(
    (element) => element instanceof HTMLVideoElement || element instanceof HTMLIFrameElement,
  );
  const players = elements.map((element) => mountFideo(element, options));

  return {
    players,
    destroy() {
      players.forEach((player) => player.destroy());
    },
  };
}

export function mountFideo(
  element: HTMLVideoElement | HTMLIFrameElement,
  options: FideoOptions = {},
): FideoPlayerInstance {
  const existing = instances.get(element);
  if (existing) return existing;

  const resolved = resolveOptions(element, options);
  const player = new FideoPlayer(element, resolved);
  instances.set(element, player);
  return player;
}

export type {
  FideoAdapter,
  FideoBreakpoints,
  FideoControlVisibility,
  FideoIcons,
  FideoInitResult,
  FideoOptions,
  FideoPlayerInstance,
  FideoPosters,
  FideoProviderName,
  FideoResolvedOptions,
  FideoSources,
  FideoState,
  FideoViewportMode,
} from './types';

if (typeof window !== 'undefined') {
  Object.assign(window, { Fideo, initFideo, mountFideo });
  document.addEventListener('DOMContentLoaded', () => {
    initFideo();
  });
}
