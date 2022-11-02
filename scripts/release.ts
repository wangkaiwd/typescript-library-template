import path from "node:path";
import prompts, { PromptObject } from "prompts";
import { inc, ReleaseType } from "semver";
import chalk from "chalk";
import { __dirname, bumpPkgsVersion, getPkgsInfo, run, step } from "./utils";

const { version: targetVersion } = getPkgsInfo();

const increments: ReleaseType[] = ["major", "minor", "patch"];

const bumpPkgsVersionWithInfo = async (incVersion: string) => {
  await bumpPkgsVersion(incVersion);
};

const generateChangelog = async () => {
  const changelogArgs = [
    "conventional-changelog",
    "-p",
    "angular",
    "-i",
    "CHANGELOG.md",
    "-s",
  ];
  await run("npx", changelogArgs, { cwd: path.resolve(__dirname, "..") });
};

const isGitClean = async () => {
  const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
  if (stdout) {
    throw Error(chalk.yellow("You have changes which have not commit!"));
  }
};

const commitChanges = async (incVersion: string) => {
  await run("git", ["add", "."]);
  await run("git", ["commit", "-m", `chore(release): release v${incVersion}`]);
  await run("git", ["tag", `v${incVersion}`]);
};

const pushWithTag = async (incVersion: string) => {
  await run("git", ["push"]);
  await run("git", ["push", "origin", `v${incVersion}`]);
};

const main = async () => {
  step("\nDetect changes ..");
  await isGitClean();

  const question: PromptObject = {
    type: "select",
    name: "releaseType",
    message: "Pick a new version",
    choices: increments.map((item) => ({
      title: item,
      value: item,
      description: inc(targetVersion, item)!,
    })),
  };
  const { releaseType } = await prompts(question);
  const incVersion = inc(targetVersion, releaseType)!;
  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message: `New version is ${incVersion}, continue ?`,
    initial: false,
  });
  if (!confirm) return;

  step("\nBump packages version ...");
  await bumpPkgsVersionWithInfo(incVersion);

  step("\nGenerate changelog ..");
  await generateChangelog();

  step("\nCommit changes ...");
  await commitChanges(incVersion);

  step("\nPush to remote ...");
  await pushWithTag(incVersion);
};

main().catch((err) => {
  console.error(err);
});
