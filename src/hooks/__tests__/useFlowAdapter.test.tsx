import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useFlowAdapter } from '../useFlowAdapter';
import { FlowProvider } from '../../contexts/FlowContext';
import { FlowReducerProvider } from '../../contexts/FlowReducerContext';

// 测试组件
const TestAdapterComponent: React.FC = () => {
  const { state, nextStep, prevStep, setData, reset, goToStep, stateManager } = useFlowAdapter();

  return (
    <div>
      <div data-testid="current-step">{state.currentStep}</div>
      <div data-testid="total-steps">{state.totalSteps}</div>
      <div data-testid="is-completed">{state.isCompleted.toString()}</div>
      <div data-testid="data">{JSON.stringify(state.data)}</div>
      <div data-testid="state-manager">{stateManager}</div>
      
      <button data-testid="next-btn" onClick={nextStep}>Next</button>
      <button data-testid="prev-btn" onClick={prevStep}>Previous</button>
      <button data-testid="reset-btn" onClick={reset}>Reset</button>
      <button data-testid="goto-2-btn" onClick={() => goToStep(2)}>Go to Step 2</button>
      <button data-testid="set-data-btn" onClick={() => setData('name', 'test')}>Set Data</button>
    </div>
  );
};

describe('useFlowAdapter', () => {
  describe('与useState版本(FlowProvider)配合使用', () => {
    test('应该正确识别useState版本', () => {
      render(
        <FlowProvider totalSteps={3} initialData={{}}>
          <TestAdapterComponent />
        </FlowProvider>
      );

      expect(screen.getByTestId('state-manager')).toHaveTextContent('useState');
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
      expect(screen.getByTestId('total-steps')).toHaveTextContent('3');
    });

    test('useState版本的所有功能应该正常工作', () => {
      render(
        <FlowProvider totalSteps={3} initialData={{ initial: 'data' }}>
          <TestAdapterComponent />
        </FlowProvider>
      );

      // 测试初始状态
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
      expect(screen.getByTestId('data')).toHaveTextContent('{"initial":"data"}');

      // 测试nextStep
      act(() => {
        fireEvent.click(screen.getByTestId('next-btn'));
      });
      expect(screen.getByTestId('current-step')).toHaveTextContent('2');

      // 测试setData
      act(() => {
        fireEvent.click(screen.getByTestId('set-data-btn'));
      });
      expect(screen.getByTestId('data')).toHaveTextContent('{"initial":"data","name":"test"}');

      // 测试goToStep
      act(() => {
        fireEvent.click(screen.getByTestId('goto-2-btn'));
      });
      expect(screen.getByTestId('current-step')).toHaveTextContent('2');

      // 测试prevStep
      act(() => {
        fireEvent.click(screen.getByTestId('prev-btn'));
      });
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');

      // 测试reset
      act(() => {
        fireEvent.click(screen.getByTestId('reset-btn'));
      });
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
      expect(screen.getByTestId('data')).toHaveTextContent('{"initial":"data"}');
    });
  });

  describe('与useReducer版本(FlowReducerProvider)配合使用', () => {
    test('应该正确识别useReducer版本', () => {
      render(
        <FlowReducerProvider totalSteps={3} initialData={{}}>
          <TestAdapterComponent />
        </FlowReducerProvider>
      );

      expect(screen.getByTestId('state-manager')).toHaveTextContent('useReducer');
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
      expect(screen.getByTestId('total-steps')).toHaveTextContent('3');
    });

    test('useReducer版本的所有功能应该正常工作', () => {
      render(
        <FlowReducerProvider totalSteps={3} initialData={{ initial: 'data' }}>
          <TestAdapterComponent />
        </FlowReducerProvider>
      );

      // 测试初始状态
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
      expect(screen.getByTestId('data')).toHaveTextContent('{"initial":"data"}');

      // 测试nextStep
      act(() => {
        fireEvent.click(screen.getByTestId('next-btn'));
      });
      expect(screen.getByTestId('current-step')).toHaveTextContent('2');

      // 测试setData
      act(() => {
        fireEvent.click(screen.getByTestId('set-data-btn'));
      });
      expect(screen.getByTestId('data')).toHaveTextContent('{"initial":"data","name":"test"}');

      // 测试goToStep
      act(() => {
        fireEvent.click(screen.getByTestId('goto-2-btn'));
      });
      expect(screen.getByTestId('current-step')).toHaveTextContent('2');

      // 测试prevStep
      act(() => {
        fireEvent.click(screen.getByTestId('prev-btn'));
      });
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');

      // 测试reset
      act(() => {
        fireEvent.click(screen.getByTestId('reset-btn'));
      });
      expect(screen.getByTestId('current-step')).toHaveTextContent('1');
      expect(screen.getByTestId('data')).toHaveTextContent('{"initial":"data"}');
    });
  });

  describe('优先级测试', () => {
    test('当两个Provider都存在时，应该优先使用useReducer版本', () => {
      render(
        <FlowProvider totalSteps={3} initialData={{}}>
          <FlowReducerProvider totalSteps={5} initialData={{}}>
            <TestAdapterComponent />
          </FlowReducerProvider>
        </FlowProvider>
      );

      // 应该使用useReducer版本（totalSteps=5）
      expect(screen.getByTestId('state-manager')).toHaveTextContent('useReducer');
      expect(screen.getByTestId('total-steps')).toHaveTextContent('5');
    });

    test('嵌套顺序相反时，仍应该优先使用useReducer版本', () => {
      render(
        <FlowReducerProvider totalSteps={4} initialData={{}}>
          <FlowProvider totalSteps={2} initialData={{}}>
            <TestAdapterComponent />
          </FlowProvider>
        </FlowReducerProvider>
      );

      // 应该使用useReducer版本（totalSteps=4）
      expect(screen.getByTestId('state-manager')).toHaveTextContent('useReducer');
      expect(screen.getByTestId('total-steps')).toHaveTextContent('4');
    });
  });

  describe('错误处理', () => {
    test('在没有任何Provider的情况下应该抛出错误', () => {
      // 临时禁用console.error以避免测试输出中的错误信息
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestAdapterComponent />);
      }).toThrow('useFlowAdapter must be used within a FlowProvider or FlowReducerProvider');

      console.error = originalError;
    });
  });

  describe('状态一致性测试', () => {
    test('两个版本应该产生相同的状态变化', () => {
      // useState版本
      const { rerender } = render(
        <FlowProvider totalSteps={3} initialData={{ test: 'data' }}>
          <TestAdapterComponent />
        </FlowProvider>
      );

      // 记录useState版本的操作结果
      act(() => {
        fireEvent.click(screen.getByTestId('next-btn'));
        fireEvent.click(screen.getByTestId('set-data-btn'));
      });

      const useStateResults = {
        currentStep: screen.getByTestId('current-step').textContent,
        data: screen.getByTestId('data').textContent,
        isCompleted: screen.getByTestId('is-completed').textContent
      };

      // 切换到useReducer版本
      rerender(
        <FlowReducerProvider totalSteps={3} initialData={{ test: 'data' }}>
          <TestAdapterComponent />
        </FlowReducerProvider>
      );

      // 执行相同的操作
      act(() => {
        fireEvent.click(screen.getByTestId('next-btn'));
        fireEvent.click(screen.getByTestId('set-data-btn'));
      });

      const useReducerResults = {
        currentStep: screen.getByTestId('current-step').textContent,
        data: screen.getByTestId('data').textContent,
        isCompleted: screen.getByTestId('is-completed').textContent
      };

      // 结果应该完全相同
      expect(useReducerResults).toEqual(useStateResults);
    });
  });

  describe('接口兼容性测试', () => {
    test('两个版本的接口应该完全兼容', () => {
      const TestInterfaceComponent: React.FC = () => {
        const adapter = useFlowAdapter();
        
        // 测试所有必需的属性和方法是否存在
        const requiredProperties = [
          'state',
          'nextStep',
          'prevStep',
          'setData',
          'reset',
          'goToStep',
          'stateManager'
        ];

        const missingProperties = requiredProperties.filter(prop => !(prop in adapter));

        return (
          <div>
            <div data-testid="missing-props">{JSON.stringify(missingProperties)}</div>
            <div data-testid="state-props">
              {JSON.stringify(Object.keys(adapter.state).sort())}
            </div>
          </div>
        );
      };

      // 测试useState版本
      const { rerender } = render(
        <FlowProvider>
          <TestInterfaceComponent />
        </FlowProvider>
      );

      expect(screen.getByTestId('missing-props')).toHaveTextContent('[]');
      expect(screen.getByTestId('state-props')).toHaveTextContent(
        JSON.stringify(['currentStep', 'data', 'isCompleted', 'totalSteps'])
      );

      // 测试useReducer版本
      rerender(
        <FlowReducerProvider>
          <TestInterfaceComponent />
        </FlowReducerProvider>
      );

      expect(screen.getByTestId('missing-props')).toHaveTextContent('[]');
      expect(screen.getByTestId('state-props')).toHaveTextContent(
        JSON.stringify(['currentStep', 'data', 'isCompleted', 'totalSteps'])
      );
    });
  });
});
