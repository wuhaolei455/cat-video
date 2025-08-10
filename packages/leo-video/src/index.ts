// 主要组件导出
export { default as LeoVideoPlayer } from './components/LeoVideoPlayer';
export type { 
  LeoVideoPlayerProps, 
  LeoVideoPlayerRef, 
  PlayerState as LeoPlayerState,
  EventLog as LeoEventLog
} from './components/LeoVideoPlayer';

// Hook导出
export { default as useLeoVideo } from './hooks/useLeoVideo';
export type { 
  UseLeoVideoOptions, 
  UseLeoVideoReturn,
  PlayerState
} from './hooks/useLeoVideo';

// 核心类型导出
export type {
  // 基础类型
  VideoConfig,
  VideoSource,
  VideoFormat,
  VideoQuality,
  PlaybackRate,
  VideoState,
  
  // HLS相关类型
  HLSVideoConfig,
  HLSConfig,
  BaseHLSConfig,
  
  // 事件相关类型
  VideoEventType,
  VideoEventData,
  VideoEventListener,
  VideoError,
  
  // 播放器接口
  IVideoPlayer,
  
  // 工具类型
  VideoPlayerFromConfig,
  RequiresExternalLib,
  ExtractEventPayload,
  VideoEventName,
  VideoEventMap,
  DeepReadonly,
  VideoConfigUpdate
} from './types';

// 核心类导出
export { VideoEventEmitter, VideoEventEmitterTyped } from './EventEmitter';
export { HTML5VideoAPI } from './VideoAPI';
export { HLSPlayer } from './HLSPlayer';
export { 
  VideoPlayerFactory, 
  VideoConfigBuilder, 
  PresetConfigFactory,
  createSmartVideoPlayer 
} from './VideoPlayerFactory';

// 工具函数导出
export {
  detectHLSSupport,
  detectDASHSupport,
  detectVideoFormats,
  createVideoConfig,
  validateVideoConfig,
  isVideoState,
  assertVideoConfig
} from './utils';

// 版本信息
export const version = '1.0.0';

// 默认导出主组件
export { default } from './components/LeoVideoPlayer';
