module.exports = {
  use: [
    // '@neutrinojs/airbnb-base',
    ['@neutrinojs/airbnb-base', {
      eslint: {
        rules: {
          'semi': 'off',
          'max-len': ["error", { "code": 180 }],
          'brace-style': 0,
          'no-return-assign': 0
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
