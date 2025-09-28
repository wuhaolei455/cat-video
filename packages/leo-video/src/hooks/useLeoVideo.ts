import { useRef, useCallback, useState, useEffect } from 'react';
import { 
  VideoConfig, 
  VideoEventType, 
  VideoEventData, 
  VideoState, 
  VideoQuality, 
  PlaybackRate,
  IVideoPlayer 
} from '../types';
import { createSmartVideoPlayer } from '../VideoPlayerFactory';

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

// Hook配置接口
export interface UseLeoVideoOptions {
  config: VideoConfig;
  autoInit?: boolean;
  onStateChange?: (state: PlayerState) => void;
  onEvent?: (type: VideoEventType, data: VideoEventData) => void;
  onError?: (error: Error) => void;
}

// Hook返回值接口
export interface UseLeoVideoReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  player: IVideoPlayer | null;
  state: PlayerState;
  isReady: boolean;
  error: Error | null;
  
  // 控制方法
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
  
  // 状态查询
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

/**
 * useLeoVideo Hook
 * 
 * 提供完整的视频播放器功能，包括状态管理、事件处理和控制方法
 * 
 * @param options Hook配置选项
 * @returns 播放器实例和控制方法
 */
export const useLeoVideo = ({
  config,
  autoInit = true,
  onStateChange,
  onEvent,
  onError
}: UseLeoVideoOptions): UseLeoVideoReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<IVideoPlayer | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>(defaultPlayerState);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 处理视频事件
  const handleVideoEvent = useCallback((type: VideoEventType, data: VideoEventData) => {
    // 更新播放器状态
    setPlayerState(prev => {
      const newState = { ...prev };
      
      switch (type) {
        case 'ready':
          setIsReady(true);
          newState.state = 'canplay';
          break;
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
          const errorMessage = (data.payload as any)?.message || 'Unknown error';
          newState.error = errorMessage;
          newState.state = 'error';
          setError(new Error(errorMessage));
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

    // 触发回调
    onEvent?.(type, data);
  }, [onEvent]);

  // 状态变化回调
  useEffect(() => {
    onStateChange?.(playerState);
  }, [playerState, onStateChange]);

  // 初始化播放器
  const initialize = useCallback(async () => {
    if (!videoRef.current) {
      throw new Error('Video element is not available');
    }

    // 销毁旧播放器
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (err) {
        console.warn('Error destroying previous player:', err);
      }
      playerRef.current = null;
    }

    try {
      setError(null);
      setIsReady(false);
      
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

      // 重置状态
      setPlayerState(prev => ({
        ...prev,
        state: 'idle',
        error: null
      }));

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize player');
      setError(error);
      setPlayerState(prev => ({
        ...prev,
        state: 'error',
        error: error.message
      }));
      onError?.(error);
      throw error;
    }
  }, [config, handleVideoEvent, onError]);

  // 控制方法
  const play = useCallback(async () => {
    if (!playerRef.current) throw new Error('Player not initialized');
    await playerRef.current.play();
  }, []);

  const pause = useCallback(() => {
    if (!playerRef.current) throw new Error('Player not initialized');
    playerRef.current.pause();
  }, []);

  const seek = useCallback((time: number) => {
    if (!playerRef.current) throw new Error('Player not initialized');
    playerRef.current.seek(time);
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!playerRef.current) throw new Error('Player not initialized');
    playerRef.current.setVolume(volume);
  }, []);

  const setQuality = useCallback((quality: VideoQuality) => {
    if (!playerRef.current) throw new Error('Player not initialized');
    playerRef.current.setQuality(quality);
  }, []);

  const setPlaybackRate = useCallback((rate: PlaybackRate) => {
    if (!playerRef.current) throw new Error('Player not initialized');
    playerRef.current.setPlaybackRate(rate);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!playerRef.current) throw new Error('Player not initialized');
    await playerRef.current.toggleFullscreen();
  }, []);

  const togglePiP = useCallback(async () => {
    if (!playerRef.current) throw new Error('Player not initialized');
    await playerRef.current.togglePiP();
  }, []);

  const destroy = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (err) {
        console.warn('Error destroying player:', err);
      }
      playerRef.current = null;
    }
    setIsReady(false);
    setError(null);
    setPlayerState(defaultPlayerState);
  }, []);

  // 状态查询方法
  const getAvailableQualities = useCallback((): VideoQuality[] => {
    if (!playerRef.current) return ['auto'];
    return playerRef.current.getAvailableQualities();
  }, []);

  const getCurrentTime = useCallback((): number => {
    return playerState.currentTime;
  }, [playerState.currentTime]);

  const getDuration = useCallback((): number => {
    return playerState.duration;
  }, [playerState.duration]);

  const getVolume = useCallback((): number => {
    return playerState.volume;
  }, [playerState.volume]);

  const isMuted = useCallback((): boolean => {
    return playerState.muted;
  }, [playerState.muted]);

  const isPlaying = useCallback((): boolean => {
    return playerState.state === 'playing';
  }, [playerState.state]);

  const isPaused = useCallback((): boolean => {
    return playerState.state === 'paused';
  }, [playerState.state]);

  const isEnded = useCallback((): boolean => {
    return playerState.state === 'ended';
  }, [playerState.state]);

  const isFullscreen = useCallback((): boolean => {
    return playerState.isFullscreen;
  }, [playerState.isFullscreen]);

  const isPictureInPicture = useCallback((): boolean => {
    return playerState.isPiP;
  }, [playerState.isPiP]);

  // 自动初始化
  useEffect(() => {
    if (autoInit) {
      initialize().catch(console.error);
    }
    
    return () => {
      destroy();
    };
  }, [autoInit, initialize, destroy]);

  return {
    videoRef,
    player: playerRef.current,
    state: playerState,
    isReady,
    error,
    
    // 控制方法
    initialize,
    play,
    pause,
    seek,
    setVolume,
    setQuality,
    setPlaybackRate,
    toggleFullscreen,
    togglePiP,
    destroy,
    
    // 状态查询
    getAvailableQualities,
    getCurrentTime,
    getDuration,
    getVolume,
    isMuted,
    isPlaying,
    isPaused,
    isEnded,
    isFullscreen,
    isPictureInPicture
  };
};

export default useLeoVideo;
