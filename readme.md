## TS Lib Template

<p align="center">
  <img src="https://raw.githubusercontent.com/wangkaiwd/drawing-bed/master/81249231_padded_logo.png" height="200">
</p>

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/wangkaiwd/typescript-library-template/Deploy%20to%20GitHub%20pages)
![license](https://img.shields.io/github/license/wangkaiwd/typescript-library-template)

A template project that make create a typescript library easily.

> If you wanna known about more detail about build and publish, you can read
> in [here](https://zhuanlan.zhihu.com/p/458363563).

### Usage

```shell
git clone git@github.com:wangkaiwd/typescript-library-template.git
pnpm install
```

Then run `pnpm dev` to develop.

If you want to test your code in browser environment, you can write test code in `playground` directory

### Feature

- out of the box
- Automatic linting and formatting use [`eslint`](https://github.com/eslint/eslint)
  and [`prettier`](https://github.com/prettier/prettier)
- Build source code with [`rollup`](https://github.com/rollup/rollup)
- Tests use [`vitest`](https://github.com/vitest-dev/vitest) to make sure code quality
- Automatic generate `changelog.md` and `GitHub Release`,
  using [`conventional-changelog`](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli)
- Intercept commit that have problems, using [`simple-git-hooks`](https://github.com/toplenboren/simple-git-hooks)
  ,[`lint-staged`](https://github.com/okonet/lint-staged) combine with `git hook`
- Support auto publish script, you can run `npm run release` when publish
- Using [`vitepress`](https://github.com/vuejs/vitepress) write document
- [`GitHub Action`](https://docs.github.com/en/actions) continuous integration
