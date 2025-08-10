// 视频播放器工厂 - 使用泛型和类型约束创建合适的播放器实例

import type {
  VideoConfig,
  VideoFormat,
  VideoQuality,
  HLSVideoConfig,
  IVideoPlayer,
  VideoPlayerFromConfig,
  RequiresExternalLib,
  VideoSource,
  HLSConfig
} from './types';

import { HTML5VideoAPI } from './VideoAPI';
import { HLSPlayer, detectHLSSupport } from './HLSPlayer';

// 泛型约束 - 确保配置有效
type ValidVideoConfig<T extends VideoConfig> = T extends VideoConfig
  ? T['sources'] extends VideoSource[]
    ? T['sources']['length'] extends 0
      ? never // 不允许空源数组
      : T
    : never
  : never;

// 条件类型 - 根据源类型确定播放器类型
type PlayerTypeFromSources<T extends VideoSource[]> = 
  T[number]['type'] extends 'hls'
    ? 'hls'
    : T[number]['type'] extends 'dash'
    ? 'dash'
    : 'html5';

// 映射类型 - 播放器构造函数映射
interface PlayerConstructorMap {
  html5: typeof HTML5VideoAPI;
  hls: typeof HLSPlayer;
  dash: never; // 暂未实现DASH
}

// 播放器工厂类
export class VideoPlayerFactory {
  private static instance: VideoPlayerFactory;
  private playerRegistry = new Map<string, IVideoPlayer>();

  private constructor() {}

  // 单例模式
  static getInstance(): VideoPlayerFactory {
    if (!VideoPlayerFactory.instance) {
      VideoPlayerFactory.instance = new VideoPlayerFactory();
    }
    return VideoPlayerFactory.instance;
  }

  /**
   * 创建视频播放器 - 主要工厂方法
   */
  create<T extends VideoConfig>(
    element: HTMLVideoElement,
    config: ValidVideoConfig<T>
  ): VideoPlayerFromConfig<T> {
    // 验证配置
    this.validateConfig(config);
    
    // 确定播放器类型
    const playerType = this.determinePlayerType(config.sources);
    
    // 创建播放器实例
    const player = this.createPlayerInstance(element, config, playerType);
    
    // 注册播放器
    const playerId = this.generatePlayerId();
    this.playerRegistry.set(playerId, player);
    
    return player as unknown as VideoPlayerFromConfig<T>;
  }

  /**
   * 创建HTML5播放器 - 类型安全的工厂方法
   */
  createHTML5Player<T extends VideoConfig>(
    element: HTMLVideoElement,
    config: ValidVideoConfig<T>
  ): HTML5VideoAPI<T> {
    this.validateConfig(config);
    return new HTML5VideoAPI(element, config);
  }

  /**
   * 创建HLS播放器 - 类型约束确保HLS配置
   */
  createHLSPlayer<T extends Record<string, any> = Record<string, any>>(
    element: HTMLVideoElement,
    config: ValidVideoConfig<HLSVideoConfig<T>>
  ): HLSPlayer<T> {
    this.validateHLSConfig(config);
    return new HLSPlayer(element, config);
  }

  /**
   * 智能创建 - 根据环境和配置自动选择最佳播放器
   */
  createSmart<T extends VideoConfig>(
    element: HTMLVideoElement,
    config: ValidVideoConfig<T>
  ): VideoPlayerFromConfig<T> {
    const hasHLS = config.sources.some(source => source.type === 'hls');
    
    if (hasHLS) {
      const hlsSupport = detectHLSSupport();
      
      if (!hlsSupport.supported) {
        throw new Error('HLS playback not supported in this environment');
      }
      
      // 确保HLS配置完整
      const hlsConfig = this.ensureHLSConfig(config);
      return this.createHLSPlayer(element, hlsConfig as any) as unknown as VideoPlayerFromConfig<T>;
    }
    
    return this.createHTML5Player(element, config) as unknown as VideoPlayerFromConfig<T>;
  }

  /**
   * 批量创建播放器
   */
  createBatch<T extends VideoConfig>(
    configs: Array<{ element: HTMLVideoElement; config: ValidVideoConfig<T> }>
  ): VideoPlayerFromConfig<T>[] {
    return configs.map(({ element, config }) => this.create(element, config));
  }

  /**
   * 从现有播放器克隆配置创建新播放器
   */
  clone<T extends VideoConfig>(
    existingPlayer: IVideoPlayer<T>,
    newElement: HTMLVideoElement,
    configOverrides?: Partial<T>
  ): VideoPlayerFromConfig<T> {
    const newConfig = {
      ...existingPlayer.config,
      ...configOverrides
    } as ValidVideoConfig<T>;
    
    return this.create(newElement, newConfig);
  }

