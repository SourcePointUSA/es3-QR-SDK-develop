// rollup.config.unified.mjs - Unified build for all components (TV-safe)
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';

export default [
  // =============================================================================
  // (A) Main Native Messaging Script
  // =============================================================================
  {
    input: 'src/index.js',
    output: {
      file: 'example/nativeMessaging.js',
      format: 'iife',
      name: 'NativeMessaging',
      sourcemap: true
    },
    plugins: [
      resolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: ['ie >= 8', 'chrome >= 30', 'firefox >= 25', 'opera >= 20']
              },
              modules: false,
              loose: true,
              spec: false,
              useBuiltIns: false
            }
          ]
        ],
        exclude: 'node_modules/**'
      }),
      terser({
        compress: {
          drop_console: false,
          drop_debugger: true,
          pure_funcs: ['console.debug'],
          passes: 2
        },
        mangle: { reserved: ['_sp_', '__tcfapi'] },
        format: { comments: false }
      })
    ]
  },

  // =============================================================================
  // (B) TCF API Bridge (ES3-safe for TV)
  // =============================================================================
  {
    input: 'tcfapi/src/tcfapi.js',
    output: {
      file: 'example/tcfBridge.js',
      format: 'iife',
      name: 'TCFBridge',
      sourcemap: true
    },
    plugins: [
      resolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: ['ie >= 8', 'chrome >= 30', 'firefox >= 25', 'opera >= 20']
              },
              modules: false,
              loose: true,   // wichtig für ES3: vermeidet getter/setter
              spec: false,
              useBuiltIns: false
            }
          ]
        ],
        exclude: 'node_modules/**'
      }),
      terser({
        compress: {
          drop_console: false,
          drop_debugger: true,
          passes: 2,
          // keine ES6-Features inlining!
          unsafe_arrows: false,
          unsafe_methods: false
        },
        mangle: {
          reserved: [
            '__tcfapi',
            'decodeTCString',
            'TCString',
            '_sp_',
            'readStoredTCString',
            'buildTCData'
          ]
        },
        format: { comments: false }
      })
    ]
  },

  // =============================================================================
  // (C) TCF Stub
  // =============================================================================
  {
    input: 'tcfapi/src/tcfstub.js',
    output: {
      file: 'example/tcfStub.js',
      format: 'iife',
      name: 'TCFStub',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      terser({
        compress: { passes: 2 },
        mangle: { reserved: ['__tcfapi'] },
        format: { comments: false }
      })
    ]
  },

  // =============================================================================
  // (D) Development Build (unminified for debugging)
  // =============================================================================
  {
    input: 'src/index.js',
    output: {
      file: 'example/nativeMessaging.dev.js',
      format: 'iife',
      name: 'NativeMessaging',
      sourcemap: true
    },
    plugins: [
      resolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: ['ie >= 8', 'chrome >= 30', 'firefox >= 25']
              },
              modules: false,
              loose: true,
              spec: false,
              useBuiltIns: false
            }
          ]
        ],
        exclude: 'node_modules/**'
      })
    ]
  }
];
