import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FlowReducerProvider } from '../../contexts/FlowReducerContext';
import ReducerController from '../ReducerController';

// 测试包装器
const TestWrapper: React.FC<{ children: React.ReactNode; totalSteps?: number; initialData?: Record<string, any> }> = ({ 
  children, 
  totalSteps = 3, 
  initialData = {} 
}) => (
  <FlowReducerProvider totalSteps={totalSteps} initialData={initialData}>
    {children}
  </FlowReducerProvider>
);

describe('ReducerController', () => {
  test('应该渲染所有子组件', () => {
    render(
      <TestWrapper>
        <ReducerController />
      </TestWrapper>
    );

    // 检查标题
    expect(screen.getByText('流程控制器 - useReducer 版本')).toBeInTheDocument();

    // 检查状态指示器
    expect(screen.getByText(/进行中 - 第 1 步/)).toBeInTheDocument();

    // 检查进度条
    expect(screen.getByText('进度: 1/3')).toBeInTheDocument();

    // 检查步骤显示
    expect(screen.getByText('当前步骤')).toBeInTheDocument();
    expect(screen.getByText('基本信息')).toBeInTheDocument();

    // 检查导航按钮
    expect(screen.getByText('← 上一步')).toBeInTheDocument();
    expect(screen.getByText('下一步 →')).toBeInTheDocument();
    expect(screen.getByText('🔄 重置')).toBeInTheDocument();

    // 检查调试信息
    expect(screen.getByText('当前状态 (useReducer管理)')).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === '状态管理方式: useReducer';
    })).toBeInTheDocument();
    expect(screen.getByText('不可变状态更新，集中的状态变更逻辑')).toBeInTheDocument();
  });

  test('应该正确显示初始状态', () => {
    const initialData = { name: 'test', age: 25 };
    
    render(
      <TestWrapper totalSteps={4} initialData={initialData}>
        <ReducerController />
      </TestWrapper>
    );

    // 检查进度显示
    expect(screen.getByText('进度: 1/4')).toBeInTheDocument();

    // 检查调试信息中的状态
    const debugSection = screen.getByText('当前状态 (useReducer管理)').parentElement;
    expect(debugSection).toHaveTextContent('"currentStep": 1');
    expect(debugSection).toHaveTextContent('"totalSteps": 4');
    expect(debugSection).toHaveTextContent('"isCompleted": false');
    expect(debugSection).toHaveTextContent('"name": "test"');
    expect(debugSection).toHaveTextContent('"age": 25');
  });

  describe('流程导航功能', () => {
    test('下一步按钮应该工作', () => {
      render(
        <TestWrapper>
          <ReducerController />
        </TestWrapper>
      );

      const nextButton = screen.getByText('下一步 →');
      
      act(() => {
        fireEvent.click(nextButton);
      });

      // 检查步骤是否更新
      expect(screen.getByText('进度: 2/3')).toBeInTheDocument();
      expect(screen.getByText(/进行中 - 第 2 步/)).toBeInTheDocument();
      
      // 检查当前步骤高亮
      expect(screen.getByText('偏好设置')).toBeInTheDocument();
    });

    test('上一步按钮应该工作', () => {
      render(
        <TestWrapper>
          <ReducerController />
        </TestWrapper>
      );

      const nextButton = screen.getByText('下一步 →');
      const prevButton = screen.getByText('← 上一步');

      // 先前进一步
      act(() => {
        fireEvent.click(nextButton);
      });
      expect(screen.getByText('进度: 2/3')).toBeInTheDocument();

      // 然后后退一步
      act(() => {
        fireEvent.click(prevButton);
      });
      expect(screen.getByText('进度: 1/3')).toBeInTheDocument();
      expect(screen.getByText(/进行中 - 第 1 步/)).toBeInTheDocument();
    });

    test('重置按钮应该工作', () => {
      const initialData = { initial: 'data' };
      
      render(
        <TestWrapper initialData={initialData}>
          <ReducerController />
        </TestWrapper>
      );

      const nextButton = screen.getByText('下一步 →');
      const resetButton = screen.getByText('🔄 重置');

      // 先进行一些操作
      act(() => {
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
      });

      expect(screen.getByText(/✅\s*流程已完成/)).toBeInTheDocument();

      // 然后重置
      act(() => {
        fireEvent.click(resetButton);
      });

      expect(screen.getByText('进度: 1/3')).toBeInTheDocument();
      expect(screen.getByText(/进行中 - 第 1 步/)).toBeInTheDocument();
      
      // 检查数据是否重置为初始数据
      const debugSection = screen.getByText('当前状态 (useReducer管理)').parentElement;
      expect(debugSection).toHaveTextContent('"initial": "data"');
    });

    test('步骤点击跳转应该工作', () => {
      render(
        <TestWrapper>
          <ReducerController />
        </TestWrapper>
      );

      // 点击第2步
      const step2 = screen.getByText('偏好设置').closest('.step-item');
      
      act(() => {
        fireEvent.click(step2!);
      });

      expect(screen.getByText('进度: 2/3')).toBeInTheDocument();
      expect(screen.getByText(/进行中 - 第 2 步/)).toBeInTheDocument();
    });
  });

  describe('数据表单功能', () => {
    test('第1步表单应该工作', () => {
      render(
        <TestWrapper>
          <ReducerController />
        </TestWrapper>
      );

      // 找到姓名输入框
      const nameInput = screen.getByPlaceholderText('请输入您的姓名');
      
      act(() => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      });

      // 检查调试信息中是否更新了数据
      const debugSection = screen.getByText('当前状态 (useReducer管理)').parentElement;
      expect(debugSection).toHaveTextContent('"name": "John Doe"');
    });

    test('第2步表单应该工作', () => {
      render(
        <TestWrapper>
          <ReducerController />
        </TestWrapper>
      );

      // 先跳到第2步
      const nextButton = screen.getByText('下一步 →');
      act(() => {
        fireEvent.click(nextButton);
      });

      // 选择主题
      const themeSelect = screen.getByLabelText('主题偏好:');
      
      act(() => {
        fireEvent.change(themeSelect, { target: { value: 'dark' } });
      });

      // 检查数据是否更新
      const debugSection = screen.getByText('当前状态 (useReducer管理)').parentElement;
      expect(debugSection).toHaveTextContent('"theme": "dark"');
    });

    test('第3步应该显示确认信息', () => {
      render(
        <TestWrapper>
          <ReducerController />
        </TestWrapper>
      );

      // 填写第1步数据
      const nameInput = screen.getByPlaceholderText('请输入您的姓名');
      act(() => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      });

      // 跳到第2步
      const nextButton = screen.getByText('下一步 →');
      act(() => {
        fireEvent.click(nextButton);
      });

      // 填写第2步数据
      const themeSelect = screen.getByLabelText('主题偏好:');
      act(() => {
        fireEvent.change(themeSelect, { target: { value: 'dark' } });
      });

      // 跳到第3步
      act(() => {
        fireEvent.click(nextButton);
      });

      // 检查确认信息
      expect(screen.getByText('请确认以下信息:')).toBeInTheDocument();
      
      // 更精确地查找包含姓名和值的元素
      const nameElements = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('姓名:') && element?.textContent?.includes('John Doe');
      });
      expect(nameElements.length).toBeGreaterThan(0);
      
      const themeElements = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('主题偏好:') && element?.textContent?.includes('dark');
      });
      expect(themeElements.length).toBeGreaterThan(0);
    });
  });

  describe('状态管理验证', () => {
    test('应该显示useReducer特有的信息', () => {
      render(
        <TestWrapper>
          <ReducerController />
        </TestWrapper>
      );

      // 检查状态管理器类型显示
      expect(screen.getByText((content, element) => {
        return element?.textContent === '状态管理: useReducer';
      })).toBeInTheDocument();
      
      // 检查Action类型说明
      expect(screen.getByText('NEXT_STEP, PREV_STEP, GO_TO_STEP, SET_DATA, RESET')).toBeInTheDocument();
      
      // 检查特点说明
      expect(screen.getByText('不可变状态更新，集中的状态变更逻辑')).toBeInTheDocument();
    });

    test('状态更新应该是不可变的', () => {
      render(
        <TestWrapper>
          <ReducerController />
        </TestWrapper>
      );

      // 获取初始状态的字符串表示
      const debugSection = screen.getByText('当前状态 (useReducer管理)').parentElement;
      const initialStateText = debugSection?.textContent;

      // 进行状态更新
      const nextButton = screen.getByText('下一步 →');
      act(() => {
        fireEvent.click(nextButton);
      });

      // 检查状态确实发生了变化
      const updatedStateText = debugSection?.textContent;
      expect(updatedStateText).not.toBe(initialStateText);
      expect(updatedStateText).toContain('"currentStep": 2');
    });
  });

  describe('完成状态测试', () => {
    test('到达最后一步应该显示完成状态', () => {
      render(
        <TestWrapper>
          <ReducerController />
        </TestWrapper>
      );

      const nextButton = screen.getByText('下一步 →');
      
      // 点击两次到达最后一步
      act(() => {
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
      });

      // 检查完成状态
      expect(screen.getByText(/✅\s*流程已完成/)).toBeInTheDocument();
      expect(screen.getByText('完成')).toBeInTheDocument(); // 按钮文本应该变为"完成"
      
      // 检查调试信息
      const debugSection = screen.getByText('当前状态 (useReducer管理)').parentElement;
      expect(debugSection).toHaveTextContent('"isCompleted": true');
    });
  });

  describe('边界情况', () => {
    test('在第1步时上一步按钮应该被禁用', () => {
      render(
        <TestWrapper>
          <ReducerController />
        </TestWrapper>
      );

      const prevButton = screen.getByText('← 上一步');
      expect(prevButton).toBeDisabled();
    });

    test('在最后一步时下一步按钮应该被禁用', () => {
      render(
        <TestWrapper>
          <ReducerController />
        </TestWrapper>
      );

      const nextButton = screen.getByText('下一步 →');
      
      // 到达最后一步
      act(() => {
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
      });

      expect(screen.getByText('完成')).toBeDisabled();
    });
  });
});
