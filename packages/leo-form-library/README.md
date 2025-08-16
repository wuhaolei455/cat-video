# Leo Form Library

一个基于React的可复用表单组件库，深度展示了现代React组件设计模式的实际应用。本项目通过完整的表单组件生态系统，演示了四种核心设计模式的最佳实践。

## 🎯 核心设计模式详解

本组件库完整实现并演示了React中的四种核心组件设计模式，每种模式都有其独特的应用场景和优势：

### 1. 🔧 高阶组件 (HOC) - 横切关注点的优雅解决方案

**设计理念**: 通过函数式编程的思想，为组件添加额外功能而不修改原始组件，实现关注点分离。

#### withValidation HOC - 验证功能增强
```tsx
import { withValidation, Input } from '@leo-video/form-library';

// HOC模式：为任何组件添加验证功能
const ValidatedInput = withValidation(Input);

<ValidatedInput
  label="邮箱地址"
  validationRules={{
    required: '邮箱不能为空',
    pattern: { 
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
      message: '请输入有效的邮箱地址' 
    },
    minLength: { value: 5, message: '邮箱至少5个字符' }
  }}
  validateOnChange={true}
  validateOnBlur={true}
/>
```

#### withFormField HOC - UI增强
```tsx
import { withFormField, Input } from '@leo-video/form-library';

// 为组件添加统一的表单字段样式和布局
const FormFieldInput = withFormField(Input);

<FormFieldInput
  label="用户名"
  containerClassName="custom-field"
  fieldSize="large"
  showLabel={true}
  showError={true}
/>
```

#### 多重HOC组合 - 功能叠加
```tsx
// 组合多个HOC，同时具备验证和字段增强功能
const EnhancedInput = withFormField(withValidation(Input));

<EnhancedInput
  label="密码"
  type="password"
  validationRules={{
    required: true,
    minLength: 8,
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: '密码必须包含大小写字母和数字'
    }
  }}
  fieldSize="large"
  containerClassName="password-field"
/>
```

**HOC模式优势**:
- ✅ 逻辑复用：同样的增强逻辑可应用于不同组件
- ✅ 关注点分离：验证逻辑与UI逻辑分离
- ✅ 组合性：多个HOC可以组合使用
- ✅ 不侵入性：不修改原始组件代码

### 2. 🎯 forwardRef - 透明的DOM访问

**设计理念**: 让父组件能够直接访问子组件的DOM元素或组件实例，保持组件封装的同时提供必要的控制能力。

#### 基础ref转发实现
```tsx
// 组件内部使用forwardRef包装
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="form-field">
        <label>{label}</label>
        <input ref={ref} {...props} />
        {error && <span className="error">{error}</span>}
      </div>
    );
  }
);
```

#### 实际应用场景
```tsx
import { Input, Select } from '@leo-video/form-library';

const MyForm = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  
  // 程序化控制焦点
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  // 程序化获取值
  const getInputValue = () => {
    return inputRef.current?.value;
  };
  
  // 表单验证后聚焦错误字段
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputRef.current?.value) {
      inputRef.current?.focus(); // 直接聚焦到错误字段
      return;
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Input 
        ref={inputRef}
        label="用户名"
        placeholder="请输入用户名"
      />
      
      <Select
        ref={selectRef}
        label="城市"
        options={cityOptions}
      />
      
      <button type="button" onClick={focusInput}>
        聚焦输入框
      </button>
      <button type="submit">提交</button>
    </form>
  );
};
```

#### 与HOC结合使用
```tsx
// HOC增强的组件同样支持ref转发
const ValidatedInput = withValidation(Input);

const FormWithValidation = () => {
  const validatedInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <ValidatedInput
      ref={validatedInputRef} // ref正常传递
      label="邮箱"
      validationRules={{ required: true }}
    />
  );
};
```

**forwardRef模式优势**:
- ✅ 透明性：组件封装不影响DOM访问
- ✅ 可控性：父组件可以程序化控制子组件
- ✅ 兼容性：与第三方库和原生DOM API无缝集成
- ✅ 调试友好：便于开发时调试和测试

### 3. 🚀 Render Props - 渲染逻辑的终极灵活性

**设计理念**: 通过函数作为props来共享组件逻辑，提供最大的渲染灵活性，让使用者完全控制UI的呈现方式。

