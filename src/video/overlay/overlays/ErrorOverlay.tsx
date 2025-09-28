// 错误蒙层组件
import React from 'react';
import { VideoOverlayState } from '../VideoOverlayState';

export interface ErrorOverlayProps {
  overlayState: VideoOverlayState;
  onRetry?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({
  overlayState,
  onRetry,
  style,
  className = ''
}) => {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-90 pointer-events-auto ${className}`}
      style={style}
    >
      <div className="text-center p-8 max-w-md">
        {/* 错误图标 */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        {/* 错误标题 */}
        <h3 className="text-xl font-semibold text-white mb-4">
          播放失败
        </h3>

        {/* 错误描述 */}
        <p className="text-red-200 mb-6 text-sm">
          视频加载失败，请检查网络连接或稍后重试
        </p>

        {/* 重试按钮 */}
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          重新播放
        </button>

        {/* 视频信息 */}
        {overlayState.currentVideo.name && (
          <div className="mt-6 text-xs text-red-300">
            <p>视频: {overlayState.currentVideo.name}</p>
            <p>时长: {Math.floor(overlayState.currentVideo.duration / 60)}:{(overlayState.currentVideo.duration % 60).toString().padStart(2, '0')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorOverlay;