import React, { ComponentType, forwardRef } from 'react';
import { cn } from '../utils';

// 表单字段增强的属性
export interface WithFormFieldProps {
  containerClassName?: string;
  showLabel?: boolean;
  showError?: boolean;
  showHelperText?: boolean;
  fieldSize?: 'small' | 'medium' | 'large';
}

/**
 * 高阶组件 - 为组件添加统一的表单字段样式和布局
 * 这是另一个HOC模式的应用，专注于UI增强
 */
function withFormField<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  const WithFormFieldComponent = forwardRef<any, P & WithFormFieldProps>(
    ({
      containerClassName,
      showLabel = true,
      showError = true,
      showHelperText = true,
      fieldSize = 'medium',
      ...props
    }, ref) => {
      
      const containerClasses = cn(
        'form-field-container',
        fieldSize === 'small' ? 'mb-3' : fieldSize === 'large' ? 'mb-6' : 'mb-4',
        containerClassName
      );

      // 为子组件添加尺寸属性
      const enhancedProps = {
        ...props,
        size: fieldSize,
        ref
      } as P;

      return (
        <div className={containerClasses}>
          <WrappedComponent {...enhancedProps} />
          
          {/* 可以在这里添加额外的装饰或功能 */}
          {fieldSize === 'large' && (
            <div className="field-decoration absolute top-0 right-0 w-1 h-full bg-blue-500 opacity-20 rounded-r" />
          )}
        </div>
      );
    }
  );

  WithFormFieldComponent.displayName = `withFormField(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithFormFieldComponent;
}

export default withFormField;
