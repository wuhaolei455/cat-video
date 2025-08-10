# 高级状态管理模式演示

本项目展示了React中的高级状态管理模式，包括Context + useReducer、自定义Hooks、forwardRef + useImperativeHandle等核心技术。

## 🎯 项目概述

### 两个演示版本对比

| 特性 | 基础版本 (page.tsx) | 高级版本 (advanced/page.tsx) |
|------|-------------------|---------------------------|
| 状态管理 | useState | useReducer |
| 状态复杂度 | 简单对象 | 复杂嵌套状态 |
| Action定义 | 函数调用 | TypeScript联合类型 |
| 性能优化 | 基础 | useMemo/useCallback/useRef |
| 组件通信 | Props传递 | forwardRef + useImperativeHandle |
| 业务逻辑 | 组件内部 | 自定义Hooks封装 |

## 🏗️ 核心技术实现

### 1. Context + useReducer 状态管理

#### 状态结构设计
```typescript
interface VideoFlowState {
  // 流程控制
  currentStep: FlowStep;
  steps: FlowStep[];
  isFlowCompleted: boolean;
  
  // 视频状态
  videoStatus: VideoStatus;
  currentTime: number;
  duration: number;
  volume: number;
  // ... 更多状态
  
  // 分析数据
  analytics: {
    watchTime: number;
    interactions: number;
    errors: string[];
    events: Array<{
      type: string;
      timestamp: number;
      data?: any;
    }>;
  };
}
```

#### TypeScript Action 类型定义
```typescript
export type VideoFlowAction = 
  // 流程控制 Actions
  | { type: 'FLOW_NEXT_STEP' }
  | { type: 'FLOW_PREV_STEP' }
  | { type: 'FLOW_GO_TO_STEP'; payload: { step: FlowStep } }
  
  // 视频控制 Actions  
  | { type: 'VIDEO_PLAY' }
  | { type: 'VIDEO_PAUSE' }
  | { type: 'VIDEO_SEEK'; payload: { time: number } }
  
  // 分析 Actions
  | { type: 'ANALYTICS_ADD_EVENT'; payload: { type: string; data?: any } }
  // ... 更多Action类型
```

**优势**:
- ✅ **类型安全**: TypeScript联合类型确保Action类型正确
- ✅ **可预测**: 所有状态变更都通过reducer统一处理
- ✅ **可调试**: 清晰的Action日志便于调试
- ✅ **可测试**: 纯函数reducer易于单元测试

### 2. useReducer 处理复杂状态逻辑

```typescript
const videoFlowReducer = (state: VideoFlowState, action: VideoFlowAction): VideoFlowState => {
  switch (action.type) {
    case 'FLOW_NEXT_STEP': {
      const currentIndex = state.steps.indexOf(state.currentStep);
      const nextIndex = Math.min(currentIndex + 1, state.steps.length - 1);
      const nextStep = state.steps[nextIndex];
      
      return {
        ...state,
        currentStep: nextStep,
        isFlowCompleted: nextIndex === state.steps.length - 1,
        analytics: {
          ...state.analytics,
          events: [
            ...state.analytics.events,
            { 
              type: 'flow_step_change', 
              timestamp: Date.now(), 
              data: { from: state.currentStep, to: nextStep } 
            }
          ]
        }
      };
    }
    // ... 更多cases
  }
};
```

**核心特点**:
- 🔄 **不可变更新**: 始终返回新的状态对象
- 📊 **副作用处理**: 在状态更新的同时记录分析数据
- 🎯 **逻辑集中**: 所有状态变更逻辑集中在reducer中
- 🔍 **易于追踪**: 每个Action都有明确的状态变更逻辑

### 3. 自定义 Hooks 设计原则

#### useVideoPlayer Hook
```typescript
export const useVideoPlayer = () => {
  const { state, videoActions, uiActions, computed } = useVideoFlow();
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // 播放/暂停切换
  const togglePlay = useCallback(() => {
    if (state.videoStatus === VideoStatus.PLAYING) {
      videoActions.pause();
    } else {
      videoActions.play();
    }
  }, [state.videoStatus, videoActions]);
  
  // 键盘快捷键处理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 快捷键逻辑
  }, [/* dependencies */]);
  
  return {
    // Refs
    videoRef,
    progressRef,
    
    // 状态
    videoStatus: state.videoStatus,
    currentTime: state.currentTime,
    // ... 更多状态
    
    // 方法
    togglePlay,
    loadVideo: videoActions.loadVideo,
    // ... 更多方法
  };
};
```

