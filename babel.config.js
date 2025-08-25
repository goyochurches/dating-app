module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-transform-runtime', {
        regenerator: true,
      }],
      ['@babel/plugin-transform-modules-commonjs', {
        strictMode: false,
        allowTopLevelThis: true,
        loose: true,
      }],
      'react-native-reanimated/plugin'
    ]
  };
};
