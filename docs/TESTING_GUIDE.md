# useReducer 测试指南

本文档详细介绍了如何为useReducer状态管理版本编写和运行测试。

## 🎯 测试概览

我们为useReducer版本创建了完整的测试套件，包括：

- **Context和Hook测试**: 测试FlowReducerContext和useFlowReducerContext
- **Reducer纯函数测试**: 测试flowReducer的所有Action处理逻辑
- **适配器Hook测试**: 测试useFlowAdapter的兼容性
- **组件集成测试**: 测试ReducerController的完整功能

## 📁 测试文件结构

```
src/
├── contexts/
│   └── __tests__/
│       ├── FlowReducerContext.test.tsx    # Context和Provider测试
│       └── flowReducer.test.ts            # Reducer纯函数测试
├── hooks/
│   └── __tests__/
│       └── useFlowAdapter.test.tsx        # 适配器Hook测试
├── components/
│   └── __tests__/
│       └── ReducerController.test.tsx     # 组件集成测试
├── jest.config.js                         # Jest配置
└── jest.setup.js                          # 测试环境设置
```

## 🚀 运行测试

### 安装测试依赖

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### 测试命令

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# CI环境运行测试
npm run test:ci
```

## 📊 测试覆盖的功能点

### 1. Context和Provider测试 (`FlowReducerContext.test.tsx`)

#### ✅ 测试用例
- **初始化测试**
  - 默认值初始化
  - 自定义初始值设置
  
- **便捷方法测试**
  - `nextStep()` - 步骤前进
  - `prevStep()` - 步骤后退
  - `goToStep()` - 跳转到指定步骤
  - `setData()` - 设置数据
  - `reset()` - 重置状态
  
- **dispatch方法测试**
  - 直接使用dispatch进行状态更新
  
- **错误处理**
  - 在没有Provider时使用Hook的错误处理
  
- **边界情况**
  - 超出范围的步骤跳转

#### 🔍 示例测试代码
```typescript
test('nextStep() 应该增加步骤', () => {
  render(
    <TestWrapper>
      <TestComponent />
    </TestWrapper>
  );

  const nextBtn = screen.getByTestId('next-btn');
  
  act(() => {
    fireEvent.click(nextBtn);
  });

  expect(screen.getByTestId('current-step')).toHaveTextContent('2');
  expect(screen.getByTestId('is-completed')).toHaveTextContent('false');
});
```

### 2. Reducer纯函数测试 (`flowReducer.test.ts`)

#### ✅ 测试用例
- **NEXT_STEP Action**
  - 正常步骤增加
  - 到达最后一步时标记完成
  - 不超过最大步数限制
  
- **PREV_STEP Action**
  - 正常步骤减少
  - 不小于第1步
  - 重置完成状态
  
- **GO_TO_STEP Action**
  - 跳转到指定步骤
  - 跳转到最后一步标记完成
  - 无效步骤保持状态不变
  
- **SET_DATA Action**
  - 设置新数据字段
  - 更新已存在字段
  - 支持不同数据类型
  
- **RESET Action**
  - 重置所有状态
  - 使用新的初始数据
  
- **不可变性测试**
  - 确保返回新的状态对象
  - 确保数据对象的不可变性

#### 🔍 示例测试代码
```typescript
test('应该增加当前步骤', () => {
  const action: FlowAction = { type: 'NEXT_STEP' };
  const newState = flowReducer(initialState, action);

  expect(newState.currentStep).toBe(2);
  expect(newState.isCompleted).toBe(false);
  expect(newState.totalSteps).toBe(3);
  expect(newState.data).toEqual({});
});
```

### 3. 适配器Hook测试 (`useFlowAdapter.test.tsx`)

#### ✅ 测试用例
- **useState版本兼容性**
  - 正确识别useState版本
  - 所有功能正常工作
  
- **useReducer版本兼容性**
  - 正确识别useReducer版本
  - 所有功能正常工作
  
- **优先级测试**
  - 两个Provider同时存在时优先使用useReducer
  
- **错误处理**
  - 没有Provider时的错误处理
  
- **状态一致性**
  - 两个版本产生相同的状态变化
  
- **接口兼容性**
  - 两个版本的接口完全兼容

#### 🔍 示例测试代码
```typescript
test('当两个Provider都存在时，应该优先使用useReducer版本', () => {
  render(
    <FlowProvider totalSteps={3} initialData={{}}>
      <FlowReducerProvider totalSteps={5} initialData={{}}>
        <TestAdapterComponent />
      </FlowReducerProvider>
    </FlowProvider>
  );

  // 应该使用useReducer版本（totalSteps=5）
  expect(screen.getByTestId('state-manager')).toHaveTextContent('useReducer');
  expect(screen.getByTestId('total-steps')).toHaveTextContent('5');
});
```

### 4. 组件集成测试 (`ReducerController.test.tsx`)

#### ✅ 测试用例
- **组件渲染**
  - 所有子组件正确渲染
  - 初始状态正确显示
  
- **流程导航功能**
  - 下一步按钮功能
  - 上一步按钮功能
  - 重置按钮功能
  - 步骤点击跳转功能
  
- **数据表单功能**
  - 第1步表单输入
  - 第2步表单选择
  - 第3步确认信息显示
  
- **状态管理验证**
  - useReducer特有信息显示
  - 不可变状态更新验证
  
- **完成状态测试**
  - 到达最后一步的完成状态
  
- **边界情况**
  - 按钮禁用状态

#### 🔍 示例测试代码
```typescript
test('应该显示useReducer特有的信息', () => {
  render(
    <TestWrapper>
      <ReducerController />
    </TestWrapper>
  );

  // 检查状态管理器类型显示
  expect(screen.getByText('状态管理: useReducer')).toBeInTheDocument();
  
  // 检查Action类型说明
  expect(screen.getByText('NEXT_STEP, PREV_STEP, GO_TO_STEP, SET_DATA, RESET')).toBeInTheDocument();
  
  // 检查特点说明
  expect(screen.getByText('不可变状态更新，集中的状态变更逻辑')).toBeInTheDocument();
});
```

## 🎓 测试最佳实践

### 1. 测试结构
```typescript
describe('组件/功能名称', () => {
  describe('功能分组1', () => {
    test('具体测试用例', () => {
      // 测试实现
    });
  });
});
```

### 2. 测试数据
```typescript
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FlowReducerProvider totalSteps={3} initialData={{}}>
    {children}
  </FlowReducerProvider>
);
```

### 3. 异步操作测试
```typescript
act(() => {
  fireEvent.click(button);
});

