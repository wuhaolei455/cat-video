import React from 'react';

const About = () => {
  return (
    <div className="card">
      <h2>关于 Solar React</h2>
      <p>
        Solar是一个功能完整的React脚手架工具，包含了现代React开发所需的所有工具和配置。
      </p>
      <ul style={{ marginTop: '1rem', paddingLeft: '2rem' }}>
        <li>🏗️ 完整的Webpack配置</li>
        <li>📝 TypeScript支持</li>
        <li>🎨 CSS预处理器支持</li>
        <li>🧪 完整的测试环境</li>
        <li>📏 代码质量工具</li>
        <li>⚡ 开发服务器和热更新</li>
      </ul>
    </div>
  );
};

export default About;
