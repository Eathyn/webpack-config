// 获取 webpack 的 mode
const index = process.argv.findIndex((arg) => arg === '--mode=development' || arg === '--mode=production')
if (index === -1) {
  throw new Error('package.json 中的 webpack 参数设置错误')
}
const mode = process.argv[index].split('=')[1]
// 将对应 mode 文件中的变量添加到 process.env 中
require('dotenv').config({ path: `.env.${mode}` })

const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')

const devMode = process.env.NODE_ENV === 'development'

module.exports = {
  entry: resolve(__dirname, 'src/main.js'),

  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'main.js',
    clean: true,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          // development 模式下使用 'style-loader' 可以提高构建速度
          // https://webpack.js.org/plugins/mini-css-extract-plugin/#recommended
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.less$/i,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'less-loader',
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            // 小于 10kB 的图片会被 Base64 处理
            maxSize: 10 * 1024,
          },
        },
        generator: {
          // 将图片打包到 image 文件夹
          filename: 'image/[hash][ext][query]',
        },
      },
    ],
  },

  plugins: generatePlugins(devMode),

  optimization: {
    minimizer: [
      // extend default minimizer, i.e. `terser-webpack-plugin` for JS
      '...',
      // 使用 cssnano 优化和压缩 CSS。默认只有在 production 模式下才运行
      new CssMinimizerPlugin(),
      // 压缩图片
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            encodeOptions: {},
          },
        },
        generator: [
          {
            preset: "webp",
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {
                webp: {
                  quality: 90,
                },
              },
            },
          },
        ],
      }),
    ],
  },

  mode: devMode ? 'development' : 'production',
}

function generatePlugins(devMode) {
  const basePlugins = [
    // 依照指定的 html 模板生成 html 文件，并自动引入 CSS 和 JavaScript 文件
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'public/index.html')
    }),
  ]

  const prodModePlugin = [
    // 将 CSS 提取到单独的 CSS 文件
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    })
  ]

  return devMode ? basePlugins : basePlugins.concat(prodModePlugin)
}
