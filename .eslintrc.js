module.exports = {
  root: true,
  extends: ['expo'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: ['node_modules/', 'dist/', '.expo/'],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};