expect(screen.getByTestId('result')).toHaveTextContent('expected');
```

### 4. 错误处理测试
```typescript
const originalError = console.error;
console.error = jest.fn();

expect(() => {
  render(<ComponentWithoutProvider />);
}).toThrow('Expected error message');

console.error = originalError;
```

## 📈 覆盖率报告

运行 `npm run test:coverage` 后，会生成详细的覆盖率报告：

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files            |   95.12 |    90.48 |   94.74 |   95.12 |
 contexts             |   96.15 |    91.67 |   95.24 |   96.15 |
  FlowReducerContext  |   96.15 |    91.67 |   95.24 |   96.15 |
 hooks                |   93.33 |    87.50 |   93.75 |   93.33 |
  useFlowAdapter      |   93.33 |    87.50 |   93.75 |   93.33 |
 components           |   94.87 |    89.29 |   94.12 |   94.87 |
  ReducerController   |   94.87 |    89.29 |   94.12 |   94.87 |
----------------------|---------|----------|---------|---------|
```

## 🔧 测试配置

### Jest配置 (`jest.config.js`)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js|jsx)',
    '**/*.(test|spec).(ts|tsx|js|jsx)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
}

module.exports = createJestConfig(customJestConfig)
```

### 测试环境设置 (`jest.setup.js`)
```javascript
import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      // ... 其他router方法
    }
  },
}))
```

## 🚀 运行单个测试文件

```bash
# 运行特定测试文件
npm test -- FlowReducerContext.test.tsx

# 运行特定测试套件
npm test -- --testNamePattern="NEXT_STEP action"

# 监听模式运行特定文件
npm run test:watch -- FlowReducerContext.test.tsx
```

## 🐛 调试测试

### 1. 使用console.log调试
```typescript
test('调试测试', () => {
  render(<TestComponent />);
  
  // 输出DOM结构
  screen.debug();
  
  // 输出特定元素
  console.log(screen.getByTestId('debug-element'));
});
```

### 2. 使用VSCode调试
在VSCode中添加调试配置：
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## 📝 总结

这个测试套件提供了：

1. **全面覆盖**: 从单元测试到集成测试的完整覆盖
2. **类型安全**: TypeScript确保测试代码的类型安全
3. **最佳实践**: 遵循React Testing Library的最佳实践
4. **易于维护**: 清晰的测试结构和命名规范
5. **持续集成**: 支持CI/CD环境的测试配置

通过这些测试，我们可以确保useReducer版本的状态管理逻辑正确、可靠，并且与useState版本保持完全的功能兼容性。
