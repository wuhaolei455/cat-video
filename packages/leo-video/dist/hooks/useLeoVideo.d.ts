import { VideoConfig, VideoEventType, VideoEventData, VideoState, VideoQuality, PlaybackRate, IVideoPlayer } from '../types';
export interface PlayerState {
    state: VideoState;
    currentTime: number;
    duration: number;
    volume: number;
    muted: boolean;
    quality: VideoQuality;
    playbackRate: PlaybackRate;
    buffered: number;
    isFullscreen: boolean;
    isPiP: boolean;
    error: string | null;
}
export interface UseLeoVideoOptions {
    config: VideoConfig;
    autoInit?: boolean;
    onStateChange?: (state: PlayerState) => void;
    onEvent?: (type: VideoEventType, data: VideoEventData) => void;
    onError?: (error: Error) => void;
}
export interface UseLeoVideoReturn {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    player: IVideoPlayer | null;
    state: PlayerState;
    isReady: boolean;
    error: Error | null;
    initialize: () => Promise<void>;
    play: () => Promise<void>;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setQuality: (quality: VideoQuality) => void;
    setPlaybackRate: (rate: PlaybackRate) => void;
    toggleFullscreen: () => Promise<void>;
    togglePiP: () => Promise<void>;
    destroy: () => void;
    getAvailableQualities: () => VideoQuality[];
    getCurrentTime: () => number;
    getDuration: () => number;
    getVolume: () => number;
    isMuted: () => boolean;
    isPlaying: () => boolean;
    isPaused: () => boolean;
    isEnded: () => boolean;
    isFullscreen: () => boolean;
    isPictureInPicture: () => boolean;
}
/**
 * useLeoVideo Hook
 *
 * 提供完整的视频播放器功能，包括状态管理、事件处理和控制方法
 *
 * @param options Hook配置选项
 * @returns 播放器实例和控制方法
 */
export declare const useLeoVideo: ({ config, autoInit, onStateChange, onEvent, onError }: UseLeoVideoOptions) => UseLeoVideoReturn;
export default useLeoVideo;
//# sourceMappingURL=useLeoVideo.d.ts.map