import type { FideoAdapter, FideoProviderName, FideoResolvedOptions } from '../types';
import { Html5Provider } from './html5';
import { VimeoProvider } from './vimeo';
import { WistiaProvider } from './wistia';
import { YouTubeProvider } from './youtube';

export function createProvider(
  provider: FideoProviderName,
  element: HTMLVideoElement | HTMLIFrameElement,
  options: FideoResolvedOptions,
): FideoAdapter {
  if (provider === 'html5') {
    if (!(element instanceof HTMLVideoElement)) {
      throw new Error('Fideo html5 provider needs a <video> element.');
    }
    return new Html5Provider(element);
  }

  if (!(element instanceof HTMLIFrameElement)) {
    throw new Error(`Fideo ${provider} provider needs an <iframe> element.`);
  }

  if (provider === 'youtube') return new YouTubeProvider(element, options);
  if (provider === 'vimeo') return new VimeoProvider(element, options);
  return new WistiaProvider(element);
}
