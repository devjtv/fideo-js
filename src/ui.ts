import stylesheet from './styles.css?inline';
import { defaultIcons } from './icons';
import type { FideoAdapter, FideoResolvedOptions, FideoState } from './types';
import { createElement } from './utils/dom';

export class FideoControls {
  readonly element: HTMLElement;
  private playButton: HTMLButtonElement;
  private muteButton: HTMLButtonElement;
  private track: HTMLInputElement;
  private volume: HTMLInputElement;
  private currentTime: HTMLElement;
  private duration: HTMLElement;
  private fullscreenButton: HTMLButtonElement;
  private speedMenu: HTMLElement;
  private volumeGroup: HTMLElement;
  private volumePanel: HTMLElement;
  private settingsGroup: HTMLElement;
  private seeking = false;
  private smoothFrame?: number;
  private smoothStartState?: FideoState;
  private smoothStartMs = 0;
  private lastAudibleVolume = 1;
  private volumeQueue = Promise.resolve();
  private volumeMutationDepth = 0;
  private icons: Required<NonNullable<FideoResolvedOptions['icons']>>;
  private handleFullscreenChange = () => this.renderFullscreenState();

  private onAdapterPlay = () => {
    const state = this.adapter.getState();
    this.syncPlayState(state);
    this.startSmoothProgress(state);
  };
  private onAdapterPause = () => {
    const state = this.adapter.getState();
    this.syncPlayState(state);
    this.stopSmoothProgress();
    this.syncPlaybackState(state, true);
  };
  private onAdapterEnded = () => {
    const state = this.adapter.getState();
    this.syncPlayState(state);
    this.stopSmoothProgress();
    this.syncPlaybackState(state, true);
  };
  private onAdapterVolumeChange = () => {
    if (this.volumeMutationDepth > 0) return;
    this.syncVolumeState(this.adapter.getState());
  };
  private onAdapterDurationChange = () => this.syncPlaybackState(this.adapter.getState(), true);
  private onAdapterTimeUpdate = () => {
    const state = this.adapter.getState();
    this.syncPlaybackState(state);
    if (!state.paused) this.startSmoothProgress(state);
  };
  private onAdapterChange = () => {
    const state = this.adapter.getState();
    this.syncPlaybackState(state);
    if (state.paused) this.stopSmoothProgress();
    else this.startSmoothProgress(state);
  };
  private onDocumentClick = (e: MouseEvent) => this.closeMenus(e);

  constructor(private adapter: FideoAdapter, private wrapper: HTMLElement, options: FideoResolvedOptions) {
    this.icons = { ...defaultIcons, ...options.icons };
    this.element = createElement('div', 'fideo__controls');
    const root = this.element.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = stylesheet;
    root.appendChild(style);
    this.playButton = this.button('fideo__button fideo__play', 'Play', this.icons.play, 'play-button');
    this.muteButton = this.button('fideo__button fideo__mute', 'Mute', this.icons.volume, 'mute-button');
    this.track = this.range('fideo__track', 0, 1000, 1, 'timeline');
    this.volume = this.range('fideo__volume', 0, 1, 0.01, 'volume-slider');
    this.currentTime = createElement('span', 'fideo__time');
    this.currentTime.setAttribute('part', 'current-time');
    this.duration = createElement('span', 'fideo__time');
    this.duration.setAttribute('part', 'duration');
    this.speedMenu = this.createSpeedMenu(options.playbackRates);
    this.fullscreenButton = this.button('fideo__button', 'Fullscreen', this.icons.fullscreen, 'fullscreen-button');

    const settings = this.button('fideo__button fideo__settings-toggle', 'Settings', this.icons.settings, 'settings-button');
    const timeline = createElement('div', 'fideo__timeline');
    timeline.append(this.track);

    const timeGroup = createElement('span', 'fideo__time-group');
    const separator = createElement('span', 'fideo__time-separator');
    separator.textContent = '/';
    timeGroup.append(this.currentTime, separator, this.duration);

    this.volumeGroup = createElement('div', 'fideo__volume-group');
    this.volumePanel = createElement('div', 'fideo__volume-panel');
    this.volumePanel.append(this.volume);
    this.volumeGroup.append(this.muteButton, this.volumePanel);

    this.settingsGroup = createElement('div', 'fideo__settings');
    this.settingsGroup.append(settings, this.speedMenu);

    const primaryControls = createElement('div', 'fideo__control-row');
    const spacer = createElement('span', 'fideo__spacer');

    if (options.controlVisibility.play) primaryControls.append(this.playButton);
    if (options.controlVisibility.currentTime || options.controlVisibility.duration) primaryControls.append(timeGroup);
    primaryControls.append(spacer);
    if (options.controlVisibility.volume) primaryControls.append(this.volumeGroup);
    if (options.controlVisibility.settings) primaryControls.append(this.settingsGroup);
    if (options.controlVisibility.fullscreen) primaryControls.append(this.fullscreenButton);

    root.appendChild(primaryControls);
    if (options.controlVisibility.timeline) root.appendChild(timeline);
    this.wrapper.append(this.element);

    if (!options.controlVisibility.currentTime) this.currentTime.remove();
    if (!options.controlVisibility.duration) this.duration.remove();
    if (!options.controlVisibility.currentTime || !options.controlVisibility.duration) separator.remove();

    this.playButton.addEventListener('click', () => this.togglePlay());
    this.muteButton.addEventListener('click', () => this.toggleMute());
    this.volume.addEventListener('input', () => this.changeVolume());
    this.track.addEventListener('pointerdown', () => {
      this.seeking = true;
      this.syncPlaybackState(this.adapter.getState(), true);
    });
    this.track.addEventListener('input', () => this.previewSeek());
    this.track.addEventListener('change', () => this.commitSeek());
    this.track.addEventListener('pointerup', () => {
      this.seeking = false;
    });
    this.track.addEventListener('pointercancel', () => {
      this.seeking = false;
    });
    settings.addEventListener('click', () => {
      this.wrapper.classList.add('is-user-active');
      this.settingsGroup.classList.toggle('is-open');
    });
    this.volumeGroup.addEventListener('click', (e) => {
      if (e.target !== this.volume && e.target !== this.muteButton) {
        this.wrapper.classList.add('is-user-active');
        this.volumeGroup.classList.toggle('is-open');
      }
    });
    this.fullscreenButton.addEventListener('click', () => {
      this.wrapper.classList.add('is-user-active');
      this.toggleFullscreen();
    });

    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('click', this.onDocumentClick);

    this.adapter.addEventListener('play', this.onAdapterPlay);
    this.adapter.addEventListener('pause', this.onAdapterPause);
    this.adapter.addEventListener('ended', this.onAdapterEnded);
    this.adapter.addEventListener('volumechange', this.onAdapterVolumeChange);
    this.adapter.addEventListener('durationchange', this.onAdapterDurationChange);
    this.adapter.addEventListener('timeupdate', this.onAdapterTimeUpdate);
    this.adapter.addEventListener('change', this.onAdapterChange);

    const state = this.adapter.getState();
    this.syncPlayState(state);
    this.syncVolumeState(state);
    this.syncPlaybackState(state, true);
    this.renderFullscreenState();
  }

  destroy(): void {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('click', this.onDocumentClick);
    this.adapter.removeEventListener('play', this.onAdapterPlay);
    this.adapter.removeEventListener('pause', this.onAdapterPause);
    this.adapter.removeEventListener('ended', this.onAdapterEnded);
    this.adapter.removeEventListener('volumechange', this.onAdapterVolumeChange);
    this.adapter.removeEventListener('durationchange', this.onAdapterDurationChange);
    this.adapter.removeEventListener('timeupdate', this.onAdapterTimeUpdate);
    this.adapter.removeEventListener('change', this.onAdapterChange);
    this.stopSmoothProgress();
    this.element.remove();
  }

  private button(className: string, label: string, icon: string, part?: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = className;
    button.type = 'button';
    button.ariaLabel = label;
    button.title = label;
    button.innerHTML = icon;
    if (part) button.setAttribute('part', part);
    return button;
  }

