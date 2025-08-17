'use client';

import React, { useState, useEffect, useRef } from 'react';

// 1. 鼠标位置追踪组件
interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  children: (mousePosition: MousePosition) => React.ReactNode;
}

const MouseTracker: React.FC<MouseTrackerProps> = ({ children }) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <>{children(mousePosition)}</>;
};

// 2. 数据获取组件
interface DataFetcherState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface DataFetcherProps<T> {
  url: string;
  children: (state: DataFetcherState<T>) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('请求失败');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return <>{children({ data, loading, error, refetch: fetchData })}</>;
}

// 3. 计时器组件
interface TimerState {
  seconds: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

interface TimerProps {
  children: (timer: TimerState) => React.ReactNode;
}

const Timer: React.FC<TimerProps> = ({ children }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  const stop = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    stop();
    setSeconds(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return <>{children({ seconds, isRunning, start, stop, reset })}</>;
};

// 4. 本地存储组件
interface LocalStorageState<T> {
  value: T | null;
  setValue: (value: T) => void;
  removeValue: () => void;
}

interface LocalStorageProps<T> {
  key: string;
  defaultValue?: T;
  children: (storage: LocalStorageState<T>) => React.ReactNode;
}

function LocalStorage<T>({ key, defaultValue, children }: LocalStorageProps<T>) {
  const [value, setValue] = useState<T | null>(() => {
    if (typeof window === 'undefined') return defaultValue || null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  });

  const setStorageValue = (newValue: T) => {
    setValue(newValue);
    try {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('保存到本地存储失败:', error);
    }
  };

  const removeStorageValue = () => {
    setValue(null);
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('从本地存储删除失败:', error);
    }
  };

  return <>{children({ value, setValue: setStorageValue, removeValue: removeStorageValue })}</>;
}

// 主页面组件
export default function RenderPropsDemo() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Render Props 模式实例</h1>
      
      <div className="space-y-8">
        {/* 鼠标追踪示例 */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">1. 鼠标位置追踪</h2>
          <MouseTracker>
            {({ x, y }) => (
              <div className="h-32 bg-blue-100 rounded border-2 border-dashed border-blue-300 flex items-center justify-center">
                <p className="text-blue-800">
                  鼠标位置: X: {x}, Y: {y}
                </p>
              </div>
            )}
          </MouseTracker>
        </div>

        {/* 数据获取示例 */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">2. 数据获取</h2>
          <DataFetcher<any> url="https://jsonplaceholder.typicode.com/posts/1">
            {({ data, loading, error, refetch }) => (
              <div>
                {loading && <p className="text-green-600">加载中...</p>}
                {error && <p className="text-red-600">错误: {error}</p>}
                {data && (
                  <div className="bg-green-100 p-4 rounded">
                    <h3 className="font-semibold">{data.title}</h3>
                    <p className="text-sm text-green-700">{data.body}</p>
                  </div>
                )}
                <button
                  onClick={refetch}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  重新获取
                </button>
              </div>
            )}
          </DataFetcher>
        </div>

        {/* 计时器示例 */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">3. 计时器</h2>
          <Timer>
            {({ seconds, isRunning, start, stop, reset }) => (
              <div className="text-center">
                <div className="text-4xl font-mono text-yellow-800 mb-4">
                  {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={start}
                    disabled={isRunning}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                  >
                    开始
                  </button>
                  <button
                    onClick={stop}
                    disabled={!isRunning}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    停止
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
          </Timer>
        </div>

        {/* 本地存储示例 */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">4. 本地存储</h2>
          <LocalStorage<string> key="user-note" defaultValue="">
            {({ value, setValue, removeValue }) => (
              <div>
                <textarea
                  value={value || ''}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="输入一些文本，它会自动保存到本地存储..."
                  className="w-full p-3 border rounded-md"
                  rows={4}
                />
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => setValue('这是一个示例文本')}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    设置示例文本
                  </button>
                  <button
                    onClick={removeValue}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    清除
                  </button>
                </div>
              </div>
            )}
          </LocalStorage>
        </div>

        {/* 手写练习区域 */}
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
          <h2 className="text-xl font-semibold mb-4">🚀 你的练习区域</h2>
          <p className="text-gray-600 mb-4">
            在下面的区域手写一个 Render Props 组件！建议实现：
          </p>
          <ul className="text-sm text-gray-600 mb-4 space-y-1">
            <li>• <strong>WindowSize</strong> - 追踪窗口尺寸变化</li>
            <li>• <strong>OnlineStatus</strong> - 检测网络连接状态</li>
            <li>• <strong>Counter</strong> - 计数器逻辑</li>
            <li>• <strong>Toggle</strong> - 开关状态管理</li>
            <li>• <strong>Geolocation</strong> - 获取地理位置</li>
          </ul>
          
          {/* 这里是你手写代码的区域 */}
          <div className="bg-white p-4 rounded border min-h-32">
            <p className="text-gray-400 text-center">
              在这里手写你的 Render Props 组件...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
