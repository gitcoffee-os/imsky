/**
 * Copyright (c) 2025-2099 GitCoffee All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createApiTargetSwitcher } from '../../packages/ui/debug-ui/src/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isFastBuild = mode === 'fast'
  const isDev = mode === 'development'
  // 调试面板持久化值（.imsky-api-target）> 环境变量 > https://imsky.exmay.com
  // 仅 dev 模式下使用运行时可切换的 switcher；生产环境直接使用环境变量
  let apiProxyTarget = process.env.VITE_APP_API_TARGET || 'https://imsky.exmay.com'
  let apiTargetSwitcher: any = null
  if (isDev) {
    apiTargetSwitcher = createApiTargetSwitcher({
      endpoint: '/__imsky/api-target',
      targetFile: resolve(__dirname, '.imsky-api-target'),
      defaultTarget: process.env.VITE_APP_API_TARGET || 'https://imsky.exmay.com',
    })
    apiProxyTarget = apiTargetSwitcher.getTarget()
  }

  return {
    base: '/im/',
    plugins: [vue(), ...(apiTargetSwitcher ? [apiTargetSwitcher.plugin] : [])],
    resolve: {
      alias: {
        '~': resolve(__dirname, 'src'),
        '~/*': resolve(__dirname, 'src/*'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
        // crudbot（chatbot-ui 依赖）的 dist 静态 import 其 optional peer（naive-ui /
        // element-plus），但 pnpm 下从 crudbot 路径无法解析到应用安装的副本，需固定到本应用安装的版本
        'naive-ui': resolve(__dirname, 'node_modules/naive-ui'),
        'element-plus': resolve(__dirname, 'node_modules/element-plus'),
        'ant-design-vue': resolve(__dirname, 'node_modules/ant-design-vue'),
        '@gitcoffee-os/debug-ui': resolve(
          __dirname,
          '../../packages/ui/debug-ui/src/index.ts'
        ),
        // 下沉 UI 包：开发期直连源码，生产构建走 dist
        ...(isFastBuild
          ? {}
          : {
              '@gitcoffee-os/imsky-ui/styles': resolve(
                __dirname,
                '../../packages/aircenter-engine/air-design/imsky-ui/src/styles/index.css'
              ),
              '@gitcoffee-os/imsky-ui': resolve(
                __dirname,
                '../../packages/aircenter-engine/air-design/imsky-ui/src/index.ts'
              )
            })
      }
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // 启用多线程构建
      minify: isFastBuild ? false : 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      // 启用 gzip 压缩
      reportCompressedSize: true,
      // 配置缓存
      cacheDir: './node_modules/.vite-cache',
      // 快速构建模式下禁用源映射
      sourcemap: !isFastBuild,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        external: ['@ant-design/icons-vue'],
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          format: 'es', // 使用ES模块格式
          inlineDynamicImports: false,
          // 配置代码分割
          // 配置代码分割（vite 8/rolldown 仅支持函数形式 manualChunks）
          manualChunks: isFastBuild
            ? undefined
            : (id: string) => {
                if (id.includes('node_modules/vue-i18n')) return 'i18n';
                if (
                  id.includes('@gitcoffee-os/im-ui') ||
                  id.includes('@gitcoffee-os/design-ui') ||
                  id.includes('@gitcoffee-os/imsky-ui')
                ) {
                  return 'ui';
                }
                if (
                  ['vue', 'vue-router', 'pinia', 'ant-design-vue'].some((pkg) =>
                    id.includes(`node_modules/${pkg}/`)
                  )
                ) {
                  return 'vendor';
                }
                return undefined;
              },
          globals: {
            '@ant-design/icons-vue': 'IconsVue'
          }
        }
      },
      assetsDir: 'assets'
    },
    server: {
      port: 5174,
      open: false,
      // 开发服务器优化
      fs: {
        strict: false
      },
      watch: {
        ignored: ['**/node_modules/**', '**/dist/**']
      },
      proxy: {
        '/exmay': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          ...(apiTargetSwitcher ? { configure: apiTargetSwitcher.onProxyCreated } : {}),
        }
      }
    }
  }
})
