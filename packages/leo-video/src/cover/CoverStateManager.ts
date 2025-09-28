// Cover状态管理器

import type {
  ICoverStateManager,
  CoverState,
  CoverType
} from '../types';

// 状态监听器类型
type StateListener = (state: CoverState) => void;
type AllStatesListener = (states: Record<string, CoverState>) => void;

// 状态存储接口
interface StateStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// 默认的本地存储实现
class LocalStateStorage implements StateStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch {
      // 忽略存储错误
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch {
      // 忽略移除错误
    }
  }
}

export class CoverStateManager implements ICoverStateManager {
  private _states: Map<string, CoverState> = new Map();
  private _listeners: Map<string, Set<StateListener>> = new Map();
  private _allListeners: Set<AllStatesListener> = new Set();
  private _storage: StateStorage;
  private _storagePrefix: string;
  private _autoSave: boolean;
  private _saveTimer: number | null = null;
  
  constructor(options: {
    storage?: StateStorage;
    storagePrefix?: string;
    autoSave?: boolean;
    autoSaveInterval?: number;
  } = {}) {
    this._storage = options.storage || new LocalStateStorage();
    this._storagePrefix = options.storagePrefix || 'cover-state-';
    this._autoSave = options.autoSave !== false;
    
    // 设置自动保存定时器
    if (this._autoSave && options.autoSaveInterval) {
      this._saveTimer = window.setInterval(() => {
        this.saveAllStates();
      }, options.autoSaveInterval);
    }
  }

  // ============ 状态获取方法 ============

  getCoverState(coverId: string): CoverState | undefined {
    return this._states.get(coverId);
  }

  getAllCoverStates(): Record<string, CoverState> {
    const states: Record<string, CoverState> = {};
    this._states.forEach((state, coverId) => {
      states[coverId] = { ...state };
    });
    return states;
  }

  // ============ 状态更新方法 ============

  updateCoverState(coverId: string, update: Partial<CoverState>): void {
    const currentState = this._states.get(coverId);
    
    if (!currentState) {
      // 如果状态不存在，创建默认状态
      const newState: CoverState = {
        visible: false,
        disabled: false,
        loading: false,
        error: null,
        data: {},
        ...update
      };
      this._states.set(coverId, newState);
    } else {
      // 更新现有状态
      const newState: CoverState = {
        ...currentState,
        ...update,
        // 合并数据对象
        data: {
          ...currentState.data,
          ...(update.data || {})
        }
      };
      this._states.set(coverId, newState);
    }

    // 通知监听器
    this.notifyStateChange(coverId);
    this.notifyAllStatesChange();

    // 触发自动保存
    if (this._autoSave) {
      this.saveState(coverId);
    }
  }

  batchUpdateStates(updates: Record<string, Partial<CoverState>>): void {
    const updatedCoverIds: string[] = [];

    // 批量更新状态
    Object.entries(updates).forEach(([coverId, update]) => {
      const currentState = this._states.get(coverId);
      
      if (!currentState) {
        const newState: CoverState = {
          visible: false,
          disabled: false,
          loading: false,
          error: null,
          data: {},
          ...update
        };
        this._states.set(coverId, newState);
      } else {
        const newState: CoverState = {
          ...currentState,
          ...update,
          data: {
            ...currentState.data,
            ...(update.data || {})
          }
        };
        this._states.set(coverId, newState);
      }
      
      updatedCoverIds.push(coverId);
    });

    // 批量通知监听器
    updatedCoverIds.forEach(coverId => {
      this.notifyStateChange(coverId);
    });
    this.notifyAllStatesChange();

    // 触发自动保存
    if (this._autoSave) {
      this.saveAllStates();
    }
  }

  // ============ 状态监听方法 ============

