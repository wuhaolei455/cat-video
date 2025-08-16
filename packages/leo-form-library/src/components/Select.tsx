import React, { forwardRef } from 'react';
import { SelectProps } from '../types';
import { generateId, cn } from '../utils';

/**
 * Select组件 - 使用forwardRef模式
 * 支持多种变体、尺寸和选项配置
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    label,
    error,
    helperText,
    required = false,
    disabled = false,
    className,
    id,
    options,
    placeholder,
    variant = 'outlined',
    size = 'medium',
    ...props
  }, ref) => {
    const selectId = id || generateId('select');
    const hasError = Boolean(error);

    const baseClasses = 'w-full transition-colors duration-200 focus:outline-none cursor-pointer';
    
    const variantClasses = {
      outlined: cn(
        'border rounded-md bg-white',
        hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500',
        disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
      ),
      filled: cn(
        'border-0 border-b-2 bg-gray-100 rounded-t-md',
        hasError ? 'border-b-red-500 focus:border-b-red-500' : 'border-b-gray-300 focus:border-b-blue-500',
        disabled && 'bg-gray-200 text-gray-500 cursor-not-allowed'
      ),
      standard: cn(
        'border-0 border-b bg-transparent',
        hasError ? 'border-b-red-500 focus:border-b-red-500' : 'border-b-gray-300 focus:border-b-blue-500',
        disabled && 'text-gray-500 cursor-not-allowed'
      )
    };

    const sizeClasses = {
      small: 'px-2 py-1 text-sm',
      medium: 'px-3 py-2 text-base',
      large: 'px-4 py-3 text-lg'
    };

    const selectClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    return (
      <div className="form-field">
        {label && (
          <label htmlFor={selectId} className={cn(
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
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            {...(({ label, error, helperText, required, options, placeholder, variant, size, ...rest }) => rest)(props as any)}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {/* 自定义下拉箭头 */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className={cn(
                'w-4 h-4',
                hasError ? 'text-red-500' : 'text-gray-400',
                disabled && 'text-gray-300'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {error && (
          <div id={`${selectId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </div>
        )}
        
        {helperText && !error && (
          <div id={`${selectId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
