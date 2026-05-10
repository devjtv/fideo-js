import type { FideoAdapter, FideoProviderName, FideoState } from '../types';
export declare abstract class BaseProvider extends EventTarget implements FideoAdapter {
    abstract readonly element: HTMLVideoElement | HTMLIFrameElement;
    abstract readonly provider: FideoProviderName;
    protected state: FideoState;
    abstract play(): Promise<void>;
    abstract pause(): Promise<void>;
    abstract seek(time: number): Promise<void>;
    abstract setVolume(volume: number): Promise<void>;
    abstract setMuted(muted: boolean): Promise<void>;
    abstract setPlaybackRate(rate: number): Promise<void>;
    abstract setSource(source: string): Promise<void>;
    abstract destroy(): void;
    getState(): FideoState;
    protected update(patch: Partial<FideoState>, eventName?: string): void;
}
