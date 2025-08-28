import chalk from 'chalk';
import ora from 'ora';
import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export async function devServer(port: number = 3000, host: string = 'localhost', env: string = 'dev'): Promise<void> {
  const spinner = ora('正在启动开发服务器...').start();
  
  try {
    // 检查是否在项目根目录
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      throw new Error('未找到package.json文件，请确保在项目根目录执行此命令');
    }
    
    // 检查webpack配置
    const webpackConfigPath = path.join(process.cwd(), 'webpack.config.js');
    if (!await fs.pathExists(webpackConfigPath)) {
      throw new Error('未找到webpack.config.js文件');
    }
    
    // 检查端口是否被占用
    const isPortInUse = await checkPortInUse(port);
    if (isPortInUse) {
      const newPort = await findAvailablePort(port);
      console.log(chalk.yellow(`⚠️  端口 ${port} 已被占用，使用端口 ${newPort}`));
      port = newPort;
    }
    
    spinner.succeed('开发服务器配置完成');
    
    console.log(chalk.blue('🔥 启动开发服务器...'));
    console.log(chalk.cyan(`   本地地址: http://${host}:${port}`));
    console.log(chalk.cyan(`   网络地址: http://localhost:${port}`));
    console.log(chalk.yellow(`   环境模式: ${env}`));
    console.log(chalk.gray('   按 Ctrl+C 停止服务器\n'));
    
    // 启动webpack dev server
    const devProcess = spawn('npx', [
      'webpack', 'serve',
      '--mode', 'development',
      '--port', port.toString(),
      '--host', host,
      '--open'
    ], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // 处理进程退出
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 正在停止开发服务器...'));
      devProcess.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      devProcess.kill('SIGTERM');
      process.exit(0);
    });
    
    devProcess.on('error', (error) => {
      console.error(chalk.red('❌ 开发服务器启动失败:'), error);
      process.exit(1);
    });
    
    devProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(chalk.red(`❌ 开发服务器异常退出，退出码: ${code}`));
        process.exit(code || 1);
      }
    });
    
  } catch (error) {
    spinner.fail('开发服务器启动失败');
    console.error(chalk.red('错误:'), error);
    process.exit(1);
  }
}

async function checkPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(true);
    });
  });
}

async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  
  while (await checkPortInUse(port)) {
    port++;
  }
  
  return port;
}
