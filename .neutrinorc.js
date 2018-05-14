module.exports = {
  use: [
    // '@neutrinojs/airbnb-base',
    ['@neutrinojs/airbnb-base', {
      eslint: {
        rules: {
          'semi': 'off',
          'max-len': ["error", { "code": 240 }],
          'brace-style': 0,
          'no-return-assign': 0,
          'no-console': ['error', { 'allow': ['warn', 'error', 'log'] }],
        }
      }
    }],
    [
      '@neutrinojs/library',
      {
        name: 'prayer-timetable-lib'
      }
    ],
    '@neutrinojs/jest'
  ]
};
