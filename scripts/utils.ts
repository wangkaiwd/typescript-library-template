import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { execa, Options } from "execa";
import fse from "fs-extra";
import chalk from "chalk";
import minimist from "minimist";

export const PKG_JSON = "package.json";
export const NPM_REGISTRY = "https://registry.npmjs.org/";
export const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const args = minimist(process.argv.slice(2));
export const getPkgsInfo = () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const pkgDir = path.resolve(__dirname, "../packages");
  const pkgFilenames = fs
    .readdirSync(pkgDir)
    .map((filename) => path.resolve(pkgDir, filename));
  const firstPkg = pkgFilenames[0];
  const pkgJson = fs.readFileSync(path.resolve(firstPkg, PKG_JSON), {
    encoding: "utf-8",
  });
  const { version } = JSON.parse(pkgJson);
  return {
    version,
    pkgDir,
    pkgFilenames,
  };
};

export const run = (cmd: string, args: string[], options: Options = {}) =>
  execa(cmd, args, { stdio: "inherit", ...options });

export const bumpPkgsVersion = async (incVersion: string) => {
  const { pkgFilenames } = getPkgsInfo();
  const rootPkgFilename = path.resolve(__dirname, "../");
  const allPkgFilenames = [rootPkgFilename, ...pkgFilenames];
  const promises = allPkgFilenames.map(async (filename) => {
    const pkgJsonFilename = path.resolve(filename, PKG_JSON);
    const pkgJson = await fse.readJson(pkgJsonFilename);
    pkgJson.version = incVersion;
    await fse.writeJSON(pkgJsonFilename, pkgJson, {
      replacer: null,
      spaces: 2,
    });
  });
  return Promise.all(promises);
};

export const step = (message: string) => console.log(chalk.cyan(message));
