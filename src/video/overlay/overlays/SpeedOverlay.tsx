// 倍速选择蒙层组件
import React from 'react';
import { VideoOverlayState, PlayerSpeed } from '../VideoOverlayState';

export interface SpeedOverlayProps {
  overlayState: VideoOverlayState;
  onSpeedChange?: (speed: number) => void;
  style?: React.CSSProperties;
  className?: string;
}

// 倍速选项
const speedOptions = [
  { value: PlayerSpeed.SPEED_0_25, label: '0.25x' },
  { value: PlayerSpeed.SPEED_0_50, label: '0.5x' },
  { value: PlayerSpeed.SPEED_0_75, label: '0.75x' },
  { value: PlayerSpeed.SPEED_1_00, label: '1x' },
  { value: PlayerSpeed.SPEED_1_25, label: '1.25x' },
  { value: PlayerSpeed.SPEED_1_50, label: '1.5x' },
  { value: PlayerSpeed.SPEED_1_75, label: '1.75x' },
  { value: PlayerSpeed.SPEED_2_00, label: '2x' }
];

export const SpeedOverlay: React.FC<SpeedOverlayProps> = ({
  overlayState,
  onSpeedChange,
  style,
  className = ''
}) => {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto ${className}`}
      style={style}
    >
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        {/* 标题 */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          选择播放速度
        </h3>

        {/* 倍速选项 */}
        <div className="grid grid-cols-2 gap-3">
          {speedOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSpeedChange?.(option.value)}
              className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                overlayState.speed === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 当前选择提示 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            当前速度: {overlayState.speed}x
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeedOverlay;