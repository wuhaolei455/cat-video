import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';

interface EnvironmentConfig {
  name: string;
  buildPath: string;
  deployPath: string;
  domain: string;
  apiUrl: string;
  vconsole: boolean;
  description?: string;
  displayName?: string;
  isDefault?: boolean;
}

interface SolarEnvConfig {
  currentEnv: string;
  environments: { [key: string]: EnvironmentConfig };
}

export async function manageEnvironment(
  environment: string | undefined,
  options: {
    list?: boolean;
    set?: string;
    current?: boolean;
    create?: string;
    delete?: string;
    force?: boolean;
  }
): Promise<void> {
  try {
    const configPath = await getEnvConfigPath();
    let config = await loadEnvConfig(configPath);

    // 如果只传入环境名称，切换到该环境
    if (environment && !options.list && !options.set && !options.current && !options.create && !options.delete) {
      await switchToEnvironment(config, environment, configPath, options.force);
      return;
    }

    // 列出所有环境
    if (options.list) {
      await listEnvironments(config);
      return;
    }

    // 显示当前环境
    if (options.current) {
      await showCurrentEnvironment(config);
      return;
    }

    // 设置默认环境
    if (options.set) {
      await setDefaultEnvironment(config, options.set, configPath);
      return;
    }

    // 创建新环境
    if (options.create) {
      await createEnvironment(config, options.create, configPath);
      return;
    }

    // 删除环境
    if (options.delete) {
      await deleteEnvironment(config, options.delete, configPath);
      return;
    }

    // 默认显示环境管理菜单
    await showEnvironmentMenu(config, configPath);

  } catch (error) {
    console.error(chalk.red('❌ 环境管理失败:'), error);
    process.exit(1);
  }
}

async function getEnvConfigPath(): Promise<string> {
  // 优先使用项目级配置
  const projectConfigPath = path.join(process.cwd(), 'solar.env.json');
  if (await fs.pathExists(projectConfigPath)) {
    return projectConfigPath;
  }

  // 使用全局配置
  const homeDir = require('os').homedir();
  const globalConfigPath = path.join(homeDir, '.solar', 'env.json');
  await fs.ensureDir(path.dirname(globalConfigPath));
  
  return globalConfigPath;
}

async function loadEnvConfig(configPath: string): Promise<SolarEnvConfig> {
  if (await fs.pathExists(configPath)) {
    return await fs.readJson(configPath);
  }

  // 默认配置
  const defaultConfig: SolarEnvConfig = {
    currentEnv: 'development',
    environments: {
      development: {
        name: 'development',
        buildPath: 'dist',
        deployPath: '/tmp/solar-dev',
        domain: 'localhost:3000',
        apiUrl: 'http://localhost:3001',
        vconsole: true,
        description: '开发环境',
        displayName: '开发环境',
        isDefault: true
      },
      test: {
        name: 'test',
        buildPath: 'dist',
        deployPath: '/var/www/test',
        domain: 'test.example.com',
        apiUrl: 'https://test-api.example.com',
        vconsole: true,
        description: '测试环境',
        displayName: '测试环境'
      },
      staging: {
        name: 'staging',
        buildPath: 'dist',
        deployPath: '/var/www/staging',
        domain: 'staging.example.com',
        apiUrl: 'https://staging-api.example.com',
        vconsole: false,
        description: '预发布环境',
        displayName: '预发布环境'
      },
      production: {
        name: 'production',
        buildPath: 'dist',
        deployPath: '/var/www/production',
        domain: 'example.com',
        apiUrl: 'https://api.example.com',
        vconsole: false,
        description: '生产环境',
        displayName: '生产环境'
      }
    }
  };

  await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
  return defaultConfig;
}

async function saveEnvConfig(config: SolarEnvConfig, configPath: string): Promise<void> {
  await fs.writeJson(configPath, config, { spaces: 2 });
}

