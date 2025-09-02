"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";

// 图片指标接口
export interface ImageMetrics {
  id: number;
  src: string;
  loadTime: number;
  loaded: boolean;
  error: boolean;
  startTime: number;
  endTime?: number;
  inViewport: boolean;
  loadOrder: number;
  fileSize?: number;
}

// 性能统计接口
export interface PerformanceStats {
  totalImages: number;
  loadedImages: number;
  errorImages: number;
  averageLoadTime: number;
  totalLoadTime: number;
  imagesInViewport: number;
  loadingProgress: number;
  networkRequests: number;
  firstImageLoadTime: number;
  lastImageLoadTime: number;
  totalLoadingDuration: number;
  loadingStartTime: number;
  loadingEndTime: number;
  peakConcurrentLoads: number;
  currentConcurrentLoads: number;
}

// 加载策略类型
export type LoadingStrategy = 'no-lazy' | 'basic-lazy' | 'traditional-lazy' | 'frame-based';

// 性能监控钩子
export function useImagePerformanceMonitor(strategy: LoadingStrategy) {
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
    firstImageLoadTime: 0,
    lastImageLoadTime: 0,
    totalLoadingDuration: 0,
    loadingStartTime: 0,
    loadingEndTime: 0,
    peakConcurrentLoads: 0,
    currentConcurrentLoads: 0,
  });
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState<Array<{time: number, count: number}>>([]);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadOrderRef = useRef(0);
  const startTimeRef = useRef(performance.now());
  const concurrentLoadsRef = useRef(0);
  const peakConcurrentRef = useRef(0);

  // 更新性能统计
  const updatePerformanceStats = useCallback((metrics: ImageMetrics[]) => {
    const loaded = metrics.filter(m => m.loaded);
    const errors = metrics.filter(m => m.error);
    const inViewport = metrics.filter(m => m.inViewport);
    const totalLoadTime = loaded.reduce((sum, m) => sum + m.loadTime, 0);
    
    // 计算首图和尾图加载时间
    const loadedWithTimes = loaded.filter(m => m.endTime);
    const firstImageLoadTime = loadedWithTimes.length > 0 
      ? Math.min(...loadedWithTimes.map(m => m.endTime!)) - startTimeRef.current
      : 0;
    const lastImageLoadTime = loadedWithTimes.length > 0 
      ? Math.max(...loadedWithTimes.map(m => m.endTime!)) - startTimeRef.current
      : 0;
    
    setPerformanceStats(prev => {
      const newStats = {
        totalImages: metrics.length,
        loadedImages: loaded.length,
        errorImages: errors.length,
        averageLoadTime: loaded.length > 0 ? totalLoadTime / loaded.length : 0,
        totalLoadTime,
        imagesInViewport: inViewport.length,
        loadingProgress: metrics.length > 0 ? (loaded.length / metrics.length) * 100 : 0,
        networkRequests: loaded.length + errors.length,
        firstImageLoadTime,
        lastImageLoadTime,
        totalLoadingDuration: lastImageLoadTime,
        loadingStartTime: prev.loadingStartTime || (loaded.length > 0 ? startTimeRef.current : 0),
        loadingEndTime: loaded.length === metrics.length ? performance.now() : 0,
        peakConcurrentLoads: peakConcurrentRef.current,
        currentConcurrentLoads: concurrentLoadsRef.current,
      };
      
      // 只有数据真正变化时才更新
      const hasChanged = 
        prev.totalImages !== newStats.totalImages ||
        prev.loadedImages !== newStats.loadedImages ||
        prev.errorImages !== newStats.errorImages ||
        prev.imagesInViewport !== newStats.imagesInViewport ||
        Math.abs(prev.averageLoadTime - newStats.averageLoadTime) > 0.1;
        
      return hasChanged ? newStats : prev;
    });
  }, []);

  // 更新加载时间线
  const updateTimeline = useCallback(() => {
    const now = performance.now() - startTimeRef.current;
    setLoadingTimeline(prev => {
      const newTimeline = [...prev];
      const lastEntry = newTimeline[newTimeline.length - 1];
      
      // 只有当加载图片数量变化且时间间隔足够时才记录
      if (!lastEntry || (now - lastEntry.time > 100 && lastEntry.count !== performanceStats.loadedImages)) {
        newTimeline.push({ time: now, count: performanceStats.loadedImages });
      }
      
      return newTimeline.slice(-50); // 只保留最近50个数据点
    });
  }, [performanceStats.loadedImages]);

  // 设置图片监控
  const setupImageMonitoring = useCallback((img: HTMLImageElement, id: number) => {
    const startTime = performance.now();
    const originalSrc = img.src;
    
    img.dataset.imageId = id.toString();
    
    // 初始化图片指标
    const initialMetric: ImageMetrics = {
      id,
      src: originalSrc,
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
      updatePerformanceStats(updated);
      return updated;
    });

    // 监听加载开始
    const handleLoadStart = () => {
      concurrentLoadsRef.current += 1;
      peakConcurrentRef.current = Math.max(peakConcurrentRef.current, concurrentLoadsRef.current);
    };

    // 监听加载完成
    const handleLoadEnd = () => {
      concurrentLoadsRef.current = Math.max(0, concurrentLoadsRef.current - 1);
    };

    // 图片加载成功
    img.onload = () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      loadOrderRef.current += 1;
      handleLoadEnd();

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

    // 图片加载失败
    img.onerror = () => {
      handleLoadEnd();
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

    // 根据策略处理加载
    if (strategy === 'no-lazy') {
      handleLoadStart();
      // 无懒加载：立即开始加载
    } else {
      // 其他策略：等待视口或其他条件
      img.loading = 'lazy';
    }
  }, [strategy, updatePerformanceStats]);

  // 设置 Intersection Observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const img = entry.target as HTMLImageElement;
          const id = parseInt(img.dataset.imageId || "0");
          
          // 更新视口状态
          img.dataset.inViewport = entry.isIntersecting.toString();
          
          setImageMetrics(prev => {
            const updated = prev.map(m => 
              m.id === id 
                ? { ...m, inViewport: entry.isIntersecting }
                : m
            );
            updatePerformanceStats(updated);
            return updated;
          });
        });
      },
      { 
        threshold: 0.1,
        rootMargin: strategy === 'traditional-lazy' ? '200px' : '0px', // 传统懒加载有预加载距离
      }
    );

    if (isMonitoring) {
      const imgElements = document.querySelectorAll("img[data-image-id]");
      imgElements.forEach((img) => {
        if (observerRef.current) {
          observerRef.current.observe(img);
        }
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isMonitoring, strategy, updatePerformanceStats]);

  // 开始监控
  const startMonitoring = useCallback(() => {
    console.log(`🚀 开始 ${strategy} 性能监控`);
    
    setIsMonitoring(true);
    startTimeRef.current = performance.now();
    loadOrderRef.current = 0;
    concurrentLoadsRef.current = 0;
    peakConcurrentRef.current = 0;
    
    // 重置数据
    setImageMetrics([]);
    setLoadingTimeline([]);
    setPerformanceStats({
      totalImages: 0,
      loadedImages: 0,
      errorImages: 0,
      averageLoadTime: 0,
      totalLoadTime: 0,
      imagesInViewport: 0,
      loadingProgress: 0,
      networkRequests: 0,
      firstImageLoadTime: 0,
      lastImageLoadTime: 0,
      totalLoadingDuration: 0,
      loadingStartTime: 0,
      loadingEndTime: 0,
      peakConcurrentLoads: 0,
      currentConcurrentLoads: 0,
    });
    
    // 延迟设置图片监控
    setTimeout(() => {
      const imgElements = document.querySelectorAll("img[data-image-id]");
      console.log(`📊 找到 ${imgElements.length} 个图片元素`);
      
      imgElements.forEach((img) => {
        const htmlImg = img as HTMLImageElement;
        const id = parseInt(htmlImg.dataset.imageId || "0");
        setupImageMonitoring(htmlImg, id);
        
        if (observerRef.current) {
          observerRef.current.observe(htmlImg);
        }
      });
      
      // 强制更新总图片数
      setTimeout(() => {
        const currentMetrics = document.querySelectorAll("img[data-image-id]").length;
        if (currentMetrics > 0) {
          setPerformanceStats(prev => ({
            ...prev,
            totalImages: currentMetrics
          }));
        }
      }, 100);
    }, 50);
  }, [strategy, setupImageMonitoring]);

  // 自动开始监控
  useEffect(() => {
    const timer = setTimeout(() => {
      startMonitoring();
    }, 500); // 页面加载后自动开始

    return () => clearTimeout(timer);
  }, [startMonitoring]);

  // 定时更新时间线
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(updateTimeline, 200);
    return () => clearInterval(interval);
  }, [isMonitoring, updateTimeline]);

  return {
    imageMetrics,
    performanceStats,
    isMonitoring,
    loadingTimeline,
    startMonitoring,
  };
}

