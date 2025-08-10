'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// 保持与原版本相同的状态类型
export interface FlowState {
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  data: Record<string, any>;
}

// TypeScript Action 类型定义
export type FlowAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: { step: number } }
  | { type: 'SET_DATA'; payload: { key: string; value: any } }
  | { type: 'RESET'; payload: { totalSteps: number; initialData: Record<string, any> } };

// useReducer 处理复杂状态逻辑
const flowReducer = (state: FlowState, action: FlowAction): FlowState => {
  switch (action.type) {
    case 'NEXT_STEP':
      const nextStep = Math.min(state.currentStep + 1, state.totalSteps);
      return {
        ...state,
        currentStep: nextStep,
        isCompleted: state.currentStep >= state.totalSteps
      };
    
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
        isCompleted: false
      };
    
    case 'GO_TO_STEP':
      if (action.payload.step >= 1 && action.payload.step <= state.totalSteps) {
        return {
          ...state,
          currentStep: action.payload.step,
          isCompleted: action.payload.step >= state.totalSteps
        };
      }
      return state;
    
    case 'SET_DATA':
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.key]: action.payload.value
        }
      };
    
    case 'RESET':
      return {
        currentStep: 1,
        totalSteps: action.payload.totalSteps,
        isCompleted: false,
        data: action.payload.initialData
      };
    
    default:
      return state;
  }
};

// 上下文类型定义 - 保持与原版本相同的接口
export interface FlowReducerContextType {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
  // 便捷方法，保持与原版本API兼容
  nextStep: () => void;
  prevStep: () => void;
  setData: (key: string, value: any) => void;
  reset: () => void;
  goToStep: (step: number) => void;
}

// 创建上下文
const FlowReducerContext = createContext<FlowReducerContextType | undefined>(undefined);

// Provider组件的props类型
interface FlowReducerProviderProps {
  children: ReactNode;
  totalSteps?: number;
  initialData?: Record<string, any>;
}

// FlowReducerProvider组件
export const FlowReducerProvider: React.FC<FlowReducerProviderProps> = ({ 
  children, 
  totalSteps = 3,
  initialData = {}
}) => {
  const [state, dispatch] = useReducer(flowReducer, {
    currentStep: 1,
    totalSteps,
    isCompleted: false,
    data: initialData
  });

  // 便捷方法，保持与原版本API兼容
  const nextStep = () => dispatch({ type: 'NEXT_STEP' });
  const prevStep = () => dispatch({ type: 'PREV_STEP' });
  const setData = (key: string, value: any) => 
    dispatch({ type: 'SET_DATA', payload: { key, value } });
  const reset = () => 
    dispatch({ type: 'RESET', payload: { totalSteps, initialData } });
  const goToStep = (step: number) => 
    dispatch({ type: 'GO_TO_STEP', payload: { step } });

  const contextValue: FlowReducerContextType = {
    state,
    dispatch,
    nextStep,
    prevStep,
    setData,
    reset,
    goToStep
  };

  return (
    <FlowReducerContext.Provider value={contextValue}>
      {children}
    </FlowReducerContext.Provider>
  );
};

// 自定义Hook用于使用上下文
export const useFlowReducerContext = (): FlowReducerContextType => {
  const context = useContext(FlowReducerContext);
  if (!context) {
    throw new Error('useFlowReducerContext must be used within a FlowReducerProvider');
  }
  return context;
};

export default FlowReducerContext;