async function createEnvironmentAutomatically(envName: string): Promise<EnvironmentConfig> {
  // 基于环境名称智能推断配置
  const isProduction = envName.includes('prod') || envName === 'production';
  const isStaging = envName.includes('staging') || envName.includes('stage');
  const isDev = envName.includes('dev') || envName === 'development';
  
  // 智能生成配置
  const config: EnvironmentConfig = {
    name: envName,
    buildPath: 'dist',
    deployPath: `/var/www/${envName}`,
    domain: isProduction ? 'example.com' : `${envName}.example.com`,
    apiUrl: isProduction ? 'https://api.example.com' : `https://${envName}-api.example.com`,
    vconsole: !isProduction, // 生产环境禁用vconsole
    description: `${envName}环境 (自动创建)`,
    displayName: `${envName}环境`
  };
  
  console.log(chalk.cyan(`\n📋 自动生成的环境配置:`));
  console.log(chalk.gray(`  名称: ${config.name}`));
  console.log(chalk.gray(`  描述: ${config.description}`));
  console.log(chalk.gray(`  域名: ${config.domain}`));
  console.log(chalk.gray(`  API: ${config.apiUrl}`));
  console.log(chalk.gray(`  部署路径: ${config.deployPath}`));
  console.log(chalk.gray(`  VConsole: ${config.vconsole ? '启用' : '禁用'}`));
  
  return config;
}

async function switchToEnvironment(config: SolarEnvConfig, envName: string, configPath: string, force: boolean = false): Promise<void> {
  const spinner = ora(`切换到环境: ${envName}`).start();

  // 如果环境不存在，自动创建；如果存在，询问是否覆盖
  if (!config.environments[envName]) {
    spinner.text = `环境 "${envName}" 不存在，正在自动创建...`;
    
    // 自动创建环境配置
    const newEnv = await createEnvironmentAutomatically(envName);
    config.environments[envName] = newEnv;
    await saveEnvConfig(config, configPath);
    
    console.log(chalk.green(`✅ 已自动创建环境: ${envName}`));
  } else {
    // 环境已存在，根据force参数决定是否覆盖
    if (force) {
      spinner.text = `强制覆盖环境: ${envName}`;
      
      // 强制覆盖环境配置
      const newEnv = await createEnvironmentAutomatically(envName);
      config.environments[envName] = newEnv;
      await saveEnvConfig(config, configPath);
      
      console.log(chalk.green(`✅ 已强制覆盖环境: ${envName}`));
    } else {
      // 询问是否覆盖
      spinner.stop();
      console.log(chalk.yellow(`⚠️  环境 "${envName}" 已存在`));
      
      const { shouldOverride } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldOverride',
          message: `是否要覆盖现有的 "${envName}" 环境配置？`,
          default: false
        }
      ]);
      
      if (shouldOverride) {
        const spinner2 = ora(`正在覆盖环境: ${envName}`).start();
        
        // 覆盖环境配置
        const newEnv = await createEnvironmentAutomatically(envName);
        config.environments[envName] = newEnv;
        await saveEnvConfig(config, configPath);
        
        spinner2.succeed(`✅ 已覆盖环境: ${envName}`);
      } else {
        console.log(chalk.gray('保持现有配置不变'));
      }
    }
  }

  config.currentEnv = envName;
  await saveEnvConfig(config, configPath);

  // 更新项目的环境变量文件
  await updateProjectEnvFile(config.environments[envName]);

  spinner.succeed(`已切换到环境: ${envName}`);
  
  const env = config.environments[envName];
  console.log(chalk.green('\n🌍 当前环境信息:'));
  console.log(chalk.cyan(`  名称: ${env.name}`));
  console.log(chalk.cyan(`  描述: ${env.description || '无'}`));
  console.log(chalk.cyan(`  域名: ${env.domain}`));
  console.log(chalk.cyan(`  API地址: ${env.apiUrl}`));
  console.log(chalk.cyan(`  VConsole: ${env.vconsole ? '启用' : '禁用'}`));
}

