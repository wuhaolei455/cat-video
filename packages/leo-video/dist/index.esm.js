import { jsxs, jsx } from 'react/jsx-runtime';
import { forwardRef, useRef, useState, useCallback, useEffect, useImperativeHandle } from 'react';
import Hls from 'hls.js';

// 泛型事件发射器 - 支持类型安全的事件系统
// 泛型事件发射器类
class VideoEventEmitter {
    constructor() {
        this.eventListeners = new Map();
        this.onceListeners = new Map();
        this.maxListeners = 10;
    }
    /**
     * 添加事件监听器
     */
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        const eventListeners = this.eventListeners.get(event);
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
    once(event, listener) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, new Set());
        }
        this.onceListeners.get(event).add(listener);
        return this;
    }
    /**
     * 移除事件监听器
     */
    off(event, listener) {
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
    removeAllListeners(event) {
        if (event) {
            this.eventListeners.delete(event);
            this.onceListeners.delete(event);
        }
        else {
            this.eventListeners.clear();
            this.onceListeners.clear();
        }
        return this;
    }
    /**
     * 发射事件
     */
    emit(event, data) {
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
                }
                catch (error) {
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
                }
                catch (error) {
                    console.error(`Error in once event listener for '${String(event)}':`, error);
                }
            }
        }
        return hasListeners;
    }
    /**
     * 获取事件的监听器数量
     */
    listenerCount(event) {
        const regularCount = this.eventListeners.get(event)?.size || 0;
        const onceCount = this.onceListeners.get(event)?.size || 0;
        return regularCount + onceCount;
    }
    /**
     * 获取所有事件名称
     */
    eventNames() {
        const allEvents = new Set();
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
    setMaxListeners(n) {
        this.maxListeners = n;
        return this;
    }
    /**
     * 获取最大监听器数量
     */
    getMaxListeners() {
        return this.maxListeners;
    }
    /**
     * 检查是否有指定事件的监听器
     */
    hasListeners(event) {
        return this.listenerCount(event) > 0;
    }
    /**
     * 获取指定事件的所有监听器
     */
    listeners(event) {
        const regularListeners = Array.from(this.eventListeners.get(event) || []);
        const onceListeners = Array.from(this.onceListeners.get(event) || []);
        return [...regularListeners, ...onceListeners];
    }
    /**
     * 销毁事件发射器
     */
    destroy() {
        this.removeAllListeners();
    }
}
// 专门用于视频事件的发射器
class VideoEventEmitterTyped extends VideoEventEmitter {
    /**
     * 类型安全的视频事件发射
     */
    emitVideoEvent(type, eventData) {
        const fullEventData = {
            type,
            ...eventData
        };
        const eventName = `video:${type}`;
        return this.emit(eventName, fullEventData);
    }
    /**
     * 类型安全的视频事件监听
     */
    onVideoEvent(type, listener) {
        const eventName = `video:${type}`;
        return this.on(eventName, listener);
    }
    /**
     * 类型安全的一次性视频事件监听
     */
    onceVideoEvent(type, listener) {
        const eventName = `video:${type}`;
        return this.once(eventName, listener);
    }
    /**
     * 移除视频事件监听器
     */
    offVideoEvent(type, listener) {
        const eventName = `video:${type}`;
        return this.off(eventName, listener);
    }
}