  subscribe(coverId: string, listener: StateListener): () => void {
    if (!this._listeners.has(coverId)) {
      this._listeners.set(coverId, new Set());
    }
    
    this._listeners.get(coverId)!.add(listener);
    
    // 立即触发一次回调，提供当前状态
    const currentState = this._states.get(coverId);
    if (currentState) {
      try {
        listener({ ...currentState });
      } catch (error) {
        console.error(`Error in cover state listener for ${coverId}:`, error);
      }
    }

    // 返回取消订阅函数
    return () => {
      const listeners = this._listeners.get(coverId);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this._listeners.delete(coverId);
        }
      }
    };
  }

  subscribeAll(listener: AllStatesListener): () => void {
    this._allListeners.add(listener);
    
    // 立即触发一次回调，提供当前所有状态
    try {
      listener(this.getAllCoverStates());
    } catch (error) {
      console.error('Error in all states listener:', error);
    }

    // 返回取消订阅函数
    return () => {
      this._allListeners.delete(listener);
    };
  }

  // ============ 状态持久化方法 ============

  async saveState(coverId?: string): Promise<void> {
    try {
      if (coverId) {
        const state = this._states.get(coverId);
        if (state) {
          const key = this._storagePrefix + coverId;
          await this._storage.setItem(key, JSON.stringify(state));
        }
      } else {
        await this.saveAllStates();
      }
    } catch (error) {
      console.warn('Failed to save cover state:', error);
    }
  }

  async loadState(coverId?: string): Promise<void> {
    try {
      if (coverId) {
        const key = this._storagePrefix + coverId;
        const stateJson = await this._storage.getItem(key);
        
        if (stateJson) {
          const state = JSON.parse(stateJson) as CoverState;
          this._states.set(coverId, state);
          this.notifyStateChange(coverId);
        }
      } else {
        await this.loadAllStates();
      }
    } catch (error) {
      console.warn('Failed to load cover state:', error);
    }
  }

  async clearState(coverId?: string): Promise<void> {
    try {
      if (coverId) {
        const key = this._storagePrefix + coverId;
        await this._storage.removeItem(key);
        this._states.delete(coverId);
        this.notifyStateChange(coverId);
      } else {
        await this.clearAllStates();
      }
    } catch (error) {
      console.warn('Failed to clear cover state:', error);
    }
    
    this.notifyAllStatesChange();
  }

  // ============ 高级功能方法 ============

  /**
   * 初始化Cover状态
   */
  initializeCoverState(
    coverId: string, 
    coverType: CoverType,
    initialState?: Partial<CoverState>
  ): void {
    if (this._states.has(coverId)) {
      return; // 已存在，不重复初始化
    }

    // 根据Cover类型设置默认状态
    const defaultState = this.getDefaultStateForCoverType(coverType);
    
    const state: CoverState = {
      ...defaultState,
      ...initialState
    };

    this._states.set(coverId, state);
    this.notifyStateChange(coverId);
    this.notifyAllStatesChange();
  }

  /**
   * 重置Cover状态到默认值
   */
  resetCoverState(coverId: string, coverType: CoverType): void {
    const defaultState = this.getDefaultStateForCoverType(coverType);
    this._states.set(coverId, defaultState);
    this.notifyStateChange(coverId);
    this.notifyAllStatesChange();
  }

  /**
   * 获取Cover状态的快照
   */
  createSnapshot(): Record<string, CoverState> {
    return this.getAllCoverStates();
  }

  /**
   * 从快照恢复状态
   */
  restoreFromSnapshot(snapshot: Record<string, CoverState>): void {
    this._states.clear();
    
    Object.entries(snapshot).forEach(([coverId, state]) => {
      this._states.set(coverId, { ...state });
    });
    
    // 通知所有监听器
    this._states.forEach((_, coverId) => {
      this.notifyStateChange(coverId);
    });
    this.notifyAllStatesChange();
  }

  /**
   * 过滤状态
   */
  filterStates(predicate: (coverId: string, state: CoverState) => boolean): Record<string, CoverState> {
    const filtered: Record<string, CoverState> = {};
    
    this._states.forEach((state, coverId) => {
      if (predicate(coverId, state)) {
        filtered[coverId] = { ...state };
      }
    });
    
    return filtered;
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    // 清理定时器
    if (this._saveTimer) {
      clearInterval(this._saveTimer);
      this._saveTimer = null;
    }

    // 清理所有监听器
    this._listeners.clear();
    this._allListeners.clear();
    
    // 清理状态
    this._states.clear();
  }

  // ============ 私有方法 ============

  private notifyStateChange(coverId: string): void {
    const listeners = this._listeners.get(coverId);
    const state = this._states.get(coverId);
    
    if (listeners && state) {
      const stateCopy = { ...state };
      listeners.forEach(listener => {
        try {
          listener(stateCopy);
        } catch (error) {
          console.error(`Error in cover state listener for ${coverId}:`, error);
        }
      });
    }
  }

  private notifyAllStatesChange(): void {
    if (this._allListeners.size === 0) return;
    
    const allStates = this.getAllCoverStates();
    this._allListeners.forEach(listener => {
      try {
        listener(allStates);
      } catch (error) {
        console.error('Error in all states listener:', error);
      }
    });
  }

  private getDefaultStateForCoverType(coverType: CoverType): CoverState {
    // 根据Cover类型返回默认状态
    const defaults: Partial<Record<CoverType, Partial<CoverState>>> = {
      'play-button': {
        visible: false,
        disabled: false,
        loading: false,
        error: null,
        data: { paused: true }
      },
      'loading-spinner': {
        visible: false,
        disabled: false,
        loading: true,
        error: null,
        data: { progress: 0 }
      },
      'error-message': {
        visible: false,
        disabled: false,
        loading: false,
        error: null,
        data: { retryable: true }
      },
      'advertisement': {
        visible: false,
        disabled: false,
        loading: false,
        error: null,
        data: { 
          remainingTime: 0,
          skippable: false,
          clicked: false
        }
      },
      'danmu': {
        visible: false,
        disabled: false,
        loading: false,
        error: null,
        data: {
          messages: [],
          opacity: 0.8,
          speed: 'normal'
        }
      }
    };

    const typeDefault = defaults[coverType] || {};
    
    return {
      visible: false,
      disabled: false,
      loading: false,
      error: null,
      data: {},
      ...typeDefault
    };
  }

  private async saveAllStates(): Promise<void> {
    const savePromises: Promise<void>[] = [];
    
    this._states.forEach((state, coverId) => {
      const key = this._storagePrefix + coverId;
      const promise = this._storage.setItem(key, JSON.stringify(state));
      savePromises.push(promise);
    });
    
    try {
      await Promise.all(savePromises);
    } catch (error) {
      console.warn('Failed to save some cover states:', error);
    }
  }

  private async loadAllStates(): Promise<void> {
    // 由于我们无法轻易枚举localStorage中的所有key，
    // 这里需要外部提供要加载的coverId列表
    console.warn('loadAllStates() needs a list of cover IDs to load. Use loadState(coverId) for individual covers.');
  }

  private async clearAllStates(): Promise<void> {
    const clearPromises: Promise<void>[] = [];
    
    this._states.forEach((_, coverId) => {
      const key = this._storagePrefix + coverId;
      const promise = this._storage.removeItem(key);
      clearPromises.push(promise);
    });
    
    try {
      await Promise.all(clearPromises);
      this._states.clear();
    } catch (error) {
      console.warn('Failed to clear some cover states:', error);
    }
  }
}

