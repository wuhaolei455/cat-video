# 🎥 Leo Video Player

A modern, TypeScript-first video player with HLS support, event-driven architecture, and React integration.

## ✨ Features

- 🎯 **TypeScript First** - Built with TypeScript, providing excellent type safety and IDE support
- 📺 **HTML5 Video API** - Full support for native HTML5 video capabilities
- 🌊 **HLS Streaming** - HTTP Live Streaming support with adaptive bitrate
- ⚡ **Event-Driven** - Comprehensive event system for real-time updates
- ⚛️ **React Integration** - Ready-to-use React components and hooks
- 🎛️ **Rich Controls** - Quality selection, playback rate, fullscreen, PiP support
- 🔧 **Extensible** - Plugin architecture for custom functionality
- 📱 **Mobile Friendly** - Optimized for mobile devices with touch controls
- 🎨 **Customizable** - Easy to style and integrate into any design system

## 🚀 Installation

```bash
npm install leo-video
# or
yarn add leo-video
# or
pnpm add leo-video
```

## 📖 Quick Start

### Using the React Component

```tsx
import React from 'react';
import { LeoVideoPlayer } from 'leo-video';

const MyVideoPlayer = () => {
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
      showControls={true}
      onStateChange={(state) => {
        console.log('Player state:', state);
      }}
    />
  );
};
```

### Using the Hook

```tsx
import React, { useEffect } from 'react';
import { useLeoVideo } from 'leo-video';

const CustomVideoPlayer = () => {
  const {
    videoRef,
    state,
    isReady,
    play,
    pause,
    seek,
    setVolume
  } = useLeoVideo({
    config: {
      sources: [
        {
          src: 'https://example.com/video.mp4',
          type: 'mp4'
        }
      ]
    }
  });

  return (
    <div>
      <video ref={videoRef} />
      <div>
        <button onClick={play} disabled={!isReady}>Play</button>
        <button onClick={pause} disabled={!isReady}>Pause</button>
        <button onClick={() => seek(30)} disabled={!isReady}>Seek +30s</button>
      </div>
      <div>State: {state.state}</div>
      <div>Time: {state.currentTime.toFixed(1)}s / {state.duration.toFixed(1)}s</div>
    </div>
  );
};
```

### HLS Streaming

```tsx
import React from 'react';
import { LeoVideoPlayer } from 'leo-video';

const HLSPlayer = () => {
  const config = {
    sources: [
      {
        src: 'https://example.com/playlist.m3u8',
        type: 'hls'
      }
    ],
    hls: {
      debug: false,
      enableWorker: true,
      lowLatencyMode: false
    }
  };

  return (
    <LeoVideoPlayer
      config={config}
      width="100%"
      height="400px"
      onEvent={(type, data) => {
        if (type === 'qualitychange') {
          console.log('Quality changed:', data.payload);
        }
      }}
    />
  );
};
```

## 🎛️ Configuration

### Basic Video Config

```typescript
interface VideoConfig {
  sources: VideoSource[];
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  playsinline?: boolean;
  poster?: string;
}

interface VideoSource {
  src: string;
  type: VideoFormat;
  quality?: VideoQuality;
  label?: string;
}
```

### HLS Config

```typescript
interface HLSVideoConfig extends VideoConfig {
  hls?: {
    debug?: boolean;
    enableWorker?: boolean;
    lowLatencyMode?: boolean;
    backBufferLength?: number;
    maxBufferLength?: number;
    maxMaxBufferLength?: number;
    // ... more HLS.js options
  };
}
```

## 🎣 Hooks

### useLeoVideo

The main hook for video player functionality:

```typescript
const {
  videoRef,        // React ref for video element
  player,          // Player instance
  state,           // Current player state
  isReady,         // Whether player is ready
  error,           // Current error (if any)
  
  // Control methods
  initialize,      // Initialize player
  play,           // Start playback
  pause,          // Pause playback
  seek,           // Seek to time
  setVolume,      // Set volume
  setQuality,     // Set video quality
  setPlaybackRate, // Set playback speed
  toggleFullscreen, // Toggle fullscreen
  togglePiP,      // Toggle Picture-in-Picture
  destroy,        // Destroy player
  
  // State queries
  getAvailableQualities,
  getCurrentTime,
  getDuration,
  // ... more query methods
} = useLeoVideo(options);
```

## 📡 Events

The player emits various events that you can listen to:

