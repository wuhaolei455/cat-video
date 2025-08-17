# Leo Form Library - 高级扩展指南

本文档详细介绍了基于现有leo-form-library的高级扩展方向，提供完整的实现示例和最佳实践。

## 📖 目录

1. [高阶组件 (HOC) 扩展](#高阶组件-hoc-扩展)
2. [新组件实现](#新组件实现)
3. [高级设计模式](#高级设计模式)
4. [基础设施扩展](#基础设施扩展)
5. [实战示例](#实战示例)

---

## 🔧 高阶组件 (HOC) 扩展

基于现有的`withValidation`和`withFormField`，我们可以创建更多功能强大的HOC。

### 1. withDebounce - 防抖输入

防抖是表单输入中非常重要的性能优化技术，特别适用于搜索输入和实时验证。

```typescript
// src/hocs/withDebounce.tsx
import React, { useState, useEffect, useCallback, ComponentType, forwardRef } from 'react';

export interface WithDebounceProps {
  debounceMs?: number;
  onDebouncedChange?: (value: any) => void;
  immediate?: boolean; // 是否立即执行第一次
}

/**
 * 防抖HOC - 延迟触发onChange事件
 * 适用场景：搜索输入、实时验证、API调用优化
 */
function withDebounce<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  const WithDebounceComponent = forwardRef<any, P & WithDebounceProps>(
    ({
      debounceMs = 300,
      onDebouncedChange,
      immediate = false,
      ...props
    }, ref) => {
      const [debouncedValue, setDebouncedValue] = useState<any>('');
      const [isFirstRun, setIsFirstRun] = useState(true);

      // 防抖逻辑
      useEffect(() => {
        if (isFirstRun && immediate) {
          setIsFirstRun(false);
          onDebouncedChange?.(debouncedValue);
          return;
        }

        const handler = setTimeout(() => {
          onDebouncedChange?.(debouncedValue);
          setIsFirstRun(false);
        }, debounceMs);

        return () => {
          clearTimeout(handler);
        };
      }, [debouncedValue, debounceMs, onDebouncedChange, immediate, isFirstRun]);

      // 处理输入变化
      const handleChange = useCallback((event: any) => {
        const value = event?.target?.value ?? event;
        setDebouncedValue(value);
        
        // 调用原始的onChange（立即触发）
        if ('onChange' in props && typeof (props as any).onChange === 'function') {
          (props as any).onChange(event);
        }
      }, [props]);

      const enhancedProps = {
        ...props,
        onChange: handleChange,
        ref
      } as P;

      return <WrappedComponent {...enhancedProps} />;
    }
  );

  WithDebounceComponent.displayName = `withDebounce(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithDebounceComponent;
}

export default withDebounce;
```

**使用示例：**

```typescript
// 创建防抖搜索输入框
const DebouncedSearchInput = withDebounce(Input);

// 在组件中使用
const SearchForm = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchAPI(query);
      setSearchResults(results);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DebouncedSearchInput
        label="搜索用户"
        placeholder="输入用户名进行搜索..."
        debounceMs={500}
        onDebouncedChange={handleSearch}
        endAdornment={loading ? <Spinner /> : <SearchIcon />}
      />
      
      <SearchResults results={searchResults} loading={loading} />
    </div>
  );
};
```

### 2. withAsyncValidation - 异步验证

异步验证对于检查用户名唯一性、邮箱有效性等场景非常重要。

```typescript
// src/hocs/withAsyncValidation.tsx
import React, { useState, useCallback, useEffect, ComponentType, forwardRef } from 'react';

export interface AsyncValidationRule {
  validator: (value: any) => Promise<string | null>;
  debounceMs?: number;
  validateOnMount?: boolean;
  deps?: any[]; // 依赖项，当依赖变化时重新验证
}

export interface WithAsyncValidationProps {
  asyncValidationRule?: AsyncValidationRule;
  onAsyncValidationStart?: () => void;
  onAsyncValidationEnd?: (error: string | null) => void;
}

/**
 * 异步验证HOC - 支持服务器端验证
 * 适用场景：用户名唯一性检查、邮箱验证、实时数据校验
 */
function withAsyncValidation<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  const WithAsyncValidationComponent = forwardRef<any, P & WithAsyncValidationProps>(
    ({
      asyncValidationRule,
      onAsyncValidationStart,
      onAsyncValidationEnd,
      ...props
    }, ref) => {
      const [asyncError, setAsyncError] = useState<string>('');
      const [isValidating, setIsValidating] = useState(false);
      const [currentValue, setCurrentValue] = useState<any>('');

      // 异步验证函数
      const performAsyncValidation = useCallback(async (value: any) => {
        if (!asyncValidationRule?.validator) return;

        setIsValidating(true);
        onAsyncValidationStart?.();

        try {
          const error = await asyncValidationRule.validator(value);
          setAsyncError(error || '');
          onAsyncValidationEnd?.(error);
        } catch (error) {
          const errorMsg = '验证服务暂时不可用';
          setAsyncError(errorMsg);
          onAsyncValidationEnd?.(errorMsg);
        } finally {
          setIsValidating(false);
        }
      }, [asyncValidationRule, onAsyncValidationStart, onAsyncValidationEnd]);

      // 防抖异步验证
      useEffect(() => {
        if (!currentValue || !asyncValidationRule) return;

        const debounceMs = asyncValidationRule.debounceMs || 500;
        const handler = setTimeout(() => {
          performAsyncValidation(currentValue);
        }, debounceMs);

        return () => clearTimeout(handler);
      }, [currentValue, performAsyncValidation, asyncValidationRule]);

      // 依赖项变化时重新验证
      useEffect(() => {
        if (asyncValidationRule?.deps && currentValue) {
          performAsyncValidation(currentValue);
        }
      }, [asyncValidationRule?.deps, performAsyncValidation, currentValue]);

      // 处理值变化
      const handleChange = useCallback((event: any) => {
        const value = event?.target?.value ?? event;
        setCurrentValue(value);
        
        // 清除之前的异步错误
        if (asyncError) {
          setAsyncError('');
        }

        // 调用原始onChange
        if ('onChange' in props && typeof (props as any).onChange === 'function') {
          (props as any).onChange(event);
        }
      }, [asyncError, props]);

      const enhancedProps = {
        ...props,
        error: asyncError || (props as any).error,
        onChange: handleChange,
        ref
      } as P;

      return (
        <div className="relative">
          <WrappedComponent {...enhancedProps} />
          {isValidating && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      );
    }
  );

  WithAsyncValidationComponent.displayName = `withAsyncValidation(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithAsyncValidationComponent;
}

export default withAsyncValidation;
```

**使用示例：**

```typescript
// 创建异步验证输入框
const AsyncValidatedInput = withAsyncValidation(Input);

// 用户名唯一性检查
const UsernameInput = () => {
  const checkUsernameAvailability = async (username: string): Promise<string | null> => {
    if (!username || username.length < 3) return null;
    
    const response = await fetch(`/api/check-username?username=${username}`);
    const data = await response.json();
    
    return data.available ? null : '用户名已被使用';
  };

  return (
    <AsyncValidatedInput
      label="用户名"
      placeholder="请输入用户名"
      asyncValidationRule={{
        validator: checkUsernameAvailability,
        debounceMs: 800
      }}
      onAsyncValidationStart={() => console.log('开始验证用户名...')}
      onAsyncValidationEnd={(error) => console.log('验证完成:', error)}
    />
  );
};
```

### 3. withLocalStorage - 本地存储

自动保存和恢复表单数据，提升用户体验。

```typescript
// src/hocs/withLocalStorage.tsx
import React, { useState, useEffect, useCallback, ComponentType, forwardRef } from 'react';

export interface WithLocalStorageProps {
  storageKey?: string;
  autoSave?: boolean;
  saveDelay?: number;
  clearOnSubmit?: boolean;
  onRestore?: (value: any) => void;
  onSave?: (value: any) => void;
}

/**
 * 本地存储HOC - 自动保存和恢复表单数据
 * 适用场景：长表单、草稿保存、用户体验优化
 */
function withLocalStorage<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  const WithLocalStorageComponent = forwardRef<any, P & WithLocalStorageProps>(
    ({
      storageKey,
      autoSave = true,
      saveDelay = 1000,
      clearOnSubmit = false,
      onRestore,
      onSave,
      ...props
    }, ref) => {
      const [isRestored, setIsRestored] = useState(false);
      const finalStorageKey = storageKey || `form-field-${Date.now()}`;

      // 从localStorage恢复数据
      useEffect(() => {
        if (!autoSave || isRestored) return;

        try {
          const savedValue = localStorage.getItem(finalStorageKey);
          if (savedValue !== null) {
            const parsedValue = JSON.parse(savedValue);
            onRestore?.(parsedValue);
            
            // 如果组件有defaultValue，则设置它
            if ('defaultValue' in props) {
              (props as any).defaultValue = parsedValue;
            }
          }
        } catch (error) {
          console.warn('Failed to restore from localStorage:', error);
        } finally {
          setIsRestored(true);
        }
      }, [finalStorageKey, autoSave, isRestored, onRestore, props]);

      // 保存到localStorage
      const saveToStorage = useCallback((value: any) => {
        if (!autoSave) return;

        try {
          localStorage.setItem(finalStorageKey, JSON.stringify(value));
          onSave?.(value);
        } catch (error) {
          console.warn('Failed to save to localStorage:', error);
        }
      }, [finalStorageKey, autoSave, onSave]);

      // 延迟保存
      useEffect(() => {
        if (!autoSave || !isRestored) return;

        const currentValue = (props as any).value;
        if (currentValue === undefined) return;

        const handler = setTimeout(() => {
          saveToStorage(currentValue);
        }, saveDelay);

        return () => clearTimeout(handler);
      }, [(props as any).value, saveDelay, saveToStorage, autoSave, isRestored]);

      // 处理值变化
      const handleChange = useCallback((event: any) => {
        // 调用原始onChange
        if ('onChange' in props && typeof (props as any).onChange === 'function') {
          (props as any).onChange(event);
        }
      }, [props]);

      // 清除存储的方法
      const clearStorage = useCallback(() => {
        try {
          localStorage.removeItem(finalStorageKey);
        } catch (error) {
          console.warn('Failed to clear localStorage:', error);
        }
      }, [finalStorageKey]);

      const enhancedProps = {
        ...props,
        onChange: handleChange,
        'data-storage-key': finalStorageKey, // 用于调试
        ref
      } as P;

      return <WrappedComponent {...enhancedProps} />;
    }
  );

  WithLocalStorageComponent.displayName = `withLocalStorage(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithLocalStorageComponent;
}

export default withLocalStorage;
```

### 4. withConditionalRender - 条件渲染

根据其他字段的值动态显示或隐藏字段。

```typescript
// src/hocs/withConditionalRender.tsx
import React, { ComponentType, forwardRef, useMemo } from 'react';

export type ConditionFunction = (formValues: Record<string, any>) => boolean;

export interface WithConditionalRenderProps {
  condition?: ConditionFunction;
  formValues?: Record<string, any>;
  fallback?: React.ReactNode;
  animateToggle?: boolean;
}

/**
 * 条件渲染HOC - 根据条件动态显示/隐藏组件
 * 适用场景：动态表单、条件字段、复杂表单逻辑
 */
function withConditionalRender<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  const WithConditionalRenderComponent = forwardRef<any, P & WithConditionalRenderProps>(
    ({
      condition,
      formValues = {},
      fallback = null,
      animateToggle = false,
      ...props
    }, ref) => {
      
      // 计算是否应该显示
      const shouldRender = useMemo(() => {
        if (!condition) return true;
        return condition(formValues);
      }, [condition, formValues]);

      const enhancedProps = {
        ...props,
        ref
      } as P;

      if (!shouldRender) {
        return <>{fallback}</>;
      }

      const content = <WrappedComponent {...enhancedProps} />;

      // 如果需要动画效果
      if (animateToggle) {
        return (
          <div 
            className="transition-all duration-300 ease-in-out"
            style={{
              opacity: shouldRender ? 1 : 0,
              transform: shouldRender ? 'translateY(0)' : 'translateY(-10px)',
              maxHeight: shouldRender ? '1000px' : '0',
              overflow: 'hidden'
            }}
          >
            {content}
          </div>
        );
      }

      return content;
    }
  );

  WithConditionalRenderComponent.displayName = `withConditionalRender(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithConditionalRenderComponent;
}

export default withConditionalRender;
```

**使用示例：**

```typescript
// 创建条件渲染输入框
const ConditionalInput = withConditionalRender(Input);

// 在表单中使用
const DynamicForm = () => {
  const [formValues, setFormValues] = useState({
    userType: '',
    companyName: '',
    personalInfo: ''
  });

  return (
    <form>
      <Select
        label="用户类型"
        options={[
          { value: 'personal', label: '个人用户' },
          { value: 'business', label: '企业用户' }
        ]}
        value={formValues.userType}
        onChange={(e) => setFormValues(prev => ({ ...prev, userType: e.target.value }))}
      />

      {/* 只有选择企业用户时才显示公司名称字段 */}
      <ConditionalInput
        label="公司名称"
        condition={(values) => values.userType === 'business'}
        formValues={formValues}
        animateToggle={true}
        value={formValues.companyName}
        onChange={(e) => setFormValues(prev => ({ ...prev, companyName: e.target.value }))}
      />

      {/* 只有选择个人用户时才显示个人信息字段 */}
      <ConditionalInput
        label="个人简介"
        condition={(values) => values.userType === 'personal'}
        formValues={formValues}
        animateToggle={true}
        value={formValues.personalInfo}
        onChange={(e) => setFormValues(prev => ({ ...prev, personalInfo: e.target.value }))}
      />
    </form>
  );
};
```

---

## 🧩 新组件实现

### 1. DatePicker - 日期选择器

一个功能完整的日期选择器组件，展示复杂组件的设计思路。

```typescript
// src/components/DatePicker.tsx
import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { BaseFieldProps } from '../types';
import { generateId, cn } from '../utils';

export interface DatePickerProps extends BaseFieldProps {
  value?: Date | string;
  defaultValue?: Date | string;
  onChange?: (date: Date | null) => void;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  showToday?: boolean;
  locale?: 'zh-CN' | 'en-US';
  size?: 'small' | 'medium' | 'large';
}

// 日期工具函数
const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
};

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

/**
 * DatePicker组件 - 功能完整的日期选择器
 * 展示复杂组件的状态管理、事件处理、键盘导航等
 */
const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({
    label,
    error,
    helperText,
    required = false,
    disabled = false,
    className,
    id,
    value,
    defaultValue,
    onChange,
    format = 'YYYY-MM-DD',
    minDate,
    maxDate,
    placeholder = '请选择日期',
    showToday = true,
    locale = 'zh-CN',
    size = 'medium',
    ...props
  }, ref) => {
    const inputId = id || generateId('datepicker');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
      if (value) return typeof value === 'string' ? parseDate(value) : value;
      if (defaultValue) return typeof defaultValue === 'string' ? parseDate(defaultValue) : defaultValue;
      return null;
    });
    const [currentMonth, setCurrentMonth] = useState(() => selectedDate || new Date());
    const [inputValue, setInputValue] = useState(() => 
      selectedDate ? formatDate(selectedDate, format) : ''
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 月份和星期的本地化
    const monthNames = locale === 'zh-CN' 
      ? ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const weekDays = locale === 'zh-CN' 
      ? ['日', '一', '二', '三', '四', '五', '六']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // 点击外部关闭日历
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // 键盘导航
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.focus();
      } else if (event.key === 'Enter') {
        if (!isOpen) {
          setIsOpen(true);
        }
      }
    };

    // 处理日期选择
    const handleDateSelect = (date: Date) => {
      setSelectedDate(date);
      setInputValue(formatDate(date, format));
      onChange?.(date);
      setIsOpen(false);
    };

    // 处理输入框变化
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      
      const parsedDate = parseDate(value);
      if (parsedDate) {
        setSelectedDate(parsedDate);
        setCurrentMonth(parsedDate);
        onChange?.(parsedDate);
      }
    };

    // 生成日历网格
    const renderCalendar = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      
      const days: React.ReactNode[] = [];
      
      // 添加空白天数
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
      }
      
      // 添加月份中的天数
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isSelected = selectedDate && isSameDay(date, selectedDate);
        const isToday = isSameDay(date, new Date());
        const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);
        
        days.push(
          <button
            key={day}
            type="button"
            className={cn(
              'w-8 h-8 text-sm rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
              isSelected && 'bg-blue-500 text-white hover:bg-blue-600',
              isToday && !isSelected && 'bg-blue-100 text-blue-600 font-semibold',
              isDisabled && 'text-gray-300 cursor-not-allowed hover:bg-transparent'
            )}
            disabled={isDisabled}
            onClick={() => !isDisabled && handleDateSelect(date)}
          >
            {day}
          </button>
        );
      }
      
      return days;
    };

    const sizeClasses = {
      small: 'px-2 py-1 text-sm',
      medium: 'px-3 py-2 text-base',
      large: 'px-4 py-3 text-lg'
    };

    const hasError = Boolean(error);

    return (
      <div ref={containerRef} className="relative">
        <div className="form-field">
          {label && (
            <label htmlFor={inputId} className={cn(
              'block mb-1 font-medium',
              size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base',
              hasError ? 'text-red-700' : 'text-gray-700',
              disabled && 'text-gray-500'
            )}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          <div className="relative">
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={inputValue}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'w-full border rounded-md bg-white transition-colors duration-200 focus:outline-none',
                hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500',
                disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
                sizeClasses[size],
                className
              )}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              aria-invalid={hasError}
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              {...props}
            />
            
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsOpen(!isOpen)}
              disabled={disabled}
            >
              📅
            </button>
          </div>
          
          {error && (
            <div className="mt-1 text-sm text-red-600">
              {error}
            </div>
          )}
          
          {helperText && !error && (
            <div className="mt-1 text-sm text-gray-500">
              {helperText}
            </div>
          )}
        </div>

        {/* 日历弹出层 */}
        {isOpen && (
          <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 min-w-[280px]">
            {/* 月份导航 */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                ←
              </button>
              
              <h3 className="font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                →
              </button>
            </div>
            
            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 w-8 h-6">
                  {day}
                </div>
              ))}
            </div>
            
            {/* 日历网格 */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
            
            {/* 今天按钮 */}
            {showToday && (
              <div className="mt-4 pt-3 border-t">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => handleDateSelect(new Date())}
                >
                  {locale === 'zh-CN' ? '今天' : 'Today'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
```

### 2. AutoComplete - 自动完成组件

```typescript
// src/components/AutoComplete.tsx
import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { BaseFieldProps } from '../types';
import { generateId, cn } from '../utils';

export interface AutoCompleteOption {
  value: string;
  label: string;
  disabled?: boolean;
  meta?: any; // 额外数据
}

export interface AutoCompleteProps extends BaseFieldProps {
  options: AutoCompleteOption[] | ((query: string) => Promise<AutoCompleteOption[]>);
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option?: AutoCompleteOption) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  minLength?: number; // 最小搜索长度
  maxResults?: number; // 最大结果数量
  debounceMs?: number;
  loading?: boolean;
  noResultsText?: string;
  size?: 'small' | 'medium' | 'large';
  filterOption?: (option: AutoCompleteOption, query: string) => boolean;
  renderOption?: (option: AutoCompleteOption, query: string) => React.ReactNode;
}

/**
 * AutoComplete组件 - 自动完成输入框
 * 展示异步数据处理、搜索过滤、虚拟滚动等高级特性
 */
const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>(
  ({
    label,
    error,
    helperText,
    required = false,
    disabled = false,
    className,
    id,
    options,
    value,
    defaultValue = '',
    onChange,
    onSearch,
    placeholder = '请输入进行搜索',
    minLength = 1,
    maxResults = 10,
    debounceMs = 300,
    loading = false,
    noResultsText = '无匹配结果',
    size = 'medium',
    filterOption,
    renderOption,
    ...props
  }, ref) => {
    const inputId = id || generateId('autocomplete');
    const [inputValue, setInputValue] = useState(value || defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<AutoCompleteOption[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);

    // 默认过滤函数
    const defaultFilterOption = useCallback((option: AutoCompleteOption, query: string): boolean => {
      return option.label.toLowerCase().includes(query.toLowerCase()) ||
             option.value.toLowerCase().includes(query.toLowerCase());
    }, []);

    // 默认选项渲染函数
    const defaultRenderOption = useCallback((option: AutoCompleteOption, query: string): React.ReactNode => {
      const highlightText = (text: string, highlight: string) => {
        if (!highlight) return text;
        
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, index) => 
          part.toLowerCase() === highlight.toLowerCase() ? 
            <mark key={index} className="bg-yellow-200">{part}</mark> : part
        );
      };

      return (
        <div className="flex items-center justify-between">
          <span>{highlightText(option.label, query)}</span>
          {option.meta && (
            <span className="text-sm text-gray-500">{option.meta}</span>
          )}
        </div>
      );
    }, []);

    // 搜索选项
    const searchOptions = useCallback(async (query: string) => {
      if (!query || query.length < minLength) {
        setFilteredOptions([]);
        return;
      }

      setIsLoading(true);
      onSearch?.(query);

      try {
        let results: AutoCompleteOption[] = [];

        if (typeof options === 'function') {
          // 异步获取选项
          results = await options(query);
        } else {
          // 本地过滤
          const filter = filterOption || defaultFilterOption;
          results = options.filter(option => filter(option, query));
        }

        // 限制结果数量
        if (maxResults > 0) {
          results = results.slice(0, maxResults);
        }

        setFilteredOptions(results);
      } catch (error) {
        console.error('搜索失败:', error);
        setFilteredOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, [options, minLength, maxResults, filterOption, defaultFilterOption, onSearch]);

    // 防抖搜索
    useEffect(() => {
      const handler = setTimeout(() => {
        searchOptions(inputValue);
      }, debounceMs);

      return () => clearTimeout(handler);
    }, [inputValue, searchOptions, debounceMs]);

    // 点击外部关闭
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // 键盘导航
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === 'ArrowDown') {
          setIsOpen(true);
          event.preventDefault();
        }
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.focus();
          break;
      }
    };

    // 处理选项选择
    const handleOptionSelect = (option: AutoCompleteOption) => {
      setInputValue(option.value);
      onChange?.(option.value, option);
      setIsOpen(false);
      setHighlightedIndex(-1);
    };

    // 处理输入变化
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInputValue(newValue);
      setIsOpen(true);
      setHighlightedIndex(-1);
    };

    const sizeClasses = {
      small: 'px-2 py-1 text-sm',
      medium: 'px-3 py-2 text-base',
      large: 'px-4 py-3 text-lg'
    };

    const hasError = Boolean(error);
    const showLoading = loading || isLoading;

    return (
      <div ref={containerRef} className="relative">
        <div className="form-field">
          {label && (
            <label htmlFor={inputId} className={cn(
              'block mb-1 font-medium',
              size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base',
              hasError ? 'text-red-700' : 'text-gray-700',
              disabled && 'text-gray-500'
            )}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          <div className="relative">
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={inputValue}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'w-full border rounded-md bg-white transition-colors duration-200 focus:outline-none',
                hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500',
                disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
                sizeClasses[size],
                className
              )}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (inputValue.length >= minLength) {
                  setIsOpen(true);
                }
              }}
              autoComplete="off"
              role="combobox"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-owns={`${inputId}-options`}
              aria-activedescendant={highlightedIndex >= 0 ? `${inputId}-option-${highlightedIndex}` : undefined}
              {...props}
            />
            
            {showLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-1 text-sm text-red-600">
              {error}
            </div>
          )}
          
          {helperText && !error && (
            <div className="mt-1 text-sm text-gray-500">
              {helperText}
            </div>
          )}
        </div>

        {/* 选项列表 */}
        {isOpen && (
          <div
            ref={optionsRef}
            id={`${inputId}-options`}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {showLoading ? '搜索中...' : noResultsText}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  id={`${inputId}-option-${index}`}
                  className={cn(
                    'px-3 py-2 cursor-pointer text-sm',
                    index === highlightedIndex ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100',
                    option.disabled && 'text-gray-400 cursor-not-allowed hover:bg-transparent'
                  )}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onClick={() => !option.disabled && handleOptionSelect(option)}
                  onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
                >
                  {renderOption ? renderOption(option, inputValue) : defaultRenderOption(option, inputValue)}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
);

AutoComplete.displayName = 'AutoComplete';

export default AutoComplete;
```

---

## 🎯 HOC组合示例

现在让我们看看如何将多个HOC组合使用，创建功能强大的组件：

```typescript
// src/components/index.ts - 更新导出文件
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';
import DatePicker from './DatePicker';
import AutoComplete from './AutoComplete';
import FormBuilder from './FormBuilder';

// 导入所有HOC
import withValidation from '../hocs/withValidation';
import withFormField from '../hocs/withFormField';
import withDebounce from '../hocs/withDebounce';
import withAsyncValidation from '../hocs/withAsyncValidation';
import withLocalStorage from '../hocs/withLocalStorage';
import withConditionalRender from '../hocs/withConditionalRender';

// 基础组件导出
export { 
  Input, 
  Select, 
  Textarea, 
  DatePicker, 
  AutoComplete, 
  FormBuilder 
};

// HOC导出
export { 
  withValidation, 
  withFormField, 
  withDebounce, 
  withAsyncValidation, 
  withLocalStorage, 
  withConditionalRender 
};

// 预制的单一增强组件
export const ValidatedInput = withValidation(Input);
export const ValidatedSelect = withValidation(Select);
export const ValidatedTextarea = withValidation(Textarea);
export const ValidatedDatePicker = withValidation(DatePicker);

export const FormFieldInput = withFormField(Input);
export const FormFieldSelect = withFormField(Select);
export const FormFieldTextarea = withFormField(Textarea);

export const DebouncedInput = withDebounce(Input);
export const DebouncedAutoComplete = withDebounce(AutoComplete);

// 多重HOC组合 - 展示组合的强大之处
export const EnhancedInput = withFormField(withValidation(Input));
export const EnhancedSelect = withFormField(withValidation(Select));
export const EnhancedTextarea = withFormField(withValidation(Textarea));

// 高级组合：防抖 + 验证 + 字段样式
export const SuperInput = withFormField(withValidation(withDebounce(Input)));

// 搜索专用：防抖 + 本地存储
export const SearchInput = withLocalStorage(withDebounce(Input));

// 异步验证组合
export const AsyncValidatedInput = withFormField(withAsyncValidation(Input));

// 条件渲染组合
export const ConditionalInput = withConditionalRender(withFormField(withValidation(Input)));

// 终极组合：所有功能集于一身
export const UltimateInput = withConditionalRender(
  withLocalStorage(
    withFormField(
      withAsyncValidation(
        withValidation(
          withDebounce(Input)
        )
      )
    )
  )
);
```

---

## 🚀 实战示例

### 完整的用户注册表单

```typescript
// examples/AdvancedRegistrationForm.tsx
import React, { useState } from 'react';
import {
  EnhancedInput,
  ValidatedDatePicker,
  DebouncedAutoComplete,
  AsyncValidatedInput,
  ConditionalInput,
  FormBuilder
} from '@leo-video/form-library';

const AdvancedRegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: null,
    country: '',
    city: '',
    userType: '',
    companyName: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});

  // 异步用户名验证
  const validateUsername = async (username: string): Promise<string | null> => {
    if (!username || username.length < 3) return null;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const existingUsers = ['admin', 'user123', 'testuser'];
    return existingUsers.includes(username.toLowerCase()) 
      ? '用户名已被使用，请选择其他用户名' 
      : null;
  };

  // 城市搜索
  const searchCities = async (query: string) => {
    if (!query || query.length < 2) return [];
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cities = [
      '北京市', '上海市', '广州市', '深圳市', '杭州市', 
      '南京市', '武汉市', '成都市', '西安市', '重庆市'
    ];
    
    return cities
      .filter(city => city.includes(query))
      .map(city => ({ value: city, label: city }));
  };

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('提交表单:', formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">用户注册</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息区块 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">基本信息</h2>
          
          {/* 异步验证用户名 */}
          <AsyncValidatedInput
            label="用户名"
            placeholder="请输入用户名（3-20个字符）"
            value={formData.username}
            onChange={(e) => updateFormData('username', e.target.value)}
            asyncValidationRule={{
              validator: validateUsername,
              debounceMs: 600
            }}
            validationRules={{
              required: '用户名不能为空',
              minLength: { value: 3, message: '用户名至少3个字符' },
              maxLength: { value: 20, message: '用户名最多20个字符' },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: '用户名只能包含字母、数字和下划线'
              }
            }}
            fieldSize="large"
          />

          {/* 增强邮箱输入 */}
          <EnhancedInput
            label="邮箱地址"
            type="email"
            placeholder="请输入邮箱地址"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            validationRules={{
              required: '邮箱不能为空',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: '请输入有效的邮箱地址'
              }
            }}
            fieldSize="large"
          />

          {/* 密码输入 */}
          <EnhancedInput
            label="密码"
            type="password"
            placeholder="请输入密码"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            validationRules={{
              required: '密码不能为空',
              minLength: { value: 8, message: '密码至少8个字符' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: '密码必须包含大小写字母和数字'
              }
            }}
            helperText="密码需包含大小写字母和数字，至少8个字符"
            fieldSize="large"
          />

          {/* 确认密码 */}
          <EnhancedInput
            label="确认密码"
            type="password"
            placeholder="请再次输入密码"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            validationRules={{
              required: '请确认密码',
              custom: (value) => 
                value === formData.password ? true : '两次输入的密码不一致'
            }}
            fieldSize="large"
          />
        </div>

        {/* 个人信息区块 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">个人信息</h2>
          
          {/* 生日选择器 */}
          <ValidatedDatePicker
            label="出生日期"
            value={formData.birthDate}
            onChange={(date) => updateFormData('birthDate', date)}
            maxDate={new Date()} // 不能选择未来日期
            minDate={new Date(1900, 0, 1)} // 最早1900年
            validationRules={{
              required: '请选择出生日期'
            }}
            showToday={false}
            size="large"
          />

          {/* 城市自动完成 */}
          <DebouncedAutoComplete
            label="所在城市"
            placeholder="输入城市名称进行搜索"
            options={searchCities}
            value={formData.city}
            onChange={(value) => updateFormData('city', value)}
            debounceMs={400}
            minLength={2}
            maxResults={8}
            size="large"
          />
        </div>

        {/* 用户类型选择 */}
        <EnhancedSelect
          label="用户类型"
          options={[
            { value: '', label: '请选择用户类型' },
            { value: 'personal', label: '个人用户' },
            { value: 'business', label: '企业用户' },
            { value: 'organization', label: '组织用户' }
          ]}
          value={formData.userType}
          onChange={(e) => updateFormData('userType', e.target.value)}
          validationRules={{
            required: '请选择用户类型'
          }}
          fieldSize="large"
        />

        {/* 条件显示的公司名称 */}
        <ConditionalInput
          label="公司名称"
          placeholder="请输入公司名称"
          condition={(values) => values.userType === 'business'}
          formValues={formData}
          value={formData.companyName}
          onChange={(e) => updateFormData('companyName', e.target.value)}
          validationRules={{
            required: '公司名称不能为空',
            minLength: { value: 2, message: '公司名称至少2个字符' }
          }}
          animateToggle={true}
          fieldSize="large"
        />

        {/* 个人简介 */}
        <EnhancedTextarea
          label="个人简介"
          placeholder="简单介绍一下自己..."
          value={formData.bio}
          onChange={(e) => updateFormData('bio', e.target.value)}
          minRows={3}
          maxRows={6}
          validationRules={{
            maxLength: { value: 500, message: '个人简介最多500个字符' }
          }}
          helperText={`${formData.bio.length}/500 字符`}
          fieldSize="large"
        />

        {/* 提交按钮 */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={() => setFormData({
              username: '', email: '', password: '', confirmPassword: '',
              birthDate: null, country: '', city: '', userType: '', 
              companyName: '', bio: ''
            })}
          >
            重置
          </button>
          
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            注册
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedRegistrationForm;
```

---

## 📋 总结

通过这些扩展，您的表单库将具备：

### 🎯 **核心特性**
- ✅ **防抖输入** - 性能优化的关键
- ✅ **异步验证** - 服务器端数据校验
- ✅ **本地存储** - 自动保存用户数据
- ✅ **条件渲染** - 动态表单逻辑
- ✅ **日期选择** - 完整的日期处理
- ✅ **自动完成** - 智能搜索体验

### 🧩 **设计模式运用**
- **HOC模式** - 功能组合和增强
- **forwardRef模式** - DOM访问和控制
- **Render Props模式** - 灵活的渲染逻辑
- **组合模式** - 构建复杂UI

### 🚀 **开发体验**
- **TypeScript支持** - 完整的类型安全
- **可组合性** - 灵活的功能组合
- **可扩展性** - 易于添加新功能
- **可测试性** - 单一职责便于测试

这套扩展方案不仅提供了实用的功能，更重要的是展示了现代React开发的最佳实践和设计思想。每个组件和HOC都可以独立使用，也可以自由组合，为您的项目提供最大的灵活性。

