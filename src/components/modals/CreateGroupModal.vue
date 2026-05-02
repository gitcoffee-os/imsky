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
    :width="520"
    :closable="true"
    @cancel="handleClose"
    class="create-group-modal"
  >
    <div class="create-group-container">
      <!-- 头部标题 -->
      <div class="modal-header">
        <h3 class="modal-title">发起群聊</h3>
        <p class="modal-subtitle">选择好友创建群聊</p>
      </div>

      <!-- 群聊信息 -->
      <div class="group-info-section">
        <div class="group-avatar-upload">
          <a-avatar :size="56" :src="groupForm.avatar" class="group-avatar">
            <template #icon><TeamOutlined /></template>
          </a-avatar>
          <div class="upload-btn" @click="handleUploadAvatar">
            <CameraOutlined />
          </div>
        </div>
        <a-input
          v-model:value="groupForm.name"
          placeholder="请输入群聊名称"
          :maxlength="30"
          class="group-name-input"
        >
          <template #suffix>
            <span class="input-count">{{ groupForm.name.length }}/30</span>
          </template>
        </a-input>
      </div>

      <!-- 好友选择 -->
      <div class="friend-select-section">
        <div class="section-header">
          <span class="section-title">选择好友</span>
          <span class="selected-count">已选择 {{ selectedFriends.length }} 人</span>
        </div>
        
        <!-- 搜索 -->
        <div class="friend-search">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索好友"
            allow-clear
            class="search-input"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input-search>
        </div>

        <!-- 已选好友标签 -->
        <div v-if="selectedFriends.length > 0" class="selected-tags">
          <a-tag
            v-for="friend in selectedFriends"
            :key="friend.id"
            closable
            class="selected-tag"
            @close="handleUnselectFriend(friend)"
          >
            <a-avatar :size="16" :src="friend.avatar" class="tag-avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            {{ friend.name }}
          </a-tag>
        </div>

        <!-- 好友列表 -->
        <div class="friend-list">
          <a-checkbox-group v-model:value="selectedIds" class="friend-checkbox-group">
            <div
              v-for="friend in filteredFriends"
              :key="friend.id"
              class="friend-item"
              :class="{ selected: selectedIds.includes(friend.id) }"
              @click="toggleSelectFriend(friend)"
            >
              <a-checkbox :value="friend.id" class="friend-checkbox" @click.stop />
              <a-avatar :size="40" :src="friend.avatar" class="friend-avatar">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <div class="friend-info">
                <div class="friend-name">{{ friend.name }}</div>
                <div class="friend-status" :class="friend.status">
                  {{ friend.status === 'online' ? '在线' : '离线' }}
                </div>
              </div>
            </div>
          </a-checkbox-group>

          <a-empty v-if="filteredFriends.length === 0" description="暂无好友" class="empty-friends" />
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="modal-footer">
        <a-button @click="handleClose">取消</a-button>
        <a-button
          type="primary"
          :disabled="!canCreate"
          :loading="creating"
          @click="handleCreateGroup"
        >
          创建群聊
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import {
  TeamOutlined,
  CameraOutlined,
  SearchOutlined,
  UserOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
}

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create', group: { name: string; avatar: string; members: string[] }): void;
}>();

const groupForm = reactive({
  name: '',
  avatar: ''
});

const searchKeyword = ref('');
const selectedIds = ref<string[]>([]);
const creating = ref(false);

// 模拟好友列表
const friendsList = reactive<Friend[]>([
  { id: 'f001', name: '张三', avatar: '', status: 'online' },
  { id: 'f002', name: '李四', avatar: '', status: 'offline' },
  { id: 'f003', name: '王五', avatar: '', status: 'online' },
  { id: 'f004', name: '赵六', avatar: '', status: 'online' },
  { id: 'f005', name: '孙七', avatar: '', status: 'offline' },
  { id: 'f006', name: '周八', avatar: '', status: 'online' },
  { id: 'f007', name: '吴九', avatar: '', status: 'offline' },
  { id: 'f008', name: '郑十', avatar: '', status: 'online' }
]);

// 过滤后的好友列表
const filteredFriends = computed(() => {
  if (!searchKeyword.value) return friendsList;
  const keyword = searchKeyword.value.toLowerCase();
  return friendsList.filter(f => f.name.toLowerCase().includes(keyword));
});

// 已选择的好友
const selectedFriends = computed(() => {
  return friendsList.filter(f => selectedIds.value.includes(f.id));
});

// 是否可以创建
const canCreate = computed(() => {
  return groupForm.name.trim() && selectedIds.value.length >= 2;
});

// 切换选择好友
const toggleSelectFriend = (friend: Friend) => {
  const index = selectedIds.value.indexOf(friend.id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(friend.id);
  }
};

// 取消选择
const handleUnselectFriend = (friend: Friend) => {
  const index = selectedIds.value.indexOf(friend.id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  }
};

// 上传头像
const handleUploadAvatar = () => {
  message.info('头像上传功能开发中');
};

// 创建群聊
const handleCreateGroup = async () => {
  if (!canCreate.value) return;

  creating.value = true;

  // 模拟创建群聊
  setTimeout(() => {
    creating.value = false;
    message.success('群聊创建成功');
    emit('create', {
      name: groupForm.name,
      avatar: groupForm.avatar,
      members: selectedIds.value
    });
    handleClose();
  }, 1500);
};

const handleClose = () => {
  groupForm.name = '';
  groupForm.avatar = '';
  selectedIds.value = [];
  searchKeyword.value = '';
  emit('close');
};
</script>

<style scoped>
.create-group-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

.create-group-container {
  padding: 8px 0;
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;
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

/* 群聊信息 */
.group-info-section {
  padding: 0 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.group-avatar-upload {
  position: relative;
  flex-shrink: 0;
}

.group-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.upload-btn {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 12px;
  color: #666;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #f5f5f5;
  transform: scale(1.1);
}

.group-name-input {
  flex: 1;
}

.group-name-input :deep(.ant-input) {
  border-radius: 8px;
}

.input-count {
  font-size: 12px;
  color: #999;
}

/* 好友选择 */
.friend-select-section {
  padding: 0 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.selected-count {
  font-size: 13px;
  color: #667eea;
}

.friend-search {
  margin-bottom: 12px;
}

.search-input :deep(.ant-input) {
  border-radius: 8px;
}

/* 已选标签 */
.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  max-height: 80px;
  overflow-y: auto;
}

.selected-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
}

.tag-avatar {
  margin-right: 4px;
}

/* 好友列表 */
.friend-list {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 8px;
}

.friend-checkbox-group {
  width: 100%;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.friend-item:hover {
  background: #f5f5f5;
}

.friend-item.selected {
  background: #f0f5ff;
}

.friend-checkbox {
  margin-right: 0;
}

.friend-avatar {
  flex-shrink: 0;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.friend-status {
  font-size: 12px;
}

.friend-status.online {
  color: #52c41a;
}

.friend-status.offline {
  color: #999;
}

.empty-friends {
  padding: 32px 0;
}

/* 底部按钮 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 8px;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;
}
</style>
