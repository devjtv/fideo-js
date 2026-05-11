import type { FideoAdapter, FideoProviderName, FideoState } from '../types';

export abstract class BaseProvider extends EventTarget implements FideoAdapter {
  abstract readonly element: HTMLVideoElement | HTMLIFrameElement;
  abstract readonly provider: FideoProviderName;

  protected state: FideoState = {
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    paused: true,
    playbackRate: 1,
    buffered: 0,
  };

  abstract play(): Promise<void>;
  abstract pause(): Promise<void>;
  abstract seek(time: number): Promise<void>;
  abstract setVolume(volume: number): Promise<void>;
  abstract setMuted(muted: boolean): Promise<void>;
  abstract setPlaybackRate(rate: number): Promise<void>;
  abstract setSource(source: string): Promise<void>;
  abstract destroy(): void;

  getState(): FideoState {
    return { ...this.state };
  }

  protected update(patch: Partial<FideoState>, eventName = 'change'): void {
    this.state = { ...this.state, ...patch };
    this.dispatchEvent(new CustomEvent(eventName, { detail: this.getState() }));
  }
}
