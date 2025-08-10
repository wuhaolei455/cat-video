"use client";

import React from "react";
import VideoPlayerDemo from "../../components/VideoPlayerDemo";

export default function VideoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* 页面头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎥 视频播放器模块演示
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            基于TypeScript的事件驱动视频播放器，支持HTML5 Video API、HLS流媒体、
            泛型约束、联合类型等现代前端技术特性
          </p>
        </div>

        {/* 技术特性卡片 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              事件驱动
            </h3>
            <p className="text-gray-600 text-sm">
              完整的事件系统，支持中间件和事件委托
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="text-2xl mb-3">🎬</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              HTML5 Video
            </h3>
            <p className="text-gray-600 text-sm">
              原生HTML5视频API封装，支持全屏、画中画
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="text-2xl mb-3">📡</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              HLS流媒体
            </h3>
            <p className="text-gray-600 text-sm">
              自适应比特率流，支持直播和点播
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="text-2xl mb-3">🔧</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              TypeScript
            </h3>
            <p className="text-gray-600 text-sm">
              泛型约束、联合类型、条件类型等高级特性
            </p>
          </div>
        </div>

        {/* 主要演示组件 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <VideoPlayerDemo />
        </div>

        {/* 技术说明 */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🏗️ 架构特点
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>
                  <strong>事件驱动架构:</strong> 基于发布-订阅模式的事件系统
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>
                  <strong>工厂模式:</strong> 智能播放器创建和类型推断
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>
                  <strong>策略模式:</strong> 不同格式的播放策略
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>
                  <strong>适配器模式:</strong> 统一的播放器接口
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎯 TypeScript特性
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>
                  <strong>泛型约束:</strong> 确保配置类型安全
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>
                  <strong>联合类型:</strong> 视频状态和质量级别定义
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>
                  <strong>条件类型:</strong> 根据配置推断播放器类型
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>
                  <strong>映射类型:</strong> 事件类型到数据的映射
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 代码示例 */}
        <div className="mt-12 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-800 text-white px-6 py-4">
            <h2 className="text-xl font-bold">💻 使用示例</h2>
          </div>
          <div className="p-6">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`// 1. 创建基础MP4播放器
const mp4Player = createSmartVideoPlayer(videoElement, 
  PresetConfigFactory.mp4('video.mp4').build()
);

// 2. 创建HLS流播放器
const hlsPlayer = createHLSVideoPlayer(videoElement, {
  sources: [{ src: 'stream.m3u8', type: 'hls' }],
  hls: {
    enableWorker: true,
    lowLatencyMode: true,
    debug: false
  }
});

// 3. 事件监听
player.onVideoEvent('playing', (event) => {
  console.log('视频开始播放', event.currentTime);
});

player.onVideoEvent('qualitychange', (event) => {
  console.log('质量切换:', event.payload.from, '->', event.payload.to);
});

// 4. 播放器控制
await player.play();
player.setQuality('1080p');
player.setPlaybackRate(1.5);`}</code>
            </pre>
          </div>
        </div>

        {/* 导航链接 */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 
                         text-white font-medium rounded-lg transition-colors duration-200"
            >
              🧩 useState 版本
            </a>
            <a
              href="/reducer"
              className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 
                         text-white font-medium rounded-lg transition-colors duration-200"
            >
              🔄 useReducer 版本
            </a>
            <a
              href="/video"
              className="inline-flex items-center px-6 py-3 bg-purple-500 hover:bg-purple-600 
                         text-white font-medium rounded-lg transition-colors duration-200"
            >
              🎥 视频模块演示 (当前)
            </a>
            <a
              href="/package-demo"
              className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 
                         text-white font-medium rounded-lg transition-colors duration-200"
            >
              📦 Package 演示
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">查看其他状态管理模式和视频播放器技术演示</p>
        </div>
      </div>
    </div>
  );
}