  // 私有方法 - 验证配置
  private validateConfig<T extends VideoConfig>(config: T): asserts config is ValidVideoConfig<T> {
    if (!config) {
      throw new Error('Video configuration is required');
    }
    
    if (!Array.isArray(config.sources) || config.sources.length === 0) {
      throw new Error('At least one video source is required');
    }
    
    // 验证每个源
    config.sources.forEach((source, index) => {
      if (!source.src) {
        throw new Error(`Source ${index} is missing src property`);
      }
      
      if (!source.type) {
        throw new Error(`Source ${index} is missing type property`);
      }
      
      if (!this.isValidVideoFormat(source.type)) {
        throw new Error(`Source ${index} has invalid type: ${source.type}`);
      }
    });
  }

  // 私有方法 - 验证HLS配置
  private validateHLSConfig<T extends Record<string, any>>(
    config: HLSVideoConfig<T>
  ): asserts config is ValidVideoConfig<HLSVideoConfig<T>> {
    this.validateConfig(config);
    
    const hasHLSSource = config.sources.some(source => source.type === 'hls');
    if (!hasHLSSource) {
      throw new Error('HLS configuration requires at least one HLS source');
    }
    
    if (!config.hls) {
      throw new Error('HLS configuration object is required for HLS player');
    }
  }

  // 私有方法 - 确保HLS配置存在
  private ensureHLSConfig<T extends VideoConfig>(config: T): HLSVideoConfig {
    if (this.isHLSConfig(config)) {
      return config;
    }
    
    // 为非HLS配置添加默认HLS配置
    return {
      ...config,
      hls: {
        enableWorker: true,
        lowLatencyMode: false,
        debug: false
      }
    } as HLSVideoConfig;
  }

  // 私有方法 - 检查是否为HLS配置
  private isHLSConfig(config: VideoConfig): config is HLSVideoConfig {
    return 'hls' in config && 
           config.sources.some(source => source.type === 'hls');
  }

  // 私有方法 - 确定播放器类型
  private determinePlayerType(sources: VideoSource[]): keyof PlayerConstructorMap {
    // 优先级：HLS > DASH > HTML5
    if (sources.some(source => source.type === 'hls')) {
      return 'hls';
    }
    
    if (sources.some(source => source.type === 'dash')) {
      return 'dash';
    }
    
    return 'html5';
  }

  // 私有方法 - 创建播放器实例
  private createPlayerInstance<T extends VideoConfig>(
    element: HTMLVideoElement,
    config: T,
    playerType: keyof PlayerConstructorMap
  ): IVideoPlayer<T> {
    switch (playerType) {
      case 'html5':
        return new HTML5VideoAPI(element, config);
      
      case 'hls':
        if (!this.isHLSConfig(config)) {
          throw new Error('HLS player requires HLS configuration');
        }
        return new HLSPlayer(element, config as HLSVideoConfig) as unknown as IVideoPlayer<T>;
      
      case 'dash':
        throw new Error('DASH player not implemented yet');
      
      default:
        throw new Error(`Unknown player type: ${playerType}`);
    }
  }

  // 私有方法 - 验证视频格式
  private isValidVideoFormat(format: string): format is VideoFormat {
    return ['mp4', 'webm', 'ogg', 'hls', 'dash'].includes(format);
  }

  // 私有方法 - 生成播放器ID
  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取注册的播放器
   */
  getPlayer(id: string): IVideoPlayer | undefined {
    return this.playerRegistry.get(id);
  }

  /**
   * 获取所有注册的播放器
   */
  getAllPlayers(): IVideoPlayer[] {
    return Array.from(this.playerRegistry.values());
  }

  /**
   * 注销播放器
   */
  unregister(id: string): boolean {
    const player = this.playerRegistry.get(id);
    if (player) {
      player.destroy();
      return this.playerRegistry.delete(id);
    }
    return false;
  }

  /**
   * 销毁所有播放器
   */
  destroyAll(): void {
    for (const player of this.playerRegistry.values()) {
      player.destroy();
    }
    this.playerRegistry.clear();
  }

