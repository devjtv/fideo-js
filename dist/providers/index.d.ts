import type { FideoAdapter, FideoProviderName, FideoResolvedOptions } from '../types';
export declare function createProvider(provider: FideoProviderName, element: HTMLVideoElement | HTMLIFrameElement, options: FideoResolvedOptions): FideoAdapter;
