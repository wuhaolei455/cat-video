
// VConsole调试工具配置
import VConsole from 'vconsole';

// 安全的环境变量检测
const getEnvVar = (key: string, defaultValue: string = '') => {
  try {
    return (typeof process !== 'undefined' && process.env) ? process.env[key] || defaultValue : defaultValue;
  } catch {
    return defaultValue;
  }
};

// 检查是否应该启用VConsole
const shouldEnableVConsole = () => {
  try {
    const nodeEnv = getEnvVar('NODE_ENV', 'development');
    const vConsoleFlag = getEnvVar('REACT_APP_VCONSOLE', 'true');
    const hostname = window.location.hostname;
    
    // 生产环境域名不启用
    if (hostname.includes('example.com') && !hostname.includes('test') && !hostname.includes('staging')) {
      return false;
    }
    
    return nodeEnv !== 'production' && vConsoleFlag !== 'false';
  } catch {
    // 出错时默认启用（开发环境）
    return true;
  }
};

// 启用VConsole
if (shouldEnableVConsole()) {
  try {
    new VConsole({
      theme: 'dark',
      defaultPlugins: ['system', 'network', 'element', 'storage'],
      maxLogNumber: 1000
    });
    console.log('🔍 VConsole已启用');
  } catch (error) {
    console.warn('VConsole启用失败:', error);
  }
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './styles/index.css';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>

    <BrowserRouter>
      <App />
    </BrowserRouter>

  </React.StrictMode>
);