// HTML5 Video API 封装 - 提供类型安全和事件驱动的视频操作
// HTML5 Video API 封装类
class HTML5VideoAPI {
    constructor(element, config) {
        this._state = 'idle';
        this._metadata = null;
        this._isDestroyed = false;
        this._currentQuality = 'auto';
        this._loadStartTime = 0;
        this._playStartTime = 0;
        this._pauseStartTime = 0;
        this._element = element;
        this._config = { ...config };
        this._stats = this.initializeStats();
        this._eventEmitter = new VideoEventEmitterTyped();
        this.setupVideoElement();
        this.bindVideoEvents();
        this.setupPerformanceMonitoring();
        // 应用初始配置
        this.applyConfig();
    }
    // Getters - 实现接口属性
    get element() {
        return this._element;
    }
    get config() {
        return { ...this._config };
    }
    get state() {
        return this._state;
    }
    get metadata() {
        return this._metadata;
    }
    get stats() {
        return { ...this._stats };
    }
    // 私有方法 - 初始化统计信息
    initializeStats() {
        return {
            loadTime: 0,
            playTime: 0,
            pauseTime: 0,
            seekCount: 0,
            errorCount: 0,
            qualityChanges: 0,
            bufferEvents: 0,
            averageBitrate: 0,
            droppedFrames: 0,
            totalFrames: 0
        };
    }
    // 私有方法 - 设置视频元素
    setupVideoElement() {
        // 设置基本属性
        this._element.controls = this._config.controls ?? true;
        this._element.autoplay = this._config.autoplay ?? false;
        this._element.loop = this._config.loop ?? false;
        this._element.muted = this._config.muted ?? false;
        this._element.preload = this._config.preload ?? 'metadata';
        if (this._config.poster) {
            this._element.poster = this._config.poster;
        }
        if (this._config.crossOrigin) {
            this._element.crossOrigin = this._config.crossOrigin;
        }
        if (this._config.playsinline) {
            this._element.playsInline = this._config.playsinline;
        }
        if (this._config.width) {
            this._element.width = this._config.width;
        }
        if (this._config.height) {
            this._element.height = this._config.height;
        }
    }
    // 私有方法 - 绑定视频事件
    bindVideoEvents() {
        const eventMap = {
            'loadstart': 'loadstart',
            'loadedmetadata': 'loadedmetadata',
            'loadeddata': 'loadeddata',
            'canplay': 'canplay',
            'canplaythrough': 'canplaythrough',
            'play': 'play',
            'playing': 'playing',
            'pause': 'pause',
            'seeking': 'seeking',
            'seeked': 'seeked',
            'waiting': 'waiting',
            'timeupdate': 'timeupdate',
            'progress': 'progress',
            'volumechange': 'volumechange',
            'ratechange': 'ratechange',
            'ended': 'ended',
            'error': 'error',
            'stalled': 'stalled',
            'suspend': 'suspend',
            'abort': 'abort',
            'emptied': 'emptied',
            'durationchange': 'durationchange'
        };
        // 绑定所有HTML5视频事件
        Object.entries(eventMap).forEach(([domEvent, videoEvent]) => {
            this._element.addEventListener(domEvent, (e) => {
                this.handleVideoEvent(videoEvent, e);
            });
        });
    }
    // 私有方法 - 处理视频事件
    handleVideoEvent(eventType, domEvent) {
        if (this._isDestroyed)
            return;
        // 更新状态
        this.updateState(eventType);
        // 更新元数据
        this.updateMetadata();
        // 更新统计信息
        this.updateStats(eventType);
        // 创建事件数据
        const eventData = this.createEventData(eventType, domEvent);
        // 发射事件
        this.emit(eventType, eventData);
    }
    // 私有方法 - 更新状态
    updateState(eventType) {
        switch (eventType) {
            case 'loadstart':
                this._state = 'loading';
                this._loadStartTime = performance.now();
                break;
            case 'canplay':
                this._state = 'canplay';
                break;
            case 'playing':
                this._state = 'playing';
                this._playStartTime = performance.now();
                break;
            case 'pause':
                this._state = 'paused';
                this._pauseStartTime = performance.now();
                break;
            case 'seeking':
                this._state = 'seeking';
                break;
            case 'waiting':
                this._state = 'waiting';
                break;
            case 'ended':
                this._state = 'ended';
                break;
            case 'error':
                this._state = 'error';
                break;
        }
    }
    // 私有方法 - 更新元数据
    updateMetadata() {
        if (this._element.readyState >= 1) { // HAVE_METADATA
            this._metadata = {
                duration: this._element.duration || 0,
                videoWidth: this._element.videoWidth || 0,
                videoHeight: this._element.videoHeight || 0,
                readyState: this._element.readyState,
                networkState: this._element.networkState,
                buffered: this._element.buffered,
                seekable: this._element.seekable,
                played: this._element.played
            };
        }
    }
    // 私有方法 - 更新统计信息
    updateStats(eventType) {
        const now = performance.now();
        switch (eventType) {
            case 'loadeddata':
                if (this._loadStartTime > 0) {
                    this._stats.loadTime = now - this._loadStartTime;
                }
                break;
            case 'playing':
                if (this._pauseStartTime > 0) {
                    this._stats.pauseTime += now - this._pauseStartTime;
                    this._pauseStartTime = 0;
                }
                break;
            case 'pause':
                if (this._playStartTime > 0) {
                    this._stats.playTime += now - this._playStartTime;
                    this._playStartTime = 0;
                }
                break;
            case 'seeked':
                this._stats.seekCount++;
                break;
            case 'error':
                this._stats.errorCount++;
                break;
            case 'waiting':
                this._stats.bufferEvents++;
                break;
        }
    }
    // 私有方法 - 创建事件数据
    createEventData(eventType, domEvent) {
        const baseData = {
            type: eventType,
            timestamp: Date.now(),
            currentTime: this._element.currentTime || 0,
            duration: this._element.duration || 0
        };
        switch (eventType) {
            case 'error':
                const error = this._element.error;
                const videoError = {
                    type: this.getErrorType(error?.code || 0),
                    code: error?.code || 0,
                    message: error?.message || 'Unknown error',
                    timestamp: Date.now(),
                    fatal: true,
                    details: { domEvent }
                };
                return { ...baseData, payload: videoError };
            case 'volumechange':
                return {
                    ...baseData,
                    payload: {
                        volume: this._element.volume,
                        muted: this._element.muted
                    }
                };
            case 'ratechange':
                return {
                    ...baseData,
                    payload: {
                        rate: this._element.playbackRate
                    }
                };
            case 'progress':
                const buffered = this._element.buffered;
                const loaded = buffered.length > 0 ? buffered.end(buffered.length - 1) : 0;
                const total = this._element.duration || 0;
                return {
                    ...baseData,
                    payload: { loaded, total }
                };
            case 'timeupdate':
                return {
                    ...baseData,
                    payload: {
                        currentTime: this._element.currentTime,
                        duration: this._element.duration || 0
                    }
                };
            default:
                return { ...baseData, payload: {} };
        }
    }
    // 私有方法 - 获取错误类型
    getErrorType(code) {
        switch (code) {
            case 1: return 'unknown';
            case 2: return 'network';
            case 3: return 'decode';
            case 4: return 'src_not_supported';
            default: return 'unknown';
        }
    }
    // 私有方法 - 设置性能监控
    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            this._performanceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                for (const entry of entries) {
                    if (entry.name.includes('video')) {
                        // 处理性能指标
                        this.handlePerformanceEntry(entry);
                    }
                }
            });
            try {
                this._performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
            }
            catch (e) {
                console.warn('Performance monitoring not supported:', e);
            }
        }
    }
    // 私有方法 - 处理性能条目
    handlePerformanceEntry(entry) {
        // 可以在这里处理特定的性能指标
        console.debug('Performance entry:', entry);
    }
    // 私有方法 - 应用配置
    applyConfig() {
        if (this._config.volume !== undefined) {
            this.setVolume(this._config.volume);
        }
        if (this._config.playbackRate !== undefined) {
            this.setPlaybackRate(this._config.playbackRate);
        }
        if (this._config.currentTime !== undefined) {
            this.seek(this._config.currentTime);
        }
        // 设置视频源
        if (this._config.sources.length > 0) {
            this.loadSources();
        }
    }
    // 私有方法 - 加载视频源
    loadSources() {
        // 清除现有源
        while (this._element.firstChild) {
            this._element.removeChild(this._element.firstChild);
        }
        // 添加新源
        this._config.sources.forEach(source => {
            const sourceElement = document.createElement('source');
            sourceElement.src = source.src;
            sourceElement.type = `video/${source.type}`;
            if (source.quality) {
                sourceElement.setAttribute('data-quality', source.quality);
            }
            if (source.label) {
                sourceElement.setAttribute('data-label', source.label);
            }
            this._element.appendChild(sourceElement);
        });
        // 重新加载视频
        this._element.load();
    }
    // 实现IVideoPlayer接口的事件方法
    on(event, listener) {
        this._eventEmitter.onVideoEvent(event, listener);
    }
    off(event, listener) {
        this._eventEmitter.offVideoEvent(event, listener);
    }
    emit(event, data) {
        this._eventEmitter.emitVideoEvent(event, data);
    }
    // 公共方法 - 实现IVideoPlayer接口
    async play() {
        try {
            await this._element.play();
        }
        catch (error) {
            const videoError = {
                type: 'unknown',
                code: 0,
                message: error instanceof Error ? error.message : 'Play failed',
                timestamp: Date.now(),
                fatal: false,
                details: { error }
            };
            this.emit('error', {
                type: 'error',
                timestamp: Date.now(),
                currentTime: this._element.currentTime,
                duration: this._element.duration || 0,
                payload: videoError
            });
            throw error;
        }
    }
    pause() {
        this._element.pause();
    }
    stop() {
        this.pause();
        this.seek(0);
    }
    seek(time) {
        if (time >= 0 && time <= (this._element.duration || 0)) {
            this._element.currentTime = time;
        }
    }
    setVolume(volume) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        this._element.volume = clampedVolume;
    }
    mute() {
        this._element.muted = true;
    }
    unmute() {
        this._element.muted = false;
    }
    toggleMute() {
        this._element.muted = !this._element.muted;
    }
    setPlaybackRate(rate) {
        this._element.playbackRate = rate;
    }
    setQuality(quality) {
        // 基础实现 - 子类可以重写以支持自适应质量
        this._currentQuality = quality;
        this.emit('qualitychange', {
            type: 'qualitychange',
            timestamp: Date.now(),
            currentTime: this._element.currentTime,
            duration: this._element.duration || 0,
            payload: { from: this._currentQuality, to: quality }
        });
        this._stats.qualityChanges++;
    }
    getAvailableQualities() {
        // 从配置中获取可用质量
        return this._config.qualities || ['auto'];
    }
    async enterFullscreen() {
        if (this._element.requestFullscreen) {
            await this._element.requestFullscreen();
        }
    }
    async exitFullscreen() {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        }
    }
    async toggleFullscreen() {
        if (document.fullscreenElement) {
            await this.exitFullscreen();
        }
        else {
            await this.enterFullscreen();
        }
    }
    async enterPiP() {
        if ('pictureInPictureEnabled' in document && this._element.requestPictureInPicture) {
            await this._element.requestPictureInPicture();
        }
    }
    async exitPiP() {
        if ('pictureInPictureEnabled' in document && document.exitPictureInPicture) {
            await document.exitPictureInPicture();
        }
    }
    async togglePiP() {
        if (document.pictureInPictureElement) {
            await this.exitPiP();
        }
        else {
            await this.enterPiP();
        }
    }
    // 销毁方法
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyed = true;
        // 停止性能监控
        if (this._performanceObserver) {
            this._performanceObserver.disconnect();
        }
        // 清理视频元素
        this._element.pause();
        this._element.removeAttribute('src');
        this._element.load();
        // 清理事件监听器
        this._eventEmitter.destroy();
    }
}

