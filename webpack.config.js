const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // If you want to add a new alias to the config.
  // config.resolve.alias['react-native'] = 'react-native-web';

  // Maybe you want to turn off compression in dev mode.
  // config.mode = 'development';
  // config.devServer.compress = false;

  // Or prevent minimizing the bundle when you build.
  // if (config.mode === 'production') {
  //   config.optimization.minimize = false;
  // }

  // Finally return the new config for the CLI to use.
  return config;
};
