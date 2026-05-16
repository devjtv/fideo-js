<p align="center">
  <img src="./assets/fideo-js-logo.png" alt="Fideo JS logo: a glitching bowl of fideo noodles with a play icon" width="220" />
</p>

<h1 align="center">Fideo JS</h1>

<p align="center">
  A lightweight, data-attribute-first video player UI for MP4, YouTube, Vimeo, and Wistia embeds.
</p>

<p align="center">
  <a href="https://github.com/devjtv/fideo-js/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-0f172a"></a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-ready-3178c6">
  <img alt="Providers" src="https://img.shields.io/badge/providers-MP4%20%7C%20YouTube%20%7C%20Vimeo%20%7C%20Wistia-26d3bd">
  <img alt="No dependencies" src="https://img.shields.io/badge/runtime-lightweight-f97316">
  <a href="https://fideo-js.developer-jakev.workers.dev"><img alt="Live demo" src="https://img.shields.io/badge/demo-live-6cf2c0"></a>
</p>

Fideo JS turns normal `<video>` and `<iframe>` elements into polished, configurable video experiences. Keep your markup simple, add `data-fideo`, and get custom controls, responsive sources, posters, viewport playback, background video mode, and provider normalization — without giving up control of your HTML.

## Highlights

- One UI across MP4, YouTube, Vimeo, and Wistia, with automatic URL normalization for each provider.
- Data-attribute initialization for CMS/template usage, plus a JavaScript API for app-style usage.
- Responsive `sources` and `posters` per breakpoint, with mobile/tablet/desktop fallbacks.
- Viewport autoplay and auto-pause via `IntersectionObserver`.
- Background-video mode for heroes, banners, and tiles, with cover-fill sizing on iframes too.
- Shadow-DOM controls themed via CSS custom properties and `::part()`, with optional custom SVG icons.

## Table of Contents