#### FormBuilder - 强大的表单构建器
```tsx
import { FormBuilder } from '@leo-video/form-library';

// 字段配置
const formFields = [
  {
    name: 'firstName',
    type: 'input' as const,
    label: '名字',
    required: true,
    placeholder: '请输入您的名字'
  },
  {
    name: 'email',
    type: 'input' as const,
    label: '邮箱',
    required: true,
    placeholder: '请输入邮箱地址'
  },
  {
    name: 'gender',
    type: 'select' as const,
    label: '性别',
    options: [
      { value: 'male', label: '男' },
      { value: 'female', label: '女' }
    ]
  }
];

const MyForm = () => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  
  return (
    <FormBuilder
      fields={formFields}
      values={values}
      errors={errors}
      onFieldChange={(name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
      }}
    >
      {({ renderField, renderAllFields, hasErrors, isValid }) => (
        <div className="custom-form-layout">
          {/* 完全自定义的布局 */}
          <div className="form-header">
            <h2>用户信息表单</h2>
            <div className="form-status">
              {hasErrors ? '❌ 表单有错误' : '✅ 表单正常'}
            </div>
          </div>
          
          {/* 灵活的字段渲染 */}
          <div className="form-body">
            <div className="row">
              {renderField(formFields[0])} {/* 渲染名字字段 */}
              {renderField(formFields[1])} {/* 渲染邮箱字段 */}
            </div>
            
            <div className="row">
              {renderField(formFields[2])} {/* 渲染性别字段 */}
            </div>
            
            {/* 或者一次性渲染所有字段 */}
            {/* {renderAllFields()} */}
          </div>
          
          {/* 自定义表单操作 */}
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={!isValid}
              className={isValid ? 'btn-primary' : 'btn-disabled'}
            >
              {isValid ? '提交表单' : '请完善表单'}
            </button>
            
            <button 
              type="button"
              onClick={() => {
                setValues({});
                setErrors({});
              }}
            >
              重置表单
            </button>
          </div>
        </div>
      )}
    </FormBuilder>
  );
};
```

#### 高级Render Props应用
```tsx
// 条件渲染和动态布局
<FormBuilder fields={fields} values={values} errors={errors}>
  {({ renderField, hasErrors, isValid, values }) => (
    <div>
      {/* 根据表单状态动态调整布局 */}
      {hasErrors && (
        <div className="error-summary">
          <h3>请修正以下错误：</h3>
          <ul>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 条件显示字段 */}
      {renderField(fields[0])}
      
      {/* 根据前一个字段的值决定是否显示下一个字段 */}
      {values.firstName && renderField(fields[1])}
      
      {/* 自定义字段组合 */}
      <div className="field-group">
        <h4>个人信息</h4>
        {fields.slice(2, 4).map(renderField)}
      </div>
    </div>
  )}
</FormBuilder>
```

**Render Props模式优势**:
- ✅ 最大灵活性：完全控制渲染逻辑
- ✅ 逻辑复用：状态管理逻辑可在不同UI间复用
- ✅ 动态性：可根据状态动态调整渲染
- ✅ 可组合性：易于与其他模式组合使用

### 4. 🧩 组合模式 - 构建复杂UI的积木方法

**设计理念**: 通过组合多个小而专注的组件来构建复杂的用户界面，每个组件都有明确的职责。

#### 基础组件组合
```tsx
import { Input, Select, Textarea } from '@leo-video/form-library';

// 简单的组件组合
const UserRegistrationForm = () => (
  <div className="registration-form">
    <div className="form-section">
      <h3>基本信息</h3>
      <Input 
        label="用户名" 
        placeholder="请输入用户名"
        required 
      />
      <Input 
        label="邮箱" 
        type="email"
        placeholder="请输入邮箱地址"
        required 
      />
    </div>
    
    <div className="form-section">
      <h3>个人资料</h3>
      <Select 
        label="性别" 
        options={[
          { value: 'male', label: '男' },
          { value: 'female', label: '女' },
          { value: 'other', label: '其他' }
        ]}
        placeholder="请选择性别"
      />
      <Textarea 
        label="个人简介" 
        placeholder="请简单介绍一下自己"
        minRows={3}
        maxRows={6}
      />
    </div>
  </div>
);
```

#### 增强组件的组合使用
```tsx
import { 
  ValidatedInput, 
  ValidatedSelect, 
  FormFieldInput,
  EnhancedTextarea 
} from '@leo-video/form-library';

// 组合不同增强级别的组件
const AdvancedForm = () => {
  return (
    <div className="advanced-form">
      {/* 基础验证组件 */}
      <ValidatedInput
        label="邮箱"
        validationRules={{
          required: '邮箱不能为空',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: '请输入有效邮箱'
          }
        }}
      />
      
      {/* 字段增强组件 */}
      <FormFieldInput
        label="电话号码"
        fieldSize="large"
        containerClassName="phone-field"
      />
      
      {/* 完全增强组件 */}
      <EnhancedTextarea
        label="详细地址"
        validationRules={{
          required: '地址不能为空',
          minLength: { value: 10, message: '地址至少10个字符' }
        }}
        fieldSize="large"
        containerClassName="address-field"
      />
    </div>
  );
};
```

