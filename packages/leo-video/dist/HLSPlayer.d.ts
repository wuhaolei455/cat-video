import type { HLSConfig, HLSVideoConfig, VideoQuality } from './types';
import { HTML5VideoAPI } from './VideoAPI';
export declare class HLSPlayer<T extends Record<string, any> = Record<string, any>> extends HTML5VideoAPI<HLSVideoConfig<T>> {
    private _hls;
    private _isHLSSupported;
    private _qualityLevels;
    private _currentLevel;
    private _isLiveStream;
    constructor(element: HTMLVideoElement, config: HLSVideoConfig<T>);
    private emitEvent;
    private checkHLSSupport;
    private initializeHLS;
    private loadHLSNatively;
    private initializeHLSJS;
    private createHLSConfig;
    private bindHLSEvents;
    private processQualityLevels;
    private getQualityNameFromHeight;
    private getBufferLevel;
    private loadHLSSource;
    private handleHLSError;
    private mapHLSErrorType;
    private attemptRecovery;
    setQuality(quality: VideoQuality): void;
    getAvailableQualities(): VideoQuality[];
    getCurrentQuality(): VideoQuality;
    getHLSStats(): Record<string, any>;
    updateHLSConfig(config: Partial<HLSConfig<T>>): void;
    destroy(): void;
}
export declare const createHLSPlayer: <T extends Record<string, any>>(element: HTMLVideoElement, config: HLSVideoConfig<T>) => HLSPlayer<T>;
export declare const isHLSPlayer: (player: any) => player is HLSPlayer;
export declare const detectHLSSupport: () => {
    native: boolean;
    hls_js: boolean;
    supported: boolean;
};
//# sourceMappingURL=HLSPlayer.d.ts.map