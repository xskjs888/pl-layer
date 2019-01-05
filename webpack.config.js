const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),

    filename: 'pl-layer.js', //打包之后生成的文件名，可以随意写。

    library: 'pl-layer', // 指定类库名,主要用于直接引用的方式(比如使用script 标签)

    libraryExport: 'default', // 对外暴露default属性，就可以直接调用default里的属性

    globalObject: 'this', // 定义全局变量,兼容node和浏览器运行，避免出现"window is not defined"的情况

    libraryTarget: 'umd' // 定义打包方式Universal Module Definition,同时支持在CommonJS、AMD和全局变量使用
  },

  mode: 'production',

  module: {
    rules: [
      {
        test: /\.js$/,

        include: [path.resolve(__dirname, 'src')],

        exclude: /(node_modules|bower_components)/,

        loader: 'babel-loader'
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpg|gif|jpeg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 12000,
              outputPath: 'images/'
            }
          }
        ]
      }
    ]
  },

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'pl-layer.min.css'
    })
  ]
}
