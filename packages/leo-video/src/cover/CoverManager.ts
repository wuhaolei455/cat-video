// Cover管理器实现

import { BaseCover } from './BaseCover';
import { CoverEventEmitter } from './CoverEventEmitter';
import type {
  ICoverManager,
  ICover,
  CoverManagerConfig,
  CoverContainerState,
  CoverConfig,
  CoverType,
  CoverLayer,
  CoverEventType,
  CoverEventData,
  CoverVisibility,
  VideoEventType
} from '../types';

export class CoverManager extends CoverEventEmitter implements ICoverManager {
  private _config: CoverManagerConfig;
  private _state: CoverContainerState;
  private _container: HTMLElement | null = null;
  private _isDestroyed = false;
  private _resizeObserver: ResizeObserver | null = null;
  private _videoElement: HTMLVideoElement | null = null;
  private _videoState: any = null;

  constructor(config: CoverManagerConfig) {
    super();
    
    this._config = { ...config };
    this._state = {
      covers: new Map(),
      visibleCovers: new Set(),
      focusedCover: null,
      hoveredCover: null,
      draggingCover: null
    };
  }

  // ============ Getter 属性 ============

  get config(): CoverManagerConfig {
    return { ...this._config };
  }

  get state(): CoverContainerState {
    return {
      covers: new Map(this._state.covers),
      visibleCovers: new Set(this._state.visibleCovers),
      focusedCover: this._state.focusedCover,
      hoveredCover: this._state.hoveredCover,
      draggingCover: this._state.draggingCover
    };
  }

  get container(): HTMLElement {
    if (!this._container) {
      throw new Error('CoverManager not initialized');
    }
    return this._container;
  }

  // ============ Cover管理方法 ============

  addCover(config: CoverConfig): ICover {
    if (this._isDestroyed) {
      throw new Error('CoverManager has been destroyed');
    }

    if (this._state.covers.has(config.id)) {
      throw new Error(`Cover with id "${config.id}" already exists`);
    }

    // 创建Cover实例
    const cover = this.createCoverInstance(config);
    
    // 存储Cover
    this._state.covers.set(config.id, cover);
    
    // 绑定Cover事件
    this.bindCoverEvents(cover);
    
    // 挂载Cover到容器
    if (this._container) {
      cover.mount(this._container);
    }
    
    // 根据可见性配置初始显示状态
    if (this.shouldCoverBeVisible(cover)) {
      cover.show();
      this._state.visibleCovers.add(config.id);
    }
    
    return cover;
  }

  removeCover(id: string): boolean {
    const cover = this._state.covers.get(id);
    if (!cover) return false;
    
    // 清理状态
    this._state.visibleCovers.delete(id);
    if (this._state.focusedCover === id) this._state.focusedCover = null;
    if (this._state.hoveredCover === id) this._state.hoveredCover = null;
    if (this._state.draggingCover === id) this._state.draggingCover = null;
    
    // 销毁Cover
    cover.destroy();
    this._state.covers.delete(id);
    
    return true;
  }

  getCover(id: string): ICover | undefined {
    return this._state.covers.get(id);
  }

  getAllCovers(): ICover[] {
    return Array.from(this._state.covers.values());
  }

  getCoversByType(type: CoverType): ICover[] {
    return Array.from(this._state.covers.values()).filter(cover => cover.type === type);
  }

  getCoversByLayer(layer: CoverLayer): ICover[] {
    return Array.from(this._state.covers.values()).filter(cover => cover.config.layer === layer);
  }

  // ============ 状态管理方法 ============

  showCover(id: string): void {
    const cover = this._state.covers.get(id);
    if (cover) {
      cover.show();
      this._state.visibleCovers.add(id);
    }
  }

  hideCover(id: string): void {
    const cover = this._state.covers.get(id);
    if (cover) {
      cover.hide();
      this._state.visibleCovers.delete(id);
    }
  }

