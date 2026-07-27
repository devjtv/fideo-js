/*
 * Shared benchmark harness. Loaded inside two isolated iframes — one running
 * the pinned v0.6.0 build, one running the current build — so both are
 * measured by identical code under identical conditions.
 *
 * Everything here measures the real library. Nothing is simulated except the
 * clock source for playback state, which drives the same rAF timeline loop
 * that runs during genuine playback.
 */

const PLAYER_COUNT = 6;
const SAMPLE_MS = 3000;
const FAKE_DURATION = 3904; // 1:05:04 — long enough to exercise hour formatting.

/** Counts real DOM mutations performed by the library while the timeline runs. */
function instrumentDomWrites() {
  const counts = { setProperty: 0, setAttribute: 0, textContent: 0, inputValue: 0 };
  let recording = false;

  const styleProto = CSSStyleDeclaration.prototype;
  const originalSetProperty = styleProto.setProperty;
  styleProto.setProperty = function (...args) {
    if (recording) counts.setProperty += 1;
    return originalSetProperty.apply(this, args);
  };

  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (...args) {
    if (recording) counts.setAttribute += 1;
    return originalSetAttribute.apply(this, args);
  };

  const textContentDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
  Object.defineProperty(Node.prototype, 'textContent', {
    ...textContentDescriptor,
    set(value) {
      if (recording) counts.textContent += 1;
      return textContentDescriptor.set.call(this, value);
    },
  });

  const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  Object.defineProperty(HTMLInputElement.prototype, 'value', {
    ...valueDescriptor,
    set(value) {
      if (recording) counts.inputValue += 1;
      return valueDescriptor.set.call(this, value);
    },
  });

  return {
    start() {
      recording = true;
    },
    stop() {
      recording = false;
      return { ...counts, total: counts.setProperty + counts.setAttribute + counts.textContent + counts.inputValue };
    },
  };
}

/** Walks every mounted player and totals the CSS actually attached to it. */
function measureStyles(players) {
  let inlineStyleNodes = 0;
  let inlineStyleBytes = 0;
  let adoptedSheets = 0;
  let cssRules = 0;
  const uniqueSheets = new Set();

  for (const player of players) {
    const host = player.wrapper.querySelector('.fideo__controls');
    const root = host && host.shadowRoot;
    if (!root) continue;

    for (const style of root.querySelectorAll('style')) {
      inlineStyleNodes += 1;
      inlineStyleBytes += style.textContent.length;
      if (style.sheet) cssRules += style.sheet.cssRules.length;
    }

    for (const sheet of root.adoptedStyleSheets || []) {
      adoptedSheets += 1;
      uniqueSheets.add(sheet);
      cssRules += sheet.cssRules.length;
    }
  }

  // Only styles the library put there — not the harness page's own <style>.
  const injected = document.getElementById('fideo-host-styles');
  const headStyleBytes = injected ? injected.textContent.length : 0;
  const linkedStylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;

  return {
    inlineStyleNodes,
    inlineStyleBytes,
    adoptedSheets,
    uniqueSheets: uniqueSheets.size,
    cssRules,
    headStyleBytes,
    linkedStylesheets,
  };
}

/**
 * Drives the timeline at one state update per animation frame — the cadence
 * the library itself uses to interpolate progress during playback. Doing it
 * from the harness rather than relying on the library's own rAF loop keeps
 * the measurement identical for both builds and independent of the viewer's
 * prefers-reduced-motion setting, which disables that loop.
 *
 * Playback time advances in real time, so the visible clock crosses exactly
 * as many second boundaries as it would during genuine playback.
 */