#### 响应式组合布局
```tsx
// 响应式表单布局
const ResponsiveForm = () => (
  <div className="responsive-form">
    {/* 移动端单列，桌面端双列 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="名字" required />
      <Input label="姓氏" required />
    </div>
    
    {/* 全宽字段 */}
    <div className="grid grid-cols-1 gap-4">
      <Input label="邮箱" type="email" required />
      <Select 
        label="国家" 
        options={countryOptions}
        required 
      />
    </div>
    
    {/* 条件显示的组件组合 */}
    <div className="conditional-fields">
      <Input label="公司名称" />
      <Textarea 
        label="公司描述" 
        placeholder="请描述您的公司..."
      />
    </div>
  </div>
);
```

**组合模式优势**:
- ✅ 模块化：每个组件职责单一，易于维护
- ✅ 可复用性：组件可在不同场景中复用
- ✅ 可测试性：小组件易于单独测试
- ✅ 渐进增强：可以逐步添加功能和复杂性

## 🔄 设计模式协同工作

这四种模式在实际项目中往往协同工作，形成强大的组件生态：

```tsx
// 四种模式的完美结合
const ComprehensiveForm = () => {
  const inputRef = useRef<HTMLInputElement>(null); // forwardRef
  
  return (
    <FormBuilder fields={fields} values={values} errors={errors}> {/* Render Props */}
      {({ renderField, isValid }) => (
        <div className="comprehensive-form"> {/* 组合模式 */}
          
          {/* HOC增强的组件与ref转发 */}
          <EnhancedInput
            ref={inputRef}
            label="重要字段"
            validationRules={{ required: true }}
          />
          
          {/* Render Props提供的灵活渲染 */}
          {renderField(fields[0])}
          
          {/* 组件组合构建复杂UI */}
          <div className="form-actions">
            <button 
              onClick={() => inputRef.current?.focus()} // ref转发的应用
              disabled={!isValid}
            >
              聚焦并提交
            </button>
          </div>
        </div>
      )}
    </FormBuilder>
  );
};
```

## 📦 安装

```bash
npm install @leo-video/form-library
```

## 🚀 快速开始

### 基础使用

```tsx
import { Input, Select, Textarea } from '@leo-video/form-library';

function MyForm() {
  return (
    <form>
      <Input 
        label="用户名"
        placeholder="请输入用户名"
        required
      />
      
      <Select
        label="城市"
        options={[
          { value: 'beijing', label: '北京' },
          { value: 'shanghai', label: '上海' }
        ]}
        placeholder="请选择城市"
      />
      
      <Textarea
        label="备注"
        placeholder="请输入备注信息"
        minRows={3}
        maxRows={6}
      />
    </form>
  );
}
```

### 使用验证增强组件

```tsx
import { ValidatedInput, ValidatedSelect } from '@leo-video/form-library';

function ValidatedForm() {
  return (
    <form>
      <ValidatedInput
        label="邮箱"
        validationRules={{
          required: '邮箱不能为空',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: '请输入有效的邮箱地址'
          }
        }}
        validateOnChange={true}
        validateOnBlur={true}
      />
      
      <ValidatedSelect
        label="年龄段"
        options={[
          { value: '18-25', label: '18-25岁' },
          { value: '26-35', label: '26-35岁' },
          { value: '36-50', label: '36-50岁' }
        ]}
        validationRules={{
          required: '请选择年龄段'
        }}
      />
    </form>
  );
}
```

## 🎨 组件API

### Input组件

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| label | string | - | 标签文本 |
| error | string | - | 错误信息 |
| helperText | string | - | 帮助文本 |
| required | boolean | false | 是否必填 |
| disabled | boolean | false | 是否禁用 |
| variant | 'outlined' \| 'filled' \| 'standard' | 'outlined' | 样式变体 |
| size | 'small' \| 'medium' \| 'large' | 'medium' | 尺寸 |
| startAdornment | ReactNode | - | 前置装饰器 |
| endAdornment | ReactNode | - | 后置装饰器 |

### 高阶组件属性

#### withValidation

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| validationRules | ValidationRule | - | 验证规则 |
| validateOnChange | boolean | true | 值变化时验证 |
| validateOnBlur | boolean | true | 失焦时验证 |

#### ValidationRule

