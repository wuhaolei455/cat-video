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
      ...restProps
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
        if ('onChange' in restProps && typeof (restProps as any).onChange === 'function') {
          (restProps as any).onChange(event);
        }
      }, [validate, validateOnChange, touched, restProps]);

      // 处理失焦事件
      const handleBlur = useCallback((event: any) => {
        setTouched(true);
        
        if (validateOnBlur) {
          const value = event?.target?.value;
          validate(value);
        }
        
        // 调用原始的onBlur
        if ('onBlur' in restProps && typeof (restProps as any).onBlur === 'function') {
          (restProps as any).onBlur(event);
        }
      }, [validate, validateOnBlur, restProps]);

      // 只传递原始组件需要的属性，排除 HOC 的配置参数
      const enhancedProps = {
        ...restProps,
        error: error || (restProps as any).error,
        onChange: handleChange,
        onBlur: handleBlur,
      } as P;

      return <WrappedComponent {...enhancedProps} ref={ref} />;
    }
  );

  WithValidationComponent.displayName = `withValidation(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithValidationComponent;
}

export default withValidation;