  enableCover(id: string): void {
    const cover = this._state.covers.get(id);
    if (cover) {
      cover.enable();
    }
  }

  disableCover(id: string): void {
    const cover = this._state.covers.get(id);
    if (cover) {
      cover.disable();
    }
  }

  // ============ 批量操作方法 ============

  showCoversByType(type: CoverType): void {
    this.getCoversByType(type).forEach(cover => {
      cover.show();
      this._state.visibleCovers.add(cover.id);
    });
  }

  hideCoversByType(type: CoverType): void {
    this.getCoversByType(type).forEach(cover => {
      cover.hide();
      this._state.visibleCovers.delete(cover.id);
    });
  }

  showCoversByLayer(layer: CoverLayer): void {
    this.getCoversByLayer(layer).forEach(cover => {
      cover.show();
      this._state.visibleCovers.add(cover.id);
    });
  }

  hideCoversByLayer(layer: CoverLayer): void {
    this.getCoversByLayer(layer).forEach(cover => {
      cover.hide();
      this._state.visibleCovers.delete(cover.id);
    });
  }

  // ============ 布局管理方法 ============

  updateLayout(): void {
    if (!this._container) return;
    
    // 按层级排序Cover
    const sortedCovers = this.getSortedCoversByLayer();
    
    // 重新排列DOM顺序
    sortedCovers.forEach(cover => {
      if (cover.element && cover.element.parentNode) {
        this._container!.appendChild(cover.element);
      }
    });
    
    // 更新响应式布局
    this.updateResponsiveLayout();
  }

  handleResize(): void {
    if (!this._container) return;
    
    // 获取容器尺寸
    const containerRect = this._container.getBoundingClientRect();
    
    // 更新Cover布局
    this._state.covers.forEach(cover => {
      this.updateCoverLayout(cover, containerRect);
    });
  }

  // ============ 生命周期方法 ============

  async initialize(container: HTMLElement): Promise<void> {
    if (this._isDestroyed) {
      throw new Error('CoverManager has been destroyed');
    }
    
    this._container = container;
    
    // 设置容器样式
    this.setupContainer();
    
    // 创建预配置的Cover
    await this.createPresetCovers();
    
    // 设置响应式监听
    this.setupResponsiveObserver();
    
    // 设置事件监听
    this.setupEventListeners();
  }

  async destroy(): Promise<void> {
    if (this._isDestroyed) return;
    
    // 清理所有Cover
    this._state.covers.forEach(cover => cover.destroy());
    this._state.covers.clear();
    
    // 清理观察器
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    
    // 清理事件监听器
    this.removeAllListeners();
    
    // 重置状态
    this._state = {
      covers: new Map(),
      visibleCovers: new Set(),
      focusedCover: null,
      hoveredCover: null,
      draggingCover: null
    };
    
    this._container = null;
    this._videoElement = null;
    this._isDestroyed = true;
  }

  // ============ 视频事件处理 ============

  handleVideoEvent(eventType: VideoEventType, eventData: any): void {
    this._videoState = eventData;
    
    // 根据视频状态更新Cover可见性
    this.updateCoverVisibility(eventType, eventData);
    
    // 转发事件给Cover
    this._state.covers.forEach(cover => {
      if (this.shouldCoverReceiveVideoEvent(cover, eventType)) {
        (cover as any).handleVideoEvent?.(eventType, eventData);
      }
    });
  }

  // ============ 私有方法 ============

