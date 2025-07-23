// rollup.config.mjs
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

 

export default [
 
  {
    input: 'src/tcfapi.js',
    output: {
      file: '../example/tcfBridge.js',
      format: 'iife',
      name: 'SpecTC',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      terser()
    ]
  },

 
  {
    input: 'src/tcfstub.js',
    output: {
      file: '../example/tcfStub.js',
      format: 'iife',
      name: 'TCFStub',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      terser()  
    ]
  }
];
