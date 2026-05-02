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

export const APP_ID = 'imsky';

export const BASE_URL = '/im/';

export const APP_INFO = {
  name: 'ImSky 天信IM',
  version: '1.0.0',
  description: '跨平台即时通讯解决方案',
  logo: '/assets/logo.svg'
};

export const APP_SETTING = {
  smartSearch: true,
  defaultTheme: 'light',
  defaultLanguage: 'zh'
};

export const APP_URLS = {
  officialSite: import.meta.env.VITE_APP_URL_OFFICIAL_SITE || 'https://imsky.example.com',
  docsSite: import.meta.env.VITE_APP_URL_DOCS_SITE || 'https://imsky.example.com/docs',
  shareSite: import.meta.env.VITE_APP_URL_SHARE_SITE || 'https://imsky.example.com/share',
  aiSite: import.meta.env.VITE_APP_URL_AI_SITE || 'https://ai.example.com/ai',
  clawSite: import.meta.env.VITE_APP_URL_CLAW_SITE || 'https://claw.example.com',
};

export const WS_CONFIG = {
  url: import.meta.env.VITE_APP_WS_URL || 'wss://imsky.example.com/ws',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000
};
