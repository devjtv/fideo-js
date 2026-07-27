import controlsStyles from './controls.css?inline';
import hostStyles from './host.css?inline';

const HOST_STYLE_ID = 'fideo-host-styles';

let controlsSheet: CSSStyleSheet | null | undefined;

/**
 * Adds the page-scope stylesheet once per document so a plain
 * `<script src="fideo.global.js">` renders correctly without a separate
 * `<link>`. Prepended to <head> so any author CSS still wins the cascade.
 */
export function injectHostStyles(): void {
  if (typeof document === 'undefined' || !document.head) return;
  if (document.getElementById(HOST_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = HOST_STYLE_ID;
  style.textContent = hostStyles;
  document.head.prepend(style);
}

/**
 * Attaches the control styles to a shadow root. Uses a single constructable
 * stylesheet shared by every player on the page; falls back to a cloned
 * <style> node where constructable stylesheets are unavailable.
 */
export function adoptControlsStyles(root: ShadowRoot): void {
  const sheet = getControlsSheet();

  if (sheet) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    return;
  }

  const style = document.createElement('style');
  style.textContent = controlsStyles;
  root.appendChild(style);
}

function getControlsSheet(): CSSStyleSheet | null {
  if (controlsSheet !== undefined) return controlsSheet;

  controlsSheet = null;
  if (typeof CSSStyleSheet === 'function' && typeof CSSStyleSheet.prototype.replaceSync === 'function') {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(controlsStyles);
      controlsSheet = sheet;
    } catch {
      // Older engines expose replaceSync but reject construction; keep the fallback.
      controlsSheet = null;
    }
  }

  return controlsSheet;
}
