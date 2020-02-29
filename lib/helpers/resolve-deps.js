'use strict';

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const support = require('../support');

function copy(src, dest) {
  if (!fs.existsSync(dest)) fs.copySync(src, dest);
}

module.exports = (importee, params) => {
  if (!(params.data.$modules || params.options.modules)) return;

  if (params.data.$unpkg || params.options.unpkg) {
    return `https://unpkg.com/${importee}?module`;
  }

  const [base, sub] = importee.split('/').slice(0, 2);

  let pkgName = base;

  if (base.charAt() === '@' && sub) pkgName += `/${sub}`

  const chunks = require.resolve(pkgName).split('/');
  const offset = chunks.indexOf('node_modules');

  const pkgDir = chunks.slice(0, offset + 2).join('/');
  const pkgFile = path.join(pkgDir, 'package.json');
  const moduleDir = params.data.$modules || params.options.modules;
  const fixedModuleDir = typeof moduleDir === 'string' ? moduleDir : 'web_modules';
  const destDir = path.join(params.options.public, fixedModuleDir);

  try {
    const pkgInfo = require(pkgFile);
    const mainFile = pkgInfo.module || pkgInfo.browser || pkgInfo.unpkg;

    if (mainFile) {
      const moduleDir = path.join(destDir, pkgName);
      const moduleFile = path.join(moduleDir, mainFile);

      let found;

      fs.ensureDirSync(moduleDir);

      copy(path.join(pkgDir, mainFile), moduleFile);
      copy(pkgFile, path.join(moduleDir, 'package.json'));

      if (!(params.data.$nofiles || params.options.nofiles)) {
        (pkgInfo.files || []).forEach(src => {
          glob.sync(path.join(pkgDir, src)).forEach(file => {
            if (fs.existsSync(file) && fs.statSync(file).isFile()) {
              copy(file, path.join(moduleDir, path.relative(pkgDir, file)));
              found = true;
            }
          });
        });
      }

      if (found) {
        return `${support.FAKE_ROOT}${path.relative(params.options.public, moduleFile)}`;
      }
    }
  } catch (e) {
    // do nothing
  }
};
