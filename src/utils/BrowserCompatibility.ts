/**
 * 浏览器兼容性工具类
 * 解决Safari和Chrome等浏览器之间的API差异
 */

export interface BrowserInfo {
  name: 'Safari' | 'Chrome' | 'Firefox' | 'Edge' | 'Unknown';
  version: string;
  isSafari: boolean;
  isChrome: boolean;
  isMobile: boolean;
  supportsNativeHLS: boolean;
  supportsHLSJS: boolean;
}

export interface CompatibilityAPIs {
  fullscreen: FullscreenAPI;
  pictureInPicture: PictureInPictureAPI;
  hls: HLSCompatibilityInfo;
}

interface FullscreenAPI {
  supported: boolean;
  requestFullscreen?: (element: HTMLElement) => Promise<void>;
  exitFullscreen?: () => Promise<void>;
  isFullscreen: () => boolean;
  onFullscreenChange: (callback: (isFullscreen: boolean) => void) => () => void;
}

interface PictureInPictureAPI {
  supported: boolean;
  enterPiP?: (element: HTMLVideoElement) => Promise<void>;
  exitPiP?: () => Promise<void>;
  isPiP: (element: HTMLVideoElement) => boolean;
  onPiPChange: (element: HTMLVideoElement, callback: (isPiP: boolean) => void) => () => void;
}

interface HLSCompatibilityInfo {
  native: boolean;
  hlsjs: boolean;
  supported: boolean;
  recommendation: 'native' | 'hlsjs' | 'unsupported';
}

/**
 * 浏览器兼容性检测和API封装
 */
export class BrowserCompatibility {
  private static _instance: BrowserCompatibility;
  private _browserInfo: BrowserInfo;
  private _apis: CompatibilityAPIs;

  private constructor() {
    this._browserInfo = this.detectBrowser();
    this._apis = this.createCompatibilityAPIs();
  }

  static getInstance(): BrowserCompatibility {
    if (!this._instance) {
      this._instance = new BrowserCompatibility();
    }
    return this._instance;
  }

  get browserInfo(): BrowserInfo {
    return this._browserInfo;
  }

  get apis(): CompatibilityAPIs {
    return this._apis;
  }

  /**
   * 检测浏览器信息
   */
  private detectBrowser(): BrowserInfo {
    const ua = navigator.userAgent;
    const video = document.createElement('video');

    // 检测浏览器类型
    let name: BrowserInfo['name'] = 'Unknown';
    let version = 'Unknown';

    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      name = 'Chrome';
      const match = ua.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      name = 'Safari';
      const match = ua.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Firefox')) {
      name = 'Firefox';
      const match = ua.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (ua.includes('Edg')) {
      name = 'Edge';
      const match = ua.match(/Edg\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }

    const isSafari = name === 'Safari';
    const isChrome = name === 'Chrome';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);

    // 检测HLS支持
    const supportsNativeHLS = !!(
      video.canPlayType('application/vnd.apple.mpegurl') ||
      video.canPlayType('audio/mpegurl')
    );

    const supportsHLSJS = typeof window !== 'undefined' && 
                         'Hls' in window && 
                         (window as any).Hls?.isSupported?.();

    return {
      name,
      version,
      isSafari,
      isChrome,
      isMobile,
      supportsNativeHLS,
      supportsHLSJS
    };
  }

  /**
   * 创建兼容性API封装
   */
  private createCompatibilityAPIs(): CompatibilityAPIs {
    return {
      fullscreen: this.createFullscreenAPI(),
      pictureInPicture: this.createPictureInPictureAPI(),
      hls: this.createHLSCompatibilityInfo()
    };
  }

  /**
   * 创建全屏API兼容性封装
   */
  private createFullscreenAPI(): FullscreenAPI {
    const doc = document as any;
    
    // 检测支持的API
    const requestMethods = [
      'requestFullscreen',
      'webkitRequestFullscreen',
      'mozRequestFullScreen',
      'msRequestFullscreen'
    ];

    const exitMethods = [
      'exitFullscreen',
      'webkitExitFullscreen',
      'mozCancelFullScreen',
      'msExitFullscreen'
    ];

    const fullscreenElements = [
      'fullscreenElement',
      'webkitFullscreenElement',
      'mozFullScreenElement',
      'msFullscreenElement'
    ];

    const changeEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'msfullscreenchange'
    ];

    // 找到支持的方法
    const requestMethod = requestMethods.find(method => 
      method in HTMLElement.prototype
    );
    const exitMethod = exitMethods.find(method => 
      method in Document.prototype
    );
    const fullscreenElement = fullscreenElements.find(prop => 
      prop in Document.prototype
    );
    const changeEvent = changeEvents.find(event => 
      `on${event.toLowerCase()}` in Document.prototype || event === 'fullscreenchange'
    ) || 'fullscreenchange';

    const supported = !!(requestMethod && exitMethod);

