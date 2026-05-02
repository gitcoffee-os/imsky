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
    :width="480"
    :closable="true"
    @cancel="handleClose"
    class="add-friend-modal"
  >
    <div class="add-friend-container">
      <!-- 头部标题 -->
      <div class="modal-header">
        <h3 class="modal-title">添加好友</h3>
        <p class="modal-subtitle">通过手机号、用户名或邮箱查找好友</p>
      </div>

      <!-- 搜索区域 -->
      <div class="search-section">
        <a-input-search
          v-model:value="searchQuery"
          placeholder="请输入手机号/用户名/邮箱"
          :loading="searching"
          enter-button
          @search="handleSearch"
          class="search-input"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input-search>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchResult" class="search-result">
        <div class="result-user">
          <a-avatar :size="56" :src="searchResult.avatar" class="result-avatar">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <div class="result-info">
            <div class="result-name">{{ searchResult.name }}</div>
            <div class="result-id">ID: {{ searchResult.id }}</div>
            <div class="result-signature">{{ searchResult.signature || '这个人很懒，什么都没写~' }}</div>
          </div>
          <a-button
            type="primary"
            :disabled="searchResult.isFriend || requestSent"
            :loading="sendingRequest"
            @click="handleAddFriend"
            class="add-btn"
          >
            {{ searchResult.isFriend ? '已是好友' : (requestSent ? '已发送' : '添加') }}
          </a-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="hasSearched && !searching" class="empty-result">
        <a-empty description="未找到该用户" />
      </div>

      <!-- 推荐好友 -->
      <div v-if="!searchResult" class="recommend-section">
        <div class="section-title">
          <span>推荐好友</span>
          <a-button type="link" size="small" @click="refreshRecommend">
            <ReloadOutlined :spin="refreshing" />
            换一批
          </a-button>
        </div>
        <div class="recommend-list">
          <div
            v-for="user in recommendUsers"
            :key="user.id"
            class="recommend-item"
          >
            <a-avatar :size="44" :src="user.avatar" class="recommend-avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <div class="recommend-info">
              <div class="recommend-name">{{ user.name }}</div>
              <div class="recommend-reason">{{ user.reason }}</div>
            </div>
            <a-button
              type="primary"
              size="small"
              :disabled="user.requested"
              @click="handleRecommendAdd(user)"
            >
              {{ user.requested ? '已发送' : '添加' }}
            </a-button>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions-section">
        <div class="action-card qrcode-card" @click="showQRCode = true">
          <div class="qrcode-left">
            <div class="qrcode-preview">
              <QrcodeOutlined class="preview-icon" />
            </div>
            <div class="qrcode-text">
              <div class="qrcode-title">我的二维码</div>
              <div class="qrcode-desc">扫码添加我为好友</div>
            </div>
          </div>
          <RightOutlined class="qrcode-arrow" />
        </div>
        
        <div class="action-card group-card" @click="handleCreateGroup">
          <div class="qrcode-left">
            <div class="group-preview">
              <TeamOutlined class="preview-icon" />
            </div>
            <div class="qrcode-text">
              <div class="qrcode-title">发起群聊</div>
              <div class="qrcode-desc">选择好友创建群聊</div>
            </div>
          </div>
          <RightOutlined class="qrcode-arrow" />
        </div>
      </div>
    </div>

    <!-- 二维码弹窗 -->
    <a-modal
      v-model:open="showQRCode"
      title="我的二维码"
      :footer="null"
      :width="320"
      class="qrcode-modal"
    >
      <div class="qrcode-display">
        <div class="qrcode-wrapper">
          <!-- 模拟二维码 -->
          <div class="mock-qrcode">
            <div v-for="i in 25" :key="i" class="qrcode-row">
              <div
                v-for="j in 25"
                :key="j"
                class="qrcode-cell"
                :class="{ filled: isQRCodeFilled(i, j) }"
              />
            </div>
          </div>
        </div>
        <p class="qrcode-tip">扫一扫上面的二维码，添加我为好友</p>
        <div class="qrcode-actions">
          <a-button type="primary" block @click="downloadQRCode">
            <DownloadOutlined />
            保存二维码
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 发起群聊弹窗 -->
    <CreateGroupModal
      :visible="showCreateGroupModal"
      @close="showCreateGroupModal = false"
      @create="handleGroupCreated"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  SearchOutlined,
  UserOutlined,
  ReloadOutlined,
  QrcodeOutlined,
  RightOutlined,
  DownloadOutlined,
  TeamOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import CreateGroupModal from './CreateGroupModal.vue';

interface User {
  id: string;
  name: string;
  avatar: string;
  signature?: string;
  isFriend?: boolean;
  requested?: boolean;
  reason?: string;
}

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add', user: User): void;
}>();

const searchQuery = ref('');
const searching = ref(false);
const hasSearched = ref(false);
const searchResult = ref<User | null>(null);
const sendingRequest = ref(false);
const requestSent = ref(false);
const refreshing = ref(false);
const showQRCode = ref(false);
const showCreateGroupModal = ref(false);

