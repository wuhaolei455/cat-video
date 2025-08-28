import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

interface DeployConfig {
  env: string;
  vconsole: boolean;
  buildPath: string;
  deployPath: string;
}

export async function deployToVirtualEnv(env: string = 'test', vconsole: boolean = false, force: boolean = false): Promise<void> {
  const spinner = ora('准备部署到虚拟环境...').start();
  
  try {
    // 检查项目配置
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      throw new Error('未找到package.json文件，请确保在项目根目录执行此命令');
    }
    
    const packageJson = await fs.readJson(packageJsonPath);
    
    // 读取部署配置
    const deployConfig = await getDeployConfig(env, vconsole);
    
    // 强制刷新时清理缓存和旧文件
    if (force) {
      spinner.text = '强制刷新：清理缓存和旧文件...';
      await cleanupForForceRefresh(deployConfig);
    }
    
    spinner.text = force ? '强制重新构建项目...' : '正在构建项目...';
    
    // 构建前端项目
    await buildForVirtualEnv(deployConfig, force);
    
    spinner.text = force ? '强制重新部署到虚拟环境...' : '正在部署到虚拟环境...';
    
    // 部署到虚拟环境
    await deployBuild(deployConfig, force);
    
    // 生成访问链接
    const accessUrl = generateAccessUrl(deployConfig);
    
    spinner.succeed('部署完成！');
    
    console.log(chalk.green('\n🎉 虚拟环境部署成功！'));
    console.log(chalk.cyan(`📱 访问链接: ${accessUrl}`));
    
    if (force) {
      console.log(chalk.magenta('🔄 已强制刷新部署，清除了所有缓存'));
    }
    
    if (vconsole) {
      console.log(chalk.yellow('🔍 vconsole已启用，可以在移动端调试'));
    }
    
    console.log(chalk.gray('\n📋 部署信息:'));
    console.log(chalk.gray(`  环境: ${env}`));
    console.log(chalk.gray(`  构建路径: ${deployConfig.buildPath}`));
    console.log(chalk.gray(`  部署路径: ${deployConfig.deployPath}`));
    console.log(chalk.gray(`  强制刷新: ${force ? '是' : '否'}`));
    
  } catch (error) {
    spinner.fail('部署失败');
    console.error(chalk.red('错误:'), error);
    process.exit(1);
  }
}

async function getDeployConfig(env: string, vconsole: boolean): Promise<DeployConfig> {
  const configPath = path.join(process.cwd(), 'solar.config.js');
  let config: any = {};
  
  // 读取项目配置文件
  if (await fs.pathExists(configPath)) {
    const configModule = require(configPath);
    config = configModule.default || configModule;
  }
  
  // 默认配置
  const defaultConfig: { [key: string]: any } = {
    test: {
      buildPath: 'dist',
      deployPath: '/var/www/test',
      domain: 'test.example.com'
    },
    staging: {
      buildPath: 'dist',
      deployPath: '/var/www/staging', 
      domain: 'staging.example.com'
    }
  };
  
  const envConfig = config.deploy?.[env] || defaultConfig[env] || defaultConfig.test;
  
  return {
    env,
    vconsole,
    buildPath: envConfig.buildPath,
    deployPath: envConfig.deployPath
  };
}

async function buildForVirtualEnv(config: DeployConfig, force: boolean = false): Promise<void> {
  // 创建环境变量文件
  const envContent = `
# Solar脚手架自动生成的环境配置
REACT_APP_ENV=${config.env}
REACT_APP_VCONSOLE=${config.vconsole}
REACT_APP_BUILD_TIME=${new Date().toISOString()}
`;
  
  await fs.writeFile(path.join(process.cwd(), `.env.${config.env}`), envContent.trim());
  
  // 如果启用vconsole，修改入口文件
  if (config.vconsole) {
    await injectVConsole();
  }
  
  // 执行构建
  const buildEnv = { 
    ...process.env, 
    NODE_ENV: 'production', 
    REACT_APP_ENV: config.env,
    FORCE_REBUILD: force ? 'true' : 'false'
  };
  
  const buildCommand = 'npm run build';
  execSync(buildCommand, { 
    stdio: 'pipe',
    cwd: process.cwd(),
    env: buildEnv
  });
  
  // 构建后清理vconsole注入
  if (config.vconsole) {
    await cleanupVConsole();
  }
}