**设计原则**:
- 🎯 **单一职责**: 每个Hook只负责特定的业务逻辑
- 🔄 **状态封装**: 隐藏复杂的状态管理细节
- 📦 **逻辑复用**: 可在多个组件间复用
- 🎨 **接口清晰**: 提供简洁明了的API

#### useVideoAnalytics Hook
```typescript
export const useVideoAnalytics = () => {
  const { state } = useVideoFlow();
  
  // 使用useMemo优化复杂计算
  const completionRate = useMemo(() => {
    if (state.duration === 0) return 0;
    return (state.currentTime / state.duration) * 100;
  }, [state.currentTime, state.duration]);
  
  const eventStats = useMemo(() => {
    const stats: Record<string, number> = {};
    state.analytics.events.forEach(event => {
      stats[event.type] = (stats[event.type] || 0) + 1;
    });
    return stats;
  }, [state.analytics.events]);
  
  return {
    // 原始数据
    watchTime: state.analytics.watchTime,
    interactions: state.analytics.interactions,
    
    // 计算属性
    completionRate,
    eventStats,
    
    // 格式化数据
    formattedWatchTime: new Date(state.analytics.watchTime).toISOString().substr(11, 8)
  };
};
```

### 4. forwardRef + useImperativeHandle 实现

```typescript
export interface VideoPlayerRef {
  // 视频元素引用
  video: HTMLVideoElement | null;
  
  // 播放控制方法
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  
  // 状态获取方法
  getCurrentTime: () => number;
  getDuration: () => number;
  isPaused: () => boolean;
  
  // 高级控制
  screenshot: () => string | null;
  reset: () => void;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
  onPlay,
  onPause,
  onTimeUpdate,
  // ... 其他props
}, ref) => {
  const { videoRef, /* ... 其他状态和方法 */ } = useVideoPlayer();
  
  // 使用useImperativeHandle暴露方法给父组件
  useImperativeHandle(ref, () => ({
    // 视频元素引用
    video: videoRef.current,
    
    // 播放控制方法
    play: async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.play();
          onPlay?.();
        } catch (error) {
          console.error('播放失败:', error);
        }
      }
    },
    
    pause: () => {
      if (videoRef.current) {
        videoRef.current.pause();
        onPause?.();
      }
    },
    
    // 高级控制
    screenshot: () => {
      if (!videoRef.current || !canvasRef.current) return null;
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      // 绘制当前帧到画布
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // 返回base64格式的图片数据
      return canvas.toDataURL('image/png');
    }
    
    // ... 更多方法
  }), [/* dependencies */]);
  
  return (
    <div className="video-player-container">
      <video ref={videoRef} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* 控制UI */}
    </div>
  );
});
```

**应用场景**:
- 🎮 **命令式API**: 提供类似DOM API的命令式接口
- 🔌 **第三方库集成**: 封装第三方库的复杂API
- 🎯 **精确控制**: 父组件需要精确控制子组件行为
- 📦 **组件库开发**: 为组件库提供丰富的API

### 5. 性能优化技巧

#### useMemo 应用
```typescript
// 优化复杂计算
const videoOptions = useMemo(() => [
  {
    id: 'demo1',
    title: '演示视频 1',
    src: 'https://example.com/video1.mp4',
    // ...
  },
  // ...
], []); // 空依赖数组，只计算一次

// 优化派生状态
const performanceStats = useMemo(() => {
  const performanceEvents = state.analytics.events.filter(e => e.type === 'performance_check');
  
  if (performanceEvents.length === 0) return { /* default values */ };
  
  // 复杂计算逻辑
  return {
    avgMemoryUsage: Math.round(totalMemory / performanceEvents.length / 1024 / 1024),
    avgRenderTime: Math.round(totalRenderTime / performanceEvents.length),
    // ...
  };
}, [state.analytics.events]);
```

