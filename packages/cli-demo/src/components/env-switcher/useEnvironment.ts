import { useState, useEffect, useCallback } from 'react';

export interface Environment {
  name: string;
  displayName: string;
  apiUrl: string;
  domain: string;
  vconsole: boolean;
  color: string;
  features?: string[];
}

export interface EnvironmentConfig {
  current: Environment;
  available: Environment[];
  isLoading: boolean;
  error?: string;
}

// 默认环境配置
const DEFAULT_ENVIRONMENTS: Environment[] = [
  {
    name: 'development',
    displayName: '开发环境',
    apiUrl: 'http://localhost:3001',
    domain: 'localhost:3000',
    vconsole: true,
    color: '#4CAF50',
    features: ['热更新', '调试模式', 'VConsole']
  },
  {
    name: 'test',
    displayName: '测试环境',
    apiUrl: 'https://test-api.example.com',
    domain: 'test.example.com',
    vconsole: true,
    color: '#FF9800',
    features: ['VConsole', '测试数据']
  },
  {
    name: 'staging',
    displayName: '预发布环境',
    apiUrl: 'https://staging-api.example.com',
    domain: 'staging.example.com',
    vconsole: false,
    color: '#2196F3',
    features: ['生产数据', '性能监控']
  },
  {
    name: 'production',
    displayName: '生产环境',
    apiUrl: 'https://api.example.com',
    domain: 'example.com',
    vconsole: false,
    color: '#F44336',
    features: ['生产数据', '性能监控', '错误上报']
  }
];

export const useEnvironment = () => {
  const [config, setConfig] = useState<EnvironmentConfig>({
    current: DEFAULT_ENVIRONMENTS[0],
    available: DEFAULT_ENVIRONMENTS,
    isLoading: true
  });

  // 检测当前环境
  const detectCurrentEnvironment = useCallback(() => {
    try {
      const hostname = window.location.hostname;
      const envFromStorage = localStorage.getItem('solar-current-env');
      const envFromUrl = (() => {
        try {
          return (typeof process !== 'undefined' && process.env) ? process.env.REACT_APP_ENV : undefined;
        } catch {
          return undefined;
        }
      })();
      const envFromWindow = (window as any).REACT_APP_ENV;

      // 优先级: localStorage > 环境变量 > 域名匹配
      if (envFromStorage) {
        const env = DEFAULT_ENVIRONMENTS.find(e => e.name === envFromStorage);
        if (env) return env;
      }

      if (envFromUrl) {
        const env = DEFAULT_ENVIRONMENTS.find(e => e.name === envFromUrl);
        if (env) return env;
      }

      if (envFromWindow) {
        const env = DEFAULT_ENVIRONMENTS.find(e => e.name === envFromWindow);
        if (env) return env;
      }

      // 根据域名匹配
      const env = DEFAULT_ENVIRONMENTS.find(e => 
        hostname.includes(e.domain.split(':')[0]) || 
        e.domain.includes(hostname)
      );
      
      return env || DEFAULT_ENVIRONMENTS[0];
    } catch (error) {
      console.warn('环境检测失败:', error);
      return DEFAULT_ENVIRONMENTS[0];
    }
  }, []);

  // 初始化
  useEffect(() => {
    const detected = detectCurrentEnvironment();
    setConfig(prev => ({
      ...prev,
      current: detected,
      isLoading: false
    }));

    // 设置全局环境变量
    updateGlobalEnvironment(detected);
  }, [detectCurrentEnvironment]);

  // 更新全局环境变量
  const updateGlobalEnvironment = (env: Environment) => {
    try {
      // 更新window对象上的环境变量
      (window as any).SOLAR_ENV = {
        name: env.name,
        displayName: env.displayName,
        apiUrl: env.apiUrl,
        domain: env.domain,
        vconsole: env.vconsole,
        features: env.features
      };

      // 兼容React环境变量
      (window as any).REACT_APP_ENV = env.name;
      (window as any).REACT_APP_API_URL = env.apiUrl;
      (window as any).REACT_APP_DOMAIN = env.domain;
      (window as any).REACT_APP_VCONSOLE = env.vconsole;

      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('environmentChanged', {
        detail: env
      }));

      console.log(`🌍 环境已切换到: ${env.displayName}`, env);
    } catch (error) {
      console.error('更新全局环境变量失败:', error);
    }
  };

  // 切换环境
  const switchEnvironment = useCallback(async (envName: string, options?: {
    saveToStorage?: boolean;
    reloadPage?: boolean;
    showNotification?: boolean;
  }) => {
    const {
      saveToStorage = true,
      reloadPage = false,
      showNotification = true
    } = options || {};

    try {
      setConfig(prev => ({ ...prev, isLoading: true }));

      const targetEnv = config.available.find(e => e.name === envName);
      if (!targetEnv) {
        throw new Error(`环境 "${envName}" 不存在`);
      }

      // 保存到localStorage
      if (saveToStorage) {
        localStorage.setItem('solar-current-env', envName);
      }

      // 更新配置
      setConfig(prev => ({
        ...prev,
        current: targetEnv,
        isLoading: false
      }));

      // 更新全局环境变量
      updateGlobalEnvironment(targetEnv);

      // 显示通知
      if (showNotification) {
        showEnvironmentNotification(targetEnv);
      }

      // 重新加载页面
      if (reloadPage) {
        const shouldReload = window.confirm(
          `切换到${targetEnv.displayName}需要重新加载页面，是否继续？`
        );
        
        if (shouldReload) {
          const newUrl = `${window.location.protocol}//${targetEnv.domain}${window.location.pathname}${window.location.search}`;
          window.location.href = newUrl;
        }
      }

      return targetEnv;
    } catch (error) {
      setConfig(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '切换环境失败'
      }));
      throw error;
    }
  }, [config.available]);

  // 显示环境切换通知
  const showEnvironmentNotification = (env: Environment) => {
    // 检查是否已有通知
    const existing = document.querySelector('.env-notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'env-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${env.color};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      max-width: 300px;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">🌍</span>
        <div>
          <div style="font-weight: 600;">已切换到 ${env.displayName}</div>
          <div style="font-size: 12px; opacity: 0.9; margin-top: 2px;">${env.domain}</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // 3秒后自动消失
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  };

  // 获取当前API URL
  const getApiUrl = useCallback((path: string = '') => {
    const baseUrl = config.current.apiUrl.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
  }, [config.current.apiUrl]);

  // 检查是否为指定环境
  const isEnvironment = useCallback((envName: string) => {
    return config.current.name === envName;
  }, [config.current.name]);

  // 获取环境特性
  const hasFeature = useCallback((feature: string) => {
    return config.current.features?.includes(feature) || false;
  }, [config.current.features]);

  // 添加自定义环境
  const addEnvironment = useCallback((env: Environment) => {
    setConfig(prev => ({
      ...prev,
      available: [...prev.available, env]
    }));
  }, []);

  // 移除环境
  const removeEnvironment = useCallback((envName: string) => {
    setConfig(prev => ({
      ...prev,
      available: prev.available.filter(e => e.name !== envName)
    }));
  }, []);

  return {
    // 状态
    ...config,
    
    // 方法
    switchEnvironment,
    getApiUrl,
    isEnvironment,
    hasFeature,
    addEnvironment,
    removeEnvironment,
    detectCurrentEnvironment,
    
    // 便捷方法
    isDevelopment: isEnvironment('development'),
    isTest: isEnvironment('test'),
    isStaging: isEnvironment('staging'),
    isProduction: isEnvironment('production'),
    
    // VConsole相关
    shouldShowVConsole: config.current.vconsole,
  };
};
