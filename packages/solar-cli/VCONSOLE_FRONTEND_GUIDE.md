# VConsole与前端虚环境管理完整指南

## 📱 VConsole 详解

### VConsole 是什么？

VConsole是腾讯开源的移动端网页调试工具，解决了移动设备无法使用桌面浏览器开发者工具的痛点。

### VConsole 核心功能

| 面板 | 功能 | 用途 |
|------|------|------|
| **Console** | 日志查看 | 查看console.log、error、warn等输出 |
| **Network** | 网络监控 | 监控所有HTTP请求和响应 |
| **Element** | DOM检查 | 查看和修改DOM结构 |
| **Storage** | 存储管理 | 管理localStorage、sessionStorage、Cookie |
| **System** | 系统信息 | 显示设备信息、User Agent等 |

### VConsole 使用原理

```typescript
// VConsole初始化
import VConsole from 'vconsole';

// 仅在非生产环境启用
if (process.env.NODE_ENV !== 'production') {
  const vConsole = new VConsole({
    theme: 'dark',                    // 主题：light/dark
    defaultPlugins: [                 // 启用的插件
      'system', 'network', 'element', 'storage'
    ],
    maxLogNumber: 1000,              // 最大日志数量
    onReady: () => {
      console.log('VConsole ready!');
    }
  });
}
```

### Solar脚手架中的VConsole集成

Solar脚手架自动集成VConsole，特点：

1. **环境控制** - 根据环境变量自动启用/禁用
2. **智能配置** - 不同环境使用不同配置
3. **零配置** - 创建项目时自动注入代码

```typescript
// Solar自动生成的VConsole代码
import VConsole from 'vconsole';

// 智能环境判断
if (process.env.NODE_ENV !== 'production' && 
    process.env.REACT_APP_VCONSOLE !== 'false') {
  new VConsole({
    theme: 'dark',
    defaultPlugins: ['system', 'network', 'element', 'storage'],
    maxLogNumber: 1000
  });
}
```

## 🌍 前端虚环境切换系统

### 系统架构

```
前端应用
├── EnvSwitcher (环境切换组件)
├── useEnvironment (环境管理Hook)
├── ApiManager (API管理器)
└── 环境配置文件
```

### 核心组件详解

#### 1. EnvSwitcher 组件

**功能特性：**
- 🎨 可视化环境切换界面
- ⌨️ 快捷键支持 (Ctrl+Shift+E)
- 🔄 实时环境切换
- 📱 响应式设计
- 🌙 暗色主题支持

**使用方法：**
```tsx
import EnvSwitcher from './EnvSwitcher';

function App() {
  return (
    <div>
      {/* 你的应用内容 */}
      
      {/* 环境切换器 */}
      <EnvSwitcher 
        position="top-right"           // 位置
        showInProduction={false}       // 生产环境是否显示
        onEnvironmentChange={(env) => {
          console.log('环境已切换:', env);
        }}
      />
    </div>
  );
}
```

#### 2. useEnvironment Hook

**核心功能：**
- 🔍 自动环境检测
- 💾 环境状态持久化
- 🔄 环境切换管理
- 📊 环境信息查询

**使用示例：**
```tsx
import { useEnvironment } from './useEnvironment';

function MyComponent() {
  const {
    current,              // 当前环境
    available,            // 可用环境列表
    isLoading,           // 加载状态
    switchEnvironment,   // 切换环境
    isDevelopment,       // 是否开发环境
    isProduction,        // 是否生产环境
    getApiUrl,          // 获取API地址
    hasFeature          // 检查功能特性
  } = useEnvironment();

  return (
    <div>
      <h2>当前环境: {current.displayName}</h2>
      <p>API地址: {getApiUrl('/api/users')}</p>
      
      {isDevelopment && (
        <div>🐛 开发环境专用功能</div>
      )}
      
      {hasFeature('VConsole') && (
        <div>🔍 VConsole已启用</div>
      )}
    </div>
  );
}
```

