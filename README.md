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
</p>

<p align="center">
  <a href="./examples/index.html">Demo Source</a>
  ·
  <a href="#quick-start">Quick Start</a>
</p>

Fideo JS turns normal `<video>` and `<iframe>` elements into polished, configurable video experiences. Keep your markup simple, add `data-fideo`, and get custom controls, responsive sources, posters, viewport playback, background video mode, and provider normalization without giving up control of your HTML.

## Highlights

- Works with native video, YouTube, Vimeo, and Wistia.
- Data-attribute initialization for simple CMS and template usage.
- JavaScript object initialization for app-style usage, similar to Plyr.
- Custom UI for play/pause, timeline, volume, playback speed, and fullscreen.
- Per-control visibility options.
- CSS variable theming for colors, tracks, radius, and control styling.
- Custom SVG icon support through JavaScript.
- Responsive sources and posters for desktop, tablet, and mobile.
- Viewport autoplay and auto-pause.
- Background video mode for heroes, banners, and tiles.
- YouTube URLs normalize to `youtube-nocookie.com` embeds.
- Vimeo private/unlisted URLs with hashes are normalized to the `h` embed parameter.

## Install

```bash
npm install fideo-js
```

Import the JavaScript and stylesheet:

```ts
import { initFideo } from 'fideo-js';
import 'fideo-js/styles.css';

initFideo();
```

Or use the browser bundle:

```html
<link rel="stylesheet" href="./dist/styles.css" />
<script src="./dist/fideo.global.js"></script>
<script>
  Fideo.init();
</script>
```

## CDN

Because the compiled files are committed in `dist/`, Fideo JS can be loaded directly from jsDelivr.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devjtv/fideo-js@v0.1.10/dist/styles.css" />
<script src="https://cdn.jsdelivr.net/gh/devjtv/fideo-js@v0.1.10/dist/fideo.global.js"></script>
<script>
  Fideo.init();
</script>
```

For production sites, prefer pinning a tag or release instead of `main` once one exists:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devjtv/fideo-js@v0.1.10/dist/styles.css" />
<script src="https://cdn.jsdelivr.net/gh/devjtv/fideo-js@v0.1.10/dist/fideo.global.js"></script>
```

ES module usage is also available:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devjtv/fideo-js@v0.1.10/dist/styles.css" />
<script type="module">
  import { initFideo } from 'https://cdn.jsdelivr.net/gh/devjtv/fideo-js@v0.1.10/dist/fideo.js';

  initFideo();
</script>
```

## Compiled Files

The compiled browser files are committed in `dist/` for users who want to download Fideo JS directly from the repository without running a build.

| File | Use |
| --- | --- |
| `dist/fideo.global.js` | Browser global build. Adds `Fideo`, `initFideo`, `createFideo`, and `mountFideo` to `window`. Best for CDN or direct `<script>` usage. |
| `dist/fideo.js` | ES module build. |
| `dist/fideo.umd.cjs` | UMD/CommonJS-compatible build used by package tooling. |
| `dist/styles.css` | Fideo control styles. |
| `dist/index.d.ts` | TypeScript declarations. |

For direct browser usage:

```html
<link rel="stylesheet" href="./dist/styles.css" />
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

Fideo will normalize that YouTube URL to a no-cookie embed URL and add the provider API parameters it needs. When poster images are configured, Fideo renders them as a visual cover while the player is paused or still getting ready, then fades them away when playback starts.

## JavaScript Initialization

If you do not want configuration in markup, initialize with a JS object:

```ts
import { Fideo } from 'fideo-js';
import 'fideo-js/styles.css';

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
  --fideo-radius: 8px;
  --fideo-button-size: 26px;
  --fideo-gap: 12px;
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

| Provider | Element | Notes |
| --- | --- | --- |
| HTML5 / MP4 | `<video>` | Supports local files and any browser-supported media format. |
| YouTube | `<iframe>` | Normalizes watch, shorts, youtu.be, and embed URLs to `youtube-nocookie.com/embed/...`. |
| Vimeo | `<iframe>` | Supports public, private, and unlisted URLs, including `vimeo.com/[id]/[hash]`. |
| Wistia | `<iframe>` | Uses the Wistia external player API. |

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
| `sources` | `FideoSources` | `{}` | Responsive media sources. |
| `posters` | `FideoPosters` | `{}` | Responsive poster images. Fideo keeps them visible while the player is paused or waiting, and fades them out once playback starts. |
| `breakpoints` | `Partial<FideoBreakpoints>` | `{ mobile: 767, tablet: 1024 }` | Responsive cutoffs. |
| `icons` | `FideoIcons` | `{}` | Custom SVG icons. |
| `className` | `string` | `''` | Additional wrapper class. |
| `cssVars` | `Record<string, string>` | `{}` | CSS variable overrides. |

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

## Events

Fideo forwards provider state changes as DOM events on the original media element.

```ts
const video = document.querySelector('[data-fideo]')!;

video.addEventListener('fideo:play', (event) => {
  console.log(event.detail.player);
  console.log(event.detail.state);
});
```

Available events:

| Event | Description |
| --- | --- |
| `fideo:play` | Playback started. |
| `fideo:pause` | Playback paused. |
| `fideo:ended` | Playback ended. |
| `fideo:timeupdate` | Current time changed. |
| `fideo:volumechange` | Volume or muted state changed. |
| `fideo:change` | General state update. |

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
