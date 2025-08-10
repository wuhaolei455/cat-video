import Hls from 'hls.js';
import { VideoConfig, VideoFormat, VideoState, HLSVideoConfig } from './types';

// HLS支持检测结果
export interface HLSSupportInfo {
  supported: boolean;
  native: boolean;
  hlsjs: boolean;
  reason?: string;
}

// DASH支持检测结果
export interface DASHSupportInfo {
  supported: boolean;
  native: boolean;
  dashjs: boolean;
  reason?: string;
}

// 视频格式支持检测结果
export interface VideoFormatSupport {
  mp4: boolean;
  webm: boolean;
  ogg: boolean;
  hls: boolean;
  dash: boolean;
}

/**
 * 检测HLS支持情况
 */
export const detectHLSSupport = (): HLSSupportInfo => {
  // 检查原生HLS支持
  const video = document.createElement('video');
  const nativeSupport = video.canPlayType('application/vnd.apple.mpegurl') !== '' ||
                       video.canPlayType('application/x-mpegURL') !== '';

  // 检查hls.js支持
  const hlsjsSupport = Hls.isSupported();

  const supported = nativeSupport || hlsjsSupport;
  
  let reason: string | undefined;
  if (!supported) {
    reason = 'Neither native HLS nor hls.js is supported in this environment';
  }

  return {
    supported,
    native: nativeSupport,
    hlsjs: hlsjsSupport,
    reason
  };
};

/**
 * 检测DASH支持情况
 */
export const detectDASHSupport = (): DASHSupportInfo => {
  // 检查原生DASH支持
  const video = document.createElement('video');
  const nativeSupport = video.canPlayType('application/dash+xml') !== '';

  // 检查dash.js支持（如果可用）
  const dashjsSupport = typeof window !== 'undefined' && 'dashjs' in window;

  const supported = nativeSupport || dashjsSupport;
  
  let reason: string | undefined;
  if (!supported) {
    reason = 'Neither native DASH nor dash.js is supported in this environment';
  }

  return {
    supported,
    native: nativeSupport,
    dashjs: dashjsSupport,
    reason
  };
};

/**
 * 检测各种视频格式支持情况
 */
export const detectVideoFormats = (): VideoFormatSupport => {
  const video = document.createElement('video');
  
  return {
    mp4: video.canPlayType('video/mp4') !== '',
    webm: video.canPlayType('video/webm') !== '',
    ogg: video.canPlayType('video/ogg') !== '',
    hls: detectHLSSupport().supported,
    dash: detectDASHSupport().supported
  };
};

/**
 * 创建基础视频配置
 */
export const createVideoConfig = (sources: VideoConfig['sources']): VideoConfig => {
  return {
    sources,
    autoplay: false,
    controls: true,
    muted: false,
    loop: false,
    preload: 'metadata',
    playsinline: true
  };
};

/**
 * 验证视频配置
 */
export const validateVideoConfig = <T extends VideoConfig>(config: any): config is T => {
  if (!config || typeof config !== 'object') {
    return false;
  }

  if (!Array.isArray(config.sources) || config.sources.length === 0) {
    return false;
  }

  // 验证每个源
  for (const source of config.sources) {
    if (!source.src || typeof source.src !== 'string') {
      return false;
    }
    if (!source.type || typeof source.type !== 'string') {
      return false;
    }
  }

  return true;
};

/**
 * 类型守卫 - 检查是否为有效的视频状态
 */
export const isVideoState = (value: any): value is VideoState => {
  return typeof value === 'string' && [
    'idle', 'loading', 'canplay', 'play', 'playing', 
    'pause', 'paused', 'seeking', 'waiting', 'ended', 'error'
  ].includes(value);
};

/**
 * 断言函数 - 验证视频配置
 */
export const assertVideoConfig = <T extends VideoConfig>(config: any): asserts config is T => {
  if (!validateVideoConfig(config)) {
    throw new Error('Invalid video configuration');
  }
};

/**
 * 检查是否为HLS配置
 */
export const isHLSConfig = (config: VideoConfig): config is HLSVideoConfig => {
  return config.sources.some(source => source.type === 'hls');
};

/**
 * 格式化时间 - 将秒数转换为 HH:MM:SS 格式
 */
export const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) {
    return '00:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func.apply(null, args);
    }, wait);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastTime >= wait) {
      lastTime = now;
      func.apply(null, args);
    }
  };
};

/**
 * 获取视频缩略图
 */
export const getVideoThumbnail = (
  video: HTMLVideoElement,
  time: number = 0
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    const originalTime = video.currentTime;
    
    const handleSeeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      
      // 恢复原始时间
      video.currentTime = originalTime;
      video.removeEventListener('seeked', handleSeeked);
      
      resolve(dataURL);
    };
    
    video.addEventListener('seeked', handleSeeked, { once: true });
    video.currentTime = time;
  });
};

/**
 * 检查浏览器功能支持
 */
export const checkBrowserFeatures = () => {
  return {
    fullscreen: !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
    ),
    pictureInPicture: 'pictureInPictureEnabled' in document,
    mediaSource: 'MediaSource' in window,
    webAssembly: 'WebAssembly' in window,
    serviceWorker: 'serviceWorker' in navigator,
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window
  };
};
