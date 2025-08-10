export type VideoState = 'idle' | 'loading' | 'canplay' | 'play' | 'playing' | 'pause' | 'paused' | 'seeking' | 'waiting' | 'ended' | 'error';
export type VideoQuality = '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p' | 'auto';
export type PlaybackRate = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
export type VideoFormat = 'mp4' | 'webm' | 'ogg' | 'hls' | 'dash';
export type VideoErrorType = 'network' | 'decode' | 'src_not_supported' | 'unknown';
export type VideoEventType = 'loadstart' | 'loadedmetadata' | 'loadeddata' | 'canplay' | 'canplaythrough' | 'play' | 'playing' | 'pause' | 'seeking' | 'seeked' | 'waiting' | 'timeupdate' | 'progress' | 'volumechange' | 'ratechange' | 'ended' | 'error' | 'stalled' | 'suspend' | 'abort' | 'emptied' | 'durationchange' | 'qualitychange' | 'fullscreenchange' | 'pip' | 'buffering' | 'ready';
export interface VideoSource<T extends VideoFormat = VideoFormat> {
    src: string;
    type: T;
    quality?: VideoQuality;
    label?: string;
}
export interface BaseHLSConfig {
    enableWorker?: boolean;
    lowLatencyMode?: boolean;
    backBufferLength?: number;
    maxBufferLength?: number;
    maxMaxBufferLength?: number;
    maxBufferSize?: number;
    maxBufferHole?: number;
    highBufferWatchdogPeriod?: number;
    nudgeOffset?: number;
    nudgeMaxRetry?: number;
    maxFragLookUpTolerance?: number;
    liveSyncDurationCount?: number;
    liveMaxLatencyDurationCount?: number;
    enableSoftwareAES?: boolean;
    manifestLoadingTimeOut?: number;
    manifestLoadingMaxRetry?: number;
    manifestLoadingRetryDelay?: number;
    levelLoadingTimeOut?: number;
    levelLoadingMaxRetry?: number;
    levelLoadingRetryDelay?: number;
    fragLoadingTimeOut?: number;
    fragLoadingMaxRetry?: number;
    fragLoadingRetryDelay?: number;
    startFragPrefetch?: boolean;
    testBandwidth?: boolean;
    progressive?: boolean;
    fpsDroppedMonitoringPeriod?: number;
    fpsDroppedMonitoringThreshold?: number;
    appendErrorMaxRetry?: number;
    debug?: boolean;
}
export type HLSConfig<T extends Record<string, any> = Record<string, any>> = BaseHLSConfig & T;
export interface VideoConfig<THls extends Record<string, any> = Record<string, any>> {
    sources: VideoSource[];
    poster?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    preload?: 'none' | 'metadata' | 'auto';
    crossOrigin?: 'anonymous' | 'use-credentials';
    playsinline?: boolean;
    width?: number;
    height?: number;
    volume?: number;
    playbackRate?: PlaybackRate;
    currentTime?: number;
    hls?: HLSConfig<THls>;
    customControls?: boolean;
    hotkeys?: boolean;
    pip?: boolean;
    fullscreen?: boolean;
    qualities?: VideoQuality[];
}
export interface VideoMetadata {
    duration: number;
    videoWidth: number;
    videoHeight: number;
    readyState: number;
    networkState: number;
    buffered: TimeRanges;
    seekable: TimeRanges;
    played: TimeRanges;
}
export interface VideoStats {
    loadTime: number;
    playTime: number;
    pauseTime: number;
    seekCount: number;
    errorCount: number;
    qualityChanges: number;
    bufferEvents: number;
    averageBitrate: number;
    droppedFrames: number;
    totalFrames: number;
}
export interface VideoError {
    type: VideoErrorType;
    code: number;
    message: string;
    timestamp: number;
    fatal: boolean;
    details?: Record<string, any>;
}
export interface VideoEventData<T extends VideoEventType = VideoEventType> {
    type: T;
    timestamp: number;
    currentTime: number;
    duration: number;
    payload: T extends 'error' ? VideoError : T extends 'qualitychange' ? {
        from: VideoQuality;
        to: VideoQuality;
    } : T extends 'ratechange' ? {
        rate: PlaybackRate;
    } : T extends 'volumechange' ? {
        volume: number;
        muted: boolean;
    } : T extends 'progress' ? {
        loaded: number;
        total: number;
    } : T extends 'timeupdate' ? {
        currentTime: number;
        duration: number;
    } : T extends 'buffering' ? {
        isBuffering: boolean;
        bufferLevel: number;
    } : Record<string, any>;
}
export type VideoEventListener<T extends VideoEventType = VideoEventType> = (event: VideoEventData<T>) => void;
export type VideoEventListeners = {
    [K in VideoEventType]?: VideoEventListener<K>[];
};
export interface IVideoPlayer<TConfig extends VideoConfig = VideoConfig> {
    readonly element: HTMLVideoElement;
    readonly config: TConfig;
    readonly state: VideoState;
    readonly metadata: VideoMetadata | null;
    readonly stats: VideoStats;
    play(): Promise<void>;
    pause(): void;
    stop(): void;
    seek(time: number): void;
    setVolume(volume: number): void;
    mute(): void;
    unmute(): void;
    toggleMute(): void;
    setPlaybackRate(rate: PlaybackRate): void;
    setQuality(quality: VideoQuality): void;
    getAvailableQualities(): VideoQuality[];
    enterFullscreen(): Promise<void>;
    exitFullscreen(): Promise<void>;
    toggleFullscreen(): Promise<void>;
    enterPiP(): Promise<void>;
    exitPiP(): Promise<void>;
    togglePiP(): Promise<void>;
    on<T extends VideoEventType>(event: T, listener: VideoEventListener<T>): void;
    off<T extends VideoEventType>(event: T, listener: VideoEventListener<T>): void;
    emit<T extends VideoEventType>(event: T, data: VideoEventData<T>): void;
    destroy(): void;
}
export type HLSVideoConfig<T extends Record<string, any> = Record<string, any>> = VideoConfig<T> & {
    sources: (VideoSource<'hls'> & {
        src: string;
    })[];
    hls: HLSConfig<T>;
};
export type VideoPlayerFromConfig<T extends VideoConfig> = T extends HLSVideoConfig<infer U> ? IVideoPlayer<HLSVideoConfig<U>> : IVideoPlayer<T>;
export type RequiresExternalLib<T extends VideoFormat> = T extends 'hls' ? true : T extends 'dash' ? true : false;
export type ExtractEventPayload<T extends VideoEventType> = VideoEventData<T>['payload'];
export type VideoEventName<T extends string> = `video:${T}`;
export type VideoEventMap = {
    [K in VideoEventType as VideoEventName<K>]: VideoEventData<K>;
};
export type ValidQualityConfig<T extends VideoQuality[]> = T extends readonly VideoQuality[] ? T[number] extends VideoQuality ? T : never : never;
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
export type VideoConfigUpdate<T extends VideoConfig = VideoConfig> = Partial<{
    [K in keyof T]: T[K] extends object ? Partial<T[K]> : T[K];
}>;
export declare const isVideoState: (value: any) => value is VideoState;
export declare const isVideoQuality: (value: any) => value is VideoQuality;
export declare const isPlaybackRate: (value: any) => value is PlaybackRate;
export declare const isVideoFormat: (value: any) => value is VideoFormat;
export declare const assertVideoConfig: <T extends VideoConfig>(config: any) => asserts config is T;
export declare const DEFAULT_VIDEO_CONFIG: DeepReadonly<VideoConfig>;
//# sourceMappingURL=types.d.ts.map