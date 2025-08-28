# Solar React CLI 🌞

一个功能完整的React脚手架工具，包含现代React开发所需的所有工具和配置。

## ✨ 特性

### 🏗️ 构建工具
- **Webpack 5**: 完整配置，支持开发和生产环境
- **热更新**: 开发时实时更新，提升开发效率
- **代码分割**: 自动代码分割和懒加载
- **Bundle分析**: 内置打包分析工具

### 📝 开发体验
- **TypeScript**: 完整的TypeScript支持
- **CSS预处理器**: 支持SCSS/SASS
- **CSS Modules**: 模块化CSS支持
- **PostCSS**: 自动添加浏览器前缀

### 🧪 测试环境
- **Jest**: 完整的测试框架配置
- **React Testing Library**: React组件测试
- **覆盖率报告**: 自动生成测试覆盖率

### 📏 代码质量
- **ESLint**: 代码规范检查
- **Prettier**: 代码格式化
- **Husky**: Git Hooks，提交前检查
- **lint-staged**: 只检查暂存的文件

### ⚡ 优化特性
- **Tree Shaking**: 自动移除无用代码
- **压缩优化**: 生产环境自动压缩
- **缓存策略**: 文件hash缓存
- **资源优化**: 图片和字体优化

## 📦 安装

```bash
npm install -g solar-react-cli
```

## 🚀 使用

### 创建新项目

```bash
# 创建基础项目
solar create my-app

# 创建高级项目
solar create my-app --template advanced
```

创建时可选择以下功能：
- ✅ TypeScript
- 🛣️ React Router
- 🗂️ Redux Toolkit
- 💅 Styled Components
- 🎨 Ant Design
- 📱 PWA支持
- 🐳 Docker配置

### 开发服务器

```bash
# 启动开发服务器（默认端口3000）
solar dev

# 指定端口和主机
solar dev --port 8080 --host 0.0.0.0
```

### 构建项目

```bash
# 生产环境构建
solar build

# 构建并分析bundle
solar build --analyze
```

## 📁 项目结构

```
my-app/
├── public/
│   ├── index.html          # HTML模板
│   └── favicon.ico         # 网站图标
├── src/
│   ├── components/         # React组件
│   ├── styles/            # 样式文件
│   ├── hooks/             # 自定义Hooks
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 主应用组件
│   ├── index.tsx          # 入口文件
│   └── setupTests.ts      # 测试配置
├── webpack.config.js       # Webpack配置
├── tsconfig.json          # TypeScript配置
├── jest.config.json       # Jest配置
├── .eslintrc.json         # ESLint配置
├── .prettierrc            # Prettier配置
└── package.json           # 项目配置
```

## 🛠️ 可用脚本

在项目目录中，你可以运行：

### `npm run dev`
启动开发服务器，支持热更新。

### `npm run build`
构建生产版本到 `dist` 文件夹。

### `npm run build:analyze`
构建并分析bundle大小。

### `npm run test`
运行测试套件。

### `npm run test:watch`
以监听模式运行测试。

### `npm run test:coverage`
运行测试并生成覆盖率报告。

### `npm run lint`
检查代码规范。

### `npm run lint:fix`
自动修复可修复的代码规范问题。

### `npm run format`
格式化代码。

### `npm run type-check`
进行TypeScript类型检查。

## ⚙️ 配置

### Webpack配置
项目包含完整的Webpack配置，支持：
- 开发和生产环境
- TypeScript编译
- CSS/SCSS处理
- 静态资源处理
- 代码分割
- 热更新

### ESLint配置
预配置的ESLint规则包括：
- React最佳实践
- TypeScript支持
- Hook规则检查
- 代码质量规则

### Jest配置
完整的测试环境配置：
- jsdom测试环境
- React Testing Library
- 覆盖率报告
- 路径别名支持

## 🎯 最佳实践

### 组件开发
```tsx
import React from 'react';
import styles from './MyComponent.module.scss';

interface Props {
  title: string;
  onClick: () => void;
}

const MyComponent: React.FC<Props> = ({ title, onClick }) => {
  return (
    <button className={styles.button} onClick={onClick}>
      {title}
    </button>
  );
};

export default MyComponent;
```

### 测试编写
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders button with title', () => {
  const mockClick = jest.fn();
  render(<MyComponent title="Click me" onClick={mockClick} />);
  
  const button = screen.getByText('Click me');
  expect(button).toBeInTheDocument();
  
  fireEvent.click(button);
  expect(mockClick).toHaveBeenCalled();
});
```

### 样式管理
```scss
// MyComponent.module.scss
.button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}
```

## 🔧 高级配置

### 路径别名
```typescript
// 在tsconfig.json中配置
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

### 环境变量
```bash
# .env.development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_DEBUG=true

# .env.production
REACT_APP_API_URL=https://api.example.com
REACT_APP_DEBUG=false
```

### PWA配置
启用PWA功能后，项目将包含：
- Service Worker
- Web App Manifest
- 离线支持
- 安装提示

## 📊 性能优化

### 代码分割
```tsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Bundle分析
使用 `npm run build:analyze` 分析打包结果：
- 查看各模块大小
- 识别重复依赖
- 优化导入策略

## 🐛 故障排除

### 常见问题

**端口被占用**
```bash
# 使用不同端口
solar dev --port 3001
```

**内存不足**
```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max_old_space_size=4096"
```

**构建缓存问题**
```bash
# 清理缓存
rm -rf node_modules/.cache
rm -rf dist
npm run build
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

---

## 🔗 相关链接

- [React 官方文档](https://reactjs.org/)
- [Webpack 官方文档](https://webpack.js.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Jest 官方文档](https://jestjs.io/)

---

**Solar React CLI** - 让React开发更简单、更高效！ 🚀
