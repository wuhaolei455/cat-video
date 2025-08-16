// 生成唯一ID的工具函数
let idCounter = 0;
export const generateId = (prefix: string = 'field'): string => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

// 类名合并工具函数（简化版的clsx）
export const cn = (...classes: (string | undefined | null | boolean | number)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// 表单验证工具函数
export const validateField = (value: any, rules: any): string | undefined => {
  if (!rules) return undefined;

  // 必填验证
  if (rules.required) {
    if (value === undefined || value === null || value === '') {
      return typeof rules.required === 'string' ? rules.required : '此字段为必填项';
    }
  }

  // 最小长度验证
  if (rules.minLength && typeof value === 'string') {
    const minLength = typeof rules.minLength === 'object' ? rules.minLength.value : rules.minLength;
    if (value.length < minLength) {
      return typeof rules.minLength === 'object' 
        ? rules.minLength.message 
        : `最少需要${minLength}个字符`;
    }
  }

  // 最大长度验证
  if (rules.maxLength && typeof value === 'string') {
    const maxLength = typeof rules.maxLength === 'object' ? rules.maxLength.value : rules.maxLength;
    if (value.length > maxLength) {
      return typeof rules.maxLength === 'object' 
        ? rules.maxLength.message 
        : `最多允许${maxLength}个字符`;
    }
  }

  // 正则表达式验证
  if (rules.pattern && typeof value === 'string') {
    const pattern = typeof rules.pattern === 'object' ? rules.pattern.value : rules.pattern;
    if (!pattern.test(value)) {
      return typeof rules.pattern === 'object' 
        ? rules.pattern.message 
        : '格式不正确';
    }
  }

  // 数值范围验证
  if (rules.min !== undefined && typeof value === 'number') {
    const min = typeof rules.min === 'object' ? rules.min.value : rules.min;
    if (value < min) {
      return typeof rules.min === 'object' 
        ? rules.min.message 
        : `值不能小于${min}`;
    }
  }

  if (rules.max !== undefined && typeof value === 'number') {
    const max = typeof rules.max === 'object' ? rules.max.value : rules.max;
    if (value > max) {
      return typeof rules.max === 'object' 
        ? rules.max.message 
        : `值不能大于${max}`;
    }
  }

  // 自定义验证
  if (rules.custom && typeof rules.custom === 'function') {
    const result = rules.custom(value);
    if (typeof result === 'string') {
      return result;
    } else if (result === false) {
      return '验证失败';
    }
  }

  return undefined;
};

// 深度合并对象
export const deepMerge = (target: any, source: any): any => {
  if (source === null || typeof source !== 'object') return source;
  if (target === null || typeof target !== 'object') return source;

  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
};
