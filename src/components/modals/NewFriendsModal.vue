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
    :width="600"
    :closable="true"
    @cancel="handleClose"
    class="new-friends-modal"
  >
    <div class="new-friends-container">
      <!-- 头部 -->
      <div class="modal-header">
        <h3 class="modal-title">新的朋友</h3>
        <span class="modal-subtitle">{{ pendingRequests.length }} 个待处理请求</span>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <a-input
          v-model:value="searchKeyword"
          placeholder="搜索手机号/账号"
          allow-clear
          class="search-input"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-button type="primary" class="add-btn" @click="handleAddFriend">
          <UserAddOutlined />
          添加朋友
        </a-button>
      </div>

      <!-- 请求列表 -->
      <div class="requests-list">
        <div class="list-header">
          <span class="header-title">好友申请</span>
          <a-button type="link" size="small" @click="clearAllRequests">
            清空全部
          </a-button>
        </div>

        <div class="requests-content">
          <div
            v-for="request in filteredRequests"
            :key="request.id"
            class="request-item"
          >
            <a-avatar :size="48" :src="request.avatar" class="request-avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <div class="request-info">
              <div class="request-name">{{ request.name }}</div>
              <div class="request-message">{{ request.message }}</div>
              <div class="request-time">{{ request.time }}</div>
            </div>
            <div class="request-actions">
              <template v-if="request.status === 'pending'">
                <a-button type="primary" size="small" @click="handleAccept(request)">
                  接受
                </a-button>
                <a-button size="small" @click="handleReject(request)">
                  忽略
                </a-button>
              </template>
              <span v-else-if="request.status === 'accepted'" class="status-text accepted">
                已添加
              </span>
              <span v-else-if="request.status === 'rejected'" class="status-text rejected">
                已忽略
              </span>
            </div>
          </div>

          <EmptyState
            v-if="filteredRequests.length === 0"
            description="暂无新的好友申请"
            class="empty-requests"
          />
        </div>
      </div>

      <!-- 推荐添加 -->
      <div class="recommend-section">
        <div class="section-title">可能认识的人</div>
        <div class="recommend-list">
          <div
            v-for="user in recommendUsers"
            :key="user.id"
            class="recommend-item"
          >
            <a-avatar :size="40" :src="user.avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <div class="recommend-info">
              <div class="recommend-name">{{ user.name }}</div>
              <div class="recommend-reason">{{ user.reason }}</div>
            </div>
            <a-button type="primary" size="small" ghost @click="handleAddRecommend(user)">
              添加
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SearchOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons-vue';
import { EmptyState } from '@gitcoffee-os/im-ui';

interface FriendRequest {
  id: string;
  name: string;
  avatar?: string;
  message: string;
  time: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface RecommendUser {
  id: string;
  name: string;
  avatar?: string;
  reason: string;
}

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'accept', request: FriendRequest): void;
  (e: 'reject', request: FriendRequest): void;
  (e: 'addFriend'): void;
}>();

const searchKeyword = ref('');

// 模拟好友申请数据
const pendingRequests = ref<FriendRequest[]>([
  {
    id: '1',
    name: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    message: '你好，我是张三，想加你好友',
    time: '10分钟前',
    status: 'pending'
  },
  {
    id: '2',
    name: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    message: '通过一下，有事找你',
    time: '1小时前',
    status: 'pending'
  },
  {
    id: '3',
    name: '王五',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    message: '你好，我是王五',
    time: '昨天',
    status: 'accepted'
  },
  {
    id: '4',
    name: '赵六',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    message: '你好',
    time: '3天前',
    status: 'rejected'
  }
]);

// 推荐用户
const recommendUsers = ref<RecommendUser[]>([
  {
    id: 'r1',
    name: '小明',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
    reason: '共同好友：小红'
  },
  {
    id: 'r2',
    name: '小李',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
    reason: '来自手机通讯录'
  },
  {
    id: 'r3',
    name: '小张',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
    reason: '可能认识的人'
  }
]);

const filteredRequests = computed(() => {
  if (!searchKeyword.value) return pendingRequests.value;
  const keyword = searchKeyword.value.toLowerCase();
  return pendingRequests.value.filter(r =>
    r.name.toLowerCase().includes(keyword)
  );
});

const handleClose = () => {
  emit('close');
};

const handleAccept = (request: FriendRequest) => {
  const index = pendingRequests.value.findIndex(r => r.id === request.id);
  if (index !== -1) {
    pendingRequests.value[index].status = 'accepted';
  }
  emit('accept', request);
};

const handleReject = (request: FriendRequest) => {
  const index = pendingRequests.value.findIndex(r => r.id === request.id);
  if (index !== -1) {
    pendingRequests.value[index].status = 'rejected';
  }
  emit('reject', request);
};

const clearAllRequests = () => {
  pendingRequests.value = [];
};

const handleAddFriend = () => {
  emit('addFriend');
};

const handleAddRecommend = (user: RecommendUser) => {
  console.log('添加推荐用户:', user);
};
</script>

<style scoped>
.new-friends-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
}

.new-friends-modal :deep(.ant-modal-body) {
  padding: 0;
}

.new-friends-container {
  padding: 24px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.modal-subtitle {
  font-size: 14px;
  color: #999;
}

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input {
  flex: 1;
}

.search-input :deep(.ant-input) {
  border-radius: 20px;
  background: #f5f5f5;
  border: none;
}

.add-btn {
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.requests-list {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.requests-content {
  max-height: 300px;
  overflow-y: auto;
}

.request-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.request-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.request-avatar {
  flex-shrink: 0;
}

.request-info {
  flex: 1;
  min-width: 0;
}

.request-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.request-message {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.request-time {
  font-size: 12px;
  color: #999;
}

.request-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.status-text {
  font-size: 13px;
  padding: 4px 12px;
}

.status-text.accepted {
  color: #52c41a;
}

.status-text.rejected {
  color: #999;
}

.empty-requests {
  padding: 40px 0;
}

.recommend-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.recommend-item:hover {
  background: #f0f0f0;
}

.recommend-info {
  flex: 1;
  min-width: 0;
}

.recommend-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.recommend-reason {
  font-size: 12px;
  color: #999;
}
</style>
