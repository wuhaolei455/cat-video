import { useState, useEffect } from 'react';

/**
 * 用于处理 SSR 水合问题的 Hook
 * 在服务端返回 false，在客户端返回 true
 * 避免服务端和客户端渲染不一致
 */
export function useClientOnly(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

export default useClientOnly;
