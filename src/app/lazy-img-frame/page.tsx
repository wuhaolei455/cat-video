"use client";
import React from "react";
import { useImagePerformanceMonitor, PerformancePanel } from "@/components/ImagePerformanceMonitor";
import { ImageGrid } from "@/components/ImageGrid";
import { PerformanceNavigation } from "@/components/PerformanceNavigation";

export default function LazyImgFramePage() {
  const { imageMetrics, performanceStats, isMonitoring, startMonitoring } = 
    useImagePerformanceMonitor('frame-based');

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center">🚀 分帧加载性能监控系统</h1>
      
      <div className="text-center mb-8">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          isMonitoring 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {isMonitoring ? '🚀 分帧加载监控运行中' : '⏳ 正在启动监控...'}
          {isMonitoring && ` - 已监控 ${imageMetrics.length} 张图片`}
        </div>
      </div>
      
      {/* 快速导航面板 */}
      <PerformanceNavigation />
      
      {/* 性能控制面板 */}
      <PerformancePanel 
        strategy="frame-based"
        performanceStats={performanceStats}
        isMonitoring={isMonitoring}
        onRestart={startMonitoring}
      />

      {/* 实时性能状态 */}
      {isMonitoring && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border">
          <h3 className="text-xl font-bold text-center mb-6">⚡ 分帧加载性能状态</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
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
              <div className={`text-3xl font-bold ${
                performanceStats.currentConcurrentLoads <= 2 ? 'text-green-500' :
                performanceStats.currentConcurrentLoads <= 4 ? 'text-blue-500' :
                'text-orange-500'
              }`}>
                {performanceStats.currentConcurrentLoads}
              </div>
              <div className="text-sm text-gray-600">智能并发控制</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">
                {performanceStats.imagesInViewport}
              </div>
              <div className="text-sm text-gray-600">视口内图片</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm">
              🎬 分帧加载已启用 - 智能控制并发数量和加载时机，最优用户体验
            </div>
          </div>
        </div>
      )}

      {/* 分帧加载优势说明 */}
      <div className="bg-green-50 border border-green-200 p-6 rounded-xl mb-8">
        <h3 className="text-lg font-bold text-green-800 mb-4">🚀 分帧加载核心优势</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-700 mb-2">🎯 智能加载策略</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 动态调整并发加载数量（通常2-4个）</li>
              <li>• 优先加载视口内和即将进入视口的图片</li>
              <li>• 分阶段加载：低质量→高质量</li>
              <li>• 智能预测用户滚动行为和速度</li>
              <li>• 根据网络状况动态调整策略</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-700 mb-2">📊 性能优化效果</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 避免网络拥塞，保持页面响应性</li>
              <li>• 显著减少内存占用峰值</li>
              <li>• 提升首屏加载速度</li>
              <li>• 优化用户感知性能</li>
              <li>• 平衡加载速度与系统资源占用</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">≤3</div>
            <div className="text-sm text-green-700">最大并发数</div>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">200px</div>
            <div className="text-sm text-blue-700">动态预加载距离</div>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">16ms</div>
            <div className="text-sm text-purple-700">帧时间预算</div>
          </div>
        </div>
      </div>

      {/* 使用技巧 */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-8">
        <h3 className="text-lg font-bold text-blue-800 mb-4">💡 分帧加载测试技巧</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">🧪 测试建议</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 尝试快速滚动，观察加载的流畅度</li>
              <li>• 观察并发数量的智能控制</li>
              <li>• 对比其他页面的加载延迟</li>
              <li>• 注意图片加载的优先级排序</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">📊 关键指标</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 平均加载时间应明显优于其他策略</li>
              <li>• 并发数量保持在合理范围内</li>
              <li>• 首图加载时间更短</li>
              <li>• 滚动时几乎无感知延迟</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 图片网格 */}
      <ImageGrid 
        strategy="frame-based"
        imageMetrics={imageMetrics}
      />

      {/* 性能分析 */}
      {isMonitoring && performanceStats.loadedImages > 5 && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg mt-8">
          <h3 className="text-lg font-semibold text-green-800 mb-3">📈 分帧加载性能分析</h3>
          <ul className="space-y-2 text-sm text-green-700">
            {performanceStats.averageLoadTime < 600 && (
              <li>• ✅ 平均加载时间优秀 ({performanceStats.averageLoadTime.toFixed(0)}ms)，分帧优化效果显著</li>
            )}
            {performanceStats.peakConcurrentLoads <= 4 && (
              <li>• ✅ 智能并发控制优秀，峰值并发仅 {performanceStats.peakConcurrentLoads}，避免网络拥塞</li>
            )}
            {performanceStats.firstImageLoadTime < 800 && (
              <li>• ✅ 首图加载速度优秀 ({performanceStats.firstImageLoadTime.toFixed(0)}ms)</li>
            )}
            {performanceStats.currentConcurrentLoads <= 3 && (
              <li>• ✅ 当前并发控制良好 ({performanceStats.currentConcurrentLoads}个)，系统资源利用合理</li>
            )}
            {performanceStats.loadingProgress > 70 && (
              <li>• ✅ 加载进度良好 ({performanceStats.loadingProgress.toFixed(1)}%)，用户体验优秀</li>
            )}
            {performanceStats.errorImages === 0 && (
              <li>• ✅ 零加载错误，网络连接稳定</li>
            )}
            <li>• 🎯 当前策略：智能分帧加载，动态优化并发和时机</li>
            <li>• 📊 建议对比其他页面，感受性能提升的显著差异</li>
          </ul>
        </div>
      )}

      {/* 性能对比总结 */}
      {isMonitoring && performanceStats.loadedImages > 10 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-6 rounded-xl mt-8">
          <h3 className="text-lg font-bold text-green-800 mb-4">🏆 分帧加载 vs 其他策略</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-600 mb-2">🚫 无懒加载</h4>
              <ul className="text-xs text-red-600 space-y-1">
                <li>• 50个并发请求</li>
                <li>• 严重网络拥塞</li>
                <li>• 用户体验极差</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-600 mb-2">⚡ 基础懒加载</h4>
              <ul className="text-xs text-yellow-600 space-y-1">
                <li>• 无预加载距离</li>
                <li>• 明显加载延迟</li>
                <li>• 体验一般</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-600 mb-2">🐌 传统懒加载</h4>
              <ul className="text-xs text-orange-600 space-y-1">
                <li>• 固定预加载距离</li>
                <li>• 快速滚动仍有延迟</li>
                <li>• 中等体验</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-600 mb-2">🚀 分帧加载</h4>
              <ul className="text-xs text-green-600 space-y-1">
                <li>• 智能并发控制</li>
                <li>• 动态优化策略</li>
                <li>• 最优用户体验</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 页面导航 */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 text-center">
          <h3 className="text-lg font-bold text-orange-600 mb-4">🚫 无懒加载</h3>
          <p className="text-orange-700 mb-4">对比最差的性能表现</p>
          <a 
            href="/no-lazy-img" 
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            对比体验
          </a>
        </div>
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-center">
          <h3 className="text-lg font-bold text-yellow-600 mb-4">⚡ 基础懒加载</h3>
          <p className="text-yellow-700 mb-4">对比基础优化效果</p>
          <a 
            href="/lazy-img-basic" 
            className="inline-block px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            对比体验
          </a>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
          <h3 className="text-lg font-bold text-red-600 mb-4">🐌 传统懒加载</h3>
          <p className="text-red-700 mb-4">对比传统优化策略</p>
          <a 
            href="/lazy-img-traditional" 
            className="inline-block px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            对比体验
          </a>
        </div>
      </div>
    </div>
  );
}