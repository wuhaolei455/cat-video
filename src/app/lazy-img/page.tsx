"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";

interface ImageMetrics {
  id: number;
  src: string;
  loadTime: number;
  loaded: boolean;
  error: boolean;
  startTime: number;
  endTime?: number;
  inViewport: boolean;
  loadOrder: number;
}

interface PerformanceStats {
  totalImages: number;
  loadedImages: number;
  errorImages: number;
  averageLoadTime: number;
  totalLoadTime: number;
  imagesInViewport: number;
  loadingProgress: number;
  networkRequests: number;
  cacheHits: number;
}

export default function LazyImgTestPage() {
  const [imageMetrics, setImageMetrics] = useState<ImageMetrics[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    totalImages: 0,
    loadedImages: 0,
    errorImages: 0,
    averageLoadTime: 0,
    totalLoadTime: 0,
    imagesInViewport: 0,
    loadingProgress: 0,
    networkRequests: 0,
    cacheHits: 0,
  });
  const [loadingTimeline, setLoadingTimeline] = useState<Array<{time: number, count: number}>>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadOrderRef = useRef(0);
  const startTimeRef = useRef(performance.now());

  // 生成测试图片数组 - 使用不同的图片来更好地测试懒加载
  const imgs = Array.from({ length: 50 }, (_, index) => ({
    id: index,
    // 使用不同尺寸的随机图片来模拟真实场景
    src: `https://picsum.photos/400/300?random=${index}`,
    alt: `随机图片 ${index + 1}`,
  }));

  // 更新性能统计
  const updatePerformanceStats = useCallback((metrics: ImageMetrics[]) => {
    const loaded = metrics.filter(m => m.loaded);
    const errors = metrics.filter(m => m.error);
    const inViewport = metrics.filter(m => m.inViewport);
    const totalLoadTime = loaded.reduce((sum, m) => sum + m.loadTime, 0);
    
    setPerformanceStats({
      totalImages: metrics.length,
      loadedImages: loaded.length,
      errorImages: errors.length,
      averageLoadTime: loaded.length > 0 ? totalLoadTime / loaded.length : 0,
      totalLoadTime,
      imagesInViewport: inViewport.length,
      loadingProgress: (loaded.length / metrics.length) * 100,
      networkRequests: loaded.length + errors.length,
      cacheHits: 0, // 简化处理，实际项目中可以通过 Resource Timing API 检测
    });
  }, []);

  // 更新加载时间线
  const updateTimeline = useCallback(() => {
    const now = performance.now() - startTimeRef.current;
    setLoadingTimeline(prev => {
      const newTimeline = [...prev];
      const lastEntry = newTimeline[newTimeline.length - 1];
      
      if (!lastEntry || now - lastEntry.time > 100) { // 每100ms记录一次
        newTimeline.push({ time: now, count: performanceStats.loadedImages });
      }
      
      return newTimeline.slice(-50); // 只保留最近50个数据点
    });
  }, [performanceStats.loadedImages]);

  // 图片加载监控
  const setupImageMonitoring = useCallback((img: HTMLImageElement, id: number) => {
    const startTime = performance.now();
    
    // 初始化图片指标
    const initialMetric: ImageMetrics = {
      id,
      src: img.src,
      loadTime: 0,
      loaded: false,
      error: false,
      startTime,
      inViewport: false,
      loadOrder: 0,
    };

    setImageMetrics(prev => {
      const updated = [...prev];
      const existingIndex = updated.findIndex(m => m.id === id);
      if (existingIndex >= 0) {
        updated[existingIndex] = { ...updated[existingIndex], ...initialMetric };
      } else {
        updated.push(initialMetric);
      }
      return updated;
    });

    // 监听加载完成
    img.onload = () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      loadOrderRef.current += 1;

      setImageMetrics(prev => {
        const updated = prev.map(m => 
          m.id === id 
            ? { ...m, loaded: true, loadTime, endTime, loadOrder: loadOrderRef.current }
            : m
        );
        updatePerformanceStats(updated);
        return updated;
      });
    };

    // 监听加载错误
    img.onerror = () => {
      setImageMetrics(prev => {
        const updated = prev.map(m => 
          m.id === id 
            ? { ...m, error: true, endTime: performance.now() }
            : m
        );
        updatePerformanceStats(updated);
        return updated;
      });
    };
  }, [updatePerformanceStats]);

  // 设置 Intersection Observer 来监控图片是否在视口中
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const img = entry.target as HTMLImageElement;
          const id = parseInt(img.dataset.imageId || "0");
          
          setImageMetrics(prev => 
            prev.map(m => 
              m.id === id 
                ? { ...m, inViewport: entry.isIntersecting }
                : m
            )
          );
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // 开始监控
  const startMonitoring = () => {
    setIsMonitoring(true);
    setImageMetrics([]);
    setLoadingTimeline([]);
    loadOrderRef.current = 0;
    startTimeRef.current = performance.now();
    
    // 重新设置所有图片的监控
    setTimeout(() => {
      const imgElements = document.querySelectorAll("img[data-image-id]");
      imgElements.forEach((img, index) => {
        const htmlImg = img as HTMLImageElement;
        const id = parseInt(htmlImg.dataset.imageId || "0");
        setupImageMonitoring(htmlImg, id);
        
        // 添加到 Intersection Observer
        if (observerRef.current) {
          observerRef.current.observe(htmlImg);
        }
      });
    }, 100);
  };

  // 定时更新时间线
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(updateTimeline, 200);
    return () => clearInterval(interval);
  }, [isMonitoring, updateTimeline]);

  // 获取加载时间分布数据
  const getLoadTimeDistribution = () => {
    const loadedMetrics = imageMetrics.filter(m => m.loaded);
    const buckets = [0, 100, 500, 1000, 2000, 5000];
    const distribution = buckets.map((bucket, index) => {
      const nextBucket = buckets[index + 1] || Infinity;
      const count = loadedMetrics.filter(m => 
        m.loadTime >= bucket && m.loadTime < nextBucket
      ).length;
      return {
        range: index === buckets.length - 1 ? `${bucket}ms+` : `${bucket}-${nextBucket}ms`,
        count,
        percentage: loadedMetrics.length > 0 ? (count / loadedMetrics.length * 100).toFixed(1) : '0'
      };
    });
    return distribution;
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center">图片懒加载性能监控系统</h1>
      
      {/* 控制面板 */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">性能监控控制台</h2>
          <button
            onClick={startMonitoring}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isMonitoring ? '重新开始监控' : '开始性能监控'}
          </button>
        </div>
        
        {/* 实时统计面板 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">总图片数</h3>
            <p className="text-2xl font-bold text-blue-600">{performanceStats.totalImages}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">已加载</h3>
            <p className="text-2xl font-bold text-green-600">{performanceStats.loadedImages}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">加载失败</h3>
            <p className="text-2xl font-bold text-red-600">{performanceStats.errorImages}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">视口内图片</h3>
            <p className="text-2xl font-bold text-purple-600">{performanceStats.imagesInViewport}</p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">加载进度</span>
            <span className="text-sm text-gray-600">{performanceStats.loadingProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${performanceStats.loadingProgress}%` }}
            ></div>
          </div>
        </div>

        {/* 性能指标 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">平均加载时间</h3>
            <p className="text-xl font-bold text-indigo-600">
              {performanceStats.averageLoadTime.toFixed(2)}ms
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">总加载时间</h3>
            <p className="text-xl font-bold text-orange-600">
              {(performanceStats.totalLoadTime / 1000).toFixed(2)}s
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-600">网络请求数</h3>
            <p className="text-xl font-bold text-cyan-600">{performanceStats.networkRequests}</p>
          </div>
        </div>
      </div>

      {/* 加载时间分布图表 */}
      {isMonitoring && imageMetrics.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">加载时间分布</h3>
          <div className="space-y-2">
            {getLoadTimeDistribution().map((bucket, index) => (
              <div key={index} className="flex items-center">
                <div className="w-24 text-sm text-gray-600">{bucket.range}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 mx-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full transition-all duration-500"
                    style={{ width: `${bucket.percentage}%` }}
                  ></div>
                </div>
                <div className="w-16 text-sm text-gray-700">
                  {bucket.count} ({bucket.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 实时加载时间线 */}
      {isMonitoring && loadingTimeline.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">实时加载时间线</h3>
          <div className="h-32 bg-gray-50 rounded-lg p-4 relative overflow-hidden">
            <svg className="w-full h-full">
              {loadingTimeline.map((point, index) => {
                if (index === 0) return null;
                const prevPoint = loadingTimeline[index - 1];
                const x1 = ((index - 1) / (loadingTimeline.length - 1)) * 100;
                const x2 = (index / (loadingTimeline.length - 1)) * 100;
                const maxCount = Math.max(...loadingTimeline.map(p => p.count));
                const y1 = 100 - (prevPoint.count / maxCount) * 80;
                const y2 = 100 - (point.count / maxCount) * 80;
                
                return (
                  <line
                    key={index}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                );
              })}
              {loadingTimeline.map((point, index) => {
                const x = (index / (loadingTimeline.length - 1)) * 100;
                const maxCount = Math.max(...loadingTimeline.map(p => p.count));
                const y = 100 - (point.count / maxCount) * 80;
                
                return (
                  <circle
                    key={index}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="3"
                    fill="#3b82f6"
                  />
                );
              })}
            </svg>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            X轴: 时间 | Y轴: 累计加载完成的图片数量
          </div>
        </div>
      )}

      {/* 详细图片列表 */}
      {isMonitoring && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">图片加载详情</h3>
          <div className="max-h-64 overflow-y-auto">
            <div className="grid grid-cols-6 gap-2 text-sm font-medium text-gray-600 border-b pb-2 mb-2">
              <div>ID</div>
              <div>状态</div>
              <div>加载时间</div>
              <div>加载顺序</div>
              <div>视口状态</div>
              <div>操作</div>
            </div>
            {imageMetrics
              .sort((a, b) => b.id - a.id) // 按ID倒序显示最新的
              .slice(0, 20) // 只显示前20个
              .map((metric) => (
              <div key={metric.id} className="grid grid-cols-6 gap-2 text-sm py-2 border-b border-gray-100">
                <div>#{metric.id + 1}</div>
                <div>
                  {metric.loaded ? (
                    <span className="text-green-600 font-medium">✓ 已加载</span>
                  ) : metric.error ? (
                    <span className="text-red-600 font-medium">✗ 失败</span>
                  ) : (
                    <span className="text-yellow-600 font-medium">⏳ 加载中</span>
                  )}
                </div>
                <div>{metric.loaded ? `${metric.loadTime.toFixed(0)}ms` : '-'}</div>
                <div>{metric.loaded ? `#${metric.loadOrder}` : '-'}</div>
                <div>
                  {metric.inViewport ? (
                    <span className="text-blue-600">👁️ 可见</span>
                  ) : (
                    <span className="text-gray-400">📄 隐藏</span>
                  )}
                </div>
                <div>
                  <button 
                    onClick={() => {
                      const img = document.querySelector(`img[data-image-id="${metric.id}"]`);
                      img?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    定位
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 图片网格 */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold">懒加载图片展示区域</h3>
          <div className="text-sm text-gray-600">
            向下滚动查看懒加载效果 | 共 {imgs.length} 张图片
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imgs.map((img, index) => (
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
                  <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">⏳ 加载中</div>
                )}
              </div>
              
              {/* 视口状态指示器 */}
              <div className="absolute top-2 right-2 z-10">
                {imageMetrics.find(m => m.id === img.id)?.inViewport && (
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">👁️ 可见</div>
                )}
              </div>

              {/* 图片 */}
              <img
                src={img.src}
                alt={img.alt}
                data-image-id={img.id}
                className="w-full h-64 object-cover transition-opacity duration-300"
                style={{
                  opacity: imageMetrics.find(m => m.id === img.id)?.loaded ? 1 : 0.5
                }}
              />
              
              {/* 图片信息 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                <div className="text-sm">图片 #{img.id + 1}</div>
                {imageMetrics.find(m => m.id === img.id)?.loaded && (
                  <div className="text-xs text-gray-300">
                    加载顺序: #{imageMetrics.find(m => m.id === img.id)?.loadOrder}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 性能建议 */}
      {isMonitoring && performanceStats.loadedImages > 10 && (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mt-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">性能分析建议</h3>
          <ul className="space-y-2 text-sm text-yellow-700">
            {performanceStats.averageLoadTime > 1000 && (
              <li>• 平均加载时间较长，建议优化图片尺寸或使用CDN</li>
            )}
            {performanceStats.errorImages > 0 && (
              <li>• 发现 {performanceStats.errorImages} 张图片加载失败，请检查图片链接</li>
            )}
            {performanceStats.imagesInViewport / performanceStats.totalImages > 0.8 && (
              <li>• 大部分图片都在视口内，懒加载效果不明显，建议增加图片数量或调整布局</li>
            )}
            {performanceStats.loadedImages > 0 && performanceStats.loadedImages === performanceStats.imagesInViewport && (
              <li>• ✅ 懒加载工作正常，只有视口内的图片被加载</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
