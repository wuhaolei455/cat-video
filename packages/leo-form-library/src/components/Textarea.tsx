import React, { forwardRef } from 'react';
import { TextareaProps } from '../types';
import { generateId, cn } from '../utils';

/**
 * Textarea组件 - 使用forwardRef模式
 * 支持自动调整高度和多种样式变体
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
    minRows = 3,
    maxRows = 8,
    ...props
  }, ref) => {
    const textareaId = id || generateId('textarea');
    const hasError = Boolean(error);

    const baseClasses = 'w-full transition-colors duration-200 focus:outline-none resize-vertical';
    
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

    const textareaClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    // 计算行高样式
    const rowStyles = {
      minHeight: `${minRows * 1.5}em`,
      maxHeight: `${maxRows * 1.5}em`
    };

    return (
      <div className="form-field">
        {label && (
          <label htmlFor={textareaId} className={cn(
            'block mb-1 font-medium',
            size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base',
            hasError ? 'text-red-700' : 'text-gray-700',
            disabled && 'text-gray-500'
          )}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          style={rowStyles}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...(({ label, error, helperText, required, variant, size, minRows, maxRows, ...rest }) => rest)(props as any)}
        />
        
        {error && (
          <div id={`${textareaId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </div>
        )}
        
        {helperText && !error && (
          <div id={`${textareaId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
