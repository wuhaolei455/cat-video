/**
 * Safari样式注入器
 * 运行时动态注入样式以确保Safari正确显示
 */

export class SafariStyleInjector {
  private static instance: SafariStyleInjector;
  private injectedStyles: Set<string> = new Set();
  private styleElement: HTMLStyleElement | null = null;
  private isInitialized = false;

  static getInstance(): SafariStyleInjector {
    if (!SafariStyleInjector.instance) {
      SafariStyleInjector.instance = new SafariStyleInjector();
    }
    return SafariStyleInjector.instance;
  }

  /**
   * 初始化Safari样式注入器
   */
  initialize(): void {
    if (this.isInitialized) return;
    
    // 检测是否为Safari
    if (!this.isSafari()) return;
    
    console.log('🍎 初始化Safari样式注入器...');
    
    // 创建样式元素
    this.createStyleElement();
    
    // 注入关键样式
    this.injectCriticalStyles();
    
    // 监听DOM变化
    this.observeDOM();
    
    // 定期检查和修复
    this.startPeriodicCheck();
    
    this.isInitialized = true;
    console.log('✅ Safari样式注入器初始化完成');
  }

  /**
   * 检测是否为Safari浏览器
   */
  private isSafari(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return /safari/.test(userAgent) && !/chrome|chromium|edge/.test(userAgent);
  }

  /**
   * 创建样式元素
   */
  private createStyleElement(): void {
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'safari-runtime-styles';
    this.styleElement.setAttribute('data-safari-injector', 'true');
    document.head.appendChild(this.styleElement);
  }

  /**
   * 注入关键样式
   */
  private injectCriticalStyles(): void {
    const criticalStyles = `
      /* Safari运行时样式修复 */
      .safari {
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
      
      .safari * {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }
      
      /* 强制Safari重新渲染 */
      .safari .force-rerender {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
      }
    `;
    
    this.addStyles('critical', criticalStyles);
  }

  /**
   * 添加样式到注入器
   */
  addStyles(id: string, styles: string): void {
    if (this.injectedStyles.has(id)) return;
    
    if (this.styleElement) {
      this.styleElement.textContent += `\n/* ${id} */\n${styles}\n`;
      this.injectedStyles.add(id);
    }
  }

  /**
   * 修复特定元素的样式
   */
  fixElementStyles(element: Element): void {
    const el = element as HTMLElement;
    
    // 修复Flexbox
    if (el.classList.contains('flex')) {
      el.style.display = '-webkit-flex';
      (el.style as any).webkitFlexDirection = getComputedStyle(el).flexDirection;
    }
    
    // 修复Grid
    if (el.classList.contains('grid')) {
      el.style.display = 'grid';
      // 确保Grid模板正确应用
      const computedStyle = getComputedStyle(el);
      if (computedStyle.gridTemplateColumns === 'none') {
        if (el.classList.contains('grid-cols-1')) {
          el.style.gridTemplateColumns = '1fr';
        } else if (el.classList.contains('grid-cols-2')) {
          el.style.gridTemplateColumns = '1fr 1fr';
        } else if (el.classList.contains('grid-cols-3')) {
          el.style.gridTemplateColumns = '1fr 1fr 1fr';
        } else if (el.classList.contains('grid-cols-4')) {
          el.style.gridTemplateColumns = '1fr 1fr 1fr 1fr';
        }
      }
    }
    
    // 修复背景渐变
    if (el.classList.contains('bg-gradient-to-br')) {
      const hasFrom = Array.from(el.classList).find(cls => cls.startsWith('from-'));
      const hasTo = Array.from(el.classList).find(cls => cls.startsWith('to-'));
      
      if (hasFrom && hasTo) {
        const fromColor = this.getColorFromClass(hasFrom);
        const toColor = this.getColorFromClass(hasTo);
        
        if (fromColor && toColor) {
          el.style.background = `linear-gradient(135deg, ${fromColor}, ${toColor})`;
          el.style.backgroundImage = `-webkit-linear-gradient(315deg, ${fromColor}, ${toColor})`;
        }
      }
    }
    
    // 修复文字颜色
    const textColorClass = Array.from(el.classList).find(cls => cls.startsWith('text-'));
    if (textColorClass) {
      const color = this.getColorFromClass(textColorClass);
      if (color && getComputedStyle(el).color === 'rgb(0, 0, 0)') {
        el.style.color = color;
      }
    }
    
    // 修复背景颜色
    const bgColorClass = Array.from(el.classList).find(cls => cls.startsWith('bg-') && !cls.startsWith('bg-gradient'));
    if (bgColorClass) {
      const color = this.getColorFromClass(bgColorClass);
      if (color && getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)') {
        el.style.backgroundColor = color;
      }
    }
    
