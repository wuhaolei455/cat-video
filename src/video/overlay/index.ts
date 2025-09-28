// 视频蒙层模块导出
export { useVideoOverlayState, PlayerSpeed } from './VideoOverlayState';
export type { VideoOverlayState, VideoInfo } from './VideoOverlayState';

export { VideoOverlay, OVERLAY_LEVELS } from './VideoOverlay';
export type { VideoOverlayProps } from './VideoOverlay';

// 蒙层组件导出
export { default as LoadingOverlay } from './overlays/LoadingOverlay';
export { default as ErrorOverlay } from './overlays/ErrorOverlay';
export { default as CompleteOverlay } from './overlays/CompleteOverlay';
export { default as SpeedOverlay } from './overlays/SpeedOverlay';
export { default as HeaderOverlay } from './overlays/HeaderOverlay';
export { default as GestureOverlay } from './overlays/GestureOverlay';
export { default as ControllerOverlay } from './overlays/ControllerOverlay';
export { default as VipTryOverlay } from './overlays/VipTryOverlay';
export { default as FeedbackOverlay } from './overlays/FeedbackOverlay';