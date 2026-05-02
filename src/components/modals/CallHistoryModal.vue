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
    class="call-history-modal"
  >
    <div class="call-history-container">
      <!-- 头部标题 -->
      <div class="modal-header">
        <h3 class="modal-title">通话记录</h3>
        <div class="header-actions">
          <a-radio-group v-model:value="activeTab" size="small" button-style="solid">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="audio">语音</a-radio-button>
            <a-radio-button value="video">视频</a-radio-button>
          </a-radio-group>
          <a-button type="text" size="small" @click="clearAllHistory">
            <DeleteOutlined />
            清空
          </a-button>
        </div>
      </div>

      <!-- 通话统计 -->
      <div class="call-stats">
        <div class="stat-item">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总通话</div>
        </div>
        <div class="stat-item">
          <div class="stat-value success">{{ stats.completed }}</div>
          <div class="stat-label">已接通</div>
        </div>
        <div class="stat-item">
          <div class="stat-value missed">{{ stats.missed }}</div>
          <div class="stat-label">未接通</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ formatDuration(stats.totalDuration) }}</div>
          <div class="stat-label">总时长</div>
        </div>
      </div>

      <!-- 通话列表 -->
      <div class="call-list">
        <div
          v-for="call in filteredCalls"
          :key="call.id"
          class="call-item"
          :class="call.status"
        >
          <div class="call-icon" :class="call.type">
            <PhoneOutlined v-if="call.type === 'audio'" />
            <VideoCameraOutlined v-else />
          </div>
          <div class="call-info">
            <div class="call-name">{{ call.name }}</div>
            <div class="call-meta">
              <span class="call-time">{{ call.time }}</span>
              <span class="call-duration" v-if="call.duration">
                {{ formatDuration(call.duration) }}
              </span>
            </div>
          </div>
          <div class="call-status">
            <a-tag :color="getStatusColor(call.status)" size="small">
              {{ getStatusText(call.status) }}
            </a-tag>
          </div>
          <div class="call-actions">
            <a-button type="text" size="small" @click="callBack(call)">
              <PhoneOutlined />
            </a-button>
            <a-dropdown>
              <a-button type="text" size="small">
                <MoreOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="deleteCall(call)">删除记录</a-menu-item>
                  <a-menu-item @click="addToBlacklist(call)">加入黑名单</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>

        <a-empty v-if="filteredCalls.length === 0" description="暂无通话记录" class="empty-calls" />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import {
  PhoneOutlined,
  VideoCameraOutlined,
  DeleteOutlined,
  MoreOutlined
} from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';

type CallType = 'audio' | 'video';
type CallStatus = 'completed' | 'missed' | 'rejected' | 'outgoing';

interface CallRecord {
  id: string;
  name: string;
  avatar?: string;
  type: CallType;
  status: CallStatus;
  time: string;
  duration?: number;
  phone?: string;
}

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'call', call: CallRecord): void;
}>();

const activeTab = ref<'all' | 'audio' | 'video'>('all');

// 模拟通话记录数据
const callHistory = reactive<CallRecord[]>([
  { id: '1', name: '张三', type: 'audio', status: 'completed', time: '今天 14:30', duration: 180 },
  { id: '2', name: '李四', type: 'video', status: 'missed', time: '今天 12:15' },
  { id: '3', name: '王五', type: 'audio', status: 'rejected', time: '昨天 18:20' },
  { id: '4', name: '赵六', type: 'video', status: 'completed', time: '昨天 10:00', duration: 360 },
  { id: '5', name: '孙七', type: 'audio', status: 'outgoing', time: '前天 16:45', duration: 120 },
  { id: '6', name: '周八', type: 'video', status: 'missed', time: '前天 09:30' },
  { id: '7', name: '吴九', type: 'audio', status: 'completed', time: '3天前', duration: 240 },
  { id: '8', name: '郑十', type: 'video', status: 'completed', time: '3天前', duration: 600 }
]);

// 过滤后的通话记录
const filteredCalls = computed(() => {
  if (activeTab.value === 'all') return callHistory;
  return callHistory.filter(call => call.type === activeTab.value);
});

// 统计数据
const stats = computed(() => {
  const total = callHistory.length;
  const completed = callHistory.filter(c => c.status === 'completed').length;
  const missed = callHistory.filter(c => c.status === 'missed').length;
  const totalDuration = callHistory.reduce((sum, c) => sum + (c.duration || 0), 0);
  return { total, completed, missed, totalDuration };
});

// 格式化时长
const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}时${mins}分`;
};

// 获取状态颜色
const getStatusColor = (status: CallStatus) => {
  const colors: Record<CallStatus, string> = {
    completed: 'success',
    missed: 'error',
    rejected: 'warning',
    outgoing: 'processing'
  };
  return colors[status];
};

// 获取状态文本
const getStatusText = (status: CallStatus) => {
  const texts: Record<CallStatus, string> = {
    completed: '已接通',
    missed: '未接通',
    rejected: '已拒绝',
    outgoing: '已拨出'
  };
  return texts[status];
};

// 回拨
const callBack = (call: CallRecord) => {
  emit('call', call);
  message.success(`正在呼叫 ${call.name}...`);
};

// 删除通话记录
const deleteCall = (call: CallRecord) => {
  const index = callHistory.findIndex(c => c.id === call.id);
  if (index > -1) {
    callHistory.splice(index, 1);
    message.success('通话记录已删除');
  }
};

// 清空所有记录
const clearAllHistory = () => {
  Modal.confirm({
    title: '确认清空',
    content: '确定要清空所有通话记录吗？此操作不可恢复。',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      callHistory.length = 0;
      message.success('通话记录已清空');
    }
  });
};

// 加入黑名单
const addToBlacklist = (call: CallRecord) => {
  message.info(`已将 ${call.name} 加入黑名单`);
};

const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.call-history-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

.call-history-container {
  padding: 8px 0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 通话统计 */
.call-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 16px 24px;
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.stat-value.success {
  color: #52c41a;
}

.stat-value.missed {
  color: #ff4d4f;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* 通话列表 */
.call-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 24px;
}

.call-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}

.call-item:last-child {
  border-bottom: none;
}

.call-item:hover {
  background: #fafafa;
  margin: 0 -24px;
  padding-left: 24px;
  padding-right: 24px;
}

.call-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.call-icon.audio {
  background: #e6f7ff;
  color: #1890ff;
}

.call-icon.video {
  background: #f6ffed;
  color: #52c41a;
}

.call-info {
  flex: 1;
  min-width: 0;
}

.call-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.call-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.call-status {
  flex-shrink: 0;
}

.call-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.call-item:hover .call-actions {
  opacity: 1;
}

.empty-calls {
  padding: 48px 0;
}
</style>
