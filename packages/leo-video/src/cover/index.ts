// Cover模块索引文件

// 导出类型定义
export type {
  CoverType,
  CoverVisibility,
  CoverLayer,
  CoverPosition,
  CoverAnimation,
  CoverEventType,
  CoverEventData,
  CoverState,
  CoverConfig,
  CommonCoverConfig,
  BusinessCoverConfig,
  CoverManagerConfig,
  CoverContainerState,
  ICover,
  ICoverBusinessLogic,
  ICoverManager,
  ICoverPresetFactory,
  ICoverStateManager
} from '../types';

// 导出核心类
export { CoverEventEmitter } from './CoverEventEmitter';
export { BaseCover } from './BaseCover';
export { CoverManager } from './CoverManager';
export { CoverPresetFactory } from './CoverPresetFactory';
export { 
  CoverStateManager, 
  GlobalCoverStateManager,
  BusinessCoverStateManager 
} from './CoverStateManager';

// 导入类型和类
import type { CoverManagerConfig } from '../types';
import { CoverManager } from './CoverManager';
import { CoverPresetFactory } from './CoverPresetFactory';
import { CoverStateManager } from './CoverStateManager';

// 创建工厂函数的便捷导出
export const createCoverManager = (config: CoverManagerConfig) => {
  return new CoverManager(config);
};

export const createCoverPresetFactory = () => {
  return new CoverPresetFactory();
};

export const createCoverStateManager = (options?: {
  storagePrefix?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
}) => {
  return new CoverStateManager(options);
};

// 默认导出Cover管理器
export { CoverManager as default } from './CoverManager';
