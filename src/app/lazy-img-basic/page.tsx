"use client";
import React from "react";
import { useImagePerformanceMonitor, PerformancePanel } from "@/components/ImagePerformanceMonitor";
import { ImageGrid } from "@/components/ImageGrid";
import { PerformanceNavigation } from "@/components/PerformanceNavigation";

export default function LazyImgBasicPage() {
  const { imageMetrics, performanceStats, isMonitoring, startMonitoring } = 
    useImagePerformanceMonitor('basic-lazy');

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center">⚡ 基础懒加载模式</h1>
      
      <div className="text-center mb-8">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          isMonitoring 
            ? 'bg-yellow-100 text-yellow-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {isMonitoring ? '⚡ 基础懒加载监控运行中' : '⏳ 正在启动监控...'}
          {isMonitoring && ` - 已监控 ${imageMetrics.length} 张图片`}
        </div>
      </div>
      
      {/* 快速导航面板 */}
      <PerformanceNavigation />
      
      {/* 性能控制面板 */}
      <PerformancePanel 
        strategy="basic-lazy"
        performanceStats={performanceStats}
        isMonitoring={isMonitoring}
        onRestart={startMonitoring}
      />

      {/* 实时性能状态 */}
      {isMonitoring && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border">
          <h3 className="text-xl font-bold text-center mb-6">⚡ 基础懒加载性能状态</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">
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
                {performanceStats.imagesInViewport}
              </div>
              <div className="text-sm text-gray-600">视口内图片</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {performanceStats.currentConcurrentLoads}
              </div>
              <div className="text-sm text-gray-600">当前并发加载</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm">
              ⚡ 基础懒加载已启用 - 图片进入视口时开始加载
            </div>
          </div>
        </div>
      )}

      {/* 基础懒加载说明 */}
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mb-8">
        <h3 className="text-lg font-bold text-yellow-800 mb-4">⚡ 基础懒加载特点</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-yellow-700 mb-2">✅ 优势</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 只加载用户可见的图片</li>
              <li>• 减少初始页面加载时间</li>
              <li>• 节省用户流量</li>
              <li>• 降低服务器压力</li>
              <li>• 简单易实现</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-700 mb-2">⚠️ 局限性</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 无预加载，滚动时可能有延迟</li>
              <li>• 快速滚动时体验不佳</li>
              <li>• 没有加载优先级控制</li>
              <li>• 无并发数量限制</li>
              <li>• 缺乏智能预测</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
          <p className="text-sm text-yellow-800">
            💡 <strong>使用场景</strong>: 适合内容较少、用户滚动较慢的页面。对于复杂场景建议使用更高级的加载策略。
          </p>
        </div>
      </div>

      {/* 图片网格 */}
      <ImageGrid 
        strategy="basic-lazy"
        imageMetrics={imageMetrics}
      />

      {/* 性能分析 */}
      {isMonitoring && performanceStats.loadedImages > 5 && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">📈 基础懒加载性能分析</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            {performanceStats.loadedImages === performanceStats.imagesInViewport && (
              <li>• ✅ 懒加载工作正常，只有视口内图片被加载</li>
            )}
            {performanceStats.averageLoadTime < 800 && (
              <li>• ✅ 平均加载时间良好 ({performanceStats.averageLoadTime.toFixed(0)}ms)</li>
            )}
            {performanceStats.firstImageLoadTime < 500 && (
              <li>• ✅ 首图加载速度快 ({performanceStats.firstImageLoadTime.toFixed(0)}ms)</li>
            )}
            {performanceStats.currentConcurrentLoads > 5 && (
              <li>• ⚠️ 当前并发加载数较高 ({performanceStats.currentConcurrentLoads})，可能影响性能</li>
            )}
            {performanceStats.errorImages > 0 && (
              <li>• ❌ 发现 {performanceStats.errorImages} 张图片加载失败</li>
            )}
            <li>• 📊 相比无懒加载，减少了 {Math.max(0, 50 - performanceStats.networkRequests)} 个不必要的网络请求</li>
            <li>• 🚀 想要更好的体验？试试传统懒加载或分帧加载</li>
          </ul>
        </div>
      )}

      {/* 对比导航 */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 text-center">
          <h3 className="text-lg font-bold text-orange-600 mb-4">🚫 对比无懒加载</h3>
          <p className="text-orange-700 mb-4">体验最差的加载策略</p>
          <a 
            href="/no-lazy-img" 
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            查看差异
          </a>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
          <h3 className="text-lg font-bold text-red-600 mb-4">🐌 升级传统懒加载</h3>
          <p className="text-red-700 mb-4">带预加载距离优化</p>
          <a 
            href="/lazy-img-traditional" 
            className="inline-block px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            体验升级
          </a>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
          <h3 className="text-lg font-bold text-green-600 mb-4">🚀 体验分帧加载</h3>
          <p className="text-green-700 mb-4">最优化的智能策略</p>
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