import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execSync } from 'child_process';

interface ProjectConfig {
  name: string;
  template: string;
  features: string[];
}

export async function createProject(projectName: string, template: string = 'basic'): Promise<void> {
  const targetDir = path.resolve(process.cwd(), projectName);
  
  // 检查目录是否存在
  if (await fs.pathExists(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `目录 ${projectName} 已存在，是否覆盖？`,
        default: false
      }
    ]);
    
    if (!overwrite) {
      console.log(chalk.yellow('❌ 操作取消'));
      return;
    }
    
    await fs.remove(targetDir);
  }

  // 选择功能特性
  const { features } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: '选择需要的功能特性:',
      choices: [
        { name: 'TypeScript', value: 'typescript', checked: true },
        { name: 'React Router', value: 'router', checked: true },
        { name: 'Redux Toolkit', value: 'redux', checked: false },
        { name: 'Styled Components', value: 'styled-components', checked: false },
        { name: 'Ant Design', value: 'antd', checked: false },
        { name: 'VConsole调试', value: 'vconsole', checked: true },
        { name: 'PWA', value: 'pwa', checked: false },
        { name: 'Docker', value: 'docker', checked: false }
      ]
    }
  ]);

  const config: ProjectConfig = {
    name: projectName,
    template,
    features
  };

  const spinner = ora('正在创建项目...').start();

  try {
    // 创建项目目录
    await fs.ensureDir(targetDir);
    
    // 复制模板文件
    await copyTemplate(config, targetDir);
    
    // 生成package.json
    await generatePackageJson(config, targetDir);
    
    // 生成配置文件
    await generateConfigFiles(config, targetDir);
    
    // 生成源代码
    await generateSourceCode(config, targetDir);
    
    // 生成项目配置文件
    await generateProjectConfig(config, targetDir);
    
    spinner.succeed('项目创建成功！');
    
    console.log(chalk.green('\n🎉 项目创建完成！'));
    console.log(chalk.cyan('\n📦 接下来的步骤:'));
    console.log(chalk.white(`  cd ${projectName}`));
    console.log(chalk.white('  npm install'));
    console.log(chalk.white('  npm run dev'));
    
  } catch (error) {
    spinner.fail('项目创建失败');
    console.error(chalk.red('错误:'), error);
    process.exit(1);
  }
}

async function copyTemplate(config: ProjectConfig, targetDir: string): Promise<void> {
  const templateDir = path.join(__dirname, '../../templates', config.template);
  
  if (await fs.pathExists(templateDir)) {
    await fs.copy(templateDir, targetDir);
  }
}

