## 打包`TypeScript`库文件并发布到`npm`

最近笔者在学习如何打包自己的`TypeScript`代码并发布到`npm`可以让其它人使用。

本文会涉及到以下知识点

### 使用`rollup`打包`TypeScript`代码

首先我们需要先安装相关依赖

```shell
npm i typescript rollup rollup-plugin-typescript2 tslib -D
```

这里需要使用`rollup-plugin-typescript2`来让`rollup`能够打包`TypeScript`代码，`rollup`的具体配置如下：

```javascript
import typescript from 'rollup-plugin-typescript2';

const mode = process.env.MODE;
const isProd = mode === 'production';
export default {
  input: `lib/index.ts`,
  output: [
    {
      file: 'build/my-lib.cjs.js',
      exports: 'named',
      format: 'cjs',
      sourcemap: !isProd
    },
    {
      file: 'build/my-lib.cjs.js',
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
    tsconfigOverride: { compilerOptions: { sourceMap: !isProd, declaration: !isProd } }
  })],
};
```

在`rollup`的配置文件中，我们通过`output`
中的[`format`](https://rollupjs.org/guide/en/#outputformat) 来分别生成`commonjs`、`esModule`以及支持直接通过`script`的`src`属性在`html`
的`iife`(立即调用函数表达式)。即用户可以通过以下方式来使用我们的代码：

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

当我们通过`script`进行引入时，提供的全局变量是在`rollup`配置文件中`output`数组中`fomrat:iife`对应的`name`属性，之后用户便可以通过这个全局变量来实现相应的需求。

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
  "target": "ES5", // 打包生成ES5代码
  "declaration": true, // 生成类型声明文件
  "declarationDir": "build/types" // 类型声明文件目录  
}
```

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
  "dev": "rollup -w -c rollup.config.ts --entryFileNames MODE:dev",
  "build": "rollup -c rollup.config.ts --entryFileNames MODE:prod"
}
```
执行`npm run dev`便可以进入开发模式，书写代码并实时编译。

### 发布代码到`npm`

### npm相关配置

`name: my-lib`

`package.json`中的`name`用来表示我们包的名字，发布到`npm`之后，其它开发者便可以通过`npm install my-lib`来进行安装。

由于命名冲突问题，有很多包会放到一个组织下，此时`name`属性会以`@组织名`为前缀。一般公司内部也会有自己的组织，包文件都会放到该组织下。以`vue`为例，其中`reactivity`的`name`
字段为：`@vue/reactivity`。

`private:false`

想要将代码发布到`npm`，需要将该属性设置为`true`

### 通过`Node.js`来自动化发布
