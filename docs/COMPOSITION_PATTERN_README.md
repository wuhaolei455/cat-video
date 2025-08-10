# React 组合模式演示 (Composition Pattern Demo)

这个项目演示了React中的组合模式(Composition Pattern)，展示如何通过组合多个子组件来构建复杂的功能。

## 🎯 核心概念

组合模式的核心思想是：
```typescript
// 主组件通过组合多个子组件实现功能
<FlowContext.Provider value={contextProps}>
  <Controller />
</FlowContext.Provider>
```

## 🏗️ 项目结构

```
src/
├── contexts/
│   └── FlowContext.tsx          # 流程状态管理上下文
├── components/
│   ├── Controller.tsx           # 主控制器组件(组合多个子组件)
│   ├── ProgressBar.tsx          # 进度条子组件
│   ├── StepDisplay.tsx          # 步骤显示子组件
│   ├── NavigationButtons.tsx    # 导航按钮子组件
│   ├── DataForm.tsx             # 数据表单子组件
│   └── StatusIndicator.tsx      # 状态指示器子组件
└── app/
    ├── page.tsx                 # 主页面
    └── globals.css              # 全局样式
```

## 🔧 组合模式的实现

### 1. 上下文提供者 (Context Provider)
```typescript
// FlowContext.tsx
export const FlowProvider: React.FC<FlowProviderProps> = ({ 
  children, 
  totalSteps = 3,
  initialData = {}
}) => {
  // 状态管理逻辑
  return (
    <FlowContext.Provider value={contextValue}>
      {children}
    </FlowContext.Provider>
  );
};
```

### 2. 主控制器组件 (Controller)
```typescript
// Controller.tsx
const Controller: React.FC = () => {
  return (
    <div className="controller-container">
      {/* 组合多个子组件 */}
      <ProgressBar />
      <StepDisplay />
      <DataForm />
      <NavigationButtons />
    </div>
  );
};
```

### 3. 子组件使用上下文
```typescript
// 各个子组件通过 useFlowContext Hook 访问共享状态
const { state, nextStep, prevStep } = useFlowContext();
```

## ✨ 组合模式的优势

1. **🧩 模块化**: 每个子组件职责单一，易于理解和维护
2. **🔄 可复用**: 子组件可以在不同的上下文中复用
3. **📦 可组合**: 可以灵活地组合不同的子组件
4. **🎯 可测试**: 每个子组件可以独立测试
5. **🔧 可扩展**: 易于添加新的子组件或修改现有组件

## 🚀 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看演示。

## 📱 功能特性

- **步骤式流程**: 3步流程演示 (基本信息 → 偏好设置 → 确认提交)
- **实时进度**: 动态进度条显示当前进度
- **状态管理**: 全局状态在所有子组件间共享
- **交互导航**: 可点击步骤直接跳转，支持前进/后退
- **数据持久**: 表单数据在步骤间保持
- **响应式设计**: 支持桌面和移动端
- **暗色模式**: 自动适配系统主题

## 🎨 设计模式亮点

### 关注点分离
- `FlowContext`: 负责状态管理
- `Controller`: 负责组件组合
- 各子组件: 各自负责特定的UI功能

### 单一职责原则
- `ProgressBar`: 只负责显示进度
- `StepDisplay`: 只负责步骤展示
- `NavigationButtons`: 只负责导航操作
- `DataForm`: 只负责数据输入

### 开放封闭原则
- 易于添加新的子组件而不修改现有代码
- 可以通过props配置不同的行为

这个演示完美展示了React组合模式的强大之处，通过合理的组件组合和状态管理，构建出功能完整、易于维护的应用。