  private createCoverInstance(config: CoverConfig): ICover {
    // 这里应该根据Cover类型创建相应的实例
    // 为了演示，我们创建一个基础的Cover实现
    return new (class extends BaseCover {
      protected createElement(): HTMLElement {
        const element = document.createElement('div');
        element.id = this.id;
        element.className = `cover cover-${this.type}`;
        
        // 根据Cover类型设置默认内容
        switch (this.type) {
          case 'play-button':
            element.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="M8 5v14l11-7z"/></svg>';
            element.style.cursor = 'pointer';
            break;
          case 'loading-spinner':
            element.innerHTML = '<div class="spinner"></div>';
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'center';
            break;
          case 'error-message':
            element.innerHTML = '<div class="error-text">播放出错</div>';
            element.style.color = 'red';
            element.style.background = 'rgba(0,0,0,0.8)';
            element.style.padding = '10px';
            element.style.borderRadius = '4px';
            break;
          default:
            element.innerHTML = `<div>${this.type}</div>`;
        }
        
        return element;
      }
      
      protected onDataUpdate(data: Record<string, any>): void {
        // 数据更新时的处理逻辑
        if (this._element) {
          Object.keys(data).forEach(key => {
            this._element!.setAttribute(`data-${key}`, String(data[key]));
          });
        }
      }
    })(config.id, config.type, config);
  }

  private bindCoverEvents(cover: ICover): void {
    // 绑定Cover的所有事件到管理器
    const coverEventTypes: CoverEventType[] = [
      'cover:show', 'cover:hide', 'cover:click', 'cover:hover',
      'cover:focus', 'cover:blur', 'cover:mount', 'cover:unmount',
      'cover:update', 'cover:error'
    ];
    
    coverEventTypes.forEach(eventType => {
      cover.on(eventType, (data: CoverEventData) => {
        // 更新管理器状态
        this.updateManagerState(eventType, data);
        
        // 转发事件
        this.emit(eventType, data);
      });
    });
  }

  private shouldCoverBeVisible(cover: ICover): boolean {
    const visibility = cover.config.visibility;
    
    switch (visibility) {
      case 'always':
        return true;
      case 'playing':
        return this._videoState?.state === 'playing';
      case 'paused':
        return this._videoState?.state === 'paused';
      case 'loading':
        return this._videoState?.state === 'loading';
      case 'error':
        return this._videoState?.state === 'error';
      case 'ended':
        return this._videoState?.state === 'ended';
      case 'custom':
        return cover.config.visibilityCondition?.(this._videoState, cover.state) || false;
      default:
        return false;
    }
  }

  private shouldCoverReceiveVideoEvent(cover: ICover, eventType: VideoEventType): boolean {
    // 根据Cover类型和配置决定是否应该接收视频事件
    const relevantEvents: Record<CoverType, VideoEventType[]> = {
      'play-button': ['play', 'pause', 'ended'],
      'progress-bar': ['timeupdate', 'progress', 'loadedmetadata'],
      'volume-control': ['volumechange'],
      'loading-spinner': ['loadstart', 'waiting', 'canplay'],
      'error-message': ['error'],
      'quality-selector': ['qualitychange'],
      // 其他Cover类型...
    } as any;
    
    const relevantForCover = relevantEvents[cover.type] || [];
    return relevantForCover.includes(eventType);
  }

  private updateCoverVisibility(eventType: VideoEventType, eventData: any): void {
    this._state.covers.forEach((cover, id) => {
      const shouldBeVisible = this.shouldCoverBeVisible(cover);
      const isCurrentlyVisible = this._state.visibleCovers.has(id);
      
      if (shouldBeVisible && !isCurrentlyVisible) {
        cover.show();
        this._state.visibleCovers.add(id);
      } else if (!shouldBeVisible && isCurrentlyVisible) {
        cover.hide();
        this._state.visibleCovers.delete(id);
      }
    });
  }

  private updateManagerState(eventType: CoverEventType, data: CoverEventData): void {
    switch (eventType) {
      case 'cover:focus':
        this._state.focusedCover = data.coverId;
        break;
      case 'cover:blur':
        if (this._state.focusedCover === data.coverId) {
          this._state.focusedCover = null;
        }
        break;
      case 'cover:hover':
        this._state.hoveredCover = data.coverId;
        break;
    }
  }

