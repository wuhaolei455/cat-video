'use client';

import React, { useState, useEffect } from 'react';

// 自定义 Hook：处理 SSR 水合问题
function useClientOnly(): boolean {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
}

// 📝 练习1: 手写一个 WindowSize 组件
// 要求：追踪窗口尺寸变化，提供 width 和 height
// 提示：使用 window.addEventListener('resize', handler)

interface WindowSizeState {
  width: number;
  height: number;
}

interface WindowSizeProps {
  children: (size: WindowSizeState) => React.ReactNode;
}

const WindowSize: React.FC<WindowSizeProps> = ({ children }) => {
  const isClient = useClientOnly();
  const [size, setSize] = useState<WindowSizeState>({ width: 0, height: 0 });

  useEffect(() => {
    if (!isClient) return;

    // 设置初始尺寸
    setSize({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);
  
  return <>{children(size)}</>;
};

// 📝 练习2: 手写一个 OnlineStatus 组件
// 要求：检测网络连接状态
// 提示：使用 navigator.onLine 和 online/offline 事件

interface OnlineStatusState {
  isOnline: boolean;
}

interface OnlineStatusProps {
  children: (status: OnlineStatusState) => React.ReactNode;
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({ children }) => {
  const isClient = useClientOnly();
  const [isOnline, setIsOnline] = useState(true); // 统一的初始值

  useEffect(() => {
    if (!isClient) return;

    // 设置真实的网络状态
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isClient]);
  
  return <>{children({ isOnline })}</>;
};

// 📝 练习3: 手写一个 Counter 组件
// 要求：提供计数器功能，包括增加、减少、重置
// 提示：管理 count 状态和相关方法

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

interface CounterProps {
  initialValue?: number;
  children: (counter: CounterState) => React.ReactNode;
}

const Counter: React.FC<CounterProps> = ({ initialValue = 0, children }) => {
  // 🚀 在这里实现你的代码
  // TODO: 实现计数器逻辑
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);

  return <>{children({ 
    count: count, 
    increment: increment, 
    decrement: decrement, 
    reset: reset 
  })}</>;
};

// 📝 练习4: 手写一个 Toggle 组件
// 要求：管理开关状态，提供切换功能
// 提示：管理 boolean 状态和 toggle 方法

interface ToggleState {
  isOn: boolean;
  toggle: () => void;
  turnOn: () => void;
  turnOff: () => void;
}

interface ToggleProps {
  initialState?: boolean;
  children: (toggle: ToggleState) => React.ReactNode;
}

const Toggle: React.FC<ToggleProps> = ({ initialState = false, children }) => {
  // 🚀 在这里实现你的代码
  // TODO: 实现开关逻辑
  const [isOn, setIsOn] = useState(initialState);

  const toggle = () => setIsOn(prev => !prev);
  const turnOn = () => setIsOn(true);
  const turnOff = () => setIsOn(false);
  
  return <>{children({ 
    isOn: isOn, 
    toggle: toggle, 
    turnOn: turnOn, 
    turnOff: turnOff 
  })}</>;
};

// 📝 练习5: 手写一个 Geolocation 组件 (挑战题)
// 要求：获取用户地理位置，处理权限和错误
// 提示：使用 navigator.geolocation.getCurrentPosition

interface GeolocationState {
  coords: GeolocationCoordinates | null;
  error: string | null;
  loading: boolean;
  getCurrentLocation: () => void;
}

interface GeolocationProps {
  children: (geo: GeolocationState) => React.ReactNode;
}

const Geolocation: React.FC<GeolocationProps> = ({ children }) => {
  // 🚀 在这里实现你的代码
  // TODO: 实现地理位置获取逻辑
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    // 检查浏览器是否支持地理位置
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('浏览器不支持地理位置功能');
      return;
    }

    setLoading(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords(position.coords);
        setError(null);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setCoords(null);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return <>{children({
    coords: coords, 
    error: error, 
    loading: loading,
    getCurrentLocation: getCurrentLocation
  })}</>;
};

// 主页面 - 测试你的实现
export default function RenderPropsPractice() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Render Props 手写练习</h1>
      
      <div className="space-y-8">
        {/* 练习1测试 */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">练习1: WindowSize</h2>
          <WindowSize>
            {({ width, height }) => (
              <div className="bg-blue-100 p-4 rounded">
                <p className="text-blue-800">
                  窗口尺寸: {width} x {height}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  调整浏览器窗口大小来测试
                </p>
              </div>
            )}
          </WindowSize>
        </div>

        {/* 练习2测试 */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">练习2: OnlineStatus</h2>
          <OnlineStatus>
            {({ isOnline }) => (
              <div className={`p-4 rounded ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className={isOnline ? 'text-green-800' : 'text-red-800'}>
                  网络状态: {isOnline ? '在线' : '离线'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  断开网络连接来测试
                </p>
              </div>
            )}
          </OnlineStatus>
        </div>

        {/* 练习3测试 */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">练习3: Counter</h2>
          <Counter initialValue={10}>
            {({ count, increment, decrement, reset }) => (
              <div className="bg-yellow-100 p-4 rounded text-center">
                <div className="text-3xl font-bold text-yellow-800 mb-4">
                  {count}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={increment}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    +1
                  </button>
                  <button
                    onClick={decrement}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    -1
                  </button>
                  <button
                    onClick={reset}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    重置
                  </button>
                </div>
              </div>
            )}
          </Counter>
        </div>

        {/* 练习4测试 */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">练习4: Toggle</h2>
          <Toggle initialState={true}>
            {({ isOn, toggle, turnOn, turnOff }) => (
              <div className="bg-purple-100 p-4 rounded">
                <div className={`inline-flex items-center p-2 rounded ${isOn ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                  状态: {isOn ? '开启' : '关闭'}
                </div>
                <div className="mt-4 space-x-2">
                  <button
                    onClick={toggle}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    切换
                  </button>
                  <button
                    onClick={turnOn}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    开启
                  </button>
                  <button
                    onClick={turnOff}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}
          </Toggle>
        </div>

        {/* 练习5测试 */}
        <div className="bg-pink-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">练习5: Geolocation (挑战题)</h2>
          <Geolocation>
            {({ coords, error, loading, getCurrentLocation }) => (
              <div className="bg-pink-100 p-4 rounded">
                {loading && <p className="text-pink-600">获取位置中...</p>}
                {error && <p className="text-red-600">错误: {error}</p>}
                {coords && (
                  <div className="text-pink-800">
                    <p>纬度: {coords.latitude}</p>
                    <p>经度: {coords.longitude}</p>
                    <p>精度: {coords.accuracy}米</p>
                  </div>
                )}
                <button
                  onClick={getCurrentLocation}
                  disabled={loading}
                  className="mt-2 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
                >
                  {loading ? '获取中...' : '获取位置'}
                </button>
              </div>
            )}
          </Geolocation>
        </div>

        {/* 提示区域 */}
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
          <h2 className="text-xl font-semibold mb-4">💡 实现提示</h2>
          <div className="space-y-4 text-sm">
            <div>
              <strong>WindowSize:</strong>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
{`const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

useEffect(() => {
  const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);`}
              </pre>
            </div>
            
            <div>
              <strong>OnlineStatus:</strong>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
{`const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);`}
              </pre>
            </div>
            
            <div>
              <strong>其他组件:</strong>
              <p className="text-gray-600">使用 useState 管理状态，创建相应的操作函数</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
