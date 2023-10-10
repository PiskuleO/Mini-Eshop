module.exports = {
  babel: {
    loaderOptions: (babelLoaderOptions) => {
      // Look up if we find the proper settings
      const origBabelPresetReactAppIndex = babelLoaderOptions.presets.findIndex(
        (preset) => {
          return preset[0].includes("babel-preset-react-app\\index.js");
        }
      );

      if (origBabelPresetReactAppIndex === -1) {
        return babelLoaderOptions;
      }

      let origBabelPresetReactApp =
        babelLoaderOptions.presets[origBabelPresetReactAppIndex][1];

      // if this is not set to automatic, no change
      if (origBabelPresetReactApp.runtime !== "automatic")
        return babelLoaderOptions;

      // Add the required options
      origBabelPresetReactApp = {
        ...origBabelPresetReactApp,
        development: process.env.NODE_ENV === "development",
        importSource: "@welldone-software/why-did-you-render",
      };

      babelLoaderOptions.presets[origBabelPresetReactAppIndex][1] =
        origBabelPresetReactApp;

      return babelLoaderOptions;
    },
  },
};
