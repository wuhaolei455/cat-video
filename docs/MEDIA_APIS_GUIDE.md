# 🎥 媒体API完整指南

> leo-video项目中所有媒体相关API的分析和实现指南

## 📊 功能实现状态

| 功能 | 实现状态 | 支持程度 | 文件位置 |
|------|---------|---------|---------|
| **HTML5 Video API** | ✅ 完整实现 | 100% | `src/video/VideoAPI.ts` |
| **HLS流媒体** | ✅ 完整实现 | 100% | `src/video/HLSPlayer.ts` |
| **全屏API** | ✅ 基础实现 | 80% | `src/video/VideoAPI.ts` |
| **画中画API** | ✅ 基础实现 | 80% | `src/video/VideoAPI.ts` |
| **DASH流媒体** | ❌ 未实现 | 0% | 计划中 |
| **Media Session API** | ❌ 未实现 | 0% | 计划中 |

## 🎬 HTML5 Video API

### 核心功能
```typescript
export class HTML5VideoAPI {
  // 基础播放控制
  async play(): Promise<void>
  async pause(): Promise<void>
  
  // 全屏控制
  async enterFullscreen(): Promise<void>
  async exitFullscreen(): Promise<void>
  
  // 画中画控制
  async enterPiP(): Promise<void>
  async exitPiP(): Promise<void>
  
  // 事件系统
  onVideoEvent<T extends VideoEventType>(
    event: T, 
    handler: VideoEventHandler<T>
  ): void
}
```

### 浏览器兼容性
- **Chrome**: 完整支持所有API
- **Safari**: 原生HLS支持，需要webkit前缀
- **Firefox**: 标准API支持
- **移动端**: 需要playsinline属性

## 📡 HLS流媒体

### 实现策略
```typescript
export class HLSPlayer extends HTML5VideoAPI {
  private initializeHLS(): void {
    // Safari原生支持检测
    if (this.element.canPlayType('application/vnd.apple.mpegurl')) {
      this.loadHLSNatively();
      return;
    }
    
    // 其他浏览器使用HLS.js
    if (Hls.isSupported()) {
      this.initializeHLSJS();
    }
  }
}
```

### 配置示例
```typescript
const hlsConfig = {
  sources: [{ src: 'stream.m3u8', type: 'hls' }],
  hls: {
    enableWorker: true,
    lowLatencyMode: true,
    debug: false
  }
};
```

## 🖥️ 全屏API兼容性

### 标准实现
```typescript
async enterFullscreen(): Promise<void> {
  const element = this._element;
  
  if (element.requestFullscreen) {
    await element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    await element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    await element.mozRequestFullScreen();
  }
}
```

### 浏览器支持
| 浏览器 | 标准API | webkit前缀 | 支持版本 |
|--------|---------|------------|----------|
| Chrome | ✅ | ✅ | 71+ |
| Safari | ✅ | ✅ | 16.4+ |
| Firefox | ✅ | ❌ | 64+ |

## 📱 画中画API

### 实现方式
```typescript
async enterPiP(): Promise<void> {
  const video = this._element;
  
  // 标准API
  if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
    await video.requestPictureInPicture();
  }
  // Safari特殊API
  else if (video.webkitSetPresentationMode) {
    video.webkitSetPresentationMode('picture-in-picture');
  }
}
```

### 支持情况
- **Chrome/Edge**: 标准Picture-in-Picture API
- **Safari**: webkitSetPresentationMode API
- **Firefox**: 暂不支持

## 🔮 未实现功能

### DASH流媒体
```typescript
// 计划实现
export class DASHPlayer extends HTML5VideoAPI {
  // 使用dash.js库实现
  // 支持自适应比特率
  // 支持多语言字幕
}
```

### Media Session API
```typescript
// 计划实现
export class MediaSessionManager {
  // 锁屏媒体控制
  // 通知栏集成
  // 硬件按键支持
}
```

## 🎯 最佳实践

### 1. 播放器创建
```typescript
// 智能播放器工厂
const player = createSmartVideoPlayer(videoElement, {
  sources: [
    { src: 'video.mp4', type: 'mp4' },
    { src: 'stream.m3u8', type: 'hls' }
  ],
  autoplay: false,
  controls: true
});
```

### 2. 事件处理
```typescript
// 统一事件监听
player.onVideoEvent('playing', (event) => {
  console.log('播放开始', event.currentTime);
});

player.onVideoEvent('qualitychange', (event) => {
  console.log('质量切换', event.payload);
});
```

### 3. 错误处理
```typescript
player.onVideoEvent('error', (event) => {
  console.error('播放错误', event.error);
  // 降级处理逻辑
});
```

## 🚀 未来规划

### 短期计划
- [ ] 完善全屏API的浏览器前缀支持
- [ ] 实现Media Session API基础功能
- [ ] 添加更多HLS配置选项

### 长期计划
- [ ] 实现DASH流媒体支持
- [ ] 添加WebRTC直播支持
- [ ] 支持VR/360度视频

## 📖 使用示例

```typescript
import { createSmartVideoPlayer } from '@/video/VideoPlayerFactory';

// 创建播放器
const player = createSmartVideoPlayer(videoElement, {
  sources: [{ src: 'stream.m3u8', type: 'hls' }],
  pip: true,
  fullscreen: true
});

// 播放控制
await player.play();
await player.enterFullscreen();
await player.togglePiP();
```