function driveTimelines(players, durationMs) {
  return new Promise((resolve) => {
    const start = performance.now();
    let frames = 0;

    for (const player of players) {
      player.adapter.update(
        { duration: FAKE_DURATION, currentTime: 0, buffered: 0.62, paused: false, playbackRate: 1 },
        'play',
      );
    }

    const step = (now) => {
      const elapsed = (now - start) / 1000;
      frames += 1;

      for (const player of players) {
        player.adapter.update(
          {
            duration: FAKE_DURATION,
            currentTime: Math.min(FAKE_DURATION, elapsed),
            buffered: 0.62,
            paused: false,
            playbackRate: 1,
          },
          'timeupdate',
        );
      }

      if (now - start >= durationMs) {
        resolve(frames);
        return;
      }
      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  });
}

function stopTimelines(players) {
  for (const player of players) {
    player.adapter.update({ paused: true }, 'pause');
  }
}

function readTimeLabels(player) {
  const host = player.wrapper.querySelector('.fideo__controls');
  const root = host && host.shadowRoot;
  if (!root) return { current: '', duration: '' };
  const times = root.querySelectorAll('.fideo__time');
  return {
    current: times[0] ? times[0].textContent : '',
    duration: times[1] ? times[1].textContent : '',
  };
}

function readTrackVars(player) {
  const host = player.wrapper.querySelector('.fideo__controls');
  const root = host && host.shadowRoot;
  const track = root && root.querySelector('.fideo__track');
  if (!track) return { progress: '', buffered: '' };
  return {
    progress: track.style.getPropertyValue('--fideo-progress'),
    buffered: track.style.getPropertyValue('--fideo-buffered'),
  };
}

function readSpeedMenu(player) {
  const host = player.wrapper.querySelector('.fideo__controls');
  const root = host && host.shadowRoot;
  if (!root) return { role: '', checked: null };
  const item = root.querySelector('.fideo__speed');
  const checked = root.querySelector('.fideo__speed[aria-checked="true"]');
  return {
    role: item ? item.getAttribute('role') : '',
    checked: checked ? checked.textContent : null,
  };
}

function buildMarkup() {
  const stage = document.getElementById('stage');
  stage.innerHTML = Array.from({ length: PLAYER_COUNT })
    .map(() => '<video data-fideo muted playsinline></video>')
    .join('');
}

export async function runBenchmark(label) {
  const writes = instrumentDomWrites();
  buildMarkup();

  const mountStart = performance.now();
  const result = window.initFideo({ controls: true });
  const mountMs = performance.now() - mountStart;
  const players = result.players;

  const styles = measureStyles(players);

  // A resilience probe: a disabled provider on one element must not stop the
  // rest of the page from mounting.
  let resilience;
  const probe = document.createElement('div');
  probe.innerHTML =
    '<iframe data-fideo src="https://vimeo.com/76979871"></iframe><video data-fideo muted></video>';
  document.getElementById('probe').append(probe);
  try {
    const probeResult = window.initFideo({ selector: '#probe [data-fideo]', disabledProviders: ['vimeo'] });
    resilience = { mounted: probeResult.players.length, threw: false };
    probeResult.destroy();
  } catch (error) {
    resilience = { mounted: 0, threw: true, message: String(error && error.message) };
  }
  probe.remove();

  writes.start();
  const frames = await driveTimelines(players, SAMPLE_MS);
  const domWrites = writes.stop();
  const sample = {
    time: readTimeLabels(players[0]),
    track: readTrackVars(players[0]),
    speed: readSpeedMenu(players[0]),
  };
  stopTimelines(players);

  return {
    label,
    playerCount: players.length,
    mountMs: Number(mountMs.toFixed(2)),
    frames,
    styles,
    domWrites: {
      ...domWrites,
      perSecond: Number((domWrites.total / (SAMPLE_MS / 1000)).toFixed(0)),
      perSecondPerPlayer: Number((domWrites.total / (SAMPLE_MS / 1000) / players.length).toFixed(0)),
      perFramePerPlayer: Number((domWrites.total / frames / players.length).toFixed(2)),
    },
    resilience,
    sample,
  };
}

export function reportToParent(payload) {
  parent.postMessage({ type: 'fideo-bench', payload }, '*');
}
