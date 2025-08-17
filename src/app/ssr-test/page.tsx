'use client';

import React, { useState } from 'react';
import { Input, Select, Textarea } from '../../../packages/leo-form-library/src';

export default function SSRTestPage() {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    bio: ''
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const genderOptions = [
    { value: '', label: '请选择性别' },
    { value: 'male', label: '男' },
    { value: 'female', label: '女' },
    { value: 'other', label: '其他' }
  ];

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">SSR 水合测试页面</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">测试说明：</h2>
          <ul className="text-sm space-y-1">
            <li>• 这个页面测试 SSR 水合是否正常</li>
            <li>• 如果没有水合错误，控制台应该没有相关警告</li>
            <li>• 所有表单元素应该有唯一且一致的 ID</li>
            <li>• 刷新页面不应该出现水合不匹配的错误</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">表单测试</h3>
          
          <Input
            label="姓名"
            placeholder="请输入您的姓名"
            value={formData.name}
            onChange={handleChange('name')}
            helperText="这是一个使用 useId 的输入框"
          />

          <Select
            label="性别"
            options={genderOptions}
            value={formData.gender}
            onChange={handleChange('gender')}
            helperText="这是一个使用 useId 的选择框"
          />

          <Textarea
            label="个人介绍"
            placeholder="请简单介绍一下自己..."
            value={formData.bio}
            onChange={handleChange('bio')}
            helperText="这是一个使用 useId 的文本区域"
            minRows={3}
            maxRows={6}
          />
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">表单数据：</h4>
          <pre className="text-sm text-green-700">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">检查要点：</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>1. 打开浏览器开发者工具的控制台</li>
            <li>2. 刷新页面（Ctrl+R 或 Cmd+R）</li>
            <li>3. 检查是否有 "Hydration failed" 错误</li>
            <li>4. 检查是否有 "server rendered HTML didn't match" 警告</li>
            <li>5. 如果没有这些错误，说明 SSR 水合问题已修复</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
