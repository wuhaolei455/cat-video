import chalk from 'chalk';
import ora from 'ora';
import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import http from 'http';

interface ServeConfig {
  env: string;
  port: number;
  buildPath: string;
  openBrowser: boolean;
}

export async function serveVirtualEnv(env: string = 'development', port: number = 8080, openBrowser: boolean = true): Promise<void> {
  const spinner = ora('正在启动虚环境服务器...').start();
  
  try {
    // 检查构建文件
    const buildPath = path.join(process.cwd(), 'dist');
    if (!await fs.pathExists(buildPath)) {
      throw new Error('未找到构建文件，请先运行 npm run build');
    }

    const config: ServeConfig = {
      env,
      port,
      buildPath,
      openBrowser
    };

    // 检查端口是否可用
    const isPortAvailable = await checkPortAvailable(port);
    if (!isPortAvailable) {
      const newPort = await findAvailablePort(port);
      console.log(chalk.yellow(`⚠️  端口 ${port} 已被占用，使用端口 ${newPort}`));
      config.port = newPort;
    }

    spinner.succeed('虚环境服务器配置完成');

    // 启动服务器
    await startServer(config);

  } catch (error) {
    spinner.fail('虚环境服务器启动失败');
    console.error(chalk.red('错误:'), error);
    process.exit(1);
  }
}

async function startServer(config: ServeConfig): Promise<void> {
  // 使用Node.js内置模块创建简单服务器
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://localhost:${config.port}`);
      
      // 环境信息API
      if (url.pathname === '/api/env-info') {
        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          environment: config.env,
          buildPath: config.buildPath,
          port: config.port,
          timestamp: new Date().toISOString(),
          buildTime: getBuildTime(config.buildPath)
        }, null, 2));
        return;
      }
      
      // 静态文件服务
      let filePath = path.join(config.buildPath, url.pathname === '/' ? 'index.html' : url.pathname);
      
      // 如果文件不存在，返回index.html（SPA路由支持）
      if (!await fs.pathExists(filePath)) {
        filePath = path.join(config.buildPath, 'index.html');
      }
      
      if (await fs.pathExists(filePath)) {
        const ext = path.extname(filePath);
        const contentType = getContentType(ext);
        
        res.writeHead(200, { 'Content-Type': contentType });
        const content = await fs.readFile(filePath);
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('文件未找到');
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('服务器内部错误');
    }
  });

  // 启动服务器
  server.listen(config.port, () => {
    const url = `http://localhost:${config.port}`;
    
    console.log(chalk.green('\n🎉 虚环境服务器启动成功！'));
    console.log(chalk.cyan('='.repeat(50)));
    console.log(chalk.cyan(`🌍 环境: ${config.env}`));
    console.log(chalk.cyan(`🔗 访问地址: ${url}`));
    console.log(chalk.cyan(`📁 构建目录: ${config.buildPath}`));
    console.log(chalk.cyan(`⏰ 启动时间: ${new Date().toLocaleString()}`));
    console.log(chalk.cyan('='.repeat(50)));
    console.log(chalk.gray('\n💡 使用技巧:'));
    console.log(chalk.gray(`  📱 移动端访问: ${url}`));
    console.log(chalk.gray(`  🔍 环境信息: ${url}/api/env-info`));
    console.log(chalk.gray('  ⌨️  按 Ctrl+C 停止服务器'));
    
    // 显示二维码（如果可用）
    generateQRCode(url);

    // 自动打开浏览器
    if (config.openBrowser) {
      setTimeout(() => {
        const open = require('child_process').exec;
        const command = process.platform === 'darwin' ? 'open' : 
                       process.platform === 'win32' ? 'start' : 'xdg-open';
        open(`${command} ${url}`);
      }, 1000);
    }
  });

  // 优雅关闭
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 正在停止虚环境服务器...'));
    server.close(() => {
      console.log(chalk.green('✅ 服务器已停止'));
      process.exit(0);
    });
  });

  // 错误处理
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(chalk.red(`❌ 端口 ${config.port} 已被占用`));
    } else {
      console.error(chalk.red('❌ 服务器错误:'), error);
    }
    process.exit(1);
  });
}

async function checkPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    
    server.on('error', () => resolve(false));
  });
}

async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  
  while (!(await checkPortAvailable(port))) {
    port++;
    if (port > startPort + 100) {
      throw new Error('无法找到可用端口');
    }
  }
  
  return port;
}

function getBuildTime(buildPath: string): string {
  try {
    const indexHtml = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      const stats = fs.statSync(indexHtml);
      return stats.mtime.toISOString();
    }
  } catch (error) {
    // 忽略错误
  }
  return new Date().toISOString();
}

function getContentType(ext: string): string {
  const types: { [key: string]: string } = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  };
  
  return types[ext] || 'text/plain';
}

function generateQRCode(url: string): void {
  try {
    // 使用简单的ASCII二维码生成
    console.log(chalk.gray('\n📱 移动端扫码访问:'));
    console.log(chalk.gray('┌─────────────────────┐'));
    console.log(chalk.gray('│  ██ ▄▄▄▄▄▄▄ ██ ▄▄  │'));
    console.log(chalk.gray('│  ██ █ ▄▄▄ █ ██ ██  │'));
    console.log(chalk.gray('│  ██ █ ███ █ ██ ▄▄  │'));
    console.log(chalk.gray('│  ██ ▀▀▀▀▀▀▀ ██ ██  │'));
    console.log(chalk.gray('│  ██▄▄▄██▄▄▄▄██▄▄▄  │'));
    console.log(chalk.gray('│  ████ ▄▄ █▀▀██ ███  │'));
    console.log(chalk.gray('│  ██ ▄▄▄▄▄▄▄ █▀ ▄█  │'));
    console.log(chalk.gray('│  ██ █ ▄▄▄ █ ██▄██  │'));
    console.log(chalk.gray('│  ██ █ ███ █ ██ ▄▄  │'));
    console.log(chalk.gray('│  ██ ▀▀▀▀▀▀▀ ██████  │'));
    console.log(chalk.gray('└─────────────────────┘'));
    console.log(chalk.gray(`📱 或手动输入: ${url}`));
  } catch (error) {
    // 二维码生成失败，只显示URL
    console.log(chalk.gray(`\n📱 移动端访问: ${url}`));
  }
}