```typescript
// Standard HTML5 video events
'loadstart' | 'loadedmetadata' | 'loadeddata' | 'canplay' | 'canplaythrough'
| 'play' | 'playing' | 'pause' | 'seeking' | 'seeked' | 'waiting'
| 'timeupdate' | 'progress' | 'volumechange' | 'ratechange'
| 'ended' | 'error'

// Custom events
| 'qualitychange' | 'fullscreenchange' | 'pip' | 'buffering' | 'ready'
```

Example event handling:

```tsx
<LeoVideoPlayer
  config={config}
  onEvent={(type, data) => {
    switch (type) {
      case 'play':
        console.log('Video started playing');
        break;
      case 'qualitychange':
        console.log('Quality changed from', data.payload.from, 'to', data.payload.to);
        break;
      case 'error':
        console.error('Video error:', data.payload);
        break;
    }
  }}
/>
```

## 🏗️ Advanced Usage

### Custom Player Factory

```typescript
import { VideoPlayerFactory, createSmartVideoPlayer } from 'leo-video';

// Create a custom configured player
const factory = new VideoPlayerFactory();
const player = factory.createSmart(videoElement, config);

// Or use the utility function
const smartPlayer = createSmartVideoPlayer(videoElement, config);
```

### Direct API Usage

```typescript
import { HTML5VideoAPI, HLSPlayer } from 'leo-video';

// Create HTML5 player directly
const html5Player = new HTML5VideoAPI(videoElement, config);

// Create HLS player directly
const hlsPlayer = new HLSPlayer(videoElement, hlsConfig);

// Listen to events
player.on('play', (data) => {
  console.log('Video playing:', data);
});
```

### Event System

```typescript
import { VideoEventEmitter } from 'leo-video';

// Create custom event emitter
const emitter = new VideoEventEmitter();

// Listen to events
emitter.on('custom-event', (data) => {
  console.log('Custom event:', data);
});

// Emit events
emitter.emit('custom-event', { message: 'Hello World' });
```

## 🎨 Styling

The player comes with minimal default styles. You can easily customize the appearance:

```css
/* Custom video player styles */
.leo-video-player {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.leo-video-player video {
  background-color: #000;
}

.leo-video-events {
  background-color: #f5f5f5;
  border-radius: 4px;
}
```

## 🔧 Utility Functions

Leo Video provides various utility functions:

```typescript
import { 
  detectHLSSupport,
  detectVideoFormats,
  formatTime,
  getVideoThumbnail,
  checkBrowserFeatures
} from 'leo-video';

// Check HLS support
const hlsSupport = detectHLSSupport();
console.log('HLS supported:', hlsSupport.supported);

// Format time
const timeString = formatTime(125); // "02:05"

// Get thumbnail
const thumbnail = await getVideoThumbnail(videoElement, 30);

// Check browser features
const features = checkBrowserFeatures();
console.log('Fullscreen supported:', features.fullscreen);
```

## 📱 Mobile Support

Leo Video is optimized for mobile devices:

- Touch-friendly controls
- `playsinline` support for iOS
- Adaptive quality for mobile networks
- Picture-in-Picture support where available
- Orientation change handling

## 🔒 TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  VideoConfig,
  VideoState,
  VideoEventType,
  LeoVideoPlayerProps,
  UseLeoVideoOptions
} from 'leo-video';

// Type-safe configuration
const config: VideoConfig = {
  sources: [{ src: 'video.mp4', type: 'mp4' }],
  autoplay: false
};

// Type-safe event handling
const handleEvent = (type: VideoEventType, data: VideoEventData) => {
  // TypeScript knows the shape of data based on event type
};
```

## 🧪 Testing

Leo Video includes comprehensive test utilities:

```typescript
import { render, screen } from '@testing-library/react';
import { LeoVideoPlayer } from 'leo-video';

test('video player renders correctly', () => {
  const config = {
    sources: [{ src: 'test.mp4', type: 'mp4' as const }]
  };
  
  render(<LeoVideoPlayer config={config} />);
  
  const videoElement = screen.getByRole('application');
  expect(videoElement).toBeInTheDocument();
});
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://leo-video.dev/docs)
- [GitHub Repository](https://github.com/leo-video/leo-video)
- [Issue Tracker](https://github.com/leo-video/leo-video/issues)
- [Changelog](CHANGELOG.md)

---

Made with ❤️ by the Leo Video team