  private getSortedCoversByLayer(): ICover[] {
    const layerOrder: CoverLayer[] = ['background', 'content', 'control', 'overlay', 'modal', 'toast'];
    
    return Array.from(this._state.covers.values()).sort((a, b) => {
      const aIndex = layerOrder.indexOf(a.config.layer);
      const bIndex = layerOrder.indexOf(b.config.layer);
      return aIndex - bIndex;
    });
  }

  private updateCoverLayout(cover: ICover, containerRect: DOMRect): void {
    // 根据响应式配置更新Cover布局
    if (!this._config.responsive) return;
    
    const { breakpoints, coverConfigs } = this._config.responsive;
    const containerWidth = containerRect.width;
    
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (containerWidth <= breakpoints.mobile) {
      deviceType = 'mobile';
    } else if (containerWidth <= breakpoints.tablet) {
      deviceType = 'tablet';
    }
    
    const deviceConfigs = coverConfigs[deviceType];
    if (deviceConfigs) {
      const matchingConfig = deviceConfigs.find(config => config.id === cover.id);
      if (matchingConfig) {
        // 应用响应式配置
        if (matchingConfig.position) {
          cover.updatePosition(matchingConfig.position);
        }
        if (matchingConfig.style) {
          cover.updateStyle(matchingConfig.style);
        }
      }
    }
  }

  private setupContainer(): void {
    if (!this._container) return;
    
    // 设置容器为相对定位
    this._container.style.position = 'relative';
    this._container.style.width = '100%';
    this._container.style.height = '100%';
    
    // 应用全局样式
    if (this._config.globalStyle) {
      Object.assign(this._container.style, this._config.globalStyle);
    }
    
    // 添加CSS类
    this._container.classList.add('cover-container');
  }

  private async createPresetCovers(): Promise<void> {
    // 创建通用Cover
    for (const coverConfig of this._config.commonCovers) {
      try {
        this.addCover(coverConfig);
      } catch (error) {
        console.warn(`Failed to create common cover ${coverConfig.id}:`, error);
      }
    }
    
    // 创建业务Cover
    for (const coverConfig of this._config.businessCovers) {
      try {
        this.addCover(coverConfig);
      } catch (error) {
        console.warn(`Failed to create business cover ${coverConfig.id}:`, error);
      }
    }
  }

  private setupResponsiveObserver(): void {
    if (!this._container || !this._config.responsive) return;
    
    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this._container) {
          this.handleResize();
        }
      }
    });
    
    this._resizeObserver.observe(this._container);
  }

  private setupEventListeners(): void {
    if (!this._container) return;
    
    // 全局事件监听
    this._container.addEventListener('click', this.handleGlobalClick.bind(this));
    this._container.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));
  }

  private updateResponsiveLayout(): void {
    if (!this._container) return;
    
    const containerRect = this._container.getBoundingClientRect();
    this._state.covers.forEach(cover => {
      this.updateCoverLayout(cover, containerRect);
    });
  }

  private handleGlobalClick(event: MouseEvent): void {
    // 全局点击事件处理
    const target = event.target as HTMLElement;
    const cover = this.findCoverByElement(target);
    
    if (!cover) {
      // 点击了非Cover区域，可能需要隐藏某些Cover
      this.handleOutsideClick(event);
    }
  }

  private handleGlobalKeyDown(event: KeyboardEvent): void {
    // 全局键盘事件处理
    const focusedCover = this._state.focusedCover 
      ? this._state.covers.get(this._state.focusedCover)
      : null;
    
    if (focusedCover) {
      // 转发键盘事件给焦点Cover
      (focusedCover as any).handleKeyDown?.(event);
    }
  }

  private findCoverByElement(element: HTMLElement): ICover | null {
    for (const cover of this._state.covers.values()) {
      if (cover.element && (cover.element === element || cover.element.contains(element))) {
        return cover;
      }
    }
    return null;
  }

  private handleOutsideClick(event: MouseEvent): void {
    // 处理点击Cover外部区域的逻辑
    // 例如：隐藏模态Cover、取消焦点等
  }
}
