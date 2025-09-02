"use client";
import React from "react";
import { useImagePerformanceMonitor, PerformancePanel } from "@/components/ImagePerformanceMonitor";
import { ImageGrid } from "@/components/ImageGrid";
import { PerformanceNavigation } from "@/components/PerformanceNavigation";

export default function NoLazyImgPage() {
  const { imageMetrics, performanceStats, isMonitoring, startMonitoring } = 
    useImagePerformanceMonitor('no-lazy');

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center">🚫 无懒加载模式</h1>
      
      <div className="text-center mb-8">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          isMonitoring 
            ? 'bg-orange-100 text-orange-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {isMonitoring ? '⚠️ 无懒加载监控运行中' : '⏳ 正在启动监控...'}
          {isMonitoring && ` - 已监控 ${imageMetrics.length} 张图片`}
        </div>
      </div>
      
      {/* 快速导航面板 */}
      <PerformanceNavigation />
      
      {/* 性能控制面板 */}
      <PerformancePanel 
        strategy="no-lazy"
        performanceStats={performanceStats}
        isMonitoring={isMonitoring}
        onRestart={startMonitoring}
      />

      {/* 实时性能状态 */}
      {isMonitoring && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border">
          <h3 className="text-xl font-bold text-center mb-6">⚡ 无懒加载性能状态</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                performanceStats.currentConcurrentLoads <= 5 ? 'text-yellow-500' : 
                performanceStats.currentConcurrentLoads <= 15 ? 'text-orange-500' : 
                'text-red-500'
              }`}>
                {performanceStats.currentConcurrentLoads}
              </div>
              <div className="text-sm text-gray-600">当前并发加载</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                performanceStats.peakConcurrentLoads <= 10 ? 'text-yellow-500' : 
                performanceStats.peakConcurrentLoads <= 25 ? 'text-orange-500' : 
                'text-red-500'
              }`}>
                {performanceStats.peakConcurrentLoads}
              </div>
              <div className="text-sm text-gray-600">峰值并发数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">
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
          </div>
          
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm">
              🚫 无懒加载模式 - 所有图片同时开始加载，可能导致严重性能问题
            </div>
          </div>
        </div>
      )}

      {/* 警告说明 */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl mb-8">
        <h3 className="text-lg font-bold text-red-800 mb-4">⚠️ 无懒加载的严重影响</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-red-700 mb-2">🚫 加载策略问题</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• 页面加载时立即请求所有50张图片</li>
              <li>• 同时发起大量网络请求</li>
              <li>• 无视图片是否在用户视口内</li>
              <li>• 浪费用户流量和带宽</li>
            </ul>
        </div>
          <div>
            <h4 className="font-semibold text-red-700 mb-2">📊 性能影响</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• 可能导致严重的网络拥塞</li>
              <li>• 大量并发请求影响其他资源加载</li>
              <li>• 内存占用快速增长</li>
              <li>• 页面可能长时间处于加载状态</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-red-100 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            💡 <strong>对比建议</strong>: 测试完无懒加载后，请尝试其他优化策略，体验性能差异！
          </p>
                  </div>
              </div>
              
      {/* 图片网格 */}
      <ImageGrid 
        strategy="no-lazy"
        imageMetrics={imageMetrics}
      />

      {/* 性能分析 */}
      {isMonitoring && performanceStats.loadedImages > 5 && (
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg mt-8">
          <h3 className="text-lg font-semibold text-orange-800 mb-3">📈 无懒加载性能分析</h3>
          <ul className="space-y-2 text-sm text-orange-700">
            {performanceStats.peakConcurrentLoads > 20 && (
              <li>• ⚠️ 峰值并发数过高 ({performanceStats.peakConcurrentLoads})，可能导致网络拥塞</li>
            )}
            {performanceStats.averageLoadTime > 1000 && (
              <li>• ⚠️ 平均加载时间较长 ({performanceStats.averageLoadTime.toFixed(0)}ms)，网络资源竞争激烈</li>
            )}
            {performanceStats.firstImageLoadTime > 500 && (
              <li>• ⚠️ 首图加载时间 ({performanceStats.firstImageLoadTime.toFixed(0)}ms) 较慢</li>
            )}
            {performanceStats.loadingProgress < 50 && performanceStats.networkRequests > 25 && (
              <li>• ⚠️ 大量请求但加载进度缓慢，建议使用懒加载优化</li>
            )}
            {performanceStats.errorImages > 0 && (
              <li>• ❌ 发现 {performanceStats.errorImages} 张图片加载失败</li>
            )}
            <li>• 📊 当前策略：同时加载所有图片，无任何优化</li>
            <li>• 🚀 建议尝试其他页面的优化策略进行对比</li>
          </ul>
        </div>
      )}

      {/* 页面导航 */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-center">
          <h3 className="text-lg font-bold text-yellow-600 mb-4">⚡ 基础懒加载</h3>
          <p className="text-yellow-700 mb-4">体验最基础的懒加载优化</p>
          <a 
            href="/lazy-img-basic" 
            className="inline-block px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            立即体验
          </a>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
          <h3 className="text-lg font-bold text-red-600 mb-4">🐌 传统懒加载</h3>
          <p className="text-red-700 mb-4">带预加载距离的传统优化</p>
          <a 
            href="/lazy-img-traditional" 
            className="inline-block px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            立即体验
          </a>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
          <h3 className="text-lg font-bold text-green-600 mb-4">🚀 分帧加载</h3>
          <p className="text-green-700 mb-4">最优化的智能加载策略</p>
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