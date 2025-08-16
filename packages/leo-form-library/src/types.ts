import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// 基础表单字段接口
export interface BaseFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

// Input组件属性
export interface InputProps extends BaseFieldProps, Omit<Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>, 'size'> {
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium' | 'large';
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

// Select选项接口
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Select组件属性
export interface SelectProps extends BaseFieldProps, Omit<Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'>, 'size'> {
  options: SelectOption[];
  placeholder?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium' | 'large';
}

// Textarea组件属性
export interface TextareaProps extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium' | 'large';
  minRows?: number;
  maxRows?: number;
}

// Checkbox组件属性
export interface CheckboxProps extends BaseFieldProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Radio组件属性
export interface RadioProps extends BaseFieldProps {
  value: string | number;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: string | number) => void;
  size?: 'small' | 'medium' | 'large';
}

// RadioGroup组件属性
export interface RadioGroupProps extends BaseFieldProps {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  direction?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
}

// 表单验证规则
export interface ValidationRule {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  custom?: (value: any) => boolean | string;
}

// HOC增强组件的属性
export interface WithValidationProps {
  validationRules?: ValidationRule;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// 表单上下文类型
export interface FormContextType {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  clearError: (name: string) => void;
  validateField: (name: string, value: any) => Promise<string | undefined>;
  submitForm: () => Promise<void>;
}