// HLS 流媒体播放器 - 支持自适应比特率流
// HLS播放器类 - 扩展HTML5VideoAPI
class HLSPlayer extends HTML5VideoAPI {
    constructor(element, config) {
        super(element, config);
        this._hls = null;
        this._isHLSSupported = false;
        this._qualityLevels = [];
        this._currentLevel = -1; // -1 表示自动质量
        this._isLiveStream = false;
        this._isHLSSupported = this.checkHLSSupport();
        this.initializeHLS();
    }
    // 辅助方法 - 发射带有type的事件
    emitEvent(type, payload, currentTime, duration) {
        this.emit(type, {
            type,
            timestamp: Date.now(),
            currentTime: currentTime ?? this.element.currentTime,
            duration: duration ?? (this.element.duration || 0),
            payload
        });
    }
    // 私有方法 - 检查HLS支持
    checkHLSSupport() {
        // 检查原生HLS支持
        if (this.element.canPlayType('application/vnd.apple.mpegurl')) {
            return true;
        }
        // 检查HLS.js支持
        return Hls.isSupported();
    }
    // 私有方法 - 初始化HLS
    initializeHLS() {
        if (!this._isHLSSupported) {
            this.handleHLSError('HLS not supported', false);
            return;
        }
        // 如果浏览器原生支持HLS，直接使用
        if (this.element.canPlayType('application/vnd.apple.mpegurl')) {
            this.loadHLSNatively();
            return;
        }
        // 使用HLS.js
        if (Hls.isSupported()) {
            this.initializeHLSJS();
        }
    }
    // 私有方法 - 使用原生HLS
    loadHLSNatively() {
        const hlsSource = this.config.sources.find(source => source.type === 'hls');
        if (hlsSource) {
            this.element.src = hlsSource.src;
            this.emitEvent('ready', { method: 'native' }, 0, 0);
        }
    }
    // 私有方法 - 初始化HLS.js
    initializeHLSJS() {
        const hlsConfig = this.createHLSConfig();
        this._hls = new Hls(hlsConfig);
        this.bindHLSEvents();
        this.loadHLSSource();
    }
    // 私有方法 - 创建HLS配置
    createHLSConfig() {
        const userConfig = this.config.hls || {};
        return {
            // 默认配置
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5,
            highBufferWatchdogPeriod: 2,
            nudgeOffset: 0.1,
            nudgeMaxRetry: 3,
            maxFragLookUpTolerance: 0.25,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 10,
            enableSoftwareAES: true,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 1,
            manifestLoadingRetryDelay: 1000,
            levelLoadingTimeOut: 10000,
            levelLoadingMaxRetry: 4,
            levelLoadingRetryDelay: 1000,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 6,
            fragLoadingRetryDelay: 1000,
            startFragPrefetch: false,
            testBandwidth: true,
            progressive: false,
            debug: false,
            // 用户自定义配置
            ...userConfig
        };
    }
    // 私有方法 - 绑定HLS事件
    bindHLSEvents() {
        if (!this._hls)
            return;
        // HLS.js事件映射
        const eventMap = {
            [Hls.Events.MEDIA_ATTACHED]: () => {
                console.log('HLS: Media attached');
            },
            [Hls.Events.MANIFEST_LOADED]: (event, data) => {
                this._isLiveStream = data.live;
                this.processQualityLevels(data.levels);
                this.emitEvent('ready', {
                    method: 'hls.js',
                    live: this._isLiveStream,
                    levels: data.levels.length
                }, 0, data.totalduration || 0);
            },
            [Hls.Events.LEVEL_LOADED]: (event, data) => {
                this.emitEvent('progress', {
                    loaded: data.details.endSN - data.details.startSN,
                    total: data.details.fragments.length
                });
            },
            [Hls.Events.LEVEL_SWITCHING]: (event, data) => {
                const newLevel = this._qualityLevels[data.level];
                const oldLevel = this._qualityLevels[this._currentLevel] || { name: 'auto' };
                this._currentLevel = data.level;
                this.emitEvent('qualitychange', {
                    from: oldLevel.name,
                    to: newLevel?.name || 'auto'
                });
            },
            [Hls.Events.FRAG_BUFFERED]: () => {
                // 分片缓冲完成
            },
            [Hls.Events.BUFFER_APPENDING]: () => {
                this.emitEvent('buffering', {
                    isBuffering: true,
                    bufferLevel: this.getBufferLevel()
                });
            },
            [Hls.Events.BUFFER_APPENDED]: () => {
                this.emitEvent('buffering', {
                    isBuffering: false,
                    bufferLevel: this.getBufferLevel()
                });
            },
            [Hls.Events.ERROR]: (event, data) => {
                this.handleHLSError(data);
            }
        };
        // 绑定所有事件
        Object.entries(eventMap).forEach(([event, handler]) => {
            this._hls.on(event, handler);
        });
    }
    // 私有方法 - 处理质量级别
    processQualityLevels(levels) {
        this._qualityLevels = levels.map((level, index) => ({
            bitrate: level.bitrate,
            width: level.width,
            height: level.height,
            level: index,
            name: this.getQualityNameFromHeight(level.height)
        }));
        // 排序：从高质量到低质量
        this._qualityLevels.sort((a, b) => b.height - a.height);
    }
    // 私有方法 - 根据高度获取质量名称
    getQualityNameFromHeight(height) {
        if (height >= 2160)
            return '2160p';
        if (height >= 1440)
            return '1440p';
        if (height >= 1080)
            return '1080p';
        if (height >= 720)
            return '720p';
        if (height >= 480)
            return '480p';
        if (height >= 360)
            return '360p';
        return '240p';
    }
    // 私有方法 - 获取缓冲级别
    getBufferLevel() {
        if (!this._hls)
            return 0;
        try {
            // 尝试获取缓冲信息，如果API不可用则返回0
            const buffered = this.element.buffered;
            if (buffered.length > 0) {
                const currentTime = this.element.currentTime;
                const bufferedEnd = buffered.end(buffered.length - 1);
                return Math.max(0, bufferedEnd - currentTime);
            }
        }
        catch (error) {
            console.warn('Failed to get buffer level:', error);
        }
        return 0;
    }
    // 私有方法 - 加载HLS源
    loadHLSSource() {
        if (!this._hls)
            return;
        const hlsSource = this.config.sources.find(source => source.type === 'hls');
        if (hlsSource) {
            this._hls.attachMedia(this.element);
            this._hls.loadSource(hlsSource.src);
        }
    }
    // 私有方法 - 处理HLS错误
    handleHLSError(error, fatal = true) {
        let videoError;
        if (typeof error === 'string') {
            videoError = {
                type: 'unknown',
                code: 0,
                message: error,
                timestamp: Date.now(),
                fatal,
                details: {}
            };
        }
        else {
            videoError = {
                type: this.mapHLSErrorType(error.type),
                code: 0,
                message: error.details || 'HLS Error',
                timestamp: Date.now(),
                fatal: error.fatal || fatal,
                details: {
                    hlsError: error,
                    type: error.type,
                    details: error.details,
                    reason: error.reason
                }
            };
        }
        this.emitEvent('error', videoError);
        // 尝试恢复
        if (this._hls && error.fatal) {
            this.attemptRecovery(error);
        }
    }
    // 私有方法 - 映射HLS错误类型
    mapHLSErrorType(hlsErrorType) {
        switch (hlsErrorType) {
            case 'networkError':
                return 'network';
            case 'mediaError':
                return 'decode';
            case 'muxError':
                return 'src_not_supported';
            default:
                return 'unknown';
        }
    }
    // 私有方法 - 尝试错误恢复
    attemptRecovery(error) {
        if (!this._hls)
            return;
        switch (error.type) {
            case 'networkError':
                console.log('HLS: Attempting network error recovery...');
                this._hls.startLoad();
                break;
            case 'mediaError':
                console.log('HLS: Attempting media error recovery...');
                this._hls.recoverMediaError();
                break;
            default:
                console.log('HLS: Attempting generic recovery...');
                this._hls.destroy();
                this.initializeHLSJS();
                break;
        }
    }
    // 重写质量控制方法
    setQuality(quality) {
        if (!this._hls) {
            super.setQuality(quality);
            return;
        }
        const oldQuality = this.getCurrentQuality();
        if (quality === 'auto') {
            this._hls.currentLevel = -1; // 启用自动质量
            this._currentLevel = -1;
        }
        else {
            const levelIndex = this._qualityLevels.findIndex(level => level.name === quality);
            if (levelIndex !== -1) {
                this._hls.currentLevel = this._qualityLevels[levelIndex].level;
                this._currentLevel = levelIndex;
            }
        }
        // 发射质量变更事件
        this.emitEvent('qualitychange', { from: oldQuality, to: quality });
        // 更新统计
        this.stats.qualityChanges++;
    }
    // 重写获取可用质量方法
    getAvailableQualities() {
        const qualities = ['auto'];
        if (this._qualityLevels.length > 0) {
            const levelQualities = this._qualityLevels.map(level => level.name);
            qualities.push(...levelQualities);
        }
        return [...new Set(qualities)]; // 去重
    }
    // 获取当前质量
    getCurrentQuality() {
        if (this._currentLevel === -1) {
            return 'auto';
        }
        return this._qualityLevels[this._currentLevel]?.name || 'auto';
    }
    // 获取HLS统计信息
    getHLSStats() {
        if (!this._hls)
            return {};
        return {
            isLive: this._isLiveStream,
            currentLevel: this._currentLevel,
            levels: this._qualityLevels,
            bufferLength: this.getBufferLevel(),
            loadLevel: this._hls.loadLevel,
            autoLevelEnabled: this._hls.autoLevelEnabled,
            autoLevelCapping: this._hls.autoLevelCapping,
            bandwidthEstimate: this._hls.bandwidthEstimate,
            url: this._hls.url
        };
    }
    // 设置HLS特定配置
    updateHLSConfig(config) {
        if (!this._hls)
            return;
        // 更新配置
        Object.assign(this._hls.config, config);
        // 重新加载以应用新配置
        const currentTime = this.element.currentTime;
        const isPlaying = !this.element.paused;
        this._hls.destroy();
        this.initializeHLSJS();
        // 恢复播放状态
        this.element.addEventListener('loadeddata', () => {
            this.seek(currentTime);
            if (isPlaying) {
                this.play();
            }
        }, { once: true });
    }
    // 重写销毁方法
    destroy() {
        if (this._hls) {
            this._hls.destroy();
            this._hls = null;
        }
        this._qualityLevels = [];
        this._currentLevel = -1;
        super.destroy();
    }
}
// HLS支持检测
const detectHLSSupport$1 = () => {
    const video = document.createElement('video');
    const native = !!video.canPlayType('application/vnd.apple.mpegurl');
    const hls_js = Hls.isSupported();
    return {
        native,
        hls_js,
        supported: native || hls_js
    };
};