async function updateProjectEnvFile(env: EnvironmentConfig): Promise<void> {
  const envFilePath = path.join(process.cwd(), `.env.${env.name}`);
  const envContent = `# Solar脚手架自动生成的环境配置
# 环境: ${env.name} - ${env.description || ''}
# 生成时间: ${new Date().toISOString()}

REACT_APP_ENV=${env.name}
REACT_APP_API_URL=${env.apiUrl}
REACT_APP_VCONSOLE=${env.vconsole}
REACT_APP_DOMAIN=${env.domain}
REACT_APP_BUILD_TIME=${new Date().toISOString()}

# 可以在这里添加其他环境特定的变量
`;

  await fs.writeFile(envFilePath, envContent);
  console.log(chalk.gray(`  已更新环境文件: .env.${env.name}`));
}

async function listEnvironments(config: SolarEnvConfig): Promise<void> {
  console.log(chalk.blue('\n🌍 可用环境列表:'));
  console.log('='.repeat(60));

  Object.values(config.environments).forEach(env => {
    const isCurrent = env.name === config.currentEnv;
    const marker = isCurrent ? chalk.green('● ') : '  ';
    const status = isCurrent ? chalk.green('(当前)') : '';
    
    console.log(`${marker}${chalk.bold(env.name)} ${status}`);
    console.log(`    描述: ${env.description || '无'}`);
    console.log(`    域名: ${env.domain}`);
    console.log(`    API: ${env.apiUrl}`);
    console.log(`    VConsole: ${env.vconsole ? '✅' : '❌'}`);
    console.log('');
  });

  console.log(chalk.gray('💡 使用 "solar env <环境名>" 切换环境'));
}

async function showCurrentEnvironment(config: SolarEnvConfig): Promise<void> {
  const currentEnv = config.environments[config.currentEnv];
  
  if (!currentEnv) {
    console.log(chalk.red('❌ 当前环境配置不存在'));
    return;
  }

  console.log(chalk.blue('\n🌍 当前环境信息:'));
  console.log('='.repeat(40));
  console.log(chalk.green(`名称: ${currentEnv.name}`));
  console.log(`描述: ${currentEnv.description || '无'}`);
  console.log(`域名: ${currentEnv.domain}`);
  console.log(`API地址: ${currentEnv.apiUrl}`);
  console.log(`构建路径: ${currentEnv.buildPath}`);
  console.log(`部署路径: ${currentEnv.deployPath}`);
  console.log(`VConsole: ${currentEnv.vconsole ? '启用' : '禁用'}`);
}

async function setDefaultEnvironment(config: SolarEnvConfig, envName: string, configPath: string): Promise<void> {
  if (!config.environments[envName]) {
    console.log(chalk.red(`❌ 环境 "${envName}" 不存在`));
    return;
  }

  config.currentEnv = envName;
  await saveEnvConfig(config, configPath);
  
  console.log(chalk.green(`✅ 已设置 "${envName}" 为默认环境`));
}

async function createEnvironment(config: SolarEnvConfig, envName: string, configPath: string): Promise<void> {
  if (config.environments[envName]) {
    console.log(chalk.yellow(`⚠️  环境 "${envName}" 已存在`));
    return;
  }

  console.log(chalk.blue(`\n🛠️  创建新环境: ${envName}`));
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: '环境描述:',
      default: `${envName}环境`
    },
    {
      type: 'input',
      name: 'domain',
      message: '访问域名:',
      default: `${envName}.example.com`
    },
    {
      type: 'input',
      name: 'apiUrl',
      message: 'API地址:',
      default: `https://${envName}-api.example.com`
    },
    {
      type: 'input',
      name: 'deployPath',
      message: '部署路径:',
      default: `/var/www/${envName}`
    },
    {
      type: 'confirm',
      name: 'vconsole',
      message: '启用VConsole调试?',
      default: envName !== 'production'
    }
  ]);

  const newEnv: EnvironmentConfig = {
    name: envName,
    buildPath: 'dist',
    deployPath: answers.deployPath,
    domain: answers.domain,
    apiUrl: answers.apiUrl,
    vconsole: answers.vconsole,
    description: answers.description
  };

  config.environments[envName] = newEnv;
  await saveEnvConfig(config, configPath);

  console.log(chalk.green(`✅ 环境 "${envName}" 创建成功`));
  
  const { switchNow } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'switchNow',
      message: `是否立即切换到 "${envName}" 环境?`,
      default: true
    }
  ]);

  if (switchNow) {
    await switchToEnvironment(config, envName, configPath);
  }
}

