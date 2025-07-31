module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    'semi': 'off',
    'no-trailing-spaces': 'off',
    'space-before-function-paren': 'off',
    'eol-last': 'off',
    'comma-dangle': 'off',
    'vue/no-unused-vars': 'off'
  }
}