```typescript
interface ValidationRule {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  custom?: (value: any) => boolean | string;
}
```

## 🏗️ 架构设计与实现细节

### 文件结构
```
src/
├── components/          # 基础组件 (forwardRef + 组合模式)
│   ├── Input.tsx       # 输入框组件，支持多种变体和装饰器
│   ├── Select.tsx      # 选择框组件，支持选项配置
│   ├── Textarea.tsx    # 文本域组件，支持自动调整高度
│   ├── FormBuilder.tsx # 表单构建器 (Render Props模式)
│   └── index.ts        # 组件导出和HOC组合
├── hocs/               # 高阶组件 (HOC模式)
│   ├── withValidation.tsx    # 验证功能增强
│   └── withFormField.tsx     # UI样式增强
├── types.ts            # TypeScript类型定义
├── utils/              # 工具函数
│   ├── index.ts        # 验证、样式合并等工具
│   └── validation.ts   # 验证逻辑
└── index.ts            # 主导出文件
```

### 核心技术实现

#### 1. forwardRef 实现透明的DOM访问
```typescript
// 所有基础组件都使用forwardRef包装
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, ...props }, ref) => {
    // 过滤自定义属性，避免传递到DOM
    const domProps = omitCustomProps(props);
    
    return (
      <div className="form-field">
        <label>{label}</label>
        <input 
          ref={ref} 
          {...domProps} // 只传递标准HTML属性
        />
        {error && <span className="error">{error}</span>}
      </div>
    );
  }
);
```

#### 2. HOC 实现功能增强
```typescript
// withValidation HOC的核心实现
function withValidation<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithValidationComponent = forwardRef<any, P & WithValidationProps>(
    ({ validationRules, validateOnChange, ...props }, ref) => {
      const [error, setError] = useState<string>('');
      
      // 验证逻辑
      const validate = useCallback((value: any) => {
        const errorMessage = validateField(value, validationRules);
        setError(errorMessage || '');
        return errorMessage;
      }, [validationRules]);
      
      // 增强的事件处理
      const handleChange = useCallback((event: any) => {
        if (validateOnChange) validate(event.target.value);
        props.onChange?.(event);
      }, [validate, validateOnChange, props.onChange]);
      
      return (
        <WrappedComponent 
          {...props}
          ref={ref}
          error={error || props.error}
          onChange={handleChange}
        />
      );
    }
  );
  
  return WithValidationComponent;
}
```

#### 3. Render Props 实现逻辑复用
```typescript
// FormBuilder的核心Render Props实现
const FormBuilder: React.FC<FormBuilderProps> = ({
  fields, values, errors, onFieldChange, children
}) => {
  // 字段渲染函数
  const renderField = useCallback((field: FormField) => {
    const commonProps = {
      label: field.label,
      value: values[field.name] || '',
      error: errors[field.name],
      onChange: (e: any) => onFieldChange(field.name, e.target.value)
    };
    
    // 根据字段类型渲染对应组件
    switch (field.type) {
      case 'input': return <Input key={field.name} {...commonProps} />;
      case 'select': return <Select key={field.name} {...commonProps} options={field.options} />;
      case 'textarea': return <Textarea key={field.name} {...commonProps} />;
      default: return null;
    }
  }, [fields, values, errors, onFieldChange]);
  
  // 表单状态计算
  const hasErrors = Object.keys(errors).length > 0;
  const isValid = !hasErrors && fields.every(field => 
    !field.required || values[field.name]
  );
  
  // 通过children函数传递渲染能力
  return (
    <>
      {children({
        renderField,
        renderAllFields: () => fields.map(renderField),
        hasErrors,
        isValid
      })}
    </>
  );
};
```

#### 4. 组合模式的灵活应用
```typescript
// 在index.ts中预制各种组合
export const ValidatedInput = withValidation(Input);
export const FormFieldInput = withFormField(Input);
export const EnhancedInput = withFormField(withValidation(Input));

// 用户可以自由组合
const CustomInput = withCustomFeature(withValidation(Input));
```

### 设计原则与最佳实践

#### 1. **单一职责原则**
- 每个组件只负责一个特定功能
- HOC专注于单一增强功能
- 工具函数功能明确

#### 2. **开放封闭原则**
- 对扩展开放：通过HOC轻松添加新功能
- 对修改封闭：不需要修改现有组件代码

#### 3. **依赖倒置原则**
- 高层组件不依赖低层组件的具体实现
- 通过接口和类型约束交互

#### 4. **组合优于继承**
- 使用HOC组合功能而非继承
- 通过Render Props共享逻辑

