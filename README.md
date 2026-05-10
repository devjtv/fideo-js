# Fideo JS

Fideo JS is a lightweight video UI plugin for normal `<video>` and `<iframe>` embeds. Add `data-fideo`, include the stylesheet, and Fideo gives local files, YouTube, Vimeo, and Wistia a consistent customizable control layer.

## Install

```bash
npm install fideo-js
```

```ts
import { Fideo, initFideo } from 'fideo-js';
import 'fideo-js/styles.css';

initFideo();

const player = new Fideo('#player', {
  muted: true,
  sources: {
    desktop: '/videos/desktop.mp4',
  },
});
```

Or use the browser global from the bundled UMD file:

```html
<link rel="stylesheet" href="./dist/styles.css" />
<script src="./dist/fideo.umd.cjs"></script>
<script>
  Fideo.init();

  const player = new Fideo('#player', {
    muted: true,
    sources: {
      desktop: '/videos/desktop.mp4',
    },
  });
</script>
```

## Basic Use

```html
<video
  data-fideo
  data-fideo-poster="/posters/desktop.jpg"
  data-fideo-poster-mobile="/posters/mobile.jpg"
  data-fideo-src="/videos/desktop.mp4"
  data-fideo-src-tablet="/videos/tablet.mp4"
  data-fideo-src-mobile="/videos/mobile.mp4"
  data-fideo-muted
  data-fideo-viewport="play-pause"
></video>
```

```html
<iframe
  data-fideo
  data-fideo-provider="youtube"
  data-fideo-muted="true"
  data-fideo-viewport="pause"
  src="https://www.youtube-nocookie.com/embed/M7lc1UVf-VE"
></iframe>
```

## Data Attributes

| Attribute | Purpose |
| --- | --- |
| `data-fideo` | Marks a `<video>` or `<iframe>` for auto initialization. |
| `data-fideo-provider` | `auto`, `html5`, `youtube`, `vimeo`, or `wistia`. |
| `data-fideo-autoplay` | Starts playback on init. Muted autoplay is the most reliable browser path. |
| `data-fideo-muted` | Starts muted. |
| `data-fideo-loop` | Loops playback when the provider supports it. |
| `data-fideo-controls` | `true` for Fideo controls, `false` for no custom or native controls. |
| `data-fideo-background` | Background mode: autoplay, muted, looped, inline, no controls, and cover-filled in the parent container. |
| `data-fideo-background-aspect-ratio` | Source aspect ratio for background iframes. Default: `1.777777778` (`16 / 9`). |
| `data-fideo-viewport` | `play`, `pause`, `play-pause`, or `false`. |
| `data-fideo-viewport-threshold` | Intersection ratio needed before viewport playback runs. Default: `0.35`. |
| `data-fideo-src`, `data-fideo-src-tablet`, `data-fideo-src-mobile` | Responsive video/embed sources. |
| `data-fideo-poster`, `data-fideo-poster-tablet`, `data-fideo-poster-mobile` | Responsive HTML5 posters. |
| `data-fideo-breakpoint-mobile`, `data-fideo-breakpoint-tablet` | Responsive cutoffs in pixels. Defaults: `767`, `1024`. |
| `data-fideo-show-play` | Show or hide the play/pause button. |
| `data-fideo-show-timeline` | Show or hide the seek bar. |
| `data-fideo-show-time` | Show or hide both time labels. |
| `data-fideo-show-current-time`, `data-fideo-show-duration` | Control individual time labels. |
| `data-fideo-show-volume` | Show or hide mute and volume controls. |
| `data-fideo-show-settings` | Show or hide playback-rate settings. |
| `data-fideo-show-fullscreen` | Show or hide fullscreen control. |
| `data-fideo-accent`, `data-fideo-control-bg`, `data-fideo-control-color` | Quick CSS variable overrides. |

## JavaScript API

Fideo can be initialized with data attributes, with JavaScript options, or with both. JavaScript options are useful when you do not want video configuration in markup.

```ts
import { Fideo, createFideo, mountFideo } from 'fideo-js';

const player = new Fideo('#player', {
  autoplay: true,
  muted: true,
  loop: true,
  controls: false,
  sources: {
    desktop: '/videos/background-loop.mp4',
    mobile: '/videos/background-loop-mobile.mp4',
  },
  posters: {
    desktop: '/posters/background-loop.jpg',
    mobile: '/posters/background-loop-mobile.jpg',
  },
});

player.play();
```

