import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  FlowReducerProvider, 
  useFlowReducerContext, 
  FlowAction,
  FlowState 
} from '../FlowReducerContext';

// 测试组件 - 用于测试Context和Hook
const TestComponent: React.FC = () => {
  const { state, dispatch, nextStep, prevStep, setData, reset, goToStep } = useFlowReducerContext();

  return (
    <div>
      <div data-testid="current-step">{state.currentStep}</div>
      <div data-testid="total-steps">{state.totalSteps}</div>
      <div data-testid="is-completed">{state.isCompleted.toString()}</div>
      <div data-testid="data">{JSON.stringify(state.data)}</div>
      
      <button data-testid="next-btn" onClick={nextStep}>Next</button>
      <button data-testid="prev-btn" onClick={prevStep}>Previous</button>
      <button data-testid="reset-btn" onClick={reset}>Reset</button>
      <button data-testid="goto-2-btn" onClick={() => goToStep(2)}>Go to Step 2</button>
      <button data-testid="set-data-btn" onClick={() => setData('name', 'test')}>Set Data</button>
      
      <button 
        data-testid="dispatch-btn" 
        onClick={() => dispatch({ type: 'NEXT_STEP' })}
      >
        Dispatch Next
      </button>
    </div>
  );
};

// 测试用的包装组件
const TestWrapper: React.FC<{ children: React.ReactNode; totalSteps?: number; initialData?: Record<string, any> }> = ({ 
  children, 
  totalSteps = 3, 
  initialData = {} 
}) => (
  <FlowReducerProvider totalSteps={totalSteps} initialData={initialData}>
    {children}
  </FlowReducerProvider>
);

describe('FlowReducerContext', () => {
  describe('Provider 初始化', () => {
    test('应该使用默认值初始化状态', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
      expect(screen.getByTestId('total-steps')).toHaveTextContent('3');
      expect(screen.getByTestId('is-completed')).toHaveTextContent('false');
      expect(screen.getByTestId('data')).toHaveTextContent('{}');
    });

    test('应该使用自定义初始值', () => {
      const initialData = { name: 'initial', age: 25 };
      
      render(
        <TestWrapper totalSteps={5} initialData={initialData}>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
      expect(screen.getByTestId('total-steps')).toHaveTextContent('5');
      expect(screen.getByTestId('data')).toHaveTextContent(JSON.stringify(initialData));
    });
  });

  describe('便捷方法测试', () => {
    test('nextStep() 应该增加步骤', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const nextBtn = screen.getByTestId('next-btn');
      
      act(() => {
        fireEvent.click(nextBtn);
      });

      expect(screen.getByTestId('current-step')).toHaveTextContent('2');
      expect(screen.getByTestId('is-completed')).toHaveTextContent('false');
    });

    test('nextStep() 在最后一步应该标记为完成', () => {
      render(
        <TestWrapper totalSteps={2}>
          <TestComponent />
        </TestWrapper>
      );

      const nextBtn = screen.getByTestId('next-btn');
      
      // 第一次点击到第2步
      act(() => {
        fireEvent.click(nextBtn);
      });
      
      expect(screen.getByTestId('current-step')).toHaveTextContent('2');
      expect(screen.getByTestId('is-completed')).toHaveTextContent('true');

      // 再次点击不应该超过最大步数
      act(() => {
        fireEvent.click(nextBtn);
      });
      
      expect(screen.getByTestId('current-step')).toHaveTextContent('2');
    });

    test('prevStep() 应该减少步骤', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const nextBtn = screen.getByTestId('next-btn');
      const prevBtn = screen.getByTestId('prev-btn');

      // 先前进到第2步
      act(() => {
        fireEvent.click(nextBtn);
      });
      
      expect(screen.getByTestId('current-step')).toHaveTextContent('2');

      // 然后后退到第1步
      act(() => {
        fireEvent.click(prevBtn);
      });
      
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
      expect(screen.getByTestId('is-completed')).toHaveTextContent('false');
    });

    test('prevStep() 不应该小于第1步', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const prevBtn = screen.getByTestId('prev-btn');
      
      // 在第1步点击后退
      act(() => {
        fireEvent.click(prevBtn);
      });

      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
    });

    test('goToStep() 应该跳转到指定步骤', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const gotoBtn = screen.getByTestId('goto-2-btn');
      
      act(() => {
        fireEvent.click(gotoBtn);
      });

      expect(screen.getByTestId('current-step')).toHaveTextContent('2');
      expect(screen.getByTestId('is-completed')).toHaveTextContent('false');
    });

    test('setData() 应该更新数据', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const setDataBtn = screen.getByTestId('set-data-btn');
      
      act(() => {
        fireEvent.click(setDataBtn);
      });

      expect(screen.getByTestId('data')).toHaveTextContent('{"name":"test"}');
    });

    test('reset() 应该重置所有状态', () => {
      render(
        <TestWrapper totalSteps={3} initialData={{ initial: 'data' }}>
          <TestComponent />
        </TestWrapper>
      );

      const nextBtn = screen.getByTestId('next-btn');
      const setDataBtn = screen.getByTestId('set-data-btn');
      const resetBtn = screen.getByTestId('reset-btn');

      // 先修改状态
      act(() => {
        fireEvent.click(nextBtn);
        fireEvent.click(setDataBtn);
      });

      expect(screen.getByTestId('current-step')).toHaveTextContent('2');
      expect(screen.getByTestId('data')).toHaveTextContent('{"initial":"data","name":"test"}');

      // 然后重置
      act(() => {
        fireEvent.click(resetBtn);
      });

      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
      expect(screen.getByTestId('is-completed')).toHaveTextContent('false');
      expect(screen.getByTestId('data')).toHaveTextContent('{"initial":"data"}');
    });
  });

  describe('dispatch 方法测试', () => {
    test('dispatch NEXT_STEP 应该工作', () => {
      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const dispatchBtn = screen.getByTestId('dispatch-btn');
      
      act(() => {
        fireEvent.click(dispatchBtn);
      });

      expect(screen.getByTestId('current-step')).toHaveTextContent('2');
    });
  });

  describe('错误处理', () => {
    test('在没有Provider的情况下使用Hook应该抛出错误', () => {
      // 临时禁用console.error以避免测试输出中的错误信息
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useFlowReducerContext must be used within a FlowReducerProvider');

      console.error = originalError;
    });
  });

  describe('边界情况测试', () => {
    test('goToStep 超出范围应该被忽略', () => {
      const TestGoToStepComponent: React.FC = () => {
        const { state, goToStep } = useFlowReducerContext();

        return (
          <div>
            <div data-testid="current-step">{state.currentStep}</div>
            <button data-testid="goto-invalid-btn" onClick={() => goToStep(10)}>
              Go to Step 10
            </button>
            <button data-testid="goto-zero-btn" onClick={() => goToStep(0)}>
              Go to Step 0
            </button>
          </div>
        );
      };

      render(
        <TestWrapper totalSteps={3}>
          <TestGoToStepComponent />
        </TestWrapper>
      );

      const gotoInvalidBtn = screen.getByTestId('goto-invalid-btn');
      const gotoZeroBtn = screen.getByTestId('goto-zero-btn');

      // 尝试跳转到无效步骤
      act(() => {
        fireEvent.click(gotoInvalidBtn);
      });
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');

      act(() => {
        fireEvent.click(gotoZeroBtn);
      });
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
    });
  });
});
