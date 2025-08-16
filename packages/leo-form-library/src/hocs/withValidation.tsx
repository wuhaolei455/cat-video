import React, { useState, useCallback, ComponentType, forwardRef } from 'react';
import { WithValidationProps } from '../types';
import { validateField } from '../utils';

/**
 * 高阶组件 - 为表单组件添加验证功能
 * 这是HOC模式的经典应用
 */
function withValidation<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  const WithValidationComponent = forwardRef<any, P & WithValidationProps>(
    ({
      validationRules,
      validateOnChange = true,
      validateOnBlur = true,
      ...props
    }, ref) => {
      const [error, setError] = useState<string>('');
      const [touched, setTouched] = useState(false);

      // 验证函数
      const validate = useCallback((value: any) => {
        if (!validationRules) return;
        
        const errorMessage = validateField(value, validationRules);
        setError(errorMessage || '');
        return errorMessage;
      }, [validationRules]);

      // 处理值变化
      const handleChange = useCallback((event: any) => {
        const value = event?.target?.value ?? event;
        
        if (validateOnChange && touched) {
          validate(value);
        }
        
        // 调用原始的onChange
        if ('onChange' in props && typeof (props as any).onChange === 'function') {
          (props as any).onChange(event);
        }
      }, [validate, validateOnChange, touched, props]);

      // 处理失焦事件
      const handleBlur = useCallback((event: any) => {
        setTouched(true);
        
        if (validateOnBlur) {
          const value = event?.target?.value;
          validate(value);
        }
        
        // 调用原始的onBlur
        if ('onBlur' in props && typeof (props as any).onBlur === 'function') {
          (props as any).onBlur(event);
        }
      }, [validate, validateOnBlur, props]);

      // 合并props
      const enhancedProps = {
        ...props,
        error: error || (props as any).error,
        onChange: handleChange,
        onBlur: handleBlur,
        ref
      } as P;

      return <WrappedComponent {...enhancedProps} />;
    }
  );

  WithValidationComponent.displayName = `withValidation(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithValidationComponent;
}

export default withValidation;