#### 3. ApiManager 类

**核心特性：**
- 🔄 环境自动切换
- 🎭 Mock数据支持
- 📊 请求监控
- 🏥 健康检查
- 🔧 配置管理

**使用方法：**
```typescript
import { createApiManager, useApi } from './ApiManager';

// 初始化API管理器
const apiManager = createApiManager(currentEnvironment);

// 在组件中使用
function DataComponent() {
  const api = useApi();
  
  const [userData, setUserData] = useState(null);
  
  const loadUserData = async () => {
    try {
      // 自动根据环境选择API地址
      const data = await api.get('getUserInfo');
      setUserData(data);
    } catch (error) {
      console.error('加载失败:', error);
    }
  };
  
  return (
    <div>
      <button onClick={loadUserData}>加载用户数据</button>
      {userData && <div>{userData.name}</div>}
    </div>
  );
}
```

### 环境配置详解

#### 默认环境配置

```typescript
const ENVIRONMENTS = [
  {
    name: 'development',
    displayName: '开发环境',
    apiUrl: 'http://localhost:3001',
    domain: 'localhost:3000',
    vconsole: true,                    // 启用VConsole
    color: '#4CAF50',
    features: ['热更新', '调试模式', 'VConsole']
  },
  {
    name: 'test',
    displayName: '测试环境',
    apiUrl: 'https://test-api.example.com',
    domain: 'test.example.com',
    vconsole: true,                    // 启用VConsole
    color: '#FF9800',
    features: ['VConsole', '测试数据']
  },
  {
    name: 'staging',
    displayName: '预发布环境',
    apiUrl: 'https://staging-api.example.com',
    domain: 'staging.example.com',
    vconsole: false,                   // 禁用VConsole
    color: '#2196F3',
    features: ['生产数据', '性能监控']
  },
  {
    name: 'production',
    displayName: '生产环境',
    apiUrl: 'https://api.example.com',
    domain: 'example.com',
    vconsole: false,                   // 禁用VConsole
    color: '#F44336',
    features: ['生产数据', '性能监控', '错误上报']
  }
];
```

## 🚀 实际应用场景

### 场景1：移动端H5开发调试

```typescript
// 开发阶段
function DevelopmentDebugging() {
  const { isDevelopment, hasFeature } = useEnvironment();
  const api = useApi();
  
  useEffect(() => {
    if (isDevelopment) {
      // 开发环境特殊处理
      api.setMockMode(true);           // 启用Mock模式
      console.log('🐛 开发模式已启用');
      
      // 添加调试信息
      window.addEventListener('error', (error) => {
        console.error('全局错误:', error);
      });
    }
  }, [isDevelopment]);

  return (
    <div>
      {hasFeature('VConsole') && (
        <div className="debug-panel">
          🔍 VConsole已启用 - 摇一摇或点击右下角按钮打开
        </div>
      )}
    </div>
  );
}
```

### 场景2：多环境API切换

```typescript
// API环境管理
function ApiEnvironmentDemo() {
  const { current, switchEnvironment } = useEnvironment();
  const api = useApi();
  
  const [apiData, setApiData] = useState(null);
  
  // 环境切换时重新加载数据
  useEffect(() => {
    loadApiData();
  }, [current]);
  
  const loadApiData = async () => {
    try {
      // API会自动使用当前环境的配置
      const data = await api.get('getAppConfig');
      setApiData(data);
    } catch (error) {
      console.error('API请求失败:', error);
      
      // 开发环境自动降级到Mock数据
      if (current.name === 'development') {
        console.warn('🎭 使用Mock数据');
      }
    }
  };
  
  return (
    <div>
      <h3>当前环境: {current.displayName}</h3>
      <p>API地址: {current.apiUrl}</p>
      
      <div>
        <h4>快速切换:</h4>
        <button onClick={() => switchEnvironment('development')}>
          开发环境
        </button>
        <button onClick={() => switchEnvironment('test')}>
          测试环境
        </button>
        <button onClick={() => switchEnvironment('production')}>
          生产环境
        </button>
      </div>
      
      {apiData && (
        <pre>{JSON.stringify(apiData, null, 2)}</pre>
      )}
    </div>
  );
}
```

