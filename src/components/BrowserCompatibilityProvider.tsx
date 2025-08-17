'use client';

import { useEffect } from 'react';
import { applyBrowserClasses, detectBrowser } from '../utils/BrowserDetection';
import { SafariDebugButton } from './SafariDebugPanel';

/**
 * 浏览器兼容性提供者组件
 * 在应用启动时检测浏览器并应用相应的CSS类
 */
export function BrowserCompatibilityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 应用浏览器检测类
    applyBrowserClasses();
    
    // 输出浏览器信息到控制台
    const browserInfo = detectBrowser();
    console.log('🌐 浏览器检测结果:', browserInfo);
    
    // 为开发环境添加调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 浏览器兼容性已启用');
      
      // 添加全局调试函数
      (window as any).getBrowserInfo = () => browserInfo;
      (window as any).toggleBrowserDebug = () => {
        document.body.classList.toggle(`debug-${browserInfo.name}`);
      };
      (window as any).toggleSafariDebug = () => {
        document.body.classList.toggle('safari-debug');
      };
    }
  }, []);

  return (
    <>
      <SafariDebugButton />
      {children}
    </>
  );
}

/**
 * 浏览器信息显示组件（可选，用于调试）
 */
export function BrowserInfoDebug() {
  useEffect(() => {
    const browserInfo = detectBrowser();
    
    // 创建调试信息元素
    const debugElement = document.createElement('div');
    debugElement.id = 'browser-debug-info';
    debugElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      z-index: 9999;
      pointer-events: none;
      opacity: 0.7;
    `;
    debugElement.textContent = `${browserInfo.name} ${browserInfo.version}`;
    
    // 只在开发环境显示
    if (process.env.NODE_ENV === 'development') {
      document.body.appendChild(debugElement);
      
      // 清理函数
      return () => {
        const existingElement = document.getElementById('browser-debug-info');
        if (existingElement) {
          existingElement.remove();
        }
      };
    }
  }, []);

  return null;
}