    return {
      supported,
      requestFullscreen: supported ? async (element: HTMLElement) => {
        const method = (element as any)[requestMethod!];
        if (method) {
          await method.call(element);
        }
      } : undefined,
      exitFullscreen: supported ? async () => {
        const method = (doc as any)[exitMethod!];
        if (method) {
          await method.call(doc);
        }
      } : undefined,
      isFullscreen: () => {
        return fullscreenElement ? !!(doc as any)[fullscreenElement] : false;
      },
      onFullscreenChange: (callback: (isFullscreen: boolean) => void) => {
        const handler = () => {
          const isFullscreen = fullscreenElement ? !!(doc as any)[fullscreenElement] : false;
          callback(isFullscreen);
        };

        document.addEventListener(changeEvent, handler);
        
        return () => {
          document.removeEventListener(changeEvent, handler);
        };
      }
    };
  }

  /**
   * 创建画中画API兼容性封装
   */
  private createPictureInPictureAPI(): PictureInPictureAPI {
    const doc = document as any;
    
    // 检测标准API支持
    const standardSupported = !!(
      'pictureInPictureEnabled' in document &&
      'requestPictureInPicture' in HTMLVideoElement.prototype
    );

    // 检测Safari webkit API支持
    const webkitSupported = 'webkitSetPresentationMode' in HTMLVideoElement.prototype;
    
    const supported = standardSupported || webkitSupported;

    return {
      supported,
      enterPiP: supported ? async (element: HTMLVideoElement) => {
        if (standardSupported && (element as any).requestPictureInPicture) {
          await (element as any).requestPictureInPicture();
        } else if (webkitSupported && (element as any).webkitSetPresentationMode) {
          (element as any).webkitSetPresentationMode('picture-in-picture');
        }
      } : undefined,
      exitPiP: supported ? async () => {
        if (standardSupported && doc.exitPictureInPicture) {
          await doc.exitPictureInPicture();
        } else if (webkitSupported) {
          // Safari需要在video元素上调用
          const videos = document.querySelectorAll('video');
          videos.forEach((video: any) => {
            if (video.webkitPresentationMode === 'picture-in-picture') {
              video.webkitSetPresentationMode('inline');
            }
          });
        }
      } : undefined,
      isPiP: (element: HTMLVideoElement) => {
        if (standardSupported) {
          return doc.pictureInPictureElement === element;
        } else if (webkitSupported) {
          return (element as any).webkitPresentationMode === 'picture-in-picture';
        }
        return false;
      },
      onPiPChange: (element: HTMLVideoElement, callback: (isPiP: boolean) => void) => {
        const handlers: (() => void)[] = [];

        const handleChange = () => {
          const isPiP = this._apis.pictureInPicture.isPiP(element);
          callback(isPiP);
        };

        if (standardSupported) {
          element.addEventListener('enterpictureinpicture', handleChange);
          element.addEventListener('leavepictureinpicture', handleChange);
          
          handlers.push(() => {
            element.removeEventListener('enterpictureinpicture', handleChange);
            element.removeEventListener('leavepictureinpicture', handleChange);
          });
        }

        if (webkitSupported) {
          (element as any).addEventListener('webkitpresentationmodechanged', handleChange);
          
          handlers.push(() => {
            (element as any).removeEventListener('webkitpresentationmodechanged', handleChange);
          });
        }

        return () => {
          handlers.forEach(cleanup => cleanup());
        };
      }
    };
  }

  /**
   * 创建HLS兼容性信息
   */
  private createHLSCompatibilityInfo(): HLSCompatibilityInfo {
    const { supportsNativeHLS, supportsHLSJS, isSafari } = this._browserInfo;
    
    const supported = supportsNativeHLS || supportsHLSJS;
    
    let recommendation: 'native' | 'hlsjs' | 'unsupported';
    
    if (supportsNativeHLS && isSafari) {
      // Safari优先使用原生支持
      recommendation = 'native';
    } else if (supportsHLSJS) {
      // 其他浏览器使用HLS.js
      recommendation = 'hlsjs';
    } else {
      recommendation = 'unsupported';
    }

    return {
      native: supportsNativeHLS,
      hlsjs: supportsHLSJS,
      supported,
      recommendation
    };
  }

  /**
   * 输出兼容性报告
   */
  getCompatibilityReport(): string {
    const { browserInfo, apis } = this;
    
    const lines = [
      `=== 浏览器兼容性报告 ===`,
      `浏览器: ${browserInfo.name} ${browserInfo.version}`,
      `移动端: ${browserInfo.isMobile ? '是' : '否'}`,
      ``,
      `=== 功能支持情况 ===`,
      `全屏API: ${apis.fullscreen.supported ? '✅ 支持' : '❌ 不支持'}`,
      `画中画API: ${apis.pictureInPicture.supported ? '✅ 支持' : '❌ 不支持'}`,
      ``,
      `=== HLS支持情况 ===`,
      `原生HLS: ${apis.hls.native ? '✅ 支持' : '❌ 不支持'}`,
      `HLS.js: ${apis.hls.hlsjs ? '✅ 支持' : '❌ 不支持'}`,
      `推荐策略: ${apis.hls.recommendation}`,
      ``,
      `=== 建议 ===`,
    ];

    if (browserInfo.isSafari) {
      lines.push(`- Safari浏览器，建议使用原生HLS支持`);
      lines.push(`- 全屏和画中画功能使用webkit前缀API`);
    } else if (browserInfo.isChrome) {
      lines.push(`- Chrome浏览器，建议使用HLS.js库`);
      lines.push(`- 全屏和画中画功能使用标准API`);
    }

    return lines.join('\n');
  }
}

// 导出单例实例
export const browserCompatibility = BrowserCompatibility.getInstance();

// 便捷的全局函数
export const getBrowserInfo = () => browserCompatibility.browserInfo;
export const getCompatibilityAPIs = () => browserCompatibility.apis;
export const getCompatibilityReport = () => browserCompatibility.getCompatibilityReport();