// 性能面板组件
interface PerformancePanelProps {
  strategy: LoadingStrategy;
  performanceStats: PerformanceStats;
  isMonitoring: boolean;
  onRestart: () => void;
}

export function PerformancePanel({ strategy, performanceStats, isMonitoring, onRestart }: PerformancePanelProps) {
  const getStrategyInfo = () => {
    switch (strategy) {
      case 'no-lazy':
        return {
          title: '🚫 无懒加载模式',
          description: '所有图片立即开始加载 - 可能严重影响性能',
          color: 'orange',
          warning: '同时发起所有网络请求，可能导致严重性能问题',
        };
      case 'basic-lazy':
        return {
          title: '⚡ 基础懒加载模式',
          description: '图片进入视口时才开始加载',
          color: 'yellow',
          warning: '基础懒加载，无预加载距离优化',
        };
      case 'traditional-lazy':
        return {
          title: '🐌 传统懒加载模式',
          description: '带预加载距离的懒加载',
          color: 'red',
          warning: '有200px预加载距离，但仍可能出现加载延迟',
        };
      case 'frame-based':
        return {
          title: '🚀 分帧加载模式',
          description: '智能分帧加载，最优性能',
          color: 'green',
          warning: '最优化的加载策略，平衡性能与用户体验',
        };
      default:
        return {
          title: '图片加载测试',
          description: '性能监控',
          color: 'blue',
          warning: '监控图片加载性能',
        };
    }
  };

  const info = getStrategyInfo();
  const colorClasses = {
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
  };

  return (
    <div className={`p-8 rounded-xl mb-8 border ${colorClasses[info.color as keyof typeof colorClasses]}`}>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">{info.title}</h2>
        <p className="text-lg">{info.description}</p>
      </div>
      
      <div className="flex justify-center mb-8">
        <button
          onClick={onRestart}
          className={`px-8 py-4 bg-${info.color}-500 text-white rounded-xl text-lg font-semibold hover:bg-${info.color}-600 transition-colors`}
        >
          {isMonitoring ? '重新开始测试' : '开始性能测试'}
        </button>
      </div>

      {/* 实时统计面板 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">已加载/总数</h3>
          <p className="text-2xl font-bold text-blue-600">{performanceStats.loadedImages}/{performanceStats.totalImages}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">平均加载时间</h3>
          <p className="text-2xl font-bold text-green-600">{performanceStats.averageLoadTime.toFixed(0)}ms</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">首图加载时间</h3>
          <p className="text-2xl font-bold text-purple-600">{performanceStats.firstImageLoadTime.toFixed(0)}ms</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">总加载时长</h3>
          <p className="text-2xl font-bold text-orange-600">{(performanceStats.totalLoadingDuration / 1000).toFixed(1)}s</p>
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
            className={`bg-${info.color}-500 h-3 rounded-full transition-all duration-300`}
            style={{ width: `${performanceStats.loadingProgress}%` }}
          ></div>
        </div>
      </div>

      {/* 并发加载统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded-lg shadow text-center">
          <div className="text-lg font-bold text-indigo-600">{performanceStats.currentConcurrentLoads}</div>
          <div className="text-xs text-gray-600">当前并发</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow text-center">
          <div className="text-lg font-bold text-red-600">{performanceStats.peakConcurrentLoads}</div>
          <div className="text-xs text-gray-600">峰值并发</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow text-center">
          <div className="text-lg font-bold text-cyan-600">{performanceStats.networkRequests}</div>
          <div className="text-xs text-gray-600">网络请求</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow text-center">
          <div className="text-lg font-bold text-purple-600">{performanceStats.imagesInViewport}</div>
          <div className="text-xs text-gray-600">视口内图片</div>
        </div>
      </div>

      {/* 策略说明 */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-50 rounded-full text-sm">
          ⚠️ {info.warning}
        </div>
      </div>
    </div>
  );
}