- [Install](#install)
- [Quick Start](#quick-start)
- [CDN](#cdn)
- [JavaScript Initialization](#javascript-initialization)
- [Player API](#player-api)
- [Events](#events)
- [Background Video](#background-video)
- [Responsive Sources And Posters](#responsive-sources-and-posters)
- [Viewport Playback](#viewport-playback)
- [Controls](#controls)
- [Styling](#styling)
- [Shadow DOM Parts](#shadow-dom-parts)
- [Custom Icons](#custom-icons)
- [Provider Support](#provider-support)
- [Options](#options)
- [Data Attributes](#data-attributes)
- [Compiled Files](#compiled-files)
- [Development](#development)
- [Browser Notes](#browser-notes)

## Install

```bash
npm install fideo-js
```

Import the JavaScript and stylesheet:

```ts
import { initFideo } from 'fideo-js';
import 'fideo-js/fideo.css';

initFideo();
```

Or use the browser bundle:

```html
<link rel="stylesheet" href="./dist/fideo.css" />
<script src="./dist/fideo.global.js"></script>
<script>
  Fideo.init();
</script>
```

## Quick Start

Add `data-fideo` to a normal video element:

```html
<video
  data-fideo
  data-fideo-muted="true"
  data-fideo-viewport="play-pause"
  data-fideo-src="/videos/desktop.mp4"
  data-fideo-src-mobile="/videos/mobile.mp4"
  data-fideo-poster="/posters/desktop.jpg"
  data-fideo-poster-mobile="/posters/mobile.jpg"
></video>
```

Use the same pattern for iframe providers:

```html
<iframe
  data-fideo
  data-fideo-muted="true"
  data-fideo-poster="/posters/desktop.jpg"
  data-fideo-poster-mobile="/posters/mobile.jpg"
  src="https://www.youtube.com/watch?v=M7lc1UVf-VE"
  title="Product video"
></iframe>
```

Fideo will normalize that YouTube URL to a no-cookie embed URL and add the provider API parameters it needs. Wistia embeds use a `<wistia-player>` custom element under the hood, but the iframe authoring stays the same:

```html
<iframe
  data-fideo
  data-fideo-muted="true"
  data-fideo-autoplay="true"
  data-fideo-poster="/posters/wistia-poster.jpg"
  src="https://fast.wistia.com/embed/medias/358edhd4og"
  title="Wistia video"
></iframe>
```

When poster images are configured, Fideo renders them as a visual cover while the player is paused or still getting ready, then fades them away when playback starts.

## CDN

Because the compiled files are committed in `dist/`, Fideo JS can be loaded directly from jsDelivr. Pin a release tag for production:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devjtv/fideo-js@v0.5.2/dist/fideo.css" />
<script src="https://cdn.jsdelivr.net/gh/devjtv/fideo-js@v0.5.2/dist/fideo.global.js"></script>
<script>
  Fideo.init();
</script>
```

ES module usage is also available:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devjtv/fideo-js@v0.5.2/dist/fideo.css" />
<script type="module">
  import { initFideo } from 'https://cdn.jsdelivr.net/gh/devjtv/fideo-js@v0.5.2/dist/fideo.js';

  initFideo();
</script>
```

## JavaScript Initialization

If you do not want configuration in markup, initialize with a JS object:

```ts
import { Fideo } from 'fideo-js';
import 'fideo-js/fideo.css';

const player = new Fideo('#player', {
  muted: true,
  loop: true,
  controls: false,
  sources: {
    desktop: '/videos/showcase.mp4',
    mobile: '/videos/showcase-mobile.mp4',
  },
  posters: {
    desktop: '/posters/showcase.jpg',
    mobile: '/posters/showcase-mobile.jpg',
  },
});

player.play();
```

`sources` and `posters` accept either an object (for responsive variants) or a bare string when you only have one asset:

```ts
new Fideo('#player', {
  sources: '/videos/showcase.mp4',   // shorthand for { desktop: '/videos/showcase.mp4' }
  posters: '/posters/showcase.jpg',
  muted: true,
});
```

You can also mount a single element or initialize a whole page:

```ts
import { createFideo, initFideo, mountFideo } from 'fideo-js';

const pagePlayers = initFideo({
  selector: '[data-video]',
});

const singlePlayer = mountFideo(document.querySelector('video')!, {
  viewport: 'play-pause',
});

const objectPlayer = createFideo('#object-player', {
  controlVisibility: {
    volume: false,
    settings: false,
  },
});

pagePlayers.destroy();
singlePlayer.destroy();
objectPlayer.destroy();
```

Which entry point to use:

| Entry point | Use when |
| --- | --- |
| `new Fideo(target, options)` | App-style usage where you keep a player reference around. |
| `Fideo.init(options)` / `initFideo(options)` | Scan the page (default selector `[data-fideo]`) and mount every match. Returns `{ players, destroy() }`. |
| `mountFideo(element, options)` | Mount a single element you already have a reference to. Reuses an existing instance if one is bound. |
| `createFideo(target, options)` | Same as `mountFideo`, but accepts a selector string. |

## Player API

`new Fideo(...)`, `mountFideo`, and `createFideo` all return a player instance that implements `FideoPlayerInstance`:

```ts
const player = new Fideo('#player', { sources: { desktop: '/clip.mp4' } });

await player.play();
await player.pause();
await player.seek(30);
await player.setVolume(0.5);
await player.setMuted(true);
await player.setPlaybackRate(1.5);
await player.setSource('/clip-alt.mp4');
const state = player.getState();
player.destroy();

player.element;   // the original <video> or <iframe>
player.wrapper;   // the generated .fideo wrapper element
player.options;   // the resolved options object
player.adapter;   // the provider adapter (advanced / lower-level access)
```

The player methods cover the common API surface. The `adapter` stays available for provider-specific or lower-level access:

```ts
await player.seek(30);             // jump to 30s
await player.setVolume(0.5);
await player.setMuted(true);
await player.setPlaybackRate(1.5);
await player.setSource('/clip-alt.mp4');

const state = player.getState();
// {
//   currentTime: number,
//   duration: number,
//   volume: number,
//   muted: boolean,
//   paused: boolean,
//   playbackRate: number,
//   buffered: number,
// }
```

State changes are also dispatched as DOM events; see [Events](#events).

In TypeScript, the relevant types travel with the package:

```ts
import type { FideoOptions, FideoPlayerInstance, FideoState } from 'fideo-js';
```

## Events

Fideo forwards provider state changes as DOM events on the original media element. Every event's `detail` is `{ player: FideoPlayerInstance, state: FideoState }`.

```ts
const video = document.querySelector('[data-fideo]')!;

video.addEventListener('fideo:timeupdate', (event) => {
  const { currentTime, duration } = event.detail.state;
  console.log(`${currentTime} / ${duration}`);
});

video.addEventListener('fideo:play', (event) => {
  console.log(event.detail.player);
});
```

| Event | Description |
| --- | --- |
| `fideo:play` | Playback started. |
| `fideo:pause` | Playback paused. |
| `fideo:ended` | Playback ended. |
| `fideo:timeupdate` | Current time changed during playback. |
| `fideo:volumechange` | Volume or muted state changed. |
| `fideo:change` | General state update (volume, source, duration, etc.). |

## Background Video

Background mode is designed for full-width heroes, editorial banners, cards, and media tiles. Set `background: true` or `data-fideo-background="true"` and Fideo automatically enables:

- autoplay
- muted playback
- loop
- inline playback
- no controls
- cover-fill sizing inside the parent container

Native `<video>` uses CSS `object-fit: cover`. Iframe embeds cannot rely on `object-fit`, so Fideo measures the parent container and resizes the iframe with cover-style math.

For iframe backgrounds, `data-fideo-background-aspect-ratio` and `backgroundAspectRatio` describe the original video's own aspect ratio, not the container's aspect ratio. Fideo uses that source ratio to decide whether the iframe should be wider or taller than the container, then centers the overflow so the background fills the space without black bars.

You do not need to set this for normal `16:9` YouTube or Vimeo videos because `16 / 9` is the default. Set it only when the source video itself is a different shape, such as square, portrait, ultrawide, or `4:3`.

### MP4 Background

```html
<div class="hero-video">
  <video
    data-fideo
    data-fideo-background="true"
    data-fideo-src="/videos/hero.mp4"
    data-fideo-src-mobile="/videos/hero-mobile.mp4"
    data-fideo-poster="/posters/hero.jpg"
  ></video>
</div>
```

### Vimeo Background

```html
<div class="video-tile">
  <iframe
    data-fideo
    data-fideo-background="true"
    data-fideo-background-aspect-ratio="16:9"
    src="https://vimeo.com/76979871"
    title="Vimeo background video"
  ></iframe>
</div>
```

### YouTube Background

```html
<div class="video-tile">
  <iframe
    data-fideo
    data-fideo-background="true"
    data-fideo-background-aspect-ratio="16:9"
    src="https://www.youtube.com/watch?v=M7lc1UVf-VE"
    title="YouTube background video"
  ></iframe>
</div>
```

### Wistia Background

```html
<div class="video-tile">
  <iframe
    data-fideo
    data-fideo-background="true"
    data-fideo-background-aspect-ratio="16:9"
    src="https://fast.wistia.com/embed/medias/358edhd4og"
    title="Wistia background video"
  ></iframe>
</div>
```

Supported ratio formats:

```html
data-fideo-background-aspect-ratio="16:9"
data-fideo-background-aspect-ratio="16/9"
data-fideo-background-aspect-ratio="1.777777778"
```

JavaScript supports the same string formats or a number:

```ts
new Fideo('#background-player', {
  background: true,
  backgroundAspectRatio: '4:3',
  sources: {
    desktop: 'https://vimeo.com/76979871',
  },
});
```

Common values:

| Original video shape | Ratio value |
| --- | --- |
| Widescreen | `16:9` |
| Classic | `4:3` |
| Square | `1:1` or `1` |
| Portrait / Shorts | `9:16` |
| Ultrawide | `21:9` |

## Responsive Sources And Posters

Fideo lets you swap video source and poster assets by breakpoint. This is useful when mobile needs a different crop, lighter file, or portrait-oriented video.

```html
<video
  data-fideo
  data-fideo-src="/videos/desktop.mp4"
  data-fideo-src-tablet="/videos/tablet.mp4"
  data-fideo-src-mobile="/videos/mobile.mp4"
  data-fideo-poster="/posters/desktop.jpg"
  data-fideo-poster-tablet="/posters/tablet.jpg"
  data-fideo-poster-mobile="/posters/mobile.jpg"
></video>
```

The same poster attributes and `posters` object also work for iframe providers. In that case, Fideo creates an `<img>` inside the player wrapper and treats it like a paused/loading poster overlay. The `desktop`, `tablet`, and `mobile` poster values should still describe the original poster assets you want shown for each breakpoint.

```html
<iframe
  data-fideo
  data-fideo-poster="/posters/youtube-desktop.jpg"
  data-fideo-poster-tablet="/posters/youtube-tablet.jpg"
  data-fideo-poster-mobile="/posters/youtube-mobile.jpg"
  src="https://www.youtube.com/watch?v=M7lc1UVf-VE"
  title="YouTube video with responsive poster"
></iframe>
```

Default breakpoints:

| Breakpoint | Width |
| --- | ---: |
| Mobile | `767px` and below |
| Tablet | `1024px` and below |
| Desktop | Above tablet |

Override them per element:

```html
<video
  data-fideo
  data-fideo-breakpoint-mobile="640"
  data-fideo-breakpoint-tablet="1100"
  data-fideo-src="/videos/desktop.mp4"
  data-fideo-src-mobile="/videos/mobile.mp4"
></video>
```

Or in JavaScript:

```ts
new Fideo('#player', {
  breakpoints: {
    mobile: 640,
    tablet: 1100,
  },
  sources: {
    desktop: '/videos/desktop.mp4',
    mobile: '/videos/mobile.mp4',
  },
});
```

## Viewport Playback

Use viewport playback when videos should react to scroll position.

```html
<video
  data-fideo
  data-fideo-muted="true"
  data-fideo-viewport="play-pause"
  data-fideo-viewport-threshold="0.45"
  data-fideo-src="/videos/story.mp4"
></video>
```

| Value | Behavior |
| --- | --- |
| `play` | Play when the video enters the viewport. |
| `pause` | Pause when the video exits the viewport. |
| `play-pause` | Play on enter and pause on exit. |
| `false` | Disable viewport playback. |

## Controls

Fideo controls are custom and can be shown, hidden, or themed. If `controls` is false, Fideo shows no custom controls and disables native controls.

```html
<video
  data-fideo
  data-fideo-controls="false"
  data-fideo-src="/videos/silent-loop.mp4"
></video>
```

Show only the controls you need:

```html
<video
  data-fideo
  data-fideo-show-play="true"
  data-fideo-show-timeline="true"
  data-fideo-show-time="false"
  data-fideo-show-volume="false"
  data-fideo-show-settings="false"
  data-fideo-show-fullscreen="false"
  data-fideo-src="/videos/clip.mp4"
></video>
```

Control visibility through JavaScript:

```ts
new Fideo('#player', {
  controlVisibility: {
    play: true,
    timeline: true,
    currentTime: false,
    duration: false,
    volume: false,
    settings: false,
    fullscreen: true,
  },
});
```

## Styling

Every visible UI element is styled with CSS variables. Override globally, per wrapper, with data attributes, or through the `cssVars` option.

```css
.fideo {
  --fideo-accent: #46d9a7;
  --fideo-bg: transparent;
  --fideo-control-bg: transparent;
  --fideo-control-color: #ffffff;
  --fideo-muted-color: rgba(255, 255, 255, 0.92);
  --fideo-track: rgba(255, 255, 255, 0.46);
  --fideo-track-fill: rgba(255, 255, 255, 0.9);
  --fideo-track-size: 5px;
  --fideo-thumb-size: 13px;
  --fideo-radius: 8px;
  --fideo-button-size: 26px;
  --fideo-button-radius: 4px;
  --fideo-icon-size: 17px;
  --fideo-gap: 10px;
}
```

Per element:

```html
<video
  data-fideo
  data-fideo-accent="#ff6f61"
  data-fideo-control-color="#ffffff"
  data-fideo-track="rgba(255,255,255,.36)"
  data-fideo-src="/videos/clip.mp4"
></video>
```

With JavaScript:

```ts
new Fideo('#player', {
  cssVars: {
    '--fideo-accent': '#66a3ff',
    '--fideo-radius': '6px',
  },
});
```

## Shadow DOM Parts

Controls render inside a Shadow DOM so internal styles can't leak in or out. For deeper customisation beyond CSS variables, individual control elements are exposed via the [`::part()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) pseudo-element on the `.fideo__controls` host element:

```css
.fideo__controls::part(play-button) {
  background: rgba(0, 0, 0, 0.55);
  border-radius: 999px;
}

.fideo__controls::part(timeline) {
  height: 8px;
}

.fideo__controls::part(current-time),
.fideo__controls::part(duration),
.fideo__controls::part(time-separator) {
  font-variant-numeric: tabular-nums;
}
```

| Part | Element |
| --- | --- |
| `play-button` | Play/pause toggle. |
| `mute-button` | Mute/unmute toggle. |
| `volume-slider` | Volume range input. |
| `timeline` | Seek bar range input. |
| `current-time` | Current-time text span. |
| `duration` | Duration text span. |
| `time-separator` | Slash separator between current time and duration. |
| `settings-button` | Settings (playback rate) toggle. |
| `settings-menu` | Playback-rate dropdown container. |
| `speed-button` | Individual playback-rate option button. |
| `fullscreen-button` | Fullscreen toggle. |

## Custom Icons

Pass inline SVG strings for any control icon:

```ts
initFideo({
  icons: {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  },
});
```

Supported icon keys:

| Key | Purpose |
| --- | --- |
| `play` | Play button |
| `pause` | Pause button |
| `volume` | Full-volume icon |
| `volumeLow` | Low-volume icon |
| `muted` | Muted icon |
| `settings` | Playback-rate menu |
| `fullscreen` | Enter fullscreen |
| `fullscreenExit` | Exit fullscreen |

## Provider Support

| Provider | Element | URL formats accepted |
| --- | --- | --- |
| HTML5 / MP4 | `<video>` | Local files and any browser-supported media format. |
| YouTube | `<iframe>` | `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, and existing `/embed/` URLs. All are normalized to `youtube-nocookie.com/embed/...`. |
| Vimeo | `<iframe>` | Public, private, and unlisted URLs, including `vimeo.com/{id}/{hash}` and existing `player.vimeo.com/video/{id}?h=` URLs. |
| Wistia | `<iframe>` | `fast.wistia.com/embed/medias/{id}` and `iframe/{id}`. Fideo swaps the iframe for a `<wistia-player>` custom element under the hood. |

Provider detection is automatic for normal provider URLs in `src`, `data-fideo-src`, responsive source attributes, and JavaScript `sources`. Use `provider` or `data-fideo-provider` only when a URL is unusual enough that Fideo cannot infer it.

### YouTube No-Cookie URLs

Fideo normalizes common YouTube URL formats:

```html
<iframe
  data-fideo
  src="https://www.youtube.com/watch?v=M7lc1UVf-VE"
></iframe>
```

Becomes:

```text
https://www.youtube-nocookie.com/embed/M7lc1UVf-VE
```

Looping YouTube videos automatically receive the required `playlist` parameter.

### Private Vimeo URLs

Vimeo private or unlisted URLs can include a hash:

```text
https://vimeo.com/123456789/5e2d1c1e6d
```

Fideo converts that into the proper embed format:

```text
https://player.vimeo.com/video/123456789?h=5e2d1c1e6d
```

Existing Vimeo embed URLs with `?h=` are preserved.

### Opting Out Of Provider SDKs

If your page only uses certain providers, you can prevent the unused provider JavaScript SDKs from loading:

```ts
initFideo({
  disabledProviders: ['wistia', 'vimeo'],
});
```

Per-player:

```ts
new Fideo('#player', {
  disabledProviders: ['wistia'],
  sources: { desktop: '/video.mp4' },
});
```

When a disabled provider is requested, Fideo throws an error. Supported provider names: `html5`, `youtube`, `vimeo`, `wistia`.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `selector` | `string` | `[data-fideo]` | Selector used by `initFideo()`. |
| `provider` | `auto`, `html5`, `youtube`, `vimeo`, `wistia` | `auto` | Optional provider override. Fideo infers providers from URLs by default. |
| `autoplay` | `boolean` | `false` | Start playback after initialization. |
| `muted` | `boolean` | `false` | Start muted. |
| `loop` | `boolean` | `false` | Loop playback when supported. |
| `playsInline` | `boolean` | `true` | Prefer inline playback on mobile. |
| `controls` | `boolean` | `true` | Show Fideo controls. |
| `background` | `boolean` | `false` | Enable background-video mode. |
| `backgroundAspectRatio` | `number` or ratio `string` | `16 / 9` | Original source video ratio used for iframe cover sizing, e.g. `16 / 9`, `16:9`, or `16/9`. |
| `controlVisibility` | `Partial<FideoControlVisibility>` | all visible | Show or hide individual controls. |
| `viewport` | `false`, `play`, `pause`, `play-pause` | `false` | Viewport playback behavior. |
| `viewportThreshold` | `number` | `0.35` | Intersection ratio required for viewport playback. |
| `volume` | `number` | `1` | Initial volume from `0` to `1`. |
| `playbackRates` | `number[]` | `[0.5, 1, 1.25, 1.5, 2]` | Playback speed options. |
| `sources` | `string \| FideoSources` | `{}` | Media source. Pass a string for a single source (treated as `{ desktop: '...' }`), or an object with `desktop` / `tablet` / `mobile` keys for responsive switching. |
| `posters` | `string \| FideoPosters` | `{}` | Poster image. Pass a string for a single poster, or an object for responsive variants. Posters stay visible while the player is paused/loading and fade out on play. |
| `breakpoints` | `Partial<FideoBreakpoints>` | `{ mobile: 767, tablet: 1024 }` | Responsive cutoffs. |
| `icons` | `FideoIcons` | `{}` | Custom SVG icons. |
| `className` | `string` | `''` | Additional wrapper class. |
| `cssVars` | `Record<string, string>` | `{}` | CSS variable overrides. |
| `disabledProviders` | `FideoProviderName[]` | `[]` | Prevent loading provider SDKs for providers you do not use. |

## Data Attributes

| Attribute | Purpose |
| --- | --- |
| `data-fideo` | Marks a `<video>` or `<iframe>` for auto initialization. |
| `data-fideo-provider` | Optional provider override: `auto`, `html5`, `youtube`, `vimeo`, or `wistia`. |
| `data-fideo-autoplay` | Starts playback on init. Muted autoplay is the most reliable browser path. |
| `data-fideo-muted` | Starts muted. |
| `data-fideo-loop` | Loops playback when the provider supports it. |
| `data-fideo-playsinline` | Enables inline playback. |
| `data-fideo-controls` | `true` for Fideo controls, `false` for no custom or native controls. |
| `data-fideo-background` | Enables background-video mode. |
| `data-fideo-background-aspect-ratio` | Original source video ratio for background iframes, e.g. `16:9`, `16/9`, or `1.777777778`. |
| `data-fideo-viewport` | `play`, `pause`, `play-pause`, or `false`. |
| `data-fideo-viewport-threshold` | Intersection ratio needed before viewport playback runs. |
| `data-fideo-volume` | Initial volume from `0` to `1`. |
| `data-fideo-playback-rates` | Comma-separated playback speeds, e.g. `0.5,1,1.5,2`. |
| `data-fideo-src`, `data-fideo-src-tablet`, `data-fideo-src-mobile` | Responsive video/embed sources. |
| `data-fideo-poster`, `data-fideo-poster-tablet`, `data-fideo-poster-mobile` | Responsive poster images for both native video and iframe providers. |
| `data-fideo-breakpoint-mobile`, `data-fideo-breakpoint-tablet` | Responsive cutoffs in pixels. |
| `data-fideo-show-play` | Show or hide the play/pause button. |
| `data-fideo-show-timeline` | Show or hide the seek bar. |
| `data-fideo-show-time` | Show or hide both time labels. |
| `data-fideo-show-current-time`, `data-fideo-show-duration` | Control individual time labels. |
| `data-fideo-show-volume` | Show or hide mute and volume controls. |
| `data-fideo-show-settings` | Show or hide playback-rate settings. |
| `data-fideo-show-fullscreen` | Show or hide fullscreen control. |
| `data-fideo-accent` | Sets `--fideo-accent`. |
| `data-fideo-control-bg` | Sets `--fideo-control-bg`. |
| `data-fideo-control-color` | Sets `--fideo-control-color`. |
| `data-fideo-track` | Sets `--fideo-track`. |
| `data-fideo-track-fill` | Sets `--fideo-track-fill`. |
| `data-fideo-radius` | Sets `--fideo-radius`. |
| `data-fideo-class` | Adds a class to the generated Fideo wrapper. |

## Compiled Files

The compiled browser files are committed in `dist/` for users who want to download Fideo JS directly from the repository without running a build.

| File | Use |
| --- | --- |
| `dist/fideo.global.js` | Browser global build. Adds `Fideo`, `initFideo`, `createFideo`, and `mountFideo` to `window`. Best for CDN or direct `<script>` usage. |
| `dist/fideo.js` | ES module build. |
| `dist/fideo.umd.cjs` | UMD/CommonJS-compatible build used by package tooling. |
| `dist/fideo.css` | Fideo control styles. |
| `dist/styles.css` | Legacy stylesheet alias kept for older direct-link snippets. |
| `dist/index.d.ts` | TypeScript declarations. |

For direct browser usage:

```html
<link rel="stylesheet" href="./dist/fideo.css" />
<script src="./dist/fideo.global.js"></script>
<script>
  Fideo.init();
</script>
```

## Development

Clone the repo, install dependencies, and run the demo page:

```bash
npm install
npm run dev
```

Run the full validation suite:

```bash
npm run check
```

Individual commands:

```bash
npm run typecheck
npm run test
npm run build
```

## Browser Notes

Autoplay is controlled by browser policy. Muted autoplay is the most reliable path, especially for iframe providers. Background mode enables muted playback automatically.

YouTube no-cookie embeds reduce cookies on page load, but playback can still send data to YouTube. Consent and privacy requirements may still apply depending on your implementation and jurisdiction.

## License

MIT. See [LICENSE](./LICENSE).
