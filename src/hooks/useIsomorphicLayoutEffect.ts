import { useEffect, useLayoutEffect } from 'react';

// 解决 SSR 环境下 useLayoutEffect 警告的 Hook
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
