// Leo视频播放器演示页面
'use client';

import React, { useState } from 'react';
import { LeoVideoPlayer, LeoVideoPlayerConfig } from '../../video/player/LeoVideoPlayer';
import { VideoInfo } from '../../video/overlay/VideoOverlayState';
import { PlayerState } from '../../video/player/VideoPlayerController';

// 演示配置
const demoConfigs: Array<{
  title: string;
  description: string;
  config: LeoVideoPlayerConfig;
  videoInfo: VideoInfo;
  features: string[];
}> = [
  {
    title: '基础视频播放器',
    description: '支持基本播放控制、进度条、音量调节',
    config: {
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      autoplay: false,
      muted: false,
      controls: false, // 使用自定义控制器
      preload: 'metadata',
      enableFeedback: true,
      enableShare: true,
      enableFullscreen: true
    },
    videoInfo: {
      id: 'demo-1',
      name: 'Big Buck Bunny',
      duration: 596,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      vipMark: false,
      free: true
    },
    features: ['自定义控制器', '手势操作', '进度控制', '音量调节', '全屏支持']
  },
  {
    title: 'VIP专享视频播放器',
    description: '展示VIP试看功能和蒙层效果',
    config: {
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
      autoplay: false,
      muted: false,
      controls: false,
      preload: 'metadata',
      enableVip: true,
      vipMark: true,
      free: false,
      enableFeedback: true,
      enableShare: true
    },
    videoInfo: {
      id: 'demo-2',
      name: 'Elephants Dream - VIP专享',
      duration: 653,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
      vipMark: true,
      free: false
    },
    features: ['VIP试看', '蒙层效果', '权限控制', '试看结束提示', 'VIP开通引导']
  },
  {
    title: 'HLS流媒体播放器',
    description: '支持HLS自适应流媒体播放',
    config: {
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      autoplay: false,
      muted: false,
      controls: false,
      preload: 'metadata',
      enableFeedback: true,
      enableShare: true
    },
    videoInfo: {
      id: 'demo-3',
      name: 'HLS Test Stream',
      duration: 0,
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      vipMark: false,
      free: true
    },
    features: ['HLS流媒体', '自适应比特率', '实时缓冲', '质量切换']
  }
];

const LeoVideoPage: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 处理播放器状态变化
  const handleStateChange = (state: PlayerState) => {
    setPlayerState(state);
    setError(null);
  };

  // 处理时间更新
  const handleTimeUpdate = (time: number, totalDuration: number) => {
    setCurrentTime(time);
    setDuration(totalDuration);
  };

  // 处理错误
  const handleError = (error: Error) => {
    setError(error.message);
    console.error('Video player error:', error);
  };

  // 处理VIP操作
  const handleVipAction = () => {
    alert('跳转到VIP开通页面');
  };

  // 处理分享
  const handleShare = () => {
    alert('分享功能');
  };

  // 处理反馈
  const handleFeedback = () => {
    alert('反馈功能');
  };

  // 格式化时间
  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentDemo = demoConfigs[selectedDemo];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Leo视频播放器</h1>
        <p className="text-lg text-gray-600 mb-8">
          基于HarmonyOS AVPlayerController设计的React视频播放器
        </p>
      </div>

      {/* 演示选择器 */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {demoConfigs.map((demo, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedDemo === index
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
            }`}
            onClick={() => setSelectedDemo(index)}
          >
            {demo.title}
          </button>
        ))}
      </div>

      {/* 当前演示信息 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{currentDemo.title}</h3>
        <p className="text-gray-600 mb-4">{currentDemo.description}</p>
        <div className="text-sm text-gray-700">
          <strong className="text-gray-800">特性:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {currentDemo.features.map((feature, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 视频播放器 */}
      <div className="space-y-4">
        <LeoVideoPlayer
          config={currentDemo.config}
          videoInfo={currentDemo.videoInfo}
          onStateChange={handleStateChange}
          onTimeUpdate={handleTimeUpdate}
          onError={handleError}
          onVipAction={handleVipAction}
          onShare={handleShare}
          onFeedback={handleFeedback}
          className="shadow-xl"
        />

        {/* 错误显示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 font-medium">播放错误: {error}</span>
            </div>
          </div>
        )}
      </div>

      {/* 播放器状态信息 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">播放器状态</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">播放状态</div>
            <div className={`font-semibold ${
              playerState === PlayerState.PLAYING ? 'text-green-600' :
              playerState === PlayerState.PAUSED ? 'text-yellow-600' :
              playerState === PlayerState.ERROR ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {playerState || '未知'}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">当前时间</div>
            <div className="font-mono">{formatTime(currentTime)}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">总时长</div>
            <div className="font-mono">{formatTime(duration)}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">视频信息</div>
            <div className="font-semibold">{currentDemo.videoInfo.name}</div>
          </div>
        </div>
      </div>

      {/* 功能说明 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">功能说明</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">手势操作</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 单击：显示/隐藏控制器</li>
              <li>• 双击：播放/暂停</li>
              <li>• 左右区域：快退/快进10秒</li>
              <li>• 进度条：拖拽跳转</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">蒙层系统</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 加载蒙层：视频加载时显示</li>
              <li>• 错误蒙层：播放错误时显示</li>
              <li>• VIP蒙层：试看结束提示</li>
              <li>• 反馈蒙层：用户反馈界面</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeoVideoPage;