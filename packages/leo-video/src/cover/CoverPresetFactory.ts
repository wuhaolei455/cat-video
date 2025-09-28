// Cover预设工厂类

import type {
  ICoverPresetFactory,
  CommonCoverConfig,
  BusinessCoverConfig,
  CoverConfig,
  CoverPosition,
  CoverAnimation
} from '../types';

export class CoverPresetFactory implements ICoverPresetFactory {
  
  // ============ 通用Cover预设 ============

  createPlayButton(config?: Partial<CommonCoverConfig>): CommonCoverConfig {
    const defaultPosition: CoverPosition = {
      top: '50%',
      left: '50%',
      width: '80px',
      height: '80px',
      x: '-50%',
      y: '-50%'
    };

    const defaultAnimation: CoverAnimation = {
      enter: { type: 'scale', duration: 300, easing: 'ease-out' },
      exit: { type: 'scale', duration: 200, easing: 'ease-in' },
      hover: { type: 'scale', duration: 200 }
    };

    return {
      id: 'play-button',
      type: 'play-button',
      name: '播放按钮',
      layer: 'control',
      position: defaultPosition,
      visibility: 'paused',
      animation: defaultAnimation,
      interactive: true,
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        transition: 'all 0.3s ease'
      },
      className: 'cover-play-button',
      ...config
    };
  }

  createProgressBar(config?: Partial<CommonCoverConfig>): CommonCoverConfig {
    const defaultPosition: CoverPosition = {
      bottom: '20px',
      left: '20px',
      right: '20px',
      height: '6px'
    };

    return {
      id: 'progress-bar',
      type: 'progress-bar',
      name: '进度条',
      layer: 'control',
      position: defaultPosition,
      visibility: 'always',
      interactive: true,
      style: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '3px',
        overflow: 'hidden',
        cursor: 'pointer'
      },
      className: 'cover-progress-bar',
      ...config
    };
  }

  createVolumeControl(config?: Partial<CommonCoverConfig>): CommonCoverConfig {
    const defaultPosition: CoverPosition = {
      bottom: '40px',
      right: '20px',
      width: '120px',
      height: '30px'
    };

    return {
      id: 'volume-control',
      type: 'volume-control',
      name: '音量控制',
      layer: 'control',
      position: defaultPosition,
      visibility: 'hover',
      interactive: true,
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5px 10px',
        color: 'white'
      },
      className: 'cover-volume-control',
      ...config
    };
  }

  createFullscreenButton(config?: Partial<CommonCoverConfig>): CommonCoverConfig {
    const defaultPosition: CoverPosition = {
      top: '20px',
      right: '20px',
      width: '40px',
      height: '40px'
    };

    const defaultAnimation: CoverAnimation = {
      enter: { type: 'fade', duration: 200 },
      exit: { type: 'fade', duration: 200 },
      hover: { type: 'scale', duration: 150 }
    };

    return {
      id: 'fullscreen-button',
      type: 'fullscreen-button',
      name: '全屏按钮',
      layer: 'control',
      position: defaultPosition,
      visibility: 'hover',
      animation: defaultAnimation,
      interactive: true,
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'white',
        fontSize: '16px'
      },
      className: 'cover-fullscreen-button',
      ...config
    };
  }

  createLoadingSpinner(config?: Partial<CommonCoverConfig>): CommonCoverConfig {
    const defaultPosition: CoverPosition = {
      top: '50%',
      left: '50%',
      width: '60px',
      height: '60px',
      x: '-50%',
      y: '-50%'
    };

    const defaultAnimation: CoverAnimation = {
      enter: { type: 'fade', duration: 300 },
      exit: { type: 'fade', duration: 200 }
    };

    return {
      id: 'loading-spinner',
      type: 'loading-spinner',
      name: '加载动画',
      layer: 'overlay',
      position: defaultPosition,
      visibility: 'loading',
      animation: defaultAnimation,
      interactive: false,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      className: 'cover-loading-spinner',
      ...config
    };
  }

  createErrorMessage(config?: Partial<CommonCoverConfig>): CommonCoverConfig {
    const defaultPosition: CoverPosition = {
      top: '50%',
      left: '50%',
      x: '-50%',
      y: '-50%',
      width: '300px',
      height: 'auto'
    };

    const defaultAnimation: CoverAnimation = {
      enter: { type: 'scale', duration: 400, easing: 'ease-out' },
      exit: { type: 'scale', duration: 300, easing: 'ease-in' }
    };

    return {
      id: 'error-message',
      type: 'error-message',
      name: '错误提示',
      layer: 'modal',
      position: defaultPosition,
      visibility: 'error',
      animation: defaultAnimation,
      interactive: true,
      style: {
        backgroundColor: 'rgba(220, 38, 38, 0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        fontSize: '16px',
        fontWeight: '500'
      },
      className: 'cover-error-message',
      ...config
    };
  }

  createQualitySelector(config?: Partial<CommonCoverConfig>): CommonCoverConfig {
    const defaultPosition: CoverPosition = {
      top: '20px',
      left: '20px',
      width: '100px',
      height: '35px'
    };

    const defaultAnimation: CoverAnimation = {
      enter: { type: 'slide', duration: 250 },
      exit: { type: 'slide', duration: 200 },
      hover: { type: 'glow', duration: 150 }
    };

    return {
      id: 'quality-selector',
      type: 'quality-selector',
      name: '质量选择器',
      layer: 'control',
      position: defaultPosition,
      visibility: 'hover',
      animation: defaultAnimation,
      interactive: true,
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
      },
      className: 'cover-quality-selector',
      ...config
    };
  }

  // ============ 业务Cover预设 ============

  createAdvertisement(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig {
    const defaultPosition: CoverPosition = {
      top: '0',
      left: '0',
      right: '0',
      bottom: '0'
    };

    const defaultAnimation: CoverAnimation = {
      enter: { type: 'fade', duration: 500 },
      exit: { type: 'fade', duration: 300 }
    };

    return {
      id: 'advertisement',
      type: 'advertisement',
      name: '广告',
      layer: 'modal',
      position: defaultPosition,
      visibility: 'custom',
      animation: defaultAnimation,
      interactive: true,
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999'
      },
      className: 'cover-advertisement',
      businessData: {
        duration: 30000, // 30秒
        skippable: true,
        skipDelay: 5000  // 5秒后可跳过
      },
      ...config
    };
  }

  createDanmu(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig {
    const defaultPosition: CoverPosition = {
      top: '10%',
      left: '0',
      right: '0',
      bottom: '20%'
    };

    return {
      id: 'danmu',
      type: 'danmu',
      name: '弹幕',
      layer: 'content',
      position: defaultPosition,
      visibility: 'playing',
      interactive: false,
      style: {
        pointerEvents: 'none',
        overflow: 'hidden',
        position: 'absolute'
      },
      className: 'cover-danmu',
      businessData: {
        maxDanmuCount: 100,
        speed: 'normal',
        opacity: 0.8,
        fontSize: '16px',
        tracks: 6
      },
      ...config
    };
  }

  createSubtitle(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig {
    const defaultPosition: CoverPosition = {
      bottom: '80px',
      left: '50px',
      right: '50px',
      height: 'auto'
    };

    const defaultAnimation: CoverAnimation = {
      enter: { type: 'slide', duration: 300 },
      exit: { type: 'slide', duration: 200 }
    };

    return {
      id: 'subtitle',
      type: 'subtitle',
      name: '字幕',
      layer: 'content',
      position: defaultPosition,
      visibility: 'playing',
      animation: defaultAnimation,
      interactive: false,
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '6px',
        textAlign: 'center',
        fontSize: '16px',
        lineHeight: '1.5',
        maxHeight: '100px',
        overflow: 'auto'
      },
      className: 'cover-subtitle',
      businessData: {
        language: 'zh-CN',
        autoHide: true,
        hideDelay: 3000
      },
      ...config
    };
  }

  createWatermark(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig {
    const defaultPosition: CoverPosition = {
      bottom: '20px',
      left: '20px',
      width: '120px',
      height: '40px'
    };

    return {
      id: 'watermark',
      type: 'watermark',
      name: '水印',
      layer: 'background',
      position: defaultPosition,
      visibility: 'always',
      interactive: false,
      style: {
        opacity: '0.6',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))'
      },
      className: 'cover-watermark',
      businessData: {
        imageUrl: '',
        opacity: 0.6,
        position: 'bottom-left'
      },
      ...config
    };
  }

  createBrandLogo(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig {
    const defaultPosition: CoverPosition = {
      top: '20px',
      right: '20px',
      width: '100px',
      height: '30px'
    };

    const defaultAnimation: CoverAnimation = {
      enter: { type: 'fade', duration: 1000, delay: 500 },
      hover: { type: 'glow', duration: 300 }
    };

    return {
      id: 'brand-logo',
      type: 'brand-logo',
      name: '品牌标识',
      layer: 'overlay',
      position: defaultPosition,
      visibility: 'always',
      animation: defaultAnimation,
      interactive: true,
      style: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        cursor: 'pointer',
        opacity: '0.8'
      },
      className: 'cover-brand-logo',
      businessData: {
        logoUrl: '',
        clickUrl: '',
        fadeInDelay: 2000
      },
      ...config
    };
  }

  createShareButton(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig {
    const defaultPosition: CoverPosition = {
      top: '20px',
      left: '50%',
      x: '-50%',
      width: '40px',
      height: '40px'
    };

    const defaultAnimation: CoverAnimation = {
      enter: { type: 'bounce', duration: 600 },
      exit: { type: 'scale', duration: 200 },
      hover: { type: 'scale', duration: 200 }
    };

    return {
      id: 'share-button',
      type: 'share-button',
      name: '分享按钮',
      layer: 'control',
      position: defaultPosition,
      visibility: 'hover',
      animation: defaultAnimation,
      interactive: true,
      style: {
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'white',
        fontSize: '18px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
      },
      className: 'cover-share-button',
      businessData: {
        platforms: ['weibo', 'wechat', 'qq', 'douyin'],
        title: '',
        description: '',
        image: ''
      },
      ...config
    };
  }

  createLikeButton(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig {
    const defaultPosition: CoverPosition = {
      bottom: '120px',
      right: '20px',
      width: '50px',
      height: '50px'
    };

    const defaultAnimation: CoverAnimation = {
      enter: { type: 'scale', duration: 400 },
      exit: { type: 'scale', duration: 200 },
      hover: { type: 'scale', duration: 150 }
    };

    return {
      id: 'like-button',
      type: 'like-button',
      name: '点赞按钮',
      layer: 'control',
      position: defaultPosition,
      visibility: 'always',
      animation: defaultAnimation,
      interactive: true,
      style: {
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'white',
        fontSize: '24px',
        border: '2px solid white',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
      },
      className: 'cover-like-button',
      businessData: {
        likeCount: 0,
        liked: false,
        allowAnimation: true
      },
      ...config
    };
  }

  createCommentOverlay(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig {
    const defaultPosition: CoverPosition = {
      top: '0',
      right: '0',
      width: '300px',
      bottom: '0'
    };

    const defaultAnimation: CoverAnimation = {
      enter: { type: 'slide', duration: 400, easing: 'ease-out' },
      exit: { type: 'slide', duration: 300, easing: 'ease-in' }
    };

    return {
      id: 'comment-overlay',
      type: 'comment-overlay',
      name: '评论浮层',
      layer: 'modal',
      position: defaultPosition,
      visibility: 'custom',
      animation: defaultAnimation,
      interactive: true,
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '20px',
        overflowY: 'auto',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
      },
      className: 'cover-comment-overlay',
      businessData: {
        maxComments: 50,
        autoRefresh: true,
        refreshInterval: 5000,
        allowInput: true
      },
      ...config
    };
  }

  createGiftAnimation(config?: Partial<BusinessCoverConfig>): BusinessCoverConfig {
    const defaultPosition: CoverPosition = {
      bottom: '30%',
      left: '0',
      right: '0',
      height: '200px'
    };

    const defaultAnimation: CoverAnimation = {
      enter: { type: 'bounce', duration: 800 },
      exit: { type: 'fade', duration: 500 }
    };

    return {
      id: 'gift-animation',
      type: 'gift-animation',
      name: '礼物动画',
      layer: 'overlay',
      position: defaultPosition,
      visibility: 'custom',
      animation: defaultAnimation,
      interactive: false,
      style: {
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
      },
      className: 'cover-gift-animation',
      businessData: {
        queueSize: 5,
        animationDuration: 3000,
        showDuration: 2000,
        effects: ['fireworks', 'hearts', 'stars']
      },
      ...config
    };
  }

  // ============ 工具方法 ============

  /**
   * 创建自定义Cover配置
   */
  createCustomCover(
    id: string,
    type: 'custom',
    baseConfig: Partial<CoverConfig>
  ): CoverConfig {
    const defaultPosition: CoverPosition = {
      top: '50%',
      left: '50%',
      x: '-50%',
      y: '-50%'
    };

    return {
      id,
      type,
      name: baseConfig.name || '自定义Cover',
      layer: 'content',
      position: defaultPosition,
      visibility: 'always',
      interactive: false,
      ...baseConfig
    };
  }

  /**
   * 批量创建通用Cover
   */
  createDefaultCommonCovers(): CommonCoverConfig[] {
    return [
      this.createPlayButton(),
      this.createProgressBar(),
      this.createVolumeControl(),
      this.createFullscreenButton(),
      this.createLoadingSpinner(),
      this.createErrorMessage(),
      this.createQualitySelector()
    ];
  }

  /**
   * 批量创建业务Cover
   */
  createDefaultBusinessCovers(): BusinessCoverConfig[] {
    return [
      this.createWatermark(),
      this.createBrandLogo(),
      this.createShareButton(),
      this.createLikeButton()
    ];
  }

  /**
   * 根据主题创建Cover配置
   */
  createThemedCover<T extends CoverConfig>(
    baseCover: T,
    theme: {
      primaryColor?: string;
      secondaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
      borderRadius?: string;
      fontSize?: string;
    }
  ): T {
    const themedStyle = {
      ...baseCover.style,
      ...(theme.primaryColor && { backgroundColor: theme.primaryColor }),
      ...(theme.textColor && { color: theme.textColor }),
      ...(theme.borderRadius && { borderRadius: theme.borderRadius }),
      ...(theme.fontSize && { fontSize: theme.fontSize })
    };

    return {
      ...baseCover,
      style: themedStyle
    };
  }
}
