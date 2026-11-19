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
    :width="800"
    :body-style="{ padding: 0, height: '600px', overflow: 'hidden' }"
    class="search-modal"
    @cancel="handleClose"
  >
    <div class="search-container">
      <!-- 搜索头部 -->
      <div class="search-header">
        <div class="search-input-wrapper">
          <a-input-search
            v-model:value="searchQuery"
            placeholder="搜索消息、联系人、文件..."
            size="large"
            @search="handleSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input-search>
        </div>
        
        <!-- 搜索类型标签 -->
        <div class="search-types">
          <a-radio-group v-model:value="searchType" button-style="solid">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="message">消息</a-radio-button>
            <a-radio-button value="contact">联系人</a-radio-button>
            <a-radio-button value="file">文件</a-radio-button>
            <a-radio-button value="group">群聊</a-radio-button>
          </a-radio-group>
        </div>
      </div>
      
      <!-- 搜索内容 -->
      <div class="search-content">
        <!-- 搜索历史 -->
        <div v-if="!searchQuery && !hasResults" class="search-history">
          <div class="section-title">
            <span>搜索历史</span>
            <a-button type="link" size="small" @click="clearHistory">
              清空
            </a-button>
          </div>
          <div class="history-tags">
            <a-tag
              v-for="item in searchHistory"
              :key="item"
              class="history-tag"
              closable
              @click="searchQuery = item"
              @close="removeHistory(item)"
            >
              {{ item }}
            </a-tag>
          </div>
        </div>
        
        <!-- 搜索结果 -->
        <div v-if="hasResults" class="search-results">
          <!-- 联系人结果 -->
          <div v-if="contactResults.length" class="result-section">
            <div class="section-title">联系人</div>
            <div class="result-list">
              <div
                v-for="contact in contactResults"
                :key="contact.id"
                class="result-item"
                @click="handleContactClick(contact)"
              >
                <a-avatar :size="40" :src="contact.avatar">
                  <template #icon><UserOutlined /></template>
                </a-avatar>
                <div class="result-info">
                  <div class="result-name" v-html="highlightText(contact.name)"></div>
                  <div class="result-desc">{{ contact.signature || '暂无签名' }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 消息结果 -->
          <div v-if="messageResults.length" class="result-section">
            <div class="section-title">消息</div>
            <div class="result-list">
              <div
                v-for="msg in messageResults"
                :key="msg.id"
                class="result-item"
                @click="handleMessageClick(msg)"
              >
                <a-avatar :size="40" :src="msg.avatar">
                  <template #icon><UserOutlined /></template>
                </a-avatar>
                <div class="result-info">
                  <div class="result-name">{{ msg.sender }}</div>
                  <div class="result-desc" v-html="highlightText(msg.content)"></div>
                  <div class="result-time">{{ msg.time }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 文件结果 -->
          <div v-if="fileResults.length" class="result-section">
            <div class="section-title">文件</div>
            <div class="result-list">
              <div
                v-for="file in fileResults"
                :key="file.id"
                class="result-item"
                @click="handleFileClick(file)"
              >
                <div class="file-icon">
                  <FileOutlined />
                </div>
                <div class="result-info">
                  <div class="result-name" v-html="highlightText(file.name)"></div>
                  <div class="result-desc">{{ file.size }} · {{ file.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 无结果 -->
        <div v-if="searchQuery && !hasResults && !loading" class="no-results">
          <a-empty description="未找到相关结果" />
        </div>
        
        <!-- 加载中 -->
        <div v-if="loading" class="search-loading">
          <a-spin size="large" />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { SearchOutlined, UserOutlined, FileOutlined } from '@ant-design/icons-vue';
import { debounce } from '@gitcoffee-os/im-utils';

interface ContactResult {
  id: string;
  name: string;
  avatar?: string;
  signature?: string;
}

interface MessageResult {
  id: string;
  sender: string;
  avatar?: string;
  content: string;
  time: string;
  sessionId: string;
}

interface FileResult {
  id: string;
  name: string;
  size: string;
  time: string;
  url: string;
}

interface Props {
  visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const router = useRouter();

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const searchQuery = ref('');
const searchType = ref('all');
const loading = ref(false);

// 搜索历史
const searchHistory = ref<string[]>(['张三', '项目文档', '会议记录']);

// 模拟搜索结果
const contactResults = ref<ContactResult[]>([]);
const messageResults = ref<MessageResult[]>([]);
const fileResults = ref<FileResult[]>([]);

const hasResults = computed(() => {
  return contactResults.value.length > 0 || 
         messageResults.value.length > 0 || 
         fileResults.value.length > 0;
});

// 搜索处理
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;
  
  loading.value = true;
  
  // 添加到历史
  if (!searchHistory.value.includes(searchQuery.value)) {
    searchHistory.value.unshift(searchQuery.value);
    if (searchHistory.value.length > 10) {
      searchHistory.value.pop();
    }
  }
  
  // 模拟搜索延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 模拟搜索结果
  contactResults.value = [
    { id: '1', name: '张三', signature: '工作中...' },
    { id: '2', name: '张三丰', signature: '太极宗师' }
  ].filter(c => c.name.includes(searchQuery.value));
  
  messageResults.value = [
    { id: '1', sender: '李四', content: '你好，' + searchQuery.value + '在吗？', time: '昨天', sessionId: '1' },
    { id: '2', sender: '王五', content: '关于' + searchQuery.value + '的讨论', time: '前天', sessionId: '2' }
  ];
  
  fileResults.value = [
    { id: '1', name: searchQuery.value + '.pdf', size: '2.5MB', time: '3天前', url: '' }
  ];
  
  loading.value = false;
};

// 防抖搜索
const debouncedSearch = debounce(handleSearch, 300);

watch(searchQuery, () => {
  if (searchQuery.value) {
    debouncedSearch();
  } else {
    contactResults.value = [];
    messageResults.value = [];
    fileResults.value = [];
  }
});

// 高亮匹配文本
const highlightText = (text: string) => {
  if (!searchQuery.value) return text;
  const regex = new RegExp(`(${searchQuery.value})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

const handleClose = () => {
  visible.value = false;
  searchQuery.value = '';
  contactResults.value = [];
  messageResults.value = [];
  fileResults.value = [];
};

const clearHistory = () => {
  searchHistory.value = [];
};

const removeHistory = (item: string) => {
  const index = searchHistory.value.indexOf(item);
  if (index > -1) {
    searchHistory.value.splice(index, 1);
  }
};

const handleContactClick = (contact: ContactResult) => {
  console.log('打开联系人:', contact.id);
  handleClose();
};

const handleMessageClick = (msg: MessageResult) => {
  router.push({ name: 'ChatSession', params: { sessionId: msg.sessionId } });
  handleClose();
};

const handleFileClick = (file: FileResult) => {
  console.log('打开文件:', file.id);
};
</script>

<style scoped>
.search-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

.search-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.search-input-wrapper {
  margin-bottom: 16px;
}

.search-types {
  display: flex;
  justify-content: center;
}

.search-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

/* 搜索历史 */
.search-history {
  padding: 8px 0;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  cursor: pointer;
  padding: 4px 12px;
  font-size: 13px;
}

.history-tag:hover {
  color: #07c160;
  border-color: #07c160;
}

/* 搜索结果 */
.search-results {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.result-section {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.result-section:last-child {
  border-bottom: none;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.result-item:hover {
  background: #f5f5f5;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.result-name :deep(.highlight) {
  color: #07c160;
  font-weight: 600;
}

.result-desc {
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-desc :deep(.highlight) {
  color: #07c160;
}

.result-time {
  font-size: 12px;
  color: #ccc;
  margin-top: 4px;
}

.file-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #1890ff;
}

/* 无结果 */
.no-results {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

/* 加载中 */
.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}
</style>
