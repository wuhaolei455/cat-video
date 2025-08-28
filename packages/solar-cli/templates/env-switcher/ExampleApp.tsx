import React, { useEffect, useState } from 'react';
import EnvSwitcher from './EnvSwitcher';
import { useEnvironment, Environment } from './useEnvironment';
import { createApiManager, useApi } from './ApiManager';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface AppData {
  list: Array<{ id: number; name: string; status: string }>;
  total: number;
}

const ExampleApp: React.FC = () => {
  const environment = useEnvironment();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  // 初始化API管理器
  useEffect(() => {
    if (!environment.isLoading) {
      createApiManager(environment.current);
    }
  }, [environment.current, environment.isLoading]);

  const api = useApi();

  // 加载数据
  const loadData = async () => {
    if (environment.isLoading) return;
    
    setLoading(true);
    try {
      const [user, data] = await Promise.all([
        api.get<UserInfo>('getUserInfo'),
        api.get<AppData>('getDataList')
      ]);
      
      setUserInfo(user);
      setAppData(data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 健康检查
  const checkHealth = async () => {
    try {
      const health = await api.healthCheck();
      setHealthStatus(health);
    } catch (error) {
      console.error('健康检查失败:', error);
    }
  };

  // 环境切换回调
  const handleEnvironmentChange = (env: Environment) => {
    console.log('环境已切换:', env);
    // 重新加载数据
    setTimeout(loadData, 1000);
  };

  // 初始加载
  useEffect(() => {
    if (!environment.isLoading) {
      loadData();
      checkHealth();
    }
  }, [environment.current]);

  if (environment.isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>🌍 正在检测环境...</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Solar React 环境管理系统
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* 环境切换器 */}
      <EnvSwitcher 
        onEnvironmentChange={handleEnvironmentChange}
        position="top-right"
        showInProduction={true}
      />

      {/* 页面头部 */}
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          margin: '0 0 8px 0',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>🌞 Solar React App</span>
          <span style={{
            background: environment.current.color,
            color: 'white',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {environment.current.displayName}
          </span>
        </h1>
        <p style={{ margin: '0', color: '#666' }}>
          多环境管理演示应用 - 当前环境: {environment.current.domain}
        </p>
      </header>

      {/* 环境信息卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* 当前环境 */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>🌍 当前环境</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <div><strong>名称:</strong> {environment.current.displayName}</div>
            <div><strong>域名:</strong> {environment.current.domain}</div>
            <div><strong>API:</strong> {environment.current.apiUrl}</div>
            <div><strong>VConsole:</strong> {environment.current.vconsole ? '✅' : '❌'}</div>
            {environment.current.features && (
              <div>
                <strong>特性:</strong> {environment.current.features.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* 健康状态 */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
            🏥 API健康状态
            <button 
              onClick={checkHealth}
              style={{
                marginLeft: '12px',
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              检查
            </button>
          </h3>
          {healthStatus ? (
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div>
                <strong>状态:</strong> 
                <span style={{
                  color: healthStatus.status === 'healthy' ? '#4CAF50' : '#F44336',
                  marginLeft: '8px'
                }}>
                  {healthStatus.status === 'healthy' ? '✅ 健康' : '❌ 异常'}
                </span>
              </div>
              <div><strong>响应时间:</strong> {healthStatus.responseTime}ms</div>
              <div><strong>检查时间:</strong> {new Date(healthStatus.timestamp).toLocaleString()}</div>
            </div>
          ) : (
            <div style={{ color: '#666', fontSize: '14px' }}>点击"检查"按钮获取状态</div>
          )}
        </div>
      </div>

      {/* 数据展示 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {/* 用户信息 */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
            👤 用户信息
            <button 
              onClick={loadData}
              disabled={loading}
              style={{
                marginLeft: '12px',
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '加载中...' : '刷新'}
            </button>
          </h3>
          
          {loading ? (
            <div style={{ color: '#666', fontSize: '14px' }}>🔄 加载中...</div>
          ) : userInfo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src={userInfo.avatar} 
                alt="头像"
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%',
                  border: '2px solid #e1e5e9'
                }}
              />
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <div><strong>{userInfo.name}</strong></div>
                <div style={{ color: '#666' }}>{userInfo.email}</div>
                <div style={{ color: '#666', fontSize: '12px' }}>ID: {userInfo.id}</div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#999', fontSize: '14px' }}>暂无数据</div>
          )}
        </div>

        {/* 应用数据 */}
        <div style={{
          background: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>📊 应用数据</h3>
          
          {loading ? (
            <div style={{ color: '#666', fontSize: '14px' }}>🔄 加载中...</div>
          ) : appData ? (
            <div>
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginBottom: '12px' 
              }}>
                总计: {appData.total} 项
              </div>
              {appData.list.map(item => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{item.name}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    background: item.status === 'active' ? '#e8f5e8' : '#f5f5f5',
                    color: item.status === 'active' ? '#2e7d32' : '#666'
                  }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#999', fontSize: '14px' }}>暂无数据</div>
          )}
        </div>
      </div>

      {/* 调试信息 */}
      {environment.isDevelopment && (
        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: '#f8f9fa',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'Monaco, Consolas, monospace'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>🐛 调试信息 (仅开发环境显示)</h4>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{JSON.stringify({
  environment: environment.current,
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString(),
  windowSize: `${window.innerWidth}x${window.innerHeight}`
}, null, 2)}
          </pre>
        </div>
      )}

      {/* VConsole提示 */}
      {environment.shouldShowVConsole && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: '#4CAF50',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9998
        }}>
          🔍 VConsole已启用 - 移动端可查看调试信息
        </div>
      )}
    </div>
  );
};

export default ExampleApp;
