'use client';

import React, { useState, useRef } from 'react';
import { 
  Input, 
  Select, 
  Textarea, 
  ValidatedInput, 
  ValidatedSelect,
  EnhancedInput,
  FormBuilder,
  withValidation,
  withFormField
} from '../../../packages/leo-form-library/src';

// 创建自定义增强组件演示HOC模式
const CustomValidatedInput = withValidation(Input);
const CustomFormFieldSelect = withFormField(Select);

export default function FormDemoPage() {
  const [basicForm, setBasicForm] = useState({
    name: '',
    email: '',
    city: '',
    bio: ''
  });

  const [validatedForm, setValidatedForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    age: '',
    terms: false
  });

  const [builderForm, setBuilderForm] = useState<Record<string, any>>({});
  const [builderErrors, setBuilderErrors] = useState<Record<string, string>>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // 表单字段配置（用于FormBuilder演示）
  const formFields = [
    {
      name: 'firstName',
      type: 'input' as const,
      label: '名字',
      required: true,
      placeholder: '请输入您的名字',
      helperText: '这是一个必填字段'
    },
    {
      name: 'lastName',
      type: 'input' as const,
      label: '姓氏',
      required: true,
      placeholder: '请输入您的姓氏'
    },
    {
      name: 'gender',
      type: 'select' as const,
      label: '性别',
      required: true,
      options: [
        { value: 'male', label: '男' },
        { value: 'female', label: '女' },
        { value: 'other', label: '其他' }
      ],
      placeholder: '请选择性别'
    },
    {
      name: 'introduction',
      type: 'textarea' as const,
      label: '个人介绍',
      placeholder: '请简单介绍一下自己',
      helperText: '可选字段，最多500字符'
    }
  ];

  const handleBasicFormChange = (field: string, value: string) => {
    setBasicForm(prev => ({ ...prev, [field]: value }));
  };

  const handleValidatedFormChange = (field: string, value: string) => {
    setValidatedForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBuilderFieldChange = (name: string, value: any) => {
    setBuilderForm(prev => ({ ...prev, [name]: value }));
    
    // 简单的验证逻辑
    if (name === 'firstName' || name === 'lastName') {
      if (!value.trim()) {
        setBuilderErrors(prev => ({ ...prev, [name]: '此字段为必填项' }));
      } else {
        setBuilderErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const focusSelect = () => {
    selectRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            React 组件设计模式演示
          </h1>
          <p className="text-lg text-gray-600">
            展示高阶组件(HOC)、Render Props、组合模式、forwardRef的实际应用
          </p>
        </div>

        {/* 1. forwardRef 模式演示 */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            1. forwardRef 模式 - Ref转发
          </h2>
          <p className="text-gray-600 mb-4">
            forwardRef允许父组件直接访问子组件的DOM元素或组件实例。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                ref={inputRef}
                label="用户名"
                placeholder="点击按钮可聚焦此输入框"
                value={basicForm.name}
                onChange={(e) => handleBasicFormChange('name', e.target.value)}
              />
              <button
                onClick={focusInput}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                聚焦输入框 (forwardRef)
              </button>
            </div>
            
            <div>
              <Select
                ref={selectRef}
                label="城市"
                options={[
                  { value: 'beijing', label: '北京' },
                  { value: 'shanghai', label: '上海' },
                  { value: 'guangzhou', label: '广州' },
                  { value: 'shenzhen', label: '深圳' }
                ]}
                placeholder="请选择城市"
                value={basicForm.city}
                onChange={(e) => handleBasicFormChange('city', e.target.value)}
              />
              <button
                onClick={focusSelect}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                聚焦选择框 (forwardRef)
              </button>
            </div>
          </div>
        </section>

        {/* 2. 组合模式演示 */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            2. 组合模式 - 组件组合
          </h2>
          <p className="text-gray-600 mb-4">
            通过组合多个基础组件构建复杂的表单界面。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="邮箱"
              type="email"
              placeholder="请输入邮箱地址"
              helperText="我们会向此邮箱发送确认信息"
              value={basicForm.email}
              onChange={(e) => handleBasicFormChange('email', e.target.value)}
            />
            
            <Textarea
              label="个人简介"
              placeholder="请简单介绍一下自己"
              minRows={3}
              maxRows={6}
              helperText="最多500字符"
              value={basicForm.bio}
              onChange={(e) => handleBasicFormChange('bio', e.target.value)}
            />
          </div>
        </section>

        {/* 3. 高阶组件 (HOC) 模式演示 */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            3. 高阶组件 (HOC) - 组件增强
          </h2>
          <p className="text-gray-600 mb-4">
            使用HOC为基础组件添加验证、样式等增强功能。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">使用 withValidation HOC</h4>
              
              <ValidatedInput
                label="用户名"
                placeholder="请输入用户名"
                validationRules={{
                  required: '用户名不能为空',
                  minLength: { value: 3, message: '用户名至少3个字符' },
                  maxLength: { value: 20, message: '用户名最多20个字符' }
                }}
                validateOnChange={true}
                validateOnBlur={true}
                value={validatedForm.username}
                onChange={(e) => handleValidatedFormChange('username', e.target.value)}
              />
              
              <ValidatedInput
                label="密码"
                type="password"
                placeholder="请输入密码"
                validationRules={{
                  required: '密码不能为空',
                  minLength: { value: 6, message: '密码至少6个字符' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: '密码必须包含大小写字母和数字'
                  }
                }}
                value={validatedForm.password}
                onChange={(e) => handleValidatedFormChange('password', e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">自定义HOC组合</h4>
              
              <CustomValidatedInput
                label="确认密码"
                type="password"
                placeholder="请再次输入密码"
                validationRules={{
                  required: '请确认密码',
                  custom: (value) => {
                    if (value !== validatedForm.password) {
                      return '两次密码输入不一致';
                    }
                    return true;
                  }
                }}
                value={validatedForm.confirmPassword}
                onChange={(e) => handleValidatedFormChange('confirmPassword', e.target.value)}
              />
              
              <ValidatedSelect
                label="年龄段"
                options={[
                  { value: '18-25', label: '18-25岁' },
                  { value: '26-35', label: '26-35岁' },
                  { value: '36-50', label: '36-50岁' },
                  { value: '50+', label: '50岁以上' }
                ]}
                placeholder="请选择年龄段"
                validationRules={{
                  required: '请选择年龄段'
                }}
                value={validatedForm.age}
                onChange={(e) => handleValidatedFormChange('age', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* 4. Render Props 模式演示 */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            4. Render Props - 渲染逻辑共享
          </h2>
          <p className="text-gray-600 mb-4">
            使用Render Props模式实现灵活的表单构建器。
          </p>
          
          <FormBuilder
            fields={formFields}
            values={builderForm}
            errors={builderErrors}
            onFieldChange={handleBuilderFieldChange}
          >
            {({ renderField, renderAllFields, hasErrors, isValid }) => (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formFields.slice(0, 2).map(renderField)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField(formFields[2])}
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-2 rounded text-sm ${
                      isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      表单状态: {isValid ? '有效' : '无效'}
                    </div>
                    {hasErrors && (
                      <div className="text-sm text-red-600">
                        存在 {Object.keys(builderErrors).length} 个错误
                      </div>
                    )}
                  </div>
                </div>
                
                {renderField(formFields[3])}
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setBuilderForm({});
                      setBuilderErrors({});
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  >
                    重置表单
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid}
                    className={`px-6 py-2 rounded font-medium ${
                      isValid
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    提交表单
                  </button>
                </div>
              </div>
            )}
          </FormBuilder>
        </section>

        {/* 5. 组合使用演示 */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            5. 设计模式组合使用
          </h2>
          <p className="text-gray-600 mb-4">
            展示如何组合使用多种设计模式创建复杂的表单组件。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedInput
              label="完全增强输入框"
              placeholder="同时使用了多个HOC"
              helperText="这个组件使用了withFormField和withValidation"
              validationRules={{
                required: true,
                minLength: 5
              }}
              fieldSize="large"
            />
            
            <CustomFormFieldSelect
              label="自定义表单字段选择器"
              options={[
                { value: 'option1', label: '选项1' },
                { value: 'option2', label: '选项2' },
                { value: 'option3', label: '选项3' }
              ]}
              placeholder="使用了withFormField HOC"
              fieldSize="large"
              containerClassName="custom-select-container"
            />
          </div>
        </section>

        {/* 总结 */}
        <section className="bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            📋 设计模式总结
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">forwardRef</h3>
              <p className="text-sm text-gray-600">
                允许父组件直接访问子组件的DOM元素，实现更灵活的组件控制。
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-green-700 mb-2">组合模式</h3>
              <p className="text-sm text-gray-600">
                通过组合多个小组件构建复杂功能，提高代码复用性和可维护性。
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-purple-700 mb-2">高阶组件</h3>
              <p className="text-sm text-gray-600">
                为组件添加额外功能，如验证、样式增强等，实现横切关注点的分离。
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-orange-700 mb-2">Render Props</h3>
              <p className="text-sm text-gray-600">
                通过函数作为props共享组件逻辑，提供最大的渲染灵活性。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
