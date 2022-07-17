## 打包`TypeScript`库文件并发布到`npm`

![](https://raw.githubusercontent.com/wangkaiwd/drawing-bed/master/Colorful%20Brushstrokes%20Artists%20and%20Illustrators%20Collection%20YouTube%20Intro.png)

本文讲解了如何使用`rollup`打包`TypeScript`代码以及发布打包文件到`npm`，并最终自动化发布过程。涉及到的技术栈如下：

* `rollup`
* `TypeScript`
* `npm`
* `Node.js`

由于整个项目搭建过程过于繁琐，笔者创建了一个[模板项目](https://github.com/wangkaiwd/typescript-library-template)
，来帮助开发者快速创建项目，本文记录了实现的具体过程。如果你也有类似需求的话，可以参考文章内容了解具体步骤，也可以直接使用模板项目，跳过繁琐的配置环节。

### 使用`rollup`打包`TypeScript`代码

首先我们需要先安装相关依赖

```shell
npm i typescript rollup rollup-plugin-typescript2 tslib -D
```

这里需要使用`rollup-plugin-typescript2`来让`rollup`能够打包`TypeScript`代码，`rollup`的具体配置如下：

```javascript
import typescript from 'rollup-plugin-typescript2';

const mode = process.env.MODE;
const isProd = mode === 'prod';
const pkg = require('./package.json');

export default {
  input: `lib/index.ts`,
  output: [
    {
      file: pkg.main,
      exports: 'named',
      format: 'cjs',
      sourcemap: !isProd
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: !isProd
    },
    {
      file: 'build/my-lib.global.js',
      name: 'MyLib',
      format: 'iife',
      sourcemap: !isProd
    },
  ],
  plugins: [typescript({
    useTsconfigDeclarationDir: true,
    tsconfigOverride: { compilerOptions: { sourceMap: !isProd } }
  })],
};
```

在`rollup`的配置文件中，我们通过`output`
中的[`format`](https://rollupjs.org/guide/en/#outputformat) 来分别生成`commonjs`、`esModule`以及支持直接通过`script`在`html`中引入 的`iife`(
立即调用函数表达式)。即用户可以通过以下方式来使用打包后的代码：

```javascript
// esModule
import MyLib from 'my-lib'
// commonjs
const MyLib = require('my-lib')
```

```html
<!-- iife -->
<script src="node_modules/my-lib/build/my-lib.global.js"></script>
<script>
  console.log('MyLib', MyLib)
</script>
```

当我们通过`script`进行引入时，提供的全局变量是在`output`数组中`format:iife`对应的`name`属性，之后用户便可以通过这个全局变量来实现相应的需求。

除了提供相应的功能，由于我们使用了`TypeScript`，也应该让同样使用`TypeScript`的用户能够进行类型提示，相应配置如下：

```javascript
export default {
  plugins: [typescript({
    useTsconfigDeclarationDir: true,
    tsconfigOverride: { compilerOptions: { sourceMap: !isProd } }
  })]
}
```

这里会使用`tsconfig.json`中的配置来打包代码，并且会覆盖掉`tsconfig.json`中的`sourceMap`，保证只在开发环境生成`sourceMap`文件，方便代码调试。

相应的`tsconfig.json`中也需要提供如下配置：

```json
{
  // ... some other config
  // 打包生成ES5代码
  "target": "ES5",
  // 生成类型声明文件
  "declaration": true,
  // 类型声明文件目录  
  "declarationDir": "build/types"
}
```

这里`target: "ES5"`可以帮我们将代码打包为`ES5`的语法，所以这里不用再使用`babel`来进行语法转换了。

最后要在`package.json`中指定`js`入口文件以及类型入口文件：

```json
{
  "main": "build/my-lib.cjs.js",
  "module": "build/my-lib.es.js",
  "types": "build/my-lib/types/index.d.ts"
}
```

> * `module`字段并不是`package.json`中预先指定的字段，而是自定义字段。不过`webpack`,`rollup`等打包器都可以识别该字段，从而优先使用`esModule`格式。
> * 有些开源库也将`types`字段定义为`typings`，俩者含义完全相同

接下来在`npm`中添加如下`scripts`:

```json
{
  "dev": "rollup -w -c rollup.config.ts --environment MODE:dev",
  "build": "rollup -c rollup.config.ts --environment MODE:prod"
}
```

执行`npm run dev`便可以进入开发模式，书写代码并实时编译。

### 修改npm相关配置

在发布之前，要修改一些`package.json`中的相关配置配置。

* `name: my-lib`

`package.json`中的`name`用来表示我们包的名字，发布到`npm`之后，其它开发者便可以通过`npm install my-lib`来进行安装。

由于命名冲突问题，有很多包会放到一个组织下，此时`name`属性会以`@组织名`为前缀。一般公司内部也会有自己的组织，包文件都会放到该组织下。以`vue`为例，其中`reactivity`的`name`
字段为：`@vue/reactivity`。

* `private:false`： 要将`private`设置为`false`，否则发布会出错

发布到`npm`中的代码便是用户真正使用的代码，而有很多文件只是在开发时使用。为了排除生产环境中不会用到的代码文件，`npm`为我们提供了以下俩种方法：

* `.npmignore`文件
* `package.json`中的`files`字段

`.npmignore`文件可以忽略发布到`npm`中不需要的文件，而`files`恰好相反，可以通过这个字段来指定发布到`npm`时要包含哪些文件。

通常我们只需要配置`files`字段，把打包后的文件用来发布即可：

```json
{
  "files": [
    "build"
  ]
}
```

### 发布代码到`npm`

为了能让更多的人使用我们写好的代码，我们可以将代码发布到`npm`，这样所有的开发者都可以通过`npm install`来进行安装。

要发布代码，首先需要将最先的代码进行打包。由于打包后生成的类型文件比较分散，这里我们使用[`@microsoft/api-extractor`](https://github.com/microsoft/rushstack/tree/master/apps/api-extractor)
将打包后生成的类型声明文件整合为一个单独的文件，之后将原有类型声明文件删除。

发布之前，首先需要通过执行`npm version <newversion>`来增加`package.json`以及`package-lock.json`中的版本号。需要注意的是，**该命令会帮我们创建一个`git commit`,
并且使用新的版本号创建`git tag`**

在`version`升级后，可以通过[`Conventional Changelog`](https://github.com/conventional-changelog/conventional-changelog) 生成更改日志

版本提升以后，便可以执行`npm publish`来进行发布。如果提示未登录，需要执行`npm login`登录后再执行`npm publish`。由于日常开发时，大多数人都会使用淘宝源来安装依赖，在发布时要记得将**淘宝源切换为`npm`
官方源**。

发布`npm`完成之后，将`changelog.md`的最新改动提交到`git`，然后将所有更改以及创建的版本号`tag`提交到`GitHub`远程仓库。

发布完成后，我们可能想看一下到底上传了哪些代码到`npm`，这里推荐以下俩种方式：

* 在项目根目录执行`npm pack`，会生成最终用户安装到`node_modules`下的代码
* 通过[`npmview`](https://github.com/pd4d10/npmview) 来在线搜索查看自己发布到`npm`的包文件

### 通过`Node.js`来自动化发布

在日常的开发中，发布功能会被不停的使用，那么我们就得每次重复上述的工作。在重复的过程中，很有可能因为某次的不小心，而导致某个步骤出错或者漏掉。如忘记在发布之前将`npm`源设置为官方源、发布之前忘记打包等等问题。

借助`Node.js`，我们可以将发布流程进行自动化，只需在命令行执行`npm run release`便可以让程序自动处理发布时要做的一些工作。

在自动化之前，将整个发布流程梳理一下：

1. `npm run build`
   生成打包文件，并利用[`@microsoft/api-extractor`](https://github.com/microsoft/rushstack/tree/master/apps/api-extractor)
   将类型声明文件合并到一个文件
2. `npm version newversion`提升版本号(同时也会创建一个`commit`以及`tag`)
3. `npm run genlog`生成`changlog.md`文件来记录更改
4. 提交`changelog.md`的最新改动到`git`
5. `npm publish --reg=https://registry.npmjs.org`使用`npm`官方源来发布代码
6. 将最新的改动以及新创建的`tag`提交到`github`
   * `git push`: 推送代码到远程仓库
   * `git push origin tagName`: `tag`需要单独提交

整个过程中我们会用到以下工具库：

* [`execa`](https://github.com/sindresorhus/execa): 通过`Node.js`子进程来执行命令行代码
* [`enquirer`](https://github.com/enquirer/enquirer): 可以让`Node.js`与命令行进行交互，如输入或者选择内容
* [`chalk`](https://github.com/chalk/chalk):  设置终端字符串样式
* [`minimist`](https://github.com/substack/minimist): 解析命令行参数
* [`semver`](https://github.com/npm/node-semver): 处理语义化版本相关逻辑

核心逻辑便是通过[`execa`](https://github.com/sindresorhus/execa)
执行命令行代码，一步步完成我们的发布过程，期间会通过[`enquirer`](https://github.com/enquirer/enquirer) 来让用户选择或输入新的版本号。整个过程提供了`dry`
模式，在命令行中执行`npm run release -- --dryRun`
便可以通过日志来查看发布的整个流程，而不会触发真正对应的操作，方便调试

![](https://raw.githubusercontent.com/wangkaiwd/drawing-bed/master/20220116191521.png)

想要查看源代码的小伙伴可以[点击这里](https://github.com/wangkaiwd/typescript-library-template/blob/main/scripts/release.js) 。

最终我们在命令行执行`npm run release`，根据提示输入或选择新的版本号，等到命令行提示发布成功，便可以在`npm`中看到我们发布的包了。

### 结语

之前笔者在开发公用的代码库时，对整个打包和发布过程一知半解，最终决定学习其中涉及到的相关知识点， 并参考`Vue3`
的[源码](https://github.com/vuejs/vue-next/blob/f4f0966b33863ac0fca6a20cf9e8ddfbb311ae87/scripts/release.js?_pjax=%23js-repo-pjax-container%2C%20div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20main%2C%20%5Bdata-pjax-container%5D)
实现了满足需求的发布脚本。如果你也想了解发布过程中的一些知识，希望本文可以帮到你。
