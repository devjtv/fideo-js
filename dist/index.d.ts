import './styles.css';
import type { FideoAdapter, FideoInitResult, FideoOptions, FideoPlayerInstance, FideoResolvedOptions, FideoTarget } from './types';
export declare class Fideo implements FideoPlayerInstance {
    private player;
    constructor(target: FideoTarget, options?: FideoOptions);
    get element(): HTMLVideoElement | HTMLIFrameElement;
    get wrapper(): HTMLElement;
    get options(): FideoResolvedOptions;
    get adapter(): FideoAdapter;
    play(): Promise<void>;
    pause(): Promise<void>;
    destroy(): void;
    static init(options?: FideoOptions): FideoInitResult;
    static mount(element: HTMLVideoElement | HTMLIFrameElement, options?: FideoOptions): FideoPlayerInstance;
}
export declare function createFideo(target: FideoTarget, options?: FideoOptions): FideoPlayerInstance;
export declare function initFideo(options?: FideoOptions): FideoInitResult;
export declare function mountFideo(element: HTMLVideoElement | HTMLIFrameElement, options?: FideoOptions): FideoPlayerInstance;
export type { FideoAdapter, FideoBreakpoints, FideoControlVisibility, FideoIcons, FideoInitResult, FideoOptions, FideoPlayerInstance, FideoPosters, FideoProviderName, FideoResolvedOptions, FideoSources, FideoState, FideoTarget, FideoViewportMode, } from './types';
