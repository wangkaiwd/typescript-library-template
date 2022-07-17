## TS Lib Template

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/wangkaiwd/typescript-library-template/Deploy%20to%20GitHub%20pages)
![license](  https://img.shields.io/github/license/wangkaiwd/typescript-library-template)

A template project that make create a typescript library easily.

### Usage

```shell
git clone git@github.com:wangkaiwd/typescript-library-template.git
npm install
```

Then run `npm run dev` to develop.

If you want to test your code in browser environment, you can write test code in `example` directory and
set `script src` correctly

### Feature

* out of the box
* Automatic linting and formatting use [`eslint`](https://github.com/eslint/eslint)
  and [`prettier`](https://github.com/prettier/prettier)
* Build source code with [`rollup`](https://github.com/rollup/rollup)
* Tests use [`jest`](https://github.com/facebook/jest) to make sure code quality
* Automatic generate `changelog.md` and `GitHub Release`, using [`commitizen`](https://github.com/commitizen/cz-cli)
* Intercept commit that have problems, using [`Husky`](https://github.com/typicode/husky)
  ,[`lint-staged`](https://github.com/okonet/lint-staged) combine with `git hook`
* Support auto publish script, you can run `npm run release` when publish
* Using [`vitepress`](https://github.com/vuejs/vitepress) write document
* [`GitHub Action`](https://docs.github.com/en/actions) continuous integration

### Npm Scripts

> recommend use [`ni`](https://github.com/antfu/ni) to execute package manager command, it will auto select proper
> package manager, so that wo don't memory command which from different package manager.

> If you wanna known about more detail about build and publish, you can read
> in [here](https://zhuanlan.zhihu.com/p/458363563).

* npm run dev：build with `rollup` watch mode and generate `sourcemap` for debug
* npm run build：generate bundle which support `commonjs`,`esModule`,`iife`
* npm run docs:dev: enable local server to write document which powered by `vitepress`
* npm run docs:build: build your document
* npm run test: run test case
* npm run release: publish source code to `npm` and commit the latest changes to `GitHub`
* npm run cm: utilize `cz` to execute `git commit` 
