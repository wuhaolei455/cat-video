import React, { useRef, useEffect, useCallback, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useCoverManager } from '../hooks/useCoverManager';
import { createCoverPresetFactory } from '../cover';
import type {
  VideoConfig,
  VideoEventType,
  VideoEventData,
  VideoState,
  VideoQuality,
  PlaybackRate,
  IVideoPlayer,
  CoverConfig,
  CoverEventType,
  CoverEventData,
  ICover
} from '../types';
import { createSmartVideoPlayer } from '../VideoPlayerFactory';
import { CoverProvider } from '../context/CoverContext';

// 播放器状态接口 
export interface PlayerState {
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

// Cover配置选项
export interface CoverOptions {
  enableCommonCovers?: boolean;
  enableBusinessCovers?: boolean;
  customCovers?: CoverConfig[];
  responsive?: boolean;
}

// 组件Props
export interface LeoVideoPlayerWithCoversProps {
  config: VideoConfig;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  
  // Cover相关配置
  coverOptions?: CoverOptions;
  onCoverEvent?: (type: CoverEventType, data: CoverEventData) => void;
  
  // 视频事件
  onStateChange?: (state: PlayerState) => void;
  onEvent?: (type: VideoEventType, data: VideoEventData) => void;
  onError?: (error: Error) => void;
}

// 组件Ref接口
export interface LeoVideoPlayerWithCoversRef {
  player: IVideoPlayer | null;
  element: HTMLVideoElement | null;
  container: HTMLElement | null;
  getState: () => PlayerState;
  
  // 播放器控制
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setQuality: (quality: VideoQuality) => void;
  setPlaybackRate: (rate: PlaybackRate) => void;
  toggleFullscreen: () => Promise<void>;
  togglePiP: () => Promise<void>;
  
  // Cover控制
  getCover: (id: string) => ICover | undefined;
  showCover: (id: string) => void;
  hideCover: (id: string) => void;
  addCover: (config: CoverConfig) => ICover | null;
  removeCover: (id: string) => boolean;
  
  destroy: () => void;
}

const defaultPlayerState: PlayerState = {
  state: 'idle',
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  quality: 'auto',
  playbackRate: 1,
  buffered: 0,
  isFullscreen: false,
  isPiP: false,
  error: null
};

const defaultCoverOptions: CoverOptions = {
  enableCommonCovers: true,
  enableBusinessCovers: false,
  customCovers: [],
  responsive: true
};

export const LeoVideoPlayerWithCovers = forwardRef<LeoVideoPlayerWithCoversRef, LeoVideoPlayerWithCoversProps>(({
  config,
  width = '100%',
  height = 'auto',
  className = '',
  style = {},
  coverOptions = defaultCoverOptions,
  onCoverEvent,
  onStateChange,
  onEvent,
  onError
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<IVideoPlayer | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>(defaultPlayerState);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // 创建Cover配置
  const coverManagerConfig = useMemo(() => {
    const factory = createCoverPresetFactory();
    
    const commonCovers = coverOptions.enableCommonCovers 
      ? factory.createDefaultCommonCovers()
      : [];
    
    const businessCovers = coverOptions.enableBusinessCovers
      ? factory.createDefaultBusinessCovers()
      : [];
    
    // 添加自定义Cover
    if (coverOptions.customCovers) {
      coverOptions.customCovers.forEach(cover => {
        if (cover.type === 'play-button' || 
            cover.type === 'progress-bar' || 
            cover.type === 'volume-control' ||
            cover.type === 'fullscreen-button' ||
            cover.type === 'loading-spinner' ||
            cover.type === 'error-message' ||
            cover.type === 'quality-selector') {
          commonCovers.push(cover as any);
        } else {
          businessCovers.push(cover as any);
        }
      });
    }

    return {
      commonCovers,
      businessCovers,
      responsive: coverOptions.responsive ? {
        breakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1920
        },
        coverConfigs: {
          mobile: [],
          tablet: [],
          desktop: []
        }
      } : undefined
    };
  }, [coverOptions]);

  // 使用Cover管理器
  const coverManager = useCoverManager({
    config: coverManagerConfig,
    onCoverEvent: (type, data) => {
      onCoverEvent?.(type, data);
      handleCoverEvent(type, data);
    },
    onError
  });

  // 处理视频事件
  const handleVideoEvent = useCallback((type: VideoEventType, data: VideoEventData) => {
    // 更新播放器状态
    setPlayerState(prev => {
      const newState = { ...prev };
      
      switch (type) {
        case 'loadedmetadata':
          newState.duration = data.duration;
          break;
        case 'timeupdate':
          newState.currentTime = data.currentTime;
          newState.duration = data.duration;
          break;
        case 'play':
          newState.state = 'play';
          break;
        case 'playing':
          newState.state = 'playing';
          break;
        case 'pause':
          newState.state = 'paused';
          break;
        case 'ended':
          newState.state = 'ended';
          break;
        case 'waiting':
          newState.state = 'waiting';
          break;
        case 'canplay':
          newState.state = 'canplay';
          break;
        case 'loadstart':
          newState.state = 'loading';
          break;
        case 'volumechange':
          if (videoRef.current) {
            newState.volume = videoRef.current.volume;
            newState.muted = videoRef.current.muted;
          }
          break;
        case 'ratechange':
          if ('rate' in data.payload) {
            newState.playbackRate = data.payload.rate;
          }
          break;
        case 'qualitychange':
          if ('to' in data.payload) {
            newState.quality = data.payload.to;
          }
          break;
        case 'fullscreenchange':
          newState.isFullscreen = document.fullscreenElement === videoRef.current;
          break;
        case 'pip':
          newState.isPiP = document.pictureInPictureElement === videoRef.current;
          break;
        case 'error':
          newState.error = (data.payload as any)?.message || 'Unknown error';
          newState.state = 'error';
          break;
        case 'progress':
          if (videoRef.current && videoRef.current.buffered.length > 0) {
            const buffered = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
            newState.buffered = buffered;
          }
          break;
      }
      
      return newState;
    });

    // 转发事件给Cover管理器
    coverManager.handleVideoEvent(type, data);
    
    // 触发回调
    onEvent?.(type, data);
  }, [coverManager, onEvent]);

  // 处理Cover事件
  const handleCoverEvent = useCallback((type: CoverEventType, data: CoverEventData) => {
    switch (type) {
      case 'cover:click':
        // 处理Cover点击事件
        if (data.coverType === 'play-button') {
          if (playerState.state === 'paused' || playerState.state === 'ended') {
            playerRef.current?.play();
          }
        } else if (data.coverType === 'fullscreen-button') {
          playerRef.current?.toggleFullscreen();
        }
        break;
        
      case 'cover:error':
        onError?.(new Error(`Cover error: ${data.payload.message}`));
        break;
    }
  }, [playerState, onError]);

  // 状态变化回调
  useEffect(() => {
    onStateChange?.(playerState);
  }, [playerState, onStateChange]);

  // 初始化播放器
  const initializePlayer = useCallback(async () => {
    if (!videoRef.current || !containerRef.current) return;

    // 销毁旧播放器
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying previous player:', error);
      }
      playerRef.current = null;
    }

    try {
      const player = createSmartVideoPlayer(videoRef.current, config);
      playerRef.current = player;

      // 绑定所有视频事件
      const eventTypes: VideoEventType[] = [
        'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
        'play', 'playing', 'pause', 'seeking', 'seeked', 'waiting',
        'timeupdate', 'progress', 'volumechange', 'ratechange',
        'ended', 'error', 'qualitychange', 'fullscreenchange', 'pip', 'buffering', 'ready'
      ];

      eventTypes.forEach(eventType => {
        player.on(eventType, (eventData: VideoEventData) => {
          handleVideoEvent(eventType, eventData);
        });
      });

      // 初始化Cover管理器
      await coverManager.initialize(containerRef.current);
      setIsVideoReady(true);

      // 初始化状态
      setPlayerState(prev => ({
        ...prev,
        state: 'idle',
        error: null
      }));

    } catch (error) {
      console.error('Failed to initialize player:', error);
      setPlayerState(prev => ({
        ...prev,
        state: 'error',
        error: error instanceof Error ? error.message : 'Failed to initialize player'
      }));
      onError?.(error instanceof Error ? error : new Error('Failed to initialize player'));
    }
  }, [config, handleVideoEvent, onError, coverManager]);

