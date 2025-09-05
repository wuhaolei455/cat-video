"use client";
import React, { useState, useEffect } from "react";

interface ErrorEvent {
  id: string;
  timestamp: Date;
  type: "javascript" | "resource" | "api" | "unhandled";
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  userAgent: string;
  userId?: string;
  sessionId: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  count: number;
}

export const ErrorTracker: React.FC = () => {
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [isTracking, setIsTracking] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [selectedError, setSelectedError] = useState<ErrorEvent | null>(null);

  // 模拟错误数据
  const generateMockError = (): ErrorEvent => {
    const types: ErrorEvent["type"][] = ["javascript", "resource", "api", "unhandled"];
    const severities: ErrorEvent["severity"][] = ["low", "medium", "high", "critical"];
    const messages = [
      "Cannot read property 'length' of undefined",
      "Failed to load resource: net::ERR_NETWORK_CHANGED",
      "API request timeout: /api/user/profile",
      "Uncaught TypeError: Cannot read property 'map' of null",
      "Failed to fetch: TypeError: NetworkError when attempting to fetch resource",
      "Script error: Unexpected token < in JSON at position 0",
      "Resource loading error: 404 Not Found",
      "Promise rejection: Authentication failed"
    ];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000), // 过去24小时内
      type,
      message,
      stack: type === "javascript" ? `Error: ${message}\n    at Component.render (App.tsx:42:15)\n    at ReactDOM.render (react-dom.js:123:8)` : undefined,
      url: `https://example.com${type === "api" ? "/api/endpoint" : "/page"}`,
      line: type === "javascript" ? Math.floor(Math.random() * 100) + 1 : undefined,
      column: type === "javascript" ? Math.floor(Math.random() * 50) + 1 : undefined,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      userId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
      sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      resolved: Math.random() > 0.7,
      count: Math.floor(Math.random() * 10) + 1
    };
  };

  // 初始化错误数据
  useEffect(() => {
    const initialErrors = Array.from({ length: 15 }, generateMockError);
    setErrors(initialErrors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }, []);

  // 模拟实时错误追踪
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30%概率产生新错误
        const newError = generateMockError();
        setErrors(prev => [newError, ...prev.slice(0, 49)]); // 保留最新50个错误
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const filteredErrors = errors.filter(error => {
    if (filterType !== "all" && error.type !== filterType) return false;
    if (filterSeverity !== "all" && error.severity !== filterSeverity) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-800 bg-red-100 border-red-300";
      case "high": return "text-orange-800 bg-orange-100 border-orange-300";
      case "medium": return "text-yellow-800 bg-yellow-100 border-yellow-300";
      case "low": return "text-blue-800 bg-blue-100 border-blue-300";
      default: return "text-gray-800 bg-gray-100 border-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "javascript": return "⚙️";
      case "resource": return "📦";
      case "api": return "🔌";
      case "unhandled": return "❓";
      default: return "❌";
    }
  };

  const resolveError = (errorId: string) => {
    setErrors(prev => 
      prev.map(error => 
        error.id === errorId ? { ...error, resolved: true } : error
      )
    );
  };

  const getErrorStats = () => {
    const total = errors.length;
    const resolved = errors.filter(e => e.resolved).length;
    const critical = errors.filter(e => e.severity === "critical" && !e.resolved).length;
    const lastHour = errors.filter(e => 
      Date.now() - e.timestamp.getTime() < 3600000 && !e.resolved
    ).length;

    return { total, resolved, critical, lastHour };
  };

  const stats = getErrorStats();

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">❌ 错误监控系统</h2>
        <p className="text-gray-600">实时追踪和分析前端错误，提供详细的错误信息和解决方案</p>
      </div>

      {/* 错误统计面板 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">📊</div>
            <div className="text-sm text-blue-600 font-medium">总错误数</div>
          </div>
          <div className="text-3xl font-bold text-blue-700 mb-2">{stats.total}</div>
          <div className="text-sm text-blue-600">已解决: {stats.resolved}</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">🚨</div>
            <div className="text-sm text-red-600 font-medium">严重错误</div>
          </div>
          <div className="text-3xl font-bold text-red-700 mb-2">{stats.critical}</div>
          <div className="text-sm text-red-600">需要立即处理</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">⏰</div>
            <div className="text-sm text-orange-600 font-medium">近1小时</div>
          </div>
          <div className="text-3xl font-bold text-orange-700 mb-2">{stats.lastHour}</div>
          <div className="text-sm text-orange-600">新增错误</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">📈</div>
            <div className="text-sm text-green-600 font-medium">监控状态</div>
          </div>
          <div className={`text-xl font-bold mb-2 ${isTracking ? 'text-green-700' : 'text-gray-700'}`}>
            {isTracking ? '运行中' : '已停止'}
          </div>
          <button
            onClick={() => setIsTracking(!isTracking)}
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              isTracking 
                ? 'bg-red-200 text-red-700 hover:bg-red-300' 
                : 'bg-green-200 text-green-700 hover:bg-green-300'
            }`}
          >
            {isTracking ? '停止' : '启动'}
          </button>
        </div>
      </div>

      {/* 过滤器 */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">🔍 错误过滤</h3>
          <div className="text-sm text-gray-500">
            显示 {filteredErrors.length} / {errors.length} 个错误
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">错误类型</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部类型</option>
              <option value="javascript">JavaScript错误</option>
              <option value="resource">资源错误</option>
              <option value="api">API错误</option>
              <option value="unhandled">未处理错误</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">严重程度</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全部等级</option>
              <option value="critical">严重</option>
              <option value="high">高</option>
              <option value="medium">中等</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>
      </div>

      {/* 错误列表 */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">📋 错误事件列表</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredErrors.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h4 className="text-xl font-semibold text-gray-700 mb-2">暂无匹配的错误</h4>
              <p className="text-gray-500">调整过滤条件或等待新的错误事件</p>
            </div>
          ) : (
            filteredErrors.map((error) => (
              <div
                key={error.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${error.resolved ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-2xl">{getTypeIcon(error.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900 truncate">{error.message}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(error.severity)}`}>
                          {error.severity}
                        </span>
                        {error.count > 1 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            {error.count}次
                          </span>
                        )}
                        {error.resolved && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            已解决
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>URL: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{error.url}</code></div>
                        {error.line && error.column && (
                          <div>位置: 第{error.line}行，第{error.column}列</div>
                        )}
                        <div>时间: {error.timestamp.toLocaleString()}</div>
                        {error.userId && <div>用户: {error.userId}</div>}
                        <div>会话: {error.sessionId}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedError(error)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      详情
                    </button>
                    {!error.resolved && (
                      <button
                        onClick={() => resolveError(error.id)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        解决
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 错误详情弹窗 */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">🔍 错误详情</h3>
              <button
                onClick={() => setSelectedError(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">错误信息</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm text-red-600">{selectedError.message}</code>
                </div>
              </div>

              {selectedError.stack && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">堆栈跟踪</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm whitespace-pre-wrap">{selectedError.stack}</pre>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">基本信息</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>类型:</strong> {selectedError.type}</div>
                    <div><strong>严重程度:</strong> {selectedError.severity}</div>
                    <div><strong>发生时间:</strong> {selectedError.timestamp.toLocaleString()}</div>
                    <div><strong>发生次数:</strong> {selectedError.count}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">环境信息</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>URL:</strong> {selectedError.url}</div>
                    {selectedError.line && <div><strong>行号:</strong> {selectedError.line}</div>}
                    {selectedError.column && <div><strong>列号:</strong> {selectedError.column}</div>}
                    <div><strong>用户代理:</strong> {selectedError.userAgent}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 错误监控原理说明 */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
        <h3 className="text-xl font-bold text-red-800 mb-4">🔬 错误监控原理</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-red-700 mb-3">🎯 监控范围</h4>
            <ul className="text-sm text-red-700 space-y-2">
              <li>• <strong>JavaScript错误</strong>: 运行时异常、语法错误</li>
              <li>• <strong>资源加载错误</strong>: 图片、CSS、JS文件加载失败</li>
              <li>• <strong>API接口错误</strong>: 网络请求失败、超时</li>
              <li>• <strong>Promise拒绝</strong>: 未捕获的Promise异常</li>
              <li>• <strong>跨域错误</strong>: CORS相关问题</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-700 mb-3">🚀 实现方案</h4>
            <ul className="text-sm text-red-700 space-y-2">
              <li>• <strong>window.onerror</strong>: 捕获JS运行时错误</li>
              <li>• <strong>unhandledrejection</strong>: 捕获Promise异常</li>
              <li>• <strong>资源监听</strong>: addEventListener('error')</li>
              <li>• <strong>异常上报</strong>: 自动收集并上报错误信息</li>
              <li>• <strong>错误聚合</strong>: 相同错误合并统计</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
