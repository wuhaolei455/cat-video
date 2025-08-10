'use client';

import React from 'react';
import { useFlowContext } from '../contexts/FlowContext';

const StepDisplay: React.FC = () => {
  const { state, goToStep } = useFlowContext();

  const steps = [
    { id: 1, title: '基本信息', description: '填写用户基本信息' },
    { id: 2, title: '偏好设置', description: '选择个人偏好' },
    { id: 3, title: '确认提交', description: '确认并提交信息' }
  ];

  return (
    <div className="step-display">
      <h3>当前步骤</h3>
      <div className="steps-container">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`step-item ${
              step.id === state.currentStep ? 'active' : ''
            } ${step.id < state.currentStep ? 'completed' : ''}`}
            onClick={() => goToStep(step.id)}
          >
            <div className="step-number">{step.id}</div>
            <div className="step-content">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepDisplay;
