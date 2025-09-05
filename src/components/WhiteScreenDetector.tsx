"use client";
import React, { useState, useEffect, useRef } from "react";

interface WhiteScreenEvent {
  id: string;
  timestamp: Date;
  type: "dom" | "css" | "js" | "resource";
  description: string;
  url?: string;
  severity: "high" | "medium" | "low";
  resolved: boolean;
}

export const WhiteScreenDetector: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [whiteScreenEvents, setWhiteScreenEvents] = useState<WhiteScreenEvent[]>([]);
  const [detectionConfig, setDetectionConfig] = useState({
    checkInterval: 1000,
    domThreshold: 5000,
    cssLoadTimeout: 8000,
    enableAutoRecovery: true,
    pixelSampling: true
  });
  const [demoMode, setDemoMode] = useState(false);
  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 模拟白屏检测逻辑
  const simulateWhiteScreenDetection = () => {
    const scenarios = [
      {
        type: "dom" as const,
        description: "DOM渲染超时 - 页面5秒内未渲染任何可见内容",
        severity: "high" as const,
        probability: 0.1
      },
      {
        type: "css" as const,
        description: "CSS加载失败 - 关键样式文件加载超时",
        severity: "high" as const,
        probability: 0.15
      },
      {
        type: "js" as const,
        description: "JS执行错误 - 渲染相关脚本执行异常",
        severity: "medium" as const,
        probability: 0.2
      },
      {
        type: "resource" as const,
        description: "关键资源缺失 - 必要的图片或字体文件加载失败",
        severity: "medium" as const,
        probability: 0.1
      }
    ];

    scenarios.forEach(scenario => {
      if (Math.random() < scenario.probability) {
        const event: WhiteScreenEvent = {
          id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          type: scenario.type,
          description: scenario.description,
          severity: scenario.severity,
          resolved: Math.random() > 0.7,
          url: scenario.type === "resource" ? "https://example.com/critical-resource.css" : undefined
        };
        
        setWhiteScreenEvents(prev => [event, ...prev.slice(0, 9)]);
      }
    });
  };

  useEffect(() => {
    if (isMonitoring) {
      monitorIntervalRef.current = setInterval(() => {
        if (demoMode) {
          simulateWhiteScreenDetection();
        }
        // 这里可以添加真实的白屏检测逻辑
      }, detectionConfig.checkInterval);
    }

    return () => {
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
      }
    };
  }, [isMonitoring, demoMode, detectionConfig.checkInterval]);

  const triggerDemoWhiteScreen = (type: WhiteScreenEvent["type"]) => {
    const descriptions = {
      dom: "手动触发 - DOM渲染阻塞模拟",
      css: "手动触发 - CSS加载失败模拟", 
      js: "手动触发 - JavaScript执行错误模拟",
      resource: "手动触发 - 关键资源加载失败模拟"
    };

    const event: WhiteScreenEvent = {
      id: `demo-${Date.now()}`,
      timestamp: new Date(),
      type,
      description: descriptions[type],
      severity: type === "dom" || type === "css" ? "high" : "medium",
      resolved: false,
      url: type === "resource" ? "https://example.com/demo-resource.css" : undefined
    };

    setWhiteScreenEvents(prev => [event, ...prev]);
  };

  const resolveEvent = (eventId: string) => {
    setWhiteScreenEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, resolved: true } : event
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "border-red-300 bg-red-50 text-red-800";
      case "medium": return "border-yellow-300 bg-yellow-50 text-yellow-800";
      case "low": return "border-blue-300 bg-blue-50 text-blue-800";
      default: return "border-gray-300 bg-gray-50 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "dom": return "🏗️";
      case "css": return "🎨";
      case "js": return "⚙️";
      case "resource": return "📦";
      default: return "❓";
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">⚪ 白屏监控系统</h2>
        <p className="text-gray-600">实时检测和分析前端白屏问题，提供精准的故障定位</p>
      </div>

      {/* 监控状态控制 */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">🔧 监控配置</h3>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              isMonitoring 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              {isMonitoring ? '监控运行中' : '监控已停止'}
            </div>
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isMonitoring
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isMonitoring ? '停止监控' : '开始监控'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              检测间隔 (ms)
            </label>
            <input
              type="number"
              value={detectionConfig.checkInterval}
              onChange={(e) => setDetectionConfig(prev => ({
                ...prev,
                checkInterval: parseInt(e.target.value) || 1000
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="500"
              max="5000"
              step="500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DOM超时阈值 (ms)
            </label>
            <input
              type="number"
              value={detectionConfig.domThreshold}
              onChange={(e) => setDetectionConfig(prev => ({
                ...prev,
                domThreshold: parseInt(e.target.value) || 5000
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1000"
              max="10000"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSS加载超时 (ms)
            </label>
            <input
              type="number"
              value={detectionConfig.cssLoadTimeout}
              onChange={(e) => setDetectionConfig(prev => ({
                ...prev,
                cssLoadTimeout: parseInt(e.target.value) || 8000
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="2000"
              max="15000"
              step="1000"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={detectionConfig.enableAutoRecovery}
              onChange={(e) => setDetectionConfig(prev => ({
                ...prev,
                enableAutoRecovery: e.target.checked
              }))}
              className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">启用自动恢复</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={detectionConfig.pixelSampling}
              onChange={(e) => setDetectionConfig(prev => ({
                ...prev,
                pixelSampling: e.target.checked
              }))}
              className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">像素采样检测</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="mr-2 h-4 w-4 text-purple-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">演示模式</span>
          </label>
        </div>
      </div>

      {/* 演示触发器 */}
      {demoMode && (
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
          <h3 className="text-lg font-bold text-purple-800 mb-4">🎭 白屏场景演示</h3>
          <p className="text-purple-700 mb-4 text-sm">
            点击下方按钮模拟不同类型的白屏问题，观察监控系统的检测和响应
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => triggerDemoWhiteScreen("dom")}
              className="flex flex-col items-center p-4 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
            >
              <div className="text-2xl mb-2">🏗️</div>
              <div className="text-sm font-medium text-purple-700">DOM渲染阻塞</div>
            </button>
            <button
              onClick={() => triggerDemoWhiteScreen("css")}
              className="flex flex-col items-center p-4 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
            >
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-sm font-medium text-purple-700">CSS加载失败</div>
            </button>
            <button
              onClick={() => triggerDemoWhiteScreen("js")}
              className="flex flex-col items-center p-4 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm font-medium text-purple-700">JS执行错误</div>
            </button>
            <button
              onClick={() => triggerDemoWhiteScreen("resource")}
              className="flex flex-col items-center p-4 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
            >
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm font-medium text-purple-700">资源加载失败</div>
            </button>
          </div>
        </div>
      )}

      {/* 白屏事件列表 */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">📋 白屏事件记录</h3>
          <div className="text-sm text-gray-500">
            共检测到 <span className="font-semibold text-red-600">{whiteScreenEvents.length}</span> 个事件
          </div>
        </div>

        {whiteScreenEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h4 className="text-xl font-semibold text-gray-700 mb-2">暂无白屏事件</h4>
            <p className="text-gray-500">
              {demoMode ? "点击上方演示按钮模拟白屏场景" : "监控系统运行正常，未检测到白屏问题"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {whiteScreenEvents.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg border-2 ${getSeverityColor(event.severity)} ${
                  event.resolved ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{getTypeIcon(event.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{event.description}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          event.resolved 
                            ? 'bg-green-100 text-green-700' 
                            : event.severity === 'high' 
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {event.resolved ? '已解决' : event.severity === 'high' ? '严重' : '中等'}
                        </span>
                      </div>
                      {event.url && (
                        <div className="text-sm opacity-75 mb-2">
                          资源URL: <code className="bg-black bg-opacity-10 px-2 py-1 rounded">{event.url}</code>
                        </div>
                      )}
                      <div className="text-xs opacity-60">
                        检测时间: {event.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {!event.resolved && (
                    <button
                      onClick={() => resolveEvent(event.id)}
                      className="px-3 py-1 text-xs bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full transition-all"
                    >
                      标记已解决
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 白屏检测原理说明 */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔬 白屏检测原理</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">📊 检测方法</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>DOM元素检测</strong>: 监控可见DOM元素数量</li>
              <li>• <strong>像素采样</strong>: 检测页面关键区域像素变化</li>
              <li>• <strong>资源监控</strong>: 跟踪CSS、JS等关键资源加载</li>
              <li>• <strong>渲染时间</strong>: 监控首次内容绘制(FCP)时间</li>
              <li>• <strong>异常捕获</strong>: 捕获可能导致白屏的JS错误</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">🚀 优化策略</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>预加载关键资源</strong>: preload关键CSS和JS</li>
              <li>• <strong>错误边界</strong>: React Error Boundary容错</li>
              <li>• <strong>降级方案</strong>: 资源加载失败时的备用方案</li>
              <li>• <strong>懒加载优化</strong>: 避免阻塞关键渲染路径</li>
              <li>• <strong>服务端渲染</strong>: SSR提供首屏内容保障</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
