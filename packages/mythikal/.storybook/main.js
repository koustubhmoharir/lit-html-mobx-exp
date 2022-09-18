const project = require('../webpack.config.js');
const path = require('path');

const sb = path.normalize("/@storybook/");
class ReplaceLitHtmlPlugin {
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap("ReplaceLitHtmlPlugin", nmf => {
        nmf.hooks.beforeResolve.tap("ReplaceLitHtmlPlugin", result => {
          if (result.context.includes(sb) && result.request === "lit-html") {
            // console.log("ReplaceLitHtmlPlugin plugin:", result);
            result.request = "realithy"
          }
        });
      }
    );
  }
}

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
    // Not sure how to combine rules
    // console.log(config.module.rules);
    return ({
      ...config,
      module: { ...config.module, rules: project.module.rules },
      plugins: [...config.plugins, new ReplaceLitHtmlPlugin()]
    });
  },
}