import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export async function buildProject(analyze?: boolean): Promise<void> {
  const spinner = ora('正在构建项目...').start();
  
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
    
    // 清理dist目录
    const distPath = path.join(process.cwd(), 'dist');
    if (await fs.pathExists(distPath)) {
      await fs.remove(distPath);
      spinner.text = '已清理输出目录...';
    }
    
    // 运行构建命令
    const buildCommand = analyze ? 'npm run build:analyze' : 'npm run build';
    
    spinner.text = '正在编译项目...';
    execSync(buildCommand, { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    // 检查构建结果
    if (await fs.pathExists(distPath)) {
      const stats = await getBuildStats(distPath);
      spinner.succeed('构建完成！');
      
      console.log(chalk.green('\n📦 构建统计:'));
      console.log(chalk.cyan(`  输出目录: ${distPath}`));
      console.log(chalk.cyan(`  文件数量: ${stats.fileCount}`));
      console.log(chalk.cyan(`  总大小: ${formatBytes(stats.totalSize)}`));
      
      if (stats.jsSize > 0) {
        console.log(chalk.cyan(`  JavaScript: ${formatBytes(stats.jsSize)}`));
      }
      if (stats.cssSize > 0) {
        console.log(chalk.cyan(`  CSS: ${formatBytes(stats.cssSize)}`));
      }
      if (stats.imageSize > 0) {
        console.log(chalk.cyan(`  图片: ${formatBytes(stats.imageSize)}`));
      }
      
      if (analyze) {
        console.log(chalk.yellow('\n🔍 Bundle分析器将在浏览器中打开...'));
      }
      
    } else {
      throw new Error('构建失败：未生成输出文件');
    }
    
  } catch (error) {
    spinner.fail('构建失败');
    console.error(chalk.red('错误:'), error);
    process.exit(1);
  }
}

interface BuildStats {
  fileCount: number;
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
}

async function getBuildStats(distPath: string): Promise<BuildStats> {
  const stats: BuildStats = {
    fileCount: 0,
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    imageSize: 0
  };
  
  const files = await fs.readdir(distPath, { recursive: true });
  
  for (const file of files) {
    const filePath = path.join(distPath, file as string);
    const fileStat = await fs.stat(filePath);
    
    if (fileStat.isFile()) {
      stats.fileCount++;
      stats.totalSize += fileStat.size;
      
      const ext = path.extname(file as string).toLowerCase();
      
      if (ext === '.js') {
        stats.jsSize += fileStat.size;
      } else if (ext === '.css') {
        stats.cssSize += fileStat.size;
      } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
        stats.imageSize += fileStat.size;
      }
    }
  }
  
  return stats;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
