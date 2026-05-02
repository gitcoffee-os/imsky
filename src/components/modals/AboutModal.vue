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
<template>
  <a-modal
    :open="visible"
    :footer="null"
    :width="420"
    :closable="true"
    @cancel="handleClose"
    class="about-modal"
  >
    <div class="about-container">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo-wrapper">
          <img src="/logo.svg" alt="GitCoffee IM" class="app-logo" />
        </div>
        <h2 class="app-name">天信</h2>
        <p class="app-version">版本 {{ version }}</p>
      </div>

      <!-- 分隔线 -->
      <div class="divider"></div>

      <!-- 应用信息 -->
      <div class="info-section">
        <div class="info-item">
          <span class="info-label">官网</span>
          <a :href="APP_URLS.officialSite" target="_blank" class="info-link">
            {{ APP_URLS.officialSite.replace(/^https?:\/\//, '') }}
            <LinkOutlined class="link-icon" />
          </a>
        </div>
        <div class="info-item">
          <span class="info-label">帮助文档</span>
          <a :href="APP_URLS.docsSite" target="_blank" class="info-link">
            查看文档
            <LinkOutlined class="link-icon" />
          </a>
        </div>
        <div class="info-item">
          <span class="info-label">开源地址</span>
          <a href="https://github.com/gitcoffee-os/imsky" target="_blank" class="info-link">
            GitHub
            <LinkOutlined class="link-icon" />
          </a>
        </div>
        <div class="info-item">
          <span class="info-label">反馈问题</span>
          <a @click="goToFeedback" class="info-link clickable">
            提交反馈
            <RightOutlined class="link-icon" />
          </a>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="divider"></div>

      <!-- 版权信息 -->
      <div class="copyright-section">
        <p class="copyright-text">
          Copyright © 2025-2099 GitCoffee
        </p>
        <p class="copyright-sub">
          All Rights Reserved
        </p>
        <div class="license-links">
          <a @click="showLicense" class="license-link">用户协议</a>
          <span class="divider-dot">·</span>
          <a @click="showPrivacy" class="license-link">隐私政策</a>
          <span class="divider-dot">·</span>
          <a @click="showLicense" class="license-link">开源许可</a>
        </div>
      </div>

      <!-- 更新检查 -->
      <div class="update-section">
        <a-button
          type="primary"
          :loading="checkingUpdate"
          @click="checkUpdate"
          class="update-btn"
        >
          <template #icon>
            <SyncOutlined v-if="!checkingUpdate" />
          </template>
          {{ checkingUpdate ? '检查中...' : '检查更新' }}
        </a-button>
        <p v-if="updateStatus" class="update-status" :class="updateStatus.type">
          {{ updateStatus.message }}
        </p>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LinkOutlined, RightOutlined, SyncOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { APP_URLS } from '../../config/config';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'feedback'): void;
}>();

const version = ref('1.0.0');
const checkingUpdate = ref(false);
const updateStatus = ref<{ type: 'success' | 'info'; message: string } | null>(null);

const handleClose = () => {
  emit('close');
};

const goToFeedback = () => {
  emit('feedback');
  emit('close');
};

const showLicense = () => {
  message.info('功能开发中');
};

const showPrivacy = () => {
  message.info('功能开发中');
};

const checkUpdate = async () => {
  checkingUpdate.value = true;
  updateStatus.value = null;

  // 模拟检查更新
  setTimeout(() => {
    checkingUpdate.value = false;
    updateStatus.value = {
      type: 'success',
      message: '当前已是最新版本'
    };
  }, 1500);
};
</script>

<style scoped>
.about-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

.about-container {
  padding: 8px 0;
}

.logo-section {
  text-align: center;
  padding: 16px 0;
}

.logo-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-logo {
  width: 72px;
  height: 72px;
  border-radius: 16px;
}

.app-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.app-version {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 16px 24px;
}

.info-section {
  padding: 0 24px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-link {
  font-size: 14px;
  color: #1890ff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-link:hover {
  color: #40a9ff;
}

.info-link.clickable {
  cursor: pointer;
}

.link-icon {
  font-size: 12px;
}

.copyright-section {
  text-align: center;
  padding: 8px 24px;
}

.copyright-text {
  font-size: 12px;
  color: #999;
  margin: 0 0 4px;
}

.copyright-sub {
  font-size: 12px;
  color: #bbb;
  margin: 0 0 12px;
}

.license-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.license-link {
  font-size: 12px;
  color: #999;
  cursor: pointer;
  text-decoration: none;
}

.license-link:hover {
  color: #1890ff;
}

.divider-dot {
  color: #ddd;
}

.update-section {
  padding: 16px 24px 8px;
  text-align: center;
}

.update-btn {
  min-width: 120px;
  border-radius: 20px;
}

.update-status {
  margin: 12px 0 0;
  font-size: 13px;
}

.update-status.success {
  color: #52c41a;
}

.update-status.info {
  color: #1890ff;
}
</style>
