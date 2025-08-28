import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import Counter from './components/Counter';
import FeatureList from './components/FeatureList';
import About from './components/About';
import VEnvConsole from './components/VEnvConsole';
import EnvSwitcher from './components/env-switcher/EnvSwitcher';
import { useEnvironment } from './components/env-switcher/useEnvironment';
import { createApiManager } from './components/env-switcher/ApiManager';

function App() {
  const environment = useEnvironment();
  const [isApiInitialized, setIsApiInitialized] = useState(false);
  
  // 初始化API管理器
  useEffect(() => {
    if (!environment.isLoading) {
      try {
        createApiManager(environment.current);
        setIsApiInitialized(true);
        console.log('✅ API管理器已初始化:', environment.current.name);
      } catch (error) {
        console.error('❌ API管理器初始化失败:', error);
        setIsApiInitialized(false);
      }
    }
  }, [environment.current, environment.isLoading]);

  // 如果还在加载环境或API未初始化，显示加载状态
  if (environment.isLoading || !isApiInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ fontSize: '18px' }}>🌍 正在初始化Solar环境...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {environment.isLoading ? '检测环境中...' : '初始化API管理器...'}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* 环境切换器 */}
      <EnvSwitcher 
        position="top-right"
        showInProduction={false}
        onEnvironmentChange={(env) => {
          console.log('环境已切换:', env);
          // 重新初始化API管理器
          try {
            createApiManager(env);
            console.log('✅ API管理器已重新初始化:', env.name);
          } catch (error) {
            console.error('❌ API管理器重新初始化失败:', error);
          }
        }}
      />
      
      {/* VEnv Console - 可拖拽的虚环境管理面板 */}
      <VEnvConsole 
        position="bottom-right"
        theme="dark"
      />
      
      <header className="header">
        <h1>🌞 Solar React 脚手架</h1>
        <p>功能完整的React开发环境</p>
        {!environment.isLoading && (
          <div style={{ 
            marginTop: '12px', 
            fontSize: '14px',
            opacity: 0.9
          }}>
            当前环境: <strong>{environment.current.displayName || environment.current.name}</strong>
            {environment.current.vconsole && <span> | VConsole已启用 🔍</span>}
          </div>
        )}
      </header>
      
      <nav style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>首页</Link>
        <Link to="/about">关于</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={
          <>
            <Counter />
            <FeatureList />
          </>
        } />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
