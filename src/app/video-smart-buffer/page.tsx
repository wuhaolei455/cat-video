"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useSmartBuffer, BufferIndicator, type BufferStrategy } from '@/components/VideoSmartBuffer';

export default function VideoSmartBufferPage() {
  const [selectedStrategy, setSelectedStrategy] = useState<BufferStrategy>('traditional');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  // 视频引用
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // 使用智能缓冲 Hook
  const { bufferState, metrics } = useSmartBuffer(videoRef, selectedStrategy);

  // 测试视频源
  const videoSources = [
    {
      name: "Big Buck Bunny (MP4)",
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
    },
    {
      name: "Elephant Dream (MP4)",
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg"
    }
  ];

  const [selectedVideo, setSelectedVideo] = useState(0);

  // 策略配置
  const strategies: { key: BufferStrategy; name: string; description: string; icon: string; color: string }[] = [
    {
      key: 'traditional',
      name: '传统缓冲',
      description: '固定缓冲时间，不考虑用户行为和网络状况',
      icon: '🐌',
      color: 'border-red-200 bg-red-50'
    },
    {
      key: 'smart',
      name: '智能缓冲',
      description: '基于网络状况和用户行为的自适应缓冲策略',
      icon: '🧠',
      color: 'border-green-200 bg-green-50'
    },
    {
      key: 'aggressive',
      name: '激进缓冲',
      description: '最大化预缓冲，预测用户行为模式',
      icon: '🚀',
      color: 'border-blue-200 bg-blue-50'
    }
  ];

  // 视频事件处理
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setVolume(video.volume);
    const handleRateChange = () => setPlaybackRate(video.playbackRate);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ratechange', handleRateChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ratechange', handleRateChange);
    };
  }, []);

  // 播放控制
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">📹 视频智能缓冲对比系统</h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          体验不同缓冲策略的性能差异，了解智能缓冲如何根据网络状况和用户行为优化视频播放体验
        </p>
      </div>

      {/* 策略选择 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🎯 选择缓冲策略</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <div
              key={strategy.key}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedStrategy === strategy.key
                  ? strategy.color + ' border-current'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setSelectedStrategy(strategy.key)}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{strategy.icon}</span>
                <h3 className="font-semibold text-lg">{strategy.name}</h3>
                {selectedStrategy === strategy.key && (
                  <span className="text-green-500 text-xl">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-600">{strategy.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 视频选择 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🎬 选择测试视频</h2>
        <div className="flex gap-4">
          {videoSources.map((video, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedVideo === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedVideo(index)}
            >
              {video.name}
            </button>
          ))}
        </div>
      </div>

      {/* 主要视频播放区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* 视频播放器 */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto"
              poster={videoSources[selectedVideo].poster}
              src={videoSources[selectedVideo].src}
              preload="metadata"
            />
          </div>
          
          {/* 播放控制 */}
          <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handlePlayPause}
                className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <label>音量:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-20"
                />
                <span>{Math.round(volume * 100)}%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <label>速度:</label>
                <select
                  value={playbackRate}
                  onChange={(e) => handleRateChange(Number(e.target.value))}
                  className="px-2 py-1 border rounded"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* 缓冲状态显示 */}
        <div className="space-y-4">
          <BufferIndicator 
            bufferState={bufferState}
            metrics={metrics}
            strategy={selectedStrategy}
          />
          
          {/* 实时统计 */}
          {bufferState && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold mb-3">📊 实时统计</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">视频质量:</span>
                  <span className="font-medium">{bufferState.quality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">网络状况:</span>
                  <span className={`font-medium ${
                    bufferState.networkSpeed > 10 ? 'text-green-600' :
                    bufferState.networkSpeed > 3 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {bufferState.networkSpeed > 10 ? '快速' :
                     bufferState.networkSpeed > 3 ? '中等' : '慢速'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">缓冲健康度:</span>
                  <span className={`font-medium ${
                    bufferState.efficiency > 80 ? 'text-green-600' :
                    bufferState.efficiency > 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {bufferState.efficiency.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 策略对比说明 */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-6">🔍 缓冲策略详细对比</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
              🐌 传统缓冲策略
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 固定5秒缓冲时间</li>
              <li>• 不考虑网络状况变化</li>
              <li>• 忽略用户行为模式</li>
              <li>• 可能造成不必要的带宽浪费</li>
              <li>• 在网络不稳定时容易卡顿</li>
            </ul>
            <div className="mt-4 p-3 bg-red-50 rounded text-sm">
              <strong>适用场景:</strong> 网络稳定的环境，对带宽不敏感的场景
            </div>
          </div>

          <div className="border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
              🧠 智能缓冲策略
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 根据网络状况动态调整(3-15秒)</li>
              <li>• 分析用户跳跃和暂停模式</li>
              <li>• 网络慢时增加缓冲，快时减少</li>
              <li>• 用户经常跳过时减少预缓冲</li>
              <li>• 平衡性能与带宽使用</li>
            </ul>
            <div className="mt-4 p-3 bg-green-50 rounded text-sm">
              <strong>适用场景:</strong> 大多数实际使用场景，推荐的默认策略
            </div>
          </div>

          <div className="border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
              🚀 激进缓冲策略
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 最大化预缓冲(最高60秒)</li>
              <li>• 预测用户下一个跳跃点</li>
              <li>• 利用暂停时机智能预加载</li>
              <li>• 适合长视频和教育内容</li>
              <li>• 高带宽消耗但最佳用户体验</li>
            </ul>
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
              <strong>适用场景:</strong> 高质量网络环境，长视频内容，教育平台
            </div>
          </div>
        </div>
      </div>

      {/* 测试建议 */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">💡 测试建议</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">🧪 如何体验差异</h3>
            <ul className="text-sm space-y-1">
              <li>1. 切换不同的缓冲策略观察缓冲行为</li>
              <li>2. 尝试频繁跳跃播放位置</li>
              <li>3. 暂停视频观察预缓冲行为</li>
              <li>4. 改变播放速度测试自适应能力</li>
              <li>5. 在不同网络环境下测试</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📈 关注指标</h3>
            <ul className="text-sm space-y-1">
              <li>• <strong>缓冲健康度:</strong> 越高越好(>80%优秀)</li>
              <li>• <strong>目标缓冲时间:</strong> 策略自适应调整</li>
              <li>• <strong>网络效率:</strong> 带宽利用情况</li>
              <li>• <strong>用户体验:</strong> 卡顿次数和流畅度</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 返回导航 */}
      <div className="mt-12 text-center">
        <div className="inline-flex flex-col sm:flex-row gap-4">
          <a
            href="/video"
            className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 
                       text-white font-medium rounded-lg transition-colors duration-200"
          >
            🎥 返回视频模块
          </a>
          <a
            href="/lazy-img-frame"
            className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 
                       text-white font-medium rounded-lg transition-colors duration-200"
          >
            🖼️ 查看图片分帧加载
          </a>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 
                       text-white font-medium rounded-lg transition-colors duration-200"
          >
            🏠 返回首页
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-500">探索更多性能优化技术</p>
      </div>
    </div>
  );
}
