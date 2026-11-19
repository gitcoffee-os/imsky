/**
 * Copyright (c) 2025-2099 GitCoffee All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-8060
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * ImSky 真实 IM 接入的单点入口。
 *
 * 默认走现有本地演示数据（`VITE_IM_REAL` 不存在或为 `0`/`false`），保证
 * 现有 Demo 不受影响。设置 `VITE_IM_REAL=1` 并启动后端时，通过
 * `@gitcoffee-os/im-adapter` 接通 WebSocket，登录成功后用
 * `im.client.chat` 读写会话/消息，并通过 `toImUiMessage` 等映射给 im-ui store。
 *
 * 单例：页面只初始化一次 `initImAdapter`，后续通过 `getIm()` 复用。
 */
import {
  createImClient,
  setImConfig,
  type ImAdapters,
  type ImConfig,
} from '@exmay/im';
import { createWebRtcDriver } from '@exmay/im/rtc';
import { createRouterNavigator } from '@gitcoffee-os/im-adapter';
import { createWebCapture } from '@gitcoffee-os/im-adapter';
import { createWebStorage } from '@gitcoffee-os/im-adapter';
import { createWebTransport } from '@gitcoffee-os/im-adapter';
import { createWebUpload } from '@gitcoffee-os/im-adapter';
import type { ImAdapterInstance, ImAdapterOptions } from '@gitcoffee-os/im-adapter';
import { initImAdapter as initImAdapterCore } from '@gitcoffee-os/im-adapter';

/** Token 存储键（@gitcoffee-os/passport-utils 默认 PASSPORT-TOKEN）。 */
const TOKEN_KEY = 'PASSPORT-TOKEN';

const readToken = (): string | null => {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      return data && typeof data === 'object' && 'token' in data
        ? String(data.token)
        : raw;
    } catch {
      return raw;
    }
  } catch {
    return null;
  }
};

let current: ImAdapterInstance | null = null;

/** 已初始化的 IM 客户端单例。外部仅在 `VITE_IM_REAL` 时使用。 */
export const getIm = (): ImAdapterInstance | null => current;

/** @returns 是否开启真实 IM（受 `VITE_IM_REAL` 控制）。 */
export const isImReal = (): boolean => {
  try {
    const value = import.meta.env.VITE_IM_REAL;
    return value === '1' || value === 'true' || value === 'yes';
  } catch {
    return false;
  }
};

/** 初始化并返回 IM 客户端（可重复调用，返回同一单例）。 */
export const initIm = (
  options: ImAdapterOptions = {},
): ImAdapterInstance | null => {
  if (!isImReal()) return null;

  if (current) return current;

  const token = options.getToken ?? readToken;
  const apiBase = options.apiBase ?? '/exmay/authority/api';
  const wsUrl = options.wsUrl ?? import.meta.env.VITE_IM_WS_URL ?? '';
  const appId =
    options.appId ?? import.meta.env.VITE_APP_ID ?? 'imsky';

  const srsUrl = import.meta.env.VITE_SRS_URL ?? undefined;
  const srs = srsUrl ? { url: srsUrl } : undefined;

  const im = initImAdapterCore({
    appId,
    wsUrl,
    apiBase,
    tokenKey: TOKEN_KEY,
    getToken: token,
    srs,
    heartbeatIntervalMs: Number(
      import.meta.env.VITE_IM_HEARTBEAT_INTERVAL_MS ?? 30_000,
    ),
    reconnectDelayMs: Number(
      import.meta.env.VITE_IM_RECONNECT_DELAY_MS ?? 3_000,
    ),
    loginTimeoutMs: Number(import.meta.env.VITE_IM_LOGIN_TIMEOUT_MS ?? 10_000),
    adapters: {
      rtc: createWebRtcDriver(),
      ...options.adapters,
    },
    ...options,
  });

  // 登录成功后自动拉一次会话（由调用方决定时机，这里只做连接）。
  im.client.on('connection', ({ status }: { status: string }) => {
    if (status === 'connected') {
      // 自身 uid 已由调用方在登录后通过 im.setSelfUid(uid) 设置。
    }
  });

  current = im;
  return im;
};

/** 销毁并释放单例。 */
export const destroyIm = (): void => {
  if (current) {
    current.destroy();
    current = null;
  }
};

export { initImAdapterCore as initImAdapter };
export type { ImAdapterInstance, ImAdapterOptions };
export type { ImAdapters, ImConfig };
export { createImClient, setImConfig };
export { createRouterNavigator, createWebCapture, createWebStorage, createWebTransport, createWebUpload };
export { createWebRtcDriver } from '@exmay/im/rtc';
