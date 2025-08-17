import { ComponentType, forwardRef, useCallback, useRef, useEffect } from "react";

export interface WithDebounceProps {
  debounceTime?: number;
  immediate?: boolean; // 是否立即执行第一次调用
  onDebouncedChange?: (value: any) => void; // 防抖后的回调
}

export default function withDebounce<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  const WithDebounceComponent = forwardRef<any, P & WithDebounceProps>(
    (props, ref) => {
      const { debounceTime = 300, immediate = false, onDebouncedChange, ...restProps } = props;
      const timerRef = useRef<NodeJS.Timeout | null>(null);
      const isFirstCallRef = useRef(true);
      const originalOnChangeRef = useRef<Function | null>(null);

      // 保存原始的 onChange 函数引用
      originalOnChangeRef.current = 'onChange' in restProps && typeof (restProps as any).onChange === 'function'
        ? (restProps as any).onChange
        : null;

      // 清理定时器
      const cleanup = useCallback(() => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }, []);

      // 组件卸载时清理定时器
      useEffect(() => {
        return cleanup;
      }, [cleanup]);

      // 防抖处理函数
      const handleChange = useCallback((event: any) => {
        const originalOnChange = originalOnChangeRef.current;
        const value = event?.target?.value ?? event;

        // 总是立即调用原始的 onChange（保持组件状态实时更新）
        if (originalOnChange) {
          originalOnChange(event);
        }

        // 清除之前的定时器
        cleanup();

        // 立即执行模式：第一次调用时立即执行防抖回调
        if (immediate && isFirstCallRef.current && onDebouncedChange) {
          onDebouncedChange(value);
          isFirstCallRef.current = false;
          return; // 立即执行后不设置定时器
        }

        // 防抖执行：延迟执行防抖回调
        if (onDebouncedChange) {
          timerRef.current = setTimeout(() => {
            onDebouncedChange(value);
            timerRef.current = null;
            
            // 重置 immediate 标记，为下一轮做准备
            if (immediate) {
              isFirstCallRef.current = true;
            }
          }, debounceTime);
        }
      }, [debounceTime, immediate, cleanup, onDebouncedChange]);

      // 重置 immediate 标记当 debounceTime 或 immediate 改变时
      useEffect(() => {
        isFirstCallRef.current = true;
      }, [debounceTime, immediate]);

      // 只传递原始组件需要的参数，排除 HOC 的配置参数
      const enhancedProps = {
        ...restProps,
        onChange: handleChange, // 总是提供 handleChange，即使原始组件没有 onChange
      } as P;

      return <WrappedComponent {...enhancedProps} ref={ref} />;
    }
  );

  WithDebounceComponent.displayName = `withDebounce(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;
  
  return WithDebounceComponent;
}
