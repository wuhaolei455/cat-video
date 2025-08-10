// HLS 流媒体播放器 - 支持自适应比特率流

import Hls from 'hls.js';
import type { 
  VideoConfig, 
  HLSConfig, 
  HLSVideoConfig, 
  VideoQuality, 
  VideoState,
  VideoError,
  VideoEventType
} from './types';
import { HTML5VideoAPI } from './VideoAPI';

// HLS特定的质量级别映射
interface HLSQualityLevel {
  bitrate: number;
  width: number;
  height: number;
  level: number;
  name: VideoQuality;
}

// HLS播放器类 - 扩展HTML5VideoAPI
export class HLSPlayer<T extends Record<string, any> = Record<string, any>> 
  extends HTML5VideoAPI<HLSVideoConfig<T>> {
  
  private _hls: Hls | null = null;
  private _isHLSSupported = false;
  private _qualityLevels: HLSQualityLevel[] = [];
  private _currentLevel = -1; // -1 表示自动质量
  private _isLiveStream = false;

  constructor(element: HTMLVideoElement, config: HLSVideoConfig<T>) {
    super(element, config);
    
    this._isHLSSupported = this.checkHLSSupport();
    this.initializeHLS();
  }

  // 辅助方法 - 发射带有type的事件
  private emitEvent<T extends VideoEventType>(
    type: T, 
    payload: any, 
    currentTime?: number, 
    duration?: number
  ): void {
    this.emit(type, {
      type,
      timestamp: Date.now(),
      currentTime: currentTime ?? this.element.currentTime,
      duration: duration ?? (this.element.duration || 0),
      payload
    });
  }

  // 私有方法 - 检查HLS支持
  private checkHLSSupport(): boolean {
    // 检查原生HLS支持
    if (this.element.canPlayType('application/vnd.apple.mpegurl')) {
      return true;
    }
    
    // 检查HLS.js支持
    return Hls.isSupported();
  }

  // 私有方法 - 初始化HLS
  private initializeHLS(): void {
    if (!this._isHLSSupported) {
      this.handleHLSError('HLS not supported', false);
      return;
    }

    // 如果浏览器原生支持HLS，直接使用
    if (this.element.canPlayType('application/vnd.apple.mpegurl')) {
      this.loadHLSNatively();
      return;
    }

    // 使用HLS.js
    if (Hls.isSupported()) {
      this.initializeHLSJS();
    }
  }

  // 私有方法 - 使用原生HLS
  private loadHLSNatively(): void {
    const hlsSource = this.config.sources.find(source => source.type === 'hls');
    if (hlsSource) {
      this.element.src = hlsSource.src;
      this.emitEvent('ready', { method: 'native' }, 0, 0);
    }
  }

  // 私有方法 - 初始化HLS.js
  private initializeHLSJS(): void {
    const hlsConfig = this.createHLSConfig();
    this._hls = new Hls(hlsConfig);
    
    this.bindHLSEvents();
    this.loadHLSSource();
  }

  // 私有方法 - 创建HLS配置
  private createHLSConfig(): Partial<Hls['config']> {
    const userConfig = this.config.hls || {};
    
    return {
      // 默认配置
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
      maxBufferSize: 60 * 1000 * 1000,
      maxBufferHole: 0.5,
      highBufferWatchdogPeriod: 2,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 3,
      maxFragLookUpTolerance: 0.25,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 10,
      enableSoftwareAES: true,
      manifestLoadingTimeOut: 10000,
      manifestLoadingMaxRetry: 1,
      manifestLoadingRetryDelay: 1000,
      levelLoadingTimeOut: 10000,
      levelLoadingMaxRetry: 4,
      levelLoadingRetryDelay: 1000,
      fragLoadingTimeOut: 20000,
      fragLoadingMaxRetry: 6,
      fragLoadingRetryDelay: 1000,
      startFragPrefetch: false,
      testBandwidth: true,
      progressive: false,
      debug: false,
      
      // 用户自定义配置
      ...userConfig
    };
  }

  // 私有方法 - 绑定HLS事件
  private bindHLSEvents(): void {
    if (!this._hls) return;

    // HLS.js事件映射
    const eventMap: Record<string, (event: string, data: any) => void> = {
      [Hls.Events.MEDIA_ATTACHED]: () => {
        console.log('HLS: Media attached');
      },
      
      [Hls.Events.MANIFEST_LOADED]: (event, data) => {
        this._isLiveStream = data.live;
        this.processQualityLevels(data.levels);
        
        this.emitEvent('ready', { 
          method: 'hls.js',
          live: this._isLiveStream,
          levels: data.levels.length
        }, 0, data.totalduration || 0);
      },
      
      [Hls.Events.LEVEL_LOADED]: (event, data) => {
        this.emitEvent('progress', {
          loaded: data.details.endSN - data.details.startSN,
          total: data.details.fragments.length
        });
      },
      
      [Hls.Events.LEVEL_SWITCHING]: (event, data) => {
        const newLevel = this._qualityLevels[data.level];
        const oldLevel = this._qualityLevels[this._currentLevel] || { name: 'auto' as VideoQuality };
        
        this._currentLevel = data.level;
        
        this.emitEvent('qualitychange', {
          from: oldLevel.name,
          to: newLevel?.name || 'auto'
        });
      },
      
      [Hls.Events.FRAG_BUFFERED]: () => {
        // 分片缓冲完成
      },
      
      [Hls.Events.BUFFER_APPENDING]: () => {
        this.emitEvent('buffering', {
          isBuffering: true,
          bufferLevel: this.getBufferLevel()
        });
      },
      
      [Hls.Events.BUFFER_APPENDED]: () => {
        this.emitEvent('buffering', {
          isBuffering: false,
          bufferLevel: this.getBufferLevel()
        });
      },
      
      [Hls.Events.ERROR]: (event, data) => {
        this.handleHLSError(data);
      }
    };

    // 绑定所有事件
    Object.entries(eventMap).forEach(([event, handler]) => {
      this._hls!.on(event as any, handler);
    });
  }

  // 私有方法 - 处理质量级别
  private processQualityLevels(levels: any[]): void {
    this._qualityLevels = levels.map((level, index) => ({
      bitrate: level.bitrate,
      width: level.width,
      height: level.height,
      level: index,
      name: this.getQualityNameFromHeight(level.height)
    }));

    // 排序：从高质量到低质量
    this._qualityLevels.sort((a, b) => b.height - a.height);
  }

  // 私有方法 - 根据高度获取质量名称
  private getQualityNameFromHeight(height: number): VideoQuality {
    if (height >= 2160) return '2160p';
    if (height >= 1440) return '1440p';
    if (height >= 1080) return '1080p';
    if (height >= 720) return '720p';
    if (height >= 480) return '480p';
    if (height >= 360) return '360p';
    return '240p';
  }

  // 私有方法 - 获取缓冲级别
  private getBufferLevel(): number {
    if (!this._hls) return 0;
    
    try {
      // 尝试获取缓冲信息，如果API不可用则返回0
      const buffered = this.element.buffered;
      if (buffered.length > 0) {
        const currentTime = this.element.currentTime;
        const bufferedEnd = buffered.end(buffered.length - 1);
        return Math.max(0, bufferedEnd - currentTime);
      }
    } catch (error) {
      console.warn('Failed to get buffer level:', error);
    }
    
    return 0;
  }

  // 私有方法 - 加载HLS源
  private loadHLSSource(): void {
    if (!this._hls) return;
    
    const hlsSource = this.config.sources.find(source => source.type === 'hls');
    if (hlsSource) {
      this._hls.attachMedia(this.element);
      this._hls.loadSource(hlsSource.src);
    }
  }

  // 私有方法 - 处理HLS错误
  private handleHLSError(error: any, fatal = true): void {
    let videoError: VideoError;
    
    if (typeof error === 'string') {
      videoError = {
        type: 'unknown',
        code: 0,
        message: error,
        timestamp: Date.now(),
        fatal,
        details: {}
      };
    } else {
      videoError = {
        type: this.mapHLSErrorType(error.type),
        code: 0,
        message: error.details || 'HLS Error',
        timestamp: Date.now(),
        fatal: error.fatal || fatal,
        details: {
          hlsError: error,
          type: error.type,
          details: error.details,
          reason: error.reason
        }
      };
    }

    this.emitEvent('error', videoError);

    // 尝试恢复
    if (this._hls && error.fatal) {
      this.attemptRecovery(error);
    }
  }

  // 私有方法 - 映射HLS错误类型
  private mapHLSErrorType(hlsErrorType: string): 'network' | 'decode' | 'src_not_supported' | 'unknown' {
    switch (hlsErrorType) {
      case 'networkError':
        return 'network';
      case 'mediaError':
        return 'decode';
      case 'muxError':
        return 'src_not_supported';
      default:
        return 'unknown';
    }
  }

  // 私有方法 - 尝试错误恢复
  private attemptRecovery(error: any): void {
    if (!this._hls) return;

    switch (error.type) {
      case 'networkError':
        console.log('HLS: Attempting network error recovery...');
        this._hls.startLoad();
        break;
      case 'mediaError':
        console.log('HLS: Attempting media error recovery...');
        this._hls.recoverMediaError();
        break;
      default:
        console.log('HLS: Attempting generic recovery...');
        this._hls.destroy();
        this.initializeHLSJS();
        break;
    }
  }

  // 重写质量控制方法
  setQuality(quality: VideoQuality): void {
    if (!this._hls) {
      super.setQuality(quality);
      return;
    }

    const oldQuality = this.getCurrentQuality();

    if (quality === 'auto') {
      this._hls.currentLevel = -1; // 启用自动质量
      this._currentLevel = -1;
    } else {
      const levelIndex = this._qualityLevels.findIndex(level => level.name === quality);
      if (levelIndex !== -1) {
        this._hls.currentLevel = this._qualityLevels[levelIndex].level;
        this._currentLevel = levelIndex;
      }
    }

    // 发射质量变更事件
    this.emitEvent('qualitychange', { from: oldQuality, to: quality });

    // 更新统计
    this.stats.qualityChanges++;
  }

  // 重写获取可用质量方法
  getAvailableQualities(): VideoQuality[] {
    const qualities: VideoQuality[] = ['auto'];
    
    if (this._qualityLevels.length > 0) {
      const levelQualities = this._qualityLevels.map(level => level.name);
      qualities.push(...levelQualities);
    }
    
    return [...new Set(qualities)]; // 去重
  }

  // 获取当前质量
  getCurrentQuality(): VideoQuality {
    if (this._currentLevel === -1) {
      return 'auto';
    }
    
    return this._qualityLevels[this._currentLevel]?.name || 'auto';
  }

  // 获取HLS统计信息
  getHLSStats(): Record<string, any> {
    if (!this._hls) return {};

    return {
      isLive: this._isLiveStream,
      currentLevel: this._currentLevel,
      levels: this._qualityLevels,
      bufferLength: this.getBufferLevel(),
      loadLevel: this._hls.loadLevel,
      autoLevelEnabled: this._hls.autoLevelEnabled,
      autoLevelCapping: this._hls.autoLevelCapping,
      bandwidthEstimate: this._hls.bandwidthEstimate,
      url: this._hls.url
    };
  }

  // 设置HLS特定配置
  updateHLSConfig(config: Partial<HLSConfig<T>>): void {
    if (!this._hls) return;

    // 更新配置
    Object.assign(this._hls.config, config);
    
    // 重新加载以应用新配置
    const currentTime = this.element.currentTime;
    const isPlaying = !this.element.paused;
    
    this._hls.destroy();
    this.initializeHLSJS();
    
    // 恢复播放状态
    this.element.addEventListener('loadeddata', () => {
      this.seek(currentTime);
      if (isPlaying) {
        this.play();
      }
    }, { once: true });
  }

  // 重写销毁方法
  destroy(): void {
    if (this._hls) {
      this._hls.destroy();
      this._hls = null;
    }
    
    this._qualityLevels = [];
    this._currentLevel = -1;
    
    super.destroy();
  }
}

// 工厂函数
export const createHLSPlayer = <T extends Record<string, any>>(
  element: HTMLVideoElement,
  config: HLSVideoConfig<T>
): HLSPlayer<T> => {
  return new HLSPlayer(element, config);
};

// 类型守卫
export const isHLSPlayer = (player: any): player is HLSPlayer => {
  return player instanceof HLSPlayer;
};

// HLS支持检测
export const detectHLSSupport = (): {
  native: boolean;
  hls_js: boolean;
  supported: boolean;
} => {
  const video = document.createElement('video');
  const native = !!video.canPlayType('application/vnd.apple.mpegurl');
  const hls_js = Hls.isSupported();
  
  return {
    native,
    hls_js,
    supported: native || hls_js
  };
};
