import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
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

// 事件日志接口
export interface EventLog {
  id: string;
  timestamp: number;
  type: VideoEventType;
  data: any;
}

// 组件Props
export interface LeoVideoPlayerProps {
  config: VideoConfig;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  showControls?: boolean;
  showEventLog?: boolean;
  onStateChange?: (state: PlayerState) => void;
  onEvent?: (type: VideoEventType, data: VideoEventData) => void;
  onError?: (error: Error) => void;
}

// 组件Ref接口
export interface LeoVideoPlayerRef {
  player: IVideoPlayer | null;
  element: HTMLVideoElement | null;
  getState: () => PlayerState;
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

export const LeoVideoPlayer = forwardRef<LeoVideoPlayerRef, LeoVideoPlayerProps>(({
  config,
  width = '100%',
  height = 'auto',
  className = '',
  style = {},
  showControls = true,
  showEventLog = false,
  onStateChange,
  onEvent,
  onError
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<IVideoPlayer | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>(defaultPlayerState);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);

  // 处理视频事件
  const handleVideoEvent = useCallback((type: VideoEventType, data: VideoEventData) => {
    // 记录事件日志
    if (showEventLog) {
      const logEntry: EventLog = {
        id: `${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        type,
        data: data.payload
      };
      setEventLogs(prev => [logEntry, ...prev.slice(0, 49)]);
    }

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

    // 触发回调
    onEvent?.(type, data);
  }, [showEventLog, onEvent]);

  // 状态变化回调
  useEffect(() => {
    onStateChange?.(playerState);
  }, [playerState, onStateChange]);

  // 初始化播放器
  const initializePlayer = useCallback(async () => {
    if (!videoRef.current) return;

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
  }, [config, handleVideoEvent, onError]);

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
    };
  }, [initializePlayer]);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    player: playerRef.current,
    element: videoRef.current,
    getState: () => playerState,
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
    destroy: () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    }
  }), [playerState]);

  return (
    <div 
      className={`leo-video-player ${className}`}
      style={{ width, height, ...style }}
    >
      <video
        ref={videoRef}
        controls={showControls}
        style={{ width: '100%', height: '100%' }}
        playsInline
      />
      
      {/* 事件日志显示 */}
      {showEventLog && (
        <div className="leo-video-events" style={{ 
          marginTop: '10px', 
          maxHeight: '200px', 
          overflow: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <h4>Event Log:</h4>
          {eventLogs.map(log => (
            <div key={log.id} style={{ marginBottom: '5px' }}>
              <span style={{ color: '#666' }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              {' '}
              <strong>{log.type}</strong>
              {' '}
              <span style={{ color: '#888' }}>
                {JSON.stringify(log.data)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

LeoVideoPlayer.displayName = 'LeoVideoPlayer';

export default LeoVideoPlayer;
