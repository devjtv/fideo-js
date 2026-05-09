import type { FideoIcons } from './types';

export const defaultIcons: Required<FideoIcons> = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="9 7 18 12 9 17 9 7"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6v12M16 6v12"/></svg>',
  volume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9.5a4 4 0 0 1 0 5"/></svg>',
  muted: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 10l4 4M21 10l-4 4"/></svg>',
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a7.8 7.8 0 0 0 .1-1.5 7.8 7.8 0 0 0-.1-1.5l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2.6-1.5L14 4h-4l-.4 2.5A8 8 0 0 0 7 8L4.6 7l-2 3.5 2 1.5a7.8 7.8 0 0 0-.1 1.5 7.8 7.8 0 0 0 .1 1.5l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 2.6 1.5L10 20h4l.4-2.5A8 8 0 0 0 17 16l2.4 1 2-3.5z"/></svg>',
  fullscreen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M21 16v3a2 2 0 0 1-2 2h-3"/></svg>',
};
