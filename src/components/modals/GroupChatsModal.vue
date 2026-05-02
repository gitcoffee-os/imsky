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
    :width="700"
    :closable="true"
    @cancel="handleClose"
    class="group-chats-modal"
  >
    <div class="group-chats-container">
      <!-- 头部 -->
      <div class="modal-header">
        <h3 class="modal-title">群聊</h3>
        <a-button type="primary" @click="handleCreateGroup">
          <PlusOutlined />
          创建群聊
        </a-button>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <a-input
          v-model:value="searchKeyword"
          placeholder="搜索群聊名称"
          allow-clear
          class="search-input"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>

      <!-- 标签页 -->
      <a-tabs v-model:activeKey="activeTab" class="group-tabs">
        <a-tab-pane key="all" tab="全部群聊">
          <div class="groups-list">
            <div
              v-for="group in filteredGroups"
              :key="group.id"
              class="group-item"
              @click="handleGroupClick(group)"
            >
              <a-avatar :size="48" :src="group.avatar" shape="square" class="group-avatar">
                <template #icon><TeamOutlined /></template>
              </a-avatar>
              <div class="group-info">
                <div class="group-name-row">
                  <span class="group-name">{{ group.name }}</span>
                  <a-badge
                    v-if="group.unreadCount > 0"
                    :count="group.unreadCount"
                    class="unread-badge"
                  />
                </div>
                <div class="group-meta">
                  <span class="member-count">{{ group.memberCount }}人</span>
                  <span class="divider">·</span>
                  <span class="last-message">{{ group.lastMessage }}</span>
                </div>
              </div>
              <div class="group-time">{{ group.lastTime }}</div>
            </div>

            <EmptyState
              v-if="filteredGroups.length === 0"
              description="暂无群聊"
              class="empty-groups"
            />
          </div>
        </a-tab-pane>

        <a-tab-pane key="created" tab="我创建的">
          <div class="groups-list">
            <div
              v-for="group in createdGroups"
              :key="group.id"
              class="group-item"
              @click="handleGroupClick(group)"
            >
              <a-avatar :size="48" :src="group.avatar" shape="square" class="group-avatar">
                <template #icon><TeamOutlined /></template>
              </a-avatar>
              <div class="group-info">
                <div class="group-name-row">
                  <span class="group-name">{{ group.name }}</span>
                  <a-tag v-if="group.isOwner" color="green" size="small">群主</a-tag>
                </div>
                <div class="group-meta">
                  <span class="member-count">{{ group.memberCount }}人</span>
                  <span class="divider">·</span>
                  <span class="last-message">{{ group.lastMessage }}</span>
                </div>
              </div>
              <div class="group-time">{{ group.lastTime }}</div>
            </div>

            <EmptyState
              v-if="createdGroups.length === 0"
              description="暂无创建的群聊"
              class="empty-groups"
            />
          </div>
        </a-tab-pane>

        <a-tab-pane key="joined" tab="我加入的">
          <div class="groups-list">
            <div
              v-for="group in joinedGroups"
              :key="group.id"
              class="group-item"
              @click="handleGroupClick(group)"
            >
              <a-avatar :size="48" :src="group.avatar" shape="square" class="group-avatar">
                <template #icon><TeamOutlined /></template>
              </a-avatar>
              <div class="group-info">
                <div class="group-name-row">
                  <span class="group-name">{{ group.name }}</span>
                </div>
                <div class="group-meta">
                  <span class="member-count">{{ group.memberCount }}人</span>
                  <span class="divider">·</span>
                  <span class="last-message">{{ group.lastMessage }}</span>
                </div>
              </div>
              <div class="group-time">{{ group.lastTime }}</div>
            </div>

            <EmptyState
              v-if="joinedGroups.length === 0"
              description="暂无加入的群聊"
              class="empty-groups"
            />
          </div>
        </a-tab-pane>
      </a-tabs>

      <!-- 推荐群聊 -->
      <div class="recommend-section">
        <div class="section-header">
          <span class="section-title">推荐群聊</span>
          <a-button type="link" size="small">查看更多</a-button>
        </div>
        <div class="recommend-list">
          <div
            v-for="group in recommendGroups"
            :key="group.id"
            class="recommend-card"
          >
            <a-avatar :size="56" :src="group.avatar" shape="square">
              <template #icon><TeamOutlined /></template>
            </a-avatar>
            <div class="recommend-info">
              <div class="recommend-name">{{ group.name }}</div>
              <div class="recommend-desc">{{ group.description }}</div>
              <div class="recommend-members">{{ group.memberCount }}人已加入</div>
            </div>
            <a-button type="primary" size="small" @click="handleJoinGroup(group)">
              加入
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SearchOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons-vue';
import { EmptyState } from '@gitcoffee/im-ui';

