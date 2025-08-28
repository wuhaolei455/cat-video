#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createProject } from './commands/create';
import { buildProject } from './commands/build';
import { devServer } from './commands/dev';
import { deployToVirtualEnv } from './commands/deploy.js';
import { manageEnvironment } from './commands/env.js';

const program = new Command();

program
  .name('solar')
  .description('Solar React 脚手架 - 完整的React项目构建工具')
  .version('1.0.0');

// 创建新项目
program
  .command('create <project-name>')
  .description('创建一个新的React项目')
  .option('-t, --template <template>', '项目模板 (basic, advanced)', 'basic')
  .action(async (projectName: string, options: { template: string }) => {
    console.log(chalk.blue('🚀 开始创建Solar React项目...'));
    await createProject(projectName, options.template);
  });

// 构建项目
program
  .command('build')
  .description('构建生产环境项目')
  .option('--analyze', '分析打包结果')
  .action(async (options: { analyze?: boolean }) => {
    console.log(chalk.blue('🏗️  开始构建项目...'));
    await buildProject(options.analyze);
  });

// 开发服务器
program
  .command('dev')
  .description('启动开发服务器')
  .option('-p, --port <port>', '端口号', '3000')
  .option('--host <host>', '主机地址', 'localhost')
  .option('--env <env>', '环境配置 (dev, test, prod)', 'dev')
  .action(async (options: { port: string; host: string; env: string }) => {
    console.log(chalk.blue('🔥 启动开发服务器...'));
    await devServer(parseInt(options.port), options.host, options.env);
  });

// 虚环境预览服务器
program
  .command('serve')
  .description('启动虚环境预览服务器')
  .option('-e, --env <env>', '预览环境', 'development')
  .option('-p, --port <port>', '端口号', '8080')
  .option('--no-open', '不自动打开浏览器')
  .action(async (options: { env: string; port: string; open: boolean }) => {
    try {
      console.log(chalk.blue(`🌍 启动虚环境预览: ${options.env}`));
      const { serveVirtualEnv } = await import('./commands/serve');
      await serveVirtualEnv(options.env, parseInt(options.port), options.open);
    } catch (error) {
      console.error(chalk.red('❌ 虚环境服务器启动失败:'), error);
      process.exit(1);
    }
  });

// 虚环境部署
program
  .command('deploy')
  .description('部署到虚拟环境')
  .option('-e, --env <env>', '目标环境 (test, staging)', 'test')
  .option('--vconsole', '启用vconsole调试')
  .option('-f, --force', '强制刷新部署')
  .action(async (options: { env: string; vconsole?: boolean; force?: boolean }) => {
    try {
      console.log(chalk.blue('🚀 开始部署到虚拟环境...'));
      await deployToVirtualEnv(options.env, options.vconsole, options.force);
    } catch (error) {
      console.error(chalk.red('❌ 部署到虚拟环境失败:'), error);
      process.exit(1);
    }
  });

// 快捷虚环境部署命令
program
  .command('refresh <env>')
  .alias('rf')
  .description('快捷强制刷新虚环境部署')
  .option('--vconsole', '启用vconsole调试')
  .option('-f, --force', '强制刷新部署', true)
  .action(async (env: string, options: { vconsole?: boolean; force?: boolean }) => {
    try {
      console.log(chalk.blue(`🔄 强制刷新虚环境: ${env}`));
      await deployToVirtualEnv(env, options.vconsole, true);
    } catch (error) {
      console.error(chalk.red('❌ 强制刷新虚环境失败:'), error);
      process.exit(1);
    }
  });

// 环境管理命令
program
  .command('env [environment]')
  .description('管理和切换虚拟环境配置')
  .option('-l, --list', '列出所有可用环境')
  .option('-s, --set <env>', '设置默认环境')
  .option('-c, --current', '显示当前环境')
  .option('--create <name>', '创建新环境配置')
  .option('--delete <name>', '删除环境配置')
  .option('-f, --force', '强制覆盖现有环境（不询问）')
  .action(async (environment: string | undefined, options: { 
    list?: boolean; 
    set?: string; 
    current?: boolean; 
    create?: string; 
    delete?: string;
    force?: boolean;
  }) => {
    try {
      await manageEnvironment(environment, options);
    } catch (error) {
      console.error(chalk.red('❌ 环境管理失败:'), error);
      process.exit(1);
    }
  });

// 错误处理
program.on('command:*', () => {
  console.error(chalk.red('❌ 未知命令: %s'), program.args.join(' '));
  console.log(chalk.yellow('💡 使用 --help 查看可用命令'));
  process.exit(1);
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
