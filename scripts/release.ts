import execa, { Options } from "execa";
import enquirer from "enquirer";
import minimist from "minimist";
import chalk from "chalk";
import semver, { ReleaseType } from "semver";
import path from "path";
import fs from "fs/promises";
import pkg from "../packages/my-lib/package.json";
import { fileURLToPath } from "url";

const pkgName = "my-lib";
const args = minimist(process.argv.slice(2));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cwd = path.resolve(__dirname, "../packages", pkgName);
const step = (msg: string) => console.log(chalk.cyan(msg));
const currentVersion = pkg.version;
const preId = semver.prerelease(currentVersion)?.[0];
const incrementVersions: string[] = [
  "patch",
  "minor",
  "major",
  // https://stackoverflow.com/questions/44908159/how-to-define-an-array-with-conditional-elements
  ...(preId ? ["prepatch", "preminor", "premajor", "prerelease"] : []),
];
const resolve = (...args: string[]) => path.resolve(__dirname, "../", ...args);
const dry = args.dry;
const npmRegistry = "https://registry.npmjs.org";
const run = (cmd: string, args: string[], options: Options) =>
  execa(cmd, args, { stdio: "inherit", ...options });

const ifDryRun = (cmd: string, args: any[], options: Options = {}) =>
  dry ? console.log(`${cmd} ${args.join(" ")}`) : run(cmd, args, options);
const inc = (i: ReleaseType) => semver.inc(currentVersion, i, preId as string);
const commitChanges = async (version: string) => {
  const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
  if (stdout) {
    step("\nCommit changes...");
    await ifDryRun("git", ["add", "."]);
    await ifDryRun(`git`, [
      "commit",
      "-m",
      `chore(release): release v${version}`,
    ]);
  }
};

const build = async () => {
  await fs.rm(resolve("build"), { force: true, recursive: true });
  await ifDryRun("npm", ["run", "build"]);
};
const doRelease = async (version: string) => {
  step("\nBuild package...");
  await build();
  step("\nBump version...");
  await ifDryRun(
    `npm`,
    [
      "version",
      version,
      "-m",
      `chore(version): bump version to v${version}`,
      "--no-git-tag-version",
    ],
    { cwd }
  );

  step("\nGenerate changelog...");
  await ifDryRun("npm", ["run", "genlog"]);
  await commitChanges(version);
  step("\nPublish package to npm...");
  await ifDryRun("npm", ["publish", "--reg", npmRegistry], { cwd });

  step("\nPush to github...");
  await ifDryRun("git", ["tag", `v${version}`]);
  await ifDryRun("git", ["push"]);
  await ifDryRun(`git`, ["push", "origin", `v${version}`]);
  console.log(chalk.green(` Release successfully ${pkg.name}@${version}`));
};
const main = async () => {
  const answer = await enquirer.prompt<{ version: string }>({
    type: "select",
    name: "version",
    message: "Select release type",
    choices: incrementVersions
      .map((type) => {
        const versionNumber = inc(type as ReleaseType)!;
        return { message: `${type} ${versionNumber}`, name: versionNumber };
      })
      .concat({ message: "custom", name: "custom" }),
  });
  let newVersion = answer.version;
  if (newVersion === "custom") {
    const { custom } = await enquirer.prompt<{ custom: string }>({
      type: "input",
      name: "custom",
      message: "Please input new version",
      initial: currentVersion,
      validate(value: string) {
        if (semver.valid(value)) {
          return true;
        }
        return "Please input a valid package version";
      },
    });
    newVersion = custom;
  }
  const { goOn } = await enquirer.prompt<{ goOn: boolean }>({
    type: "confirm",
    name: "goOn",
    message: `Release v${newVersion}. Confirm ?`,
  });
  if (goOn) {
    await doRelease(newVersion);
  }
};
main().catch((err) => {
  console.error(err);
});
