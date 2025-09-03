"use client";
import React, { useEffect, useState, useRef } from "react";
import { ImageMetrics, LoadingStrategy } from "./ImagePerformanceMonitor";
import {
  createWaterfallLayout,
  generateTestImages,
  ImageItem,
  WaterfallLayoutResult,
} from "@/utils/waterfallLayout";

interface WaterfallGridProps {
  strategy: LoadingStrategy;
  imageMetrics: ImageMetrics[];
  imageCount?: number;
  columnWidth?: number;
  gap?: number;
}

export function WaterfallGrid({
  strategy,
  imageMetrics,
  imageCount = 100,
  columnWidth = 400,
  gap = 16,
}: WaterfallGridProps) {
  const [layout, setLayout] = useState<WaterfallLayoutResult | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [containerWidth, setContainerWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);

  // 生成图片数据
  useEffect(() => {
    const testImages = generateTestImages(imageCount);
    setImages(testImages);
  }, [imageCount]);

  // 监听容器宽度变化
  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  // 计算瀑布流布局
  useEffect(() => {
    if (images.length > 0) {
      const waterfallLayout = createWaterfallLayout(
        images,
        columnWidth,
        gap,
        2, // 最小列数
        Math.max(2, Math.floor(containerWidth / (columnWidth + gap))) // 最大列数
      );
      setLayout(waterfallLayout);
    }
  }, [images, containerWidth, columnWidth, gap]);

  const getStrategyTitle = () => {
    switch (strategy) {
      case "no-lazy":
        return "🌊 无懒加载瀑布流";
      case "basic-lazy":
        return "🌊 基础懒加载瀑布流";
      case "traditional-lazy":
        return "🌊 传统懒加载瀑布流";
      case "frame-based":
        return "🌊 分帧加载瀑布流";
      default:
        return "🌊 瀑布流图片展示";
    }
  };

  const getStrategyDescription = () => {
    switch (strategy) {
      case "no-lazy":
        return `瀑布流布局 - 所有 ${imageCount} 张图片立即开始加载`;
      case "basic-lazy":
        return `瀑布流布局 - ${imageCount} 张图片进入视口时开始加载`;
      case "traditional-lazy":
        return `瀑布流布局 - ${imageCount} 张图片提前200px开始加载`;
      case "frame-based":
        return `瀑布流布局 - ${imageCount} 张图片智能分帧优化加载`;
      default:
        return `瀑布流布局 - ${imageCount} 张图片加载测试`;
    }
  };

  const getLoadingProps = (img: ImageItem) => {
    const baseProps = {
      src: img.src,
      alt: img.alt,
      "data-image-id": img.id,
      className: "w-full object-cover transition-all duration-300 rounded-lg",
      style: {
        opacity: imageMetrics.find((m) => m.id === img.id)?.loaded ? 1 : 0.8,
        height: `${img.height}px`,
      },
    };

    // 根据策略设置不同的加载属性
    switch (strategy) {
      case "no-lazy":
        return { ...baseProps }; // 不设置 loading="lazy"
      case "basic-lazy":
      case "traditional-lazy":
        return { ...baseProps, loading: "lazy" as const };
      case "frame-based":
        return { ...baseProps, loading: "lazy" as const }; // 分帧加载会通过 JS 控制
      default:
        return { ...baseProps };
    }
  };

  const getStrategyColor = () => {
    switch (strategy) {
      case "no-lazy":
        return "orange";
      case "basic-lazy":
        return "yellow";
      case "traditional-lazy":
        return "red";
      case "frame-based":
        return "green";
      default:
        return "blue";
    }
  };

  if (!layout) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在计算瀑布流布局...</p>
      </div>
    );
  }

  const strategyColor = getStrategyColor();

  return (
    <div className="space-y-6">
      {/* 标题和描述 */}
      <div
        className={`bg-${strategyColor}-50 border border-${strategyColor}-200 p-6 rounded-xl`}
      >
        <h3 className={`text-2xl font-semibold text-${strategyColor}-800 mb-2`}>
          {getStrategyTitle()}
        </h3>
        <div className={`text-sm text-${strategyColor}-700 mb-4`}>
          {getStrategyDescription()}
        </div>
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-${strategyColor}-600`}
        >
          <div>
            <div className="font-semibold">总列数</div>
            <div>{layout.totalColumns}</div>
          </div>
          <div>
            <div className="font-semibold">列宽度</div>
            <div>{columnWidth}px</div>
          </div>
          <div>
            <div className="font-semibold">图片间隙</div>
            <div>{gap}px</div>
          </div>
          <div>
            <div className="font-semibold">图片总数</div>
            <div>{imageCount}</div>
          </div>
        </div>
      </div>

      {/* 瀑布流网格 */}
      <div
        ref={containerRef}
        className="flex gap-4 justify-center"
        style={{ gap: `${gap}px` }}
      >
        {layout.columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex flex-col"
            style={{
              width: `${columnWidth}px`,
              gap: `${gap}px`,
            }}
          >
            {column.items.map((img) => {
              const metric = imageMetrics.find((m) => m.id === img.id);
              return (
                <div
                  key={img.id}
                  className="relative bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  {/* 加载状态指示器 */}
                  <div className="absolute top-2 left-2 z-10">
                    {metric?.loaded ? (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded shadow">
                        ✓ {metric.loadTime.toFixed(0)}ms
                      </div>
                    ) : metric?.error ? (
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow">
                        ✗ 错误
                      </div>
                    ) : (
                      <div
                        className={`text-white text-xs px-2 py-1 rounded shadow bg-${strategyColor}-500`}
                      >
                        ⏳{" "}
                        {strategy === "no-lazy"
                          ? "立即加载中"
                          : strategy === "basic-lazy"
                          ? "等待视口"
                          : strategy === "traditional-lazy"
                          ? "预加载中"
                          : "分帧加载中"}
                      </div>
                    )}
                  </div>

                  {/* 视口状态指示器 */}
                  <div className="absolute top-2 right-2 z-10">
                    {metric?.inViewport ? (
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow">
                        👁️ 视口内
                      </div>
                    ) : (
                      <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded shadow">
                        👁️ 视口外
                      </div>
                    )}
                  </div>

                  {/* 图片序号 */}
                  <div className="absolute bottom-2 left-2 z-10">
                    <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      #{img.id + 1}
                    </div>
                  </div>

                  {/* 加载顺序 */}
                  {metric?.loaded && metric.loadOrder > 0 && (
                    <div className="absolute bottom-2 right-2 z-10">
                      <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded shadow">
                        第{metric.loadOrder}个
                      </div>
                    </div>
                  )}

                  {/* 图片 */}
                  <img {...getLoadingProps(img)} />

                  {/* 图片尺寸信息 - 悬停时显示 */}
                  <div className="absolute inset-0 hover:bg-black hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center pointer-events-none hover:pointer-events-auto">
                    <div className="text-white text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 px-3 py-1 rounded">
                      {img.width} × {Math.round(img.height)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 布局统计信息 */}
      <div
        className={`bg-${strategyColor}-50 border border-${strategyColor}-200 p-4 rounded-lg`}
      >
        <h4 className={`font-semibold text-${strategyColor}-800 mb-3`}>
          📊 瀑布流布局统计
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {layout.columns.map((column, index) => (
            <div
              key={index}
              className={`text-center p-3 bg-white rounded border text-${strategyColor}-600`}
            >
              <div className="font-semibold">第 {index + 1} 列</div>
              <div>{column.items.length} 张图片</div>
              <div>{Math.round(column.totalHeight)}px 高</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
