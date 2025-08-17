'use client';

import { useEffect, useState } from 'react';
import { detectBrowser } from '../utils/BrowserDetection';
import { SafariStyleInjector } from '../utils/SafariStyleInjector';

/**
 * Safari调试面板
 * 仅在开发环境和Safari浏览器中显示
 */
export function SafariDebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<any>(null);
  const [injectorStatus, setInjectorStatus] = useState<any>(null);
  const [cssTestResults, setCssTestResults] = useState<any>(null);

  useEffect(() => {
    // 只在开发环境和Safari中显示
    if (process.env.NODE_ENV !== 'development') return;
    
    const info = detectBrowser();
    setBrowserInfo(info);
    
    if (info.name === 'safari') {
      setIsVisible(true);
      
      // 定期更新状态
      const updateStatus = () => {
        const injector = SafariStyleInjector.getInstance();
        setInjectorStatus(injector.getStatus());
        setCssTestResults(performCSSTests());
      };
      
      updateStatus();
      const interval = setInterval(updateStatus, 2000);
      
      return () => clearInterval(interval);
    }
  }, []);

  /**
   * 执行CSS测试
   */
  const performCSSTests = () => {
    const tests = [
      {
        name: 'Tailwind基础颜色',
        test: () => {
          const div = document.createElement('div');
          div.className = 'bg-blue-500';
          div.style.position = 'absolute';
          div.style.top = '-9999px';
          document.body.appendChild(div);
          
          const bgColor = getComputedStyle(div).backgroundColor;
          document.body.removeChild(div);
          
          return bgColor === 'rgb(59, 130, 246)' || bgColor === 'rgba(59, 130, 246, 1)';
        }
      },
      {
        name: 'Flexbox布局',
        test: () => {
          const div = document.createElement('div');
          div.className = 'flex items-center';
          div.style.position = 'absolute';
          div.style.top = '-9999px';
          document.body.appendChild(div);
          
          const display = getComputedStyle(div).display;
          const alignItems = getComputedStyle(div).alignItems;
          document.body.removeChild(div);
          
          return display === 'flex' && alignItems === 'center';
        }
      },
      {
        name: 'Grid布局',
        test: () => {
          const div = document.createElement('div');
          div.className = 'grid grid-cols-2';
          div.style.position = 'absolute';
          div.style.top = '-9999px';
          document.body.appendChild(div);
          
          const display = getComputedStyle(div).display;
          const gridTemplateColumns = getComputedStyle(div).gridTemplateColumns;
          document.body.removeChild(div);
          
          return display === 'grid' && gridTemplateColumns !== 'none';
        }
      },
      {
        name: '字体渲染',
        test: () => {
          const div = document.createElement('div');
          div.className = 'text-gray-800';
          div.style.position = 'absolute';
          div.style.top = '-9999px';
          document.body.appendChild(div);
          
          const color = getComputedStyle(div).color;
          document.body.removeChild(div);
          
          return color === 'rgb(31, 41, 55)';
        }
      },
      {
        name: '圆角边框',
        test: () => {
          const div = document.createElement('div');
          div.className = 'rounded-lg';
          div.style.position = 'absolute';
          div.style.top = '-9999px';
          document.body.appendChild(div);
          
          const borderRadius = getComputedStyle(div).borderRadius;
          document.body.removeChild(div);
          
          return borderRadius === '8px' || borderRadius === '0.5rem';
        }
      }
    ];

    return tests.map(({ name, test }) => ({
      name,
      passed: test(),
    }));
  };

  /**
   * 手动修复样式
   */
  const handleManualFix = () => {
    const injector = SafariStyleInjector.getInstance();
    injector.manualFix();
    
    // 更新状态
    setTimeout(() => {
      setInjectorStatus(injector.getStatus());
      setCssTestResults(performCSSTests());
    }, 500);
  };

  /**
   * 强制重新渲染
   */
  const handleForceRerender = () => {
    document.body.style.display = 'none';
    document.body.offsetHeight;
    document.body.style.display = '';
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        width: '320px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 10000,
        maxHeight: '80vh',
        overflowY: 'auto',
        border: '1px solid #333',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <strong>🍎 Safari调试面板</strong>
        <button 
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✕
        </button>
      </div>

      {/* 浏览器信息 */}
      <div style={{ marginBottom: '12px' }}>
        <strong>浏览器信息:</strong>
        <div style={{ marginLeft: '8px', fontSize: '11px' }}>
          <div>名称: {browserInfo?.name}</div>
          <div>版本: {browserInfo?.version}</div>
          <div>引擎: {browserInfo?.engine}</div>
          <div>移动端: {browserInfo?.isMobile ? '是' : '否'}</div>
        </div>
      </div>

      {/* 注入器状态 */}
      <div style={{ marginBottom: '12px' }}>
        <strong>样式注入器:</strong>
        <div style={{ marginLeft: '8px', fontSize: '11px' }}>
          <div>已初始化: {injectorStatus?.isInitialized ? '✅' : '❌'}</div>
          <div>注入样式数: {injectorStatus?.injectedStylesCount || 0}</div>
          <div>Safari检测: {injectorStatus?.isSafari ? '✅' : '❌'}</div>
        </div>
      </div>

      {/* CSS测试结果 */}
      <div style={{ marginBottom: '12px' }}>
        <strong>CSS测试结果:</strong>
        <div style={{ marginLeft: '8px', fontSize: '11px' }}>
          {cssTestResults?.map((test: any, index: number) => (
            <div key={index}>
              {test.passed ? '✅' : '❌'} {test.name}
            </div>
          ))}
        </div>
      </div>

      {/* 控制按钮 */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={handleManualFix}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          手动修复
        </button>
        
        <button
          onClick={handleForceRerender}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          强制重渲染
        </button>
        
        <button
          onClick={() => {
            setCssTestResults(performCSSTests());
            const injector = SafariStyleInjector.getInstance();
            setInjectorStatus(injector.getStatus());
          }}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          刷新状态
        </button>
        
        <button
          onClick={() => {
            document.body.classList.toggle('safari-debug');
          }}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          调试边框
        </button>
      </div>

      {/* 快速提示 */}
      <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
        💡 控制台可用命令:
        <div style={{ marginLeft: '8px' }}>
          • fixSafariStyles() - 手动修复
          • getSafariStatus() - 获取状态
          • toggleSafariDebug() - 调试模式
        </div>
      </div>
    </div>
  );
}

/**
 * Safari调试按钮 - 可以重新显示调试面板
 */
export function SafariDebugButton() {
  const [showPanel, setShowPanel] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const browserInfo = detectBrowser();
    setIsSafari(browserInfo.name === 'safari');
  }, []);

  if (!isSafari || process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      {!showPanel && (
        <button
          onClick={() => setShowPanel(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
          title="显示Safari调试面板"
        >
          🍎
        </button>
      )}
      
      {showPanel && <SafariDebugPanel />}
    </>
  );
}
