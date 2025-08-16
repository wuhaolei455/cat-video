import React, { ReactNode } from 'react';

/**
 * FormBuilder组件 - 使用Render Props模式
 * 提供表单构建的灵活渲染能力
 */

interface FormField {
  name: string;
  type: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio';
  label: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: any;
  placeholder?: string;
  helperText?: string;
}

interface FormBuilderProps {
  fields: FormField[];
  values: Record<string, any>;
  errors: Record<string, string>;
  onFieldChange: (name: string, value: any) => void;
  children: (renderProps: {
    renderField: (field: FormField) => ReactNode;
    renderAllFields: () => ReactNode;
    hasErrors: boolean;
    isValid: boolean;
  }) => ReactNode;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  values,
  errors,
  onFieldChange,
  children
}) => {
  const renderField = (field: FormField): ReactNode => {
    const commonProps = {
      label: field.label,
      required: field.required,
      error: errors[field.name],
      helperText: field.helperText,
      value: values[field.name] || '',
      onChange: (e: any) => onFieldChange(field.name, e.target?.value ?? e)
    };

    // 这里可以根据field.type返回对应的组件
    // 为了简化，我们返回一个基础的div
    return (
      <div key={field.name} className="form-field-wrapper">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {field.type === 'input' && (
          <input
            key={`${field.name}-input`}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            placeholder={field.placeholder}
            {...commonProps}
          />
        )}
        
        {field.type === 'select' && (
          <select
            key={`${field.name}-select`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            {...commonProps}
          >
            <option value="">{field.placeholder || '请选择'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        
        {field.type === 'textarea' && (
          <textarea
            key={`${field.name}-textarea`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            placeholder={field.placeholder}
            rows={3}
            {...commonProps}
          />
        )}
        
        {errors[field.name] && (
          <div className="mt-1 text-sm text-red-600">{errors[field.name]}</div>
        )}
        
        {field.helperText && !errors[field.name] && (
          <div className="mt-1 text-sm text-gray-500">{field.helperText}</div>
        )}
      </div>
    );
  };

  const renderAllFields = (): ReactNode => {
    return (
      <div className="space-y-4">
        {fields.map(renderField)}
      </div>
    );
  };

  const hasErrors = Object.keys(errors).length > 0;
  const isValid = !hasErrors && fields.every(field => 
    !field.required || (values[field.name] && values[field.name].toString().trim())
  );

  return (
    <>
      {children({
        renderField,
        renderAllFields,
        hasErrors,
        isValid
      })}
    </>
  );
};

export default FormBuilder;
