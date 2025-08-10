// 视频模块的核心类型定义

// 联合类型和字面量类型 - 视频状态
export type VideoState = 
  | 'idle'
  | 'loading' 
  | 'canplay'
  | 'play'
  | 'playing'
  | 'pause'
  | 'paused'
  | 'seeking'
  | 'waiting'
  | 'ended'
  | 'error';

// 字面量类型 - 视频质量
export type VideoQuality = '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p' | 'auto';

// 字面量类型 - 播放速度
export type PlaybackRate = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

// 字面量类型 - 视频格式
export type VideoFormat = 'mp4' | 'webm' | 'ogg' | 'hls' | 'dash';

// 字面量类型 - 错误类型
export type VideoErrorType = 
  | 'network'
  | 'decode' 
  | 'src_not_supported'
  | 'unknown';

// 联合类型 - 事件类型
export type VideoEventType = 
  // HTML5 Video Events
  | 'loadstart'
  | 'loadedmetadata' 
  | 'loadeddata'
  | 'canplay'
  | 'canplaythrough'
  | 'play'
  | 'playing'
  | 'pause'
  | 'seeking'
  | 'seeked'
  | 'waiting'
  | 'timeupdate'
  | 'progress'
  | 'volumechange'
  | 'ratechange'
  | 'ended'
  | 'error'
  | 'stalled'
  | 'suspend'
  | 'abort'
  | 'emptied'
  | 'durationchange'
  // 自定义事件
  | 'qualitychange'
  | 'fullscreenchange'
  | 'pip'
  | 'buffering'
  | 'ready';

// 泛型接口 - 视频源配置
export interface VideoSource<T extends VideoFormat = VideoFormat> {
  src: string;
  type: T;
  quality?: VideoQuality;
  label?: string;
}

// 泛型类型 - HLS配置基础接口
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

// 泛型类型 - HLS配置
export type HLSConfig<T extends Record<string, any> = Record<string, any>> = BaseHLSConfig & T;

// 泛型接口 - 视频配置
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
  // HLS特定配置
  hls?: HLSConfig<THls>;
  // 自定义配置
  customControls?: boolean;
  hotkeys?: boolean;
  pip?: boolean; // Picture-in-Picture
  fullscreen?: boolean;
  qualities?: VideoQuality[];
}

// 泛型接口 - 视频元数据
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

// 泛型接口 - 视频统计信息
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

// 泛型接口 - 视频错误信息
export interface VideoError {
  type: VideoErrorType;
  code: number;
  message: string;
  timestamp: number;
  fatal: boolean;
  details?: Record<string, any>;
}

// 泛型接口 - 事件数据
export interface VideoEventData<T extends VideoEventType = VideoEventType> {
  type: T;
  timestamp: number;
  currentTime: number;
  duration: number;
  // 条件类型 - 根据事件类型决定payload类型
  payload: T extends 'error' 
    ? VideoError
    : T extends 'qualitychange'
    ? { from: VideoQuality; to: VideoQuality }
    : T extends 'ratechange'
    ? { rate: PlaybackRate }
    : T extends 'volumechange'
    ? { volume: number; muted: boolean }
    : T extends 'progress'
    ? { loaded: number; total: number }
    : T extends 'timeupdate'
    ? { currentTime: number; duration: number }
    : T extends 'buffering'
    ? { isBuffering: boolean; bufferLevel: number }
    : Record<string, any>;
}

// 泛型类型 - 事件监听器
export type VideoEventListener<T extends VideoEventType = VideoEventType> = (
  event: VideoEventData<T>
) => void;

// 泛型接口 - 事件监听器映射
export type VideoEventListeners = {
  [K in VideoEventType]?: VideoEventListener<K>[];
};

// 泛型接口 - 视频播放器接口
export interface IVideoPlayer<TConfig extends VideoConfig = VideoConfig> {
  // 基本属性
  readonly element: HTMLVideoElement;
  readonly config: TConfig;
  readonly state: VideoState;
  readonly metadata: VideoMetadata | null;
  readonly stats: VideoStats;
  
  // 播放控制
  play(): Promise<void>;
  pause(): void;
  stop(): void;
  seek(time: number): void;
  
