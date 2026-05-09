# Fideo JS

Fideo JS is a lightweight video UI plugin for normal `<video>` and `<iframe>` embeds. Add `data-fideo`, include the stylesheet, and Fideo gives local files, YouTube, Vimeo, and Wistia a consistent customizable control layer.

## Install

```bash
npm install fideo-js
```

```ts
import { initFideo } from 'fideo-js';
import 'fideo-js/styles.css';

initFideo();
```

Or use the browser global from the bundled UMD file:

```html
<link rel="stylesheet" href="./dist/styles.css" />
<script src="./dist/fideo.umd.cjs"></script>
<script>
  Fideo.init();
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
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
></iframe>
```

## Data Attributes

| Attribute | Purpose |
| --- | --- |
| `data-fideo` | Marks a `<video>` or `<iframe>` for auto initialization. |
| `data-fideo-provider` | `auto`, `html5`, `youtube`, `vimeo`, or `wistia`. |
| `data-fideo-autoplay` | Starts playback on init. Muted autoplay is the most reliable browser path. |
| `data-fideo-muted` | Starts muted. |
| `data-fideo-loop` | Loops HTML5 video. |
| `data-fideo-viewport` | `play`, `pause`, `play-pause`, or `false`. |
| `data-fideo-viewport-threshold` | Intersection ratio needed before viewport playback runs. Default: `0.35`. |
| `data-fideo-src`, `data-fideo-src-tablet`, `data-fideo-src-mobile` | Responsive video/embed sources. |
| `data-fideo-poster`, `data-fideo-poster-tablet`, `data-fideo-poster-mobile` | Responsive HTML5 posters. |
| `data-fideo-breakpoint-mobile`, `data-fideo-breakpoint-tablet` | Responsive cutoffs in pixels. Defaults: `767`, `1024`. |
| `data-fideo-accent`, `data-fideo-control-bg`, `data-fideo-control-color` | Quick CSS variable overrides. |

## JavaScript API

```ts
import { Fideo, mountFideo } from 'fideo-js';

const pagePlayers = Fideo.init({
  selector: '[data-video]',
  cssVars: {
    '--fideo-accent': '#ff4f8b',
  },
});

const singlePlayer = mountFideo(document.querySelector('video')!, {
  autoplay: true,
  muted: true,
  viewport: 'play-pause',
});

singlePlayer.play();
pagePlayers.destroy();
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

- YouTube uses the YouTube IFrame Player API.
- Vimeo uses Vimeo `player.js`.
- Wistia iframe embeds use Wistia's external player API.
- HTML5 videos use the browser media APIs and can play any local format supported by the visitor's browser.

For iframe providers, browser autoplay rules still apply. Use `data-fideo-muted="true"` for the best autoplay and viewport-playback reliability.
