// HTML5 Video API 封装 - 提供类型安全和事件驱动的视频操作

import type {
  VideoState,
  VideoQuality,
  PlaybackRate,
  VideoConfig,
  VideoMetadata,
  VideoStats,
  VideoError,
  VideoEventType,
  VideoEventData,
  VideoErrorType,
  VideoEventListener,
  VideoEventName,
  IVideoPlayer
} from './types';

import { VideoEventEmitterTyped } from './EventEmitter';

// HTML5 Video API 封装类
export class HTML5VideoAPI<TConfig extends VideoConfig = VideoConfig> 
  implements IVideoPlayer<TConfig> {
  
  private _element: HTMLVideoElement;
  private _config: TConfig;
  private _state: VideoState = 'idle';
  private _metadata: VideoMetadata | null = null;
  private _stats: VideoStats;
  private _isDestroyed = false;
  private _currentQuality: VideoQuality = 'auto';
  private _eventEmitter: VideoEventEmitterTyped;
  
  // 性能监控
  private _performanceObserver?: PerformanceObserver;
  private _loadStartTime = 0;
  private _playStartTime = 0;
  private _pauseStartTime = 0;

  constructor(element: HTMLVideoElement, config: TConfig) {
    this._element = element;
    this._config = { ...config };
    this._stats = this.initializeStats();
    this._eventEmitter = new VideoEventEmitterTyped();
    
    this.setupVideoElement();
    this.bindVideoEvents();
    this.setupPerformanceMonitoring();
    
    // 应用初始配置
    this.applyConfig();
  }

  // Getters - 实现接口属性
  get element(): HTMLVideoElement {
    return this._element;
  }

  get config(): TConfig {
    return { ...this._config };
  }

  get state(): VideoState {
    return this._state;
  }

  get metadata(): VideoMetadata | null {
    return this._metadata;
  }

  get stats(): VideoStats {
    return { ...this._stats };
  }

  // 私有方法 - 初始化统计信息
  private initializeStats(): VideoStats {
    return {
      loadTime: 0,
      playTime: 0,
      pauseTime: 0,
      seekCount: 0,
      errorCount: 0,
      qualityChanges: 0,
      bufferEvents: 0,
      averageBitrate: 0,
      droppedFrames: 0,
      totalFrames: 0
    };
  }

  // 私有方法 - 设置视频元素
  private setupVideoElement(): void {
    // 设置基本属性
    this._element.controls = this._config.controls ?? true;
    this._element.autoplay = this._config.autoplay ?? false;
    this._element.loop = this._config.loop ?? false;
    this._element.muted = this._config.muted ?? false;
    this._element.preload = this._config.preload ?? 'metadata';
    
    if (this._config.poster) {
      this._element.poster = this._config.poster;
    }
    
    if (this._config.crossOrigin) {
      this._element.crossOrigin = this._config.crossOrigin;
    }
    
    if (this._config.playsinline) {
      this._element.playsInline = this._config.playsinline;
    }
    
    if (this._config.width) {
      this._element.width = this._config.width;
    }
    
    if (this._config.height) {
      this._element.height = this._config.height;
    }
  }

  // 私有方法 - 绑定视频事件
  private bindVideoEvents(): void {
    const eventMap: Record<string, VideoEventType> = {
      'loadstart': 'loadstart',
      'loadedmetadata': 'loadedmetadata',
      'loadeddata': 'loadeddata',
      'canplay': 'canplay',
      'canplaythrough': 'canplaythrough',
      'play': 'play',
      'playing': 'playing',
      'pause': 'pause',
      'seeking': 'seeking',
      'seeked': 'seeked',
      'waiting': 'waiting',
      'timeupdate': 'timeupdate',
      'progress': 'progress',
      'volumechange': 'volumechange',
      'ratechange': 'ratechange',
      'ended': 'ended',
      'error': 'error',
      'stalled': 'stalled',
      'suspend': 'suspend',
      'abort': 'abort',
      'emptied': 'emptied',
      'durationchange': 'durationchange'
    };

    // 绑定所有HTML5视频事件
    Object.entries(eventMap).forEach(([domEvent, videoEvent]) => {
      this._element.addEventListener(domEvent, (e) => {
        this.handleVideoEvent(videoEvent, e);
      });
    });
  }

  // 私有方法 - 处理视频事件
  private handleVideoEvent(eventType: VideoEventType, domEvent: Event): void {
    if (this._isDestroyed) return;

    // 更新状态
    this.updateState(eventType);
    
    // 更新元数据
    this.updateMetadata();
    
    // 更新统计信息
    this.updateStats(eventType);
    
    // 创建事件数据
    const eventData = this.createEventData(eventType, domEvent);
    
    // 发射事件
    this.emit(eventType, eventData);
  }

  // 私有方法 - 更新状态
  private updateState(eventType: VideoEventType): void {
    switch (eventType) {
      case 'loadstart':
        this._state = 'loading';
        this._loadStartTime = performance.now();
        break;
      case 'canplay':
        this._state = 'canplay';
        break;
      case 'playing':
        this._state = 'playing';
        this._playStartTime = performance.now();
        break;
      case 'pause':
        this._state = 'paused';
        this._pauseStartTime = performance.now();
        break;
      case 'seeking':
        this._state = 'seeking';
        break;
      case 'waiting':
        this._state = 'waiting';
        break;
      case 'ended':
        this._state = 'ended';
        break;
      case 'error':
        this._state = 'error';
        break;
    }
  }

  // 私有方法 - 更新元数据
  private updateMetadata(): void {
    if (this._element.readyState >= 1) { // HAVE_METADATA
      this._metadata = {
        duration: this._element.duration || 0,
        videoWidth: this._element.videoWidth || 0,
        videoHeight: this._element.videoHeight || 0,
        readyState: this._element.readyState,
        networkState: this._element.networkState,
        buffered: this._element.buffered,
        seekable: this._element.seekable,
        played: this._element.played
      };
    }
  }

  // 私有方法 - 更新统计信息
  private updateStats(eventType: VideoEventType): void {
    const now = performance.now();
    
    switch (eventType) {
      case 'loadeddata':
        if (this._loadStartTime > 0) {
          this._stats.loadTime = now - this._loadStartTime;
        }
        break;
      case 'playing':
        if (this._pauseStartTime > 0) {
          this._stats.pauseTime += now - this._pauseStartTime;
          this._pauseStartTime = 0;
        }
        break;
      case 'pause':
        if (this._playStartTime > 0) {
          this._stats.playTime += now - this._playStartTime;
          this._playStartTime = 0;
        }
        break;
      case 'seeked':
        this._stats.seekCount++;
        break;
      case 'error':
        this._stats.errorCount++;
        break;
      case 'waiting':
        this._stats.bufferEvents++;
        break;
    }
  }

  // 私有方法 - 创建事件数据
  private createEventData(eventType: VideoEventType, domEvent: Event): VideoEventData<any> {
    const baseData = {
      type: eventType,
      timestamp: Date.now(),
      currentTime: this._element.currentTime || 0,
      duration: this._element.duration || 0
    };

    switch (eventType) {
      case 'error':
        const error = this._element.error;
        const videoError: VideoError = {
          type: this.getErrorType(error?.code || 0),
          code: error?.code || 0,
          message: error?.message || 'Unknown error',
          timestamp: Date.now(),
          fatal: true,
          details: { domEvent }
        };
        return { ...baseData, payload: videoError };
        
      case 'volumechange':
        return {
          ...baseData,
          payload: {
            volume: this._element.volume,
            muted: this._element.muted
          }
        };
        
      case 'ratechange':
        return {
          ...baseData,
          payload: {
            rate: this._element.playbackRate as PlaybackRate
          }
        };
        
      case 'progress':
        const buffered = this._element.buffered;
        const loaded = buffered.length > 0 ? buffered.end(buffered.length - 1) : 0;
        const total = this._element.duration || 0;
        return {
          ...baseData,
          payload: { loaded, total }
        };
        
      case 'timeupdate':
        return {
          ...baseData,
          payload: {
            currentTime: this._element.currentTime,
            duration: this._element.duration || 0
          }
        };
        
      default:
        return { ...baseData, payload: {} };
    }
  }

  // 私有方法 - 获取错误类型
  private getErrorType(code: number): VideoErrorType {
    switch (code) {
      case 1: return 'unknown';
      case 2: return 'network';
      case 3: return 'decode';
      case 4: return 'src_not_supported';
      default: return 'unknown';
    }
  }

  // 私有方法 - 设置性能监控
  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this._performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.name.includes('video')) {
            // 处理性能指标
            this.handlePerformanceEntry(entry);
          }
        }
      });
      
      try {
        this._performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (e) {
        console.warn('Performance monitoring not supported:', e);
      }
    }
  }

  // 私有方法 - 处理性能条目
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    // 可以在这里处理特定的性能指标
    console.debug('Performance entry:', entry);
  }

  // 私有方法 - 应用配置
  private applyConfig(): void {
    if (this._config.volume !== undefined) {
      this.setVolume(this._config.volume);
    }
    
    if (this._config.playbackRate !== undefined) {
      this.setPlaybackRate(this._config.playbackRate);
    }
    
    if (this._config.currentTime !== undefined) {
      this.seek(this._config.currentTime);
    }
    
    // 设置视频源
    if (this._config.sources.length > 0) {
      this.loadSources();
    }
  }

  // 私有方法 - 加载视频源
  private loadSources(): void {
    // 清除现有源
    while (this._element.firstChild) {
      this._element.removeChild(this._element.firstChild);
    }
    
    // 添加新源
    this._config.sources.forEach(source => {
      const sourceElement = document.createElement('source');
      sourceElement.src = source.src;
      sourceElement.type = `video/${source.type}`;
      
      if (source.quality) {
        sourceElement.setAttribute('data-quality', source.quality);
      }
      
      if (source.label) {
        sourceElement.setAttribute('data-label', source.label);
      }
      
      this._element.appendChild(sourceElement);
    });
    
    // 重新加载视频
    this._element.load();
  }

  // 实现IVideoPlayer接口的事件方法
  on<T extends VideoEventType>(event: T, listener: VideoEventListener<T>): void {
    this._eventEmitter.onVideoEvent(event, listener);
  }

  off<T extends VideoEventType>(event: T, listener: VideoEventListener<T>): void {
    this._eventEmitter.offVideoEvent(event, listener);
  }

  emit<T extends VideoEventType>(event: T, data: VideoEventData<T>): void {
    this._eventEmitter.emitVideoEvent(event, data);
  }

  // 公共方法 - 实现IVideoPlayer接口

  async play(): Promise<void> {
    try {
      await this._element.play();
    } catch (error) {
      const videoError: VideoError = {
        type: 'unknown',
        code: 0,
        message: error instanceof Error ? error.message : 'Play failed',
        timestamp: Date.now(),
        fatal: false,
        details: { error }
      };
      
      this.emit('error', {
        type: 'error',
        timestamp: Date.now(),
        currentTime: this._element.currentTime,
        duration: this._element.duration || 0,
        payload: videoError
      });
      
      throw error;
    }
  }

  pause(): void {
    this._element.pause();
  }

  stop(): void {
    this.pause();
    this.seek(0);
  }

  seek(time: number): void {
    if (time >= 0 && time <= (this._element.duration || 0)) {
      this._element.currentTime = time;
    }
  }

  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this._element.volume = clampedVolume;
  }

  mute(): void {
    this._element.muted = true;
  }

  unmute(): void {
    this._element.muted = false;
  }

  toggleMute(): void {
    this._element.muted = !this._element.muted;
  }

  setPlaybackRate(rate: PlaybackRate): void {
    this._element.playbackRate = rate;
  }

  setQuality(quality: VideoQuality): void {
    // 基础实现 - 子类可以重写以支持自适应质量
    this._currentQuality = quality;
    
    this.emit('qualitychange', {
      type: 'qualitychange',
      timestamp: Date.now(),
      currentTime: this._element.currentTime,
      duration: this._element.duration || 0,
      payload: { from: this._currentQuality, to: quality }
    });
    
    this._stats.qualityChanges++;
  }

  getAvailableQualities(): VideoQuality[] {
    // 从配置中获取可用质量
    return this._config.qualities || ['auto'];
  }

  async enterFullscreen(): Promise<void> {
    if (this._element.requestFullscreen) {
      await this._element.requestFullscreen();
    }
  }

  async exitFullscreen(): Promise<void> {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  }

  async toggleFullscreen(): Promise<void> {
    if (document.fullscreenElement) {
      await this.exitFullscreen();
    } else {
      await this.enterFullscreen();
    }
  }

  async enterPiP(): Promise<void> {
    if ('pictureInPictureEnabled' in document && (this._element as any).requestPictureInPicture) {
      await (this._element as any).requestPictureInPicture();
    }
  }

  async exitPiP(): Promise<void> {
    if ('pictureInPictureEnabled' in document && (document as any).exitPictureInPicture) {
      await (document as any).exitPictureInPicture();
    }
  }

  async togglePiP(): Promise<void> {
    if ((document as any).pictureInPictureElement) {
      await this.exitPiP();
    } else {
      await this.enterPiP();
    }
  }

  // 销毁方法
  destroy(): void {
    if (this._isDestroyed) return;
    
    this._isDestroyed = true;
    
    // 停止性能监控
    if (this._performanceObserver) {
      this._performanceObserver.disconnect();
    }
    
    // 清理视频元素
    this._element.pause();
    this._element.removeAttribute('src');
    this._element.load();
    
    // 清理事件监听器
    this._eventEmitter.destroy();
  }
}

// 工厂函数
export const createHTML5VideoAPI = <T extends VideoConfig>(
  element: HTMLVideoElement,
  config: T
): HTML5VideoAPI<T> => {
  return new HTML5VideoAPI(element, config);
};

// 类型守卫
export const isHTML5VideoAPI = (player: any): player is HTML5VideoAPI => {
  return player instanceof HTML5VideoAPI;
};