async function injectVConsole(): Promise<void> {
  const indexPath = path.join(process.cwd(), 'src/index.tsx');
  
  if (!await fs.pathExists(indexPath)) {
    return;
  }
  
  let content = await fs.readFile(indexPath, 'utf-8');
  
  // 检查是否已经注入过
  if (content.includes('vconsole')) {
    return;
  }
  
  // 在文件开头添加vconsole导入和初始化
  const vConsoleCode = `
// Solar脚手架自动注入的vconsole配置
import VConsole from 'vconsole';

// 仅在测试环境启用vconsole
if (process.env.REACT_APP_VCONSOLE === 'true' && process.env.REACT_APP_ENV !== 'production') {
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
  
  // 备份原文件
  await fs.copy(indexPath, indexPath + '.backup');
  await fs.writeFile(indexPath, content);
}

async function cleanupVConsole(): Promise<void> {
  const indexPath = path.join(process.cwd(), 'src/index.tsx');
  const backupPath = indexPath + '.backup';
  
  if (await fs.pathExists(backupPath)) {
    await fs.move(backupPath, indexPath, { overwrite: true });
  }
}

async function deployBuild(config: DeployConfig, force: boolean = false): Promise<void> {
  const buildPath = path.join(process.cwd(), config.buildPath);
  
  if (!await fs.pathExists(buildPath)) {
    throw new Error(`构建目录不存在: ${buildPath}`);
  }
  
  // 这里可以根据实际需求实现部署逻辑
  // 例如：上传到服务器、复制到指定目录等
  
  // 示例：本地部署（实际项目中可能是SSH上传等）
  const targetPath = path.join('/tmp', `solar-deploy-${config.env}-${Date.now()}`);
  await fs.ensureDir(targetPath);
  await fs.copy(buildPath, targetPath);
  
  console.log(chalk.gray(`  构建文件已复制到: ${targetPath}`));
}

async function cleanupForForceRefresh(config: DeployConfig): Promise<void> {
  const buildPath = path.join(process.cwd(), config.buildPath);
  const nodeModulesCache = path.join(process.cwd(), 'node_modules/.cache');
  
  // 清理构建目录
  if (await fs.pathExists(buildPath)) {
    await fs.remove(buildPath);
    console.log(chalk.gray('  已清理构建目录'));
  }
  
  // 清理webpack缓存
  if (await fs.pathExists(nodeModulesCache)) {
    await fs.remove(nodeModulesCache);
    console.log(chalk.gray('  已清理webpack缓存'));
  }
  
  // 清理环境变量文件
  const envFiles = ['.env.local', '.env.development.local', '.env.test.local', '.env.production.local'];
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (await fs.pathExists(envPath)) {
      await fs.remove(envPath);
      console.log(chalk.gray(`  已清理 ${envFile}`));
    }
  }
}

function generateAccessUrl(config: DeployConfig): string {
  // 使用本地服务器地址，确保可访问
  const timestamp = Date.now();
  const port = 8080 + Math.floor(Math.random() * 100); // 随机端口避免冲突
  
  // 启动本地预览服务器
  startLocalPreviewServer(config, port);
  
  return `http://localhost:${port}?env=${config.env}&t=${timestamp}`;
}

async function startLocalPreviewServer(config: DeployConfig, port: number): Promise<void> {
  const buildPath = path.join(process.cwd(), config.buildPath);
  
  if (!await fs.pathExists(buildPath)) {
    console.log(chalk.yellow('⚠️  构建文件不存在，无法启动预览服务器'));
    return;
  }

  try {
    // 使用子进程启动预览服务器
    const { spawn } = require('child_process');
    
    const serverProcess = spawn('python3', ['-m', 'http.server', port.toString()], {
      cwd: buildPath,
      detached: true,
      stdio: 'ignore'
    });
    
    serverProcess.unref(); // 允许父进程退出
    
    console.log(chalk.gray(`  🌐 本地预览服务器已启动: http://localhost:${port}`));
    console.log(chalk.gray(`  📁 服务目录: ${buildPath}`));
  } catch (error) {
    console.log(chalk.yellow('⚠️  无法启动预览服务器，请手动访问构建文件'));
  }
}

// 生成项目配置文件
export async function generateProjectConfig(): Promise<void> {
  const configContent = `// Solar脚手架项目配置
module.exports = {
  // 部署配置
  deploy: {
    test: {
      buildPath: 'dist',
      deployPath: '/var/www/test',
      domain: 'test.example.com',
      // 可以添加更多配置如服务器信息、上传方式等
    },
    staging: {
      buildPath: 'dist', 
      deployPath: '/var/www/staging',
      domain: 'staging.example.com',
    }
  },
  
  // vconsole配置
  vconsole: {
    theme: 'dark',
    defaultPlugins: ['system', 'network', 'element', 'storage'],
    maxLogNumber: 1000
  },
  
  // 其他项目配置...
};
`;
  
  const configPath = path.join(process.cwd(), 'solar.config.js');
  if (!await fs.pathExists(configPath)) {
    await fs.writeFile(configPath, configContent);
    console.log(chalk.green('✅ 已生成项目配置文件: solar.config.js'));
  }
}
