import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import glslify from 'rollup-plugin-glslify';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        name: 'editor',
        file: 'index.js',
        format: 'umd',
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve({ preferBuiltins: false }),
      commonjs(),
      glslify(),
      typescript(),
      json(),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      name: 'editor',
      file: 'index.min.js',
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      nodeResolve({ preferBuiltins: false }),
      commonjs(),
      glslify(),
      typescript(),
      terser({
      }),
      json(),
    ],
  },
];
