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
  private seeking = false;
  private icons: Required<NonNullable<FideoResolvedOptions['icons']>>;
  private handleFullscreenChange = () => this.render(this.adapter.getState());

  constructor(
    private adapter: FideoAdapter,
    private wrapper: HTMLElement,
    options: FideoResolvedOptions,
  ) {
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

    const volumeGroup = createElement('div', 'fideo__volume-group');
    volumeGroup.append(this.muteButton, this.volume);

    const settingsGroup = createElement('div', 'fideo__settings');
    settingsGroup.append(settings, this.speedMenu);

    const primaryControls = createElement('div', 'fideo__control-row');
    const spacer = createElement('span', 'fideo__spacer');

    if (options.controlVisibility.play) primaryControls.append(this.playButton);
    if (options.controlVisibility.currentTime || options.controlVisibility.duration) primaryControls.append(timeGroup);
    primaryControls.append(spacer);
    if (options.controlVisibility.volume) primaryControls.append(volumeGroup);
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
    this.volume.addEventListener('input', () => this.adapter.setVolume(Number(this.volume.value)).catch(() => undefined));
    this.track.addEventListener('pointerdown', () => {
      this.seeking = true;
    });
    this.track.addEventListener('input', () => this.previewSeek());
    this.track.addEventListener('change', () => this.commitSeek());
    settings.addEventListener('click', () => settingsGroup.classList.toggle('is-open'));
    this.fullscreenButton.addEventListener('click', () => this.toggleFullscreen());
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);

    this.adapter.addEventListener('change', () => this.render(this.adapter.getState()));
    this.render(this.adapter.getState());
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
        this.adapter.setPlaybackRate(rate).catch(() => undefined);
        menu.parentElement?.classList.remove('is-open');
      });
      menu.append(button);
    }
    return menu;
  }

  private togglePlay(): void {
    const state = this.adapter.getState();
    if (state.paused) this.adapter.play().catch(() => undefined);
    else this.adapter.pause().catch(() => undefined);
  }

  private toggleMute(): void {
    const state = this.adapter.getState();
    this.adapter.setMuted(!state.muted).catch(() => undefined);
  }

  private previewSeek(): void {
    const state = this.adapter.getState();
    if (!state.duration) return;
    this.currentTime.textContent = formatTime((Number(this.track.value) / 1000) * state.duration);
  }

  private commitSeek(): void {
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

  private render(state: FideoState): void {
    this.playButton.innerHTML = state.paused ? this.icons.play : this.icons.pause;
    this.playButton.ariaLabel = state.paused ? 'Play' : 'Pause';
    this.playButton.title = state.paused ? 'Play' : 'Pause';
    this.muteButton.innerHTML = state.muted || state.volume === 0 ? this.icons.muted : this.icons.volume;
    if (!state.muted && state.volume > 0 && state.volume <= 0.5) this.muteButton.innerHTML = this.icons.volumeLow;
    this.muteButton.ariaLabel = state.muted || state.volume === 0 ? 'Unmute' : 'Mute';
    this.muteButton.title = state.muted || state.volume === 0 ? 'Unmute' : 'Mute';
    const fullscreenActive = document.fullscreenElement === this.wrapper;
    this.fullscreenButton.innerHTML = fullscreenActive ? this.icons.fullscreenExit : this.icons.fullscreen;
    this.fullscreenButton.ariaLabel = fullscreenActive ? 'Exit fullscreen' : 'Fullscreen';
    this.fullscreenButton.title = fullscreenActive ? 'Exit fullscreen' : 'Fullscreen';
    this.volume.value = String(state.muted ? 0 : state.volume);
    this.currentTime.textContent = formatTime(state.currentTime);
    this.duration.textContent = formatTime(state.duration);

    if (!this.seeking) {
      this.track.value = state.duration ? String((state.currentTime / state.duration) * 1000) : '0';
    }

    this.track.style.setProperty('--fideo-progress', `${Number(this.track.value) / 10}%`);
    this.volume.style.setProperty('--fideo-progress', `${Number(this.volume.value) * 100}%`);
  }
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const rounded = Math.floor(seconds);
  const minutes = Math.floor(rounded / 60);
  const remaining = rounded % 60;
  return `${minutes}:${String(remaining).padStart(2, '0')}`;
}
