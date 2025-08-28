# SSR 水合错误解决指南

## 🐛 问题描述

```
Hydration failed because the server rendered HTML didn't match the client.
```

这个错误在 Next.js 等 SSR 框架中很常见，表示服务端渲染的 HTML 与客户端渲染的结果不匹配。

## 🔍 常见原因

### 1. 直接访问浏览器 API
```typescript
// ❌ 错误：服务端没有 window 对象
const [size, setSize] = useState({ 
  width: window.innerWidth,  // ReferenceError in SSR
  height: window.innerHeight 
});

// ❌ 错误：服务端没有 navigator 对象  
const [isOnline, setIsOnline] = useState(navigator.onLine);
```

### 2. 随机值或时间戳
```typescript
// ❌ 错误：每次调用结果不同
const [id] = useState(Math.random().toString());
const [timestamp] = useState(Date.now());
```

### 3. 本地化或时区相关
```typescript
// ❌ 错误：服务端和客户端时区可能不同
const [time] = useState(new Date().toLocaleString());
```

## ✅ 解决方案

### 方案1：使用 useEffect 延迟设置
```typescript
const WindowSize = ({ children }) => {
  const [size, setSize] = useState({ width: 0, height: 0 }); // 统一初始值

  useEffect(() => {
    // 只在客户端执行
    setSize({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <>{children(size)}</>;
};
```

### 方案2：使用 useClientOnly Hook
```typescript
function useClientOnly(): boolean {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
}

const OnlineStatus = ({ children }) => {
  const isClient = useClientOnly();
  const [isOnline, setIsOnline] = useState(true); // 统一初始值

  useEffect(() => {
    if (!isClient) return; // 等待客户端

    setIsOnline(navigator.onLine);
    // ... 事件监听器
  }, [isClient]);

  return <>{children({ isOnline })}</>;
};
```

### 方案3：条件渲染（适用于非关键内容）
```typescript
const ClientOnlyComponent = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>; // 服务端渲染占位符
  }

  return <>{children}</>;
};
```

## 🎯 最佳实践

### 1. 统一初始状态
```typescript
// ✅ 服务端和客户端使用相同的初始值
const [size, setSize] = useState({ width: 0, height: 0 });
const [isOnline, setIsOnline] = useState(true);
const [loading, setLoading] = useState(false);
```

### 2. 使用 useEffect 进行客户端专用逻辑
```typescript
useEffect(() => {
  // 所有浏览器 API 调用都放在这里
  if (typeof window !== 'undefined') {
    // 安全地访问 window
  }
}, []);
```

### 3. 创建自定义 Hook
```typescript
// 封装常用的 SSR 兼容逻辑
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize(); // 设置初始值
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}
```

### 4. 使用 Next.js 的 dynamic 导入
```typescript
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(() => import('./ClientOnlyComponent'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});
```

## 🚫 避免的错误模式

### 1. 条件分支导致不同渲染结果
```typescript
// ❌ 错误：服务端和客户端渲染不同内容
if (typeof window !== 'undefined') {
  return <ClientComponent />;
} else {
  return <ServerComponent />;
}
```

### 2. 在 useState 初始化时访问浏览器 API
```typescript
// ❌ 错误：初始化时就访问浏览器 API
const [theme] = useState(localStorage.getItem('theme') || 'light');
```

### 3. 依赖外部变化的数据
```typescript
// ❌ 错误：外部数据可能在服务端和客户端不同
const [userAgent] = useState(navigator.userAgent);
```

## 🔧 调试技巧

### 1. 检查控制台错误
- 寻找 "Hydration failed" 错误
- 查看具体的不匹配信息

### 2. 使用 React DevTools
- 检查组件树的差异
- 查看 props 和 state 的不匹配

### 3. 添加调试日志
```typescript
useEffect(() => {
  console.log('Client hydrated:', { 
    width: window.innerWidth, 
    height: window.innerHeight 
  });
}, []);
```

## 📚 相关资源

- [Next.js SSR 文档](https://nextjs.org/docs/basic-features/pages#server-side-rendering)
- [React 水合文档](https://react.dev/reference/react-dom/client/hydrateRoot)
- [useEffect Hook](https://react.dev/reference/react/useEffect)

---

遵循这些最佳实践，可以有效避免 SSR 水合错误，确保应用在服务端和客户端都能正常工作。
