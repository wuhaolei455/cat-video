'use client';

import { useContext } from 'react';
import FlowContext, { FlowContextType } from '../contexts/FlowContext';
import FlowReducerContext, { FlowReducerContextType } from '../contexts/FlowReducerContext';

// 统一的接口类型
export interface UnifiedFlowContextType {
  state: {
    currentStep: number;
    totalSteps: number;
    isCompleted: boolean;
    data: Record<string, any>;
  };
  nextStep: () => void;
  prevStep: () => void;
  setData: (key: string, value: any) => void;
  reset: () => void;
  goToStep: (step: number) => void;
  // 标识当前使用的状态管理方式
  stateManager: 'useState' | 'useReducer';
}

// 适配器Hook - 自动检测使用哪种Context
export const useFlowAdapter = (): UnifiedFlowContextType => {
  // 尝试获取useReducer版本的Context
  const reducerContext = useContext(FlowReducerContext);
  
  // 如果存在useReducer版本，使用它
  if (reducerContext) {
    return {
      state: reducerContext.state,
      nextStep: reducerContext.nextStep,
      prevStep: reducerContext.prevStep,
      setData: reducerContext.setData,
      reset: reducerContext.reset,
      goToStep: reducerContext.goToStep,
      stateManager: 'useReducer'
    };
  }
  
  // 否则尝试使用useState版本的Context
  const stateContext = useContext(FlowContext);
  
  if (stateContext) {
    return {
      state: stateContext.state,
      nextStep: stateContext.nextStep,
      prevStep: stateContext.prevStep,
      setData: stateContext.setData,
      reset: stateContext.reset,
      goToStep: stateContext.goToStep,
      stateManager: 'useState'
    };
  }
  
  throw new Error('useFlowAdapter must be used within a FlowProvider or FlowReducerProvider');
};
