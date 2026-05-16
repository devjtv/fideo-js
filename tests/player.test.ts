import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Fideo, createFideo, initFideo, mountFideo } from '../src';

beforeEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  delete (window as any).YT;
  delete (window as any).onYouTubeIframeAPIReady;
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
    const controls = player.wrapper.querySelector('.fideo__controls')!;
    expect(controls.shadowRoot!.querySelector('.fideo__play')).toBeTruthy();
    expect(controls.shadowRoot!.querySelector('.fideo__timeline')).toBeTruthy();
  });

  it('skips all controls when controls is false', () => {
    document.body.innerHTML = '<video controls data-fideo data-fideo-controls="false" data-fideo-src="/one.mp4"></video>';
    const video = document.querySelector('video')!;
    const player = mountFideo(video);

    expect(player.wrapper.querySelector('.fideo__controls')).toBeNull();
    expect(video.controls).toBe(false);
  });

  it('uses background mode as muted looping autoplay with no controls', () => {
    document.body.innerHTML = '<video data-fideo data-fideo-background="true" data-fideo-src="/one.mp4"></video>';
    const video = document.querySelector('video')!;
    const player = mountFideo(video);

    expect(player.wrapper.classList.contains('fideo--background')).toBe(true);
    expect(player.wrapper.querySelector('.fideo__controls')).toBeNull();
    expect(player.options.autoplay).toBe(true);
    expect(player.options.muted).toBe(true);
    expect(player.options.loop).toBe(true);
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.controls).toBe(false);
  });

  it('cover-sizes background iframe embeds from the configured aspect ratio', () => {
    document.body.innerHTML = `
      <iframe
        data-fideo
        data-fideo-background="true"
        data-fideo-background-aspect-ratio="16:9"
        src="https://vimeo.com/123456789/privatehash"
      ></iframe>
    `;
    const iframe = document.querySelector('iframe')!;
    const player = mountFideo(iframe);

    Object.defineProperty(player.wrapper, 'clientWidth', { configurable: true, value: 300 });
    Object.defineProperty(player.wrapper, 'clientHeight', { configurable: true, value: 500 });
    window.dispatchEvent(new Event('resize'));

    const src = new URL(iframe.src);
    expect(src.searchParams.get('h')).toBe('privatehash');
    expect(src.searchParams.get('background')).toBe('1');
    expect(parseFloat(iframe.style.width)).toBeCloseTo(888.89, 1);
    expect(iframe.style.height).toBe('500px');
    expect(parseFloat(iframe.style.left)).toBeCloseTo(-294.44, 1);
    expect(iframe.style.top).toBe('0px');
  });

  it('does not create a YouTube player after destroy if the SDK becomes ready later', async () => {
    const playerInstances = {
      created: 0,
      destroyed: 0,
    };

    document.body.innerHTML = `
      <iframe
        data-fideo
        src="https://www.youtube.com/watch?v=M7lc1UVf-VE"
      ></iframe>
    `;
    const iframe = document.querySelector('iframe')!;
    const player = mountFideo(iframe);

    player.destroy();

    (window as any).YT = {
      Player: class {
        constructor() {
          playerInstances.created += 1;
        }

        destroy() {
          playerInstances.destroyed += 1;
        }
      },
      PlayerState: {
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5,
      },
    };
    (window as any).onYouTubeIframeAPIReady();
    await Promise.resolve();

    expect(playerInstances.created).toBe(0);
    expect(playerInstances.destroyed).toBe(0);
  });

  it('normalizes YouTube background embeds with no-cookie autoplay and loop params', () => {
    document.body.innerHTML = `
      <iframe
        data-fideo
        data-fideo-background="true"
        data-fideo-background-aspect-ratio="16/9"
        src="https://www.youtube.com/watch?v=M7lc1UVf-VE"
      ></iframe>
    `;
    const iframe = document.querySelector('iframe')!;
    const player = mountFideo(iframe);
    const src = new URL(iframe.src);

    expect(player.wrapper.classList.contains('fideo--background')).toBe(true);
    expect(player.wrapper.querySelector('.fideo__controls')).toBeNull();
    expect(src.hostname).toBe('www.youtube-nocookie.com');
    expect(src.pathname).toBe('/embed/M7lc1UVf-VE');
    expect(src.searchParams.get('autoplay')).toBe('1');
    expect(src.searchParams.get('mute')).toBe('1');
    expect(src.searchParams.get('loop')).toBe('1');
    expect(src.searchParams.get('playlist')).toBe('M7lc1UVf-VE');
    expect(src.searchParams.get('controls')).toBe('0');
    expect(iframe.allow).toContain('autoplay');
    expect(iframe.allow).toContain('encrypted-media');
  });

  it('keeps Vimeo background autoplay paused until real playback starts', () => {
    document.body.innerHTML = `
      <iframe
        data-fideo
        data-fideo-background="true"
        data-fideo-poster="/desktop-poster.jpg"
        src="https://vimeo.com/76979871"
      ></iframe>
    `;

    const iframe = document.querySelector('iframe')!;
    const player = mountFideo(iframe);

    expect(player.wrapper.classList.contains('is-paused')).toBe(true);
    expect(player.wrapper.classList.contains('is-playing')).toBe(false);
    expect(player.wrapper.classList.contains('is-poster-visible')).toBe(true);
  });

  it('renders responsive poster overlays for iframe providers', () => {
    document.body.innerHTML = `
      <iframe
        data-fideo
        data-fideo-poster="/desktop-poster.jpg"
        data-fideo-poster-tablet="/tablet-poster.jpg"
        data-fideo-poster-mobile="/mobile-poster.jpg"
        src="https://www.youtube.com/watch?v=M7lc1UVf-VE"
      ></iframe>
    `;
    const iframe = document.querySelector('iframe')!;
    const player = mountFideo(iframe);
    const poster = player.wrapper.querySelector('.fideo__poster') as HTMLImageElement;

    expect(poster).toBeTruthy();
    expect(poster.src.endsWith('/desktop-poster.jpg')).toBe(true);
    expect(player.wrapper.classList.contains('is-poster-visible')).toBe(true);

    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 900 });
    window.dispatchEvent(new Event('resize'));
    expect(poster.src.endsWith('/tablet-poster.jpg')).toBe(true);

    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 600 });
    window.dispatchEvent(new Event('resize'));
    expect(poster.src.endsWith('/mobile-poster.jpg')).toBe(true);

    (player as any).adapter.state.paused = false;
    (player as any).adapter.dispatchEvent(new Event('play'));
    expect(player.wrapper.classList.contains('is-poster-visible')).toBe(false);

    (player as any).adapter.state.paused = true;
    (player as any).adapter.dispatchEvent(new Event('pause'));
    expect(player.wrapper.classList.contains('is-poster-visible')).toBe(true);
  });

  it('shows poster overlays for native video while paused and hides them during playback', () => {
    document.body.innerHTML = `
      <video
        data-fideo
        data-fideo-poster="/desktop-poster.jpg"
        data-fideo-src="/movie.mp4"
      ></video>
    `;
    const video = document.querySelector('video')!;
    const player = mountFideo(video);
    const poster = player.wrapper.querySelector('.fideo__poster') as HTMLImageElement;

    expect(poster).toBeTruthy();
    expect(poster.src.endsWith('/desktop-poster.jpg')).toBe(true);
    expect(player.wrapper.classList.contains('is-poster-visible')).toBe(true);

    Object.defineProperty(video, 'paused', { configurable: true, value: false });
    video.dispatchEvent(new Event('play'));
    expect(player.wrapper.classList.contains('is-poster-visible')).toBe(false);

    Object.defineProperty(video, 'paused', { configurable: true, value: true });
    video.dispatchEvent(new Event('pause'));
    expect(player.wrapper.classList.contains('is-poster-visible')).toBe(true);
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

  it('can remount an element after destroy', () => {
    document.body.innerHTML = '<video data-fideo data-fideo-src="/one.mp4"></video>';
    const video = document.querySelector('video')!;

    const first = mountFideo(video);
    first.destroy();
    const second = mountFideo(video);

    expect(second).not.toBe(first);
    expect(document.querySelectorAll('.fideo')).toHaveLength(1);
    expect(second.wrapper.classList.contains('is-ready')).toBe(true);
    expect(video.getAttribute('data-fideo-ready')).toBe('true');
  });

  it('cleans up generated wrapper and click target on destroy', () => {
    document.body.innerHTML = '<video data-fideo data-fideo-src="/one.mp4"></video>';
    const video = document.querySelector('video')!;
    const player = mountFideo(video);

    player.destroy();

    expect(document.querySelector('.fideo')).toBeNull();
    expect(document.querySelector('.fideo__click-target')).toBeNull();
    expect(video.parentElement).toBe(document.body);
    expect(video.classList.contains('fideo__media')).toBe(false);
  });

  it('does not auto-init data-fideo elements from the ESM import alone', () => {
    document.body.innerHTML = '<video data-fideo data-fideo-src="/one.mp4"></video>';

    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(document.querySelector('.fideo')).toBeNull();
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
