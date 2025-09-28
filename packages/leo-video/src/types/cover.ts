// 视频蒙层Cover相关类型定义

import type { CSSProperties, MouseEvent } from 'react';
import type { VideoEventType, VideoEventData } from './video';

// Cover类型枚举
export type CoverType =
  // 通用Cover类型
  | 'play-button'
  | 'progress-bar'
  | 'volume-control'
  | 'fullscreen-button'
  | 'loading-spinner'
  | 'error-message'
  | 'quality-selector'
  // 业务Cover类型
  | 'advertisement'
  | 'danmu'
  | 'subtitle'
  | 'interactive'
  | 'watermark'
  | 'brand-logo'
  | 'share-button'
  | 'like-button'
  | 'comment-overlay'
  | 'gift-animation'
  | 'custom';

// Cover可见性条件
export type CoverVisibility =
  | 'always'
  | 'playing'
  | 'paused'
  | 'hover'
  | 'loading'
  | 'error'
  | 'ended'
  | 'custom';

// Cover层级
export type CoverLayer =
  | 'background'
  | 'content'
  | 'control'
  | 'overlay'
  | 'modal'
  | 'toast';

// Cover位置
export interface CoverPosition {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
}

// Cover动画配置
export interface CoverAnimation {
  enter?: {
    type: 'fade' | 'slide' | 'scale' | 'bounce' | 'custom';
    duration?: number;
    easing?: string;
    delay?: number;
  };
  exit?: {
    type: 'fade' | 'slide' | 'scale' | 'bounce' | 'custom';
    duration?: number;
    easing?: string;
    delay?: number;
  };
  hover?: {
    type: 'scale' | 'glow' | 'shake' | 'custom';
    duration?: number;
  };
}

// Cover事件类型
export type CoverEventType =
  | 'cover:show'
  | 'cover:hide'
  | 'cover:click'
  | 'cover:hover'
  | 'cover:focus'
  | 'cover:blur'
  | 'cover:mount'
  | 'cover:unmount'
  | 'cover:update'
  | 'cover:error';

// Cover事件数据
export interface CoverEventData {
  coverId: string;
  coverType: CoverType;
  timestamp: number;
  payload: Record<string, any>;
}

// Cover状态
export interface CoverState {
  visible: boolean;
  disabled: boolean;
  loading: boolean;
  error: string | null;
  data: Record<string, any>;
}

// Cover基础配置
export interface CoverConfig {
  id: string;
  type: CoverType;
  name?: string;
  layer: CoverLayer;
  position: CoverPosition;
  visibility: CoverVisibility;
  visibilityCondition?: (videoState: any, coverState: CoverState) => boolean;
  animation?: CoverAnimation;
  style?: CSSProperties;
  className?: string;
  disabled?: boolean;
  interactive?: boolean;
  persistent?: boolean;
  onMount?: (cover: ICover) => void;
  onUnmount?: (cover: ICover) => void;
  onShow?: (cover: ICover) => void;
  onHide?: (cover: ICover) => void;
  onClick?: (event: MouseEvent, cover: ICover) => void;
  onHover?: (event: MouseEvent, cover: ICover) => void;
  props?: Record<string, any>;
}

// 通用Cover特定配置
export interface CommonCoverConfig extends CoverConfig {
  type: 'play-button' | 'progress-bar' | 'volume-control' | 'fullscreen-button'
    | 'loading-spinner' | 'error-message' | 'quality-selector';
}

// 业务Cover特定配置
export interface BusinessCoverConfig extends CoverConfig {
  type: 'advertisement' | 'danmu' | 'subtitle' | 'interactive' | 'watermark'
    | 'brand-logo' | 'share-button' | 'like-button' | 'comment-overlay'
    | 'gift-animation' | 'custom';
  businessData?: Record<string, any>;
  businessLogic?: ICoverBusinessLogic;
}

// Cover实例接口
export interface ICover {
  readonly id: string;
  readonly type: CoverType;
  readonly config: CoverConfig;
  readonly state: CoverState;
  readonly element: HTMLElement | null;

  show(): void;
  hide(): void;
  toggle(): void;
  enable(): void;
  disable(): void;

  updateData(data: Partial<Record<string, any>>): void;
  getData(key?: string): any;

  updateStyle(style: Partial<CSSProperties>): void;
  updatePosition(position: Partial<CoverPosition>): void;

