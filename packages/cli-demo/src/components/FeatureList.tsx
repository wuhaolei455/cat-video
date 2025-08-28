import React from 'react';

const features = [
  "Webpack 5 配置",
  "TypeScript 支持",
  "React 18",
  "Hot Module Replacement",
  "ESLint + Prettier",
  "Jest + Testing Library",
  "CSS Modules + SCSS",
  "代码分割",
  "Tree Shaking",
  "Bundle 分析"
];

const FeatureList = () => {
  return (
    <div className="card">
      <h2>✨ 内置功能特性</h2>
      <div className="grid">
        {features.map((feature, index) => (
          <div key={index} style={{ 
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            ✅ {feature}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureList;
