import { args, getPkgsInfo, NPM_REGISTRY, run, step } from "./utils";

const { pkgFilenames } = getPkgsInfo();

const publishPackage = async (incVersion: string, cwd: string) => {
  let publishTag;
  if (incVersion.includes("alpha")) {
    publishTag = "alpha";
  } else if (incVersion.includes("beta")) {
    publishTag = "beta";
  }
  const publishArgs = [
    "publish",
    "--registry",
    NPM_REGISTRY,
    "--access",
    "public",
  ];
  if (publishTag) {
    publishArgs.push("--tag", publishTag);
  }
  await run("npm", publishArgs, { cwd });
};

const main = async () => {
  const incVersion = args._[0];
  step("\nPublishing packages ...");
  pkgFilenames.forEach((filename) => {
    publishPackage(incVersion, filename);
  });
};

main().catch((err) => {
  console.error(err);
});
