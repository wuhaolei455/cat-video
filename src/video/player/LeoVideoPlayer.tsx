// Leo视频播放器组件 - 整合蒙层和控制器
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { VideoPlayerController, PlayerEvent, PlayerState } from './VideoPlayerController';
import { useVideoOverlayState, VideoOverlayState } from '../overlay/VideoOverlayState';
import { VideoOverlay } from '../overlay/VideoOverlay';
import type { VideoInfo } from '../overlay/VideoOverlayState';

// 播放器配置
export interface LeoVideoPlayerConfig {
  src: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  width?: number;
  height?: number;
  volume?: number;
  playbackRate?: number;
  // VIP相关配置
  enableVip?: boolean;
  vipMark?: boolean;
  free?: boolean;
  // 功能配置
  enableFeedback?: boolean;
  enableShare?: boolean;
  enableFullscreen?: boolean;
  enablePiP?: boolean;
}

// 播放器属性
export interface LeoVideoPlayerProps {
  config: LeoVideoPlayerConfig;
  videoInfo?: VideoInfo;
  onStateChange?: (state: PlayerState) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onError?: (error: Error) => void;
  onVipAction?: () => void;
  onShare?: () => void;
  onFeedback?: () => void;
  className?: string;
}

// Leo视频播放器组件
export const LeoVideoPlayer: React.FC<LeoVideoPlayerProps> = ({
  config,
  videoInfo,
  onStateChange,
  onTimeUpdate,
  onError,
  onVipAction,
  onShare,
  onFeedback,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controllerRef = useRef<VideoPlayerController | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 使用蒙层状态管理
  const overlayState = useVideoOverlayState();

  // 初始化播放器控制器
  const initializeController = useCallback(async () => {
    if (!videoRef.current || controllerRef.current) return;

    try {
      const controller = new VideoPlayerController();
      await controller.initialize(videoRef.current);
      
      // 设置数据提供者
      controller.setDataProvider(async () => config.src);
      
      // 绑定事件监听器
      controller.on(PlayerEvent.STATE_CHANGE, (state: PlayerState) => {
        overlayState.syncPlayerState(state);
        onStateChange?.(state);
      });

      controller.on(PlayerEvent.TIME_UPDATE, (time: number) => {
        overlayState.handleTimeUpdate(time);
        onTimeUpdate?.(time, overlayState.state.totalDuration);
      });

      controller.on(PlayerEvent.DURATION_UPDATE, (duration: number) => {
        overlayState.setTotalDuration(duration);
      });

      controller.on(PlayerEvent.ERROR, (error: Error) => {
        overlayState.handleError(error);
        onError?.(error);
      });

      controller.on(PlayerEvent.SPEED_DONE, (speed: number) => {
        overlayState.setSpeed(speed as any);
      });

      controller.on(PlayerEvent.VOLUME_CHANGE, (volume: number) => {
        // 可以在这里处理音量变化
      });

      controllerRef.current = controller;
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize video controller:', error);
      onError?.(error as Error);
    }
  }, [config.src, overlayState, onStateChange, onTimeUpdate, onError]);

  // 设置视频信息
  useEffect(() => {
    if (videoInfo) {
      overlayState.setCurrentVideoData(videoInfo);
    } else {
      // 从配置创建默认视频信息
      const defaultVideoInfo: VideoInfo = {
        id: 'default',
        name: '视频播放',
        duration: 0,
        videoUrl: config.src,
        vipMark: config.vipMark || false,
        free: config.free !== false
      };
      overlayState.setCurrentVideoData(defaultVideoInfo);
    }
  }, [videoInfo, config, overlayState]);

  // 设置功能配置
  useEffect(() => {
    overlayState.setEnableFeedback(config.enableFeedback || false);
    overlayState.setEnableShare(config.enableShare || false);
  }, [config.enableFeedback, config.enableShare, overlayState]);

  // 初始化控制器
  useEffect(() => {
    initializeController();
    
    return () => {
      if (controllerRef.current) {
        controllerRef.current.release();
      }
    };
  }, [initializeController]);

  // 播放器控制方法
  const handlePlay = useCallback(() => {
    controllerRef.current?.play();
  }, []);

  const handlePause = useCallback(() => {
    controllerRef.current?.pause();
  }, []);

  const handleSeek = useCallback((time: number) => {
    controllerRef.current?.seek(time);
  }, []);

  const handleVolumeChange = useCallback((volume: number) => {
    controllerRef.current?.setVolume(volume);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    controllerRef.current?.setSpeed(speed as any);
    overlayState.setSpeedCoverVisible(false);
  }, [overlayState]);

  const handleFullscreen = useCallback(async () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await videoRef.current.requestFullscreen();
      }
    }
  }, []);

  const handleShare = useCallback(() => {
    onShare?.();
  }, [onShare]);

  const handleFeedback = useCallback(() => {
    overlayState.setFeedbackCoverVisible(true);
    onFeedback?.();
  }, [overlayState, onFeedback]);

  const handleVipAction = useCallback(() => {
    onVipAction?.();
  }, [onVipAction]);

  // 处理视频元素属性变化
  useEffect(() => {
    if (!videoRef.current || !isInitialized) return;

    const video = videoRef.current;
    
    // 设置基本属性
    if (config.poster) video.poster = config.poster;
    if (config.autoplay !== undefined) video.autoplay = config.autoplay;
    if (config.muted !== undefined) video.muted = config.muted;
    if (config.controls !== undefined) video.controls = config.controls;
    if (config.loop !== undefined) video.loop = config.loop;
    if (config.preload) video.preload = config.preload;
    if (config.width) video.width = config.width;
    if (config.height) video.height = config.height;
    if (config.volume !== undefined) video.volume = config.volume;
    if (config.playbackRate !== undefined) video.playbackRate = config.playbackRate;

    // 设置视频源
    video.src = config.src;
  }, [config, isInitialized]);

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* 视频元素 */}
      <video
        ref={videoRef}
        className="w-full h-auto"
        style={{ maxHeight: '500px' }}
        playsInline
      />

      {/* 视频蒙层 */}
      {isInitialized && (
        <VideoOverlay
          overlayState={overlayState.state}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onSpeedChange={handleSpeedChange}
          onFullscreen={handleFullscreen}
          onShare={handleShare}
          onFeedback={handleFeedback}
          onVipAction={handleVipAction}
        />
      )}

      {/* 调试信息（开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>状态: {overlayState.state.isPlaying ? '播放中' : '已暂停'}</div>
          <div>时间: {Math.floor(overlayState.state.currentPlayTime / 1000)}s</div>
          <div>速度: {overlayState.state.speed}x</div>
        </div>
      )}
    </div>
  );
};

export default LeoVideoPlayer;