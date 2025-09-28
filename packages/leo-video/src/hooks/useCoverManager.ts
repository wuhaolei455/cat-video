// React Hook for Cover管理器

import { useRef, useEffect, useCallback, useReducer, useMemo, useState } from 'react';
import { CoverManager, createCoverPresetFactory } from '../cover';
import type {
  ICoverManager,
  CoverManagerConfig,
  CoverConfig,
  CoverEventType,
  CoverEventData,
  CoverContainerState,
  ICover,
  VideoEventType
} from '../types';

export interface UseCoverManagerOptions {
  config: CoverManagerConfig;
  autoInit?: boolean;
  onCoverEvent?: (type: CoverEventType, data: CoverEventData) => void;
  onError?: (error: Error) => void;
}

export interface UseCoverManagerReturn {
  manager: ICoverManager | null;
  state: CoverContainerState | null;
  isInitialized: boolean;
  error: string | null;

  // 管理方法
  addCover: (config: CoverConfig) => ICover | null;
  removeCover: (id: string) => boolean;
  getCover: (id: string) => ICover | undefined;

  // 状态控制
  showCover: (id: string) => void;
  hideCover: (id: string) => void;
  enableCover: (id: string) => void;
  disableCover: (id: string) => void;

  // 批量操作
  showCoversByType: (type: import('../types').CoverType) => void;
  hideCoversByType: (type: import('../types').CoverType) => void;

  // 事件处理
  handleVideoEvent: (eventType: VideoEventType, eventData: any) => void;

  // 生命周期
  initialize: (container: HTMLElement) => Promise<void>;
  destroy: () => Promise<void>;
}