// 全局状态管理器单例
export class GlobalCoverStateManager {
  private static _instance: CoverStateManager | null = null;
  
  static getInstance(options?: {
    storage?: StateStorage;
    storagePrefix?: string;
    autoSave?: boolean;
    autoSaveInterval?: number;
  }): CoverStateManager {
    if (!this._instance) {
      this._instance = new CoverStateManager(options);
    }
    return this._instance;
  }
  
  static destroyInstance(): void {
    if (this._instance) {
      this._instance.destroy();
      this._instance = null;
    }
  }
}

// 专门用于业务Cover的状态管理器
export class BusinessCoverStateManager extends CoverStateManager {
  private _businessLogicHandlers: Map<string, (state: CoverState) => void> = new Map();
  
  constructor(options: {
    storage?: StateStorage;
    storagePrefix?: string;
    autoSave?: boolean;
    autoSaveInterval?: number;
  } = {}) {
    super({
      ...options,
      storagePrefix: options.storagePrefix || 'business-cover-state-'
    });
  }

  /**
   * 注册业务逻辑处理器
   */
  registerBusinessHandler(
    coverId: string,
    handler: (state: CoverState) => void
  ): void {
    this._businessLogicHandlers.set(coverId, handler);
    
    // 订阅状态变化并触发业务逻辑
    this.subscribe(coverId, (state) => {
      const businessHandler = this._businessLogicHandlers.get(coverId);
      if (businessHandler) {
        try {
          businessHandler(state);
        } catch (error) {
          console.error(`Error in business logic handler for ${coverId}:`, error);
        }
      }
    });
  }

  /**
   * 取消注册业务逻辑处理器
   */
  unregisterBusinessHandler(coverId: string): void {
    this._businessLogicHandlers.delete(coverId);
  }

  destroy(): void {
    this._businessLogicHandlers.clear();
    super.destroy();
  }
}
