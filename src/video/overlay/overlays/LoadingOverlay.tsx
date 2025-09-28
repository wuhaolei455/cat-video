// 加载蒙层组件
import React from 'react';

export interface LoadingOverlayProps {
  style?: React.CSSProperties;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  style,
  className = ''
}) => {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none ${className}`}
      style={style}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* 旋转加载动画 */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-white border-opacity-30 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
        
        {/* 加载文字 */}
        <div className="text-white text-sm font-medium">
          加载中...
        </div>
        
        {/* 进度指示器 */}
        <div className="w-32 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;