### 场景3：条件功能启用

```typescript
// 根据环境启用不同功能
function ConditionalFeatures() {
  const { 
    current, 
    isDevelopment, 
    isProduction, 
    hasFeature 
  } = useEnvironment();
  
  return (
    <div>
      {/* 开发环境专用功能 */}
      {isDevelopment && (
        <div className="dev-tools">
          <h4>🛠️ 开发工具</h4>
          <button onClick={() => localStorage.clear()}>
            清空LocalStorage
          </button>
          <button onClick={() => location.reload()}>
            强制刷新
          </button>
        </div>
      )}
      
      {/* VConsole功能 */}
      {hasFeature('VConsole') && (
        <div className="vconsole-info">
          <p>🔍 VConsole调试工具已启用</p>
          <ul>
            <li>Console: 查看日志输出</li>
            <li>Network: 监控网络请求</li>
            <li>Element: 检查DOM结构</li>
            <li>Storage: 管理本地存储</li>
          </ul>
        </div>
      )}
      
      {/* 生产环境功能 */}
      {isProduction && (
        <div className="production-features">
          <h4>📊 生产环境功能</h4>
          <p>错误上报、性能监控已启用</p>
        </div>
      )}
      
      {/* 根据环境显示不同内容 */}
      <div className="env-specific-content">
        <h4>环境特定内容:</h4>
        {current.features?.map(feature => (
          <span key={feature} className="feature-tag">
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}
```

## 🔧 集成到Solar项目

### 1. 在项目中使用环境切换组件

```bash
# 创建项目时选择环境切换功能
solar create my-app
# 选择: ✅ VConsole调试 ✅ 前端环境切换
```

### 2. 项目集成步骤

#### 步骤1: 复制组件文件
```bash
# 将环境切换组件复制到项目中
cp -r templates/env-switcher src/components/
```

#### 步骤2: 安装依赖
```bash
npm install vconsole
```

#### 步骤3: 在App中集成
```tsx
// src/App.tsx
import React from 'react';
import EnvSwitcher from './components/env-switcher/EnvSwitcher';
import { useEnvironment } from './components/env-switcher/useEnvironment';
import { createApiManager } from './components/env-switcher/ApiManager';

function App() {
  const environment = useEnvironment();
  
  // 初始化API管理器
  React.useEffect(() => {
    if (!environment.isLoading) {
      createApiManager(environment.current);
    }
  }, [environment.current, environment.isLoading]);

  return (
    <div className="App">
      {/* 你的应用内容 */}
      
      {/* 环境切换器 */}
      <EnvSwitcher 
        position="top-right"
        showInProduction={false}
        onEnvironmentChange={(env) => {
          console.log('环境已切换:', env);
        }}
      />
    </div>
  );
}

export default App;
```

### 3. 高级配置

#### 自定义环境配置
```typescript
// src/config/environments.ts
export const CUSTOM_ENVIRONMENTS = [
  {
    name: 'local',
    displayName: '本地环境',
    apiUrl: 'http://localhost:8080',
    domain: 'localhost:3000',
    vconsole: true,
    color: '#9C27B0',
    features: ['本地调试', 'Mock数据']
  },
  {
    name: 'demo',
    displayName: '演示环境',
    apiUrl: 'https://demo-api.example.com',
    domain: 'demo.example.com',
    vconsole: true,
    color: '#FF5722',
    features: ['演示数据', 'VConsole']
  }
];
```

#### 环境特定配置
```typescript
// src/config/apiConfig.ts
export const getApiConfig = (environment: string) => {
  const configs = {
    development: {
      timeout: 30000,
      retries: 3,
      mockMode: true
    },
    test: {
      timeout: 15000,
      retries: 2,
      mockMode: false
    },
    production: {
      timeout: 5000,
      retries: 1,
      mockMode: false
    }
  };
  
  return configs[environment] || configs.development;
};
```

## 📊 最佳实践

### 1. VConsole使用建议

```typescript
// 智能VConsole控制
class VConsoleManager {
  private vconsole: any = null;
  
  init(environment: Environment) {
    if (environment.vconsole && !this.vconsole) {
      import('vconsole').then((VConsole) => {
        this.vconsole = new VConsole.default({
          theme: 'dark',
          defaultPlugins: ['system', 'network', 'element', 'storage'],
          maxLogNumber: environment.name === 'development' ? 2000 : 1000,
          onReady: () => {
            console.log(`🔍 VConsole已在${environment.displayName}启用`);
          }
        });
      });
    } else if (!environment.vconsole && this.vconsole) {
      this.destroy();
    }
  }
  
  destroy() {
    if (this.vconsole) {
      this.vconsole.destroy();
      this.vconsole = null;
      console.log('🔍 VConsole已禁用');
    }
  }
}
```

### 2. 环境切换最佳实践

```typescript
// 环境切换监听器
class EnvironmentListener {
  private listeners: Array<(env: Environment) => void> = [];
  
  subscribe(callback: (env: Environment) => void) {
    this.listeners.push(callback);
  }
  
  notify(environment: Environment) {
    this.listeners.forEach(callback => {
      try {
        callback(environment);
      } catch (error) {
        console.error('环境切换监听器错误:', error);
      }
    });
  }
}

// 使用示例
const envListener = new EnvironmentListener();

// 监听环境变化
envListener.subscribe((env) => {
  // 更新API配置
  updateApiConfig(env);
  
  // 更新VConsole
  vconsoleManager.init(env);
  
  // 更新埋点配置
  updateAnalytics(env);
});
```

### 3. 生产环境安全考虑

```typescript
// 生产环境保护
const isProductionSafe = () => {
  const hostname = window.location.hostname;
  const isProduction = process.env.NODE_ENV === 'production';
  const isProdDomain = hostname.includes('example.com'); // 你的生产域名
  
  return isProduction && isProdDomain;
};

// 条件渲染环境切换器
function App() {
  const showEnvSwitcher = !isProductionSafe() || 
    localStorage.getItem('dev-mode') === 'true';
  
  return (
    <div>
      {/* 应用内容 */}
      
      {showEnvSwitcher && (
        <EnvSwitcher 
          position="top-right"
          showInProduction={false}
        />
      )}
    </div>
  );
}
```

## 🎯 总结

### VConsole的价值

1. **移动端调试** - 解决移动设备调试难题
2. **实时监控** - 网络请求、DOM变化实时查看
3. **便捷操作** - 无需连接电脑即可调试
4. **团队协作** - 测试人员可直接查看技术信息

### 前端虚环境切换的价值

1. **开发效率** - 快速在不同环境间切换测试
2. **问题定位** - 环境相关问题快速复现
3. **团队协作** - 统一的环境管理方式
4. **用户体验** - 可视化的环境状态展示

### 技术架构优势

1. **模块化设计** - 组件间低耦合，易于扩展
2. **类型安全** - TypeScript提供完整类型支持
3. **响应式UI** - 适配各种设备和屏幕尺寸
4. **性能优化** - 按需加载，最小化性能影响

通过Solar脚手架的VConsole和前端虚环境切换系统，开发者可以：

- 🚀 **提升开发效率** - 一键切换环境，实时调试
- 🔍 **简化调试流程** - 移动端直接查看调试信息
- 🌍 **统一环境管理** - 前后端环境配置同步
- 📱 **优化移动体验** - 专为移动端优化的调试工具

---

**Solar React CLI** - 让React开发更简单、更高效！ 🌞
