'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type {
  VideoConfig,
  VideoState,
  VideoQuality,
  PlaybackRate,
  VideoEventType,
  VideoEventData,
  IVideoPlayer
} from '../video/types';

import {
  createSmartVideoPlayer,
  VideoConfigBuilder,
  PresetConfigFactory
} from '../video/VideoPlayerFactory';

// 演示配置类型
interface DemoConfig {
  title: string;
  description: string;
  config: VideoConfig;
  features: string[];
}

// 播放器状态接口
interface PlayerState {
  state: VideoState;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: PlaybackRate;
  quality: VideoQuality;
  isFullscreen: boolean;
  isPiP: boolean;
  buffering: boolean;
  error: string | null;
}

// 事件日志接口
interface EventLog {
  id: string;
  timestamp: number;
  type: VideoEventType;
  data: any;
}

const VideoPlayerDemo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<IVideoPlayer | null>(null);
  
  // 状态管理
  const [selectedDemo, setSelectedDemo] = useState<number>(0);
  const [playerState, setPlayerState] = useState<PlayerState>({
    state: 'idle',
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    quality: 'auto',
    isFullscreen: false,
    isPiP: false,
    buffering: false,
    error: null
  });
  
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [showEvents, setShowEvents] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<VideoQuality[]>(['auto']);

  // 演示配置
  const demoConfigs: DemoConfig[] = [
    {
      title: 'HTML5 MP4 播放器',
      description: '基础的HTML5视频播放，支持MP4格式',
      config: PresetConfigFactory.mp4('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
        .poster('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg')
        .build(),
      features: ['HTML5 Video API', '基础播放控制', '音量控制', '进度控制']
    },
    {
      title: 'HLS 自适应流播放器',
      description: 'HLS流媒体播放，支持自适应比特率',
      config: PresetConfigFactory.hls('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', {
        enableWorker: true,
        debug: true,
        lowLatencyMode: false
      }).build(),
      features: ['HLS.js集成', '自适应比特率', '质量切换', '缓冲管理']
    },
    {
      title: 'HLS 直播流播放器',
      description: 'HLS直播流播放，低延迟优化',
      config: PresetConfigFactory.live('https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8')
        .build(),
      features: ['直播流支持', '低延迟模式', '实时缓冲', '自动重连']
    },
    {
      title: '多质量视频播放器',
      description: '支持多种质量的视频播放',
      config: VideoConfigBuilder.create()
        .sources([
          { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', type: 'mp4', quality: '720p' },
          { src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', type: 'mp4', quality: '480p' }
        ])
        .controls(true)
        .qualities(['720p', '480p', 'auto'])
        .build(),
      features: ['多质量支持', '质量切换', '自动质量选择', '带宽自适应']
    }
  ];

  // 初始化播放器
  const initializePlayer = useCallback((config: VideoConfig) => {
    if (!videoRef.current) return;

    // 销毁现有播放器
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    try {
      // 创建新播放器
      const player = createSmartVideoPlayer(videoRef.current, config);
      playerRef.current = player;

      // 获取可用质量
      const qualities = player.getAvailableQualities();
      setAvailableQualities(qualities);

      // 绑定事件监听器
      const eventTypes: VideoEventType[] = [
        'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
        'play', 'playing', 'pause', 'seeking', 'seeked', 'waiting',
        'timeupdate', 'progress', 'volumechange', 'ratechange', 'ended',
        'error', 'qualitychange', 'buffering', 'ready'
      ];

      eventTypes.forEach(eventType => {
        player.on(eventType, (eventData) => {
          handleVideoEvent(eventType, eventData);
        });
      });

      // 更新初始状态
      setPlayerState(prev => ({
        ...prev,
        state: player.state,
        volume: videoRef.current?.volume || 1,
        error: null
      }));

    } catch (error) {
      console.error('Failed to initialize player:', error);
      setPlayerState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        state: 'error'
      }));
    }
  }, []);

  // 处理视频事件
  const handleVideoEvent = useCallback((type: VideoEventType, data: VideoEventData) => {
    // 记录事件
    const logEntry: EventLog = {
      id: `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      type,
      data: data.payload
    };

    setEventLogs(prev => [logEntry, ...prev.slice(0, 49)]); // 保持最新50条

    // 更新播放器状态
    setPlayerState(prev => {
      const newState = { ...prev };

      switch (type) {
        case 'timeupdate':
          newState.currentTime = data.currentTime;
          newState.duration = data.duration;
          break;
        case 'volumechange':
          if ('volume' in data.payload) {
            newState.volume = data.payload.volume;
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
        case 'buffering':
          if ('isBuffering' in data.payload) {
            newState.buffering = data.payload.isBuffering;
          }
          break;
        case 'error':
          if ('message' in data.payload) {
            newState.error = data.payload.message;
          }
          newState.state = 'error';
          break;
        case 'play':
        case 'playing':
        case 'pause':
        case 'ended':
        case 'waiting':
        case 'seeking':
        case 'canplay':
          newState.state = type;
          break;
      }

      return newState;
    });
  }, []);

  // 切换演示
  const handleDemoChange = useCallback((index: number) => {
    setSelectedDemo(index);
    setEventLogs([]);
    setPlayerState(prev => ({
      ...prev,
      error: null,
      state: 'idle'
    }));
  }, []);

  // 播放器控制方法
  const handlePlay = () => playerRef.current?.play();
  const handlePause = () => playerRef.current?.pause();
  const handleStop = () => playerRef.current?.stop();
  const handleSeek = (time: number) => playerRef.current?.seek(time);
  const handleVolumeChange = (volume: number) => playerRef.current?.setVolume(volume);
  const handleRateChange = (rate: PlaybackRate) => playerRef.current?.setPlaybackRate(rate);
  const handleQualityChange = (quality: VideoQuality) => playerRef.current?.setQuality(quality);
  const handleToggleFullscreen = () => playerRef.current?.toggleFullscreen();
  const handleTogglePiP = () => playerRef.current?.togglePiP();

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 初始化效果
  useEffect(() => {
    const currentConfig = demoConfigs[selectedDemo].config;
    initializePlayer(currentConfig);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [selectedDemo, initializePlayer]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 演示选择器 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">视频播放器演示</h2>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {demoConfigs.map((demo, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedDemo === index
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
              }`}
              onClick={() => handleDemoChange(index)}
            >
              {demo.title}
            </button>
          ))}
        </div>
      </div>

      {/* 当前演示信息 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{demoConfigs[selectedDemo].title}</h3>
        <p className="text-gray-600 mb-4">{demoConfigs[selectedDemo].description}</p>
        <div className="text-sm text-gray-700">
          <strong className="text-gray-800">特性:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {demoConfigs[selectedDemo].features.map((feature, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 视频播放器 */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-xl">
        <video
          ref={videoRef}
          className="w-full h-auto"
          controls
          style={{ maxHeight: '500px' }}
        />
        
        {/* 状态覆盖层 */}
        {playerState.buffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-white text-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              缓冲中...
            </div>
          </div>
        )}
        
        {playerState.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-90">
            <div className="text-white text-center p-6 rounded-lg bg-black bg-opacity-50">
              <div className="text-xl font-semibold mb-2">播放错误</div>
              <div className="text-sm">{playerState.error}</div>
            </div>
          </div>
        )}
      </div>

      {/* 播放器控制面板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 播放控制 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">播放控制</h4>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handlePlay} disabled={playerState.state === 'playing'}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm">
              ▶️ 播放
            </button>
            <button onClick={handlePause} disabled={playerState.state !== 'playing'}
              className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm">
              ⏸️ 暂停
            </button>
            <button onClick={handleStop}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
              ⏹️ 停止
            </button>
            <button onClick={handleToggleFullscreen}
              className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm">
              ⛶ 全屏
            </button>
          </div>
        </div>

        {/* 进度和音量控制 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">进度 & 音量</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">进度</label>
              <input
                type="range"
                min="0"
                max={playerState.duration || 0}
                value={playerState.currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-500 mt-1 text-center">
                {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">音量: {Math.round(playerState.volume * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={playerState.volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 播放速度和质量 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">设置</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">播放速度</label>
              <select
                value={playerState.playbackRate}
                onChange={(e) => handleRateChange(Number(e.target.value) as PlaybackRate)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value={0.25}>0.25x</option>
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={1.75}>1.75x</option>
                <option value={2}>2x</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">视频质量</label>
              <select
                value={playerState.quality}
                onChange={(e) => handleQualityChange(e.target.value as VideoQuality)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                {availableQualities.map(quality => (
                  <option key={quality} value={quality}>
                    {quality}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 状态信息面板 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">播放器状态</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">状态</div>
            <div className={`font-semibold ${
              playerState.state === 'playing' ? 'text-green-600' :
              playerState.state === 'paused' ? 'text-yellow-600' :
              playerState.state === 'error' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {playerState.state}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">当前时间</div>
            <div className="font-mono">{formatTime(playerState.currentTime)}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">总时长</div>
            <div className="font-mono">{formatTime(playerState.duration)}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">缓冲状态</div>
            <div className={`font-semibold ${playerState.buffering ? 'text-blue-600' : 'text-green-600'}`}>
              {playerState.buffering ? '缓冲中' : '就绪'}
            </div>
          </div>
        </div>
      </div>

      {/* 事件日志 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800">事件日志</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEvents(!showEvents)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              {showEvents ? '隐藏' : '显示'} ({eventLogs.length})
            </button>
            <button
              onClick={() => setEventLogs([])}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              清空
            </button>
          </div>
        </div>
        
        {showEvents && (
          <div className="max-h-80 overflow-y-auto">
            {eventLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">暂无事件</div>
            ) : (
              <div className="divide-y">
                {eventLogs.map(log => (
                  <div key={log.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="text-xs text-gray-500 font-mono min-w-20">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-sm font-semibold text-blue-600 font-mono min-w-24">
                        {log.type}
                      </div>
                      <div className="flex-1 text-xs font-mono text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                        <pre>{JSON.stringify(log.data, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerDemo;