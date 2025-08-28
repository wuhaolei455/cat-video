// Solar脚手架项目配置
module.exports = {
  // 部署配置
  deploy: {
    test: {
      buildPath: 'dist',
      deployPath: '/var/www/test',
      domain: 'test.example.com',
      vconsole: true
    },
    staging: {
      buildPath: 'dist', 
      deployPath: '/var/www/staging',
      domain: 'staging.example.com',
      vconsole: true
    }
  },
  
  // vconsole配置
  vconsole: {
    enabled: true,
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
