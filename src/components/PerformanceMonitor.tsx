"use client";
import React, { useState, useEffect } from "react";

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domContentLoaded: number;
  loadComplete: number;
  resourceCount: number;
  jsHeapSize: number;
  navigationTiming: any;
}

interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  size: number;
  startTime: number;
  responseEnd: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    domContentLoaded: 0,
    loadComplete: 0,
    resourceCount: 0,
    jsHeapSize: 0,
    navigationTiming: null
  });

  const [resources, setResources] = useState<ResourceTiming[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>("overview");

  // 模拟性能指标数据
  const generateMockMetrics = (): PerformanceMetrics => ({
    fcp: Math.random() * 2000 + 500, // 500-2500ms
    lcp: Math.random() * 3000 + 1000, // 1000-4000ms
    fid: Math.random() * 200 + 10, // 10-210ms
    cls: Math.random() * 0.5, // 0-0.5
    ttfb: Math.random() * 800 + 100, // 100-900ms
    domContentLoaded: Math.random() * 1500 + 500, // 500-2000ms
    loadComplete: Math.random() * 3000 + 1500, // 1500-4500ms
    resourceCount: Math.floor(Math.random() * 50) + 20, // 20-70
    jsHeapSize: Math.random() * 50 + 10, // 10-60MB
    navigationTiming: performance.timing
  });

  // 模拟资源加载数据
  const generateMockResources = (): ResourceTiming[] => {
    const resourceTypes = ["document", "stylesheet", "script", "image", "font", "fetch"];
    const resources = [];
    
    for (let i = 0; i < 15; i++) {
      const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      const duration = Math.random() * 1000 + 50;
      const size = Math.random() * 500 + 10;
      
      resources.push({
        name: `${type}-resource-${i}.${type === "stylesheet" ? "css" : type === "script" ? "js" : type === "image" ? "png" : "woff2"}`,
        type,
        duration,
        size,
        startTime: Math.random() * 2000,
        responseEnd: Math.random() * 2000 + duration
      });
    }
    
    return resources.sort((a, b) => b.duration - a.duration);
  };

  useEffect(() => {
    // 初始化数据
    setMetrics(generateMockMetrics());
    setResources(generateMockResources());

    // 模拟实时更新
    const interval = setInterval(() => {
      if (isMonitoring) {
        setMetrics(generateMockMetrics());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getMetricStatus = (metric: string, value: number) => {
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 600, poor: 1500 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return "unknown";

    if (value <= threshold.good) return "good";
    if (value <= threshold.poor) return "needs-improvement";
    return "poor";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-700 bg-green-100 border-green-300";
      case "needs-improvement": return "text-yellow-700 bg-yellow-100 border-yellow-300";
      case "poor": return "text-red-700 bg-red-100 border-red-300";
      default: return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good": return "✅";
      case "needs-improvement": return "⚠️";
      case "poor": return "❌";
      default: return "❓";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "document": return "📄";
      case "stylesheet": return "🎨";
      case "script": return "⚙️";
      case "image": return "🖼️";
      case "font": return "🔤";
      case "fetch": return "🔌";
      default: return "📦";
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">⚡ 性能监控系统</h2>
        <p className="text-gray-600">实时监控Core Web Vitals和页面性能指标</p>
      </div>

      {/* 监控控制 */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            isMonitoring 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            {isMonitoring ? '性能监控运行中' : '性能监控已暂停'}
          </div>
        </div>
        
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isMonitoring
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isMonitoring ? '暂停监控' : '开始监控'}
        </button>
      </div>

      {/* Core Web Vitals */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6">🎯 Core Web Vitals</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LCP */}
          <div className={`p-6 rounded-xl border-2 ${getStatusColor(getMetricStatus("lcp", metrics.lcp))}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{getStatusIcon(getMetricStatus("lcp", metrics.lcp))}</div>
              <div className="text-sm font-medium">Largest Contentful Paint</div>
            </div>
            <div className="text-3xl font-bold mb-2">{metrics.lcp.toFixed(0)}ms</div>
            <div className="text-sm opacity-75">
              {getMetricStatus("lcp", metrics.lcp) === "good" ? "优秀" : 
               getMetricStatus("lcp", metrics.lcp) === "needs-improvement" ? "需要改进" : "较差"}
            </div>
            <div className="mt-2 text-xs opacity-60">
              目标: &lt; 2.5s
            </div>
          </div>

          {/* FID */}
          <div className={`p-6 rounded-xl border-2 ${getStatusColor(getMetricStatus("fid", metrics.fid))}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{getStatusIcon(getMetricStatus("fid", metrics.fid))}</div>
              <div className="text-sm font-medium">First Input Delay</div>
            </div>
            <div className="text-3xl font-bold mb-2">{metrics.fid.toFixed(0)}ms</div>
            <div className="text-sm opacity-75">
              {getMetricStatus("fid", metrics.fid) === "good" ? "优秀" : 
               getMetricStatus("fid", metrics.fid) === "needs-improvement" ? "需要改进" : "较差"}
            </div>
            <div className="mt-2 text-xs opacity-60">
              目标: &lt; 100ms
            </div>
          </div>

          {/* CLS */}
          <div className={`p-6 rounded-xl border-2 ${getStatusColor(getMetricStatus("cls", metrics.cls))}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{getStatusIcon(getMetricStatus("cls", metrics.cls))}</div>
              <div className="text-sm font-medium">Cumulative Layout Shift</div>
            </div>
            <div className="text-3xl font-bold mb-2">{metrics.cls.toFixed(3)}</div>
            <div className="text-sm opacity-75">
              {getMetricStatus("cls", metrics.cls) === "good" ? "优秀" : 
               getMetricStatus("cls", metrics.cls) === "needs-improvement" ? "需要改进" : "较差"}
            </div>
            <div className="mt-2 text-xs opacity-60">
              目标: &lt; 0.1
            </div>
          </div>
        </div>
      </div>

      {/* 其他性能指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">🎨</div>
            <div className="text-sm text-blue-600 font-medium">FCP</div>
          </div>
          <div className="text-3xl font-bold text-blue-700 mb-2">{metrics.fcp.toFixed(0)}ms</div>
          <div className="text-sm text-blue-600">首次内容绘制</div>
          <div className="mt-2 text-xs text-blue-500">
            {getMetricStatus("fcp", metrics.fcp) === "good" ? "🚀 快速" : "⚠️ 可优化"}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">⚡</div>
            <div className="text-sm text-purple-600 font-medium">TTFB</div>
          </div>
          <div className="text-3xl font-bold text-purple-700 mb-2">{metrics.ttfb.toFixed(0)}ms</div>
          <div className="text-sm text-purple-600">首字节时间</div>
          <div className="mt-2 text-xs text-purple-500">
            {getMetricStatus("ttfb", metrics.ttfb) === "good" ? "🚀 快速" : "⚠️ 可优化"}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">📦</div>
            <div className="text-sm text-green-600 font-medium">资源</div>
          </div>
          <div className="text-3xl font-bold text-green-700 mb-2">{metrics.resourceCount}</div>
          <div className="text-sm text-green-600">加载资源数</div>
          <div className="mt-2 text-xs text-green-500">
            {metrics.resourceCount > 50 ? "⚠️ 资源较多" : "✅ 合理范围"}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">🧠</div>
            <div className="text-sm text-orange-600 font-medium">内存</div>
          </div>
          <div className="text-3xl font-bold text-orange-700 mb-2">{metrics.jsHeapSize.toFixed(1)}MB</div>
          <div className="text-sm text-orange-600">JS堆内存</div>
          <div className="mt-2 text-xs text-orange-500">
            {metrics.jsHeapSize > 40 ? "⚠️ 内存较高" : "✅ 正常范围"}
          </div>
        </div>
      </div>

      {/* 资源加载分析 */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6">📊 资源加载分析</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">资源</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">类型</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">加载时间</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">大小</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resources.slice(0, 10).map((resource, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getResourceTypeIcon(resource.type)}</span>
                      <span className="font-mono text-xs text-gray-600 truncate max-w-xs">
                        {resource.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {resource.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${
                        resource.duration > 1000 ? 'text-red-600' :
                        resource.duration > 500 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {resource.duration.toFixed(0)}ms
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            resource.duration > 1000 ? 'bg-red-500' :
                            resource.duration > 500 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(resource.duration / 2000 * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatFileSize(resource.size * 1024)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      resource.duration > 1000 ? 'bg-red-100 text-red-700' :
                      resource.duration > 500 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {resource.duration > 1000 ? '慢' : resource.duration > 500 ? '中等' : '快'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 性能优化建议 */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
        <h3 className="text-xl font-bold text-indigo-800 mb-4">💡 性能优化建议</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-indigo-700 mb-3">🎯 Core Web Vitals优化</h4>
            <ul className="text-sm text-indigo-700 space-y-2">
              <li>• <strong>LCP优化</strong>: 预加载关键资源、优化图片压缩</li>
              <li>• <strong>FID优化</strong>: 减少JS执行时间、代码分割</li>
              <li>• <strong>CLS优化</strong>: 设置图片尺寸、避免动态插入内容</li>
              <li>• <strong>FCP优化</strong>: 内联关键CSS、减少渲染阻塞</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-700 mb-3">🚀 通用优化策略</h4>
            <ul className="text-sm text-indigo-700 space-y-2">
              <li>• <strong>资源优化</strong>: 压缩、合并、CDN加速</li>
              <li>• <strong>缓存策略</strong>: HTTP缓存、Service Worker</li>
              <li>• <strong>懒加载</strong>: 图片、组件按需加载</li>
              <li>• <strong>预加载</strong>: DNS预解析、资源预取</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
