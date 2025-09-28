// Cover基础实现类

import React from 'react';
import { CoverEventEmitter } from './CoverEventEmitter';
import type {
  ICover,
  CoverConfig,
  CoverState,
  CoverEventType,
  CoverEventData,
  CoverPosition,
  CoverType
} from '../types';

export abstract class BaseCover extends CoverEventEmitter implements ICover {
  protected _state: CoverState;
  protected _element: HTMLElement | null = null;
  protected _container: HTMLElement | null = null;
  protected _isDestroyed = false;
  protected _animationFrameId: number | null = null;

  constructor(
    public readonly id: string,
    public readonly type: CoverType,
    public readonly config: CoverConfig
  ) {
    super();
    
    // 初始化状态
    this._state = {
      visible: this.shouldBeVisible(),
      disabled: config.disabled || false,
      loading: false,
      error: null,
      data: {}
    };

    // 绑定配置中的事件处理器
    this.bindConfigEvents();
  }

  // ============ Getter 属性 ============
  
  get state(): CoverState {
    return { ...this._state };
  }

  get element(): HTMLElement | null {
    return this._element;
  }

  // ============ 状态控制方法 ============

  show(): void {
    if (this._isDestroyed || this._state.visible) return;
    
    this.updateState({ visible: true });
    this.applyVisibilityStyle(true);
    this.config.onShow?.(this);
    this.emitCoverEvent('cover:show');
  }

  hide(): void {
    if (this._isDestroyed || !this._state.visible) return;
    
    this.updateState({ visible: false });
    this.applyVisibilityStyle(false);
    this.config.onHide?.(this);
    this.emitCoverEvent('cover:hide');
  }

  toggle(): void {
    this._state.visible ? this.hide() : this.show();
  }

  enable(): void {
    if (this._isDestroyed || !this._state.disabled) return;
    
    this.updateState({ disabled: false });
    this.applyDisabledStyle(false);
  }

  disable(): void {
    if (this._isDestroyed || this._state.disabled) return;
    
    this.updateState({ disabled: true });
    this.applyDisabledStyle(true);
  }

  // ============ 数据操作方法 ============

  updateData(data: Partial<Record<string, any>>): void {
    if (this._isDestroyed) return;
    
    const newData = { ...this._state.data, ...data };
    this.updateState({ data: newData });
    this.onDataUpdate(newData);
  }

  getData(key?: string): any {
    if (key) {
      return this._state.data[key];
    }
    return { ...this._state.data };
  }

  // ============ 样式操作方法 ============

  updateStyle(style: Partial<React.CSSProperties>): void {
    if (!this._element || this._isDestroyed) return;
    
    Object.assign(this._element.style, style);
  }

  updatePosition(position: Partial<CoverPosition>): void {
    if (!this._element || this._isDestroyed) return;
    
    const positionStyles: React.CSSProperties = {};
    
    if (position.top !== undefined) {
      positionStyles.top = typeof position.top === 'number' ? `${position.top}px` : position.top;
    }
    if (position.right !== undefined) {
      positionStyles.right = typeof position.right === 'number' ? `${position.right}px` : position.right;
    }
    if (position.bottom !== undefined) {
      positionStyles.bottom = typeof position.bottom === 'number' ? `${position.bottom}px` : position.bottom;
    }
    if (position.left !== undefined) {
      positionStyles.left = typeof position.left === 'number' ? `${position.left}px` : position.left;
    }
    if (position.width !== undefined) {
      positionStyles.width = typeof position.width === 'number' ? `${position.width}px` : position.width;
    }
    if (position.height !== undefined) {
      positionStyles.height = typeof position.height === 'number' ? `${position.height}px` : position.height;
    }
    if (position.x !== undefined) {
      positionStyles.transform = `translateX(${typeof position.x === 'number' ? position.x + 'px' : position.x})`;
    }
    if (position.y !== undefined) {
      const currentTransform = positionStyles.transform || this._element.style.transform || '';
      const yTransform = `translateY(${typeof position.y === 'number' ? position.y + 'px' : position.y})`;
      positionStyles.transform = currentTransform ? `${currentTransform} ${yTransform}` : yTransform;
    }
    
    this.updateStyle(positionStyles);
  }

  // ============ 生命周期方法 ============

  mount(container: HTMLElement): void {
    if (this._isDestroyed || this._element) return;
    
    this._container = container;
    this._element = this.createElement();
    
    if (this._element) {
      this.setupElement();
      this.setupEventListeners();
      container.appendChild(this._element);
      this.config.onMount?.(this);
      this.emitCoverEvent('cover:mount');
    }
  }

