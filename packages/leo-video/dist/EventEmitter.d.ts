import type { VideoEventType, VideoEventListener, VideoEventData, VideoEventMap } from './types';
export declare class VideoEventEmitter<TEventMap extends Record<string, any> = VideoEventMap> {
    private eventListeners;
    private onceListeners;
    private maxListeners;
    /**
     * 添加事件监听器
     */
    on<K extends keyof TEventMap>(event: K, listener: (data: TEventMap[K]) => void): this;
    /**
     * 添加一次性事件监听器
     */
    once<K extends keyof TEventMap>(event: K, listener: (data: TEventMap[K]) => void): this;
    /**
     * 移除事件监听器
     */
    off<K extends keyof TEventMap>(event: K, listener: (data: TEventMap[K]) => void): this;
    /**
     * 移除指定事件的所有监听器
     */
    removeAllListeners<K extends keyof TEventMap>(event?: K): this;
    /**
     * 发射事件
     */
    emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): boolean;
    /**
     * 获取事件的监听器数量
     */
    listenerCount<K extends keyof TEventMap>(event: K): number;
    /**
     * 获取所有事件名称
     */
    eventNames(): (keyof TEventMap)[];
    /**
     * 设置最大监听器数量
     */
    setMaxListeners(n: number): this;
    /**
     * 获取最大监听器数量
     */
    getMaxListeners(): number;
    /**
     * 检查是否有指定事件的监听器
     */
    hasListeners<K extends keyof TEventMap>(event: K): boolean;
    /**
     * 获取指定事件的所有监听器
     */
    listeners<K extends keyof TEventMap>(event: K): Function[];
    /**
     * 销毁事件发射器
     */
    destroy(): void;
}
export declare class VideoEventEmitterTyped extends VideoEventEmitter<Record<string, any>> {
    /**
     * 类型安全的视频事件发射
     */
    emitVideoEvent<T extends VideoEventType>(type: T, eventData: Omit<VideoEventData<T>, 'type'>): boolean;
    /**
     * 类型安全的视频事件监听
     */
    onVideoEvent<T extends VideoEventType>(type: T, listener: VideoEventListener<T>): this;
    /**
     * 类型安全的一次性视频事件监听
     */
    onceVideoEvent<T extends VideoEventType>(type: T, listener: VideoEventListener<T>): this;
    /**
     * 移除视频事件监听器
     */
    offVideoEvent<T extends VideoEventType>(type: T, listener: VideoEventListener<T>): this;
}
export declare class EventDelegate<TEventMap extends Record<string, any> = VideoEventMap> {
    private emitters;
    private globalEmitter;
    /**
     * 注册事件发射器
     */
    register(id: string, emitter: VideoEventEmitter<TEventMap>): this;
    /**
     * 注销事件发射器
     */
    unregister(id: string): this;
    /**
     * 获取全局事件发射器
     */
    getGlobalEmitter(): VideoEventEmitter<TEventMap>;
    /**
     * 获取特定的事件发射器
     */
    getEmitter(id: string): VideoEventEmitter<TEventMap> | undefined;
    /**
     * 广播事件到所有发射器
     */
    broadcast<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void;
    /**
     * 销毁所有发射器
     */
    destroy(): void;
}
export type EventMiddleware<TEventMap extends Record<string, any> = VideoEventMap> = {
    <K extends keyof TEventMap>(event: K, data: TEventMap[K], next: () => void): void;
};
export declare class VideoEventEmitterWithMiddleware<TEventMap extends Record<string, any> = VideoEventMap> extends VideoEventEmitter<TEventMap> {
    private middlewares;
    /**
     * 添加中间件
     */
    use(middleware: EventMiddleware<TEventMap>): this;
    /**
     * 移除中间件
     */
    removeMiddleware(middleware: EventMiddleware<TEventMap>): this;
    /**
     * 重写emit方法以支持中间件
     */
    emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): boolean;
}
export declare const createVideoEventEmitter: () => VideoEventEmitterTyped;
export declare const createEventDelegate: () => EventDelegate<VideoEventMap>;
export declare const createVideoEventEmitterWithMiddleware: () => VideoEventEmitterWithMiddleware<VideoEventMap>;
export declare const loggingMiddleware: EventMiddleware<VideoEventMap>;
export declare const timingMiddleware: EventMiddleware<VideoEventMap>;
export declare const errorHandlingMiddleware: EventMiddleware<VideoEventMap>;
//# sourceMappingURL=EventEmitter.d.ts.map