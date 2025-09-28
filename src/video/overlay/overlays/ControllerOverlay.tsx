// 控制器蒙层组件
import React, { useState, useCallback } from 'react';
import { VideoOverlayState } from '../VideoOverlayState';

export interface ControllerOverlayProps {
  overlayState: VideoOverlayState;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onFullscreen?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export const ControllerOverlay: React.FC<ControllerOverlayProps> = ({
  overlayState,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onFullscreen,
  style,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [volume, setVolume] = useState(1);

  // 格式化时间
  const formatTime = useCallback((timeMs: number): string => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // 处理进度条变化
  const handleProgressChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const progress = parseFloat(event.target.value);
    const seekTime = (progress / 100) * overlayState.totalDuration;
    onSeek?.(seekTime);
  }, [overlayState.totalDuration, onSeek]);

  // 处理音量变化
  const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    onVolumeChange?.(newVolume);
  }, [onVolumeChange]);

  // 切换播放/暂停
  const togglePlayPause = useCallback(() => {
    if (overlayState.isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  }, [overlayState.isPlaying, onPlay, onPause]);

  // 计算进度百分比
  const progressPercentage = overlayState.totalDuration > 0 
    ? (overlayState.currentPlayTime / overlayState.totalDuration) * 100 
    : 0;

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={style}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* 底部控制器 */}
      <div className={`absolute bottom-0 left-0 right-0 pointer-events-auto transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
        
        {/* 控制器内容 */}
        <div className="relative p-4 space-y-3">
          {/* 进度条 */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progressPercentage}
              onChange={handleProgressChange}
              className="w-full h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer slider"
            />
            
            {/* 时间显示 */}
            <div className="flex justify-between text-white text-sm">
              <span>{formatTime(overlayState.currentPlayTime)}</span>
              <span>{formatTime(overlayState.totalDuration)}</span>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between">
            {/* 左侧控制 */}
            <div className="flex items-center space-x-4">
              {/* 播放/暂停按钮 */}
              <button
                onClick={togglePlayPause}
                className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                {overlayState.isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* 音量控制 */}
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* 右侧控制 */}
            <div className="flex items-center space-x-3">
              {/* 倍速显示 */}
              <div className="text-white text-sm">
                {overlayState.speed}x
              </div>

              {/* 全屏按钮 */}
              <button
                onClick={onFullscreen}
                className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 自定义样式 */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
};

export default ControllerOverlay;