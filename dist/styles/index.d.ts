/**
 * Adds the page-scope stylesheet once per document so a plain
 * `<script src="fideo.global.js">` renders correctly without a separate
 * `<link>`. Prepended to <head> so any author CSS still wins the cascade.
 */
export declare function injectHostStyles(): void;
/**
 * Attaches the control styles to a shadow root. Uses a single constructable
 * stylesheet shared by every player on the page; falls back to a cloned
 * <style> node where constructable stylesheets are unavailable.
 */
export declare function adoptControlsStyles(root: ShadowRoot): void;
