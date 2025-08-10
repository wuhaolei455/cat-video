# 📦 Leo Video Package 发布指南

> 如何将 leo-video 作为独立的 npm 包发布和使用

## 🎯 项目概述

本项目已成功将视频播放器模块封装为独立的 npm 包 `leo-video`，具备以下特性：

### ✨ 核心特性
- 🎯 **TypeScript First** - 完整的类型支持和高级类型特性
- ⚛️ **React 集成** - 开箱即用的 React 组件和 Hook
- 📺 **HTML5 Video API** - 原生视频播放能力
- 🌊 **HLS 流媒体** - 自适应比特率流支持
- ⚡ **事件驱动** - 完整的事件系统
- 🔧 **可扩展** - 插件化架构设计

## 📁 项目结构

```
leo-video/
├── packages/leo-video/          # npm 包源码
│   ├── src/                     # TypeScript 源码
│   │   ├── components/          # React 组件
│   │   ├── hooks/              # React Hooks
│   │   ├── types.ts            # 类型定义
│   │   ├── EventEmitter.ts     # 事件系统
│   │   ├── VideoAPI.ts         # HTML5 API 封装
│   │   ├── HLSPlayer.ts        # HLS 播放器
│   │   ├── VideoPlayerFactory.ts # 工厂模式
│   │   ├── utils.ts            # 工具函数
│   │   └── index.ts            # 导出入口
│   ├── dist/                   # 构建产物
│   ├── package.json            # 包配置
│   ├── tsconfig.json          # TypeScript 配置
│   ├── rollup.config.js       # 构建配置
│   └── README.md              # 包文档
├── src/app/package-demo/       # 使用演示页面
└── docs/                       # 项目文档
```

## 🚀 发布流程

### 1. 准备发布

```bash
# 进入包目录
cd packages/leo-video

# 安装依赖
npm install

# 构建包
npm run build

# 检查构建产物
ls -la dist/
```

### 2. 版本管理

```bash
# 查看当前版本
npm version

# 升级版本（选择一种）
npm version patch   # 1.0.0 -> 1.0.1 (bug fixes)
npm version minor   # 1.0.0 -> 1.1.0 (new features)
npm version major   # 1.0.0 -> 2.0.0 (breaking changes)

# 或手动指定版本
npm version 1.0.1
```

### 3. 发布到 npm

```bash
# 登录 npm（首次发布需要）
npm login

# 检查包内容
npm pack --dry-run

# 发布到 npm
npm publish

# 发布预发布版本
npm publish --tag beta
```

### 4. 私有包发布（可选）

```bash
# 发布到私有 registry
npm publish --registry https://your-private-registry.com

# 或配置 .npmrc
echo "@your-org:registry=https://your-private-registry.com" >> .npmrc
npm publish
```

## 📦 使用指南

### 安装

```bash
# 从 npm 安装
npm install leo-video

# 或使用 yarn
yarn add leo-video

# 或使用 pnpm
pnpm add leo-video
```

### 基础使用

```tsx
import React from 'react';
import { LeoVideoPlayer } from 'leo-video';

const App = () => {
  const config = {
    sources: [
      {
        src: 'https://example.com/video.mp4',
        type: 'mp4'
      }
    ],
    autoplay: false,
    controls: true
  };

  return (
    <LeoVideoPlayer
      config={config}
      width="100%"
      height="400px"
      onStateChange={(state) => {
        console.log('Player state:', state);
      }}
    />
  );
};
```

### Hook 使用

```tsx
import React from 'react';
import { useLeoVideo } from 'leo-video';

const CustomPlayer = () => {
  const {
    videoRef,
    state,
    isReady,
    play,
    pause
  } = useLeoVideo({
    config: {
      sources: [{ src: 'video.mp4', type: 'mp4' }]
    }
  });

  return (
    <div>
      <video ref={videoRef} />
      <button onClick={play} disabled={!isReady}>Play</button>
      <button onClick={pause} disabled={!isReady}>Pause</button>
      <div>State: {state.state}</div>
    </div>
  );
};
```

## 🔧 开发工作流

### 本地开发

```bash
# 在包目录中开发
cd packages/leo-video

# 监听模式构建
npm run dev

# 在另一个终端启动主项目
cd ../../
npm run dev
```

### 测试集成

```bash
# 构建包
cd packages/leo-video && npm run build

# 回到主项目重新安装
cd ../../
npm install

# 启动开发服务器
npm run dev
```

### 类型检查

```bash
# 在包目录中
npm run type-check

# 在主项目中
npm run build  # Next.js 会进行类型检查
```

## 📋 发布清单

### 发布前检查

- [ ] 所有测试通过
- [ ] 构建成功无错误
- [ ] 类型定义正确
- [ ] 文档更新完整
- [ ] CHANGELOG 更新
- [ ] 版本号正确
- [ ] 依赖版本合理

### 发布后验证

- [ ] npm 上包可见
- [ ] 安装测试正常
- [ ] 类型提示正确
- [ ] 文档链接有效
- [ ] 示例代码可运行

## 🌟 包特性展示

### TypeScript 高级特性

```typescript
// 条件类型
type PlayerFromConfig<T> = T extends HLSConfig 
  ? HLSPlayer 
  : HTML5Player;

// 映射类型
type EventMap = {
  [K in VideoEventType]: VideoEventData<K>;
};

// 模板字面量类型
type EventName<T> = `video:${T}`;
```

### 事件驱动架构

```typescript
// 类型安全的事件监听
player.on('qualitychange', (data) => {
  // TypeScript 知道 data 的确切类型
  console.log(`Quality changed from ${data.payload.from} to ${data.payload.to}`);
});
```

### 工厂模式

```typescript
// 智能播放器创建
const player = createSmartVideoPlayer(element, config);
// 自动根据配置选择 HTML5 或 HLS 播放器
```

## 📊 性能特性

- **Tree Shaking** - 支持按需导入
- **代码分割** - 动态加载 HLS.js
- **内存管理** - 自动资源清理
- **事件优化** - 防抖和节流

## 🔗 相关链接

- **Package Demo**: `/package-demo` - 完整的包使用演示
- **GitHub**: 项目源码仓库
- **npm**: 包发布页面
- **文档**: 完整的 API 文档

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

**leo-video** 是一个现代化的视频播放器解决方案，为 React 应用提供完整的视频播放能力。通过 TypeScript 的强类型支持和事件驱动的架构设计，为开发者提供了优秀的开发体验。
