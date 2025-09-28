import { VideoConfig, VideoState, HLSVideoConfig } from './types';
export interface HLSSupportInfo {
    supported: boolean;
    native: boolean;
    hlsjs: boolean;
    reason?: string;
}
export interface DASHSupportInfo {
    supported: boolean;
    native: boolean;
    dashjs: boolean;
    reason?: string;
}
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
export declare const detectHLSSupport: () => HLSSupportInfo;
/**
 * 检测DASH支持情况
 */
export declare const detectDASHSupport: () => DASHSupportInfo;
/**
 * 检测各种视频格式支持情况
 */
export declare const detectVideoFormats: () => VideoFormatSupport;
/**
 * 创建基础视频配置
 */
export declare const createVideoConfig: (sources: VideoConfig["sources"]) => VideoConfig;
/**
 * 验证视频配置
 */
export declare const validateVideoConfig: <T extends VideoConfig>(config: any) => config is T;
/**
 * 类型守卫 - 检查是否为有效的视频状态
 */
export declare const isVideoState: (value: any) => value is VideoState;
/**
 * 断言函数 - 验证视频配置
 */
export declare const assertVideoConfig: <T extends VideoConfig>(config: any) => asserts config is T;
/**
 * 检查是否为HLS配置
 */
export declare const isHLSConfig: (config: VideoConfig) => config is HLSVideoConfig;
/**
 * 格式化时间 - 将秒数转换为 HH:MM:SS 格式
 */
export declare const formatTime: (seconds: number) => string;
/**
 * 格式化文件大小
 */
export declare const formatFileSize: (bytes: number) => string;
/**
 * 防抖函数
 */
export declare const debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => ((...args: Parameters<T>) => void);
/**
 * 节流函数
 */
export declare const throttle: <T extends (...args: any[]) => any>(func: T, wait: number) => ((...args: Parameters<T>) => void);
/**
 * 获取视频缩略图
 */
export declare const getVideoThumbnail: (video: HTMLVideoElement, time?: number) => Promise<string>;
/**
 * 检查浏览器功能支持
 */
export declare const checkBrowserFeatures: () => {
    fullscreen: boolean;
    pictureInPicture: boolean;
    mediaSource: boolean;
    webAssembly: boolean;
    serviceWorker: boolean;
    intersectionObserver: boolean;
    resizeObserver: boolean;
};
//# sourceMappingURL=utils.d.ts.map