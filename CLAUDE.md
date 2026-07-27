# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server on 127.0.0.1, opens examples/index.html
npm run test       # vitest run (jsdom, globals enabled)
npm run typecheck  # tsc --noEmit over src, tests, and config files
npm run build      # vite lib build -> copy-global-build.mjs -> tsc -p tsconfig.types.json
npm run build:site # build, then scripts/build-site.mjs -> site/ for Cloudflare (wrangler.jsonc)
npm run check      # typecheck + test + build (run this before releasing)
```

Single test file / single test:

```bash
npx vitest run tests/options.test.ts
npx vitest run -t "background video"
```

`dist/` is **committed to the repo** (not gitignored) so users can link builds straight from GitHub/CDN. Any change to `src/` that ships must be followed by `npm run build` and the regenerated `dist/` committed. `site/` is generated and gitignored.

## Architecture

Zero-dependency TypeScript library. Single entry `src/index.ts`, built by Vite in library mode to ES (`fideo.js`), UMD (`fideo.umd.cjs`), plus a copied `fideo.global.js` (browser global) and `fideo.css` (+ `styles.css` legacy alias).

Layering, outermost to innermost:

1. **`src/index.ts`** — public API (`Fideo` class, `createFideo`, `initFideo`, `mountFideo`) and instance registry. A module-level `WeakMap<Element, FideoPlayer>` makes `mountFideo` idempotent — mounting the same element twice returns the existing player. On load it assigns the API onto `window` and, when loaded as a classic script (`document.currentScript != null`), auto-runs `initFideo(window.__fideoAutoInit)` on `DOMContentLoaded`.
2. **`src/utils/dom.ts`** — `resolveOptions()` merges `data-fideo-*` attributes with the JS options object into a fully-resolved `FideoResolvedOptions`. **Data attributes win over JS options**; `background: true` force-enables `autoplay`/`muted`/`loop`/`playsInline`. This file also holds provider inference (`inferProvider`) and URL normalization (`normalizeYouTubeEmbedUrl` → youtube-nocookie/embed, `normalizeVimeoEmbedUrl` → player.vimeo.com with `?h=` hash).
3. **`src/fideo-player.ts`** — `FideoPlayer` owns DOM lifecycle: wraps the element in `div.fideo`, applies state classes (`is-ready`, `is-playing`, `is-paused`, `is-poster-visible`, `is-user-active`, `is-fullscreen`), poster overlay `<img>`, click-target button + keyboard shortcuts, IntersectionObserver viewport play/pause, ResizeObserver background cover math, and responsive source/poster swapping on resize. Re-emits every adapter event on the media element as a bubbling `fideo:<event>` CustomEvent (`fideo:play`, `fideo:pause`, `fideo:ended`, `fideo:timeupdate`, `fideo:volumechange`, `fideo:change`).
4. **`src/providers/`** — one adapter per backend behind the `FideoAdapter` interface (`src/types.ts`). `createProvider()` in `providers/index.ts` is the factory. `BaseProvider` (`providers/base.ts`) extends `EventTarget` and holds the normalized `FideoState`; subclasses call `this.update(patch, eventName)` to mutate state and dispatch.
5. **`src/ui.ts`** — `FideoControls` renders the control bar **inside a Shadow DOM** (`attachShadow({mode:'open'})`). External styling is therefore only possible via CSS custom properties (`--fideo-accent`, `--fideo-radius`, …) and `::part()` names (`play-button`, `timeline`, `settings-menu`, …). Adding a new control means adding a `part=` attribute and documenting it in the README table.
6. **`src/styles/`** — the stylesheet is split by scope and that split is load-bearing. `host.css` holds everything that must match in the main document, including `.fideo__controls` itself (the shadow *host* is styled from the page — a shadow root cannot style its own host with those selectors). `controls.css` holds shadow-internal rules only. `styles/index.ts` owns both: `injectHostStyles()` prepends `host.css` to `<head>` once per document (id `fideo-host-styles`, opt out with `injectStyles: false`), and `adoptControlsStyles()` hands every shadow root **one shared constructable `CSSStyleSheet`**, falling back to a cloned `<style>` where unsupported. `index.ts` also imports `host.css` as a side effect so Vite still emits `dist/fideo.css`.

### Cross-cutting invariants

- **A CSS rule must live in the half whose scope it matches.** A page-scope rule placed in `controls.css` silently never applies, and vice versa. When adding a rule, ask which side of the shadow boundary its selector resolves in.
- **The timeline render path is write-throttled.** `syncPlaybackState` runs up to 60×/s from the rAF interpolation loop; every setter it calls guards against unchanged values (`lastRenderedTime`, `lastTrackProgress`, `lastBufferedProgress`, `lastRenderedRate`). New per-frame writes need the same guard, and anything that writes those DOM nodes outside the render path (e.g. `previewSeek`) must invalidate the matching cache.

- **Adding a provider** requires: a `BaseProvider` subclass, a branch in `createProvider`/`createIframeProvider`, a regex in `inferProvider`, the name added to `FideoProviderName`, and a check against `options.disabledProviders` (which throws).
- **Lazy loading** is the default for all iframe providers. `LazyIframeProvider` in `providers/index.ts` is a proxy adapter: it strips `src` into `data-fideo-lazy-src`, buffers volume/muted state, and swaps in the real adapter on intersection (or immediately when `IntersectionObserver` is missing). New adapter methods must be forwarded here too, or lazy players silently diverge from eager ones.
- **Provider SDKs load on demand** via `utils/script.ts` `loadScript()` (a promise cache keyed by URL): Vimeo `player.js`, Wistia `player.js`, YouTube `iframe_api`. `disabledProviders` exists so pages can guarantee an SDK never loads.
- **Wistia** replaces the iframe with a `<wistia-player>` custom element; background-cover math in `FideoPlayer.applyBackgroundCover()` explicitly skips Wistia and `<video>`.
- **Teardown must be complete.** `FideoPlayer` uses two `AbortController`s (`resizeController`, `lifecycleController`) for listener cleanup; `destroy()` unwraps the element, removes generated nodes/classes, and evicts the WeakMap entry. New listeners must be registered with a `signal`, and new generated DOM must be removed in `destroy()` — tests assert clean remount.

### Tests

`tests/player.test.ts` (behaviour), `tests/options.test.ts` (attribute/option resolution), `tests/ui.test.ts` (`formatTime`). jsdom lacks `IntersectionObserver`, `HTMLMediaElement.play/pause/load`, and the provider SDKs — the `beforeEach` block stubs them and resets `window.YT` / `document.head`. When testing new provider or viewport behaviour, extend those stubs rather than mocking the module.

`vitest.config.ts` sets `css: true` deliberately: with Vitest's default CSS stubbing, every `?inline` import resolves to an empty string and the injected/adopted stylesheets appear to work while carrying no rules.

### Demo site

`examples/` is served by `npm run dev` and compiled to `site/` by `scripts/build-site.mjs`, which walks nested directories and rewrites `../../dist/` → `../dist/` per nesting level. `examples/media/` holds an ffmpeg-generated clip and posters so no demo depends on an external video host.

- `examples/index.html` — the marketing overview.
- `examples/docs/` — the documentation section. Page chrome (sidebar, prev/next, version injection) is rendered by `_assets/docs.js` from a single `PAGES` array; adding a page means adding one entry there plus the HTML file. Shared styling is `_assets/docs.css` — pages carry no `<style>` block except for genuinely page-specific rules.
- `examples/improvements.html` — a benchmark page that A/B tests the current build against `examples/bench/fideo-0.6.0.*`, a pinned copy of the v0.6.0 bundle committed on purpose so the comparison needs no network.

Two traps when editing docs pages:

- **Every page narrows auto-init** with `window.__fideoAutoInit = { selector: '[data-fideo-auto]' }` before loading the library, so demos can mount on their own terms. A demo element carrying a bare `data-fideo` will otherwise be claimed by the auto pass.
- **Section anchors and demo element IDs share a namespace.** `<h2 id="playground">` next to `<video id="playground">` makes `querySelector` return the heading, and mounting throws `Fideo html5 provider needs a <video> element`. Suffix demo elements (`#playground-player`).

CDN snippets in the examples use `v__FIDEO_VERSION__`, substituted at build time from `package.json`. They point at jsDelivr's `gh/` path — the package is not published to npm, so `cdn.jsdelivr.net/npm/fideo-js` 404s.

### Docs

`README.md` is the user-facing reference and is expected to stay in sync: option table, data-attribute table, `::part()` table, icon keys, and provider URL support. Update it in the same change as any public API surface change.
