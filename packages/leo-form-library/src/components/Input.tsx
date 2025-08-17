import React, { forwardRef, useId } from 'react';
import { InputProps } from '../types';
import { cn } from '../utils';

/**
 * Input组件 - 使用forwardRef模式
 * 支持多种变体、尺寸和装饰器
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    required = false,
    disabled = false,
    className,
    id,
    variant = 'outlined',
    size = 'medium',
    startAdornment,
    endAdornment,
    ...props
  }, ref) => {
    const reactId = useId();
    const inputId = id || `input-${reactId}`;
    const hasError = Boolean(error);

    const baseClasses = 'w-full transition-colors duration-200 focus:outline-none';
    
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

    const inputClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    return (
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
          {startAdornment && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {startAdornment}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputClasses,
              !!startAdornment ? 'pl-10' : undefined,
              !!endAdornment ? 'pr-10' : undefined
            )}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...(({ label, error, helperText, required, variant, size, startAdornment, endAdornment, ...rest }) => rest)(props as any)}
          />
          
          {endAdornment && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {endAdornment}
            </div>
          )}
        </div>
        
        {error && (
          <div id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </div>
        )}
        
        {helperText && !error && (
          <div id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
