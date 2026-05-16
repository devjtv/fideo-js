import { BaseProvider } from './base';
import type { FideoResolvedOptions } from '../types';
declare global {
    interface HTMLElementTagNameMap {
        'wistia-player': HTMLElement & {
            mediaId: string;
            play(): void;
            pause(): void;
            currentTime: number;
            duration: number;
            volume: number;
            muted: boolean;
            playbackRate: number;
            state: string;
        };
    }
}
export declare class WistiaProvider extends BaseProvider {
    private options;
    readonly provider: "wistia";
    readonly element: HTMLIFrameElement;
    private player?;
    private ready;
    private mediaId;
    private destroyed;
    private readyResolver?;
    constructor(iframe: HTMLIFrameElement, options: FideoResolvedOptions);
    play(): Promise<void>;
    pause(): Promise<void>;
    seek(time: number): Promise<void>;
    setVolume(volume: number): Promise<void>;
    setMuted(muted: boolean): Promise<void>;
    setPlaybackRate(rate: number): Promise<void>;
    setSource(source: string): Promise<void>;
    destroy(): void;
    private bind;
    private sync;
}
