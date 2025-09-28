// 反馈蒙层组件
import React, { useState } from 'react';
import { VideoOverlayState } from '../VideoOverlayState';

export interface FeedbackOverlayProps {
  overlayState: VideoOverlayState;
  onClose?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

// 反馈类型
const feedbackTypes = [
  { id: 'quality', label: '画质问题', icon: '📺' },
  { id: 'audio', label: '音质问题', icon: '🔊' },
  { id: 'buffering', label: '卡顿问题', icon: '⏸️' },
  { id: 'content', label: '内容问题', icon: '📝' },
  { id: 'other', label: '其他问题', icon: '❓' }
];

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  overlayState,
  onClose,
  style,
  className = ''
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 提交反馈
  const handleSubmit = async () => {
    if (!selectedType || !feedbackText.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 这里可以调用API提交反馈
      console.log('Submitting feedback:', {
        type: selectedType,
        text: feedbackText,
        videoId: overlayState.currentVideo.id,
        timestamp: overlayState.currentPlayTime
      });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 提交成功后关闭蒙层
      onClose?.();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto ${className}`}
      style={style}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            问题反馈
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 问题类型选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            问题类型
          </label>
          <div className="grid grid-cols-2 gap-2">
            {feedbackTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedType === type.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{type.icon}</div>
                  <div className="text-xs">{type.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 详细描述 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            详细描述
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="请详细描述您遇到的问题..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* 视频信息 */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">
            <p><strong>视频:</strong> {overlayState.currentVideo.name || '未知'}</p>
            <p><strong>时间点:</strong> {Math.floor(overlayState.currentPlayTime / 1000)}秒</p>
            <p><strong>播放状态:</strong> {overlayState.isPlaying ? '播放中' : '已暂停'}</p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedType || !feedbackText.trim() || isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
          >
            {isSubmitting ? '提交中...' : '提交反馈'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackOverlay;