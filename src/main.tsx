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
import App from './App.vue';
import './locales';
import '@gitcoffee-os/chatbot-ui'; // 导入chatbot-ui以注册其国际化语言包
import router from './router';
import { APP_ID, BASE_URL } from './config/config';
import { initApp } from '@gitcoffee-os/app';
import { useSettingsStore } from './stores';
import { registerAntdvComponents } from './components/antdv.register';

initApp({
  App,
  router,
  registerComponents: (app) => {
    registerAntdvComponents(app);
  },
  BASE_URL,
  APP_ID,
  useSettingsStore
});
