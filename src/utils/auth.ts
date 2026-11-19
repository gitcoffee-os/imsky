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
 * 认证工具：凭证恢复与退出登录（与 passport-ui 共用同一套 token 存储）
 */
import { updateApiHeaders } from '@gitcoffee-os/api';
import { clearAuth, getToken } from '@gitcoffee-os/passport-utils';
import { AUTH_ROUTES } from '../config/config';

/** 应用启动时恢复 Authorization 请求头（存在 token 时） */
export function restoreAuthHeaders() {
  const token = getToken();
  if (token) {
    updateApiHeaders({ Authorization: `Bearer ${token}` });
  }
}

/** 退出登录：清理凭证与请求头 */
export function clearCredentials() {
  clearAuth();
  updateApiHeaders({ Authorization: '' });
}

/** 登录页路径（供退出登录后跳转使用） */
export function loginRoute(): string {
  return AUTH_ROUTES.login;
}
