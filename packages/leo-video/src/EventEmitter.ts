// 泛型事件发射器 - 支持类型安全的事件系统

import type { 
  VideoEventType, 
  VideoEventListener, 
  VideoEventData,
  VideoEventListeners,
  VideoEventMap,
  VideoEventName
} from './types';

// 泛型事件发射器类
export class VideoEventEmitter<TEventMap extends Record<string, any> = VideoEventMap> {
  private eventListeners: Map<keyof TEventMap, Set<Function>> = new Map();
  private onceListeners: Map<keyof TEventMap, Set<Function>> = new Map();
  private maxListeners: number = 10;

  /**
   * 添加事件监听器
   */
  on<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    const eventListeners = this.eventListeners.get(event)!;
    
    // 检查监听器数量限制
    if (eventListeners.size >= this.maxListeners) {
      console.warn(`Maximum listeners (${this.maxListeners}) exceeded for event '${String(event)}'`);
    }
    
    eventListeners.add(listener);
    return this;
  }

  /**
   * 添加一次性事件监听器
   */
  once<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    
    this.onceListeners.get(event)!.add(listener);
    return this;
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof TEventMap>(
    event: K,
    listener: (data: TEventMap[K]) => void
  ): this {
    const eventListeners = this.eventListeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }
    
    const onceEventListeners = this.onceListeners.get(event);
    if (onceEventListeners) {
      onceEventListeners.delete(listener);
      if (onceEventListeners.size === 0) {
        this.onceListeners.delete(event);
      }
    }
    
    return this;
  }

  /**
   * 移除指定事件的所有监听器
   */
  removeAllListeners<K extends keyof TEventMap>(event?: K): this {
    if (event) {
      this.eventListeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.eventListeners.clear();
      this.onceListeners.clear();
    }
    return this;
  }

  /**
   * 发射事件
   */
  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): boolean {
    let hasListeners = false;

    // 触发普通监听器
    const eventListeners = this.eventListeners.get(event);
    if (eventListeners && eventListeners.size > 0) {
      hasListeners = true;
      // 复制监听器集合，避免在执行过程中被修改
      const listenersArray = Array.from(eventListeners);
      for (const listener of listenersArray) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for '${String(event)}':`, error);
        }
      }
    }

    // 触发一次性监听器
    const onceEventListeners = this.onceListeners.get(event);
    if (onceEventListeners && onceEventListeners.size > 0) {
      hasListeners = true;
      const listenersArray = Array.from(onceEventListeners);
      // 先清除一次性监听器
      this.onceListeners.delete(event);
      
      for (const listener of listenersArray) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in once event listener for '${String(event)}':`, error);
        }
      }
    }

    return hasListeners;
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount<K extends keyof TEventMap>(event: K): number {
    const regularCount = this.eventListeners.get(event)?.size || 0;
    const onceCount = this.onceListeners.get(event)?.size || 0;
    return regularCount + onceCount;
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): (keyof TEventMap)[] {
    const allEvents = new Set<keyof TEventMap>();
    
    for (const event of this.eventListeners.keys()) {
      allEvents.add(event);
    }
    
    for (const event of this.onceListeners.keys()) {
      allEvents.add(event);
    }
    
    return Array.from(allEvents);
  }

  /**
   * 设置最大监听器数量
   */
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }

  /**
   * 检查是否有指定事件的监听器
   */
  hasListeners<K extends keyof TEventMap>(event: K): boolean {
    return this.listenerCount(event) > 0;
  }

  /**
   * 获取指定事件的所有监听器
   */
  listeners<K extends keyof TEventMap>(event: K): Function[] {
    const regularListeners = Array.from(this.eventListeners.get(event) || []);
    const onceListeners = Array.from(this.onceListeners.get(event) || []);
    return [...regularListeners, ...onceListeners];
  }

  /**
   * 销毁事件发射器
   */
  destroy(): void {
    this.removeAllListeners();
  }
}

// 专门用于视频事件的发射器
export class VideoEventEmitterTyped extends VideoEventEmitter<Record<string, any>> {
  /**
   * 类型安全的视频事件发射
   */
  emitVideoEvent<T extends VideoEventType>(
    type: T,
    eventData: Omit<VideoEventData<T>, 'type'>
  ): boolean {
    const fullEventData = {
      type,
      ...eventData
    } as VideoEventData<T>;
    
    const eventName = `video:${type}`;
    return this.emit(eventName, fullEventData);
  }

  /**
   * 类型安全的视频事件监听
   */
  onVideoEvent<T extends VideoEventType>(
    type: T,
    listener: VideoEventListener<T>
  ): this {
    const eventName = `video:${type}`;
    return this.on(eventName, listener);
  }

