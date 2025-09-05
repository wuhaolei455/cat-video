"use client";
import React, { useState, useEffect } from "react";

interface MonitoringData {
  errors: any[];
  performance: any;
  whiteScreen: boolean;
  apiErrors: any[];
}

interface MonitoringDashboardProps {
  data: MonitoringData;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ data }) => {
  const [metrics, setMetrics] = useState({
    totalErrors: 0,
    whiteScreenEvents: 0,
    apiErrorRate: 0,
    averageLoadTime: 0,
    userSessions: 0,
    errorTrend: "stable"
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "warning",
      title: "API错误率上升",
      description: "过去1小时内API错误率达到5.2%，建议检查服务状态",
      timestamp: new Date(),
      severity: "medium"
    },
    {
      id: 2,
      type: "info",
      title: "性能优化建议",
      description: "检测到首屏加载时间较长，建议启用图片懒加载",
      timestamp: new Date(),
      severity: "low"
    }
  ]);

  useEffect(() => {
    // 模拟实时数据更新
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalErrors: Math.floor(Math.random() * 50) + 10,
        whiteScreenEvents: Math.floor(Math.random() * 5),
        apiErrorRate: Math.random() * 10,
        averageLoadTime: Math.random() * 2000 + 500,
        userSessions: Math.floor(Math.random() * 1000) + 500
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "error": return "🚨";
      case "warning": return "⚠️";
      case "info": return "ℹ️";
      default: return "📋";
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">📊 监控概览</h2>
        <p className="text-gray-600">实时监控前端应用的健康状态和性能指标</p>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">❌</div>
            <div className="text-sm text-red-600 font-medium">错误监控</div>
          </div>
          <div className="text-3xl font-bold text-red-700 mb-2">{metrics.totalErrors}</div>
          <div className="text-sm text-red-600">总错误数</div>
          <div className="mt-2 text-xs text-red-500">
            过去24小时: +{Math.floor(metrics.totalErrors * 0.1)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">⚪</div>
            <div className="text-sm text-orange-600 font-medium">白屏监控</div>
          </div>
          <div className="text-3xl font-bold text-orange-700 mb-2">{metrics.whiteScreenEvents}</div>
          <div className="text-sm text-orange-600">白屏事件</div>
          <div className="mt-2 text-xs text-orange-500">
            影响用户: ~{metrics.whiteScreenEvents * 23}
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">🔌</div>
            <div className="text-sm text-yellow-600 font-medium">API监控</div>
          </div>
          <div className="text-3xl font-bold text-yellow-700 mb-2">{metrics.apiErrorRate.toFixed(1)}%</div>
          <div className="text-sm text-yellow-600">接口错误率</div>
          <div className="mt-2 text-xs text-yellow-500">
            {metrics.apiErrorRate > 5 ? "⚠️ 超出阈值" : "✅ 正常范围"}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">⚡</div>
            <div className="text-sm text-green-600 font-medium">性能监控</div>
          </div>
          <div className="text-3xl font-bold text-green-700 mb-2">{metrics.averageLoadTime.toFixed(0)}ms</div>
          <div className="text-sm text-green-600">平均加载时间</div>
          <div className="mt-2 text-xs text-green-500">
            {metrics.averageLoadTime < 1000 ? "🚀 性能良好" : "⚠️ 需要优化"}
          </div>
        </div>
      </div>

      {/* 实时告警面板 */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">🚨 实时告警</h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              活跃会话: <span className="font-semibold text-blue-600">{metrics.userSessions}</span>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-xl">{getTypeIcon(alert.type)}</div>
                  <div>
                    <h4 className="font-semibold mb-1">{alert.title}</h4>
                    <p className="text-sm opacity-80">{alert.description}</p>
                    <div className="text-xs opacity-60 mt-2">
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <button className="text-xs px-3 py-1 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 transition-all">
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 监控策略说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-xl font-bold text-blue-800 mb-4">🔍 监控策略概览</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-700 mb-3">🎯 核心监控指标</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• <strong>白屏检测</strong>: DOM渲染异常、CSS加载失败</li>
              <li>• <strong>JS错误</strong>: 运行时错误、未捕获异常</li>
              <li>• <strong>资源错误</strong>: 图片、CSS、JS加载失败</li>
              <li>• <strong>接口监控</strong>: API响应时间、错误率</li>
              <li>• <strong>性能指标</strong>: FCP、LCP、FID、CLS</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-3">🚀 监控实现方案</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• <strong>自动上报</strong>: 错误自动捕获和上报</li>
              <li>• <strong>实时告警</strong>: 异常情况即时通知</li>
              <li>• <strong>用户行为</strong>: 操作路径和异常场景</li>
              <li>• <strong>性能分析</strong>: 加载时间和资源优化</li>
              <li>• <strong>趋势分析</strong>: 历史数据对比和预测</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
