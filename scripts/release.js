const enquirer = require('enquirer');
const args = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const semver = require('semver');

const step = (msg) => console.log(chalk.cyan(msg));
const execa = require('execa');
const {
  Extractor,
  ExtractorConfig
} = require('@microsoft/api-extractor');
const path = require('path');
const fs = require('fs/promises');
const pkg = require('../package.json');

const currentVersion = pkg.version;
const preId = semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0];
const incrementVersions = [
  'patch',
  'minor',
  'major',
  // https://stackoverflow.com/questions/44908159/how-to-define-an-array-with-conditional-elements
  ...preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : []
];
const resolve = (...args) => path.resolve(__dirname, '../', ...args);
const dryRun = args.dryRun;
const npmRegistry = 'https://registry.npmjs.org';
const run = (cmd, args, options) => execa(cmd, args, { stdio: 'inherit', ...options });

const ifDryRun = (cmd, args, options) => dryRun ? console.log(`${cmd} ${args.join(' ')}`) : run(cmd, args, options);
const inc = (i) => semver.inc(currentVersion, i, preId);
const commitChanges = async (version) => {
  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' });
  if (stdout) {
    step('\nCommit changes...');
    await ifDryRun('git', ['add', '.']);
    await ifDryRun(`git`, ['commit', '-m', `chore(release): release v${version}`]);
  }
};
const rollupTypes = async () => {
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(resolve('api-extractor.json'));
  // Invoke API Extractor
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true
  });
  if (extractorResult.succeeded) {
    console.log(`API Extractor completed successfully`);
    await fs.rm(resolve('build/types'), { force: true, recursive: true });
  } else {
    console.error(`API Extractor completed with ${extractorResult.errorCount} errors`
      + ` and ${extractorResult.warningCount} warnings`);
    process.exitCode = 1;
  }
};
const build = async () => {
  await fs.rm(resolve('build'), { force: true, recursive: true });
  await ifDryRun('npm', ['run', 'build']);
  if (!dryRun) {
    await rollupTypes();
  }
};
const doRelease = async (version) => {
  step('\nBuild package...');
  await build();
  step('\nBump version...');
  await ifDryRun(`npm`, ['version', version, '-m', `chore(version): bump version to v${version}`]);

  step('\nGenerate changelog...');
  await ifDryRun('npm', ['run', 'genlog']);
  await commitChanges(version);
  step('\nPublish package to npm...');
  await ifDryRun('npm', ['publish', '--reg', npmRegistry]);

  step('\nPush to github...');
  await ifDryRun('git', ['push']);
  await ifDryRun(`git`, ['push', 'origin', `v${version}`]);
  console.log(chalk.green(`
  Release successfully ${pkg.name}@${version}`));
};
const main = async () => {
  const answer = await enquirer.prompt(
    {
      type: 'select',
      name: 'version',
      message: 'Select release type',
      choices: incrementVersions.map(type => {
        const versionNumber = inc(type);
        return { message: `${type} ${versionNumber}`, name: inc(type) };
      }).concat('custom')
    });
  let newVersion = answer.version;
  if (newVersion === 'custom') {
    const { custom } = await enquirer.prompt({
      type: 'input',
      name: 'custom',
      message: 'Please input new version',
      initial: currentVersion,
      validate (value) {
        if (semver.valid(value)) {
          return true;
        }
        return 'Please input a valid package version';
      }
    });
    newVersion = custom;
  }
  const { goOn } = await enquirer.prompt({
    type: 'confirm',
    name: 'goOn',
    message: `Release v${newVersion}. Confirm ?`
  });
  if (goOn) {
    await doRelease(newVersion);
  }
};
main().catch((err) => {
  console.log('error', err);
});