// 视频播放器工厂 - 使用泛型和类型约束创建合适的播放器实例
// 播放器工厂类
class VideoPlayerFactory {
    constructor() {
        this.playerRegistry = new Map();
    }
    // 单例模式
    static getInstance() {
        if (!VideoPlayerFactory.instance) {
            VideoPlayerFactory.instance = new VideoPlayerFactory();
        }
        return VideoPlayerFactory.instance;
    }
    /**
     * 创建视频播放器 - 主要工厂方法
     */
    create(element, config) {
        // 验证配置
        this.validateConfig(config);
        // 确定播放器类型
        const playerType = this.determinePlayerType(config.sources);
        // 创建播放器实例
        const player = this.createPlayerInstance(element, config, playerType);
        // 注册播放器
        const playerId = this.generatePlayerId();
        this.playerRegistry.set(playerId, player);
        return player;
    }
    /**
     * 创建HTML5播放器 - 类型安全的工厂方法
     */
    createHTML5Player(element, config) {
        this.validateConfig(config);
        return new HTML5VideoAPI(element, config);
    }
    /**
     * 创建HLS播放器 - 类型约束确保HLS配置
     */
    createHLSPlayer(element, config) {
        this.validateHLSConfig(config);
        return new HLSPlayer(element, config);
    }
    /**
     * 智能创建 - 根据环境和配置自动选择最佳播放器
     */
    createSmart(element, config) {
        const hasHLS = config.sources.some(source => source.type === 'hls');
        if (hasHLS) {
            const hlsSupport = detectHLSSupport$1();
            if (!hlsSupport.supported) {
                throw new Error('HLS playback not supported in this environment');
            }
            // 确保HLS配置完整
            const hlsConfig = this.ensureHLSConfig(config);
            return this.createHLSPlayer(element, hlsConfig);
        }
        return this.createHTML5Player(element, config);
    }
    /**
     * 批量创建播放器
     */
    createBatch(configs) {
        return configs.map(({ element, config }) => this.create(element, config));
    }
    /**
     * 从现有播放器克隆配置创建新播放器
     */
    clone(existingPlayer, newElement, configOverrides) {
        const newConfig = {
            ...existingPlayer.config,
            ...configOverrides
        };
        return this.create(newElement, newConfig);
    }
    // 私有方法 - 验证配置
    validateConfig(config) {
        if (!config) {
            throw new Error('Video configuration is required');
        }
        if (!Array.isArray(config.sources) || config.sources.length === 0) {
            throw new Error('At least one video source is required');
        }
        // 验证每个源
        config.sources.forEach((source, index) => {
            if (!source.src) {
                throw new Error(`Source ${index} is missing src property`);
            }
            if (!source.type) {
                throw new Error(`Source ${index} is missing type property`);
            }
            if (!this.isValidVideoFormat(source.type)) {
                throw new Error(`Source ${index} has invalid type: ${source.type}`);
            }
        });
    }
    // 私有方法 - 验证HLS配置
    validateHLSConfig(config) {
        this.validateConfig(config);
        const hasHLSSource = config.sources.some(source => source.type === 'hls');
        if (!hasHLSSource) {
            throw new Error('HLS configuration requires at least one HLS source');
        }
        if (!config.hls) {
            throw new Error('HLS configuration object is required for HLS player');
        }
    }
    // 私有方法 - 确保HLS配置存在
    ensureHLSConfig(config) {
        if (this.isHLSConfig(config)) {
            return config;
        }
        // 为非HLS配置添加默认HLS配置
        return {
            ...config,
            hls: {
                enableWorker: true,
                lowLatencyMode: false,
                debug: false
            }
        };
    }
    // 私有方法 - 检查是否为HLS配置
    isHLSConfig(config) {
        return 'hls' in config &&
            config.sources.some(source => source.type === 'hls');
    }
    // 私有方法 - 确定播放器类型
    determinePlayerType(sources) {
        // 优先级：HLS > DASH > HTML5
        if (sources.some(source => source.type === 'hls')) {
            return 'hls';
        }
        if (sources.some(source => source.type === 'dash')) {
            return 'dash';
        }
        return 'html5';
    }
    // 私有方法 - 创建播放器实例
    createPlayerInstance(element, config, playerType) {
        switch (playerType) {
            case 'html5':
                return new HTML5VideoAPI(element, config);
            case 'hls':
                if (!this.isHLSConfig(config)) {
                    throw new Error('HLS player requires HLS configuration');
                }
                return new HLSPlayer(element, config);
            case 'dash':
                throw new Error('DASH player not implemented yet');
            default:
                throw new Error(`Unknown player type: ${playerType}`);
        }
    }
    // 私有方法 - 验证视频格式
    isValidVideoFormat(format) {
        return ['mp4', 'webm', 'ogg', 'hls', 'dash'].includes(format);
    }
    // 私有方法 - 生成播放器ID
    generatePlayerId() {
        return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 获取注册的播放器
     */
    getPlayer(id) {
        return this.playerRegistry.get(id);
    }
    /**
     * 获取所有注册的播放器
     */
    getAllPlayers() {
        return Array.from(this.playerRegistry.values());
    }
    /**
     * 注销播放器
     */
    unregister(id) {
        const player = this.playerRegistry.get(id);
        if (player) {
            player.destroy();
            return this.playerRegistry.delete(id);
        }
        return false;
    }
    /**
     * 销毁所有播放器
     */
    destroyAll() {
        for (const player of this.playerRegistry.values()) {
            player.destroy();
        }
        this.playerRegistry.clear();
    }
    /**
     * 获取播放器统计信息
     */
    getStats() {
        const players = Array.from(this.playerRegistry.values());
        const playerTypes = {};
        players.forEach(player => {
            const type = player.constructor.name;
            playerTypes[type] = (playerTypes[type] || 0) + 1;
        });
        return {
            totalPlayers: players.length,
            playerTypes,
            memoryUsage: this.estimateMemoryUsage()
        };
    }
    // 私有方法 - 估算内存使用
    estimateMemoryUsage() {
        // 简单的内存使用估算
        return this.playerRegistry.size * 1024 * 1024; // 每个播放器大约1MB
    }
}
// 便捷的工厂函数
const videoPlayerFactory = VideoPlayerFactory.getInstance();
/**
 * 智能创建播放器 - 自动选择最佳播放器类型
 */
const createSmartVideoPlayer = (element, config) => {
    return videoPlayerFactory.createSmart(element, config);
};
// 配置构建器 - 流式API构建配置
class VideoConfigBuilder {
    constructor() {
        this.config = {};
    }
    static create() {
        return new VideoConfigBuilder();
    }
    sources(sources) {
        this.config.sources = sources;
        return this;
    }
    addSource(source) {
        if (!this.config.sources) {
            this.config.sources = [];
        }
        this.config.sources.push(source);
        return this;
    }
    poster(url) {
        this.config.poster = url;
        return this;
    }
    autoplay(enabled = true) {
        this.config.autoplay = enabled;
        return this;
    }
    loop(enabled = true) {
        this.config.loop = enabled;
        return this;
    }
    muted(enabled = true) {
        this.config.muted = enabled;
        return this;
    }
    controls(enabled = true) {
        this.config.controls = enabled;
        return this;
    }
    dimensions(width, height) {
        this.config.width = width;
        this.config.height = height;
        return this;
    }
    qualities(qualities) {
        this.config.qualities = qualities;
        return this;
    }
    preload(preload) {
        this.config.preload = preload;
        return this;
    }
    hls(hlsConfig) {
        this.config.hls = hlsConfig;
        return this;
    }
    build() {
        if (!this.config.sources || this.config.sources.length === 0) {
            throw new Error('At least one video source is required');
        }
        return this.config;
    }
}
// 预设配置工厂
class PresetConfigFactory {
    /**
     * 创建基础MP4配置
     */
    static mp4(src) {
        return VideoConfigBuilder.create()
            .addSource({ src, type: 'mp4' })
            .controls(true)
            .preload('metadata');
    }
    /**
     * 创建HLS流配置
     */
    static hls(src, hlsConfig) {
        return VideoConfigBuilder.create()
            .addSource({ src, type: 'hls' })
            .controls(true)
            .hls({
            enableWorker: true,
            lowLatencyMode: false,
            debug: false,
            ...hlsConfig
        });
    }
    /**
     * 创建多质量配置
     */
    static multiQuality(sources) {
        return VideoConfigBuilder.create()
            .sources(sources)
            .controls(true)
            .qualities(['auto', '1080p', '720p', '480p', '360p']);
    }
    /**
     * 创建直播配置
     */
    static live(hlsSrc) {
        return VideoConfigBuilder.create()
            .addSource({ src: hlsSrc, type: 'hls' })
            .controls(true)
            .hls({
            enableWorker: true,
            lowLatencyMode: true,
            liveSyncDurationCount: 1,
            liveMaxLatencyDurationCount: 3,
            maxBufferLength: 10,
            debug: false
        });
    }
}

const defaultPlayerState$1 = {
    state: 'idle',
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    quality: 'auto',
    playbackRate: 1,
    buffered: 0,
    isFullscreen: false,
    isPiP: false,
    error: null
};
const LeoVideoPlayer = forwardRef(({ config, width = '100%', height = 'auto', className = '', style = {}, showControls = true, showEventLog = false, onStateChange, onEvent, onError }, ref) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const [playerState, setPlayerState] = useState(defaultPlayerState$1);
    const [eventLogs, setEventLogs] = useState([]);
    // 处理视频事件
    const handleVideoEvent = useCallback((type, data) => {
        // 记录事件日志
        if (showEventLog) {
            const logEntry = {
                id: `${Date.now()}_${Math.random()}`,
                timestamp: Date.now(),
                type,
                data: data.payload
            };
            setEventLogs(prev => [logEntry, ...prev.slice(0, 49)]);
        }
        // 更新播放器状态
        setPlayerState(prev => {
            const newState = { ...prev };
            switch (type) {
                case 'loadedmetadata':
                    newState.duration = data.duration;
                    break;
                case 'timeupdate':
                    newState.currentTime = data.currentTime;
                    newState.duration = data.duration;
                    break;
                case 'play':
                    newState.state = 'play';
                    break;
                case 'playing':
                    newState.state = 'playing';
                    break;
                case 'pause':
                    newState.state = 'paused';
                    break;
                case 'ended':
                    newState.state = 'ended';
                    break;
                case 'waiting':
                    newState.state = 'waiting';
                    break;
                case 'canplay':
                    newState.state = 'canplay';
                    break;
                case 'loadstart':
                    newState.state = 'loading';
                    break;
                case 'volumechange':
                    if (videoRef.current) {
                        newState.volume = videoRef.current.volume;
                        newState.muted = videoRef.current.muted;
                    }
                    break;
                case 'ratechange':
                    if ('rate' in data.payload) {
                        newState.playbackRate = data.payload.rate;
                    }
                    break;
                case 'qualitychange':
                    if ('to' in data.payload) {
                        newState.quality = data.payload.to;
                    }
                    break;
                case 'fullscreenchange':
                    newState.isFullscreen = document.fullscreenElement === videoRef.current;
                    break;
                case 'pip':
                    newState.isPiP = document.pictureInPictureElement === videoRef.current;
                    break;
                case 'error':
                    newState.error = data.payload?.message || 'Unknown error';
                    newState.state = 'error';
                    break;
                case 'progress':
                    if (videoRef.current && videoRef.current.buffered.length > 0) {
                        const buffered = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
                        newState.buffered = buffered;
                    }
                    break;
            }
            return newState;
        });
        // 触发回调
        onEvent?.(type, data);
    }, [showEventLog, onEvent]);
    // 状态变化回调
    useEffect(() => {
        onStateChange?.(playerState);
    }, [playerState, onStateChange]);
    // 初始化播放器
    const initializePlayer = useCallback(async () => {
        if (!videoRef.current)
            return;
        // 销毁旧播放器
        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            }
            catch (error) {
                console.warn('Error destroying previous player:', error);
            }
            playerRef.current = null;
        }
        try {
            const player = createSmartVideoPlayer(videoRef.current, config);
            playerRef.current = player;
            // 绑定所有视频事件
            const eventTypes = [
                'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
                'play', 'playing', 'pause', 'seeking', 'seeked', 'waiting',
                'timeupdate', 'progress', 'volumechange', 'ratechange',
                'ended', 'error', 'qualitychange', 'fullscreenchange', 'pip', 'buffering', 'ready'
            ];
            eventTypes.forEach(eventType => {
                player.on(eventType, (eventData) => {
                    handleVideoEvent(eventType, eventData);
                });
            });
            // 初始化状态
            setPlayerState(prev => ({
                ...prev,
                state: 'idle',
                error: null
            }));
        }
        catch (error) {
            console.error('Failed to initialize player:', error);
            setPlayerState(prev => ({
                ...prev,
                state: 'error',
                error: error instanceof Error ? error.message : 'Failed to initialize player'
            }));
            onError?.(error instanceof Error ? error : new Error('Failed to initialize player'));
        }
    }, [config, handleVideoEvent, onError]);
    // 组件挂载时初始化播放器
    useEffect(() => {
        initializePlayer();
        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                }
                catch (error) {
                    console.warn('Error destroying player on unmount:', error);
                }
            }
        };
    }, [initializePlayer]);
    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
        player: playerRef.current,
        element: videoRef.current,
        getState: () => playerState,
        play: async () => {
            if (playerRef.current) {
                await playerRef.current.play();
            }
        },
        pause: () => {
            if (playerRef.current) {
                playerRef.current.pause();
            }
        },
        seek: (time) => {
            if (playerRef.current) {
                playerRef.current.seek(time);
            }
        },
        setVolume: (volume) => {
            if (playerRef.current) {
                playerRef.current.setVolume(volume);
            }
        },
        setQuality: (quality) => {
            if (playerRef.current) {
                playerRef.current.setQuality(quality);
            }
        },
        setPlaybackRate: (rate) => {
            if (playerRef.current) {
                playerRef.current.setPlaybackRate(rate);
            }
        },
        toggleFullscreen: async () => {
            if (playerRef.current) {
                await playerRef.current.toggleFullscreen();
            }
        },
        togglePiP: async () => {
            if (playerRef.current) {
                await playerRef.current.togglePiP();
            }
        },
        destroy: () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        }
    }), [playerState]);
    return (jsxs("div", { className: `leo-video-player ${className}`, style: { width, height, ...style }, children: [jsx("video", { ref: videoRef, controls: showControls, style: { width: '100%', height: '100%' }, playsInline: true }), showEventLog && (jsxs("div", { className: "leo-video-events", style: {
                    marginTop: '10px',
                    maxHeight: '200px',
                    overflow: 'auto',
                    border: '1px solid #ccc',
                    padding: '10px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }, children: [jsx("h4", { children: "Event Log:" }), eventLogs.map(log => (jsxs("div", { style: { marginBottom: '5px' }, children: [jsx("span", { style: { color: '#666' }, children: new Date(log.timestamp).toLocaleTimeString() }), ' ', jsx("strong", { children: log.type }), ' ', jsx("span", { style: { color: '#888' }, children: JSON.stringify(log.data) })] }, log.id)))] }))] }));
});
LeoVideoPlayer.displayName = 'LeoVideoPlayer';

const defaultPlayerState = {
    state: 'idle',
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    quality: 'auto',
    playbackRate: 1,
    buffered: 0,
    isFullscreen: false,
    isPiP: false,
    error: null
};
/**
 * useLeoVideo Hook
 *
 * 提供完整的视频播放器功能，包括状态管理、事件处理和控制方法
 *
 * @param options Hook配置选项
 * @returns 播放器实例和控制方法
 */
const useLeoVideo = ({ config, autoInit = true, onStateChange, onEvent, onError }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const [playerState, setPlayerState] = useState(defaultPlayerState);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);
    // 处理视频事件
    const handleVideoEvent = useCallback((type, data) => {
        // 更新播放器状态
        setPlayerState(prev => {
            const newState = { ...prev };
            switch (type) {
                case 'ready':
                    setIsReady(true);
                    newState.state = 'canplay';
                    break;
                case 'loadedmetadata':
                    newState.duration = data.duration;
                    break;
                case 'timeupdate':
                    newState.currentTime = data.currentTime;
                    newState.duration = data.duration;
                    break;
                case 'play':
                    newState.state = 'play';
                    break;
                case 'playing':
                    newState.state = 'playing';
                    break;
                case 'pause':
                    newState.state = 'paused';
                    break;
                case 'ended':
                    newState.state = 'ended';
                    break;
                case 'waiting':
                    newState.state = 'waiting';
                    break;
                case 'canplay':
                    newState.state = 'canplay';
                    break;
                case 'loadstart':
                    newState.state = 'loading';
                    break;
                case 'volumechange':
                    if (videoRef.current) {
                        newState.volume = videoRef.current.volume;
                        newState.muted = videoRef.current.muted;
                    }
                    break;
                case 'ratechange':
                    if ('rate' in data.payload) {
                        newState.playbackRate = data.payload.rate;
                    }
                    break;
                case 'qualitychange':
                    if ('to' in data.payload) {
                        newState.quality = data.payload.to;
                    }
                    break;
                case 'fullscreenchange':
                    newState.isFullscreen = document.fullscreenElement === videoRef.current;
                    break;
                case 'pip':
                    newState.isPiP = document.pictureInPictureElement === videoRef.current;
                    break;
                case 'error':
                    const errorMessage = data.payload?.message || 'Unknown error';
                    newState.error = errorMessage;
                    newState.state = 'error';
                    setError(new Error(errorMessage));
                    break;
                case 'progress':
                    if (videoRef.current && videoRef.current.buffered.length > 0) {
                        const buffered = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
                        newState.buffered = buffered;
                    }
                    break;
            }
            return newState;
        });
        // 触发回调
        onEvent?.(type, data);
    }, [onEvent]);
    // 状态变化回调
    useEffect(() => {
        onStateChange?.(playerState);
    }, [playerState, onStateChange]);
    // 初始化播放器
    const initialize = useCallback(async () => {
        if (!videoRef.current) {
            throw new Error('Video element is not available');
        }
        // 销毁旧播放器
        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            }
            catch (err) {
                console.warn('Error destroying previous player:', err);
            }
            playerRef.current = null;
        }
        try {
            setError(null);
            setIsReady(false);
            const player = createSmartVideoPlayer(videoRef.current, config);
            playerRef.current = player;
            // 绑定所有视频事件
            const eventTypes = [
                'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
                'play', 'playing', 'pause', 'seeking', 'seeked', 'waiting',
                'timeupdate', 'progress', 'volumechange', 'ratechange',
                'ended', 'error', 'qualitychange', 'fullscreenchange', 'pip', 'buffering', 'ready'
            ];
            eventTypes.forEach(eventType => {
                player.on(eventType, (eventData) => {
                    handleVideoEvent(eventType, eventData);
                });
            });
            // 重置状态
            setPlayerState(prev => ({
                ...prev,
                state: 'idle',
                error: null
            }));
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to initialize player');
            setError(error);
            setPlayerState(prev => ({
                ...prev,
                state: 'error',
                error: error.message
            }));
            onError?.(error);
            throw error;
        }
    }, [config, handleVideoEvent, onError]);
    // 控制方法
    const play = useCallback(async () => {
        if (!playerRef.current)
            throw new Error('Player not initialized');
        await playerRef.current.play();
    }, []);
    const pause = useCallback(() => {
        if (!playerRef.current)
            throw new Error('Player not initialized');
        playerRef.current.pause();
    }, []);
    const seek = useCallback((time) => {
        if (!playerRef.current)
            throw new Error('Player not initialized');
        playerRef.current.seek(time);
    }, []);
    const setVolume = useCallback((volume) => {
        if (!playerRef.current)
            throw new Error('Player not initialized');
        playerRef.current.setVolume(volume);
    }, []);
    const setQuality = useCallback((quality) => {
        if (!playerRef.current)
            throw new Error('Player not initialized');
        playerRef.current.setQuality(quality);
    }, []);
    const setPlaybackRate = useCallback((rate) => {
        if (!playerRef.current)
            throw new Error('Player not initialized');
        playerRef.current.setPlaybackRate(rate);
    }, []);
    const toggleFullscreen = useCallback(async () => {
        if (!playerRef.current)
            throw new Error('Player not initialized');
        await playerRef.current.toggleFullscreen();
    }, []);
    const togglePiP = useCallback(async () => {
        if (!playerRef.current)
            throw new Error('Player not initialized');
        await playerRef.current.togglePiP();
    }, []);
    const destroy = useCallback(() => {
        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            }
            catch (err) {
                console.warn('Error destroying player:', err);
            }
            playerRef.current = null;
        }
        setIsReady(false);
        setError(null);
        setPlayerState(defaultPlayerState);
    }, []);
    // 状态查询方法
    const getAvailableQualities = useCallback(() => {
        if (!playerRef.current)
            return ['auto'];
        return playerRef.current.getAvailableQualities();
    }, []);
    const getCurrentTime = useCallback(() => {
        return playerState.currentTime;
    }, [playerState.currentTime]);
    const getDuration = useCallback(() => {
        return playerState.duration;
    }, [playerState.duration]);
    const getVolume = useCallback(() => {
        return playerState.volume;
    }, [playerState.volume]);
    const isMuted = useCallback(() => {
        return playerState.muted;
    }, [playerState.muted]);
    const isPlaying = useCallback(() => {
        return playerState.state === 'playing';
    }, [playerState.state]);
    const isPaused = useCallback(() => {
        return playerState.state === 'paused';
    }, [playerState.state]);
    const isEnded = useCallback(() => {
        return playerState.state === 'ended';
    }, [playerState.state]);
    const isFullscreen = useCallback(() => {
        return playerState.isFullscreen;
    }, [playerState.isFullscreen]);
    const isPictureInPicture = useCallback(() => {
        return playerState.isPiP;
    }, [playerState.isPiP]);
    // 自动初始化
    useEffect(() => {
        if (autoInit) {
            initialize().catch(console.error);
        }
        return () => {
            destroy();
        };
    }, [autoInit, initialize, destroy]);
    return {
        videoRef,
        player: playerRef.current,
        state: playerState,
        isReady,
        error,
        // 控制方法
        initialize,
        play,
        pause,
        seek,
        setVolume,
        setQuality,
        setPlaybackRate,
        toggleFullscreen,
        togglePiP,
        destroy,
        // 状态查询
        getAvailableQualities,
        getCurrentTime,
        getDuration,
        getVolume,
        isMuted,
        isPlaying,
        isPaused,
        isEnded,
        isFullscreen,
        isPictureInPicture
    };
};

/**
 * 检测HLS支持情况
 */
const detectHLSSupport = () => {
    // 检查原生HLS支持
    const video = document.createElement('video');
    const nativeSupport = video.canPlayType('application/vnd.apple.mpegurl') !== '' ||
        video.canPlayType('application/x-mpegURL') !== '';
    // 检查hls.js支持
    const hlsjsSupport = Hls.isSupported();
    const supported = nativeSupport || hlsjsSupport;
    let reason;
    if (!supported) {
        reason = 'Neither native HLS nor hls.js is supported in this environment';
    }
    return {
        supported,
        native: nativeSupport,
        hlsjs: hlsjsSupport,
        reason
    };
};
/**
 * 检测DASH支持情况
 */
const detectDASHSupport = () => {
    // 检查原生DASH支持
    const video = document.createElement('video');
    const nativeSupport = video.canPlayType('application/dash+xml') !== '';
    // 检查dash.js支持（如果可用）
    const dashjsSupport = typeof window !== 'undefined' && 'dashjs' in window;
    const supported = nativeSupport || dashjsSupport;
    let reason;
    if (!supported) {
        reason = 'Neither native DASH nor dash.js is supported in this environment';
    }
    return {
        supported,
        native: nativeSupport,
        dashjs: dashjsSupport,
        reason
    };
};
/**
 * 检测各种视频格式支持情况
 */
const detectVideoFormats = () => {
    const video = document.createElement('video');
    return {
        mp4: video.canPlayType('video/mp4') !== '',
        webm: video.canPlayType('video/webm') !== '',
        ogg: video.canPlayType('video/ogg') !== '',
        hls: detectHLSSupport().supported,
        dash: detectDASHSupport().supported
    };
};
/**
 * 创建基础视频配置
 */
const createVideoConfig = (sources) => {
    return {
        sources,
        autoplay: false,
        controls: true,
        muted: false,
        loop: false,
        preload: 'metadata',
        playsinline: true
    };
};
/**
 * 验证视频配置
 */
const validateVideoConfig = (config) => {
    if (!config || typeof config !== 'object') {
        return false;
    }
    if (!Array.isArray(config.sources) || config.sources.length === 0) {
        return false;
    }
    // 验证每个源
    for (const source of config.sources) {
        if (!source.src || typeof source.src !== 'string') {
            return false;
        }
        if (!source.type || typeof source.type !== 'string') {
            return false;
        }
    }
    return true;
};
/**
 * 类型守卫 - 检查是否为有效的视频状态
 */
const isVideoState = (value) => {
    return typeof value === 'string' && [
        'idle', 'loading', 'canplay', 'play', 'playing',
        'pause', 'paused', 'seeking', 'waiting', 'ended', 'error'
    ].includes(value);
};
/**
 * 断言函数 - 验证视频配置
 */
const assertVideoConfig = (config) => {
    if (!validateVideoConfig(config)) {
        throw new Error('Invalid video configuration');
    }
};

// 主要组件导出
// 版本信息
const version = '1.0.0';

export { HLSPlayer, HTML5VideoAPI, LeoVideoPlayer, PresetConfigFactory, VideoConfigBuilder, VideoEventEmitter, VideoEventEmitterTyped, VideoPlayerFactory, assertVideoConfig, createSmartVideoPlayer, createVideoConfig, LeoVideoPlayer as default, detectDASHSupport, detectHLSSupport, detectVideoFormats, isVideoState, useLeoVideo, validateVideoConfig, version };
//# sourceMappingURL=index.esm.js.map