export function useCoverManager({
  config,
  autoInit = true,
  onCoverEvent,
  onError
}: UseCoverManagerOptions): UseCoverManagerReturn {
  
  const managerRef = useRef<ICoverManager | null>(null);
  const [state, dispatchState] = useReducer(
    (_: CoverContainerState | null, next: CoverContainerState | null) => next,
    null
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncState = useCallback(() => {
    dispatchState(managerRef.current ? managerRef.current.state : null);
  }, []);

  // 创建Cover管理器
  useEffect(() => {
    try {
      const manager = new CoverManager(config);
      managerRef.current = manager;
      
      const coverEventTypes: CoverEventType[] = [
        'cover:show', 'cover:hide', 'cover:click', 'cover:hover',
        'cover:focus', 'cover:blur', 'cover:mount', 'cover:unmount',
        'cover:update', 'cover:error'
      ];

      const listeners = coverEventTypes.map(eventType => {
        const handler = (data: CoverEventData) => {
          onCoverEvent?.(eventType, data);
          syncState();
        };
        manager.on(eventType, handler);
        return () => manager.off(eventType, handler);
      });

      syncState();

      return () => {
        listeners.forEach(cleanup => cleanup());
        manager.destroy();
        managerRef.current = null;
        dispatchState(null);
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create cover manager';
      dispatchState(null);
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    }
  }, [config, onCoverEvent, onError, syncState]);

  // Cover管理方法
  const addCover = useCallback((config: CoverConfig): ICover | null => {
    if (!managerRef.current) {
      setError('Cover manager not initialized');
      return null;
    }
    
    try {
      const cover = managerRef.current.addCover(config);
      syncState();
      return cover;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add cover';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
      return null;
    }
  }, [onError, syncState]);

  const removeCover = useCallback((id: string): boolean => {
    if (!managerRef.current) {
      setError('Cover manager not initialized');
      return false;
    }
    
    const result = managerRef.current.removeCover(id);
    syncState();
    return result;
  }, [syncState]);

  const getCover = useCallback((id: string): ICover | undefined => {
    if (!managerRef.current) {
      return undefined;
    }
    
    return managerRef.current.getCover(id);
  }, []);

  // 状态控制方法
  const showCover = useCallback((id: string): void => {
    if (managerRef.current) {
      managerRef.current.showCover(id);
      syncState();
    }
  }, [syncState]);

  const hideCover = useCallback((id: string): void => {
    if (managerRef.current) {
      managerRef.current.hideCover(id);
      syncState();
    }
  }, [syncState]);

  const enableCover = useCallback((id: string): void => {
    if (managerRef.current) {
      managerRef.current.enableCover(id);
      syncState();
    }
  }, [syncState]);

  const disableCover = useCallback((id: string): void => {
    if (managerRef.current) {
      managerRef.current.disableCover(id);
      syncState();
    }
  }, [syncState]);

  // 批量操作方法
  const showCoversByType = useCallback((type: import('../types').CoverType): void => {
    if (managerRef.current) {
      managerRef.current.showCoversByType(type);
      syncState();
    }
  }, [syncState]);

  const hideCoversByType = useCallback((type: import('../types').CoverType): void => {
    if (managerRef.current) {
      managerRef.current.hideCoversByType(type);
      syncState();
    }
  }, [syncState]);

  // 视频事件处理
  const handleVideoEvent = useCallback((eventType: VideoEventType, eventData: any): void => {
    if (managerRef.current) {
      (managerRef.current as any).handleVideoEvent?.(eventType, eventData);
      syncState();
    }
  }, [syncState]);

  // 生命周期方法
  const initialize = useCallback(async (container: HTMLElement): Promise<void> => {
    if (!managerRef.current) {
      throw new Error('Cover manager not created');
    }
    
    try {
      await managerRef.current.initialize(container);
      setIsInitialized(true);
      syncState();
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize cover manager';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
      throw err;
    }
  }, [onError, syncState]);

  const destroy = useCallback(async (): Promise<void> => {
    if (managerRef.current) {
      await managerRef.current.destroy();
      setIsInitialized(false);
      dispatchState(null);
      setError(null);
    }
  }, []);

  const managerInstance = managerRef.current;

  return useMemo(() => ({
    manager: managerInstance,
    state,
    isInitialized,
    error,

    addCover,
    removeCover,
    getCover,

    showCover,
    hideCover,
    enableCover,
    disableCover,

    showCoversByType,
    hideCoversByType,

    handleVideoEvent,

    initialize,
    destroy
  }), [
    managerInstance,
    state,
    isInitialized,
    error,
    addCover,
    removeCover,
    getCover,
    showCover,
    hideCover,
    enableCover,
    disableCover,
    showCoversByType,
    hideCoversByType,
    handleVideoEvent,
    initialize,
    destroy
  ]);
}

// 便捷Hook，使用预设配置
export interface UseDefaultCoverManagerOptions {
  enableCommonCovers?: boolean;
  enableBusinessCovers?: boolean;
  customCovers?: CoverConfig[];
  responsive?: boolean;
  onCoverEvent?: (type: CoverEventType, data: CoverEventData) => void;
  onError?: (error: Error) => void;
}

export function useDefaultCoverManager({
  enableCommonCovers = true,
  enableBusinessCovers = false,
  customCovers = [],
  responsive = true,
  onCoverEvent,
  onError
}: UseDefaultCoverManagerOptions = {}): UseCoverManagerReturn {
  
  const config = useRef<CoverManagerConfig>({
    commonCovers: [],
    businessCovers: [],
    responsive: responsive ? {
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1920
      },
      coverConfigs: {
        mobile: [],
        tablet: [],
        desktop: []
      }
    } : undefined
  });

  // 根据选项生成配置
  useEffect(() => {
    const factory = createCoverPresetFactory();
    
    const newConfig: CoverManagerConfig = {
      ...config.current
    };

    if (enableCommonCovers) {
      newConfig.commonCovers = factory.createDefaultCommonCovers();
    } else {
      newConfig.commonCovers = [];
    }

    if (enableBusinessCovers) {
      newConfig.businessCovers = factory.createDefaultBusinessCovers();
    } else {
      newConfig.businessCovers = [];
    }

    // 添加自定义Cover
    newConfig.businessCovers.push(...customCovers.filter(cover => 
      cover.type !== 'play-button' && 
      cover.type !== 'progress-bar' && 
      cover.type !== 'volume-control' &&
      cover.type !== 'fullscreen-button' &&
      cover.type !== 'loading-spinner' &&
      cover.type !== 'error-message' &&
      cover.type !== 'quality-selector'
    ) as any[]);

    config.current = newConfig;
  }, [enableCommonCovers, enableBusinessCovers, customCovers]);

  return useCoverManager({
    config: config.current,
    onCoverEvent,
    onError
  });
}
