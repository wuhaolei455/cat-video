// VIP试看蒙层组件
import React from 'react';
import { VideoOverlayState } from '../VideoOverlayState';

export interface VipTryOverlayProps {
  overlayState: VideoOverlayState;
  onVipAction?: () => void;
  isBubble?: boolean; // 是否为气泡模式
  style?: React.CSSProperties;
  className?: string;
}

export const VipTryOverlay: React.FC<VipTryOverlayProps> = ({
  overlayState,
  onVipAction,
  isBubble = false,
  style,
  className = ''
}) => {
  if (isBubble) {
    // 气泡模式 - 显示在右上角
    return (
      <div
        className={`absolute top-4 right-4 pointer-events-auto ${className}`}
        style={style}
      >
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="text-white text-sm font-medium">
              VIP专享
            </div>
          </div>
          <div className="mt-2 text-xs text-white opacity-90">
            开通VIP观看完整视频
          </div>
        </div>
      </div>
    );
  }

  // 全屏蒙层模式
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 pointer-events-auto ${className}`}
      style={style}
    >
      <div className="text-center p-8 max-w-md">
        {/* VIP图标 */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>

        {/* 标题 */}
        <h3 className="text-2xl font-bold text-white mb-4">
          VIP专享内容
        </h3>

        {/* 描述 */}
        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
          此视频为VIP专享内容，开通VIP即可观看完整视频，享受更多优质内容
        </p>

        {/* 特性列表 */}
        <div className="mb-8 space-y-2 text-left">
          <div className="flex items-center text-white text-sm">
            <svg className="w-4 h-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            无广告观看体验
          </div>
          <div className="flex items-center text-white text-sm">
            <svg className="w-4 h-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            高清画质
          </div>
          <div className="flex items-center text-white text-sm">
            <svg className="w-4 h-4 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            专属内容库
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={onVipAction}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            立即开通VIP
          </button>
          
          <button
            className="w-full px-6 py-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            稍后再说
          </button>
        </div>

        {/* 视频信息 */}
        {overlayState.currentVideo.name && (
          <div className="mt-6 text-xs text-gray-500">
            <p>视频: {overlayState.currentVideo.name}</p>
            <p>试看时长: {Math.floor(overlayState.currentPlayTime / 1000)}秒</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VipTryOverlay;