  private range(className: string, min: number, max: number, step: number, part?: string): HTMLInputElement {
    const input = document.createElement('input');
    input.className = className;
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    if (part) input.setAttribute('part', part);
    return input;
  }

  private createSpeedMenu(rates: number[]): HTMLElement {
    const menu = createElement('div', 'fideo__settings-menu');
    menu.setAttribute('part', 'settings-menu');
    for (const rate of rates) {
      const button = this.button('fideo__speed', `${rate}x`, '', 'speed-button');
      button.textContent = `${rate}x`;
      button.addEventListener('click', () => {
        this.wrapper.classList.add('is-user-active');
        this.adapter.setPlaybackRate(rate).catch(() => undefined);
        menu.parentElement?.classList.remove('is-open');
      });
      menu.append(button);
    }
    return menu;
  }

  private closeMenus(event: MouseEvent): void {
    const path = event.composedPath();
    if (!path.some((el) => el instanceof Node && (this.settingsGroup === el || this.settingsGroup.contains(el)))) {
      this.settingsGroup.classList.remove('is-open');
    }
    if (!path.some((el) => el instanceof Node && (this.volumeGroup === el || this.volumeGroup.contains(el)))) {
      this.volumeGroup.classList.remove('is-open');
    }
  }

  private togglePlay(): void {
    this.wrapper.classList.add('is-user-active');
    const state = this.adapter.getState();
    if (state.paused) this.adapter.play().catch(() => undefined);
    else this.adapter.pause().catch(() => undefined);
  }

  private toggleMute(): void {
    this.wrapper.classList.add('is-user-active');
    const state = this.adapter.getState();
    const nextMuted = !state.muted;
    const nextVolume = !nextMuted && state.volume === 0 ? this.lastAudibleVolume : state.volume;
    const optimisticState = { ...state, muted: nextMuted, volume: nextVolume };

    this.enqueueVolumeMutation(optimisticState, async () => {
      if (!nextMuted && state.volume === 0) {
        await this.adapter.setVolume(nextVolume);
      }
      await this.adapter.setMuted(nextMuted);
    });
  }

  private changeVolume(): void {
    this.wrapper.classList.add('is-user-active');
    const state = this.adapter.getState();
    const volume = clampVolume(Number(this.volume.value));
    const muted = volume === 0;

    if (volume > 0) this.lastAudibleVolume = volume;
    this.enqueueVolumeMutation({ ...state, volume, muted }, async () => {
      await this.adapter.setVolume(volume);
      await this.adapter.setMuted(muted);
    });
  }

  private previewSeek(): void {
    this.wrapper.classList.add('is-user-active');
    const state = this.adapter.getState();
    this.setTrackProgress(Number(this.track.value));
    if (!state.duration) return;
    this.currentTime.textContent = formatTime((Number(this.track.value) / 1000) * state.duration);
  }

  private commitSeek(): void {
    this.wrapper.classList.add('is-user-active');
    const state = this.adapter.getState();
    this.seeking = false;
    if (!state.duration) return;
    this.adapter.seek((Number(this.track.value) / 1000) * state.duration).catch(() => undefined);
    this.startSmoothProgress(this.adapter.getState());
  }

