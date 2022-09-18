const project = require('../webpack.config.js');
const path = require('path');

module.exports = {
  "stories": [
    "../**/*.stories.mdx",
    "../components/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  "framework": "@storybook/web-components",
  "core": {
    "builder": "@storybook/builder-webpack5"
  },
  webpackFinal: async (config, { configType }) => {
    // Make whatever fine-grained changes you need
    // Return the altered config
    return ({
      ...config,
      module: { ...config.module, rules: project.module.rules }
    });
  },
}