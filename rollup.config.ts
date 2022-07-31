import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';

const mode = process.env.MODE;
const isProd = mode === 'prod';

const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.devDependencies),
  ...Object.keys(pkg.peerDependencies),
];

export default [
  {
    input: `lib/index.ts`,
    external,
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
    plugins: [
      resolve(),
      commonjs(),
      json({ preferConst: true }),
      esbuild()
    ],
  },
  {
    input: 'build/types/index.d.ts',
    output: [
      {
        file: 'build/my-lib.d.ts',
        format: 'es'
      }
    ],
    plugins: [dts()],
  },
];