  on(event: CoverEventType, listener: (data: CoverEventData) => void): void;
  off(event: CoverEventType, listener: (data: CoverEventData) => void): void;
  emit(event: CoverEventType, payload?: Record<string, any>): void;

  mount(container: HTMLElement): void;
  unmount(): void;
  destroy(): void;
}

// Cover业务逻辑接口
export interface ICoverBusinessLogic {
  initialize(cover: ICover): Promise<void>;
  fetchData(): Promise<any>;
  handleBusinessEvent(event: string, data: any): Promise<void>;
  validateBusinessRules(data: any): boolean;
  cleanup(): Promise<void>;
}

// Cover管理器配置
export interface CoverManagerConfig {
  commonCovers: CommonCoverConfig[];
  businessCovers: BusinessCoverConfig[];
  globalStyle?: React.CSSProperties;
  globalAnimation?: CoverAnimation;
  responsive?: {
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    coverConfigs: {
      mobile?: Partial<CoverConfig>[];
      tablet?: Partial<CoverConfig>[];
      desktop?: Partial<CoverConfig>[];
    };
  };
  theme?: {
    colors: Record<string, string>;
    fonts: Record<string, string>;
    spacing: Record<string, string | number>;
  };
}

// Cover容器状态
export interface CoverContainerState {
  covers: Map<string, ICover>;
  visibleCovers: Set<string>;
  focusedCover: string | null;
  hoveredCover: string | null;
  draggingCover: string | null;
}

// Cover管理器接口
export interface ICoverManager {
  readonly config: CoverManagerConfig;
  readonly state: CoverContainerState;
  readonly container: HTMLElement;

  addCover(config: CoverConfig): ICover;
  removeCover(id: string): boolean;
  getCover(id: string): ICover | undefined;
  getAllCovers(): ICover[];
  getCoversByType(type: CoverType): ICover[];
  getCoversByLayer(layer: CoverLayer): ICover[];

  showCover(id: string): void;
  hideCover(id: string): void;
  enableCover(id: string): void;
  disableCover(id: string): void;

  showCoversByType(type: CoverType): void;
  hideCoversByType(type: CoverType): void;
  showCoversByLayer(layer: CoverLayer): void;
  hideCoversByLayer(layer: CoverLayer): void;

  updateLayout(): void;
  handleResize(): void;

  on(event: CoverEventType | VideoEventType, listener: Function): void;
  off(event: CoverEventType | VideoEventType, listener: Function): void;
  emit(event: CoverEventType, data: CoverEventData): void;

  initialize(container: HTMLElement): Promise<void>;
  destroy(): Promise<void>;
}

// 预设Cover配置工厂
export interface ICoverPresetFactory {
  createPlayButton(config?: Partial<CommonCoverConfig>): CommonCoverConfig;
  createProgressBar(config?: Partial<CommonCoverConfig>): CommonCoverConfig;
  createVolumeControl(config?: Partial<CommonCoverConfig>): CommonCoverConfig;
  createFullscreenButton(config?: Partial<CommonCoverConfig>): CommonCoverConfig;
  createLoadingSpinner(config?: Partial<CommonCoverConfig>): CommonCoverConfig;
  createErrorMessage(config?: Partial<CommonCoverConfig>): CommonCoverConfig;
  createQualitySelector(config?: Partial<CommonCoverConfig>): CommonCoverConfig;

  createAdvertisement(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig;
  createDanmu(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig;
  createSubtitle(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig;
  createWatermark(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig;
  createBrandLogo(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig;
  createShareButton(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig;
  createLikeButton(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig;
  createCommentOverlay(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig;
  createGiftAnimation(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig;
}

// Cover状态管理接口
export interface ICoverStateManager {
  getCoverState(coverId: string): CoverState | undefined;
  getAllCoverStates(): Record<string, CoverState>;
  updateCoverState(coverId: string, update: Partial<CoverState>): void;
  batchUpdateStates(updates: Record<string, Partial<CoverState>>): void;
  subscribe(coverId: string, listener: (state: CoverState) => void): () => void;
  subscribeAll(listener: (states: Record<string, CoverState>) => void): () => void;
  saveState(coverId?: string): Promise<void>;
  loadState(coverId?: string): Promise<void>;
  clearState(coverId?: string): Promise<void>;
}