#### useCallback 应用
```typescript
// 优化事件处理函数
const handleVideoSelect = useCallback((videoSrc: string) => {
  setSelectedVideo(videoSrc);
  dispatch({ type: 'CONFIG_UPDATE', payload: { config: { src: videoSrc } } });
  dispatch({ type: 'ANALYTICS_ADD_EVENT', payload: { type: 'video_selected', data: { src: videoSrc } } });
}, [dispatch]);

// 优化子组件props
const handleStepClick = useCallback((step: string) => {
  flowControl.goToStep(step as any);
  dispatch({ type: 'ANALYTICS_INCREMENT_INTERACTIONS' });
}, [flowControl, dispatch]);
```

#### useRef 应用
```typescript
const AdvancedVideoController: React.FC = () => {
  // 存储不需要触发重渲染的值
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const renderCountRef = useRef(0);
  const lastInteractionRef = useRef<number>(Date.now());
  const performanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 渲染次数统计
  renderCountRef.current += 1;
  
  // 定时器管理
  useEffect(() => {
    performanceTimerRef.current = setInterval(() => {
      // 性能数据收集
    }, 5000);
    
    return () => {
      if (performanceTimerRef.current) {
        clearInterval(performanceTimerRef.current);
        performanceTimerRef.current = null;
      }
    };
  }, []);
  
  // ...
};
```

#### React.memo 组件优化
```typescript
// 防止不必要的重渲染
const StepIndicator = memo<{ 
  currentStep: string; 
  steps: string[]; 
  onStepClick: (step: string) => void 
}>(({ currentStep, steps, onStepClick }) => {
  console.log('StepIndicator 渲染'); // 调试用
  
  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div
          key={step}
          className={`step-item ${step === currentStep ? 'active' : ''}`}
          onClick={() => onStepClick(step)}
        >
          {/* 组件内容 */}
        </div>
      ))}
    </div>
  );
});
```

## 🎓 学习要点总结

### Context API 的正确使用方式
1. **避免过度嵌套**: 不要为每个状态都创建Context
2. **合理拆分**: 按功能领域拆分Context
3. **性能考虑**: 使用useMemo优化Context value
4. **错误边界**: 提供Context不存在时的错误处理

### useReducer vs useState
| 场景 | useState | useReducer |
|------|----------|------------|
| 简单状态 | ✅ 推荐 | ❌ 过度设计 |
| 复杂对象 | ⚠️ 可用但繁琐 | ✅ 推荐 |
| 状态间关联 | ❌ 难以管理 | ✅ 推荐 |
| 状态变更逻辑复杂 | ❌ 分散难维护 | ✅ 推荐 |
| 需要时间旅行调试 | ❌ 不支持 | ✅ 支持 |

### 自定义Hook设计原则
1. **单一职责**: 一个Hook只做一件事
2. **命名规范**: 以use开头，描述功能
3. **返回值设计**: 对象解构 vs 数组解构的选择
4. **依赖管理**: 正确处理useEffect依赖
5. **错误处理**: 提供合适的错误边界

### 性能优化最佳实践
1. **测量优先**: 先测量再优化，避免过早优化
2. **合理使用**: useMemo/useCallback有成本，不要滥用
3. **依赖数组**: 正确设置依赖数组，避免无限循环
4. **组件拆分**: 合理拆分组件，减少重渲染范围
5. **状态提升**: 状态放在合适的层级，避免不必要的传递

## 🚀 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

- 基础演示: `http://localhost:3000`
- 高级演示: `http://localhost:3000/advanced`

## 📁 项目结构

```
src/
├── contexts/
│   ├── FlowContext.tsx          # 基础版本 - useState
│   └── VideoFlowContext.tsx     # 高级版本 - useReducer
├── hooks/
│   └── useVideoPlayer.ts        # 自定义Hooks集合
├── components/
│   ├── Controller.tsx           # 基础控制器
│   ├── AdvancedVideoController.tsx  # 高级控制器
│   ├── VideoPlayer.tsx          # forwardRef视频播放器
│   └── [其他组件...]
└── app/
    ├── page.tsx                 # 基础演示页面
    └── advanced/
        └── page.tsx             # 高级演示页面
```

这个项目完整展示了React中状态管理的进化过程，从简单的useState到复杂的useReducer，从基础的props传递到高级的forwardRef模式，是学习React状态管理的绝佳实践案例。
