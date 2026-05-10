import { BaseProvider } from './base';
import type { FideoResolvedOptions } from '../types';
type YouTubeState = -1 | 0 | 1 | 2 | 3 | 5;
interface YouTubePlayer {
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    setVolume(volume: number): void;
    mute(): void;
    unMute(): void;
    setPlaybackRate(rate: number): void;
    loadVideoByUrl(url: string): void;
    getCurrentTime(): number;
    getDuration(): number;
    getVolume(): number;
    isMuted(): boolean;
    getPlaybackRate(): number;
    destroy(): void;
}
declare global {
    interface Window {
        YT?: {
            Player: new (elementId: string, options: {
                events?: {
                    onReady?: () => void;
                    onStateChange?: (event: {
                        data: YouTubeState;
                    }) => void;
                };
            }) => YouTubePlayer;
            PlayerState: {
                ENDED: 0;
                PLAYING: 1;
                PAUSED: 2;
                BUFFERING: 3;
                CUED: 5;
            };
        };
        onYouTubeIframeAPIReady?: () => void;
    }
}
export declare class YouTubeProvider extends BaseProvider {
    readonly element: HTMLIFrameElement;
    private options;
    readonly provider: "youtube";
    private player?;
    private ready;
    private readyResolver?;
    private timer?;
    constructor(element: HTMLIFrameElement, options: FideoResolvedOptions);
    play(): Promise<void>;
    pause(): Promise<void>;
    seek(time: number): Promise<void>;
    setVolume(volume: number): Promise<void>;
    setMuted(muted: boolean): Promise<void>;
    setPlaybackRate(rate: number): Promise<void>;
    setSource(source: string): Promise<void>;
    destroy(): void;
    private handleStateChange;
    private sync;
    private startTimer;
    private stopTimer;
}
export {};