Browser global:

```html
<script src="path/to/fideo.umd.cjs"></script>
<script>
  const player = new Fideo('#player', {
    muted: true,
    viewport: 'play-pause',
    sources: {
      desktop: '/videos/desktop.mp4',
    },
  });
</script>
```

Helper functions are still available:

```ts
import { Fideo, createFideo, mountFideo } from 'fideo-js';

const pagePlayers = Fideo.init({
  selector: '[data-video]',
  controlVisibility: {
    volume: false,
    settings: false,
  },
  cssVars: {
    '--fideo-accent': '#ff4f8b',
  },
});

const singlePlayer = mountFideo(document.querySelector('video')!, {
  autoplay: true,
  muted: true,
  viewport: 'play-pause',
});

const objectPlayer = createFideo('#object-player', {
  controls: false,
  sources: {
    desktop: '/videos/object-player.mp4',
  },
});

singlePlayer.play();
pagePlayers.destroy();
objectPlayer.destroy();
```

## Background Video

Use `background: true` or `data-fideo-background="true"` when a video should behave like a full-cover hero, banner, or tile background. Fideo automatically enables autoplay, mute, loop, inline playback, hides all controls, and sizes the media to cover its parent.

```html
<div class="hero-video">
  <video
    data-fideo
    data-fideo-background="true"
    data-fideo-src="/videos/hero.mp4"
    data-fideo-poster="/posters/hero.jpg"
  ></video>
</div>
```

```ts
new Fideo('#hero-player', {
  background: true,
  sources: {
    desktop: '/videos/hero.mp4',
    mobile: '/videos/hero-mobile.mp4',
  },
});
```

Native `<video>` uses CSS `object-fit: cover`. Iframe providers cannot use `object-fit` reliably, so Fideo calculates the iframe dimensions from the container size and source aspect ratio. Set `backgroundAspectRatio` or `data-fideo-background-aspect-ratio` if the source is not `16 / 9`.

```html
<iframe
  data-fideo
  data-fideo-provider="vimeo"
  data-fideo-background="true"
  data-fideo-background-aspect-ratio="1.777777778"
  src="https://vimeo.com/76979871"
></iframe>
```

The same background API works across MP4, Vimeo, and YouTube:

```html
<video data-fideo data-fideo-background="true" data-fideo-src="/videos/clip.mp4"></video>

<iframe
  data-fideo
  data-fideo-provider="vimeo"
  data-fideo-background="true"
  src="https://vimeo.com/76979871"
></iframe>

<iframe
  data-fideo
  data-fideo-provider="youtube"
  data-fideo-background="true"
  src="https://www.youtube.com/watch?v=M7lc1UVf-VE"
></iframe>
```

## Styling

Every visible control is styled with CSS variables. Override them globally, per wrapper, through data attributes, or with the `cssVars` option.

```css
.fideo {
  --fideo-accent: #46d9a7;
  --fideo-control-bg: rgba(9, 12, 16, 0.78);
  --fideo-control-color: #ffffff;
  --fideo-track: rgba(255, 255, 255, 0.28);
  --fideo-track-fill: var(--fideo-accent);
  --fideo-radius: 8px;
}
```

Custom SVG icons can be supplied in JS:

```ts
initFideo({
  icons: {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  },
});
```

## Provider Notes

Fideo loads provider APIs only when needed:

- YouTube uses the YouTube IFrame Player API and normalizes YouTube, youtu.be, and standard embed URLs to `youtube-nocookie.com/embed/...` while preserving player parameters. Looping YouTube embeds include the required `playlist` parameter automatically.
- Vimeo uses Vimeo `player.js`. Fideo supports `vimeo.com/[video_id]`, `vimeo.com/[video_id]/[hash]`, and `player.vimeo.com/video/[video_id]?h=[hash]` formats. Private/unlisted page URLs with a hash are normalized to player embed URLs with the hash in the `h` parameter.
- Wistia iframe embeds use Wistia's external player API.
- HTML5 videos use the browser media APIs and can play any local format supported by the visitor's browser.

For iframe providers, browser autoplay rules still apply. Use `data-fideo-muted="true"` for the best autoplay and viewport-playback reliability. YouTube no-cookie embeds reduce cookies on page load, but playback can still send data to YouTube, so consent requirements may still apply depending on your jurisdiction.
