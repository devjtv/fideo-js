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

  it('infers iframe providers from src urls without data-fideo-provider', () => {
    document.body.innerHTML = `
      <iframe data-fideo src="https://www.youtube.com/watch?v=M7lc1UVf-VE"></iframe>
      <iframe data-fideo src="https://vimeo.com/123456789/privatehash"></iframe>
      <iframe data-fideo src="https://fast.wistia.net/embed/iframe/abc123"></iframe>
    `;
    const [youtube, vimeo, wistia] = Array.from(document.querySelectorAll('iframe'));

    expect(resolveOptions(youtube).provider).toBe('youtube');
    expect(resolveOptions(vimeo).provider).toBe('vimeo');
    expect(resolveOptions(wistia).provider).toBe('wistia');
  });

  it('infers iframe providers from data sources and JS sources', () => {
    document.body.innerHTML = `
      <iframe data-fideo data-fideo-src="https://vimeo.com/123456789/privatehash"></iframe>
      <iframe id="object-source"></iframe>
    `;
    const dataSource = document.querySelector('[data-fideo]') as HTMLIFrameElement;
    const objectSource = document.querySelector('#object-source') as HTMLIFrameElement;

    expect(resolveOptions(dataSource).provider).toBe('vimeo');
    expect(
      resolveOptions(objectSource, {
        sources: {
          desktop: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
        },
      }).provider,
    ).toBe('youtube');
  });

  it('background mode implies autoplay, muted, loop, inline, no controls, and aspect ratio', () => {
    document.body.innerHTML = `
      <video
        data-fideo
        data-fideo-background="true"
        data-fideo-background-aspect-ratio="16:9"
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
    expect(options.backgroundAspectRatio).toBeCloseTo(16 / 9);
    expect(options.preload).toBe('metadata');
  });

  it('defaults iframe providers to lazy loading and lets data attributes override it', () => {
    document.body.innerHTML = `
      <iframe data-fideo src="https://www.youtube.com/watch?v=M7lc1UVf-VE"></iframe>
      <iframe data-fideo data-fideo-lazy="false" data-fideo-lazy-root-margin="1200px 0px" src="https://vimeo.com/123456789"></iframe>
      <video data-fideo data-fideo-preload="none"></video>
    `;
    const [youtube, vimeo] = Array.from(document.querySelectorAll('iframe'));
    const video = document.querySelector('video')!;

    expect(resolveOptions(youtube).lazy).toBe(true);
    expect(resolveOptions(vimeo).lazy).toBe(false);
    expect(resolveOptions(vimeo).lazyRootMargin).toBe('1200px 0px');
    expect(resolveOptions(video).lazy).toBe(false);
    expect(resolveOptions(video).preload).toBe('none');
  });

  it('accepts slash, colon, and numeric background aspect ratios', () => {
    document.body.innerHTML = `
      <iframe data-fideo data-fideo-background-aspect-ratio="4/3"></iframe>
      <iframe data-fideo data-fideo-background-aspect-ratio="9:16"></iframe>
      <iframe id="object-ratio"></iframe>
    `;
    const [slashRatio, colonRatio] = Array.from(document.querySelectorAll('[data-fideo]')) as HTMLIFrameElement[];
    const objectRatio = document.querySelector('#object-ratio') as HTMLIFrameElement;

    expect(resolveOptions(slashRatio).backgroundAspectRatio).toBeCloseTo(4 / 3);
    expect(resolveOptions(colonRatio).backgroundAspectRatio).toBeCloseTo(9 / 16);
    expect(resolveOptions(objectRatio, { backgroundAspectRatio: '21/9' }).backgroundAspectRatio).toBeCloseTo(21 / 9);
    expect(resolveOptions(objectRatio, { backgroundAspectRatio: 1 }).backgroundAspectRatio).toBe(1);
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
