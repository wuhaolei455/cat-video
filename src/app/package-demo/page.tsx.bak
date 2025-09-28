'use client';

import React, { useState, useRef } from 'react';
import { 
  LeoVideoPlayer, 
  useLeoVideo,
  type LeoVideoPlayerRef,
  type VideoConfig,
  type VideoEventType,
  type VideoEventData,
  type PlayerState as LeoPlayerState
} from 'leo-video';

const PackageDemoPage: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<'component' | 'hook'>('component');
  const [playerState, setPlayerState] = useState<LeoPlayerState | null>(null);
  const [eventLogs, setEventLogs] = useState<Array<{ type: VideoEventType; data: any; time: string }>>([]);
  const playerRef = useRef<LeoVideoPlayerRef>(null);

  // 视频配置
  const videoConfig: VideoConfig = {
    sources: [
      {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'mp4',
        quality: '720p',
        label: '720p MP4'
      }
    ],
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    autoplay: false,
    controls: true,
    muted: false,
    loop: false,
    preload: 'metadata',
    playsinline: true
  };

  // HLS配置示例
  const hlsConfig: VideoConfig = {
    sources: [
      {
        src: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
        type: 'hls',
        quality: 'auto',
        label: 'HLS Stream'
      }
    ],
    autoplay: false,
    controls: true,
    hls: {
      debug: false,
      enableWorker: true,
      lowLatencyMode: false
    }
  };

  // 事件处理
  const handleVideoEvent = (type: VideoEventType, data: VideoEventData) => {
    const logEntry = {
      type,
      data: data.payload,
      time: new Date().toLocaleTimeString()
    };
    setEventLogs(prev => [logEntry, ...prev.slice(0, 19)]); // 保持最新20条
  };

  const handleStateChange = (state: LeoPlayerState) => {
    setPlayerState(state);
  };

  // Hook演示组件
  const HookDemo: React.FC = () => {
    const {
      videoRef,
      state,
      isReady,
      error,
      play,
      pause,
      seek,
      setVolume,
      setQuality,
      toggleFullscreen,
      getAvailableQualities
    } = useLeoVideo({
      config: videoConfig,
      onEvent: handleVideoEvent,
      onStateChange: handleStateChange
    });

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          🎣 useLeoVideo Hook 演示
        </h3>
        
        <div className="bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-auto"
            controls
            style={{ maxHeight: '400px' }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={play}
            disabled={!isReady}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 
                       text-white rounded-lg transition-colors"
          >
            ▶️ 播放
          </button>
          <button
            onClick={pause}
            disabled={!isReady}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 
                       text-white rounded-lg transition-colors"
          >
            ⏸️ 暂停
          </button>
          <button
            onClick={() => seek(30)}
            disabled={!isReady}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 
                       text-white rounded-lg transition-colors"
          >
            ⏭️ +30s
          </button>
          <button
            onClick={toggleFullscreen}
            disabled={!isReady}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 
                       text-white rounded-lg transition-colors"
          >
            🔍 全屏
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              音量控制
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={state.volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              disabled={!isReady}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              视频质量
            </label>
            <select
              value={state.quality}
              onChange={(e) => setQuality(e.target.value as any)}
              disabled={!isReady}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {getAvailableQualities().map(quality => (
                <option key={quality} value={quality}>
                  {quality}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">播放器状态</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>状态: <span className="font-mono text-blue-600">{state.state}</span></div>
            <div>时间: <span className="font-mono text-blue-600">
              {state.currentTime.toFixed(1)}s / {state.duration.toFixed(1)}s
            </span></div>
            <div>音量: <span className="font-mono text-blue-600">{(state.volume * 100).toFixed(0)}%</span></div>
            <div>质量: <span className="font-mono text-blue-600">{state.quality}</span></div>
            <div>准备: <span className="font-mono text-blue-600">{isReady ? '是' : '否'}</span></div>
            <div>错误: <span className="font-mono text-red-600">{error?.message || '无'}</span></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            📦 Leo Video Package 演示
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            使用 leo-video npm 包构建的视频播放器
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            展示组件和Hook两种使用方式
          </p>
        </header>

        <main className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          {/* 选项卡切换 */}
          <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedDemo('component')}
              className={`px-6 py-3 font-medium transition-colors ${
                selectedDemo === 'component'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🧩 LeoVideoPlayer 组件
            </button>
            <button
              onClick={() => setSelectedDemo('hook')}
              className={`px-6 py-3 font-medium transition-colors ${
                selectedDemo === 'hook'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎣 useLeoVideo Hook
            </button>
          </div>

          {/* 演示内容 */}
          {selectedDemo === 'component' ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                🧩 LeoVideoPlayer 组件演示
              </h3>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* MP4 播放器 */}
                <div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                    📹 MP4 视频播放器
                  </h4>
                  <LeoVideoPlayer
                    ref={playerRef}
                    config={videoConfig}
                    width="100%"
                    height="250px"
                    showControls={true}
                    showEventLog={false}
                    onStateChange={handleStateChange}
                    onEvent={handleVideoEvent}
                    className="rounded-lg overflow-hidden shadow-md"
                  />
                </div>

                {/* HLS 播放器 */}
                <div>
                  <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                    🌊 HLS 流媒体播放器
                  </h4>
                  <LeoVideoPlayer
                    config={hlsConfig}
                    width="100%"
                    height="250px"
                    showControls={true}
                    showEventLog={false}
                    onStateChange={handleStateChange}
                    onEvent={handleVideoEvent}
                    className="rounded-lg overflow-hidden shadow-md"
                  />
                </div>
              </div>

              {/* 播放器控制 */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">播放器控制</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => playerRef.current?.play()}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    ▶️ 播放
                  </button>
                  <button
                    onClick={() => playerRef.current?.pause()}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                  >
                    ⏸️ 暂停
                  </button>
                  <button
                    onClick={() => playerRef.current?.seek(30)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    ⏭️ +30s
                  </button>
                  <button
                    onClick={() => playerRef.current?.toggleFullscreen()}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    🔍 全屏
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <HookDemo />
          )}

          {/* 状态显示 */}
          {playerState && (
            <div className="mt-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">当前播放器状态</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">状态</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{playerState.state}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">当前时间</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {playerState.currentTime.toFixed(1)}s
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">总时长</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {playerState.duration.toFixed(1)}s
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">音量</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {(playerState.volume * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">质量</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{playerState.quality}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">播放速度</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{playerState.playbackRate}x</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">全屏</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {playerState.isFullscreen ? '是' : '否'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400">静音</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {playerState.muted ? '是' : '否'}
                  </span>
                </div>
              </div>
              {playerState.error && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <span className="text-red-600 dark:text-red-400 font-medium">错误: </span>
                  <span className="text-red-800 dark:text-red-300">{playerState.error}</span>
                </div>
              )}
            </div>
          )}

          {/* 事件日志 */}
          {eventLogs.length > 0 && (
            <div className="mt-6 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <h4 className="font-semibold text-white mb-3">事件日志 (最新20条)</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {eventLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-gray-500 text-xs w-20 flex-shrink-0">{log.time}</span>
                    <span className="text-yellow-400 w-24 flex-shrink-0">{log.type}</span>
                    <span className="text-gray-300 break-all">
                      {JSON.stringify(log.data, null, 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
              📚 使用说明
            </h4>
            <div className="text-blue-700 dark:text-blue-300 text-sm space-y-2">
              <p>• <strong>组件方式</strong>: 直接使用 &lt;LeoVideoPlayer /&gt; 组件，适合快速集成</p>
              <p>• <strong>Hook方式</strong>: 使用 useLeoVideo Hook，提供更灵活的控制能力</p>
              <p>• <strong>事件监听</strong>: 支持完整的视频事件监听，包括自定义事件</p>
              <p>• <strong>TypeScript</strong>: 完整的类型支持，提供优秀的开发体验</p>
              <p>• <strong>HLS支持</strong>: 内置HLS流媒体支持，自动检测和降级</p>
            </div>
          </div>
        </main>

        <footer className="text-center py-8">
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 
                           text-white font-medium rounded-lg transition-colors duration-200"
              >
                🧩 useState 版本
              </a>
              <a 
                href="/reducer"
                className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 
                           text-white font-medium rounded-lg transition-colors duration-200"
              >
                🔄 useReducer 版本
              </a>
              <a 
                href="/video"
                className="inline-flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 
                           text-white font-medium rounded-lg transition-colors duration-200"
              >
                🎥 视频模块演示
              </a>
              <a 
                href="/package-demo"
                className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 
                           text-white font-medium rounded-lg transition-colors duration-200"
              >
                📦 Package 演示 (当前)
              </a>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              探索不同的状态管理方式和视频播放器技术
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PackageDemoPage;
