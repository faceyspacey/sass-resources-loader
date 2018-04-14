/* eslint func-names: 0 */

import fs from 'fs';
import path from 'path';
import async from 'async';
import loaderUtils from 'loader-utils';

import processResources from './utils/processResources';
import parseResources from './utils/parseResources';
import rewriteImports from './utils/rewriteImports';
import logger from './utils/logger';

module.exports = function(source) {
  const webpack = this;

  if (webpack.cacheable) webpack.cacheable();

  const callback = webpack.async();
  const resourcesFromConfig =(loaderUtils.getOptions(this) || {}).resources
  const resourcesLocations = parseResources(resourcesFromConfig);
  const webpackConfigContext = webpack.options && webpack.options.context

  const files = resourcesLocations.map(resource => {
    const file = path.resolve(webpackConfigContext, resource);
    webpack.addDependency(file);
    return file;
  });

  async.map(
    files,
    (file, cb) => {
      fs.readFile(file, 'utf8', (error, contents) => {
        rewriteImports(error, file, contents, webpack.context, cb);
      });
    },
    (error, resources) => {
      processResources(error, resources, source, webpack.context, callback);
    }
  );
};
