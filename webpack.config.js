const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const settings = {
  devName: 'devConfig',
  buildName: 'buildConfig',
  entry: 'src/index.tsx',
  dist: 'dist',
  htmlTemplate: 'templates/index.html',
  devPort: 8080
};

const commonConfig = (settings) => ({
  optimization: {
    chunkIds: 'named',
    moduleIds: 'named'
  },
  entry: `./${settings.entry}`,
  output: {
    path: `${__dirname}/${settings.dist}`,
    filename: './[name].bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css', '.scss'],
    // alias: {
    //   process: 'process/browser',
    //   stream: 'stream-browserify',
    //   zlib: 'browserify-zlib',
    // },
    // fallback: { crypto: false },
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.(s[ac]ss|css)$/,
        use: ['style-loader', { loader: 'css-loader', options: { url: false } }, 'sass-loader'],
        exclude: [/\.module\.(s[ac]ss|css)$/],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [{ loader: 'url-loader' }],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: settings.htmlTemplate,
      minify: {
        removeComments: false,
      },
    }),
    new webpack.ProvidePlugin({
      // process: 'process/browser',
      // Buffer: ['buffer', 'Buffer'],
      //  THREE: 'three'
    }),
  ],
  devtool: 'source-map',
  devServer: {
    static: `./${settings.dist}`,
    historyApiFallback: true,
    server: {
      type: 'https'
    },
    host: require('os').hostname().toLowerCase(),
    port: settings.devPort,
    open: false,
  },
});

const devConfig = (settings) => ({
  ...commonConfig(settings),
  name: settings.devName,
  mode: 'development',
  module: {
    ...commonConfig(settings).module,
    rules: [
      ...commonConfig(settings).module.rules,
      {
        test: /\.(s[ac]ss|css)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
              },
            },
          },
          'sass-loader',
        ],
        include: /\.module\.(s[ac]ss|css)$/,
      },
    ],
  },
  plugins: [
    ...commonConfig(settings).plugins,
    new webpack.EnvironmentPlugin({
      MODE: 'development'
    }),
  ],
});

const buildConfig = (settings) => ({
  ...commonConfig(settings),
  name: settings.buildName,
  mode: 'production',
  module: {
    ...commonConfig(settings).module,
    rules: [
      ...commonConfig(settings).module.rules,
      {
        test: /\.(s[ac]ss|css)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
          'sass-loader',
        ],
        include: /\.module\.(s[ac]ss|css)$/,
      },
    ],
  },
  plugins: [
    ...commonConfig(settings).plugins,
    new webpack.EnvironmentPlugin({
      MODE: 'production'
    }),
  ],
});

module.exports = [devConfig(settings), buildConfig(settings)]