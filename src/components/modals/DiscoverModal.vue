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
    :width="900"
    :body-style="{ padding: 0, height: '700px', overflow: 'hidden' }"
    class="discover-modal"
    @cancel="handleClose"
  >
    <div class="discover-container">
      <!-- 顶部导航 -->
      <div class="discover-header">
        <div class="header-tabs">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </div>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="discover-content" ref="contentRef">
        <!-- 推荐内容 - 瀑布流布局 -->
        <div v-if="activeTab === 'recommend'" class="waterfall-container">
          <div class="waterfall-column" v-for="col in 3" :key="col">
            <div
              v-for="item in getColumnItems(col)"
              :key="item.id"
              class="discover-card"
              @click="handleViewDetail(item)"
            >
              <div class="card-media">
                <img v-if="item.type === 'image'" :src="item.cover" alt="" />
                <video v-else :src="item.video" :poster="item.cover" />
                <div v-if="item.type === 'video'" class="video-badge">
                  <PlayCircleOutlined />
                </div>
              </div>
              <div class="card-info">
                <div class="card-title">{{ item.title }}</div>
                <div class="card-author">
                  <a-avatar :size="20">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                  <span>{{ item.author }}</span>
                </div>
                <div class="card-stats">
                  <span><LikeOutlined /> {{ item.likes }}</span>
                  <span><EyeOutlined /> {{ item.views }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 图文内容 -->
        <div v-if="activeTab === 'image'" class="content-grid">
          <div
            v-for="item in imageItems"
            :key="item.id"
            class="discover-card large"
            @click="handleViewDetail(item)"
          >
            <div class="card-media">
              <img :src="item.cover" alt="" />
            </div>
            <div class="card-info">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-desc">{{ item.description }}</div>
              <div class="card-author">
                <a-avatar :size="24">
                  <template #icon><UserOutlined /></template>
                </a-avatar>
                <span>{{ item.author }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 视频内容 -->
        <div v-if="activeTab === 'video'" class="video-grid">
          <div
            v-for="item in videoItems"
            :key="item.id"
            class="video-card"
            @click="handleViewDetail(item)"
          >
            <div class="video-cover">
              <img :src="item.cover" alt="" />
              <div class="video-play">
                <PlayCircleOutlined />
              </div>
              <div class="video-duration">{{ item.duration }}</div>
            </div>
            <div class="video-info">
              <div class="video-title">{{ item.title }}</div>
              <div class="video-meta">
                <span>{{ item.author }}</span>
                <span><PlayCircleOutlined /> {{ item.views }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="loading" class="loading-more">
          <a-spin size="small" />
          <span>加载中...</span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { UserOutlined, LikeOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons-vue';

interface DiscoverItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description?: string;
  cover: string;
  video?: string;
  author: string;
  likes: number;
  views: number;
  duration?: string;
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

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const activeTab = ref('recommend');
const loading = ref(false);
const contentRef = ref<HTMLElement>();

const tabs = [
  { key: 'recommend', label: '推荐' },
  { key: 'image', label: '图文' },
  { key: 'video', label: '视频' },
  { key: 'hot', label: '热门' }
];

// 模拟发现数据
const discoverItems = ref<DiscoverItem[]>([
  {
    id: '1',
    type: 'image',
    title: '周末去哪儿玩？推荐这几个好地方',
    description: '周末不知道去哪里？来看看这些推荐吧...',
    cover: 'https://picsum.photos/300/400?random=1',
    author: '旅行达人',
    likes: 1234,
    views: 5678
  },
  {
    id: '2',
    type: 'video',
    title: '美食探店：这家餐厅真的太好吃了！',
    cover: 'https://picsum.photos/300/350?random=2',
    video: 'https://example.com/video1.mp4',
    author: '美食博主',
    likes: 3456,
    views: 12345,
    duration: '03:45'
  },
  {
    id: '3',
    type: 'image',
    title: '摄影技巧分享：如何拍出好看的照片',
    cover: 'https://picsum.photos/300/450?random=3',
    author: '摄影师小王',
    likes: 890,
    views: 3456
  },
  {
    id: '4',
    type: 'video',
    title: '健身教程：在家也能练出好身材',
    cover: 'https://picsum.photos/300/380?random=4',
    video: 'https://example.com/video2.mp4',
    author: '健身教练',
    likes: 5678,
    views: 23456,
    duration: '05:20'
  },
  {
    id: '5',
    type: 'image',
    title: '穿搭分享：夏季清爽搭配',
    cover: 'https://picsum.photos/300/420?random=5',
    author: '时尚博主',
    likes: 2345,
    views: 8901
  },
  {
    id: '6',
    type: 'video',
    title: '宠物日常：我家猫咪的搞笑瞬间',
    cover: 'https://picsum.photos/300/360?random=6',
    video: 'https://example.com/video3.mp4',
    author: '铲屎官',
    likes: 7890,
    views: 34567,
    duration: '02:15'
  }
]);

const imageItems = computed(() => discoverItems.value.filter(item => item.type === 'image'));
const videoItems = computed(() => discoverItems.value.filter(item => item.type === 'video'));

// 按列分配数据（简单瀑布流）
const getColumnItems = (col: number) => {
  return discoverItems.value.filter((_, index) => index % 3 === col - 1);
};

const handleClose = () => {
  visible.value = false;
};

const handleViewDetail = (item: DiscoverItem) => {
  console.log('查看详情:', item.id);
};
</script>

<style scoped>
.discover-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

.discover-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.discover-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.header-tabs {
  display: flex;
  gap: 24px;
}

.tab-item {
  font-size: 15px;
  color: #666;
  cursor: pointer;
  padding: 4px 0;
  position: relative;
  transition: color 0.2s;
}

.tab-item:hover {
  color: #07c160;
}

.tab-item.active {
  color: #07c160;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: #07c160;
  border-radius: 1px;
}

.discover-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* 瀑布流布局 */
.waterfall-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.waterfall-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.discover-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f0f0f0;
}

.discover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.discover-card.large {
  grid-column: span 1;
}

.card-media {
  position: relative;
  overflow: hidden;
}

.card-media img {
  width: 100%;
  height: auto;
  display: block;
}

.card-media video {
  width: 100%;
  height: auto;
}

.video-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: rgba(255,255,255,0.9);
}

.card-info {
  padding: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-author {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.card-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 图文网格 */
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* 视频网格 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.video-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.video-card:hover {
  transform: translateY(-4px);
}

.video-cover {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.video-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40px;
  color: rgba(255,255,255,0.9);
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.video-info {
  padding: 8px 0;
}

.video-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: #999;
  font-size: 12px;
}
</style>