#### 5. **类型安全**
- 完整的TypeScript支持
- 严格的类型检查和推断
- 导出所有必要的类型定义

#### 6. **可访问性 (A11y)**
- 遵循ARIA标准
- 支持键盘导航
- 提供语义化的HTML结构

#### 7. **性能优化**
- 使用React.memo避免不必要的重渲染
- useCallback优化事件处理函数
- 懒加载和代码分割

### 扩展指南

#### 添加新的基础组件
```typescript
// 1. 创建组件文件
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="checkbox-field">
        <label>
          <input 
            ref={ref} 
            type="checkbox"
            {...omitCustomProps(props)}
          />
          {label}
        </label>
        {error && <span className="error">{error}</span>}
      </div>
    );
  }
);

// 2. 导出组件和增强版本
export { Checkbox };
export const ValidatedCheckbox = withValidation(Checkbox);
export const EnhancedCheckbox = withFormField(withValidation(Checkbox));
```

#### 创建新的HOC
```typescript
// 创建新的功能增强HOC
function withCustomFeature<P extends object>(WrappedComponent: ComponentType<P>) {
  return forwardRef<any, P & CustomFeatureProps>((props, ref) => {
    // 实现自定义功能逻辑
    const enhancedProps = enhanceProps(props);
    
    return <WrappedComponent {...enhancedProps} ref={ref} />;
  });
}
```

#### 扩展Render Props组件
```typescript
// 扩展FormBuilder支持新功能
const AdvancedFormBuilder = ({ children, ...props }) => {
  return (
    <FormBuilder {...props}>
      {(renderProps) => {
        // 添加新的渲染能力
        const enhancedRenderProps = {
          ...renderProps,
          renderFieldGroup: (fields) => renderFieldGroup(fields),
          renderConditionalField: (field, condition) => 
            condition ? renderProps.renderField(field) : null
        };
        
        return children(enhancedRenderProps);
      }}
    </FormBuilder>
  );
};
```

## 📚 学习资源与参考

### 设计模式深入学习

#### 1. **高阶组件 (HOC)**
- [React 官方文档 - 高阶组件](https://reactjs.org/docs/higher-order-components.html)
- [深入理解 React 高阶组件](https://github.com/facebook/react/issues/13968)
- 本项目示例：`src/hocs/withValidation.tsx`, `src/hocs/withFormField.tsx`

#### 2. **forwardRef**
- [React 官方文档 - forwardRef](https://reactjs.org/docs/forwarding-refs.html)
- [Ref 转发的最佳实践](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forward_and_create_ref/)
- 本项目示例：`src/components/Input.tsx`, `src/components/Select.tsx`

#### 3. **Render Props**
- [React 官方文档 - Render Props](https://reactjs.org/docs/render-props.html)
- [Render Props vs HOC](https://cdb.reacttraining.com/use-a-render-prop-50de598f11ce)
- 本项目示例：`src/components/FormBuilder.tsx`

#### 4. **组合模式**
- [React 官方文档 - 组合 vs 继承](https://reactjs.org/docs/composition-vs-inheritance.html)
- [组件组合的最佳实践](https://reactjs.org/docs/thinking-in-react.html)
- 本项目示例：`src/components/index.ts`

### 相关技术栈

- **React 18+**: 最新的React特性和Hooks
- **TypeScript**: 类型安全的JavaScript超集
- **Tailwind CSS**: 实用优先的CSS框架
- **Jest + React Testing Library**: 测试框架

### 项目特色

✨ **完整的设计模式演示**：四种核心React设计模式的完整实现
🔧 **生产级代码质量**：TypeScript、测试、文档齐全
🎯 **实际应用场景**：真实表单组件的完整生态系统
📚 **学习友好**：详细的注释和文档说明
🚀 **现代React实践**：使用最新的React特性和最佳实践

### 相关项目

- [React Hook Form](https://react-hook-form.com/) - 性能优异的表单库
- [Formik](https://formik.org/) - 流行的React表单库
- [Ant Design](https://ant.design/) - 企业级UI组件库
- [Material-UI](https://mui.com/) - React组件库

### 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

### 更新日志

查看 [BUG_FIXES.md](./BUG_FIXES.md) 了解详细的修复历史和更新记录。

## 📝 许可证

MIT License

---

**🎯 这个项目的核心价值**：通过一个完整的表单组件库，深度展示React组件设计模式的实际应用，帮助开发者理解和掌握现代React开发的最佳实践。

**💡 适合人群**：
- 希望深入理解React设计模式的开发者
- 需要构建可复用组件库的团队
- 学习现代React开发最佳实践的同学
- 准备React面试的候选人

*最后更新：2024年*
