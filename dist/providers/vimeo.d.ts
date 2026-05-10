import { BaseProvider } from './base';
import type { FideoResolvedOptions } from '../types';
interface VimeoPlayer {
    play(): Promise<void>;
    pause(): Promise<void>;
    setCurrentTime(seconds: number): Promise<number>;
    setVolume(volume: number): Promise<number>;
    setMuted(muted: boolean): Promise<boolean>;
    setPlaybackRate(rate: number): Promise<number>;
    loadVideo(options: {
        url: string;
    }): Promise<number>;
    getCurrentTime(): Promise<number>;
    getDuration(): Promise<number>;
    getVolume(): Promise<number>;
    getMuted(): Promise<boolean>;
    getPlaybackRate(): Promise<number>;
    on(eventName: string, callback: (event?: Record<string, number | boolean>) => void): void;
    off(eventName: string): void;
    destroy(): Promise<void>;
}
declare global {
    interface Window {
        Vimeo?: {
            Player: new (element: HTMLIFrameElement) => VimeoPlayer;
        };
    }
}
export declare class VimeoProvider extends BaseProvider {
    readonly element: HTMLIFrameElement;
    private options;
    readonly provider: "vimeo";
    private player?;
    private ready;
    constructor(element: HTMLIFrameElement, options: FideoResolvedOptions);
    play(): Promise<void>;
    pause(): Promise<void>;
    seek(time: number): Promise<void>;
    setVolume(volume: number): Promise<void>;
    setMuted(muted: boolean): Promise<void>;
    setPlaybackRate(rate: number): Promise<void>;
    setSource(source: string): Promise<void>;
    destroy(): void;
    private bind;
    private applyEvent;
    private sync;
    private postMessage;
    private providerParams;
}
export {};
