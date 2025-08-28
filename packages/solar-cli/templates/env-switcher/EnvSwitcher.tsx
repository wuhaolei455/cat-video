import React, { useState, useEffect } from 'react';
import './EnvSwitcher.css';

interface Environment {
  name: string;
  displayName: string;
  apiUrl: string;
  domain: string;
  vconsole: boolean;
  color: string;
}

// 预定义的环境配置
const ENVIRONMENTS: Environment[] = [
  {
    name: 'development',
    displayName: '开发环境',
    apiUrl: 'http://localhost:3001',
    domain: 'localhost:3000',
    vconsole: true,
    color: '#4CAF50'
  },
  {
    name: 'test',
    displayName: '测试环境',
    apiUrl: 'https://test-api.example.com',
    domain: 'test.example.com',
    vconsole: true,
    color: '#FF9800'
  },
  {
    name: 'staging',
    displayName: '预发布环境',
    apiUrl: 'https://staging-api.example.com',
    domain: 'staging.example.com',
    vconsole: false,
    color: '#2196F3'
  },
  {
    name: 'production',
    displayName: '生产环境',
    apiUrl: 'https://api.example.com',
    domain: 'example.com',
    vconsole: false,
    color: '#F44336'
  }
];

interface EnvSwitcherProps {
  onEnvironmentChange?: (env: Environment) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showInProduction?: boolean;
}

const EnvSwitcher: React.FC<EnvSwitcherProps> = ({
  onEnvironmentChange,
  position = 'top-right',
  showInProduction = false
}) => {
  const [currentEnv, setCurrentEnv] = useState<Environment>(ENVIRONMENTS[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 根据当前URL或环境变量确定环境
    const detectCurrentEnvironment = () => {
      const hostname = window.location.hostname;
      const envFromStorage = localStorage.getItem('solar-current-env');
      const envFromUrl = process.env.REACT_APP_ENV;

      // 优先级: localStorage > URL > 域名匹配
      if (envFromStorage) {
        const env = ENVIRONMENTS.find(e => e.name === envFromStorage);
        if (env) return env;
      }

      if (envFromUrl) {
        const env = ENVIRONMENTS.find(e => e.name === envFromUrl);
        if (env) return env;
      }

      // 根据域名匹配
      const env = ENVIRONMENTS.find(e => e.domain.includes(hostname));
      return env || ENVIRONMENTS[0];
    };

    const detected = detectCurrentEnvironment();
    setCurrentEnv(detected);

    // 生产环境默认隐藏
    if (!showInProduction && detected.name === 'production') {
      setIsVisible(false);
    }

    // 监听键盘快捷键 Ctrl+Shift+E
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInProduction, isVisible]);

  const handleEnvironmentSwitch = (env: Environment) => {
    setCurrentEnv(env);
    setIsOpen(false);

    // 保存到localStorage
    localStorage.setItem('solar-current-env', env.name);
    
    // 更新页面环境变量
    updateEnvironmentVariables(env);

    // 回调通知
    onEnvironmentChange?.(env);

    // 显示切换提示
    showSwitchNotification(env);

    // 如果需要重新加载页面
    if (window.confirm(`切换到${env.displayName}需要重新加载页面，是否继续？`)) {
      // 构建新的URL
      const newUrl = `${window.location.protocol}//${env.domain}${window.location.pathname}${window.location.search}`;
      window.location.href = newUrl;
    }
  };

  const updateEnvironmentVariables = (env: Environment) => {
    // 动态更新全局环境变量
    (window as any).REACT_APP_ENV = env.name;
    (window as any).REACT_APP_API_URL = env.apiUrl;
    (window as any).REACT_APP_DOMAIN = env.domain;
    (window as any).REACT_APP_VCONSOLE = env.vconsole;

    // 更新document title
    document.title = `${document.title.split(' - ')[0]} - ${env.displayName}`;

    // 控制VConsole
    toggleVConsole(env.vconsole);
  };

  const toggleVConsole = (enable: boolean) => {
    const vConsole = (window as any).vConsole;
    
    if (enable && !vConsole) {
      // 动态加载VConsole
      import('vconsole').then((VConsole) => {
        const vconsole = new VConsole.default({
          theme: 'dark',
          defaultPlugins: ['system', 'network', 'element', 'storage'],
          maxLogNumber: 1000
        });
        (window as any).vConsole = vconsole;
        console.log('🔍 VConsole已启用');
      });
    } else if (!enable && vConsole) {
      // 销毁VConsole
      vConsole.destroy();
      (window as any).vConsole = null;
      console.log('🔍 VConsole已禁用');
    }
  };

  const showSwitchNotification = (env: Environment) => {
    // 创建切换通知
    const notification = document.createElement('div');
    notification.className = 'env-switch-notification';
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
    `;
    notification.textContent = `已切换到 ${env.displayName}`;

    document.body.appendChild(notification);

    // 3秒后自动消失
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  if (!isVisible) {
    return (
      <div 
        className="env-switcher-hidden"
        title="按 Ctrl+Shift+E 显示环境切换器"
        onClick={() => setIsVisible(true)}
      >
        🌍
      </div>
    );
  }

  return (
    <div className={`env-switcher env-switcher-${position}`}>
      <div 
        className="env-switcher-current"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: currentEnv.color }}
        title={`当前环境: ${currentEnv.displayName}\n点击切换环境`}
      >
        <span className="env-icon">🌍</span>
        <span className="env-name">{currentEnv.displayName}</span>
        <span className={`env-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="env-switcher-dropdown">
          <div className="env-switcher-header">
            <span>选择环境</span>
            <button 
              className="env-switcher-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          
          {ENVIRONMENTS.map((env) => (
            <div
              key={env.name}
              className={`env-option ${env.name === currentEnv.name ? 'active' : ''}`}
              onClick={() => handleEnvironmentSwitch(env)}
              style={{ borderLeft: `4px solid ${env.color}` }}
            >
              <div className="env-option-main">
                <span className="env-option-name">{env.displayName}</span>
                <span className="env-option-domain">{env.domain}</span>
              </div>
              <div className="env-option-features">
                {env.vconsole && <span className="feature-tag vconsole">VConsole</span>}
                <span className="feature-tag api">{env.apiUrl}</span>
              </div>
            </div>
          ))}

          <div className="env-switcher-footer">
            <small>💡 Ctrl+Shift+E 隐藏/显示面板</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvSwitcher;
