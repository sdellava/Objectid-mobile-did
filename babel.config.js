module.exports = {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          helpers: true,
          regenerator: true,
        },
      ],
    ],
  };
  