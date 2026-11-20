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

import '@gitcoffee-os/design-ui';
import '@gitcoffee-os/theme-ui/ai.css';
import '@gitcoffee-os/chatbot-ui'; // 导入chatbot-ui以注册其国际化语言包
import '@gitcoffee-os/imsky-ui/styles'; // ImSky UI 统一样式
import App from './App.vue';
import router from './router';
import {
  APP_ID,
  BASE_URL,
  APP_URLS,
  APP_INFO,
  APP_SETTING,
  PASSPORT_CONFIG
} from './config/config';
import { initApp } from '@gitcoffee-os/app';
import {
  configureImsky,
  useSettingsStore,
  registerAntdvComponents
} from '@gitcoffee-os/imsky-ui';
import { setDataSource, type DataSource } from '@gitcoffee-os/im-ui';
import { restoreAuthHeaders } from '@gitcoffee-os/imsky-utils';
import { createDebugPlugin } from '@gitcoffee-os/debug-ui';

// 应用 env 唯一读取点 -> 注入 @gitcoffee-os/imsky-ui 运行时配置
configureImsky({
  appUrls: APP_URLS,
  appInfo: APP_INFO,
  appSetting: APP_SETTING,
  passportConfig: PASSPORT_CONFIG
});

// 启动时恢复 Authorization 请求头（存在 token 时）
restoreAuthHeaders();

// ==================== 数据源决策（会话/消息列表真实接口对接） ====================
// 优先级：VITE_DATA_SOURCE 显式配置 > 运行时存储覆盖 > API target 自动推断 > 默认（dev=local）。
// 代理生产环境（调试面板切到非 localhost 的 API target）时自动走 api 数据源，
// 会话/消息列表经 @gitcoffee-os/imsky-utils -> @gitcoffee-os/imsky-authority-api 拉取真实数据。
const API_TARGET_ENDPOINT = '/__imsky/api-target';
const isLoopbackTarget = (target: string): boolean =>
  /^(https?:)?\/\/(localhost|127\.0\.0\.1|\[::1\])([:/]|$)/i.test(target) ||
  /^(localhost|127\.0\.0\.1)([:/]|$)/i.test(target);

const applyDataSource = (source: DataSource): void => {
  setDataSource(source);
};

const envSource = import.meta.env.VITE_DATA_SOURCE as DataSource | undefined;
if (envSource === 'api' || envSource === 'mock' || envSource === 'local') {
  applyDataSource(envSource);
} else {
  // 无显式配置：探测调试面板当前 API target，指向真实后端时启用 api 数据源
  void fetch(API_TARGET_ENDPOINT)
    .then((res) => res.json())
    .then((data: { target?: string }) => {
      const target = data?.target ?? '';
      if (target && !isLoopbackTarget(target)) applyDataSource('api');
    })
    .catch(() => {
      // 探测失败保持默认数据源（dev=local，生产构建默认 api）
    });
}

initApp({
  App,
  router,
  registerComponents: (app) => {
    registerAntdvComponents(app);
    // 通用调试面板（仅 dev 环境渲染）：接口环境运行时切换，端点与 vite.config 的
    // createApiTargetSwitcher 保持一致
    app.use(
      createDebugPlugin({
        targetUrl: '/__imsky/api-target',
        targetPresets: [
          { label: '本地后端', value: 'http://localhost:8080' },
          {
            label: '生产接口',
            value: (import.meta.env.VITE_APP_API_TARGET as string) || 'https://imsky.exmay.com'
          },
        ],
      })
    );
  },
  BASE_URL,
  APP_ID,
  useSettingsStore
});
