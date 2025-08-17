/**
 * 浏览器检测工具
 * 用于在运行时检测浏览器类型并应用相应的样式类
 */

export interface BrowserDetectionResult {
  name: 'safari' | 'chrome' | 'firefox' | 'edge' | 'unknown';
  version: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  engine: 'webkit' | 'blink' | 'gecko' | 'unknown';
}

export class BrowserDetection {
  private static _result: BrowserDetectionResult | null = null;

  /**
   * 检测浏览器信息
   */
  static detect(): BrowserDetectionResult {
    if (this._result) {
      return this._result;
    }

    const ua = navigator.userAgent;
    let name: BrowserDetectionResult['name'] = 'unknown';
    let version = 'unknown';
    let engine: BrowserDetectionResult['engine'] = 'unknown';

    // 检测浏览器
    if (/Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua)) {
      name = 'safari';
      engine = 'webkit';
      const match = ua.match(/Version\/(\d+)/);
      version = match ? match[1] : 'unknown';
    } else if (/Chrome/.test(ua) && !/Edg/.test(ua)) {
      name = 'chrome';
      engine = 'blink';
      const match = ua.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'unknown';
    } else if (/Firefox/.test(ua)) {
      name = 'firefox';
      engine = 'gecko';
      const match = ua.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'unknown';
    } else if (/Edg/.test(ua)) {
      name = 'edge';
      engine = 'blink';
      const match = ua.match(/Edg\/(\d+)/);
      version = match ? match[1] : 'unknown';
    }

    // 检测移动端
    const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);

    this._result = {
      name,
      version,
      isMobile,
      isIOS,
      isAndroid,
      engine
    };

    return this._result;
  }

  /**
   * 应用浏览器特定的CSS类到body元素
   */
  static applyBrowserClasses(): void {
    if (typeof document === 'undefined') return;

    const detection = this.detect();
    const body = document.body;

    // 清除现有的浏览器类
    body.classList.remove('safari', 'chrome', 'firefox', 'edge', 'mobile', 'ios', 'android');

    // 添加浏览器类
    body.classList.add(detection.name);

    // 添加引擎类
    body.classList.add(detection.engine);

    // 添加平台类
    if (detection.isMobile) {
      body.classList.add('mobile');
    }
    if (detection.isIOS) {
      body.classList.add('ios');
    }
    if (detection.isAndroid) {
      body.classList.add('android');
    }

    // 添加版本类（主版本号）
    if (detection.version !== 'unknown') {
      body.classList.add(`${detection.name}-${detection.version}`);
    }

    // Safari特殊处理
    if (detection.name === 'safari') {
      this.applySafariSpecificFixes();
    }
  }

  /**
   * 应用Safari特定的修复
   */
  private static applySafariSpecificFixes(): void {
    // 强制Safari重新渲染
    (document.body.style as any).webkitTransform = 'translateZ(0)';
    
    // 修复Safari的字体渲染
    (document.body.style as any).webkitFontSmoothing = 'antialiased';
    (document.body.style as any).mozOsxFontSmoothing = 'grayscale';
    
    // 修复Safari的滚动
    (document.documentElement.style as any).webkitOverflowScrolling = 'touch';
    
    // 修复Safari的100vh问题
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    // 修复Safari的CSS变量问题
    this.fixSafariCSSVariables();
    
    // 修复Safari的Flexbox问题
    this.fixSafariFlexbox();
  }

  /**
   * 修复Safari的CSS变量问题
   */
  private static fixSafariCSSVariables(): void {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --safari-bg-gradient-from: #eff6ff;
        --safari-bg-gradient-to: #e0e7ff;
        --safari-text-gray-800: #1f2937;
        --safari-text-gray-600: #4b5563;
        --safari-text-white: #ffffff;
        --safari-bg-white: #ffffff;
      }
      
      .safari .bg-gradient-to-br {
        background: linear-gradient(135deg, var(--safari-bg-gradient-from), var(--safari-bg-gradient-to)) !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 修复Safari的Flexbox问题
   */
  private static fixSafariFlexbox(): void {
    // 为所有flex容器添加-webkit-前缀
    const flexElements = document.querySelectorAll('.flex');
    flexElements.forEach(element => {
      const el = element as HTMLElement;
      el.style.display = '-webkit-flex';
      (el.style as any).webkitFlexDirection = getComputedStyle(el).flexDirection;
      (el.style as any).webkitJustifyContent = getComputedStyle(el).justifyContent;
      (el.style as any).webkitAlignItems = getComputedStyle(el).alignItems;
    });
  }

  /**
   * 获取浏览器特定的CSS前缀
   */
  static getCSSPrefix(): string {
    const detection = this.detect();
    
    switch (detection.engine) {
      case 'webkit':
        return '-webkit-';
      case 'gecko':
        return '-moz-';
      case 'blink':
        return '-webkit-'; // Blink使用webkit前缀
      default:
        return '';
    }
  }

  /**
   * 检查是否为Safari
   */
  static isSafari(): boolean {
    return this.detect().name === 'safari';
  }

  /**
   * 检查是否为Chrome
   */
  static isChrome(): boolean {
    return this.detect().name === 'chrome';
  }

  /**
   * 检查是否为移动端Safari
   */
  static isMobileSafari(): boolean {
    const detection = this.detect();
    return detection.name === 'safari' && detection.isMobile;
  }

  /**
   * 获取浏览器兼容性报告
   */
  static getCompatibilityReport(): string {
    const detection = this.detect();
    
    const lines = [
      `浏览器: ${detection.name} ${detection.version}`,
      `引擎: ${detection.engine}`,
      `平台: ${detection.isMobile ? '移动端' : '桌面端'}`,
      `操作系统: ${detection.isIOS ? 'iOS' : detection.isAndroid ? 'Android' : '桌面系统'}`,
      ``,
      `已知兼容性问题:`
    ];

    if (detection.name === 'safari') {
      lines.push(`- Safari可能在CSS Grid和Flexbox上有差异`);
      lines.push(`- Safari的滚动条样式需要特殊处理`);
      lines.push(`- Safari的视频控件样式可能不同`);
      if (detection.isMobile) {
        lines.push(`- 移动端Safari的100vh问题`);
        lines.push(`- iOS Safari的输入框缩放问题`);
      }
    } else if (detection.name === 'chrome') {
      lines.push(`- Chrome在某些CSS属性上可能更激进`);
      lines.push(`- Chrome的字体渲染可能略有不同`);
    }

    return lines.join('\n');
  }
}

// 导出便捷函数
export const detectBrowser = () => BrowserDetection.detect();
export const applyBrowserClasses = () => BrowserDetection.applyBrowserClasses();
export const isSafari = () => BrowserDetection.isSafari();
export const isChrome = () => BrowserDetection.isChrome();
export const isMobileSafari = () => BrowserDetection.isMobileSafari();