    // 添加强制重新渲染类
    el.classList.add('force-rerender');
  }

  /**
   * 从CSS类名获取颜色值
   */
  private getColorFromClass(className: string): string | null {
    const colorMap: Record<string, string> = {
      // 文字颜色
      'text-white': '#ffffff',
      'text-gray-800': '#1f2937',
      'text-gray-600': '#4b5563',
      'text-gray-500': '#6b7280',
      'text-gray-400': '#9ca3af',
      'text-gray-300': '#d1d5db',
      
      // 背景颜色
      'bg-white': '#ffffff',
      'bg-gray-50': '#f9fafb',
      'bg-gray-800': '#1f2937',
      'bg-gray-900': '#111827',
      'bg-blue-500': '#3b82f6',
      'bg-green-500': '#22c55e',
      'bg-purple-500': '#a855f7',
      'bg-red-500': '#ef4444',
      'bg-orange-500': '#f97316',
      'bg-pink-500': '#ec4899',
      'bg-indigo-500': '#6366f1',
      'bg-teal-500': '#14b8a6',
      'bg-yellow-500': '#eab308',
      
      // 渐变颜色
      'from-blue-50': '#eff6ff',
      'to-indigo-100': '#e0e7ff',
      'from-gray-900': '#111827',
      'to-gray-800': '#1f2937',
    };
    
    return colorMap[className] || null;
  }

  /**
   * 监听DOM变化
   */
  private observeDOM(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // 处理新添加的节点
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            this.processElement(element);
            
            // 处理子元素
            element.querySelectorAll('*').forEach((child) => {
              this.processElement(child);
            });
          }
        });
        
        // 处理属性变化
        if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
          this.processElement(mutation.target as Element);
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  /**
   * 处理单个元素
   */
  private processElement(element: Element): void {
    // 检查是否需要修复
    if (this.needsFix(element)) {
      this.fixElementStyles(element);
    }
  }

  /**
   * 检查元素是否需要修复
   */
  private needsFix(element: Element): boolean {
    const classList = element.classList;
    
    // 检查是否有Tailwind类
    const hasTailwindClasses = Array.from(classList).some(cls => 
      cls.startsWith('bg-') || 
      cls.startsWith('text-') || 
      cls.includes('flex') || 
      cls.includes('grid') ||
      cls.startsWith('p-') ||
      cls.startsWith('m-') ||
      cls.startsWith('rounded-') ||
      cls.startsWith('shadow-')
    );
    
    if (!hasTailwindClasses) return false;
    
    // 检查样式是否正确应用
    const computedStyle = getComputedStyle(element);
    
    // 检查背景颜色
    if (classList.contains('bg-blue-500') && computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)') {
      return true;
    }
    
    // 检查文字颜色
    if (classList.contains('text-white') && computedStyle.color === 'rgb(0, 0, 0)') {
      return true;
    }
    
    // 检查Flexbox
    if (classList.contains('flex') && computedStyle.display !== 'flex') {
      return true;
    }
    
    // 检查Grid
    if (classList.contains('grid') && computedStyle.display !== 'grid') {
      return true;
    }
    
    return false;
  }

  /**
   * 定期检查和修复
   */
  private startPeriodicCheck(): void {
    // 初始检查
    setTimeout(() => {
      this.performFullCheck();
    }, 500);
    
    // 定期检查
    setInterval(() => {
      this.performFullCheck();
    }, 2000);
  }

  /**
   * 执行全面检查
   */
  private performFullCheck(): void {
    // 检查所有可能有问题的元素
    const elementsToCheck = document.querySelectorAll('[class*="bg-"], [class*="text-"], [class*="flex"], [class*="grid"]');
    
    elementsToCheck.forEach((element) => {
      this.processElement(element);
    });
    
    // 强制重新渲染
    this.forceRerender();
  }

  /**
   * 强制重新渲染
   */
  private forceRerender(): void {
    (document.body.style as any).webkitTransform = 'translateZ(0)';
    document.body.style.transform = 'translateZ(0)';
    
    // 触发重排
    setTimeout(() => {
      document.body.style.display = 'none';
      document.body.offsetHeight;
      document.body.style.display = '';
    }, 10);
  }

  /**
   * 手动触发样式修复
   */
  manualFix(): void {
    console.log('🔧 手动触发Safari样式修复...');
    this.performFullCheck();
    console.log('✅ 手动修复完成');
  }

  /**
   * 获取修复状态
   */
  getStatus(): {
    isInitialized: boolean;
    injectedStylesCount: number;
    isSafari: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      injectedStylesCount: this.injectedStyles.size,
      isSafari: this.isSafari(),
    };
  }
}
