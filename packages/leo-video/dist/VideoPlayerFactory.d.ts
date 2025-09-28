import type { VideoConfig, VideoQuality, HLSVideoConfig, IVideoPlayer, VideoPlayerFromConfig, VideoSource, HLSConfig } from './types';
import { HTML5VideoAPI } from './VideoAPI';
import { HLSPlayer } from './HLSPlayer';
type ValidVideoConfig<T extends VideoConfig> = T extends VideoConfig ? T['sources'] extends VideoSource[] ? T['sources']['length'] extends 0 ? never : T : never : never;
export declare class VideoPlayerFactory {
    private static instance;
    private playerRegistry;
    private constructor();
    static getInstance(): VideoPlayerFactory;
    /**
     * 创建视频播放器 - 主要工厂方法
     */
    create<T extends VideoConfig>(element: HTMLVideoElement, config: ValidVideoConfig<T>): VideoPlayerFromConfig<T>;
    /**
     * 创建HTML5播放器 - 类型安全的工厂方法
     */
    createHTML5Player<T extends VideoConfig>(element: HTMLVideoElement, config: ValidVideoConfig<T>): HTML5VideoAPI<T>;
    /**
     * 创建HLS播放器 - 类型约束确保HLS配置
     */
    createHLSPlayer<T extends Record<string, any> = Record<string, any>>(element: HTMLVideoElement, config: ValidVideoConfig<HLSVideoConfig<T>>): HLSPlayer<T>;
    /**
     * 智能创建 - 根据环境和配置自动选择最佳播放器
     */
    createSmart<T extends VideoConfig>(element: HTMLVideoElement, config: ValidVideoConfig<T>): VideoPlayerFromConfig<T>;
    /**
     * 批量创建播放器
     */
    createBatch<T extends VideoConfig>(configs: Array<{
        element: HTMLVideoElement;
        config: ValidVideoConfig<T>;
    }>): VideoPlayerFromConfig<T>[];
    /**
     * 从现有播放器克隆配置创建新播放器
     */
    clone<T extends VideoConfig>(existingPlayer: IVideoPlayer<T>, newElement: HTMLVideoElement, configOverrides?: Partial<T>): VideoPlayerFromConfig<T>;
    private validateConfig;
    private validateHLSConfig;
    private ensureHLSConfig;
    private isHLSConfig;
    private determinePlayerType;
    private createPlayerInstance;
    private isValidVideoFormat;
    private generatePlayerId;
    /**
     * 获取注册的播放器
     */
    getPlayer(id: string): IVideoPlayer | undefined;
    /**
     * 获取所有注册的播放器
     */
    getAllPlayers(): IVideoPlayer[];
    /**
     * 注销播放器
     */
    unregister(id: string): boolean;
    /**
     * 销毁所有播放器
     */
    destroyAll(): void;
    /**
     * 获取播放器统计信息
     */
    getStats(): {
        totalPlayers: number;
        playerTypes: Record<string, number>;
        memoryUsage: number;
    };
    private estimateMemoryUsage;
}
export declare const videoPlayerFactory: VideoPlayerFactory;
/**
 * 创建视频播放器 - 全局便捷函数
 */
export declare const createVideoPlayer: <T extends VideoConfig>(element: HTMLVideoElement, config: ValidVideoConfig<T>) => VideoPlayerFromConfig<T>;
/**
 * 智能创建播放器 - 自动选择最佳播放器类型
 */
export declare const createSmartVideoPlayer: <T extends VideoConfig>(element: HTMLVideoElement, config: ValidVideoConfig<T>) => VideoPlayerFromConfig<T>;
/**
 * 创建HLS播放器 - 类型安全的HLS播放器创建
 */
export declare const createHLSVideoPlayer: <T extends Record<string, any> = Record<string, any>>(element: HTMLVideoElement, config: ValidVideoConfig<HLSVideoConfig<T>>) => HLSPlayer<T>;
export declare const isVideoPlayerFactory: (obj: any) => obj is VideoPlayerFactory;
export declare class VideoConfigBuilder<T extends VideoConfig = VideoConfig> {
    private config;
    static create<TConfig extends VideoConfig = VideoConfig>(): VideoConfigBuilder<TConfig>;
    sources(sources: VideoSource[]): this;
    addSource(source: VideoSource): this;
    poster(url: string): this;
    autoplay(enabled?: boolean): this;
    loop(enabled?: boolean): this;
    muted(enabled?: boolean): this;
    controls(enabled?: boolean): this;
    dimensions(width: number, height: number): this;
    qualities(qualities: VideoQuality[]): this;
    preload(preload: 'none' | 'metadata' | 'auto'): this;
    hls<THls extends Record<string, any>>(hlsConfig: HLSConfig<THls>): VideoConfigBuilder<HLSVideoConfig<THls>>;
    build(): ValidVideoConfig<T>;
}
export declare class PresetConfigFactory {
    /**
     * 创建基础MP4配置
     */
    static mp4(src: string): VideoConfigBuilder<VideoConfig>;
    /**
     * 创建HLS流配置
     */
    static hls(src: string, hlsConfig?: Partial<HLSConfig>): VideoConfigBuilder<HLSVideoConfig>;
    /**
     * 创建多质量配置
     */
    static multiQuality(sources: VideoSource[]): VideoConfigBuilder<VideoConfig>;
    /**
     * 创建直播配置
     */
    static live(hlsSrc: string): VideoConfigBuilder<HLSVideoConfig>;
}
export default videoPlayerFactory;
//# sourceMappingURL=VideoPlayerFactory.d.ts.map