'use client';

import React from 'react';
import { useFlowContext } from '../contexts/FlowContext';

const NavigationButtons: React.FC = () => {
  const { state, nextStep, prevStep, reset } = useFlowContext();

  return (
    <div className="navigation-buttons">
      <div className="button-group">
        <button
          onClick={prevStep}
          disabled={state.currentStep === 1}
          className="nav-button prev-button"
        >
          ← 上一步
        </button>
        
        <button
          onClick={nextStep}
          disabled={state.isCompleted}
          className="nav-button next-button"
        >
          {state.currentStep === state.totalSteps ? '完成' : '下一步 →'}
        </button>
      </div>
      
      <button
        onClick={reset}
        className="nav-button reset-button"
      >
        🔄 重置
      </button>
    </div>
  );
};

export default NavigationButtons;