  // 音量控制
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;
  toggleMute(): void;
  
  // 播放速度控制
  setPlaybackRate(rate: PlaybackRate): void;
  
  // 质量控制
  setQuality(quality: VideoQuality): void;
  getAvailableQualities(): VideoQuality[];
  
  // 全屏控制
  enterFullscreen(): Promise<void>;
  exitFullscreen(): Promise<void>;
  toggleFullscreen(): Promise<void>;
  
  // Picture-in-Picture
  enterPiP(): Promise<void>;
  exitPiP(): Promise<void>;
  togglePiP(): Promise<void>;
  
  // 事件系统
  on<T extends VideoEventType>(event: T, listener: VideoEventListener<T>): void;
  off<T extends VideoEventType>(event: T, listener: VideoEventListener<T>): void;
  emit<T extends VideoEventType>(event: T, data: VideoEventData<T>): void;
  
  // 生命周期
  destroy(): void;
}

// 类型约束 - 确保HLS源必须有特定配置
export type HLSVideoConfig<T extends Record<string, any> = Record<string, any>> = VideoConfig<T> & {
  sources: (VideoSource<'hls'> & { src: string })[];
  hls: HLSConfig<T>;
};

// 映射类型 - 从配置生成播放器类型
export type VideoPlayerFromConfig<T extends VideoConfig> = T extends HLSVideoConfig<infer U>
  ? IVideoPlayer<HLSVideoConfig<U>>
  : IVideoPlayer<T>;

// 条件类型 - 根据格式类型确定是否需要额外库
export type RequiresExternalLib<T extends VideoFormat> = 
  T extends 'hls' ? true :
  T extends 'dash' ? true :
  false;

// 实用类型 - 提取事件类型的payload
export type ExtractEventPayload<T extends VideoEventType> = VideoEventData<T>['payload'];

// 模板字面量类型 - 生成事件名称
export type VideoEventName<T extends string> = `video:${T}`;

// 键值映射类型 - 事件名称到数据的映射
export type VideoEventMap = {
  [K in VideoEventType as VideoEventName<K>]: VideoEventData<K>;
};

// 泛型约束 - 确保质量设置有效
export type ValidQualityConfig<T extends VideoQuality[]> = T extends readonly VideoQuality[] 
  ? T[number] extends VideoQuality 
    ? T 
    : never
  : never;

// 递归类型 - 深度只读配置
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 部分类型 - 可选配置更新
export type VideoConfigUpdate<T extends VideoConfig = VideoConfig> = Partial<{
  [K in keyof T]: T[K] extends object ? Partial<T[K]> : T[K];
}>;

// 联合类型守卫
export const isVideoState = (value: any): value is VideoState => {
  return typeof value === 'string' && [
    'idle', 'loading', 'canplay', 'playing', 'paused', 
    'seeking', 'waiting', 'ended', 'error'
  ].includes(value);
};

export const isVideoQuality = (value: any): value is VideoQuality => {
  return typeof value === 'string' && [
    '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p', 'auto'
  ].includes(value);
};

export const isPlaybackRate = (value: any): value is PlaybackRate => {
  return typeof value === 'number' && [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].includes(value);
};

export const isVideoFormat = (value: any): value is VideoFormat => {
  return typeof value === 'string' && ['mp4', 'webm', 'ogg', 'hls', 'dash'].includes(value);
};

// 类型断言函数
export const assertVideoConfig = <T extends VideoConfig>(config: any): asserts config is T => {
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid video configuration');
  }
  if (!Array.isArray(config.sources) || config.sources.length === 0) {
    throw new Error('Video configuration must have at least one source');
  }
};

// 默认配置类型
export const DEFAULT_VIDEO_CONFIG: DeepReadonly<VideoConfig> = {
  sources: [],
  autoplay: false,
  loop: false,
  muted: false,
  controls: true,
  preload: 'metadata',
  playsinline: true,
  volume: 1,
  playbackRate: 1,
  currentTime: 0,
  customControls: true,
  hotkeys: true,
  pip: true,
  fullscreen: true,
  qualities: ['auto', '1080p', '720p', '480p', '360p', '240p']
} as const;