  /**
   * 类型安全的一次性视频事件监听
   */
  onceVideoEvent<T extends VideoEventType>(
    type: T,
    listener: VideoEventListener<T>
  ): this {
    const eventName = `video:${type}`;
    return this.once(eventName, listener);
  }

  /**
   * 移除视频事件监听器
   */
  offVideoEvent<T extends VideoEventType>(
    type: T,
    listener: VideoEventListener<T>
  ): this {
    const eventName = `video:${type}`;
    return this.off(eventName, listener);
  }
}

// 事件委托器 - 用于管理多个事件源
export class EventDelegate<TEventMap extends Record<string, any> = VideoEventMap> {
  private emitters: Map<string, VideoEventEmitter<TEventMap>> = new Map();
  private globalEmitter: VideoEventEmitter<TEventMap> = new VideoEventEmitter();

  /**
   * 注册事件发射器
   */
  register(id: string, emitter: VideoEventEmitter<TEventMap>): this {
    this.emitters.set(id, emitter);
    
    // 将所有事件转发到全局发射器
    const forwardEvent = <K extends keyof TEventMap>(event: K) => {
      emitter.on(event, (data: TEventMap[K]) => {
        this.globalEmitter.emit(event, data);
      });
    };

    // 这里需要手动处理事件转发，因为我们无法动态获取所有可能的事件类型
    return this;
  }

  /**
   * 注销事件发射器
   */
  unregister(id: string): this {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.destroy();
      this.emitters.delete(id);
    }
    return this;
  }

  /**
   * 获取全局事件发射器
   */
  getGlobalEmitter(): VideoEventEmitter<TEventMap> {
    return this.globalEmitter;
  }

  /**
   * 获取特定的事件发射器
   */
  getEmitter(id: string): VideoEventEmitter<TEventMap> | undefined {
    return this.emitters.get(id);
  }

  /**
   * 广播事件到所有发射器
   */
  broadcast<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void {
    for (const emitter of this.emitters.values()) {
      emitter.emit(event, data);
    }
  }

  /**
   * 销毁所有发射器
   */
  destroy(): void {
    for (const emitter of this.emitters.values()) {
      emitter.destroy();
    }
    this.emitters.clear();
    this.globalEmitter.destroy();
  }
}

// 事件中间件系统
export type EventMiddleware<TEventMap extends Record<string, any> = VideoEventMap> = {
  <K extends keyof TEventMap>(
    event: K,
    data: TEventMap[K],
    next: () => void
  ): void;
};

// 带中间件的事件发射器
export class VideoEventEmitterWithMiddleware<TEventMap extends Record<string, any> = VideoEventMap> 
  extends VideoEventEmitter<TEventMap> {
  private middlewares: EventMiddleware<TEventMap>[] = [];

  /**
   * 添加中间件
   */
  use(middleware: EventMiddleware<TEventMap>): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * 移除中间件
   */
  removeMiddleware(middleware: EventMiddleware<TEventMap>): this {
    const index = this.middlewares.indexOf(middleware);
    if (index > -1) {
      this.middlewares.splice(index, 1);
    }
    return this;
  }

  /**
   * 重写emit方法以支持中间件
   */
  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): boolean {
    let index = 0;
    const middlewares = this.middlewares;

    const next = (): void => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        try {
          middleware(event, data, next);
        } catch (error) {
          console.error('Error in event middleware:', error);
          next(); // 继续执行下一个中间件
        }
      } else {
        // 所有中间件执行完毕，执行原始的emit
        super.emit(event, data);
      }
    };

    next();
    return true;
  }
}

// 导出工厂函数
export const createVideoEventEmitter = () => new VideoEventEmitterTyped();
export const createEventDelegate = () => new EventDelegate<VideoEventMap>();
export const createVideoEventEmitterWithMiddleware = () => 
  new VideoEventEmitterWithMiddleware<VideoEventMap>();

// 常用的事件中间件
export const loggingMiddleware: EventMiddleware<VideoEventMap> = (event, data, next) => {
  console.log(`[VideoEvent] ${String(event)}:`, data);
  next();
};

export const timingMiddleware: EventMiddleware<VideoEventMap> = (event, data, next) => {
  const start = performance.now();
  next();
  const end = performance.now();
  console.log(`[VideoEvent] ${String(event)} took ${end - start}ms`);
};

export const errorHandlingMiddleware: EventMiddleware<VideoEventMap> = (event, data, next) => {
  try {
    next();
  } catch (error) {
    console.error(`[VideoEvent] Error handling event ${String(event)}:`, error);
  }
};
