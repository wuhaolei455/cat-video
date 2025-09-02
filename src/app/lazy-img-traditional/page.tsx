"use client";
import React from "react";
import { useImagePerformanceMonitor, PerformancePanel } from "@/components/ImagePerformanceMonitor";
import { ImageGrid } from "@/components/ImageGrid";
import { PerformanceNavigation } from "@/components/PerformanceNavigation";

export default function LazyImgTraditionalPage() {
  const { imageMetrics, performanceStats, isMonitoring, startMonitoring } = 
    useImagePerformanceMonitor('traditional-lazy');

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center">🐌 传统懒加载模式</h1>
      
      <div className="text-center mb-8">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          isMonitoring 
            ? 'bg-red-100 text-red-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {isMonitoring ? '🐌 传统懒加载监控运行中' : '⏳ 正在启动监控...'}
          {isMonitoring && ` - 已监控 ${imageMetrics.length} 张图片`}
        </div>
      </div>
      
      {/* 快速导航面板 */}
      <PerformanceNavigation />
      
      {/* 性能控制面板 */}
      <PerformancePanel 
        strategy="traditional-lazy"
        performanceStats={performanceStats}
        isMonitoring={isMonitoring}
        onRestart={startMonitoring}
      />

      {/* 实时性能状态 */}
      {isMonitoring && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border">
          <h3 className="text-xl font-bold text-center mb-6">⚡ 传统懒加载性能状态</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">
                {performanceStats.loadedImages}
              </div>
              <div className="text-sm text-gray-600">已加载图片</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {performanceStats.averageLoadTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-600">平均加载时间</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">
                {performanceStats.currentConcurrentLoads}
              </div>
              <div className="text-sm text-gray-600">当前并发加载</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">
                {performanceStats.imagesInViewport}
              </div>
              <div className="text-sm text-gray-600">视口内图片</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm">
              🐌 传统懒加载已启用 - 200px预加载距离，但仍可能出现加载延迟
            </div>
          </div>
        </div>
      )}

      {/* 传统懒加载说明 */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl mb-8">
        <h3 className="text-lg font-bold text-red-800 mb-4">🐌 传统懒加载特点</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-red-700 mb-2">✅ 优点</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• 相比无懒加载，显著减少初始网络请求</li>
              <li>• 有200px预加载距离，提前开始加载</li>
              <li>• 减少了不必要的图片加载</li>
              <li>• 节省用户流量和带宽</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-700 mb-2">⚠️ 局限性</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• 固定的预加载距离不够智能</li>
              <li>• 快速滚动时仍可能出现加载延迟</li>
              <li>• 无法根据网络状况动态调整</li>
              <li>• 并发控制不够精细</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-red-100 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            💡 <strong>对比建议</strong>: 尝试快速滚动页面，观察图片加载的延迟情况，然后对比分帧加载的表现！
          </p>
        </div>
      </div>

      {/* 图片网格 */}
      <ImageGrid 
        strategy="traditional-lazy"
        imageMetrics={imageMetrics}
      />

      {/* 性能分析 */}
      {isMonitoring && performanceStats.loadedImages > 5 && (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mt-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">📈 传统懒加载性能分析</h3>
          <ul className="space-y-2 text-sm text-yellow-700">
            {performanceStats.averageLoadTime < 800 && (
              <li>• ✅ 平均加载时间较好，预加载距离发挥了作用</li>
            )}
            {performanceStats.averageLoadTime > 1200 && (
              <li>• ⚠️ 平均加载时间较长，可能需要更智能的加载策略</li>
            )}
            {performanceStats.peakConcurrentLoads <= 5 && (
              <li>• ✅ 并发控制良好，避免了网络拥塞</li>
            )}
            {performanceStats.firstImageLoadTime < 1000 && (
              <li>• ✅ 首图加载速度不错</li>
            )}
            {performanceStats.loadedImages / performanceStats.totalImages > 0.3 && performanceStats.imagesInViewport / performanceStats.totalImages < 0.2 && (
              <li>• 📊 预加载效果明显：已加载 {performanceStats.loadedImages} 张，但只有 {performanceStats.imagesInViewport} 张在视口内</li>
            )}
            {performanceStats.errorImages === 0 && (
              <li>• ✅ 无加载错误，网络连接稳定</li>
            )}
            <li>• 📊 当前策略：200px预加载距离的传统懒加载</li>
            <li>• 🚀 建议尝试分帧加载，体验更智能的优化效果</li>
          </ul>
        </div>
      )}

      {/* 页面导航 */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 text-center">
          <h3 className="text-lg font-bold text-orange-600 mb-4">🚫 无懒加载</h3>
          <p className="text-orange-700 mb-4">对比最差的加载策略</p>
          <a 
            href="/no-lazy-img" 
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            对比体验
          </a>
        </div>
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-center">
          <h3 className="text-lg font-bold text-yellow-600 mb-4">⚡ 基础懒加载</h3>
          <p className="text-yellow-700 mb-4">对比最基础的懒加载</p>
          <a 
            href="/lazy-img-basic" 
            className="inline-block px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            对比体验
          </a>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
          <h3 className="text-lg font-bold text-green-600 mb-4">🚀 分帧加载</h3>
          <p className="text-green-700 mb-4">体验最优化的智能策略</p>
          <a 
            href="/lazy-img-frame" 
            className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            立即体验
          </a>
        </div>
      </div>
    </div>
  );
}