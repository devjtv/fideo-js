import { Fideo, initFideo } from '../src';

initFideo();

new Fideo('#object-player', {
  muted: true,
  loop: true,
  autoplay: true,
  controls: false,
  sources: {
    desktop: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  posters: {
    desktop: 'https://interactive-examples.mdn.mozilla.net/media/examples/flower.jpg',
  },
});

new Fideo('#object-background-player', {
  background: true,
  sources: {
    desktop: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
});