  unmount(): void {
    if (this._isDestroyed || !this._element) return;
    
    this.cleanup();
    
    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }
    
    this._element = null;
    this._container = null;
    this.config.onUnmount?.(this);
    this.emitCoverEvent('cover:unmount');
  }

  destroy(): void {
    if (this._isDestroyed) return;
    
    this.unmount();
    this.cleanup();
    this.removeAllListeners();
    this._isDestroyed = true;
  }

  // ============ 抽象方法 - 子类需要实现 ============

  protected abstract createElement(): HTMLElement;
  protected abstract onDataUpdate(data: Record<string, any>): void;

  // ============ 保护方法 - 子类可重写 ============

  protected setupElement(): void {
    if (!this._element) return;
    
    // 设置基础样式
    this.applyBaseStyles();
    this.applyPositionStyles();
    this.applyConfigStyles();
    this.applyLayerStyles();
    this.applyVisibilityStyle(this._state.visible);
    this.applyDisabledStyle(this._state.disabled);
  }

  protected setupEventListeners(): void {
    if (!this._element || !this.config.interactive) return;
    
    // 点击事件
    if (this.config.onClick) {
      this._element.addEventListener('click', this.handleClick.bind(this));
    }
    
    // 悬停事件
    if (this.config.onHover) {
      this._element.addEventListener('mouseenter', this.handleHover.bind(this));
      this._element.addEventListener('mouseleave', this.handleHoverLeave.bind(this));
    }
    
    // 焦点事件
    this._element.addEventListener('focus', this.handleFocus.bind(this));
    this._element.addEventListener('blur', this.handleBlur.bind(this));
  }

  protected shouldBeVisible(): boolean {
    // 子类可重写此方法实现自定义可见性逻辑
    return this.config.visibility === 'always';
  }

  // ============ 私有方法 ============

  private updateState(update: Partial<CoverState>): void {
    const prevState = { ...this._state };
    this._state = { ...this._state, ...update };
    
    // 发射状态更新事件
    this.emitCoverEvent('cover:update', {
      prevState,
      currentState: this._state
    });
  }

  private applyBaseStyles(): void {
    if (!this._element) return;
    
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      boxSizing: 'border-box',
      pointerEvents: this.config.interactive ? 'auto' : 'none',
      userSelect: 'none',
      transition: 'all 0.3s ease',
    };
    
    Object.assign(this._element.style, baseStyles);
  }

  private applyPositionStyles(): void {
    if (!this._element) return;
    
    const position = this.config.position;
    const positionStyles: Record<string, string> = {};
    
    if (position.top !== undefined) {
      positionStyles.top = typeof position.top === 'number' ? `${position.top}px` : position.top;
    }
    if (position.right !== undefined) {
      positionStyles.right = typeof position.right === 'number' ? `${position.right}px` : position.right;
    }
    if (position.bottom !== undefined) {
      positionStyles.bottom = typeof position.bottom === 'number' ? `${position.bottom}px` : position.bottom;
    }
    if (position.left !== undefined) {
      positionStyles.left = typeof position.left === 'number' ? `${position.left}px` : position.left;
    }
    if (position.width !== undefined) {
      positionStyles.width = typeof position.width === 'number' ? `${position.width}px` : position.width;
    }
    if (position.height !== undefined) {
      positionStyles.height = typeof position.height === 'number' ? `${position.height}px` : position.height;
    }
    
    Object.assign(this._element.style, positionStyles);
  }

  private applyConfigStyles(): void {
    if (!this._element) return;
    
    // 应用配置中的样式
    if (this.config.style) {
      Object.assign(this._element.style, this.config.style);
    }
    
    // 应用类名
    if (this.config.className) {
      this._element.className = this.config.className;
    }
  }

  private applyLayerStyles(): void {
    if (!this._element) return;
    
    // 根据层级设置z-index
    const layerZIndex: Record<string, number> = {
      'background': 1,
      'content': 10,
      'control': 100,
      'overlay': 1000,
      'modal': 10000,
      'toast': 100000
    };
    
    this._element.style.zIndex = layerZIndex[this.config.layer].toString();
  }

  private applyVisibilityStyle(visible: boolean): void {
    if (!this._element) return;
    
    if (visible) {
      this._element.style.display = 'block';
      this._element.style.opacity = '1';
      this.applyEnterAnimation();
    } else {
      this.applyExitAnimation(() => {
        if (this._element) {
          this._element.style.display = 'none';
        }
      });
    }
  }

  private applyDisabledStyle(disabled: boolean): void {
    if (!this._element) return;
    
    this._element.style.opacity = disabled ? '0.5' : '1';
    this._element.style.pointerEvents = disabled ? 'none' : (this.config.interactive ? 'auto' : 'none');
  }

  private applyEnterAnimation(): void {
    if (!this.config.animation?.enter || !this._element) return;
    
    const animation = this.config.animation.enter;
    const duration = animation.duration || 300;
    const easing = animation.easing || 'ease';
    const delay = animation.delay || 0;
    
    this._element.style.transition = `all ${duration}ms ${easing} ${delay}ms`;
    
    // 根据动画类型应用不同效果
    switch (animation.type) {
      case 'fade':
        this._element.style.opacity = '0';
        setTimeout(() => {
          if (this._element) this._element.style.opacity = '1';
        }, delay);
        break;
      case 'slide':
        this._element.style.transform = 'translateY(-20px)';
        setTimeout(() => {
          if (this._element) this._element.style.transform = 'translateY(0)';
        }, delay);
        break;
      case 'scale':
        this._element.style.transform = 'scale(0.8)';
        setTimeout(() => {
          if (this._element) this._element.style.transform = 'scale(1)';
        }, delay);
        break;
    }
  }

  private applyExitAnimation(callback?: () => void): void {
    if (!this.config.animation?.exit || !this._element) {
      callback?.();
      return;
    }
    
    const animation = this.config.animation.exit;
    const duration = animation.duration || 300;
    const easing = animation.easing || 'ease';
    const delay = animation.delay || 0;
    
    this._element.style.transition = `all ${duration}ms ${easing}`;
    
    // 根据动画类型应用不同效果
    switch (animation.type) {
      case 'fade':
        this._element.style.opacity = '0';
        break;
      case 'slide':
        this._element.style.transform = 'translateY(-20px)';
        break;
      case 'scale':
        this._element.style.transform = 'scale(0.8)';
        break;
    }
    
    setTimeout(() => {
      callback?.();
    }, duration + delay);
  }

  private bindConfigEvents(): void {
    // 绑定配置中的事件处理器到Cover事件系统
    // 子类可以重写此方法来添加特定的事件绑定
  }

  private handleClick(event: MouseEvent): void {
    if (this._state.disabled) return;
    
    this.config.onClick?.(event as any, this);
    this.emitCoverEvent('cover:click', { 
      mouseEvent: event,
      coverPosition: this._element?.getBoundingClientRect()
    });
  }

  private handleHover(event: MouseEvent): void {
    if (this._state.disabled) return;
    
    this.config.onHover?.(event as any, this);
    this.emitCoverEvent('cover:hover', { 
      mouseEvent: event,
      coverPosition: this._element?.getBoundingClientRect()
    });
    
    // 应用悬停动画
    if (this.config.animation?.hover && this._element) {
      const hoverAnimation = this.config.animation.hover;
      const duration = hoverAnimation.duration || 200;
      
      switch (hoverAnimation.type) {
        case 'scale':
          this._element.style.transform = 'scale(1.05)';
          break;
        case 'glow':
          this._element.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
          break;
      }
      
      this._element.style.transition = `all ${duration}ms ease`;
    }
  }

  private handleHoverLeave(event: MouseEvent): void {
    if (this._state.disabled) return;
    
    // 重置悬停效果
    if (this.config.animation?.hover && this._element) {
      this._element.style.transform = '';
      this._element.style.boxShadow = '';
    }
  }

  private handleFocus(event: FocusEvent): void {
    this.emitCoverEvent('cover:focus', { focusEvent: event });
  }

  private handleBlur(event: FocusEvent): void {
    this.emitCoverEvent('cover:blur', { focusEvent: event });
  }

  private cleanup(): void {
    // 清理动画帧
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
    
    // 移除事件监听器
    if (this._element) {
      this._element.removeEventListener('click', this.handleClick);
      this._element.removeEventListener('mouseenter', this.handleHover);
      this._element.removeEventListener('mouseleave', this.handleHoverLeave);
      this._element.removeEventListener('focus', this.handleFocus);
      this._element.removeEventListener('blur', this.handleBlur);
    }
  }

  private emitCoverEvent(event: CoverEventType, payload: Record<string, any> = {}): void {
    const eventData: CoverEventData = {
      coverId: this.id,
      coverType: this.type,
      timestamp: Date.now(),
      payload
    };
    
    this.emit(event, eventData);
  }
}
