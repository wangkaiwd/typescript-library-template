import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

const mode = process.env.MODE;
const isProd = mode === 'prod';
const pkg = require('./package.json');

export default [
  {
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
  },
  {
    input: "build/types/index.d.ts",
    output: [{ file: "build/my-lib.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
