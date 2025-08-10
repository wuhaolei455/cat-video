'use client';

import React from 'react';
import { useFlowReducerContext } from '../contexts/FlowReducerContext';
import StepDisplay from './StepDisplay';
import NavigationButtons from './NavigationButtons';
import DataForm from './DataForm';
import ProgressBar from './ProgressBar';
import StatusIndicator from './StatusIndicator';

/**
 * ReducerController组件 - 使用useReducer的版本
 * 复用原有的所有子组件，只替换状态管理方式
 */
const ReducerController: React.FC = () => {
  const { state } = useFlowReducerContext();

  return (
    <div className="controller-container">
      <div className="controller-header">
        <h2>流程控制器 - useReducer 版本</h2>
        <StatusIndicator />
      </div>

      <div className="controller-content">
        {/* 复用原有的所有子组件 */}
        <ProgressBar />
        <StepDisplay />
        <DataForm />
        <NavigationButtons />
      </div>

      {/* 调试信息 - 显示Action类型 */}
      <div className="debug-info">
        <h3>当前状态 (useReducer管理)</h3>
        <pre>{JSON.stringify(state, null, 2)}</pre>
        <div className="reducer-info">
          <p><strong>状态管理方式:</strong> useReducer</p>
          <p><strong>Action类型:</strong> NEXT_STEP, PREV_STEP, GO_TO_STEP, SET_DATA, RESET</p>
          <p><strong>特点:</strong> 不可变状态更新，集中的状态变更逻辑</p>
        </div>
      </div>
    </div>
  );
};

export default ReducerController;
