// 顶部UI蒙层组件
import React from 'react';
import { VideoOverlayState } from '../VideoOverlayState';

export interface HeaderOverlayProps {
  overlayState: VideoOverlayState;
  onShare?: () => void;
  onFeedback?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export const HeaderOverlay: React.FC<HeaderOverlayProps> = ({
  overlayState,
  onShare,
  onFeedback,
  style,
  className = ''
}) => {
  return (
    <div
      className={`absolute top-0 left-0 right-0 pointer-events-none ${className}`}
      style={style}
    >
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent opacity-60"></div>
      
      {/* 顶部内容 */}
      <div className="relative flex items-center justify-between p-4 pointer-events-auto">
        {/* 左侧 - 视频标题 */}
        <div className="flex-1 min-w-0">
          {overlayState.currentVideo.name && (
            <h2 className="text-white text-lg font-medium truncate">
              {overlayState.currentVideo.name}
            </h2>
          )}
        </div>

        {/* 右侧 - 操作按钮 */}
        <div className="flex items-center space-x-3 ml-4">
          {/* 分享按钮 */}
          {overlayState.enableShare && overlayState.shareIconVisible && (
            <button
              onClick={onShare}
              className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              title="分享"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          )}

          {/* 反馈按钮 */}
          {overlayState.enableFeedback && overlayState.feedbackIconVisible && (
            <button
              onClick={onFeedback}
              className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              title="反馈"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </button>
          )}

          {/* 全屏按钮 */}
          <button
            className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            title="全屏"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderOverlay;