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
    v-model:visible="visible"
    :footer="null"
    :closable="false"
    :width="360"
    class="user-profile-modal"
    @cancel="handleClose"
  >
    <div class="profile-card">
      <!-- 封面背景 -->
      <div class="profile-cover">
        <div class="cover-gradient"></div>
      </div>
      
      <!-- 用户信息 -->
      <div class="profile-info">
        <a-avatar :size="80" class="profile-avatar">
          <template #icon><UserOutlined /></template>
        </a-avatar>
        
        <div class="profile-name">{{ user.name || '用户昵称' }}</div>
        <div class="profile-id">ID: {{ user.id || '123456' }}</div>
        
        <div class="profile-status">
          <a-tag :color="statusColor">{{ statusText }}</a-tag>
        </div>
        
        <div class="profile-signature">
          {{ user.signature || '这个人很懒，什么都没写~' }}
        </div>
      </div>
      
      <!-- 统计信息 -->
      <div class="profile-stats">
        <div class="stat-item">
          <div class="stat-value">128</div>
          <div class="stat-label">动态</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">256</div>
          <div class="stat-label">关注</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">1.2k</div>
          <div class="stat-label">粉丝</div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="profile-actions">
        <a-button type="primary" block @click="handleEditProfile">
          编辑资料
        </a-button>
        <a-button block @click="handleViewDetails">
          查看详情
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { UserOutlined } from '@ant-design/icons-vue';

interface User {
  id?: string;
  name?: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  signature?: string;
}

interface Props {
  visible: boolean;
  user: User;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  user: () => ({})
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  edit: [];
  viewDetails: [];
}>();

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const statusColor = computed(() => {
  const colors: Record<string, string> = {
    online: 'success',
    offline: 'default',
    busy: 'error',
    away: 'warning'
  };
  return colors[props.user.status || 'online'];
});

const statusText = computed(() => {
  const texts: Record<string, string> = {
    online: '在线',
    offline: '离线',
    busy: '忙碌',
    away: '离开'
  };
  return texts[props.user.status || 'online'];
});

const handleClose = () => {
  visible.value = false;
};

const handleEditProfile = () => {
  emit('edit');
  handleClose();
};

const handleViewDetails = () => {
  emit('viewDetails');
  handleClose();
};
</script>

<style scoped>
.user-profile-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
  padding: 0;
}

.user-profile-modal :deep(.ant-modal-body) {
  padding: 0;
}

.profile-card {
  position: relative;
}

.profile-cover {
  height: 120px;
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
  position: relative;
}

.cover-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to top, rgba(0,0,0,0.1), transparent);
}

.profile-info {
  padding: 0 24px 24px;
  text-align: center;
  position: relative;
}

.profile-avatar {
  margin-top: -40px;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-top: 12px;
}

.profile-id {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.profile-status {
  margin-top: 8px;
}

.profile-signature {
  font-size: 14px;
  color: #666;
  margin-top: 12px;
  padding: 0 16px;
  line-height: 1.5;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.profile-actions {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
