// rollup.config.unified.mjs - Unified build for all components
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';

export default [
  // Main Native Messaging Script (was previously built with Babel)
  {
    input: 'src/index.js',
    output: {
      file: 'example/nativeMessaging.js',
      format: 'iife',
      name: 'NativeMessaging',
      sourcemap: true
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            targets: {
              // ES5 for maximum TV compatibility
              browsers: ['ie >= 8', 'chrome >= 30', 'firefox >= 25']
            },
            modules: false, // Let Rollup handle modules
            loose: true,    // More ES5-like output
            spec: false,    // Faster, less spec-compliant
            useBuiltIns: false // No polyfills, we have our own
          }]
        ],
        exclude: 'node_modules/**'
      }),
      terser({
        compress: {
          drop_console: false, // Keep console logs for debugging
          drop_debugger: true,
          pure_funcs: ['console.debug'],
          passes: 2
        },
        mangle: {
          reserved: ['_sp_', '__tcfapi'] // Preserve important globals
        },
        format: {
          comments: false
        }
      })
    ]
  },

  // TCF API Bridge
  {
    input: 'tcfapi/src/tcfapi.js',
    output: {
      file: 'example/tcfBridge.js',
      format: 'iife',
      name: 'TCFBridge',
      sourcemap: true
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ['ie >= 8', 'chrome >= 30', 'firefox >= 25']
            },
            modules: false,
            loose: true,
            spec: false,
            useBuiltIns: false
          }]
        ],
        exclude: 'node_modules/**'
      }),
      terser({
        compress: {
          drop_console: false,
          drop_debugger: true,
          passes: 2
        },
        mangle: {
          reserved: ['__tcfapi', 'decodeTCString', '_sp_']
        },
        format: {
          comments: false
        }
      })
    ]
  },

  // TCF Stub (minimal processing needed)
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
        compress: {
          passes: 2
        },
        mangle: {
          reserved: ['__tcfapi']
        },
        format: {
          comments: false
        }
      })
    ]
  },

  // Development build (unminified for debugging)
  {
    input: 'src/index.js',
    output: {
      file: 'example/nativeMessaging.dev.js',
      format: 'iife',
      name: 'NativeMessaging',
      sourcemap: true
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: ['ie >= 8', 'chrome >= 30', 'firefox >= 25']
            },
            modules: false,
            loose: true,
            spec: false,
            useBuiltIns: false
          }]
        ],
        exclude: 'node_modules/**'
      })
      // No terser for dev build
    ]
  },


];