  private toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    this.wrapper.requestFullscreen?.();
  }

  private syncPlayState(state: FideoState): void {
    const playIcon = state.paused ? this.icons.play : this.icons.pause;
    const playLabel = state.paused ? 'Play' : 'Pause';
    if (this.playButton.innerHTML !== playIcon) {
      this.playButton.innerHTML = playIcon;
    }
    if (this.playButton.ariaLabel !== playLabel) {
      this.playButton.ariaLabel = playLabel;
    }
    if (this.playButton.title !== playLabel) {
      this.playButton.title = playLabel;
    }
  }

  private syncVolumeState(state: FideoState): void {
    const volume = clampVolume(state.volume);
    if (!state.muted && volume > 0) this.lastAudibleVolume = volume;
    this.volume.value = String(state.muted ? 0 : volume);
    this.volume.style.setProperty('--fideo-progress', `${Number(this.volume.value) * 100}%`);

    let muteIcon = state.muted || volume === 0 ? this.icons.muted : this.icons.volume;
    if (!state.muted && volume > 0 && volume <= 0.5) muteIcon = this.icons.volumeLow;
    const muteLabel = state.muted || volume === 0 ? 'Unmute' : 'Mute';

    if (this.muteButton.innerHTML !== muteIcon) {
      this.muteButton.innerHTML = muteIcon;
    }
    if (this.muteButton.ariaLabel !== muteLabel) {
      this.muteButton.ariaLabel = muteLabel;
    }
    const mutedState = state.muted || volume === 0;
    const muteTitle = mutedState ? 'Muted' : 'Unmuted';
    if (this.muteButton.title !== muteTitle) {
      this.muteButton.title = muteTitle;
    }
    this.muteButton.setAttribute('aria-pressed', String(mutedState));
  }

  private enqueueVolumeMutation(optimisticState: FideoState, task: () => Promise<void>): void {
    this.syncVolumeState(optimisticState);

    this.volumeQueue = this.volumeQueue
      .catch(() => undefined)
      .then(async () => {
        this.volumeMutationDepth += 1;
        try {
          await task();
        } catch {
          // Keep controls responsive even when a provider blocks a volume operation.
        } finally {
          this.volumeMutationDepth -= 1;
          this.syncVolumeState(this.adapter.getState());
        }
      });
  }

  private syncPlaybackState(state: FideoState, force = false): void {
    if (!force && this.seeking) return;
    this.currentTime.textContent = formatTime(state.currentTime);
    this.duration.textContent = formatTime(state.duration);
    this.setTrackProgress(state.duration ? (state.currentTime / state.duration) * 1000 : 0);
  }

  private setTrackProgress(value: number): void {
    const clamped = Number.isFinite(value) ? Math.min(1000, Math.max(0, value)) : 0;
    this.track.value = String(clamped);
    this.track.style.setProperty('--fideo-progress', `${clamped / 10}%`);
  }

  private startSmoothProgress(state = this.adapter.getState()): void {
    if (state.paused || !state.duration || this.seeking) return;
    this.stopSmoothProgress();
    this.smoothStartState = state;
    this.smoothStartMs = performance.now();
    this.smoothFrame = requestAnimationFrame(() => this.tickSmoothProgress());
  }

  private stopSmoothProgress(): void {
    if (this.smoothFrame !== undefined) cancelAnimationFrame(this.smoothFrame);
    this.smoothFrame = undefined;
    this.smoothStartState = undefined;
  }

  private tickSmoothProgress(): void {
    const startState = this.smoothStartState;
    if (!startState || this.seeking) {
      this.stopSmoothProgress();
      return;
    }

    const currentState = this.adapter.getState();
    if (currentState.paused || !currentState.duration) {
      this.stopSmoothProgress();
      this.syncPlaybackState(currentState, true);
      return;
    }

    const elapsedSeconds = ((performance.now() - this.smoothStartMs) / 1000) * (currentState.playbackRate || 1);
    const currentTime = Math.min(currentState.duration, startState.currentTime + elapsedSeconds);
    this.syncPlaybackState({ ...currentState, currentTime }, true);
    this.smoothFrame = requestAnimationFrame(() => this.tickSmoothProgress());
  }

  private renderFullscreenState(): void {
    const fullscreenActive = document.fullscreenElement === this.wrapper;
    this.fullscreenButton.innerHTML = fullscreenActive ? this.icons.fullscreenExit : this.icons.fullscreen;
    this.fullscreenButton.ariaLabel = fullscreenActive ? 'Exit fullscreen' : 'Fullscreen';
    this.fullscreenButton.title = fullscreenActive ? 'Exit fullscreen' : 'Fullscreen';
  }
}

function clampVolume(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const rounded = Math.floor(seconds);
  const minutes = Math.floor(rounded / 60);
  const remaining = rounded % 60;
  return `${minutes}:${String(remaining).padStart(2, '0')}`;
}
