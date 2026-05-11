import { BaseProvider } from './base';
export declare class Html5Provider extends BaseProvider {
    readonly element: HTMLVideoElement;
    readonly provider: "html5";
    private boundHandler;
    private boundEvents;
    constructor(element: HTMLVideoElement);
    play(): Promise<void>;
    pause(): Promise<void>;
    seek(time: number): Promise<void>;
    setVolume(volume: number): Promise<void>;
    setMuted(muted: boolean): Promise<void>;
    setPlaybackRate(rate: number): Promise<void>;
    setSource(source: string): Promise<void>;
    setPoster(poster: string): void;
    destroy(): void;
    private bind;
    private handleMediaEvent;
    private syncFromElement;
}
