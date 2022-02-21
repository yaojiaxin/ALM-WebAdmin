const path = require('path')
// const webpack = require('webpack')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

function resolve(dir) {
  return path.join(__dirname, dir)
}

const ASSET_PATH = '/qcbin/webadmin/'

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? ASSET_PATH : '',
  assetsDir: 'static',
  devServer: {
    port: 8800,
    open: false,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '/': {
        target: 'http://almtest.pacteraedge.com',
        timeout: 1920000
      }
    }
  },
  configureWebpack: {
    name: '',
    resolve: {
      alias: {
        '@': resolve('src'),
        config: resolve('config'),
        '@ant-design/icons/lib/dist$': path.resolve(__dirname, './src/icons/icons.js')
      }
    },
    plugins: [
      // new webpack.DefinePlugin({
      //   'process.env.staticPath': process.env.NODE_ENV === 'production' ? JSON.stringify(ASSET_PATH) : ''
      // })
      // process.env.use_analyzer ? new BundleAnalyzerPlugin() : null
    ]
  },
  chainWebpack(config) {
    if (process.env.use_analyzer) {
      config.plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    }
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    config.when(process.env.NODE_ENV !== 'development', config => {
      config.plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [{
          inline: /runtime\..*\.js$/
        }])
        .end()
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          antdv: {
            name: 'chunk-antdv',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?ant-design-vue(.*)/
          }
        }
      })
    })

    config.plugin('define')
      .tap(args => {
        args[0]['process.env.staticPath'] = JSON.stringify(ASSET_PATH)
        return args
      })
  },
  css: {
    loaderOptions: {
      less: {
        // lessOptions: {
        modifyVars: {
          'primary-color': '#0079ef',
          'border-radius-base': '1px'
        },
        javascriptEnabled: true
        // }
      }
    }
  }

}