async function generatePackageJson(config: ProjectConfig, targetDir: string): Promise<void> {
  const packageJson = {
    name: config.name,
    version: '0.1.0',
    private: true,
    scripts: {
      'dev': 'webpack serve --mode development',
      'build': 'webpack --mode production',
      'build:analyze': 'webpack --mode production --env analyze',
      'test': 'jest',
      'test:watch': 'jest --watch',
      'test:coverage': 'jest --coverage',
      'lint': 'eslint src --ext .ts,.tsx,.js,.jsx',
      'lint:fix': 'eslint src --ext .ts,.tsx,.js,.jsx --fix',
      'format': 'prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,scss,md}"',
      'type-check': 'tsc --noEmit',
      'prepare': 'husky install'
    },
    dependencies: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      ...(config.features.includes('router') && { 'react-router-dom': '^6.17.0' }),
      ...(config.features.includes('redux') && { 
        '@reduxjs/toolkit': '^1.9.7',
        'react-redux': '^8.1.3'
      }),
      ...(config.features.includes('styled-components') && { 
        'styled-components': '^6.1.0'
      }),
      ...(config.features.includes('antd') && { 'antd': '^5.10.0' }),
      ...(config.features.includes('vconsole') && { 'vconsole': '^3.15.1' })
    },
    devDependencies: {
      '@types/react': '^18.2.31',
      '@types/react-dom': '^18.2.14',
      'webpack': '^5.89.0',
      'webpack-cli': '^5.1.4',
      'webpack-dev-server': '^4.15.1',
      'html-webpack-plugin': '^5.5.3',
      'css-loader': '^6.8.1',
      'style-loader': '^3.3.3',
      'sass-loader': '^13.3.2',
      'sass': '^1.69.4',
      'postcss': '^8.4.31',
      'postcss-loader': '^7.3.3',
      'autoprefixer': '^10.4.16',
      'mini-css-extract-plugin': '^2.7.6',
      'terser-webpack-plugin': '^5.3.9',
      'webpack-bundle-analyzer': '^4.9.1',
      'typescript': '^5.2.2',
      'ts-loader': '^9.5.0',
      'eslint': '^8.52.0',
      '@typescript-eslint/eslint-plugin': '^6.9.0',
      '@typescript-eslint/parser': '^6.9.0',
      'eslint-plugin-react': '^7.33.2',
      'eslint-plugin-react-hooks': '^4.6.0',
      'prettier': '^3.0.3',
      'husky': '^8.0.3',
      'lint-staged': '^15.0.2',
      'jest': '^29.7.0',
      'jest-environment-jsdom': '^29.7.0',
      '@testing-library/react': '^13.4.0',
      '@testing-library/jest-dom': '^6.1.4',
      '@testing-library/user-event': '^14.5.1',
      '@types/jest': '^29.5.6',
      'ts-jest': '^29.1.1',
      ...(config.features.includes('styled-components') && { 
        '@types/styled-components': '^5.1.29'
      })
    },
    'lint-staged': {
      '*.{ts,tsx,js,jsx}': [
        'eslint --fix',
        'prettier --write'
      ],
      '*.{json,css,scss,md}': [
        'prettier --write'
      ]
    }
  };

  await fs.writeJson(path.join(targetDir, 'package.json'), packageJson, { spaces: 2 });
}

