import { BaseProvider } from './base';
declare global {
    interface Window {
        _wq?: Array<Record<string, unknown>>;
    }
}
export declare class WistiaProvider extends BaseProvider {
    readonly element: HTMLIFrameElement;
    readonly provider: "wistia";
    private video?;
    private ready;
    private timer?;
    constructor(element: HTMLIFrameElement);
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
    private startTimer;
    private stopTimer;
}
