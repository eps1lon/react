#!/usr/bin/env node

'use strict';

const {spawnSync} = require('child_process');
const {exec} = require('child-process-promise');
const {readJsonSync} = require('fs-extra');
const {join} = require('path');
const theme = require('../theme');

const run = async ({cwd, dry, tag}, packageName) => {
  const packagePath = join(cwd, 'build/node_modules', packageName);
  const {version} = readJsonSync(join(packagePath, 'package.json'));

  // Check if this package version has already been published.
  // If so we might be resuming from a previous run.
  const {status} = spawnSync('npm', ['view', `${packageName}@${version}`]);
  const packageExists = status === 0;
  if (packageExists) {
    console.log(
      theme`{package ${packageName}} {version ${version}} has already been published.`
    );
    return;
  }

  console.log(
    `::group::${theme`{spinnerSuccess ✓} Publishing {package ${packageName}}${dry ? ' (--dry-run)' : ''}`}`
  );
  // OIDC trusted publishing authorizes exactly one publish per call, and
  // can't add/remove dist-tags after the fact — so we only ever publish under
  // a single tag, and that tag is the one chosen at workflow dispatch time.
  const args = ['publish', `--tag`, tag];
  if (dry) {
    args.push('--dry-run');
  }
  console.log(theme.command(`  cd ${packagePath}`));
  console.log(theme.command(`  npm ${args.join(' ')}`));

  spawnSync('npm', args, {
    cwd: packagePath,
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  console.log('::endgroup::');
};

module.exports = run;
