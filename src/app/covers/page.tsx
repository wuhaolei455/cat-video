'use client';

import React, { useRef, useState, useCallback } from 'react';
import { 
  LeoVideoPlayerWithCovers,
  CoverPresetFactory,
  createCoverPresetFactory,
  PresetConfigFactory 
} from '../../../packages/leo-video/src';
import type {
  LeoVideoPlayerWithCoversRef,
  CoverEventType,
  CoverEventData,
  CoverConfig,
  VideoConfig
} from '../../../packages/leo-video/src';

interface CoverDemoConfig {
  title: string;
  description: string;
  videoConfig: VideoConfig;
  coverOptions: {
    enableCommonCovers?: boolean;
    enableBusinessCovers?: boolean;
    customCovers?: CoverConfig[];
  };
}

const CoverDemo: React.FC = () => {
  const playerRef = useRef<LeoVideoPlayerWithCoversRef>(null);
  const [selectedDemo, setSelectedDemo] = useState<number>(0);
  const [eventLogs, setEventLogs] = useState<{ type: string; data: any; timestamp: number }[]>([]);
  const [showEventLog, setShowEventLog] = useState(false);

  // 创建Cover工厂
  const factory = createCoverPresetFactory();

  // Demo配置
  const demoConfigs: CoverDemoConfig[] = [
    {
      title: '基础Cover演示',
      description: '展示基本的播放控制Cover：播放按钮、进度条、音量控制、全屏按钮等',
      videoConfig: PresetConfigFactory.mp4('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
        .poster('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg')
        .build(),
      coverOptions: {
        enableCommonCovers: true,
        enableBusinessCovers: false
      }
    },
    {
      title: '业务Cover演示',
      description: '展示业务相关Cover：水印、品牌标识、分享按钮、点赞按钮等',
      videoConfig: PresetConfigFactory.mp4('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4')
        .build(),
      coverOptions: {
        enableCommonCovers: true,
        enableBusinessCovers: true,
        customCovers: [
          // 自定义水印
          factory.createWatermark({
            businessData: {
              imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjAiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+TGVvVmlkZW88L3RleHQ+Cjwvc3ZnPgo=',
              position: 'bottom-right'
            },
            position: {
              bottom: '20px',
              right: '20px',
              width: '100px',
              height: '40px'
            }
          })
        ]
      }
    },
    {
      title: '互动Cover演示',
      description: '展示互动功能Cover：弹幕、评论浮层、礼物动画等',
      videoConfig: PresetConfigFactory.mp4('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4')
        .build(),
      coverOptions: {
        enableCommonCovers: true,
        enableBusinessCovers: false,
        customCovers: [
          // 弹幕系统
          factory.createDanmu({
            businessData: {
              maxDanmuCount: 50,
              speed: 'normal',
              opacity: 0.8,
              fontSize: '16px',
              tracks: 4
            }
          }),
          // 礼物动画
          factory.createGiftAnimation({
            businessData: {
              queueSize: 3,
              animationDuration: 2000,
              effects: ['fireworks', 'hearts']
            }
          }),
          // 自定义互动按钮
          factory.createCustomCover('interaction-panel', 'custom', {
            name: '互动面板',
            layer: 'control',
            position: {
              top: '20px',
              right: '80px',
              width: '200px',
              height: '60px'
            },
            visibility: 'always',
            interactive: true,
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '10px'
            }
          })
        ]
      }
    },
    {
      title: '自定义Cover演示',
      description: '展示完全自定义的Cover，包括复杂的业务逻辑和样式',
      videoConfig: PresetConfigFactory.mp4('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4')
        .build(),
      coverOptions: {
        enableCommonCovers: true,
        enableBusinessCovers: false,
        customCovers: [
          // 自定义控制台
          factory.createCustomCover('custom-control-panel', 'custom', {
            name: '自定义控制台',
            layer: 'overlay',
            position: {
              bottom: '0',
              left: '0',
              right: '0',
              height: '100px'
            },
            visibility: 'hover',
            interactive: true,
            style: {
              background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              color: 'white'
            }
          }),
          // 统计信息面板
          factory.createCustomCover('stats-panel', 'custom', {
            name: '统计信息',
            layer: 'overlay',
            position: {
              top: '20px',
              left: '20px',
              width: '200px',
              height: 'auto'
            },
            visibility: 'always',
            interactive: false,
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '6px',
              padding: '15px',
              color: 'white',
              fontSize: '14px',
              fontFamily: 'monospace'
            }
          })
        ]
      }
    }
  ];

  // 处理Cover事件
  const handleCoverEvent = useCallback((type: CoverEventType, data: CoverEventData) => {
    const logEntry = {
      type: `Cover: ${type}`,
      data: {
        coverId: data.coverId,
        coverType: data.coverType,
        payload: data.payload
      },
      timestamp: Date.now()
    };
    
    setEventLogs(prev => [logEntry, ...prev.slice(0, 49)]);

    // 处理特定事件
    switch (type) {
      case 'cover:click':
        if (data.coverType === 'like-button') {
          console.log('点赞！');
          // 这里可以调用点赞API
        } else if (data.coverType === 'share-button') {
          console.log('分享视频');
          // 这里可以打开分享面板
        }
        break;
      
      case 'cover:hover':
        if (data.coverType === 'brand-logo') {
          console.log('悬停在品牌标识上');
        }
        break;
    }
  }, []);

  // 切换演示
  const handleDemoChange = (index: number) => {
    setSelectedDemo(index);
    setEventLogs([]);
  };

  // 控制Cover显示/隐藏
  const toggleCover = (coverId: string) => {
    const cover = playerRef.current?.getCover(coverId);
    if (cover) {
      if (cover.state.visible) {
        playerRef.current?.hideCover(coverId);
      } else {
        playerRef.current?.showCover(coverId);
      }
    }
  };

  // 添加动态Cover
  const addDynamicCover = () => {
    if (!playerRef.current) return;

    const dynamicCover = factory.createCustomCover(
      `dynamic-${Date.now()}`,
      'custom',
      {
        name: '动态添加的Cover',
        layer: 'overlay',
        position: {
          top: `${Math.random() * 50 + 10}%`,
          left: `${Math.random() * 50 + 10}%`,
          width: '150px',
          height: '50px'
        },
        visibility: 'always',
        interactive: true,
        style: {
          backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        },
        animation: {
          enter: { type: 'bounce', duration: 600 },
          exit: { type: 'scale', duration: 300 },
          hover: { type: 'scale', duration: 200 }
        }
      }
    );

    playerRef.current.addCover(dynamicCover);
  };

  const currentDemo = demoConfigs[selectedDemo];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">视频蒙层Cover系统演示</h1>
          <p className="text-lg text-gray-600 mb-6">
            展示视频播放器的蒙层架构设计，包括通用Cover、业务Cover和自定义Cover的管理
          </p>
          
          {/* Demo选择器 */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {demoConfigs.map((demo, index) => (
              <button
                key={index}
                onClick={() => handleDemoChange(index)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedDemo === index
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow'
                }`}
              >
                {demo.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 视频播放器区域 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* 当前演示信息 */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <h2 className="text-2xl font-bold mb-2">{currentDemo.title}</h2>
                <p className="text-blue-100">{currentDemo.description}</p>
              </div>
              
              {/* 视频播放器 */}
              <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                <LeoVideoPlayerWithCovers
                  ref={playerRef}
                  config={currentDemo.videoConfig}
                  coverOptions={currentDemo.coverOptions}
                  onCoverEvent={handleCoverEvent}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              
              {/* 控制面板 */}
              <div className="p-6 bg-gray-50">
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={addDynamicCover}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    添加动态Cover
                  </button>
                  
                  <button
                    onClick={() => toggleCover('watermark')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    切换水印
                  </button>
                  
                  <button
                    onClick={() => toggleCover('brand-logo')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    切换品牌标识
                  </button>
                  
                  <button
                    onClick={() => setShowEventLog(!showEventLog)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {showEventLog ? '隐藏' : '显示'}事件日志
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>操作提示：</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>鼠标悬停显示控制Cover</li>
                    <li>点击播放按钮开始播放</li>
                    <li>点击点赞按钮查看互动效果</li>
                    <li>尝试全屏播放查看Cover适配</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            {/* Cover架构说明 */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">架构设计特点</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="border-l-4 border-blue-500 pl-3">
                  <strong className="text-blue-700">统一管理</strong>
                  <p>通用Cover使用集中式状态管理</p>
                </div>
                <div className="border-l-4 border-green-500 pl-3">
                  <strong className="text-green-700">分离管理</strong>
                  <p>业务Cover使用独立状态管理</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-3">
                  <strong className="text-purple-700">事件通信</strong>
                  <p>基于EventEmitter的事件系统</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-3">
                  <strong className="text-orange-700">层级管理</strong>
                  <p>6层z-index层级控制</p>
                </div>
              </div>
            </div>

            {/* 事件日志 */}
            {showEventLog && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                  <h3 className="font-semibold">Cover事件日志</h3>
                  <button
                    onClick={() => setEventLogs([])}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    清空
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {eventLogs.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">暂无事件</div>
                  ) : (
                    <div className="divide-y">
                      {eventLogs.map((log, index) => (
                        <div key={index} className="p-3 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium text-blue-600">
                              {log.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-gray-600 bg-gray-100 p-2 rounded">
                            {JSON.stringify(log.data, null, 2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 技术说明 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">技术架构说明</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-blue-600">状态管理</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 通用Cover：集中式管理</li>
                <li>• 业务Cover：分离式管理</li>
                <li>• 状态持久化支持</li>
                <li>• 响应式状态更新</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-green-600">事件通信</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 基于EventEmitter</li>
                <li>• Cover事件冒泡机制</li>
                <li>• 视频事件转发</li>
                <li>• 错误事件处理</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-purple-600">Cover管理</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 工厂模式创建</li>
                <li>• 层级z-index管理</li>
                <li>• 生命周期控制</li>
                <li>• 动态添加/移除</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">设计原则</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <strong className="text-blue-600">可扩展性：</strong>
                支持自定义Cover类型，易于添加新的业务功能
              </div>
              <div>
                <strong className="text-green-600">可维护性：</strong>
                清晰的模块划分，统一的事件通信机制
              </div>
              <div>
                <strong className="text-purple-600">性能优化：</strong>
                按需渲染，状态局部更新，事件防抖处理
              </div>
              <div>
                <strong className="text-orange-600">用户体验：</strong>
                流畅的动画效果，响应式布局，无障碍访问
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverDemo;