async function deleteEnvironment(config: SolarEnvConfig, envName: string, configPath: string): Promise<void> {
  if (!config.environments[envName]) {
    console.log(chalk.red(`❌ 环境 "${envName}" 不存在`));
    return;
  }

  if (['development', 'production'].includes(envName)) {
    console.log(chalk.red(`❌ 不能删除系统环境 "${envName}"`));
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `确定要删除环境 "${envName}" 吗？此操作不可恢复。`,
      default: false
    }
  ]);

  if (!confirm) {
    console.log(chalk.yellow('❌ 操作取消'));
    return;
  }

  delete config.environments[envName];

  // 如果删除的是当前环境，切换到development
  if (config.currentEnv === envName) {
    config.currentEnv = 'development';
    console.log(chalk.yellow(`⚠️  已自动切换到 development 环境`));
  }

  await saveEnvConfig(config, configPath);
  console.log(chalk.green(`✅ 环境 "${envName}" 已删除`));
}

async function showEnvironmentMenu(config: SolarEnvConfig, configPath: string): Promise<void> {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '选择环境管理操作:',
      choices: [
        { name: '📋 列出所有环境', value: 'list' },
        { name: '🌍 显示当前环境', value: 'current' },
        { name: '🔄 切换环境', value: 'switch' },
        { name: '➕ 创建新环境', value: 'create' },
        { name: '🗑️  删除环境', value: 'delete' },
        { name: '❌ 退出', value: 'exit' }
      ]
    }
  ]);

  switch (action) {
    case 'list':
      await listEnvironments(config);
      break;
    case 'current':
      await showCurrentEnvironment(config);
      break;
    case 'switch':
      const { env } = await inquirer.prompt([
        {
          type: 'list',
          name: 'env',
          message: '选择要切换的环境:',
          choices: Object.keys(config.environments)
        }
      ]);
      await switchToEnvironment(config, env, configPath);
      break;
    case 'create':
      const { newEnvName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'newEnvName',
          message: '输入新环境名称:',
          validate: (input) => {
            if (!input.trim()) return '环境名称不能为空';
            if (config.environments[input]) return '环境名称已存在';
            return true;
          }
        }
      ]);
      await createEnvironment(config, newEnvName, configPath);
      break;
    case 'delete':
      const deletableEnvs = Object.keys(config.environments)
        .filter(env => !['development', 'production'].includes(env));
      
      if (deletableEnvs.length === 0) {
        console.log(chalk.yellow('⚠️  没有可删除的环境'));
        break;
      }

      const { deleteEnv } = await inquirer.prompt([
        {
          type: 'list',
          name: 'deleteEnv',
          message: '选择要删除的环境:',
          choices: deletableEnvs
        }
      ]);
      await deleteEnvironment(config, deleteEnv, configPath);
      break;
    case 'exit':
      console.log(chalk.gray('👋 再见!'));
      break;
  }
}

