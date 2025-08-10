'use client';

import React, { useState } from 'react';
import { useFlowAdapter } from '../hooks/useFlowAdapter';

const DataForm: React.FC = () => {
  const { state, setData } = useFlowAdapter();
  const [localData, setLocalData] = useState<Record<string, string>>({});

  const handleInputChange = (key: string, value: string) => {
    setLocalData(prev => ({ ...prev, [key]: value }));
    setData(key, value);
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h4>步骤 1: 基本信息</h4>
            <div className="form-group">
              <label htmlFor="name">姓名:</label>
              <input
                id="name"
                type="text"
                value={localData.name || state.data.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="请输入您的姓名"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">邮箱:</label>
              <input
                id="email"
                type="email"
                value={localData.email || state.data.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="请输入您的邮箱"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h4>步骤 2: 偏好设置</h4>
            <div className="form-group">
              <label htmlFor="theme">主题偏好:</label>
              <select
                id="theme"
                value={localData.theme || state.data.theme || ''}
                onChange={(e) => handleInputChange('theme', e.target.value)}
              >
                <option value="">请选择主题</option>
                <option value="light">浅色主题</option>
                <option value="dark">深色主题</option>
                <option value="auto">自动切换</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="language">语言偏好:</label>
              <select
                id="language"
                value={localData.language || state.data.language || ''}
                onChange={(e) => handleInputChange('language', e.target.value)}
              >
                <option value="">请选择语言</option>
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h4>步骤 3: 确认信息</h4>
            <div className="confirmation-data">
              <h5>请确认以下信息:</h5>
              <div className="data-item">
                <strong>姓名:</strong> {state.data.name || '未填写'}
              </div>
              <div className="data-item">
                <strong>邮箱:</strong> {state.data.email || '未填写'}
              </div>
              <div className="data-item">
                <strong>主题偏好:</strong> {state.data.theme || '未选择'}
              </div>
              <div className="data-item">
                <strong>语言偏好:</strong> {state.data.language || '未选择'}
              </div>
            </div>
          </div>
        );

      default:
        return <div>未知步骤</div>;
    }
  };

  return (
    <div className="data-form">
      {renderStepContent()}
    </div>
  );
};

export default DataForm;
