import './styles.css';
import { FideoPlayer } from './fideo-player';
import type { FideoAdapter, FideoInitResult, FideoOptions, FideoPlayerInstance, FideoResolvedOptions, FideoTarget } from './types';
import { DEFAULT_SELECTOR, resolveOptions } from './utils/dom';

const instances = new WeakMap<Element, FideoPlayer>();

export class Fideo implements FideoPlayerInstance {
  private player: FideoPlayerInstance;

  constructor(target: FideoTarget, options: FideoOptions = {}) {
    this.player = mountFideo(resolveTarget(target), options);
  }

  get element(): HTMLVideoElement | HTMLIFrameElement {
    return this.player.element;
  }

  get wrapper(): HTMLElement {
    return this.player.wrapper;
  }

  get options(): FideoResolvedOptions {
    return this.player.options;
  }

  get adapter(): FideoAdapter {
    return this.player.adapter;
  }

  play(): Promise<void> {
    return this.player.play();
  }

  pause(): Promise<void> {
    return this.player.pause();
  }

  destroy(): void {
    this.player.destroy();
  }

  static init(options: FideoOptions = {}): FideoInitResult {
    return initFideo(options);
  }

  static mount(element: HTMLVideoElement | HTMLIFrameElement, options: FideoOptions = {}): FideoPlayerInstance {
    return mountFideo(element, options);
  }
}

export function createFideo(target: FideoTarget, options: FideoOptions = {}): FideoPlayerInstance {
  return mountFideo(resolveTarget(target), options);
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
  const player = new FideoPlayer(element, resolved, (destroyedElement, destroyedPlayer) => {
    if (instances.get(destroyedElement) === destroyedPlayer) {
      instances.delete(destroyedElement);
    }
  });
  instances.set(element, player);
  return player;
}

function resolveTarget(target: FideoTarget): HTMLVideoElement | HTMLIFrameElement {
  const element = typeof target === 'string' ? document.querySelector(target) : target;

  if (element instanceof HTMLVideoElement || element instanceof HTMLIFrameElement) {
    return element;
  }

  throw new Error('Fideo target must resolve to a <video> or <iframe> element.');
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
  FideoTarget,
  FideoViewportMode,
} from './types';

if (typeof window !== 'undefined') {
  Object.assign(window, { Fideo, createFideo, initFideo, mountFideo });
  if (!isModuleScriptImport()) {
    document.addEventListener('DOMContentLoaded', () => {
      const opts = (window as any).__fideoAutoInit || {};
      initFideo(opts);
    });
  }
}

function isModuleScriptImport(): boolean {
  return typeof document !== 'undefined' && document.currentScript == null;
}