  /**
   * 获取播放器统计信息
   */
  getStats(): {
    totalPlayers: number;
    playerTypes: Record<string, number>;
    memoryUsage: number;
  } {
    const players = Array.from(this.playerRegistry.values());
    const playerTypes: Record<string, number> = {};
    
    players.forEach(player => {
      const type = player.constructor.name;
      playerTypes[type] = (playerTypes[type] || 0) + 1;
    });
    
    return {
      totalPlayers: players.length,
      playerTypes,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // 私有方法 - 估算内存使用
  private estimateMemoryUsage(): number {
    // 简单的内存使用估算
    return this.playerRegistry.size * 1024 * 1024; // 每个播放器大约1MB
  }
}

// 便捷的工厂函数
export const videoPlayerFactory = VideoPlayerFactory.getInstance();

/**
 * 创建视频播放器 - 全局便捷函数
 */
export const createVideoPlayer = <T extends VideoConfig>(
  element: HTMLVideoElement,
  config: ValidVideoConfig<T>
): VideoPlayerFromConfig<T> => {
  return videoPlayerFactory.create(element, config);
};

/**
 * 智能创建播放器 - 自动选择最佳播放器类型
 */
export const createSmartVideoPlayer = <T extends VideoConfig>(
  element: HTMLVideoElement,
  config: ValidVideoConfig<T>
): VideoPlayerFromConfig<T> => {
  return videoPlayerFactory.createSmart(element, config);
};

/**
 * 创建HLS播放器 - 类型安全的HLS播放器创建
 */
export const createHLSVideoPlayer = <T extends Record<string, any> = Record<string, any>>(
  element: HTMLVideoElement,
  config: ValidVideoConfig<HLSVideoConfig<T>>
): HLSPlayer<T> => {
  return videoPlayerFactory.createHLSPlayer(element, config);
};

// 类型守卫函数
export const isVideoPlayerFactory = (obj: any): obj is VideoPlayerFactory => {
  return obj instanceof VideoPlayerFactory;
};

// 配置构建器 - 流式API构建配置
export class VideoConfigBuilder<T extends VideoConfig = VideoConfig> {
  private config: Partial<T> = {};

  static create<TConfig extends VideoConfig = VideoConfig>(): VideoConfigBuilder<TConfig> {
    return new VideoConfigBuilder<TConfig>();
  }

  sources(sources: VideoSource[]): this {
    (this.config as any).sources = sources;
    return this;
  }

  addSource(source: VideoSource): this {
    if (!(this.config as any).sources) {
      (this.config as any).sources = [];
    }
    (this.config as any).sources.push(source);
    return this;
  }

  poster(url: string): this {
    (this.config as any).poster = url;
    return this;
  }

  autoplay(enabled: boolean = true): this {
    (this.config as any).autoplay = enabled;
    return this;
  }

  loop(enabled: boolean = true): this {
    (this.config as any).loop = enabled;
    return this;
  }

  muted(enabled: boolean = true): this {
    (this.config as any).muted = enabled;
    return this;
  }

  controls(enabled: boolean = true): this {
    (this.config as any).controls = enabled;
    return this;
  }

  dimensions(width: number, height: number): this {
    (this.config as any).width = width;
    (this.config as any).height = height;
    return this;
  }

  qualities(qualities: VideoQuality[]): this {
    (this.config as any).qualities = qualities;
    return this;
  }

  preload(preload: 'none' | 'metadata' | 'auto'): this {
    (this.config as any).preload = preload;
    return this;
  }

  hls<THls extends Record<string, any>>(hlsConfig: HLSConfig<THls>): VideoConfigBuilder<HLSVideoConfig<THls>> {
    (this.config as any).hls = hlsConfig;
    return this as any;
  }

  build(): ValidVideoConfig<T> {
    if (!this.config.sources || this.config.sources.length === 0) {
      throw new Error('At least one video source is required');
    }
    
    return this.config as ValidVideoConfig<T>;
  }
}

// 预设配置工厂
export class PresetConfigFactory {
  /**
   * 创建基础MP4配置
   */
  static mp4(src: string): VideoConfigBuilder<VideoConfig> {
    return VideoConfigBuilder.create()
      .addSource({ src, type: 'mp4' })
      .controls(true)
      .preload('metadata');
  }

  /**
   * 创建HLS流配置
   */
  static hls(src: string, hlsConfig?: Partial<HLSConfig>): VideoConfigBuilder<HLSVideoConfig> {
    return VideoConfigBuilder.create<HLSVideoConfig>()
      .addSource({ src, type: 'hls' })
      .controls(true)
      .hls({
        enableWorker: true,
        lowLatencyMode: false,
        debug: false,
        ...hlsConfig
      });
  }

  /**
   * 创建多质量配置
   */
  static multiQuality(sources: VideoSource[]): VideoConfigBuilder<VideoConfig> {
    return VideoConfigBuilder.create()
      .sources(sources)
      .controls(true)
      .qualities(['auto', '1080p', '720p', '480p', '360p']);
  }

  /**
   * 创建直播配置
   */
  static live(hlsSrc: string): VideoConfigBuilder<HLSVideoConfig> {
    return VideoConfigBuilder.create<HLSVideoConfig>()
      .addSource({ src: hlsSrc, type: 'hls' })
      .controls(true)
      .hls({
        enableWorker: true,
        lowLatencyMode: true,
        liveSyncDurationCount: 1,
        liveMaxLatencyDurationCount: 3,
        maxBufferLength: 10,
        debug: false
      });
  }
}

// 已在上面导出，不需要重复导出

// 默认导出工厂实例
export default videoPlayerFactory;
