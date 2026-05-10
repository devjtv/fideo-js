import { describe, expect, it } from 'vitest';
import {
  addUrlParams,
  getResponsiveValue,
  normalizeVimeoEmbedUrl,
  normalizeYouTubeEmbedUrl,
  resolveOptions,
} from '../src/utils/dom';

describe('data attribute options', () => {
  it('reads provider, autoplay, viewport, responsive sources, posters, and css variables', () => {
    document.body.innerHTML = `
      <video
        data-fideo
        data-fideo-provider="html5"
        data-fideo-autoplay="true"
        data-fideo-muted="true"
        data-fideo-viewport="play-pause"
        data-fideo-volume="0.4"
        data-fideo-show-volume="false"
        data-fideo-show-settings="false"
        data-fideo-src="/desktop.mp4"
        data-fideo-src-mobile="/mobile.mp4"
        data-fideo-poster="/desktop.jpg"
        data-fideo-poster-mobile="/mobile.jpg"
        data-fideo-accent="#ff3366"
      ></video>
    `;

    const video = document.querySelector('video')!;
    const options = resolveOptions(video);

    expect(options.provider).toBe('html5');
    expect(options.autoplay).toBe(true);
    expect(options.muted).toBe(true);
    expect(options.viewport).toBe('play-pause');
    expect(options.volume).toBe(0.4);
    expect(options.controlVisibility.volume).toBe(false);
    expect(options.controlVisibility.settings).toBe(false);
    expect(options.sources).toEqual({ desktop: '/desktop.mp4', tablet: undefined, mobile: '/mobile.mp4' });
    expect(options.posters).toEqual({ desktop: '/desktop.jpg', tablet: undefined, mobile: '/mobile.jpg' });
    expect(options.cssVars['--fideo-accent']).toBe('#ff3366');
  });

  it('selects mobile, tablet, and desktop media values by breakpoint', () => {
    const values = {
      desktop: '/desktop.mp4',
      tablet: '/tablet.mp4',
      mobile: '/mobile.mp4',
    };
    const breakpoints = { mobile: 640, tablet: 1024 };

    expect(getResponsiveValue(values, breakpoints, 390)).toBe('/mobile.mp4');
    expect(getResponsiveValue(values, breakpoints, 800)).toBe('/tablet.mp4');
    expect(getResponsiveValue(values, breakpoints, 1280)).toBe('/desktop.mp4');
  });

  it('background mode implies autoplay, muted, loop, inline, no controls, and aspect ratio', () => {
    document.body.innerHTML = `
      <video
        data-fideo
        data-fideo-background="true"
        data-fideo-background-aspect-ratio="1.777"
      ></video>
    `;

    const video = document.querySelector('video')!;
    const options = resolveOptions(video);

    expect(options.background).toBe(true);
    expect(options.autoplay).toBe(true);
    expect(options.muted).toBe(true);
    expect(options.loop).toBe(true);
    expect(options.playsInline).toBe(true);
    expect(options.controls).toBe(false);
    expect(options.backgroundAspectRatio).toBe(1.777);
  });

  it('normalizes YouTube URLs to no-cookie embed URLs and preserves params', () => {
    expect(normalizeYouTubeEmbedUrl('https://www.youtube.com/watch?v=M7lc1UVf-VE&start=4')).toBe(
      'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?start=4',
    );
    expect(normalizeYouTubeEmbedUrl('https://youtu.be/M7lc1UVf-VE?si=abc')).toBe(
      'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?si=abc',
    );
  });

  it('preserves Vimeo private h params when adding player params', () => {
    expect(
      addUrlParams('https://player.vimeo.com/video/123456789?h=5e2d1c1e6d', {
        api: 1,
        controls: 0,
        playsinline: 1,
      }),
    ).toBe('https://player.vimeo.com/video/123456789?h=5e2d1c1e6d&api=1&controls=0&playsinline=1');
  });

  it('normalizes Vimeo page URLs and private hash URLs to embed URLs', () => {
    expect(normalizeVimeoEmbedUrl('https://vimeo.com/123456789')).toBe(
      'https://player.vimeo.com/video/123456789',
    );
    expect(normalizeVimeoEmbedUrl('https://vimeo.com/123456789/5e2d1c1e6d')).toBe(
      'https://player.vimeo.com/video/123456789?h=5e2d1c1e6d',
    );
    expect(normalizeVimeoEmbedUrl('https://vimeo.com/123456789/5e2d1c1e6d?autopause=0')).toBe(
      'https://player.vimeo.com/video/123456789?autopause=0&h=5e2d1c1e6d',
    );
    expect(normalizeVimeoEmbedUrl('https://player.vimeo.com/video/123456789?h=existing')).toBe(
      'https://player.vimeo.com/video/123456789?h=existing',
    );
  });
});
