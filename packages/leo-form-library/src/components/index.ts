// 基础组件导出
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Textarea } from './Textarea';
export { default as FormBuilder } from './FormBuilder';

// 高阶组件导出
export { default as withValidation } from '../hocs/withValidation';
export { default as withFormField } from '../hocs/withFormField';

// 预制的增强组件
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';
import withValidation from '../hocs/withValidation';
import withFormField from '../hocs/withFormField';
import withDebounce from '../hocs/withDebounce';

// 组合高阶组件创建增强版本
export const ValidatedInput = withValidation(Input);
export const ValidatedSelect = withValidation(Select);
export const ValidatedTextarea = withValidation(Textarea);

// 带表单字段样式的组件
export const FormFieldInput = withFormField(Input);
export const FormFieldSelect = withFormField(Select);
export const FormFieldTextarea = withFormField(Textarea);

// 防抖组件
export const DebouncedInput = withDebounce(Input);
export const DebouncedSelect = withDebounce(Select);
export const DebouncedTextarea = withDebounce(Textarea);

// 完全增强的组件（同时具有验证和字段样式）
export const EnhancedInput = withDebounce(withFormField(withValidation(Input)));
export const EnhancedSelect = withDebounce(withFormField(withValidation(Select)));
export const EnhancedTextarea = withDebounce(withFormField(withValidation(Textarea)));