  // 组件挂载时初始化播放器
  useEffect(() => {
    initializePlayer();
    
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying player on unmount:', error);
        }
      }
      coverManager.destroy();
    };
  }, [initializePlayer, coverManager]);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    player: playerRef.current,
    element: videoRef.current,
    container: containerRef.current,
    getState: () => playerState,
    
    // 播放器控制方法
    play: async () => {
      if (playerRef.current) {
        await playerRef.current.play();
      }
    },
    pause: () => {
      if (playerRef.current) {
        playerRef.current.pause();
      }
    },
    seek: (time: number) => {
      if (playerRef.current) {
        playerRef.current.seek(time);
      }
    },
    setVolume: (volume: number) => {
      if (playerRef.current) {
        playerRef.current.setVolume(volume);
      }
    },
    setQuality: (quality: VideoQuality) => {
      if (playerRef.current) {
        playerRef.current.setQuality(quality);
      }
    },
    setPlaybackRate: (rate: PlaybackRate) => {
      if (playerRef.current) {
        playerRef.current.setPlaybackRate(rate);
      }
    },
    toggleFullscreen: async () => {
      if (playerRef.current) {
        await playerRef.current.toggleFullscreen();
      }
    },
    togglePiP: async () => {
      if (playerRef.current) {
        await playerRef.current.togglePiP();
      }
    },
    
    // Cover控制方法
    getCover: (id: string) => coverManager.getCover(id),
    showCover: (id: string) => coverManager.showCover(id),
    hideCover: (id: string) => coverManager.hideCover(id),
    addCover: (config: CoverConfig) => coverManager.addCover(config),
    removeCover: (id: string) => coverManager.removeCover(id),
    
    destroy: () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      coverManager.destroy();
    }
  }), [playerState, coverManager]);

  return (
    <CoverProvider value={coverManager}>
      <div 
        ref={containerRef}
        className={`leo-video-player-with-covers ${className}`}
        style={{ 
          width, 
          height, 
          position: 'relative',
          backgroundColor: '#000',
          overflow: 'hidden',
          ...style 
        }}
      >
        <video
          ref={videoRef}
          style={{ 
            width: '100%', 
            height: '100%',
            display: 'block'
          }}
          playsInline
        />
        
        {/* 开发调试信息 */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '5px',
            fontSize: '12px',
            fontFamily: 'monospace',
            borderRadius: '3px',
            pointerEvents: 'none'
          }}>
            State: {playerState.state} | Covers: {coverManager.state?.covers.size || 0}
          </div>
        )}
      </div>
    </CoverProvider>
  );
});

LeoVideoPlayerWithCovers.displayName = 'LeoVideoPlayerWithCovers';

export default LeoVideoPlayerWithCovers;
