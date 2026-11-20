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

/**
 * ImSky 应用配置中心（env 唯一读取点）。
 * UI 及可下沉逻辑已迁移至 @gitcoffee-os/imsky-ui，
 * 本文件仅保留应用侧标识与启动注入配置。
 */

export const APP_ID = 'imsky';

// 生产环境下 API 基础 URL 使用环境变量（不含路径前缀，由 endpoint 自带），确保请求直接打到后端
// 开发环境使用 ''，由 vite server.proxy 匹配 /exmay 代理到后端
export const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || '';

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

/** 认证页 Passport 配置（注入 @gitcoffee-os/imsky-ui 的 PASSPORT_CONFIG） */
export const PASSPORT_CONFIG = {
  template: 'im',
  layout: 'split',
  brand: {
    name: 'ImSky 天信IM',
    title: '欢迎回来',
    highlight: '畅聊每一刻',
    subtitle: '安全、稳定、跨平台的即时通讯体验',
    features: ['端到端消息同步', '高清音视频通话', '多端登录无缝切换'],
    copyright: '© 2025-2099 GitCoffee'
  },
  features: {
    register: true,
    forgotPassword: true,
    socialLogin: false,
    rememberMe: true
  },
  routes: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    home: '/chat'
  }
};
