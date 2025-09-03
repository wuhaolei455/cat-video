"use client";
import React from "react";
import { ImageMetrics, LoadingStrategy } from "./ImagePerformanceMonitor";
import { WaterfallGrid } from "./WaterfallGrid";

interface ImageGridProps {
  strategy: LoadingStrategy;
  imageMetrics: ImageMetrics[];
  imageCount?: number;
  layoutMode?: 'grid' | 'waterfall';
}

export function ImageGrid({ strategy, imageMetrics, imageCount = 100, layoutMode = 'waterfall' }: ImageGridProps) {
  // 生成测试图片数组
  const imgs = Array.from({ length: imageCount }, (_, index) => ({
    id: index,
    src: `https://picsum.photos/400/300?random=${index}`,
    alt: `随机图片 ${index + 1}`,
  }));

  const getStrategyTitle = () => {
    switch (strategy) {
      case 'no-lazy': return '无懒加载图片展示区域';
      case 'basic-lazy': return '基础懒加载图片展示区域';
      case 'traditional-lazy': return '传统懒加载图片展示区域';
      case 'frame-based': return '分帧加载图片展示区域';
      default: return '图片展示区域';
    }
  };

  const getStrategyDescription = () => {
    switch (strategy) {
      case 'no-lazy': return '所有图片立即开始加载';
      case 'basic-lazy': return '图片进入视口时开始加载';
      case 'traditional-lazy': return '提前200px开始加载';
      case 'frame-based': return '智能分帧优化加载';
      default: return '图片加载测试';
    }
  };

  const getLoadingProps = (img: any) => {
    const baseProps = {
      src: img.src,
      alt: img.alt,
      'data-image-id': img.id,
      className: "w-full h-64 object-cover transition-opacity duration-300",
      style: {
        opacity: imageMetrics.find(m => m.id === img.id)?.loaded ? 1 : 0.8
      }
    };

    // 根据策略设置不同的加载属性
    switch (strategy) {
      case 'no-lazy':
        return { ...baseProps }; // 不设置 loading="lazy"
      case 'basic-lazy':
      case 'traditional-lazy':
        return { ...baseProps, loading: 'lazy' as const };
      case 'frame-based':
        return { ...baseProps, loading: 'lazy' as const }; // 分帧加载会通过 JS 控制
      default:
        return { ...baseProps };
    }
  };

  // 如果是瀑布流模式，使用 WaterfallGrid 组件
  if (layoutMode === 'waterfall') {
    return (
      <WaterfallGrid
        strategy={strategy}
        imageMetrics={imageMetrics}
        imageCount={imageCount}
      />
    );
  }

  // 否则使用原始的网格布局
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold">{getStrategyTitle()}</h3>
        <div className="text-sm text-gray-600">
          {getStrategyDescription()} | 共 {imgs.length} 张图片
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {imgs.map((img) => (
          <div key={img.id} className="relative bg-gray-100 rounded-lg overflow-hidden">
            {/* 加载状态指示器 */}
            <div className="absolute top-2 left-2 z-10">
              {imageMetrics.find(m => m.id === img.id)?.loaded ? (
                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                  ✓ {imageMetrics.find(m => m.id === img.id)?.loadTime.toFixed(0)}ms
                </div>
              ) : imageMetrics.find(m => m.id === img.id)?.error ? (
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">✗ 错误</div>
              ) : (
                <div className={`text-white text-xs px-2 py-1 rounded ${
                  strategy === 'no-lazy' ? 'bg-orange-500' :
                  strategy === 'basic-lazy' ? 'bg-yellow-500' :
                  strategy === 'traditional-lazy' ? 'bg-red-500' :
                  'bg-green-500'
                }`}>
                  ⏳ {strategy === 'no-lazy' ? '立即加载中' : 
                      strategy === 'basic-lazy' ? '等待进入视口' :
                      strategy === 'traditional-lazy' ? '预加载中' :
                      '分帧加载中'}
                </div>
              )}
            </div>
            
            {/* 视口状态指示器 */}
            <div className="absolute top-2 right-2 z-10">
              {imageMetrics.find(m => m.id === img.id)?.inViewport && (
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">👁️ 可见</div>
              )}
            </div>

            {/* 加载顺序指示器 */}
            {imageMetrics.find(m => m.id === img.id)?.loaded && (
              <div className="absolute bottom-2 left-2 z-10">
                <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded">
                  #{imageMetrics.find(m => m.id === img.id)?.loadOrder}
                </div>
              </div>
            )}

            {/* 图片 */}
            <img {...getLoadingProps(img)} />
            
            {/* 图片信息 */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
              <div className="text-sm">图片 #{img.id + 1}</div>
              {imageMetrics.find(m => m.id === img.id)?.loaded && (
                <div className="text-xs text-gray-300">
                  {imageMetrics.find(m => m.id === img.id)?.loadTime.toFixed(0)}ms
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
