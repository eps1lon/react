#!/usr/bin/env node

'use strict';

const clear = require('clear');
const {readJson} = require('fs-extra');
const {join} = require('path');
const theme = require('../theme');

const run = async ({cwd, packages, tag}) => {
  clear();

  console.log(
    theme`{spinnerSuccess ✓} You are about the publish the following packages under the tag {tag ${tag}}:`
  );

  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i];
    const packageJSONPath = join(
      cwd,
      'build/node_modules',
      packageName,
      'package.json'
    );
    const packageJSON = await readJson(packageJSONPath);
    console.log(
      `::group::${theme`{package ${packageName}} {version ${packageJSON.version}}`}`
    );
    console.log(packageJSON);
    console.log('::endgroup::');
  }

  clear();
};

// Run this directly because it's fast,
// and logPromise would interfere with console prompting.
module.exports = run;