interface GroupChat {
  id: string;
  name: string;
  avatar?: string;
  memberCount: number;
  lastMessage: string;
  lastTime: string;
  unreadCount?: number;
  isOwner?: boolean;
  description?: string;
}

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'createGroup'): void;
  (e: 'groupClick', group: GroupChat): void;
  (e: 'joinGroup', group: GroupChat): void;
}>();

const searchKeyword = ref('');
const activeTab = ref('all');

// 模拟群聊数据
const allGroups = ref<GroupChat[]>([
  {
    id: 'g1',
    name: '产品技术部',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=1',
    memberCount: 45,
    lastMessage: '张三: 今天的需求评审改到下午3点',
    lastTime: '10分钟前',
    unreadCount: 5,
    isOwner: true,
    description: '产品技术部内部沟通群'
  },
  {
    id: 'g2',
    name: '前端开发小组',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=2',
    memberCount: 12,
    lastMessage: '李四: Vue3的新特性分享',
    lastTime: '30分钟前',
    unreadCount: 2,
    isOwner: false,
    description: '前端技术交流'
  },
  {
    id: 'g3',
    name: '周末羽毛球',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=3',
    memberCount: 20,
    lastMessage: '王五: 这周六下午2点，老地方见',
    lastTime: '2小时前',
    unreadCount: 0,
    isOwner: true,
    description: '羽毛球爱好者群'
  },
  {
    id: 'g4',
    name: '家庭群',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=4',
    memberCount: 8,
    lastMessage: '妈妈: 晚上回来吃饭吗？',
    lastTime: '昨天',
    unreadCount: 0,
    isOwner: false,
    description: '家人沟通群'
  },
  {
    id: 'g5',
    name: '大学同学',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=5',
    memberCount: 35,
    lastMessage: '赵六: 下个月聚会大家有空吗？',
    lastTime: '3天前',
    unreadCount: 0,
    isOwner: false,
    description: '大学同学交流群'
  }
]);

// 推荐群聊
const recommendGroups = ref<GroupChat[]>([
  {
    id: 'r1',
    name: 'AI技术交流群',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=6',
    memberCount: 1280,
    description: '人工智能、机器学习技术交流',
    lastMessage: '',
    lastTime: ''
  },
  {
    id: 'r2',
    name: '摄影爱好者',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=7',
    memberCount: 560,
    description: '分享摄影作品和技巧',
    lastMessage: '',
    lastTime: ''
  },
  {
    id: 'r3',
    name: '读书分享会',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=8',
    memberCount: 320,
    description: '好书推荐与读书心得',
    lastMessage: '',
    lastTime: ''
  }
]);

const filteredGroups = computed(() => {
  if (!searchKeyword.value) return allGroups.value;
  const keyword = searchKeyword.value.toLowerCase();
  return allGroups.value.filter(g =>
    g.name.toLowerCase().includes(keyword)
  );
});

const createdGroups = computed(() => {
  return allGroups.value.filter(g => g.isOwner);
});

const joinedGroups = computed(() => {
  return allGroups.value.filter(g => !g.isOwner);
});

const handleClose = () => {
  emit('close');
};

const handleCreateGroup = () => {
  emit('createGroup');
};

const handleGroupClick = (group: GroupChat) => {
  emit('groupClick', group);
};

const handleJoinGroup = (group: GroupChat) => {
  emit('joinGroup', group);
};
</script>

<style scoped>
.group-chats-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
}

.group-chats-modal :deep(.ant-modal-body) {
  padding: 0;
}

.group-chats-container {
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

.search-section {
  margin-bottom: 20px;
}

.search-input :deep(.ant-input) {
  border-radius: 20px;
  background: #f5f5f5;
  border: none;
}

.group-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}

.groups-list {
  max-height: 320px;
  overflow-y: auto;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.group-item:hover {
  background: #f5f5f5;
}

.group-avatar {
  flex-shrink: 0;
  border-radius: 8px;
}

.group-info {
  flex: 1;
  min-width: 0;
}

.group-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.group-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
}

.group-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #999;
}

.member-count {
  color: #666;
}

.divider {
  color: #ccc;
}

.last-message {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.group-time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.unread-badge :deep(.ant-badge-count) {
  background: #ff4d4f;
}

.empty-groups {
  padding: 40px 0;
}

.recommend-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
  margin-top: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommend-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.recommend-card:hover {
  background: #f0f0f0;
}

.recommend-info {
  flex: 1;
  min-width: 0;
}

.recommend-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.recommend-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommend-members {
  font-size: 12px;
  color: #999;
}
</style>
