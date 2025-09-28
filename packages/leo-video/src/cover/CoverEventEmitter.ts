// Cover事件发射器

import type { CoverEventType, CoverEventData } from '../types';

export class CoverEventEmitter {
  private listeners: Map<CoverEventType, Set<(data: CoverEventData) => void>> = new Map();
  private onceListeners: Map<CoverEventType, Set<(data: CoverEventData) => void>> = new Map();

  /**
   * 添加事件监听器
   */
  on(event: CoverEventType, listener: (data: CoverEventData) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  /**
   * 添加一次性事件监听器
   */
  once(event: CoverEventType, listener: (data: CoverEventData) => void): void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  off(event: CoverEventType, listener: (data: CoverEventData) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }

    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      onceListeners.delete(listener);
      if (onceListeners.size === 0) {
        this.onceListeners.delete(event);
      }
    }
  }

  /**
   * 发射事件
   */
  emit(event: CoverEventType, data: CoverEventData): void {
    // 执行普通监听器
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in cover event listener for ${event}:`, error);
        }
      });
    }

    // 执行一次性监听器并清理
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      const listenersToCall = Array.from(onceListeners);
      this.onceListeners.delete(event);
      
      listenersToCall.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in cover once event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: CoverEventType): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount(event: CoverEventType): number {
    const normalCount = this.listeners.get(event)?.size || 0;
    const onceCount = this.onceListeners.get(event)?.size || 0;
    return normalCount + onceCount;
  }

  /**
   * 获取所有事件类型
   */
  eventNames(): CoverEventType[] {
    const events = new Set<CoverEventType>();
    this.listeners.forEach((_, event) => events.add(event));
    this.onceListeners.forEach((_, event) => events.add(event));
    return Array.from(events);
  }
}
