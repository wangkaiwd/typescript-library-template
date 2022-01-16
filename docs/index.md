### TypeScript Library Template

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/wangkaiwd/typescript-library-template/Deploy%20to%20GitHub%20pages)

方便`TypeScript`库作者直接书写代码，不用分心于各种各样的配置和`linter`工具

#### 使用方式

```shell
git clone git@github.com:wangkaiwd/typescript-library-template.git
npm install
```

之后执行`npm run dev`即可进入开发模式，在`examples`目录下写测试代码

在发布之前要做如下修改：

1. `package.json`中`name`字段更改为你的包名
2. 在`.github/workflows/deploy-doc.yaml`中，将对应的`git`用户名邮箱改成要使用的信息

#### 特性

* 直接通过`npm install`安装依赖便可以直接进入开发
* 通过[`eslint`](https://github.com/eslint/eslint) 和[`prettier`](https://github.com/prettier/prettier) 格式化代码
* 使用[`rollup`](https://github.com/rollup/rollup) 进行打包
* 使用[`jest`](https://github.com/facebook/jest) 进行单元测试，保证代码质量
* 使用`commitizen`规范`commit`书写格式，并自动生成`changelog.md`和`GitHub Release`
* 使用`Husky`，`lint-staged`配合`git hook`拦截有问题的提交
* 提供自动发布脚本，执行`npm release`即可自动发布
* 使用`vitepress`进行文档编写
* 使用`GitHub Action`进行持续集成

#### Npm Scripts

> [`ni`](https://github.com/antfu/ni)会自动帮我们使用正确的包管理器，可以让我们不用再记忆不同包管理器的命令，推荐使用

> 有关打包和发布的具体细节，可以阅读[`rollup`打包`TypeScript`库文件并发布到`npm`](https://github.com/wangkaiwd/typescript-library-template/blob/main/docs/tutorial.md)

* npm run dev：使用`rollup`进行打包，会使用`watch`模式观察源代码改动并且会生成`sourcemap`方便调试
* npm run build：打包代码，会分别支持`commonjs`，`esModule`以及`script`引入
* npm run docs:dev: 启动本地服务器，使用`vitepress`进行文档开发
* npm run docs:build: 文档打包
* npm run test: 执行测试用例
* npm run release: 发布代码到`npm`并提交最新更改到`GitHub`
* npm run cm: 利用`cz`执行`git commit` 
