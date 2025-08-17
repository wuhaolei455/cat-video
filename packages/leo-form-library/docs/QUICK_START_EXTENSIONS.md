# 快速开始 - 高级扩展功能

本指南帮助您快速上手leo-form-library的高级扩展功能。

## 🚀 5分钟快速体验

### 1. 防抖搜索输入框

```typescript
import { DebouncedInput } from '@leo-video/form-library';

const SearchDemo = () => {
  const handleSearch = (query: string) => {
    console.log('搜索:', query);
    // 调用搜索API
  };

  return (
    <DebouncedInput
      label="搜索"
      placeholder="输入关键词..."
      debounceMs={500}
      onDebouncedChange={handleSearch}
    />
  );
};
```

### 2. 异步验证用户名

```typescript
import { AsyncValidatedInput } from '@leo-video/form-library';

const UsernameDemo = () => {
  const checkUsername = async (username: string): Promise<string | null> => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const taken = ['admin', 'user123'].includes(username);
    return taken ? '用户名已被使用' : null;
  };

  return (
    <AsyncValidatedInput
      label="用户名"
      asyncValidationRule={{ validator: checkUsername }}
    />
  );
};
```

### 3. 自动保存草稿

```typescript
import { StorageInput } from '@leo-video/form-library';

const DraftDemo = () => (
  <StorageInput
    label="文章内容"
    storageKey="article-draft"
    placeholder="开始写作，内容会自动保存..."
    autoSave={true}
  />
);
```

### 4. 条件显示字段

```typescript
import { EnhancedSelect, ConditionalEnhancedInput } from '@leo-video/form-library';

const ConditionalDemo = () => {
  const [userType, setUserType] = useState('');

  return (
    <>
      <EnhancedSelect
        label="用户类型"
        value={userType}
        onChange={(e) => setUserType(e.target.value)}
        options={[
          { value: '', label: '请选择' },
          { value: 'business', label: '企业用户' }
        ]}
      />
      
      <ConditionalEnhancedInput
        label="公司名称"
        condition={() => userType === 'business'}
        formValues={{ userType }}
        animateToggle={true}
      />
    </>
  );
};
```

### 5. 超级组合输入框

```typescript
import { SuperInput } from '@leo-video/form-library';

const SuperDemo = () => (
  <SuperInput
    label="邮箱"
    debounceMs={400}
    validationRules={{
      required: '邮箱不能为空',
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: '邮箱格式不正确'
      }
    }}
    onDebouncedChange={(value) => console.log('防抖值:', value)}
  />
);
```

## 📋 预制组合列表

| 组合名称 | 包含功能 | 适用场景 |
|---------|---------|---------|
| `ValidatedInput` | 验证 | 基础表单验证 |
| `DebouncedInput` | 防抖 | 搜索输入 |
| `AsyncValidatedInput` | 异步验证 | 用户名检查 |
| `StorageInput` | 本地存储 | 草稿保存 |
| `ConditionalInput` | 条件渲染 | 动态表单 |
| `EnhancedInput` | 验证 + 字段样式 | 标准表单 |
| `SuperInput` | 防抖 + 验证 + 字段样式 | 高级表单 |
| `SearchInput` | 防抖 + 本地存储 | 搜索历史 |
| `UltimateInput` | 所有功能 | 演示用途 |

## 🛠️ 自定义组合

您也可以创建自己的组合：

```typescript
import { withDebounce, withValidation, Input } from '@leo-video/form-library';

// 创建自定义组合
const MyCustomInput = withValidation(withDebounce(Input));

// 使用
<MyCustomInput
  debounceMs={600}
  validationRules={{ required: true }}
  onDebouncedChange={handleChange}
/>
```

## 📖 更多资源

- 📚 [完整文档](./ADVANCED_EXTENSIONS.md)
- 🎯 [实战示例](../examples/AdvancedFormExample.tsx)
- 🧪 [API参考](../src/components/index.ts)

## ❓ 常见问题

**Q: HOC的执行顺序是什么？**
A: 从内到外执行，如 `withA(withB(Component))` 中，B先执行，A后执行。

**Q: 如何调试HOC组合？**
A: 使用React DevTools，每个HOC都会显示其displayName。

**Q: 性能考虑？**
A: 避免过度组合，按需使用。每个HOC都经过性能优化。

**Q: TypeScript支持？**
A: 完整支持，所有HOC都有正确的类型推导。
