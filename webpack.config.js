const path = require('path')
const webpackbar = require('webpackbar')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CompressionWebpackPlugin = require("compression-webpack-plugin"); // 压缩gzip

// 抽离css为单独模块
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// 压缩css
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const isProd = process.env.NODE_ENV == 'production'
module.exports = {
  mode: isProd ? 'production' : 'development', // development
  devtool: isProd ? 'cheap-module-eval-source-map' : 'cheap-module-source-map', 
  entry: './src/main.js', // 单入口
  // 多入口
  // entry: {
  //   app: './app.js',
  //   main: './main.js',
  // }
  output: {
    filename: isProd ? 'js/[name]_[contenthash:8].js' : 'js/[name]_[hash:8].js',
    path: path.resolve(__dirname, './dist'),
  },
  // 解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.js','.vue','.json'],
  },
  module: {
    // 忽略不需要解析的文件
    noParse: /^(vue|vue-router|vuex|vuex-router-sync)$/,
    rules: [
      {
        test:/\.js$/, 
        exclude:/node_modules/,
        // js兼容性处理 babel-loader @babel/core 
        // 只能转换基本语法 @babel/preset-env 
        // 所有js兼容性处理 @babel/polyfill 但是将所有兼容性代码全部引入，体积太大了
        // 最佳，按需加载处理 useBuiltIns: "usage"
        use:[
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    // 按需加载
                    useBuiltIns: "usage", 
                    // 指定core-js版本
                    corejs: 2,
                    // 指定兼容性浏览器版本
                    // targets: {
                    //   chrome: "60",
                    //   firefox: "60",
                    //   ie: "10",
                    //   safari: "10",
                    //   edge: "17",
                    // },
                  },
                ],
              ],
              // 缓存
              cacheDirectory: true,
            }
          }
        ],
      },
      {
        test: /\.css$/i,
        use: [isProd ?  MiniCssExtractPlugin.loader : 'style-loader', "css-loader", 'postcss-loader'],
      },
      {
        test: /\.less$/i,
        use: [
          // "style-loader", // 将样式通过 style 标签注入 开发模式使用，自带热更新
          // MiniCssExtractPlugin.loader // 取代 style-loader，将css抽离单独的css模块
         isProd ?  MiniCssExtractPlugin.loader : 'style-loader', 
          "css-loader", 
          'postcss-loader', // 配合 postcss-preset-env -> postcss.config.js  使用
             // module.exports = {
             //   plugins: [
             //     //使用postcss插件
             //     require("postcss-preset-env"),
             //   ],
             // }
          'less-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'img/[name]_[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'media/[name]_[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              fallback: {
                loader: 'file-loader',
                options: {
                  name: 'fonts/[name]_[hash:8].[ext]'
                }
              }
            }
          }
        ]
      },
    ]
  },
  plugins: [
    new webpackbar(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
      minify: {
        collapseWhitespace: true,  // 删除空格
        removeComments: true, // 删除注释
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name]_[contenthash:8].css',
    }),
    new OptimizeCssAssetsPlugin(),

    // 压缩代码
    new CompressionWebpackPlugin({
      test: /\.js$|\.css/, // 匹配文件名
      threshold: 50000, // 对超过50k的数据压缩
      deleteOriginalAssets: false, // 不删除源文件
      minRatio: 0.8, // 压缩率小于0.8才会压缩
    })

  ],
  // 优化配置
  optimization: {
    splitChunks: {
      maxSize: 1000000,
      minSize: 300000,
      maxAsyncRequests: 5,  // 分割后，按需加载的代码块最多允许的并行请求数
      maxInitialRequests: 3,  // 分割后，入口代码块最多允许的并行请求数
      chunks: 'all',
      name: true,
      cacheGroups: {
        // 提取 node_modules 中代码
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        },
        commons: {
          // async 设置提取异步代码中的公用代码
          chunks: "async",
          name: 'commons-async',
          minSize: 0,
          // 至少为两个 chunks 的公用代码
          minChunks: 2
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        // terserOptions: isProd ? {
        //   compress: {
        //     drop_console: true,
        //     drop_debugger: true,
        //   },
        //   format: { comments: false }
        // }: {},
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log'] // 删除console.log
          },
          format: { comments: false }
        }
      }),
    ],
  },
  // 本地服务配置
  devServer: {
    hot: true,
    compress: false, 
    port: 3001,
    host: "localhost",
    open: true,
    // 代理
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
}