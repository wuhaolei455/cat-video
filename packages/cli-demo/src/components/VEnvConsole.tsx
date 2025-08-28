import React, { useState, useEffect } from 'react';
import { useEnvironment } from './env-switcher/useEnvironment';
import { useApi } from './env-switcher/ApiManager';

interface VEnvConsoleProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'dark' | 'light';
}

const VEnvConsole: React.FC<VEnvConsoleProps> = ({
  position = 'bottom-right',
  theme = 'dark'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('env');
  const [logs, setLogs] = useState<Array<{type: string, message: string, time: string}>>([]);
  const [networkLogs, setNetworkLogs] = useState<Array<any>>([]);
  
  // 拖拽相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartTime, setDragStartTime] = useState(0);
  const [hasStartedDrag, setHasStartedDrag] = useState(false);
  const [consolePosition, setConsolePosition] = useState(() => {
    // 从localStorage读取保存的位置
    const saved = localStorage.getItem('venvconsole-position');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // 默认位置
    switch (position) {
      case 'bottom-right': return { x: window.innerWidth - 70, y: window.innerHeight - 70 };
      case 'bottom-left': return { x: 20, y: window.innerHeight - 70 };
      case 'top-right': return { x: window.innerWidth - 70, y: 20 };
      case 'top-left': return { x: 20, y: 20 };
      default: return { x: window.innerWidth - 70, y: window.innerHeight - 70 };
    }
  });
  
  const environment = useEnvironment();
  const api = useApi();
  
  // 检查API是否初始化
  const isApiReady = api.isInitialized;

  // 监听环境变化
  useEffect(() => {
    const handleEnvChange = (event: any) => {
      const env = event.detail;
      addLog('info', `🌍 环境已切换到: ${env.displayName || env.name}`);
    };

    window.addEventListener('environmentChanged', handleEnvChange);
    return () => window.removeEventListener('environmentChanged', handleEnvChange);
  }, []);

  // 拖拽事件处理 (支持鼠标和触摸)
  useEffect(() => {
    const getEventPos = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
      }
      return { clientX: e.clientX, clientY: e.clientY };
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      e.preventDefault(); // 防止页面滚动
      const pos = getEventPos(e);
      
      // 检查是否开始拖拽 (移动距离超过5px才算拖拽)
      if (!hasStartedDrag) {
        const moveDistance = Math.sqrt(
          Math.pow(pos.clientX - (consolePosition.x + dragOffset.x), 2) +
          Math.pow(pos.clientY - (consolePosition.y + dragOffset.y), 2)
        );
        
        if (moveDistance > 5) {
          setHasStartedDrag(true);
        } else {
          return; // 移动距离太小，不算拖拽
        }
      }
      
      const newX = pos.clientX - dragOffset.x;
      const newY = pos.clientY - dragOffset.y;
      
      // 边界检查
      const maxX = window.innerWidth - (isOpen ? 360 : 50);
      const maxY = window.innerHeight - (isOpen ? 480 : 50);
      
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      
      setConsolePosition({ x: boundedX, y: boundedY });
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        setHasStartedDrag(false);
        // 保存位置到localStorage
        localStorage.setItem('venvconsole-position', JSON.stringify(consolePosition));
      }
    };

    if (isDragging) {
      // 鼠标事件
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      
      // 触摸事件
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('touchcancel', handleEnd);
      
      // 防止拖拽时选中文本
      document.body.style.userSelect = 'none';
      (document.body.style as any).webkitUserSelect = 'none';
      (document.body.style as any).webkitTouchCallout = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
      
      document.body.style.userSelect = '';
      (document.body.style as any).webkitUserSelect = '';
      (document.body.style as any).webkitTouchCallout = '';
    };
  }, [isDragging, dragOffset, consolePosition, isOpen]);

  // 窗口大小变化时调整位置
  useEffect(() => {
    const handleResize = () => {
      const maxX = window.innerWidth - (isOpen ? 360 : 50);
      const maxY = window.innerHeight - (isOpen ? 480 : 50);
      
      setConsolePosition((prev: { x: number; y: number }) => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY))
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // 点击空白区域关闭面板
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      
      // 检查点击的元素是否在VEnvConsole内部
      const isClickInside = target.closest('[data-venvconsole]');
      
      if (!isClickInside && !isDragging) {
        setIsOpen(false);
      }
    };

    // 延迟添加监听器，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchend', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [isOpen, isDragging]);

  // 监听Console输出
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };

    const interceptConsole = (type: string, originalMethod: any) => {
      return (...args: any[]) => {
        originalMethod.apply(console, args);
        addLog(type, args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
    };

    console.log = interceptConsole('log', originalConsole.log);
    console.warn = interceptConsole('warn', originalConsole.warn);
    console.error = interceptConsole('error', originalConsole.error);
    console.info = interceptConsole('info', originalConsole.info);

    return () => {
      Object.assign(console, originalConsole);
    };
  }, []);

  // 监听网络请求
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      const method = args[1]?.method || 'GET';
      
      try {
        const response = await originalFetch.apply(window, args);
        const endTime = Date.now();
        
        addNetworkLog({
          method,
          url,
          status: response.status,
          statusText: response.statusText,
          time: endTime - startTime,
          timestamp: new Date().toLocaleTimeString()
        });
        
        return response;
      } catch (error) {
        const endTime = Date.now();
        
        addNetworkLog({
          method,
          url,
          status: 0,
          statusText: 'Network Error',
          time: endTime - startTime,
          timestamp: new Date().toLocaleTimeString(),
          error: true
        });
        
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const addLog = (type: string, message: string) => {
    const newLog = {
      type,
      message,
      time: new Date().toLocaleTimeString()
    };
    
    setLogs(prev => [...prev.slice(-99), newLog]); // 保留最后100条
  };

  const addNetworkLog = (log: any) => {
    setNetworkLogs(prev => [...prev.slice(-49), log]); // 保留最后50条
  };

  // 拖拽开始 (支持鼠标和触摸)
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setHasStartedDrag(false);
    setDragStartTime(Date.now());
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    setDragOffset({
      x: clientX - consolePosition.x,
      y: clientY - consolePosition.y
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const clearNetworkLogs = () => {
    setNetworkLogs([]);
  };

  const switchEnvironmentAndLog = async (envName: string) => {
    try {
      addLog('info', `🔄 正在切换到环境: ${envName}`);
      await environment.switchEnvironment(envName, {
        showNotification: true,
        reloadPage: false
      });
      addLog('success', `✅ 环境切换成功: ${envName}`);
    } catch (error) {
      addLog('error', `❌ 环境切换失败: ${error}`);
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return '#f44336';
      case 'warn': return '#ff9800';
      case 'info': return '#2196f3';
      case 'success': return '#4caf50';
      default: return '#333';
    }
  };

  const getPositionStyles = () => {
    return {
      position: 'fixed' as const,
      left: `${consolePosition.x}px`,
      top: `${consolePosition.y}px`,
      zIndex: 9999,
      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
      fontSize: '12px',
      cursor: isDragging ? 'grabbing' : 'grab'
    };
  };

  const themeStyles = {
    background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#333333',
    border: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`
  };

  if (!isOpen) {
    return (
      <div
        data-venvconsole="button"
        style={{
          ...getPositionStyles(),
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: environment.current.vconsole ? '#4CAF50' : '#666',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          transition: isDragging ? 'none' : 'all 0.3s ease',
          transform: isDragging ? 'scale(1.05)' : 'scale(1)',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          touchAction: 'none' // 防止触摸时的默认行为
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={(e) => {
          e.stopPropagation(); // 防止事件冒泡
          // 只有在没有真正拖拽时才打开面板
          const clickTime = Date.now() - dragStartTime;
          if (!hasStartedDrag && clickTime < 300) {
            setIsOpen(true);
          }
        }}
        title="VEnv Console - 虚环境管理面板 (可拖拽)"
      >
        🌍
      </div>
    );
  }

  return (
    <div style={getPositionStyles()}>
      <div
        data-venvconsole="panel"
        style={{
          width: '360px',
          height: '480px',
          ...themeStyles,
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()} // 防止面板内点击触发关闭
      >
        {/* 头部 - 可拖拽 */}
        <div 
          style={{
            padding: '12px 16px',
            background: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
            borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            touchAction: 'none'
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌍</span>
            <span style={{ fontWeight: 'bold' }}>VEnv Console</span>
            <span style={{ 
              fontSize: '10px', 
              padding: '2px 6px', 
              borderRadius: '10px',
              background: environment.current.vconsole ? '#4CAF50' : '#666',
              color: 'white'
            }}>
              {environment.current.name}
            </span>
            <span style={{ 
              fontSize: '8px', 
              color: '#666',
              marginLeft: '4px'
            }}>
              (可拖拽)
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // 防止触发拖拽
              setIsOpen(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: theme === 'dark' ? '#fff' : '#333',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* 标签栏 */}
        <div style={{
          display: 'flex',
          background: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
          borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`
        }}>
          {[
            { id: 'env', label: '🌍 环境', icon: '🌍' },
            { id: 'console', label: '📝 日志', icon: '📝' },
            { id: 'network', label: '🌐 网络', icon: '🌐' },
            { id: 'storage', label: '💾 存储', icon: '💾' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '8px 4px',
                background: activeTab === tab.id ? 
                  (theme === 'dark' ? '#404040' : '#e3f2fd') : 'transparent',
                border: 'none',
                color: theme === 'dark' ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '10px',
                textAlign: 'center'
              }}
            >
              <div>{tab.icon}</div>
              <div style={{ marginTop: '2px' }}>{tab.label.split(' ')[1]}</div>
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 环境管理面板 */}
          {activeTab === 'env' && (
            <div style={{ padding: '12px', overflow: 'auto' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>当前环境:</strong>
                <div style={{
                  marginTop: '6px',
                  padding: '8px',
                  background: theme === 'dark' ? '#333' : '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  <div>名称: {environment.current.name}</div>
                  <div>API: {environment.current.apiUrl}</div>
                  <div>VConsole: {environment.current.vconsole ? '✅' : '❌'}</div>
                  <div>API状态: {isApiReady ? '✅ 已初始化' : '❌ 未初始化'}</div>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>快速切换:</strong>
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {environment.available.map(env => (
                    <button
                      key={env.name}
                      onClick={() => switchEnvironmentAndLog(env.name)}
                      disabled={env.name === environment.current.name}
                      style={{
                        padding: '6px 8px',
                        background: env.name === environment.current.name ? 
                          '#4CAF50' : (theme === 'dark' ? '#404040' : '#f0f0f0'),
                        color: env.name === environment.current.name ? 
                          'white' : (theme === 'dark' ? '#fff' : '#333'),
                        border: 'none',
                        borderRadius: '3px',
                        cursor: env.name === environment.current.name ? 'not-allowed' : 'pointer',
                        fontSize: '11px',
                        textAlign: 'left',
                        opacity: env.name === environment.current.name ? 0.7 : 1
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{env.displayName || env.name}</span>
                        {env.vconsole && <span>🔍</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Console日志面板 */}
          {activeTab === 'console' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                padding: '8px 12px',
                background: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
                borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Console ({logs.length})
                </span>
                <button
                  onClick={clearLogs}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme === 'dark' ? '#fff' : '#333',
                    cursor: 'pointer',
                    fontSize: '10px',
                    padding: '2px 6px'
                  }}
                >
                  清空
                </button>
              </div>
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '8px',
                fontSize: '10px',
                lineHeight: '1.4'
              }}>
                {logs.length === 0 ? (
                  <div style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>
                    暂无日志
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: '4px',
                        padding: '4px',
                        borderLeft: `3px solid ${getLogColor(log.type)}`,
                        paddingLeft: '8px',
                        background: theme === 'dark' ? '#262626' : '#f8f9fa'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ color: getLogColor(log.type), fontWeight: 'bold' }}>
                          {log.type.toUpperCase()}
                        </span>
                        <span style={{ color: '#666', fontSize: '9px' }}>
                          {log.time}
                        </span>
                      </div>
                      <div style={{ wordBreak: 'break-word' }}>
                        {log.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 网络请求面板 */}
          {activeTab === 'network' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                padding: '8px 12px',
                background: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
                borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
                  Network ({networkLogs.length})
                </span>
                <button
                  onClick={clearNetworkLogs}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme === 'dark' ? '#fff' : '#333',
                    cursor: 'pointer',
                    fontSize: '10px',
                    padding: '2px 6px'
                  }}
                >
                  清空
                </button>
              </div>
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '8px',
                fontSize: '10px'
              }}>
                {networkLogs.length === 0 ? (
                  <div style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>
                    暂无网络请求
                  </div>
                ) : (
                  networkLogs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: '6px',
                        padding: '6px',
                        background: theme === 'dark' ? '#262626' : '#f8f9fa',
                        borderRadius: '3px',
                        borderLeft: `3px solid ${log.error ? '#f44336' : 
                          log.status >= 200 && log.status < 300 ? '#4caf50' : '#ff9800'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 'bold' }}>
                          {log.method}
                        </span>
                        <span style={{ color: '#666' }}>
                          {log.time}ms
                        </span>
                      </div>
                      <div style={{ 
                        marginBottom: '2px', 
                        wordBreak: 'break-all',
                        color: theme === 'dark' ? '#ccc' : '#555'
                      }}>
                        {log.url}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{
                          color: log.error ? '#f44336' : 
                            log.status >= 200 && log.status < 300 ? '#4caf50' : '#ff9800'
                        }}>
                          {log.status} {log.statusText}
                        </span>
                        <span style={{ color: '#666', fontSize: '9px' }}>
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 存储管理面板 */}
          {activeTab === 'storage' && (
            <div style={{ padding: '12px', overflow: 'auto' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong>LocalStorage:</strong>
                <div style={{
                  marginTop: '6px',
                  padding: '8px',
                  background: theme === 'dark' ? '#333' : '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '10px',
                  maxHeight: '120px',
                  overflow: 'auto'
                }}>
                  {Object.keys(localStorage).length === 0 ? (
                    <div style={{ color: '#666' }}>空</div>
                  ) : (
                    Object.keys(localStorage).map(key => (
                      <div key={key} style={{ marginBottom: '4px' }}>
                        <strong>{key}:</strong> {localStorage.getItem(key)}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <strong>SessionStorage:</strong>
                <div style={{
                  marginTop: '6px',
                  padding: '8px',
                  background: theme === 'dark' ? '#333' : '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '10px',
                  maxHeight: '120px',
                  overflow: 'auto'
                }}>
                  {Object.keys(sessionStorage).length === 0 ? (
                    <div style={{ color: '#666' }}>空</div>
                  ) : (
                    Object.keys(sessionStorage).map(key => (
                      <div key={key} style={{ marginBottom: '4px' }}>
                        <strong>{key}:</strong> {sessionStorage.getItem(key)}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    localStorage.clear();
                    addLog('info', '🗑️ LocalStorage已清空');
                  }}
                  style={{
                    padding: '4px 8px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  清空LS
                </button>
                <button
                  onClick={() => {
                    sessionStorage.clear();
                    addLog('info', '🗑️ SessionStorage已清空');
                  }}
                  style={{
                    padding: '4px 8px',
                    background: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  清空SS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VEnvConsole;
