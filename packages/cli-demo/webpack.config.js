const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    entry: './src/index.tsx',
    
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
          test: /\.(ts|tsx|js|jsx)$/,
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
          test: /\.(css|scss|sass)$/,
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
          test: /\.(png|jpe?g|gif|svg|ico)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[contenthash][ext]'
          }
        },
        
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
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
            test: /[\\/]node_modules[\\/]/,
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
};