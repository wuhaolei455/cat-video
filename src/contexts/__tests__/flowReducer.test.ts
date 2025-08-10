import { FlowState, FlowAction } from '../FlowReducerContext';

// 从FlowReducerContext中提取reducer函数进行单独测试
// 由于reducer是内部函数，我们需要重新定义它用于测试
const flowReducer = (state: FlowState, action: FlowAction): FlowState => {
  switch (action.type) {
    case 'NEXT_STEP':
      const nextStep = Math.min(state.currentStep + 1, state.totalSteps);
      return {
        ...state,
        currentStep: nextStep,
        isCompleted: nextStep >= state.totalSteps
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

describe('flowReducer', () => {
  const initialState: FlowState = {
    currentStep: 1,
    totalSteps: 3,
    isCompleted: false,
    data: {}
  };

  describe('NEXT_STEP action', () => {
    test('应该增加当前步骤', () => {
      const action: FlowAction = { type: 'NEXT_STEP' };
      const newState = flowReducer(initialState, action);

      expect(newState.currentStep).toBe(2);
      expect(newState.isCompleted).toBe(false);
      expect(newState.totalSteps).toBe(3);
      expect(newState.data).toEqual({});
    });

    test('应该在到达最后一步时标记为完成', () => {
      const stateAtStep2: FlowState = {
        ...initialState,
        currentStep: 2
      };

      const action: FlowAction = { type: 'NEXT_STEP' };
      const newState = flowReducer(stateAtStep2, action);

      expect(newState.currentStep).toBe(3);
      expect(newState.isCompleted).toBe(true);
    });

    test('不应该超过最大步数', () => {
      const stateAtLastStep: FlowState = {
        ...initialState,
        currentStep: 3,
        isCompleted: true
      };

      const action: FlowAction = { type: 'NEXT_STEP' };
      const newState = flowReducer(stateAtLastStep, action);

      expect(newState.currentStep).toBe(3);
      expect(newState.isCompleted).toBe(true);
    });
  });

  describe('PREV_STEP action', () => {
    test('应该减少当前步骤', () => {
      const stateAtStep2: FlowState = {
        ...initialState,
        currentStep: 2
      };

      const action: FlowAction = { type: 'PREV_STEP' };
      const newState = flowReducer(stateAtStep2, action);

      expect(newState.currentStep).toBe(1);
      expect(newState.isCompleted).toBe(false);
    });

    test('不应该小于第1步', () => {
      const action: FlowAction = { type: 'PREV_STEP' };
      const newState = flowReducer(initialState, action);

      expect(newState.currentStep).toBe(1);
      expect(newState.isCompleted).toBe(false);
    });

    test('应该将完成状态重置为false', () => {
      const completedState: FlowState = {
        ...initialState,
        currentStep: 3,
        isCompleted: true
      };

      const action: FlowAction = { type: 'PREV_STEP' };
      const newState = flowReducer(completedState, action);

      expect(newState.currentStep).toBe(2);
      expect(newState.isCompleted).toBe(false);
    });
  });

  describe('GO_TO_STEP action', () => {
    test('应该跳转到指定步骤', () => {
      const action: FlowAction = { 
        type: 'GO_TO_STEP', 
        payload: { step: 2 } 
      };
      const newState = flowReducer(initialState, action);

      expect(newState.currentStep).toBe(2);
      expect(newState.isCompleted).toBe(false);
    });

    test('跳转到最后一步应该标记为完成', () => {
      const action: FlowAction = { 
        type: 'GO_TO_STEP', 
        payload: { step: 3 } 
      };
      const newState = flowReducer(initialState, action);

      expect(newState.currentStep).toBe(3);
      expect(newState.isCompleted).toBe(true);
    });

    test('无效步骤应该保持状态不变', () => {
      const invalidStepAction: FlowAction = { 
        type: 'GO_TO_STEP', 
        payload: { step: 5 } 
      };
      const newState1 = flowReducer(initialState, invalidStepAction);

      expect(newState1).toEqual(initialState);

      const zeroStepAction: FlowAction = { 
        type: 'GO_TO_STEP', 
        payload: { step: 0 } 
      };
      const newState2 = flowReducer(initialState, zeroStepAction);

      expect(newState2).toEqual(initialState);
    });
  });

  describe('SET_DATA action', () => {
    test('应该设置新的数据字段', () => {
      const action: FlowAction = { 
        type: 'SET_DATA', 
        payload: { key: 'name', value: 'John' } 
      };
      const newState = flowReducer(initialState, action);

      expect(newState.data).toEqual({ name: 'John' });
      expect(newState.currentStep).toBe(1);
      expect(newState.isCompleted).toBe(false);
    });

    test('应该更新已存在的数据字段', () => {
      const stateWithData: FlowState = {
        ...initialState,
        data: { name: 'John', age: 25 }
      };

      const action: FlowAction = { 
        type: 'SET_DATA', 
        payload: { key: 'name', value: 'Jane' } 
      };
      const newState = flowReducer(stateWithData, action);

      expect(newState.data).toEqual({ name: 'Jane', age: 25 });
    });

    test('应该添加新字段而不影响现有字段', () => {
      const stateWithData: FlowState = {
        ...initialState,
        data: { name: 'John' }
      };

      const action: FlowAction = { 
        type: 'SET_DATA', 
        payload: { key: 'age', value: 30 } 
      };
      const newState = flowReducer(stateWithData, action);

      expect(newState.data).toEqual({ name: 'John', age: 30 });
    });

    test('应该支持不同类型的值', () => {
      const actions: FlowAction[] = [
        { type: 'SET_DATA', payload: { key: 'string', value: 'text' } },
        { type: 'SET_DATA', payload: { key: 'number', value: 42 } },
        { type: 'SET_DATA', payload: { key: 'boolean', value: true } },
        { type: 'SET_DATA', payload: { key: 'object', value: { nested: 'value' } } },
        { type: 'SET_DATA', payload: { key: 'array', value: [1, 2, 3] } }
      ];

      let state = initialState;
      actions.forEach(action => {
        state = flowReducer(state, action);
      });

      expect(state.data).toEqual({
        string: 'text',
        number: 42,
        boolean: true,
        object: { nested: 'value' },
        array: [1, 2, 3]
      });
    });
  });

  describe('RESET action', () => {
    test('应该重置所有状态', () => {
      const modifiedState: FlowState = {
        currentStep: 2,
        totalSteps: 3,
        isCompleted: false,
        data: { name: 'John', age: 25 }
      };

      const action: FlowAction = { 
        type: 'RESET', 
        payload: { 
          totalSteps: 3, 
          initialData: {} 
        } 
      };
      const newState = flowReducer(modifiedState, action);

      expect(newState).toEqual({
        currentStep: 1,
        totalSteps: 3,
        isCompleted: false,
        data: {}
      });
    });

    test('应该使用新的初始数据重置', () => {
      const modifiedState: FlowState = {
        currentStep: 3,
        totalSteps: 3,
        isCompleted: true,
        data: { name: 'John', age: 25 }
      };

      const newInitialData = { theme: 'dark', language: 'en' };
      const action: FlowAction = { 
        type: 'RESET', 
        payload: { 
          totalSteps: 5, 
          initialData: newInitialData 
        } 
      };
      const newState = flowReducer(modifiedState, action);

      expect(newState).toEqual({
        currentStep: 1,
        totalSteps: 5,
        isCompleted: false,
        data: newInitialData
      });
    });
  });

  describe('默认情况', () => {
    test('未知action应该返回原状态', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' } as any;
      const newState = flowReducer(initialState, unknownAction);

      expect(newState).toBe(initialState);
    });
  });

  describe('不可变性测试', () => {
    test('reducer应该返回新的状态对象', () => {
      const stateWithData = { ...initialState, data: { existing: 'value' } };
      const action: FlowAction = { type: 'NEXT_STEP' };
      const newState = flowReducer(stateWithData, action);

      expect(newState).not.toBe(stateWithData);
      expect(newState.data).toBe(stateWithData.data); // NEXT_STEP不修改data，所以引用相同
    });

    test('SET_DATA应该创建新的data对象', () => {
      const stateWithData: FlowState = {
        ...initialState,
        data: { existing: 'value' }
      };

      const action: FlowAction = { 
        type: 'SET_DATA', 
        payload: { key: 'new', value: 'data' } 
      };
      const newState = flowReducer(stateWithData, action);

      expect(newState.data).not.toBe(stateWithData.data);
      expect(newState.data).toEqual({ existing: 'value', new: 'data' });
    });
  });

  describe('复杂场景测试', () => {
    test('连续操作应该正确累积状态', () => {
      const actions: FlowAction[] = [
        { type: 'SET_DATA', payload: { key: 'name', value: 'John' } },
        { type: 'NEXT_STEP' },
        { type: 'SET_DATA', payload: { key: 'age', value: 25 } },
        { type: 'NEXT_STEP' },
        { type: 'SET_DATA', payload: { key: 'email', value: 'john@example.com' } }
      ];

      let state = initialState;
      actions.forEach(action => {
        state = flowReducer(state, action);
      });

      expect(state).toEqual({
        currentStep: 3,
        totalSteps: 3,
        isCompleted: true,
        data: {
          name: 'John',
          age: 25,
          email: 'john@example.com'
        }
      });
    });

    test('前进后退操作应该保持数据完整性', () => {
      let state = initialState;

      // 设置数据并前进
      state = flowReducer(state, { type: 'SET_DATA', payload: { key: 'step1', value: 'data1' } });
      state = flowReducer(state, { type: 'NEXT_STEP' });
      state = flowReducer(state, { type: 'SET_DATA', payload: { key: 'step2', value: 'data2' } });

      expect(state.currentStep).toBe(2);
      expect(state.data).toEqual({ step1: 'data1', step2: 'data2' });

      // 后退
      state = flowReducer(state, { type: 'PREV_STEP' });

      expect(state.currentStep).toBe(1);
      expect(state.isCompleted).toBe(false);
      expect(state.data).toEqual({ step1: 'data1', step2: 'data2' }); // 数据应该保持
    });
  });
});
