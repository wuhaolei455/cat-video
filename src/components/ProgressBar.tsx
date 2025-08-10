'use client';

import React from 'react';
import { useFlowContext } from '../contexts/FlowContext';

const ProgressBar: React.FC = () => {
  const { state } = useFlowContext();
  const progress = (state.currentStep / state.totalSteps) * 100;

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-header">
        <span>进度: {state.currentStep}/{state.totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
