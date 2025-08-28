import { Environment } from './useEnvironment';

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  interceptors?: {
    request?: (config: any) => any;
    response?: (response: any) => any;
    error?: (error: any) => any;
  };
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  mockData?: any;
  mockDelay?: number;
}

export class ApiManager {
  private currentEnv: Environment;
  private config: ApiConfig;
  private endpoints: Map<string, ApiEndpoint> = new Map();
  private mockMode: boolean = false;

  constructor(environment: Environment) {
    this.currentEnv = environment;
    this.config = this.createConfig(environment);
    this.setupDefaultEndpoints();
  }

  // 创建环境配置
  private createConfig(env: Environment): ApiConfig {
    const baseConfig: ApiConfig = {
      baseURL: env.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Environment': env.name,
        'X-Client': 'solar-react-app'
      }
    };

    // 根据环境调整配置
    switch (env.name) {
      case 'development':
        return {
          ...baseConfig,
          timeout: 30000, // 开发环境较长超时
          headers: {
            ...baseConfig.headers,
            'X-Debug': 'true'
          }
        };
      
      case 'test':
        return {
          ...baseConfig,
          headers: {
            ...baseConfig.headers,
            'X-Test-Mode': 'true'
          }
        };
      
      case 'production':
        return {
          ...baseConfig,
          timeout: 5000, // 生产环境较短超时
          headers: {
            ...baseConfig.headers,
            'X-Version': process.env.REACT_APP_VERSION || '1.0.0'
          }
        };
      
      default:
        return baseConfig;
    }
  }

  // 设置默认端点
  private setupDefaultEndpoints() {
    // 用户相关API
    this.registerEndpoint('getUserInfo', {
      method: 'GET',
      url: '/api/user/info',
      mockData: {
        id: 1,
        name: '测试用户',
        email: 'test@example.com',
        avatar: 'https://via.placeholder.com/64'
      }
    });

    this.registerEndpoint('updateUserInfo', {
      method: 'PUT',
      url: '/api/user/info',
      mockData: { success: true }
    });

    // 数据相关API
    this.registerEndpoint('getDataList', {
      method: 'GET',
      url: '/api/data/list',
      mockData: {
        list: [
          { id: 1, name: '数据1', status: 'active' },
          { id: 2, name: '数据2', status: 'inactive' }
        ],
        total: 2
      }
    });

    // 配置相关API
    this.registerEndpoint('getAppConfig', {
      method: 'GET',
      url: '/api/config/app',
      mockData: {
        theme: 'light',
        language: 'zh-CN',
        features: this.currentEnv.features || []
      }
    });
  }

  // 注册API端点
  registerEndpoint(name: string, endpoint: ApiEndpoint) {
    this.endpoints.set(name, endpoint);
  }

  // 获取完整URL
  getUrl(path: string): string {
    const cleanPath = path.replace(/^\//, '');
    return `${this.config.baseURL.replace(/\/$/, '')}/${cleanPath}`;
  }

  // 通用请求方法
  async request<T = any>(
    endpoint: string | ApiEndpoint,
    data?: any,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
      timeout?: number;
      useMock?: boolean;
    }
  ): Promise<T> {
    const endpointConfig = typeof endpoint === 'string' 
      ? this.endpoints.get(endpoint)
      : endpoint;

    if (!endpointConfig) {
      throw new Error(`API端点 "${endpoint}" 不存在`);
    }

    const {
      params = {},
      headers = {},
      timeout = this.config.timeout,
      useMock = this.mockMode || this.currentEnv.name === 'development'
    } = options || {};

    // Mock模式
    if (useMock && endpointConfig.mockData) {
      console.log(`🎭 Mock API: ${endpointConfig.method} ${endpointConfig.url}`, {
        data,
        params,
        mockData: endpointConfig.mockData
      });

      // 模拟延迟
      const delay = endpointConfig.mockDelay || 
        (this.currentEnv.name === 'development' ? 500 : 200);
      
      await new Promise(resolve => setTimeout(resolve, delay));

      // 模拟错误（10%概率）
      if (Math.random() < 0.1 && this.currentEnv.name === 'development') {
        throw new Error('Mock API Error: 模拟网络错误');
      }

      return endpointConfig.mockData as T;
    }

    // 构建URL
    let url = this.getUrl(endpointConfig.url);
    
    // 添加查询参数
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    // 构建请求配置
    const requestConfig: RequestInit = {
      method: endpointConfig.method,
      headers: {
        ...this.config.headers,
        ...headers
      },
      signal: AbortSignal.timeout(timeout)
    };

    // 添加请求体
    if (data && !['GET', 'HEAD'].includes(endpointConfig.method)) {
      requestConfig.body = JSON.stringify(data);
    }

    console.log(`🌐 API请求: ${endpointConfig.method} ${url}`, {
      environment: this.currentEnv.name,
      data,
      params
    });

    try {
      const response = await fetch(url, requestConfig);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API错误 ${response.status}: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      
      console.log(`✅ API响应: ${endpointConfig.method} ${url}`, result);
      
      return result as T;
    } catch (error) {
      console.error(`❌ API错误: ${endpointConfig.method} ${url}`, error);
      
      // 开发环境下自动降级到Mock
      if (this.currentEnv.name === 'development' && endpointConfig.mockData) {
        console.warn('🎭 API请求失败，自动使用Mock数据');
        return endpointConfig.mockData as T;
      }
      
      throw error;
    }
  }

  // 便捷方法
  async get<T = any>(endpoint: string, params?: Record<string, any>, options?: any): Promise<T> {
    return this.request<T>(endpoint, undefined, { ...options, params });
  }

  async post<T = any>(endpoint: string, data?: any, options?: any): Promise<T> {
    return this.request<T>(endpoint, data, options);
  }

  async put<T = any>(endpoint: string, data?: any, options?: any): Promise<T> {
    return this.request<T>(endpoint, data, options);
  }

  async delete<T = any>(endpoint: string, params?: Record<string, any>, options?: any): Promise<T> {
    return this.request<T>(endpoint, undefined, { ...options, params });
  }

  // 切换环境
  switchEnvironment(env: Environment) {
    this.currentEnv = env;
    this.config = this.createConfig(env);
    
    console.log(`🔄 API环境已切换到: ${env.displayName}`, {
      baseURL: this.config.baseURL,
      headers: this.config.headers
    });
  }

  // 启用/禁用Mock模式
  setMockMode(enabled: boolean) {
    this.mockMode = enabled;
    console.log(`🎭 Mock模式: ${enabled ? '启用' : '禁用'}`);
  }

  // 获取当前配置
  getConfig(): ApiConfig & { environment: Environment } {
    return {
      ...this.config,
      environment: this.currentEnv
    };
  }

  // 健康检查
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    environment: string;
    responseTime: number;
    timestamp: string;
  }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.getUrl('/api/health'), {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        environment: this.currentEnv.name,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'unhealthy',
        environment: this.currentEnv.name,
        responseTime,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// 创建全局API管理器实例
let globalApiManager: ApiManager | null = null;

export const createApiManager = (environment: Environment): ApiManager => {
  globalApiManager = new ApiManager(environment);
  
  // 挂载到window对象供调试使用
  (window as any).apiManager = globalApiManager;
  
  return globalApiManager;
};

export const getApiManager = (): ApiManager => {
  if (!globalApiManager) {
    throw new Error('ApiManager未初始化，请先调用createApiManager');
  }
  return globalApiManager;
};

// React Hook
export const useApi = () => {
  const apiManager = getApiManager();
  
  return {
    get: apiManager.get.bind(apiManager),
    post: apiManager.post.bind(apiManager),
    put: apiManager.put.bind(apiManager),
    delete: apiManager.delete.bind(apiManager),
    request: apiManager.request.bind(apiManager),
    healthCheck: apiManager.healthCheck.bind(apiManager),
    getConfig: apiManager.getConfig.bind(apiManager),
    setMockMode: apiManager.setMockMode.bind(apiManager)
  };
};