// 推荐好友列表
const recommendUsers = reactive<User[]>([
  {
    id: 'user_001',
    name: '张三',
    avatar: '',
    signature: '热爱生活，热爱工作',
    reason: '共同好友：李四',
    requested: false
  },
  {
    id: 'user_002',
    name: '王五',
    avatar: '',
    signature: '程序员一枚',
    reason: '可能认识的人',
    requested: false
  },
  {
    id: 'user_003',
    name: '赵六',
    avatar: '',
    signature: '产品经理',
    reason: '共同好友：孙七',
    requested: false
  },
  {
    id: 'user_004',
    name: '孙七',
    avatar: '',
    signature: '设计师',
    reason: '可能认识的人',
    requested: false
  }
]);

// 模拟搜索
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    message.warning('请输入搜索内容');
    return;
  }

  searching.value = true;
  hasSearched.value = true;
  requestSent.value = false;

  // 模拟搜索延迟
  setTimeout(() => {
    searching.value = false;

    // 模拟搜索结果
    if (searchQuery.value.length >= 3) {
      searchResult.value = {
        id: 'user_' + Math.random().toString(36).substr(2, 6),
        name: '用户' + searchQuery.value,
        avatar: '',
        signature: '这是' + searchQuery.value + '的签名',
        isFriend: false
      };
    } else {
      searchResult.value = null;
    }
  }, 800);
};

// 添加好友
const handleAddFriend = async () => {
  if (!searchResult.value || searchResult.value.isFriend) return;

  sendingRequest.value = true;

  // 模拟发送请求
  setTimeout(() => {
    sendingRequest.value = false;
    requestSent.value = true;
    message.success('好友请求已发送');
    emit('add', searchResult.value!);
  }, 1000);
};

// 刷新推荐
const refreshRecommend = () => {
  refreshing.value = true;
  setTimeout(() => {
    refreshing.value = false;
    // 随机打乱推荐列表
    recommendUsers.sort(() => Math.random() - 0.5);
    message.success('已刷新推荐');
  }, 500);
};

// 添加推荐好友
const handleRecommendAdd = (user: User) => {
  user.requested = true;
  message.success(`已向 ${user.name} 发送好友请求`);
  emit('add', user);
};

// 生成模拟二维码图案
const isQRCodeFilled = (row: number, col: number) => {
  // 定位点
  if ((row <= 7 && col <= 7) || (row <= 7 && col >= 18) || (row >= 18 && col <= 7)) {
    if (row === 0 || row === 6 || col === 0 || col === 6) return true;
    if (row === 2 || row === 4 || col === 2 || col === 4) return true;
    if (row >= 2 && row <= 4 && col >= 2 && col <= 4) return true;
    return false;
  }
  // 随机填充
  return Math.random() > 0.5;
};

// 下载二维码
const downloadQRCode = () => {
  message.success('二维码已保存');
  showQRCode.value = false;
};

// 发起群聊
const handleCreateGroup = () => {
  showCreateGroupModal.value = true;
};

const handleGroupCreated = (group: { name: string; avatar: string; members: string[] }) => {
  console.log('创建群聊:', group);
  message.success('群聊创建成功');
  emit('close');
};

const handleClose = () => {
  searchQuery.value = '';
  searchResult.value = null;
  hasSearched.value = false;
  requestSent.value = false;
  emit('close');
};
</script>

<style scoped>
.add-friend-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

.add-friend-container {
  padding: 8px 0;
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.modal-subtitle {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.search-section {
  padding: 0 24px;
  margin-bottom: 20px;
}

.search-input :deep(.ant-input) {
  border-radius: 20px;
}

.search-input :deep(.ant-input-search-button) {
  border-radius: 0 20px 20px 0;
}

.search-result {
  padding: 0 24px;
  margin-bottom: 20px;
}

.result-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.result-avatar {
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.result-id {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.result-signature {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-btn {
  flex-shrink: 0;
}

.empty-result {
  padding: 32px 24px;
}

.recommend-section {
  padding: 0 24px;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
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
  background: #f8f9fa;
  border-radius: 10px;
  transition: background 0.2s;
}

.recommend-item:hover {
  background: #f0f0f0;
}

.recommend-avatar {
  flex-shrink: 0;
}

.recommend-info {
  flex: 1;
  min-width: 0;
}

.recommend-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.recommend-reason {
  font-size: 12px;
  color: #999;
}

.quick-actions-section {
  padding: 0 24px;
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.qrcode-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.qrcode-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.group-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
}

.group-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(17, 153, 142, 0.4);
}

.qrcode-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qrcode-preview,
.group-preview {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.preview-icon {
  font-size: 24px;
  color: #fff;
}

.qrcode-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.qrcode-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.qrcode-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.qrcode-arrow {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  transition: transform 0.2s;
}

.qrcode-card:hover .qrcode-arrow {
  transform: translateX(4px);
  color: #fff;
}

/* 二维码弹窗 */
.qrcode-modal :deep(.ant-modal-content) {
  border-radius: 16px;
}

.qrcode-display {
  padding: 24px;
  text-align: center;
}

.qrcode-wrapper {
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.mock-qrcode {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.qrcode-row {
  flex: 1;
  display: flex;
}

.qrcode-cell {
  flex: 1;
  background: #fff;
}

.qrcode-cell.filled {
  background: #333;
}

.qrcode-tip {
  font-size: 13px;
  color: #666;
  margin: 0 0 20px;
}

.qrcode-actions {
  padding: 0 20px;
}
</style>
