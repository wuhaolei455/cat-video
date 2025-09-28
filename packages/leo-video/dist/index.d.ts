import React$1 from 'react';

type VideoState = 'idle' | 'loading' | 'canplay' | 'play' | 'playing' | 'pause' | 'paused' | 'seeking' | 'waiting' | 'ended' | 'error';
type VideoQuality = '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p' | 'auto';
type PlaybackRate = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
type VideoFormat = 'mp4' | 'webm' | 'ogg' | 'hls' | 'dash';
type VideoErrorType = 'network' | 'decode' | 'src_not_supported' | 'unknown';
type VideoEventType = 'loadstart' | 'loadedmetadata' | 'loadeddata' | 'canplay' | 'canplaythrough' | 'play' | 'playing' | 'pause' | 'seeking' | 'seeked' | 'waiting' | 'timeupdate' | 'progress' | 'volumechange' | 'ratechange' | 'ended' | 'error' | 'stalled' | 'suspend' | 'abort' | 'emptied' | 'durationchange' | 'qualitychange' | 'fullscreenchange' | 'pip' | 'buffering' | 'ready';
interface VideoSource<T extends VideoFormat = VideoFormat> {
    src: string;
    type: T;
    quality?: VideoQuality;
    label?: string;
}
interface BaseHLSConfig {
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
type HLSConfig<T extends Record<string, any> = Record<string, any>> = BaseHLSConfig & T;
interface VideoConfig<THls extends Record<string, any> = Record<string, any>> {
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
interface VideoMetadata {
    duration: number;
    videoWidth: number;
    videoHeight: number;
    readyState: number;
    networkState: number;
    buffered: TimeRanges;
    seekable: TimeRanges;
    played: TimeRanges;
}
interface VideoStats {
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
interface VideoError {
    type: VideoErrorType;
    code: number;
    message: string;
    timestamp: number;
    fatal: boolean;
    details?: Record<string, any>;
}
interface VideoEventData<T extends VideoEventType = VideoEventType> {
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
type VideoEventListener<T extends VideoEventType = VideoEventType> = (event: VideoEventData<T>) => void;
interface IVideoPlayer<TConfig extends VideoConfig = VideoConfig> {
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
type HLSVideoConfig<T extends Record<string, any> = Record<string, any>> = VideoConfig<T> & {
    sources: (VideoSource<'hls'> & {
        src: string;
    })[];
    hls: HLSConfig<T>;
};
type VideoPlayerFromConfig<T extends VideoConfig> = T extends HLSVideoConfig<infer U> ? IVideoPlayer<HLSVideoConfig<U>> : IVideoPlayer<T>;
type RequiresExternalLib<T extends VideoFormat> = T extends 'hls' ? true : T extends 'dash' ? true : false;
type ExtractEventPayload<T extends VideoEventType> = VideoEventData<T>['payload'];
type VideoEventName<T extends string> = `video:${T}`;
type VideoEventMap = {
    [K in VideoEventType as VideoEventName<K>]: VideoEventData<K>;
};
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
type VideoConfigUpdate<T extends VideoConfig = VideoConfig> = Partial<{
    [K in keyof T]: T[K] extends object ? Partial<T[K]> : T[K];
}>;

interface PlayerState$1 {
    state: VideoState;
    currentTime: number;
    duration: number;
    volume: number;
    muted: boolean;
    quality: VideoQuality;
    playbackRate: PlaybackRate;
    buffered: number;
    isFullscreen: boolean;
    isPiP: boolean;
    error: string | null;
}
interface EventLog {
    id: string;
    timestamp: number;
    type: VideoEventType;
    data: any;
}
interface LeoVideoPlayerProps {
    config: VideoConfig;
    width?: number | string;
    height?: number | string;
    className?: string;
    style?: React$1.CSSProperties;
    showControls?: boolean;
    showEventLog?: boolean;
    onStateChange?: (state: PlayerState$1) => void;
    onEvent?: (type: VideoEventType, data: VideoEventData) => void;
    onError?: (error: Error) => void;
}
interface LeoVideoPlayerRef {
    player: IVideoPlayer | null;
    element: HTMLVideoElement | null;
    getState: () => PlayerState$1;
    play: () => Promise<void>;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setQuality: (quality: VideoQuality) => void;
    setPlaybackRate: (rate: PlaybackRate) => void;
    toggleFullscreen: () => Promise<void>;
    togglePiP: () => Promise<void>;
    destroy: () => void;
}
declare const LeoVideoPlayer: React$1.ForwardRefExoticComponent<LeoVideoPlayerProps & React$1.RefAttributes<LeoVideoPlayerRef>>;

interface PlayerState {
    state: VideoState;
    currentTime: number;
    duration: number;
    volume: number;
    muted: boolean;
    quality: VideoQuality;
    playbackRate: PlaybackRate;
    buffered: number;
    isFullscreen: boolean;
    isPiP: boolean;
    error: string | null;
}
interface UseLeoVideoOptions {
    config: VideoConfig;
    autoInit?: boolean;
    onStateChange?: (state: PlayerState) => void;
    onEvent?: (type: VideoEventType, data: VideoEventData) => void;
    onError?: (error: Error) => void;
}
interface UseLeoVideoReturn {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    player: IVideoPlayer | null;
    state: PlayerState;
    isReady: boolean;
    error: Error | null;
    initialize: () => Promise<void>;
    play: () => Promise<void>;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setQuality: (quality: VideoQuality) => void;
    setPlaybackRate: (rate: PlaybackRate) => void;
    toggleFullscreen: () => Promise<void>;
    togglePiP: () => Promise<void>;
    destroy: () => void;
    getAvailableQualities: () => VideoQuality[];
    getCurrentTime: () => number;
    getDuration: () => number;
    getVolume: () => number;
    isMuted: () => boolean;
    isPlaying: () => boolean;
    isPaused: () => boolean;
    isEnded: () => boolean;
    isFullscreen: () => boolean;
    isPictureInPicture: () => boolean;
}
/**
 * useLeoVideo Hook
 *
 * 提供完整的视频播放器功能，包括状态管理、事件处理和控制方法
 *
 * @param options Hook配置选项
 * @returns 播放器实例和控制方法
 */
declare const useLeoVideo: ({ config, autoInit, onStateChange, onEvent, onError }: UseLeoVideoOptions) => UseLeoVideoReturn;

declare class VideoEventEmitter<TEventMap extends Record<string, any> = VideoEventMap> {
    private eventListeners;
    private onceListeners;
    private maxListeners;
    /**
     * 添加事件监听器
     */
    on<K extends keyof TEventMap>(event: K, listener: (data: TEventMap[K]) => void): this;
    /**
     * 添加一次性事件监听器
     */
    once<K extends keyof TEventMap>(event: K, listener: (data: TEventMap[K]) => void): this;
    /**
     * 移除事件监听器
     */
    off<K extends keyof TEventMap>(event: K, listener: (data: TEventMap[K]) => void): this;
    /**
     * 移除指定事件的所有监听器
     */
    removeAllListeners<K extends keyof TEventMap>(event?: K): this;
    /**
     * 发射事件
     */
    emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): boolean;
    /**
     * 获取事件的监听器数量
     */
    listenerCount<K extends keyof TEventMap>(event: K): number;
    /**
     * 获取所有事件名称
     */
    eventNames(): (keyof TEventMap)[];
    /**
     * 设置最大监听器数量
     */
    setMaxListeners(n: number): this;
    /**
     * 获取最大监听器数量
     */
    getMaxListeners(): number;
    /**
     * 检查是否有指定事件的监听器
     */
    hasListeners<K extends keyof TEventMap>(event: K): boolean;
    /**
     * 获取指定事件的所有监听器
     */
    listeners<K extends keyof TEventMap>(event: K): Function[];
    /**
     * 销毁事件发射器
     */
    destroy(): void;
}
declare class VideoEventEmitterTyped extends VideoEventEmitter<Record<string, any>> {
    /**
     * 类型安全的视频事件发射
     */
    emitVideoEvent<T extends VideoEventType>(type: T, eventData: Omit<VideoEventData<T>, 'type'>): boolean;
    /**
     * 类型安全的视频事件监听
     */
    onVideoEvent<T extends VideoEventType>(type: T, listener: VideoEventListener<T>): this;
    /**
     * 类型安全的一次性视频事件监听
     */
    onceVideoEvent<T extends VideoEventType>(type: T, listener: VideoEventListener<T>): this;
    /**
     * 移除视频事件监听器
     */
    offVideoEvent<T extends VideoEventType>(type: T, listener: VideoEventListener<T>): this;
}

declare class HTML5VideoAPI<TConfig extends VideoConfig = VideoConfig> implements IVideoPlayer<TConfig> {
    private _element;
    private _config;
    private _state;
    private _metadata;
    private _stats;
    private _isDestroyed;
    private _currentQuality;
    private _eventEmitter;
    private _performanceObserver?;
    private _loadStartTime;
    private _playStartTime;
    private _pauseStartTime;
    constructor(element: HTMLVideoElement, config: TConfig);
    get element(): HTMLVideoElement;
    get config(): TConfig;
    get state(): VideoState;
    get metadata(): VideoMetadata | null;
    get stats(): VideoStats;
    private initializeStats;
    private setupVideoElement;
    private bindVideoEvents;
    private handleVideoEvent;
    private updateState;
    private updateMetadata;
    private updateStats;
    private createEventData;
    private getErrorType;
    private setupPerformanceMonitoring;
    private handlePerformanceEntry;
    private applyConfig;
    private loadSources;
    on<T extends VideoEventType>(event: T, listener: VideoEventListener<T>): void;
    off<T extends VideoEventType>(event: T, listener: VideoEventListener<T>): void;
    emit<T extends VideoEventType>(event: T, data: VideoEventData<T>): void;
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
    destroy(): void;
}

declare class HLSPlayer<T extends Record<string, any> = Record<string, any>> extends HTML5VideoAPI<HLSVideoConfig<T>> {
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

type ValidVideoConfig<T extends VideoConfig> = T extends VideoConfig ? T['sources'] extends VideoSource[] ? T['sources']['length'] extends 0 ? never : T : never : never;
declare class VideoPlayerFactory {
    private static instance;
    private playerRegistry;
    private constructor();
    static getInstance(): VideoPlayerFactory;
    /**
     * 创建视频播放器 - 主要工厂方法
     */
    create<T extends VideoConfig>(element: HTMLVideoElement, config: ValidVideoConfig<T>): VideoPlayerFromConfig<T>;
    /**
     * 创建HTML5播放器 - 类型安全的工厂方法
     */
    createHTML5Player<T extends VideoConfig>(element: HTMLVideoElement, config: ValidVideoConfig<T>): HTML5VideoAPI<T>;
    /**
     * 创建HLS播放器 - 类型约束确保HLS配置
     */
    createHLSPlayer<T extends Record<string, any> = Record<string, any>>(element: HTMLVideoElement, config: ValidVideoConfig<HLSVideoConfig<T>>): HLSPlayer<T>;
    /**
     * 智能创建 - 根据环境和配置自动选择最佳播放器
     */
    createSmart<T extends VideoConfig>(element: HTMLVideoElement, config: ValidVideoConfig<T>): VideoPlayerFromConfig<T>;
    /**
     * 批量创建播放器
     */
    createBatch<T extends VideoConfig>(configs: Array<{
        element: HTMLVideoElement;
        config: ValidVideoConfig<T>;
    }>): VideoPlayerFromConfig<T>[];
    /**
     * 从现有播放器克隆配置创建新播放器
     */
    clone<T extends VideoConfig>(existingPlayer: IVideoPlayer<T>, newElement: HTMLVideoElement, configOverrides?: Partial<T>): VideoPlayerFromConfig<T>;
    private validateConfig;
    private validateHLSConfig;
    private ensureHLSConfig;
    private isHLSConfig;
    private determinePlayerType;
    private createPlayerInstance;
    private isValidVideoFormat;
    private generatePlayerId;
    /**
     * 获取注册的播放器
     */
    getPlayer(id: string): IVideoPlayer | undefined;
    /**
     * 获取所有注册的播放器
     */
    getAllPlayers(): IVideoPlayer[];
    /**
     * 注销播放器
     */
    unregister(id: string): boolean;
    /**
     * 销毁所有播放器
     */
    destroyAll(): void;
    /**
     * 获取播放器统计信息
     */
    getStats(): {
        totalPlayers: number;
        playerTypes: Record<string, number>;
        memoryUsage: number;
    };
    private estimateMemoryUsage;
}
/**
 * 智能创建播放器 - 自动选择最佳播放器类型
 */
declare const createSmartVideoPlayer: <T extends VideoConfig>(element: HTMLVideoElement, config: ValidVideoConfig<T>) => VideoPlayerFromConfig<T>;
declare class VideoConfigBuilder<T extends VideoConfig = VideoConfig> {
    private config;
    static create<TConfig extends VideoConfig = VideoConfig>(): VideoConfigBuilder<TConfig>;
    sources(sources: VideoSource[]): this;
    addSource(source: VideoSource): this;
    poster(url: string): this;
    autoplay(enabled?: boolean): this;
    loop(enabled?: boolean): this;
    muted(enabled?: boolean): this;
    controls(enabled?: boolean): this;
    dimensions(width: number, height: number): this;
    qualities(qualities: VideoQuality[]): this;
    preload(preload: 'none' | 'metadata' | 'auto'): this;
    hls<THls extends Record<string, any>>(hlsConfig: HLSConfig<THls>): VideoConfigBuilder<HLSVideoConfig<THls>>;
    build(): ValidVideoConfig<T>;
}
declare class PresetConfigFactory {
    /**
     * 创建基础MP4配置
     */
    static mp4(src: string): VideoConfigBuilder<VideoConfig>;
    /**
     * 创建HLS流配置
     */
    static hls(src: string, hlsConfig?: Partial<HLSConfig>): VideoConfigBuilder<HLSVideoConfig>;
    /**
     * 创建多质量配置
     */
    static multiQuality(sources: VideoSource[]): VideoConfigBuilder<VideoConfig>;
    /**
     * 创建直播配置
     */
    static live(hlsSrc: string): VideoConfigBuilder<HLSVideoConfig>;
}

interface HLSSupportInfo {
    supported: boolean;
    native: boolean;
    hlsjs: boolean;
    reason?: string;
}
interface DASHSupportInfo {
    supported: boolean;
    native: boolean;
    dashjs: boolean;
    reason?: string;
}
interface VideoFormatSupport {
    mp4: boolean;
    webm: boolean;
    ogg: boolean;
    hls: boolean;
    dash: boolean;
}
/**
 * 检测HLS支持情况
 */
declare const detectHLSSupport: () => HLSSupportInfo;
/**
 * 检测DASH支持情况
 */
declare const detectDASHSupport: () => DASHSupportInfo;
/**
 * 检测各种视频格式支持情况
 */
declare const detectVideoFormats: () => VideoFormatSupport;
/**
 * 创建基础视频配置
 */
declare const createVideoConfig: (sources: VideoConfig["sources"]) => VideoConfig;
/**
 * 验证视频配置
 */
declare const validateVideoConfig: <T extends VideoConfig>(config: any) => config is T;
/**
 * 类型守卫 - 检查是否为有效的视频状态
 */
declare const isVideoState: (value: any) => value is VideoState;
/**
 * 断言函数 - 验证视频配置
 */
declare const assertVideoConfig: <T extends VideoConfig>(config: any) => asserts config is T;

declare const version = "1.0.0";

export { HLSPlayer, HTML5VideoAPI, LeoVideoPlayer, PresetConfigFactory, VideoConfigBuilder, VideoEventEmitter, VideoEventEmitterTyped, VideoPlayerFactory, assertVideoConfig, createSmartVideoPlayer, createVideoConfig, LeoVideoPlayer as default, detectDASHSupport, detectHLSSupport, detectVideoFormats, isVideoState, useLeoVideo, validateVideoConfig, version };
export type { BaseHLSConfig, DeepReadonly, ExtractEventPayload, HLSConfig, HLSVideoConfig, IVideoPlayer, EventLog as LeoEventLog, PlayerState$1 as LeoPlayerState, LeoVideoPlayerProps, LeoVideoPlayerRef, PlaybackRate, PlayerState, RequiresExternalLib, UseLeoVideoOptions, UseLeoVideoReturn, VideoConfig, VideoConfigUpdate, VideoError, VideoEventData, VideoEventListener, VideoEventMap, VideoEventName, VideoEventType, VideoFormat, VideoPlayerFromConfig, VideoQuality, VideoSource, VideoState };
