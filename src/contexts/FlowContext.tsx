'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 定义流程状态类型
export interface FlowState {
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  data: Record<string, any>;
}

// 定义上下文类型
export interface FlowContextType {
  state: FlowState;
  nextStep: () => void;
  prevStep: () => void;
  setData: (key: string, value: any) => void;
  reset: () => void;
  goToStep: (step: number) => void;
}

// 创建上下文
const FlowContext = createContext<FlowContextType | undefined>(undefined);

// Provider组件的props类型
interface FlowProviderProps {
  children: ReactNode;
  totalSteps?: number;
  initialData?: Record<string, any>;
}

// FlowProvider组件
export const FlowProvider: React.FC<FlowProviderProps> = ({ 
  children, 
  totalSteps = 3,
  initialData = {}
}) => {
  const [state, setState] = useState<FlowState>({
    currentStep: 1,
    totalSteps,
    isCompleted: false,
    data: initialData
  });

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps),
      isCompleted: prev.currentStep >= prev.totalSteps
    }));
  };

  const prevStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
      isCompleted: false
    }));
  };

  const setData = (key: string, value: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: value
      }
    }));
  };

  const reset = () => {
    setState({
      currentStep: 1,
      totalSteps,
      isCompleted: false,
      data: initialData
    });
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setState(prev => ({
        ...prev,
        currentStep: step,
        isCompleted: step >= totalSteps
      }));
    }
  };

  const contextValue: FlowContextType = {
    state,
    nextStep,
    prevStep,
    setData,
    reset,
    goToStep
  };

  return (
    <FlowContext.Provider value={contextValue}>
      {children}
    </FlowContext.Provider>
  );
};

// 自定义Hook用于使用上下文
export const useFlowContext = (): FlowContextType => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }
  return context;
};

export default FlowContext;
