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
  private seeking = false;
  private icons: Required<NonNullable<FideoResolvedOptions['icons']>>;
  private handleFullscreenChange = () => this.renderFullscreenState();

  constructor(private adapter: FideoAdapter, private wrapper: HTMLElement, options: FideoResolvedOptions) {
    this.icons = { ...defaultIcons, ...options.icons };
    this.element = createElement('div', 'fideo__controls');
    this.playButton = this.button('fideo__button fideo__play', 'Play', this.icons.play);
    this.muteButton = this.button('fideo__button fideo__mute', 'Mute', this.icons.volume);
    this.track = this.range('fideo__track', 0, 1000, 1);
    this.volume = this.range('fideo__volume', 0, 1, 0.01);
    this.currentTime = createElement('span', 'fideo__time');
    this.duration = createElement('span', 'fideo__time');
    this.speedMenu = this.createSpeedMenu(options.playbackRates);
    this.fullscreenButton = this.button('fideo__button', 'Fullscreen', this.icons.fullscreen);

    const settings = this.button('fideo__button fideo__settings-toggle', 'Settings', this.icons.settings);
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

    const settingsGroup = createElement('div', 'fideo__settings');
    settingsGroup.append(settings, this.speedMenu);

    const primaryControls = createElement('div', 'fideo__control-row');
    const spacer = createElement('span', 'fideo__spacer');

    if (options.controlVisibility.play) primaryControls.append(this.playButton);
    if (options.controlVisibility.currentTime || options.controlVisibility.duration) primaryControls.append(timeGroup);
    primaryControls.append(spacer);
    if (options.controlVisibility.volume) primaryControls.append(this.volumeGroup);
    if (options.controlVisibility.settings) primaryControls.append(settingsGroup);
    if (options.controlVisibility.fullscreen) primaryControls.append(this.fullscreenButton);

    this.element.append(primaryControls);
    if (options.controlVisibility.timeline) this.element.append(timeline);
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
    settings.addEventListener('click', () => { this.wrapper.classList.add('is-user-active'); settingsGroup.classList.toggle('is-open'); });
    this.fullscreenButton.addEventListener('click', () => { this.wrapper.classList.add('is-user-active'); this.toggleFullscreen(); });
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);

    this.adapter.addEventListener('play', () => this.syncPlayState(this.adapter.getState()));
    this.adapter.addEventListener('pause', () => this.syncPlayState(this.adapter.getState()));
    this.adapter.addEventListener('ended', () => this.syncPlayState(this.adapter.getState()));
    this.adapter.addEventListener('volumechange', () => this.syncVolumeState(this.adapter.getState()));
    this.adapter.addEventListener('durationchange', () => this.syncPlaybackState(this.adapter.getState(), true));
    this.adapter.addEventListener('timeupdate', () => this.syncPlaybackState(this.adapter.getState()));
    this.adapter.addEventListener('change', () => this.syncPlaybackState(this.adapter.getState()));

    const state = this.adapter.getState();
    this.syncPlayState(state);
    this.syncVolumeState(state);
    this.syncPlaybackState(state, true);
    this.renderFullscreenState();
  }

  destroy(): void {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    this.element.remove();
  }

  private button(className: string, label: string, icon: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = className;
    button.type = 'button';
    button.ariaLabel = label;
    button.title = label;
    button.innerHTML = icon;
    return button;
  }

  private range(className: string, min: number, max: number, step: number): HTMLInputElement {
    const input = document.createElement('input');
    input.className = className;
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    return input;
  }

  private createSpeedMenu(rates: number[]): HTMLElement {
    const menu = createElement('div', 'fideo__settings-menu');
    for (const rate of rates) {
      const button = this.button('fideo__speed', `${rate}x`, '');
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

  private togglePlay(): void {
    this.wrapper.classList.add('is-user-active');
    const state = this.adapter.getState();
    if (state.paused) this.adapter.play().catch(() => undefined);
    else this.adapter.pause().catch(() => undefined);
  }

  private toggleMute(): void {
    this.wrapper.classList.add('is-user-active');
    const state = this.adapter.getState();
    this.adapter.setMuted(!state.muted).catch(() => undefined);
  }

  private changeVolume(): void {
    this.wrapper.classList.add('is-user-active');
    const volume = Number(this.volume.value);
    if (volume > 0) this.adapter.setMuted(false).catch(() => undefined);
    this.adapter.setVolume(volume).catch(() => undefined);
  }

  private previewSeek(): void {
    this.wrapper.classList.add('is-user-active');
    const state = this.adapter.getState();
    if (!state.duration) return;
    this.currentTime.textContent = formatTime((Number(this.track.value) / 1000) * state.duration);
  }

  private commitSeek(): void {
    this.wrapper.classList.add('is-user-active');
    const state = this.adapter.getState();
    this.seeking = false;
    if (!state.duration) return;
    this.adapter.seek((Number(this.track.value) / 1000) * state.duration).catch(() => undefined);
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
    this.volume.value = String(state.muted ? 0 : state.volume);
    this.volume.style.setProperty('--fideo-progress', `${Number(this.volume.value) * 100}%`);

    let muteIcon = state.muted || state.volume === 0 ? this.icons.muted : this.icons.volume;
    if (!state.muted && state.volume > 0 && state.volume <= 0.5) muteIcon = this.icons.volumeLow;
    const muteLabel = state.muted || state.volume === 0 ? 'Unmute' : 'Mute';

    if (this.muteButton.innerHTML !== muteIcon) {
      this.muteButton.innerHTML = muteIcon;
    }
    if (this.muteButton.ariaLabel !== muteLabel) {
      this.muteButton.ariaLabel = muteLabel;
    }
    if (this.muteButton.title !== muteLabel) {
      this.muteButton.title = muteLabel;
    }
  }

  private syncPlaybackState(state: FideoState, force = false): void {
    if (!force && this.seeking) return;
    this.currentTime.textContent = formatTime(state.currentTime);
    this.duration.textContent = formatTime(state.duration);
    this.track.value = state.duration ? String((state.currentTime / state.duration) * 1000) : '0';
    this.track.style.setProperty('--fideo-progress', `${Number(this.track.value) / 10}%`);
  }

  private renderFullscreenState(): void {
    const fullscreenActive = document.fullscreenElement === this.wrapper;
    this.fullscreenButton.innerHTML = fullscreenActive ? this.icons.fullscreenExit : this.icons.fullscreen;
    this.fullscreenButton.ariaLabel = fullscreenActive ? 'Exit fullscreen' : 'Fullscreen';
    this.fullscreenButton.title = fullscreenActive ? 'Exit fullscreen' : 'Fullscreen';
  }

}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const rounded = Math.floor(seconds);
  const minutes = Math.floor(rounded / 60);
  const remaining = rounded % 60;
  return `${minutes}:${String(remaining).padStart(2, '0')}`;
}