async function generateConfigFiles(config: ProjectConfig, targetDir: string): Promise<void> {
  // Webpack配置
  const webpackConfig = generateWebpackConfig(config);
  await fs.writeFile(path.join(targetDir, 'webpack.config.js'), webpackConfig);
  
  // TypeScript配置
  if (config.features.includes('typescript')) {
    const tsConfig = generateTsConfig();
    await fs.writeJson(path.join(targetDir, 'tsconfig.json'), tsConfig, { spaces: 2 });
  }
  
  // ESLint配置
  const eslintConfig = generateEslintConfig(config);
  await fs.writeJson(path.join(targetDir, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  
  // Prettier配置
  const prettierConfig = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false
  };
  await fs.writeJson(path.join(targetDir, '.prettierrc'), prettierConfig, { spaces: 2 });
  
  // Jest配置
  const jestConfig = generateJestConfig(config);
  await fs.writeJson(path.join(targetDir, 'jest.config.json'), jestConfig, { spaces: 2 });
  
  // Git忽略文件
  const gitignore = `
node_modules/
dist/
build/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
*.tsbuildinfo
coverage/
.nyc_output/
.vscode/
.idea/
*.swp
*.swo
  `.trim();
  await fs.writeFile(path.join(targetDir, '.gitignore'), gitignore);
}

function generateWebpackConfig(config: ProjectConfig): string {
  return `const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    entry: './src/index.${config.features.includes('typescript') ? 'tsx' : 'jsx'}',
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash].chunk.js' : '[name].chunk.js',
      clean: true,
      publicPath: '/'
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },

    module: {
      rules: [
        // TypeScript/JavaScript
        {
          test: /\\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: isDevelopment
            }
          }
        },
        
        // CSS/SCSS
        {
          test: /\\.(css|scss|sass)$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  localIdentName: isDevelopment 
                    ? '[name]__[local]--[hash:base64:5]' 
                    : '[hash:base64]'
                }
              }
            },
            'postcss-loader',
            'sass-loader'
          ]
        },
        
        // 静态资源
        {
          test: /\\.(png|jpe?g|gif|svg|ico)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[contenthash][ext]'
          }
        },
        
        {
          test: /\\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[contenthash][ext]'
          }
        }
      ]
    },

    plugins: [
      // 定义环境变量
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'process.env.REACT_APP_VCONSOLE': JSON.stringify(process.env.REACT_APP_VCONSOLE || 'true'),
        'process.env.REACT_APP_ENV': JSON.stringify(process.env.REACT_APP_ENV || 'development'),
        'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:3001'),
        'process.env.REACT_APP_DOMAIN': JSON.stringify(process.env.REACT_APP_DOMAIN || 'localhost:3000')
      }),
      
      new HtmlWebpackPlugin({
        template: 'public/index.html',
        favicon: 'public/favicon.svg',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        } : false
      }),
      
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css',
          chunkFilename: '[name].[contenthash].chunk.css'
        })
      ] : []),
      
      ...(env.analyze ? [new BundleAnalyzerPlugin()] : [])
    ],

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction
            }
          }
        })
      ],
      
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\\\/]node_modules[\\\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      },
      
      runtimeChunk: {
        name: 'runtime'
      }
    },

    devServer: {
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true,
      compress: true,
      client: {
        overlay: {
          errors: true,
          warnings: false
        }
      }
    },

    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    
    performance: {
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  };
};`;
}

function generateTsConfig(): object {
  return {
    compilerOptions: {
      target: 'ES2020',
      lib: ['dom', 'dom.iterable', 'es6'],
      allowJs: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noFallthroughCasesInSwitch: true,
      module: 'esnext',
      moduleResolution: 'node',
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: false,
      jsx: 'react-jsx',
      baseUrl: '.',
      paths: {
        '@/*': ['src/*']
      }
    },
    include: [
      'src',
      'types'
    ],
    exclude: [
      'node_modules',
      'dist'
    ]
  };
}

function generateEslintConfig(config: ProjectConfig): object {
  return {
    env: {
      browser: true,
      es2021: true,
      node: true,
      jest: true
    },
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: [
      'react',
      '@typescript-eslint'
    ],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  };
}

function generateJestConfig(config: ProjectConfig): object {
  return {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
      '<rootDir>/src/**/?(*.)(spec|test).(ts|tsx|js)'
    ],
    collectCoverageFrom: [
      'src/**/*.(ts|tsx)',
      '!src/**/*.d.ts',
      '!src/index.tsx',
      '!src/setupTests.ts'
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  };
}

async function generateSourceCode(config: ProjectConfig, targetDir: string): Promise<void> {
  const srcDir = path.join(targetDir, 'src');
  const publicDir = path.join(targetDir, 'public');
  
  await fs.ensureDir(srcDir);
  await fs.ensureDir(publicDir);
  
  // 生成public文件
  await generatePublicFiles(publicDir);
  
  // 生成源代码文件
  await generateAppFiles(config, srcDir);
}

async function generatePublicFiles(publicDir: string): Promise<void> {
  // index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="./favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Solar React应用" />
    <title>Solar React App</title>
</head>
<body>
    <noscript>您需要启用JavaScript来运行此应用。</noscript>
    <div id="root"></div>
</body>
</html>`;
  
  await fs.writeFile(path.join(publicDir, 'index.html'), indexHtml);
  
  // favicon.ico (简单的SVG图标)
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="#61dafb"/>
  <text x="50" y="58" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="white">S</text>
</svg>`;
  await fs.writeFile(path.join(publicDir, 'favicon.svg'), favicon);
}

async function generateAppFiles(config: ProjectConfig, srcDir: string): Promise<void> {
  const isTypeScript = config.features.includes('typescript');
  const ext = isTypeScript ? 'tsx' : 'jsx';
  const jsExt = isTypeScript ? 'ts' : 'js';
  
  // 主入口文件
  const indexContent = `import React from 'react';
import { createRoot } from 'react-dom/client';
${config.features.includes('router') ? "import { BrowserRouter } from 'react-router-dom';" : ''}
${config.features.includes('redux') ? "import { Provider } from 'react-redux';\nimport { store } from './store';" : ''}
import App from './App';
import './styles/index.css';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
${config.features.includes('redux') ? '    <Provider store={store}>' : ''}
${config.features.includes('router') ? '    <BrowserRouter>' : ''}
      <App />
${config.features.includes('router') ? '    </BrowserRouter>' : ''}
${config.features.includes('redux') ? '    </Provider>' : ''}
  </React.StrictMode>
);
`;
  
  await fs.writeFile(path.join(srcDir, `index.${ext}`), indexContent);
  
  // App组件
  const appContent = generateAppComponent(config);
  await fs.writeFile(path.join(srcDir, `App.${ext}`), appContent);
  
  // 样式文件
  await fs.ensureDir(path.join(srcDir, 'styles'));
  const indexCss = `/* Solar React 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.button:hover {
  background: #5a67d8;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
`;
  
  await fs.writeFile(path.join(srcDir, 'styles/index.css'), indexCss);
  
  // 测试设置文件
  const setupTests = `import '@testing-library/jest-dom';
`;
  await fs.writeFile(path.join(srcDir, `setupTests.${jsExt}`), setupTests);
  
  // 组件目录和示例组件
  await fs.ensureDir(path.join(srcDir, 'components'));
  await generateExampleComponents(config, path.join(srcDir, 'components'));
  
  // 如果启用了Redux
  if (config.features.includes('redux')) {
    await generateReduxFiles(config, srcDir);
  }
  
  // 如果启用了路由
  if (config.features.includes('router')) {
    await generateRouterFiles(config, srcDir);
  }
}

function generateAppComponent(config: ProjectConfig): string {
  const hasRouter = config.features.includes('router');
  const hasRedux = config.features.includes('redux');
  
  return `import React${hasRedux ? ', { useEffect }' : ''} from 'react';
${hasRouter ? "import { Routes, Route, Link } from 'react-router-dom';" : ''}
${hasRedux ? "import { useAppDispatch, useAppSelector } from './hooks/redux';\nimport { increment, decrement } from './store/counterSlice';" : ''}
import Counter from './components/Counter';
import FeatureList from './components/FeatureList';
${hasRouter ? "import About from './components/About';" : ''}

function App() {
${hasRedux ? `  const dispatch = useAppDispatch();
  const count = useAppSelector(state => state.counter.value);
` : ''}
  return (
    <div className="container">
      <header className="header">
        <h1>🌞 Solar React 脚手架</h1>
        <p>功能完整的React开发环境</p>
      </header>
      
${hasRouter ? `      <nav style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>首页</Link>
        <Link to="/about">关于</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={
          <>
            <Counter />
            <FeatureList />
          </>
        } />
        <Route path="/about" element={<About />} />
      </Routes>` : `      <Counter />
      <FeatureList />`}
    </div>
  );
}

export default App;
`;
}

async function generateExampleComponents(config: ProjectConfig, componentsDir: string): Promise<void> {
  const isTypeScript = config.features.includes('typescript');
  const ext = isTypeScript ? 'tsx' : 'jsx';
  
  // Counter组件
  const counterContent = `import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div className="card">
      <h2>计数器示例</h2>
      <p>当前计数: <strong>{count}</strong></p>
      <div style={{ marginTop: '1rem' }}>
        <button 
          className="button" 
          onClick={() => setCount(count - 1)}
          style={{ marginRight: '0.5rem' }}
        >
          -1
        </button>
        <button 
          className="button" 
          onClick={() => setCount(count + 1)}
        >
          +1
        </button>
      </div>
    </div>
  );
};

export default Counter;
`;
  
  await fs.writeFile(path.join(componentsDir, `Counter.${ext}`), counterContent);
  
  // FeatureList组件
  const features = [
    'Webpack 5 配置',
    'TypeScript 支持',
    'React 18',
    'Hot Module Replacement',
    'ESLint + Prettier',
    'Jest + Testing Library',
    'CSS Modules + SCSS',
    '代码分割',
    'Tree Shaking',
    'Bundle 分析'
  ];
  
  const featureListContent = `import React from 'react';

const features = ${JSON.stringify(features, null, 2)};

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
`;
  
  await fs.writeFile(path.join(componentsDir, `FeatureList.${ext}`), featureListContent);
  
  // About组件（如果启用路由）
  if (config.features.includes('router')) {
    const aboutContent = `import React from 'react';

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
`;
    
    await fs.writeFile(path.join(componentsDir, `About.${ext}`), aboutContent);
  }
}

async function generateReduxFiles(config: ProjectConfig, srcDir: string): Promise<void> {
  const isTypeScript = config.features.includes('typescript');
  const jsExt = isTypeScript ? 'ts' : 'js';
  
  // Store配置
  await fs.ensureDir(path.join(srcDir, 'store'));
  
  const storeContent = `import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`;
  
  await fs.writeFile(path.join(srcDir, `store/index.${jsExt}`), storeContent);
  
  // Counter slice
  const counterSliceContent = `import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
`;
  
  await fs.writeFile(path.join(srcDir, `store/counterSlice.${jsExt}`), counterSliceContent);
  
  // Redux hooks
  await fs.ensureDir(path.join(srcDir, 'hooks'));
  
  const reduxHooksContent = `import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`;
  
  await fs.writeFile(path.join(srcDir, `hooks/redux.${jsExt}`), reduxHooksContent);
}

async function generateRouterFiles(config: ProjectConfig, srcDir: string): Promise<void> {
  // 路由相关的文件已经在App组件中处理了
  // 这里可以添加更多路由相关的配置文件
}

async function generateProjectConfig(config: ProjectConfig, targetDir: string): Promise<void> {
  const hasVConsole = config.features.includes('vconsole');
  
  const configContent = `// Solar脚手架项目配置
module.exports = {
  // 部署配置
  deploy: {
    test: {
      buildPath: 'dist',
      deployPath: '/var/www/test',
      domain: 'test.example.com',
      vconsole: ${hasVConsole}
    },
    staging: {
      buildPath: 'dist', 
      deployPath: '/var/www/staging',
      domain: 'staging.example.com',
      vconsole: ${hasVConsole}
    }
  },
  
  // vconsole配置
  vconsole: {
    enabled: ${hasVConsole},
    theme: 'dark',
    defaultPlugins: ['system', 'network', 'element', 'storage'],
    maxLogNumber: 1000
  },
  
  // 环境变量配置
  env: {
    development: {
      REACT_APP_API_URL: 'http://localhost:3001',
      REACT_APP_DEBUG: 'true'
    },
    test: {
      REACT_APP_API_URL: 'https://test-api.example.com',
      REACT_APP_DEBUG: 'true'
    },
    production: {
      REACT_APP_API_URL: 'https://api.example.com', 
      REACT_APP_DEBUG: 'false'
    }
  }
};
`;
  
  await fs.writeFile(path.join(targetDir, 'solar.config.js'), configContent);
  
  // 如果启用了vconsole，修改index文件
  if (hasVConsole) {
    await generateVConsoleCode(config, targetDir);
  }
}

async function generateVConsoleCode(config: ProjectConfig, targetDir: string): Promise<void> {
  const isTypeScript = config.features.includes('typescript');
  const ext = isTypeScript ? 'tsx' : 'jsx';
  const indexPath = path.join(targetDir, 'src', `index.${ext}`);
  
  let content = await fs.readFile(indexPath, 'utf-8');
  
  // 添加vconsole导入和初始化代码
  const vConsoleCode = `
// VConsole调试工具配置
import VConsole from 'vconsole';

// 仅在非生产环境启用vconsole
if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_VCONSOLE !== 'false') {
  new VConsole({
    theme: 'dark',
    defaultPlugins: ['system', 'network', 'element', 'storage'],
    maxLogNumber: 1000
  });
}

`;
  
  // 在React导入之前插入vconsole代码
  content = content.replace(
    "import React from 'react';",
    vConsoleCode + "import React from 'react';"
  );
  
  await fs.writeFile(indexPath, content);
}
