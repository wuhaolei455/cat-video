"use client";
import React, { useState, useRef } from "react";

interface DemoScenario {
  id: string;
  name: string;
  description: string;
  type: "whitescreen" | "error" | "performance";
  icon: string;
  severity: "low" | "medium" | "high";
  implementation: () => void;
}

export const DemoScenarios: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [scenarioResults, setScenarioResults] = useState<{[key: string]: any}>({});
  const [isRunning, setIsRunning] = useState(false);
  const testContainerRef = useRef<HTMLDivElement>(null);

  // 定义演示场景
  const scenarios: DemoScenario[] = [
    {
      id: "dom-block",
      name: "DOM渲染阻塞",
      description: "模拟JavaScript阻塞DOM渲染导致的白屏问题",
      type: "whitescreen",
      icon: "🏗️",
      severity: "high",
      implementation: () => {
        // 模拟长时间的同步操作阻塞渲染
        const startTime = Date.now();
        while (Date.now() - startTime < 3000) {
          // 阻塞主线程3秒
        }
        setScenarioResults(prev => ({
          ...prev,
          "dom-block": {
            duration: 3000,
            impact: "页面完全无响应3秒",
            detected: true
          }
        }));
      }
    },
    {
      id: "css-fail",
      name: "CSS加载失败",
      description: "模拟关键CSS文件加载失败导致的样式丢失",
      type: "whitescreen",
      icon: "🎨",
      severity: "high",
      implementation: () => {
        // 动态添加一个不存在的CSS文件
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/nonexistent-critical-styles.css';
        link.onerror = () => {
          setScenarioResults(prev => ({
            ...prev,
            "css-fail": {
              error: "CSS加载失败",
              impact: "页面样式丢失",
              detected: true,
              url: link.href
            }
          }));
        };
        document.head.appendChild(link);
      }
    },
    {
      id: "js-error",
      name: "JavaScript运行时错误",
      description: "触发未捕获的JavaScript异常",
      type: "error",
      icon: "⚙️",
      severity: "medium",
      implementation: () => {
        try {
          // 故意触发一个运行时错误
          (window as any).undefinedFunction();
        } catch (error) {
          setScenarioResults(prev => ({
            ...prev,
            "js-error": {
              error: error instanceof Error ? error.message : "Unknown error",
              stack: error instanceof Error ? error.stack : "",
              detected: true,
              type: "TypeError"
            }
          }));
          // 重新抛出错误以便全局错误处理器捕获
          setTimeout(() => {
            throw error;
          }, 0);
        }
      }
    },
    {
      id: "memory-leak",
      name: "内存泄漏模拟",
      description: "创建大量对象模拟内存泄漏问题",
      type: "performance",
      icon: "🧠",
      severity: "medium",
      implementation: () => {
        const leakedObjects: any[] = [];
        const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
        
        // 创建大量对象
        for (let i = 0; i < 100000; i++) {
          leakedObjects.push({
            id: i,
            data: new Array(1000).fill(`leaked-data-${i}`),
            timestamp: new Date(),
            references: new Array(100).fill(null).map((_, j) => ({
              ref: j,
              circular: leakedObjects
            }))
          });
        }
        
        const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
        setScenarioResults(prev => ({
          ...prev,
          "memory-leak": {
            objectsCreated: 100000,
            memoryIncrease: endMemory - startMemory,
            detected: true,
            impact: "内存使用量显著增加"
          }
        }));
      }
    },
    {
      id: "api-timeout",
      name: "API请求超时",
      description: "模拟API请求超时和网络错误",
      type: "error",
      icon: "🔌",
      severity: "medium",
      implementation: () => {
        // 模拟一个会超时的API请求
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        
        fetch('https://httpstat.us/408', {
          signal: controller.signal,
          method: 'GET'
        }).then(response => {
          clearTimeout(timeoutId);
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }
          return response.json();
        }).catch(error => {
          setScenarioResults(prev => ({
            ...prev,
            "api-timeout": {
              error: error.message,
              type: "NetworkError",
              url: "https://httpstat.us/408",
              detected: true,
              duration: 1000
            }
          }));
        });
      }
    },
    {
      id: "infinite-loop",
      name: "无限循环",
      description: "创建无限循环导致页面卡死",
      type: "performance",
      icon: "🔄",
      severity: "high",
      implementation: () => {
        const startTime = Date.now();
        let iterations = 0;
        
        // 使用setTimeout避免完全阻塞浏览器
        const runLoop = () => {
          const loopStart = Date.now();
          while (Date.now() - loopStart < 100) {
            iterations++;
            // 模拟复杂计算
            Math.random() * Math.random();
          }
          
          if (Date.now() - startTime < 5000) {
            setTimeout(runLoop, 0);
          } else {
            setScenarioResults(prev => ({
              ...prev,
              "infinite-loop": {
                iterations,
                duration: Date.now() - startTime,
                detected: true,
                impact: "CPU使用率100%，页面响应缓慢"
              }
            }));
          }
        };
        
        runLoop();
      }
    },
    {
      id: "layout-thrashing",
      name: "布局抖动",
      description: "频繁的DOM操作导致布局重排",
      type: "performance",
      icon: "📐",
      severity: "medium",
      implementation: () => {
        const container = testContainerRef.current;
        if (!container) return;
        
        const startTime = performance.now();
        let operations = 0;
        
        // 创建测试元素
        for (let i = 0; i < 100; i++) {
          const div = document.createElement('div');
          div.style.width = '100px';
          div.style.height = '20px';
          div.style.backgroundColor = `hsl(${i * 3.6}, 70%, 50%)`;
          div.style.margin = '2px';
          div.style.display = 'inline-block';
          div.textContent = `Box ${i}`;
          container.appendChild(div);
          
          // 强制重排
          div.offsetHeight;
          operations++;
          
          // 修改样式触发重排
          div.style.width = `${100 + Math.random() * 50}px`;
          div.offsetHeight;
          operations++;
        }
        
        const endTime = performance.now();
        setScenarioResults(prev => ({
          ...prev,
          "layout-thrashing": {
            operations,
            duration: endTime - startTime,
            detected: true,
            impact: "频繁的布局重排影响渲染性能"
          }
        }));
      }
    },
    {
      id: "resource-404",
      name: "资源加载404",
      description: "尝试加载不存在的资源文件",
      type: "error",
      icon: "📦",
      severity: "low",
      implementation: () => {
        // 尝试加载不存在的图片
        const img = new Image();
        img.onerror = () => {
          setScenarioResults(prev => ({
            ...prev,
            "resource-404": {
              error: "Resource not found",
              type: "ResourceError",
              url: img.src,
              detected: true,
              resourceType: "image"
            }
          }));
        };
        img.src = '/nonexistent-image-' + Date.now() + '.jpg';
      }
    }
  ];

  const runScenario = async (scenario: DemoScenario) => {
    setIsRunning(true);
    setActiveScenario(scenario.id);
    
    try {
      await new Promise(resolve => {
        scenario.implementation();
        setTimeout(resolve, 1000); // 等待1秒观察效果
      });
    } catch (error) {
      console.error('Scenario execution error:', error);
    } finally {
      setIsRunning(false);
      setTimeout(() => setActiveScenario(null), 3000); // 3秒后清除活跃状态
    }
  };

  const clearResults = () => {
    setScenarioResults({});
    setActiveScenario(null);
    // 清理测试容器
    if (testContainerRef.current) {
      testContainerRef.current.innerHTML = '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "border-red-300 bg-red-50 text-red-800";
      case "medium": return "border-yellow-300 bg-yellow-50 text-yellow-800";
      case "low": return "border-blue-300 bg-blue-50 text-blue-800";
      default: return "border-gray-300 bg-gray-50 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "whitescreen": return "bg-red-100 text-red-700";
      case "error": return "bg-orange-100 text-orange-700";
      case "performance": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">🎭 监控演示场景</h2>
        <p className="text-gray-600">模拟各种前端问题场景，测试监控系统的检测能力</p>
      </div>

      {/* 控制面板 */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">🎮 演示控制</h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              已执行: <span className="font-semibold text-blue-600">{Object.keys(scenarioResults).length}</span> 个场景
            </div>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              disabled={isRunning}
            >
              清除结果
            </button>
          </div>
        </div>

        {isRunning && activeScenario && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <div className="font-semibold text-blue-800">正在执行演示场景</div>
                <div className="text-sm text-blue-600">
                  {scenarios.find(s => s.id === activeScenario)?.name}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 场景网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`p-6 rounded-xl border-2 transition-all duration-200 ${
              activeScenario === scenario.id 
                ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                : getSeverityColor(scenario.severity)
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{scenario.icon}</div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(scenario.type)}`}>
                  {scenario.type === "whitescreen" ? "白屏" : 
                   scenario.type === "error" ? "错误" : "性能"}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  scenario.severity === "high" ? "bg-red-100 text-red-700" :
                  scenario.severity === "medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {scenario.severity === "high" ? "高风险" :
                   scenario.severity === "medium" ? "中风险" : "低风险"}
                </span>
              </div>
            </div>

            <h4 className="font-bold text-gray-800 mb-2">{scenario.name}</h4>
            <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>

            <button
              onClick={() => runScenario(scenario)}
              disabled={isRunning}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : activeScenario === scenario.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {activeScenario === scenario.id ? '执行中...' : '运行演示'}
            </button>

            {/* 显示结果 */}
            {scenarioResults[scenario.id] && (
              <div className="mt-4 p-3 bg-white bg-opacity-70 rounded-lg border">
                <div className="text-xs font-semibold text-green-600 mb-2">✅ 检测结果</div>
                <div className="text-xs text-gray-700 space-y-1">
                  {Object.entries(scenarioResults[scenario.id]).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 测试容器 */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🧪 测试容器</h3>
        <div 
          ref={testContainerRef}
          className="min-h-32 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300"
        >
          <div className="text-center text-gray-500 text-sm">
            某些演示场景会在此区域显示效果
          </div>
        </div>
      </div>

      {/* 结果汇总 */}
      {Object.keys(scenarioResults).length > 0 && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 执行结果汇总</h3>
          <div className="space-y-4">
            {Object.entries(scenarioResults).map(([scenarioId, result]) => {
              const scenario = scenarios.find(s => s.id === scenarioId);
              return (
                <div key={scenarioId} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xl">{scenario?.icon}</span>
                    <span className="font-semibold text-gray-800">{scenario?.name}</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      已检测
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(result).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
        <h3 className="text-xl font-bold text-purple-800 mb-4">📖 使用说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-purple-700 mb-3">🎯 演示目的</h4>
            <ul className="text-sm text-purple-700 space-y-2">
              <li>• <strong>白屏场景</strong>: 测试白屏检测系统的灵敏度</li>
              <li>• <strong>错误场景</strong>: 验证错误捕获和上报机制</li>
              <li>• <strong>性能场景</strong>: 观察性能监控指标变化</li>
              <li>• <strong>综合测试</strong>: 评估监控系统整体效果</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-700 mb-3">⚠️ 注意事项</h4>
            <ul className="text-sm text-purple-700 space-y-2">
              <li>• 某些场景可能会影响页面性能</li>
              <li>• 建议在开发环境中进行测试</li>
              <li>• 执行后请及时清除结果</li>
              <li>• 观察浏览器开发者工具中的错误信息</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
