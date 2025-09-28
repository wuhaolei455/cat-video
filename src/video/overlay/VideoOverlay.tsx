// 视频蒙层组件 - 基于CommonCover设计
import React from 'react';
import { VideoOverlayState } from './VideoOverlayState';
import { LoadingOverlay } from './overlays/LoadingOverlay';
import { ErrorOverlay } from './overlays/ErrorOverlay';
import { CompleteOverlay } from './overlays/CompleteOverlay';
import { SpeedOverlay } from './overlays/SpeedOverlay';
import { HeaderOverlay } from './overlays/HeaderOverlay';
import { GestureOverlay } from './overlays/GestureOverlay';
import { ControllerOverlay } from './overlays/ControllerOverlay';
import { VipTryOverlay } from './overlays/VipTryOverlay';
import { FeedbackOverlay } from './overlays/FeedbackOverlay';

// 蒙层层级定义
export const OVERLAY_LEVELS = {
  VIDEO_PLAYER: 100,
  GESTURE: 200,
  CONTROLLER: 300,
  SPEED: 310,
  LOADING: 400,
  ERROR: 400,
  COMPLETE: 400,
  HEADER: 500,
  VIP_TRY: 600,
  FEEDBACK: 700
} as const;

// 视频蒙层组件属性
export interface VideoOverlayProps {
  overlayState: VideoOverlayState;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onSpeedChange?: (speed: number) => void;
  onFullscreen?: () => void;
  onShare?: () => void;
  onFeedback?: () => void;
  onVipAction?: () => void;
  className?: string;
}

// 视频蒙层组件
export const VideoOverlay: React.FC<VideoOverlayProps> = ({
  overlayState,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onSpeedChange,
  onFullscreen,
  onShare,
  onFeedback,
  onVipAction,
  className = ''
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* 手势蒙层 - 处理点击、双击等手势 */}
      <GestureOverlay
        overlayState={overlayState}
        onPlay={onPlay}
        onPause={onPause}
        onSeek={onSeek}
        style={{ zIndex: OVERLAY_LEVELS.GESTURE }}
      />

      {/* 控制器蒙层 - 播放/暂停、进度条等 */}
      <ControllerOverlay
        overlayState={overlayState}
        onPlay={onPlay}
        onPause={onPause}
        onSeek={onSeek}
        onVolumeChange={onVolumeChange}
        onFullscreen={onFullscreen}
        style={{ zIndex: OVERLAY_LEVELS.CONTROLLER }}
      />

      {/* 倍速选择蒙层 */}
      {overlayState.speedCoverVisible && (
        <SpeedOverlay
          overlayState={overlayState}
          onSpeedChange={onSpeedChange}
          style={{ zIndex: OVERLAY_LEVELS.SPEED }}
        />
      )}

      {/* 加载蒙层 */}
      {!overlayState.isReady && !overlayState.errorCoverVisible && (
        <LoadingOverlay
          style={{ zIndex: OVERLAY_LEVELS.LOADING }}
        />
      )}

      {/* 错误蒙层 */}
      {overlayState.errorCoverVisible && (
        <ErrorOverlay
          overlayState={overlayState}
          onRetry={onPlay}
          style={{ zIndex: OVERLAY_LEVELS.ERROR }}
        />
      )}

      {/* 播放完成蒙层 */}
      {overlayState.completeCoverVisible && (
        <CompleteOverlay
          overlayState={overlayState}
          onReplay={onPlay}
          style={{ zIndex: OVERLAY_LEVELS.COMPLETE }}
        />
      )}

      {/* VIP试看结束蒙层 */}
      {overlayState.vipTryCompleteCoverVisible && (
        <VipTryOverlay
          overlayState={overlayState}
          onVipAction={onVipAction}
          style={{ zIndex: OVERLAY_LEVELS.VIP_TRY }}
        />
      )}

      {/* VIP试看气泡 */}
      {overlayState.vipTryCoverVisible && (
        <VipTryOverlay
          overlayState={overlayState}
          onVipAction={onVipAction}
          isBubble={true}
          style={{ zIndex: OVERLAY_LEVELS.VIP_TRY }}
        />
      )}

      {/* 顶部UI蒙层 */}
      {overlayState.headerCoverVisible && (
        <HeaderOverlay
          overlayState={overlayState}
          onShare={onShare}
          onFeedback={onFeedback}
          style={{ zIndex: OVERLAY_LEVELS.HEADER }}
        />
      )}

      {/* 反馈蒙层 */}
      {overlayState.feedbackCoverVisible && (
        <FeedbackOverlay
          overlayState={overlayState}
          onClose={() => {/* 关闭反馈蒙层的逻辑 */}}
          style={{ zIndex: OVERLAY_LEVELS.FEEDBACK }}
        />
      )}
    </div>
  );
};

export default VideoOverlay;