async function showEnvironmentStatus(config: SolarEnvConfig): Promise<void> {
  console.log(chalk.blue('\n🌍 虚环境状态面板'));
  console.log('='.repeat(80));

  const currentTime = new Date().toLocaleString();
  console.log(chalk.gray(`📅 检查时间: ${currentTime}\n`));

  // 遍历所有环境
  for (const [envName, env] of Object.entries(config.environments)) {
    const isCurrent = envName === config.currentEnv;
    const statusIcon = isCurrent ? '🟢' : '⚪';
    const currentTag = isCurrent ? chalk.green(' (当前)') : '';
    
    console.log(`${statusIcon} ${chalk.bold(env.displayName || env.description || env.name)}${currentTag}`);
    console.log(chalk.gray(`   名称: ${env.name}`));
    console.log(chalk.gray(`   域名: ${env.domain}`));
    console.log(chalk.gray(`   API: ${env.apiUrl}`));
    console.log(chalk.gray(`   部署路径: ${env.deployPath}`));
    console.log(chalk.gray(`   VConsole: ${env.vconsole ? '✅ 启用' : '❌ 禁用'}`));
    
    // 检查部署状态
    const deployStatus = await checkDeploymentStatus(env);
    console.log(chalk.gray(`   部署状态: ${deployStatus.status}`));
    if (deployStatus.lastDeploy) {
      console.log(chalk.gray(`   最后部署: ${deployStatus.lastDeploy}`));
    }
    
    // 生成访问链接
    const accessUrl = generateEnvironmentUrl(env);
    console.log(chalk.cyan(`   🔗 访问链接: ${accessUrl}`));
    
    console.log(''); // 空行分隔
  }

  console.log(chalk.yellow('💡 使用方法:'));
  console.log(chalk.gray('   solar env <环境名>           # 切换环境'));
  console.log(chalk.gray('   solar deploy --env <环境名>   # 部署到指定环境'));
  console.log(chalk.gray('   solar serve --env <环境名>    # 本地预览环境'));
}

async function openCurrentEnvironment(config: SolarEnvConfig): Promise<void> {
  const currentEnv = config.environments[config.currentEnv];
  
  if (!currentEnv) {
    console.log(chalk.red('❌ 当前环境配置不存在'));
    return;
  }

  const url = generateEnvironmentUrl(currentEnv);
  
  console.log(chalk.blue(`🌍 打开环境: ${currentEnv.displayName || currentEnv.description || currentEnv.name}`));
  console.log(chalk.cyan(`🔗 访问地址: ${url}`));

  try {
    const { execSync } = require('child_process');
    const command = process.platform === 'darwin' ? 'open' : 
                   process.platform === 'win32' ? 'start' : 'xdg-open';
    
    execSync(`${command} "${url}"`, { stdio: 'ignore' });
    console.log(chalk.green('✅ 已在浏览器中打开'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  无法自动打开浏览器，请手动访问上述链接'));
  }
}

async function checkDeploymentStatus(env: EnvironmentConfig): Promise<{
  status: string;
  lastDeploy?: string;
}> {
  try {
    // 检查部署目录是否存在（这里用临时目录模拟）
    const deployPath = `/tmp/solar-deploy-${env.name}-*`;
    const { execSync } = require('child_process');
    
    try {
      const result = execSync(`ls -t ${deployPath} 2>/dev/null | head -1`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      if (result.trim()) {
        const stats = fs.statSync(result.trim());
        return {
          status: '✅ 已部署',
          lastDeploy: stats.mtime.toLocaleString()
        };
      }
    } catch (error) {
      // 忽略ls错误
    }
    
    return { status: '❌ 未部署' };
  } catch (error) {
    return { status: '❓ 状态未知' };
  }
}

function generateEnvironmentUrl(env: EnvironmentConfig): string {
  // 根据环境生成访问URL
  const protocol = env.domain.includes('localhost') ? 'http' : 'https';
  const timestamp = Date.now();
  
  // 如果是本地环境，使用实际可访问的地址
  if (env.name === 'development' || env.domain.includes('localhost')) {
    return `http://localhost:3000?env=${env.name}&t=${timestamp}`;
  }
  
  return `${protocol}://${env.domain}?env=${env.name}&t=${timestamp}`;
}
