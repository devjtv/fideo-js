import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Fideo, createFideo, initFideo, mountFideo } from '../src';

beforeEach(() => {
  document.body.innerHTML = '';
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 1200 });
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'load', {
    configurable: true,
    value: vi.fn(),
  });
});

describe('Fideo player', () => {
  it('wraps a video with controls and applies custom css variables', () => {
    document.body.innerHTML = `
      <video
        data-fideo
        data-fideo-src="/movie.mp4"
        data-fideo-accent="#123456"
      ></video>
    `;

    const video = document.querySelector('video')!;
    const player = mountFideo(video);

    expect(player.wrapper.classList.contains('fideo')).toBe(true);
    expect(player.wrapper.querySelector('.fideo__controls')).toBeTruthy();
    expect(player.wrapper.style.getPropertyValue('--fideo-accent')).toBe('#123456');
    expect(video.getAttribute('playsinline')).toBe('');
    expect(video.controls).toBe(false);
  });

  it('can hide individual custom controls', () => {
    document.body.innerHTML = `
      <video
        data-fideo
        data-fideo-show-volume="false"
        data-fideo-show-settings="false"
        data-fideo-show-fullscreen="false"
        data-fideo-src="/movie.mp4"
      ></video>
    `;

    const video = document.querySelector('video')!;
    const player = mountFideo(video);

    expect(player.wrapper.querySelector('.fideo__volume-group')).toBeNull();
    expect(player.wrapper.querySelector('.fideo__settings')).toBeNull();
    expect(player.wrapper.querySelector('[title="Fullscreen"]')).toBeNull();
    expect(player.wrapper.querySelector('.fideo__play')).toBeTruthy();
    expect(player.wrapper.querySelector('.fideo__timeline')).toBeTruthy();
  });

  it('skips all controls when controls is false', () => {
    document.body.innerHTML = '<video controls data-fideo data-fideo-controls="false" data-fideo-src="/one.mp4"></video>';
    const video = document.querySelector('video')!;
    const player = mountFideo(video);

    expect(player.wrapper.querySelector('.fideo__controls')).toBeNull();
    expect(video.controls).toBe(false);
  });

  it('initializes all data-fideo elements and can destroy them together', () => {
    document.body.innerHTML = `
      <video data-fideo data-fideo-src="/one.mp4"></video>
      <video data-fideo data-fideo-src="/two.mp4"></video>
    `;

    const result = initFideo();

    expect(result.players).toHaveLength(2);
    expect(document.querySelectorAll('.fideo')).toHaveLength(2);

    result.destroy();

    expect(document.querySelector('[data-fideo-ready]')).toBeNull();
  });

  it('keeps mount idempotent for the same element', () => {
    document.body.innerHTML = '<video data-fideo data-fideo-src="/one.mp4"></video>';
    const video = document.querySelector('video')!;

    const first = mountFideo(video);
    const second = mountFideo(video);

    expect(first).toBe(second);
    expect(document.querySelectorAll('.fideo')).toHaveLength(1);
  });

  it('supports Plyr-style constructor initialization without data attributes', () => {
    document.body.innerHTML = '<video id="player"></video>';

    const player = new Fideo('#player', {
      muted: true,
      loop: true,
      sources: {
        desktop: '/object-init.mp4',
      },
      controlVisibility: {
        settings: false,
      },
    });

    expect(player.element).toBe(document.querySelector('#player'));
    expect(player.wrapper.classList.contains('fideo')).toBe(true);
    expect(player.options.muted).toBe(true);
    expect(player.options.loop).toBe(true);
    expect(player.options.sources.desktop).toBe('/object-init.mp4');
    expect(player.wrapper.querySelector('.fideo__settings')).toBeNull();
  });

  it('supports helper object initialization with an element', () => {
    document.body.innerHTML = '<video id="player"></video>';
    const video = document.querySelector('video')!;

    const player = createFideo(video, {
      controls: false,
      sources: {
        desktop: '/helper-init.mp4',
      },
    });

    expect(player.element).toBe(video);
    expect(player.wrapper.querySelector('.fideo__controls')).toBeNull();
    expect(player.options.sources.desktop).toBe('/helper-init.mp4');
  });
});
