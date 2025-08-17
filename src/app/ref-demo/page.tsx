'use client';

import React, { useRef, useState } from 'react';
import { Input } from '../../../packages/leo-form-library/src';

export default function RefDemoPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');

  // 通过 ref 直接操作 DOM 元素
  const focusInput = () => {
    inputRef.current?.focus();
    setMessage('输入框已聚焦！');
  };

  const selectAllText = () => {
    if (inputRef.current) {
      inputRef.current.select();
      setMessage('已选中所有文本！');
    }
  };

  const getInputValue = () => {
    if (inputRef.current) {
      setMessage(`当前值: "${inputRef.current.value}"`);
    }
  };

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
      setMessage('输入框已清空！');
    }
  };

  const checkValidity = () => {
    if (inputRef.current) {
      const isValid = inputRef.current.checkValidity();
      setMessage(`输入验证: ${isValid ? '有效' : '无效'}`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">forwardRef 使用演示</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">为什么需要 forwardRef？</h2>
          <ul className="text-sm space-y-1">
            <li>• <strong>直接 DOM 操作</strong>：focus、select、scroll 等</li>
            <li>• <strong>获取 DOM 属性</strong>：value、scrollTop、clientHeight 等</li>
            <li>• <strong>调用 DOM 方法</strong>：checkValidity、reportValidity 等</li>
            <li>• <strong>第三方库集成</strong>：很多库需要直接访问 DOM 元素</li>
            <li>• <strong>性能优化</strong>：避免不必要的重新渲染</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">实际演示</h3>
          
          <Input
            ref={inputRef}  // ✅ 通过 forwardRef 可以获取到真实的 input 元素
            label="测试输入框"
            placeholder="在这里输入一些文本..."
            helperText="通过 ref 可以直接操作这个输入框"
            required
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              onClick={focusInput}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              聚焦输入框
            </button>
            
            <button
              onClick={selectAllText}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              选中所有文本
            </button>
            
            <button
              onClick={getInputValue}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
            >
              获取当前值
            </button>
            
            <button
              onClick={clearInput}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              清空输入框
            </button>
            
            <button
              onClick={checkValidity}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
            >
              检查有效性
            </button>
          </div>

          {message && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-800 font-medium">{message}</p>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">代码对比：</h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-red-600">❌ 没有 forwardRef：</h5>
              <pre className="text-sm bg-red-50 p-2 rounded mt-1 overflow-x-auto">
{`const Input = (props) => {
  return <input {...props} />;
};

// 父组件无法获取 input 元素的引用
<Input ref={inputRef} />  // 错误！`}
              </pre>
            </div>
            
            <div>
              <h5 className="font-medium text-green-600">✅ 使用 forwardRef：</h5>
              <pre className="text-sm bg-green-50 p-2 rounded mt-1 overflow-x-auto">
{`const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return <input ref={ref} {...props} />;
  }
);

// 父组件可以直接操作 input 元素
<Input ref={inputRef} />  // 正确！`}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">在 HOC 中的重要性：</h4>
          <p className="text-sm text-gray-700 mb-2">
            当组件被 HOC（高阶组件）包装时，ref 需要层层传递：
          </p>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
{`// HOC 包装链
DebouncedInput = withDebounce(
  withFormField(
    withValidation(Input)  // 最内层的 Input 需要接收 ref
  )
)

// 每一层都需要正确转发 ref
<DebouncedInput ref={inputRef} />  // 最终能访问到真实的 input 元素`}
          </pre>
        </div>
      </div>
    </div>
  );
}
