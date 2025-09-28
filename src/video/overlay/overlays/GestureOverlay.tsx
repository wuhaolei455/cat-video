// 手势蒙层组件 - 处理点击、双击等手势
import React, { useRef, useCallback } from 'react';
import { VideoOverlayState } from '../VideoOverlayState';

export interface GestureOverlayProps {
  overlayState: VideoOverlayState;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  style?: React.CSSProperties;
  className?: string;
}

export const GestureOverlay: React.FC<GestureOverlayProps> = ({
  overlayState,
  onPlay,
  onPause,
  onSeek,
  style,
  className = ''
}) => {
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  // 处理点击事件
  const handleClick = useCallback((event: React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    
    // 清除之前的单击定时器
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // 判断是否为双击（300ms内）
    if (timeSinceLastClick < 300) {
      // 双击事件 - 切换播放/暂停
      if (overlayState.isPlaying) {
        onPause?.();
      } else {
        onPlay?.();
      }
      lastClickTimeRef.current = 0; // 重置，避免连续双击
    } else {
      // 单击事件 - 延迟执行，等待可能的双击
      lastClickTimeRef.current = now;
      clickTimeoutRef.current = setTimeout(() => {
        // 单击逻辑 - 可以在这里添加单击处理
        // 例如：显示/隐藏控制器
        console.log('Single click detected');
      }, 300);
    }
  }, [overlayState.isPlaying, onPlay, onPause]);

  // 处理进度条点击
  const handleProgressClick = useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progress = clickX / rect.width;
    const seekTime = progress * overlayState.totalDuration;
    
    onSeek?.(seekTime);
  }, [overlayState.totalDuration, onSeek]);

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`absolute inset-0 pointer-events-auto ${className}`}
      style={style}
      onClick={handleClick}
    >
      {/* 中央播放按钮区域 - 双击检测 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 中央播放/暂停按钮 */}
        {!overlayState.isPlaying && (
          <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 进度条区域 */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-transparent hover:bg-black hover:bg-opacity-20 transition-colors duration-200">
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={handleProgressClick}
        >
          {/* 进度条背景 */}
          <div className="absolute inset-0 bg-white bg-opacity-30"></div>
          
          {/* 当前进度 */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-500"
            style={{
              width: overlayState.totalDuration > 0 
                ? `${(overlayState.currentPlayTime / overlayState.totalDuration) * 100}%`
                : '0%'
            }}
          ></div>
        </div>
      </div>

      {/* 左右两侧区域 - 快进/快退 */}
      <div className="absolute inset-0 flex">
        {/* 左侧区域 - 快退 */}
        <div
          className="flex-1 flex items-center justify-start p-4"
          onClick={(e) => {
            e.stopPropagation();
            const seekTime = Math.max(0, overlayState.currentPlayTime - 10000); // 快退10秒
            onSeek?.(seekTime);
          }}
        >
          <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* 右侧区域 - 快进 */}
        <div
          className="flex-1 flex items-center justify-end p-4"
          onClick={(e) => {
            e.stopPropagation();
            const seekTime = Math.min(overlayState.totalDuration, overlayState.currentPlayTime + 10000); // 快进10秒
            onSeek?.(seekTime);
          }}
        >
          <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 6v12l8.5-6L13 6zM4 6v12l8.5-6L4 6z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestureOverlay;