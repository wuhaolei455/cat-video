# React 状态管理模式对比演示

这个项目展示了React中两种主要的状态管理模式：useState 和 useReducer，通过相同的UI和功能来对比它们的差异。

## 🎯 项目特点

- ✅ **保持原有UI**: 完全相同的界面和用户体验
- ✅ **功能一致**: 两个版本提供完全相同的功能
- ✅ **代码复用**: 所有子组件通过适配器模式同时支持两种状态管理
- ✅ **简洁对比**: 专注于状态管理的核心差异

## 📱 两个版本

### 1. useState 版本 (`/`)
- 使用 `useState` 管理状态
- 多个 `setState` 调用分散在各个方法中
- 适合简单状态管理

### 2. useReducer 版本 (`/reducer`) 
- 使用 `useReducer` 管理状态
- 所有状态变更通过 Action 集中处理
- 适合复杂状态管理

## 🏗️ 核心技术实现

### TypeScript Action 类型定义

```typescript
export type FlowAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: { step: number } }
  | { type: 'SET_DATA'; payload: { key: string; value: any } }
  | { type: 'RESET'; payload: { totalSteps: number; initialData: Record<string, any> } };
```

### useReducer 处理状态逻辑

```typescript
const flowReducer = (state: FlowState, action: FlowAction): FlowState => {
  switch (action.type) {
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
        isCompleted: state.currentStep >= state.totalSteps
      };
    // ... 更多cases
  }
};
```

### 适配器模式实现兼容性

```typescript
export const useFlowAdapter = (): UnifiedFlowContextType => {
  // 尝试获取useReducer版本的Context
  const reducerContext = useContext(FlowReducerContext);
  
  // 如果存在useReducer版本，使用它
  if (reducerContext) {
    return {
      state: reducerContext.state,
      nextStep: reducerContext.nextStep,
      // ...
      stateManager: 'useReducer'
    };
  }
  
  // 否则使用useState版本的Context
  const stateContext = useContext(FlowContext);
  // ...
};
```

## 📊 对比分析

| 特性 | useState | useReducer |
|------|----------|------------|
| **适用场景** | 简单状态 | 复杂状态 |
| **状态更新** | 分散在各处 | 集中在reducer |
| **类型安全** | 基础 | Action类型约束 |
| **调试性** | 一般 | 优秀(Action日志) |
| **可预测性** | 一般 | 高(纯函数) |
| **测试性** | 一般 | 高(reducer可单独测试) |

## 🎓 学习要点

### Context + useReducer 的优势

1. **集中状态管理**: 所有状态变更逻辑集中在reducer中
2. **类型安全**: TypeScript Action类型确保操作正确性
3. **可预测**: 纯函数reducer，相同输入总是相同输出
4. **易调试**: 清晰的Action日志，支持时间旅行调试
5. **易测试**: reducer是纯函数，容易编写单元测试

### 自定义Hook设计原则

1. **适配器模式**: `useFlowAdapter` 让组件无需关心底层状态管理实现
2. **接口统一**: 保持相同的API，降低学习成本
3. **渐进增强**: 可以从useState无缝升级到useReducer

## 🚀 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器  
npm run dev
```

- useState版本: `http://localhost:3000`
- useReducer版本: `http://localhost:3000/reducer`

## 📁 项目结构

```
src/
├── contexts/
│   ├── FlowContext.tsx          # useState版本
│   └── FlowReducerContext.tsx   # useReducer版本
├── hooks/
│   └── useFlowAdapter.ts        # 适配器Hook
├── components/
│   ├── Controller.tsx           # useState版本控制器
│   ├── ReducerController.tsx    # useReducer版本控制器
│   └── [共享子组件...]         # 通过适配器支持两种版本
└── app/
    ├── page.tsx                 # useState演示
    └── reducer/
        └── page.tsx             # useReducer演示
```

## 💡 最佳实践

1. **简单状态用useState**: 单一值或简单对象
2. **复杂状态用useReducer**: 多个相关状态、复杂更新逻辑
3. **适配器模式**: 让组件适配多种状态管理方式
4. **TypeScript**: 使用联合类型定义Action，确保类型安全
5. **纯函数**: 保持reducer为纯函数，便于测试和调试

这个演示项目完美展示了如何在相同功能基础上对比不同的状态管理方案，是学习React状态管理的绝佳案例。
