// 获取 webpack 的 mode
const index = process.argv.findIndex(
  (arg) =>
    arg === '--mode=development' ||
    arg === '--mode=production' ||
    arg === 'serve',
)
if (index === -1) {
  throw new Error('package.json 中的 webpack 参数设置错误')
}
if (
  process.argv[index] === '--mode=development' ||
  process.argv[index] === '--mode=production'
) {
  const mode = process.argv[index].split('=')[1]
  // 将对应 mode 文件中的变量添加到 process.env 中
  require('dotenv').config({ path: `.env.${mode}` })
}

const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

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
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          cacheCompression: false,
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]',
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

      /* 压缩图片 - sharp - lossless */
      // new ImageMinimizerPlugin({
      //   minimizer: [
      //     {
      //       implementation: ImageMinimizerPlugin.sharpMinify,
      //       options: {
      //         encodeOptions: {
      //           jpeg: {
      //             quality: 100,
      //           },
      //           webp: {
      //             lossless: true,
      //           },
      //           avif: {
      //             lossless: true,
      //           },
      //           png: {},
      //           gif: {},
      //         },
      //       },
      //     },
      //     {
      //       implementation: ImageMinimizerPlugin.svgoMinify,
      //       options: {
      //         encodeOptions: {
      //           multipass: true,
      //           plugins: ['preset-default'],
      //         },
      //       },
      //     },
      //   ],
      // }),

      /* 压缩图片 - sharp - lossy */
      // new ImageMinimizerPlugin({
      //   minimizer: [
      //     {
      //       implementation: ImageMinimizerPlugin.sharpMinify,
      //       options: {
      //         encodeOptions: {},
      //       },
      //     },
      //     {
      //       implementation: ImageMinimizerPlugin.svgoMinify,
      //       options: {
      //         encodeOptions: {
      //           multipass: true,
      //           plugins: ['preset-default'],
      //         },
      //       },
      //     },
      //   ],
      // }),

      /* 压缩图片 - imagemin - lossless */
      // new ImageMinimizerPlugin({
      //   minimizer: {
      //     implementation: ImageMinimizerPlugin.imageminMinify,
      //     options: {
      //       plugins: [
      //         ['gifsicle', { optimizationLevel: 3 }],
      //         [
      //           'svgo',
      //           {
      //             plugins: [
      //               {
      //                 name: 'preset-default',
      //                 params: {
      //                   overrides: {
      //                     removeViewBox: false,
      //                     addAttributesToSVGElement: {
      //                       params: {
      //                         attributes: [
      //                           { xmlns: 'http://www.w3.org/2000/svg' },
      //                         ],
      //                       },
      //                     },
      //                   },
      //                 },
      //               },
      //             ],
      //           },
      //         ],
      //         ['jpegtran', { progressive: true }],
      //         ['optipng', { optimizationLevel: 5 }],
      //       ],
      //     },
      //   },
      // }),

      /* 压缩图片 - imagemin - lossy */
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { optimizationLevel: 3 }],
              [
                'svgo',
                {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeViewBox: false,
                          addAttributesToSVGElement: {
                            params: {
                              attributes: [
                                { xmlns: 'http://www.w3.org/2000/svg' },
                              ],
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              ],
              ['mozjpeg', { quality: 20 }],
              ['pngquant'],
            ],
          },
        },
      }),
    ],
  },

  devServer: {},

  mode: devMode ? 'development' : 'production',

  devtool: devMode ? 'eval-cheap-module-source-map' : 'hidden-source-map',
}

function generatePlugins(devMode) {
  const basePlugins = [
    // 依照指定的 html 模板生成 html 文件，并自动引入 CSS 和 JavaScript 文件
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'public/index.html'),
    }),
    new ESLintPlugin(),
  ]

  const prodModePlugin = [
    // 将 CSS 提取到单独的 CSS 文件
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
  ]

  return devMode ? basePlugins : basePlugins.concat(prodModePlugin)
}
