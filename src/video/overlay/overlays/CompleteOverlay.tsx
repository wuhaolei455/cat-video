// 播放完成蒙层组件
import React from 'react';
import { VideoOverlayState } from '../VideoOverlayState';

export interface CompleteOverlayProps {
  overlayState: VideoOverlayState;
  onReplay?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export const CompleteOverlay: React.FC<CompleteOverlayProps> = ({
  overlayState,
  onReplay,
  style,
  className = ''
}) => {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 pointer-events-auto ${className}`}
      style={style}
    >
      <div className="text-center p-8 max-w-md">
        {/* 完成图标 */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* 完成标题 */}
        <h3 className="text-xl font-semibold text-white mb-4">
          播放完成
        </h3>

        {/* 完成描述 */}
        <p className="text-gray-300 mb-6 text-sm">
          视频已播放完毕
        </p>

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onReplay}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            重新播放
          </button>
        </div>

        {/* 视频信息 */}
        {overlayState.currentVideo.name && (
          <div className="mt-6 text-xs text-gray-400">
            <p>视频: {overlayState.currentVideo.name}</p>
            <p>总时长: {Math.floor(overlayState.currentVideo.duration / 60)}:{(overlayState.currentVideo.duration % 60).toString().padStart(2, '0')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteOverlay;