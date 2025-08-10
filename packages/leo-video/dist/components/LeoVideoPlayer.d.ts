import React from 'react';
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
export interface EventLog {
    id: string;
    timestamp: number;
    type: VideoEventType;
    data: any;
}
export interface LeoVideoPlayerProps {
    config: VideoConfig;
    width?: number | string;
    height?: number | string;
    className?: string;
    style?: React.CSSProperties;
    showControls?: boolean;
    showEventLog?: boolean;
    onStateChange?: (state: PlayerState) => void;
    onEvent?: (type: VideoEventType, data: VideoEventData) => void;
    onError?: (error: Error) => void;
}
export interface LeoVideoPlayerRef {
    player: IVideoPlayer | null;
    element: HTMLVideoElement | null;
    getState: () => PlayerState;
    play: () => Promise<void>;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setQuality: (quality: VideoQuality) => void;
    setPlaybackRate: (rate: PlaybackRate) => void;
    toggleFullscreen: () => Promise<void>;
    togglePiP: () => Promise<void>;
    destroy: () => void;
}
export declare const LeoVideoPlayer: React.ForwardRefExoticComponent<LeoVideoPlayerProps & React.RefAttributes<LeoVideoPlayerRef>>;
export default LeoVideoPlayer;
//# sourceMappingURL=LeoVideoPlayer.d.ts.map