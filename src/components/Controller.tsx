'use client';

import React from 'react';
import { useFlowContext } from '../contexts/FlowContext';
import StepDisplay from './StepDisplay';
import NavigationButtons from './NavigationButtons';
import DataForm from './DataForm';
import ProgressBar from './ProgressBar';
import StatusIndicator from './StatusIndicator';

/**
 * Controller组件 - 组合模式的核心实现
 * 通过组合多个子组件来实现完整的流程控制功能
 */
const Controller: React.FC = () => {
  const { state } = useFlowContext();

  return (
    <div className="controller-container">
      <div className="controller-header">
        <h2>流程控制器 - 组合模式演示</h2>
        <StatusIndicator />
      </div>

      <div className="controller-content">
        {/* 进度条组件 */}
        <ProgressBar />
        
        {/* 步骤显示组件 */}
        <StepDisplay />
        
        {/* 数据表单组件 - 根据当前步骤显示不同内容 */}
        <DataForm />
        
        {/* 导航按钮组件 */}
        <NavigationButtons />
      </div>

      {/* 调试信息 */}
      <div className="debug-info">
        <h3>当前状态 (调试信息)</h3>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Controller;
