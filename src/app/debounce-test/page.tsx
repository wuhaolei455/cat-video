'use client';

import React, { useState } from 'react';
import { DebouncedInput } from '../../../packages/leo-form-library/src';

export default function DebounceTestPage() {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchCount, setSearchCount] = useState(0);
  const [lastSearchTime, setLastSearchTime] = useState<string>('');

  // 模拟搜索 API
  const handleSearch = (query: string) => {
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    setLastSearchTime(new Date().toLocaleTimeString());
    
    // 模拟搜索结果
    const mockResults = query 
      ? [`${query} - 结果1`, `${query} - 结果2`, `${query} - 结果3`]
      : [];
    setSearchResults(mockResults);
    
    console.log(`🔍 搜索执行 #${newCount}:`, query);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    console.log('📝 输入变化:', event.target.value);
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">防抖功能测试</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">测试说明：</h2>
          <ul className="text-sm space-y-1">
            <li>• 快速连续输入字符，观察搜索执行次数</li>
            <li>• 输入值会实时更新（蓝色显示）</li>
            <li>• 搜索只在停止输入500ms后执行（绿色显示）</li>
            <li>• 查看浏览器控制台了解详细日志</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">防抖搜索输入框</h3>
          <DebouncedInput
            label="搜索关键词"
            placeholder="输入搜索内容..."
            value={searchValue}
            onChange={handleInputChange}
            onDebouncedChange={handleSearch}
            debounceTime={500}
            helperText="防抖延迟：500ms"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800">实时输入值：</h4>
            <p className="text-blue-600 font-mono">{searchValue || '(空)'}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800">搜索统计：</h4>
            <p className="text-green-600">执行次数: {searchCount}</p>
            <p className="text-green-600 text-sm">最后搜索: {lastSearchTime || '未搜索'}</p>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">搜索结果：</h4>
            <ul className="space-y-1">
              {searchResults.map((result, index) => (
                <li key={index} className="text-gray-700">• {result}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">立即模式测试：</h4>
          <DebouncedInput
            label="立即搜索"
            placeholder="第一次输入立即搜索，后续防抖..."
            onDebouncedChange={(value) => {
              console.log('🚀 立即模式搜索:', value);
            }}
            debounceTime={500}
            immediate={true}
            helperText="第一次输入立即触发，后续输入防抖"
          />
        </div>
      </div>
    </div>
  );
}
