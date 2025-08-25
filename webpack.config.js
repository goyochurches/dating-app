const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add fallback for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
    process: require.resolve('process/browser'),
    util: require.resolve('util'),
    vm: require.resolve('vm-browserify'),
    path: require.resolve('path-browserify'),
    os: require.resolve('os-browserify/browser'),
    https: require.resolve('https-browserify'),
    http: require.resolve('stream-http'),
    url: require.resolve('url/')
  };
  
  // Add plugins
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.platform': JSON.stringify('browser'),
      'process.browser': true
    })
  ];
  
  // Add module rules
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false
    }
  });
 
  // Explicit aliases for process polyfill
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'process/browser': require.resolve('process/browser'),
    'process': require.resolve('process/browser')
  };
  
  // Exclude problematic modules from parsing
  config.module.noParse = /(node_modules\/|\/)(asn1\.js\/|vm\/|readable-stream\/)/;
  
  // Handle process polyfill
  config.entry = [
    'core-js/stable',
    'regenerator-runtime/runtime',
    ...(Array.isArray(config.entry) ? config.entry : [config.entry])
  ].filter(Boolean);
  
  // Add process polyfill and fallbacks
  config.resolve.fallback = {
    ...config.resolve.fallback,
    process: require.resolve('process/browser'),
    'process/browser': require.resolve('process/browser')
  };

  // Add process to global scope
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.NormalModuleReplacementPlugin(
      /node_modules\/webpack-dev-server\/client\/modules\/logger\/index\.js/,
      (resource) => {
        resource.request = resource.request.replace(
          'process.hrtime()',
          '() => [0, 0]'
        );
      }
    ),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.platform': JSON.stringify('browser'),
      'process.browser': true,
      'process.hrtime': '() => [0, 0]',
      'process.nextTick': 'setImmediate',
      'process.stdout': 'null',
      'process.stderr': 'null',
      'process.stdin': 'null'
    })
  ];
  
  return config;
};
