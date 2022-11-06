import path from "node:path";
import prompts, { Choice, PromptObject } from "prompts";
import { inc, ReleaseType } from "semver";
import chalk from "chalk";
import semver from "semver/preload";
import {
  __dirname,
  bumpPkgsVersion,
  getPkgsInfo,
  run,
  runIfNotDry,
  step,
  validVersion,
} from "./utils";

const { version: targetVersion } = getPkgsInfo();
const preid = semver.prerelease(targetVersion)?.[0] as string | undefined;

const createIncrements = () => {
  const increments: string[] = ["major", "minor", "patch"];
  if (preid) {
    increments.push("premajor", "preminor", "prepatch", "prerelease");
  }
  return increments;
};

const increments = createIncrements();

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
  await runIfNotDry("npx", changelogArgs, {
    cwd: path.resolve(__dirname, ".."),
  });
};

const isGitClean = async () => {
  const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
  if (stdout) {
    throw Error(chalk.yellow("You have changes which have not commit!"));
  }
};

const commitChanges = async (incVersion: string) => {
  await runIfNotDry("git", ["add", "."]);
  await runIfNotDry("git", [
    "commit",
    "-m",
    `chore(release): release v${incVersion}`,
  ]);
  await runIfNotDry("git", ["tag", `v${incVersion}`]);
};

const pushWithTag = async (incVersion: string) => {
  await runIfNotDry("git", ["push"]);
  await runIfNotDry("git", ["push", "origin", `v${incVersion}`]);
};

const main = async () => {
  step("\nDetect changes ..");
  await isGitClean();
  const choices: Choice[] = increments.map((item) => ({
    title: item,
    value: item,
    description: inc(targetVersion, item as ReleaseType, preid)!,
  }));
  choices.push({ title: "custom", value: "custom" });
  const question: PromptObject = {
    type: "select",
    name: "releaseType",
    message: "Select release type",
    choices,
  };
  const { releaseType } = await prompts(question);
  let inputVersion;
  if (releaseType === "custom") {
    const result = await prompts({
      type: "text",
      name: "inputVersion",
      message: "Please input custom version",
    });
    inputVersion = result.inputVersion;
    if (!validVersion(inputVersion, targetVersion)) {
      throw Error(`${inputVersion} is not a invalid semantic version`);
    }
  }
  const incVersion = inputVersion ?? inc(targetVersion, releaseType, preid)!;
  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message: `Releasing ${chalk.yellow(incVersion)} confirm ?`,
    initial: false,
  });
  if (!confirm) return;

  step("\nBumping packages version...");
  await bumpPkgsVersionWithInfo(incVersion);

  step("\nGenerating changelog...");
  await generateChangelog();

  step("\nCommitting changes...");
  await commitChanges(incVersion);

  step("\nPushing to remote...");
  await pushWithTag(incVersion);

  console.log(
    chalk.green(
      "Push successfully, publish will start shortly by ci. \nhttps://github.com/wangkaiwd/mini-vite/blob/main/.github/workflows/publish.yaml"
    )
  );
};

main().catch((err) => {
  console.error(err);
});
