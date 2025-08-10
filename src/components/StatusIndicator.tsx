'use client';

import React from 'react';
import { useFlowContext } from '../contexts/FlowContext';

const StatusIndicator: React.FC = () => {
  const { state } = useFlowContext();

  const getStatusText = () => {
    if (state.isCompleted) {
      return '✅ 流程已完成';
    }
    return `🔄 进行中 - 第 ${state.currentStep} 步`;
  };

  const getStatusClass = () => {
    if (state.isCompleted) {
      return 'status-completed';
    }
    return 'status-in-progress';
  };

  return (
    <div className={`status-indicator ${getStatusClass()}`}>
      <span className="status-text">{getStatusText()}</span>
      <div className="status-details">
        步骤: {state.currentStep}/{state.totalSteps}
      </div>
    </div>
  );
};

export default StatusIndicator;
