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
    class="moments-modal"
    @cancel="handleClose"
  >
    <div class="moments-container">
      <!-- 头部封面 -->
      <div class="moments-header">
        <div class="cover-image">
          <img src="https://picsum.photos/800/300" alt="封面" />
        </div>
        <div class="user-info">
          <a-avatar :size="64" class="user-avatar">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <span class="user-name">我的动态</span>
        </div>
      </div>
      
      <!-- 动态列表 -->
      <div class="moments-list" ref="listRef">
        <div
          v-for="moment in momentsList"
          :key="moment.id"
          class="moment-item"
        >
          <div class="moment-avatar">
            <a-avatar :size="40">
              <template #icon><UserOutlined /></template>
            </a-avatar>
          </div>
          <div class="moment-content">
            <div class="moment-author">{{ moment.author }}</div>
            <div class="moment-text">{{ moment.content }}</div>
            
            <!-- 图片 -->
            <div v-if="moment.images?.length" class="moment-images">
              <div
                v-for="(img, index) in moment.images"
                :key="index"
                class="moment-image"
                :class="{ single: moment.images.length === 1 }"
              >
                <img :src="img" alt="" />
              </div>
            </div>
            
            <!-- 视频 -->
            <div v-if="moment.video" class="moment-video">
              <video :src="moment.video" controls />
            </div>
            
            <div class="moment-meta">
              <span class="moment-time">{{ moment.time }}</span>
              <div class="moment-actions">
                <a-button type="text" size="small" @click="handleLike(moment)">
                  <LikeOutlined :class="{ liked: moment.isLiked }" />
                  {{ moment.likes }}
                </a-button>
                <a-button type="text" size="small" @click="handleComment(moment)">
                  <MessageOutlined />
                  {{ moment.comments }}
                </a-button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="loading" class="loading-more">
          <a-spin size="small" />
          <span>加载中...</span>
        </div>
      </div>
      
      <!-- 发布按钮 -->
      <a-float-button
        class="publish-btn"
        type="primary"
        @click="handlePublish"
      >
        <template #icon>
          <PlusOutlined />
        </template>
      </a-float-button>
    </div>

    <!-- 发布动态弹窗 -->
    <MomentPublishModal
      :visible="publishModalVisible"
      @close="closePublishModal"
      @publish="onPublishMoment"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { UserOutlined, LikeOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { MomentPublishModal } from '@gitcoffee-os/im-ui';

interface Moment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  images?: string[];
  video?: string;
  time: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
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

const loading = ref(false);
const listRef = ref<HTMLElement>();
const publishModalVisible = ref(false);

// 模拟动态数据
const momentsList = ref<Moment[]>([
  {
    id: '1',
    author: '张三',
    content: '今天天气真好，出去散步了！🌞',
    images: [
      'https://picsum.photos/300/300?random=1',
      'https://picsum.photos/300/300?random=2',
      'https://picsum.photos/300/300?random=3'
    ],
    time: '2小时前',
    likes: 12,
    comments: 3
  },
  {
    id: '2',
    author: '李四',
    content: '分享一首好听的歌~',
    time: '5小时前',
    likes: 8,
    comments: 1
  },
  {
    id: '3',
    author: '王五',
    content: '周末聚餐，开心！🍻',
    images: [
      'https://picsum.photos/400/300?random=4'
    ],
    time: '昨天',
    likes: 25,
    comments: 8
  }
]);

const handleClose = () => {
  visible.value = false;
};

const handleLike = (moment: Moment) => {
  moment.isLiked = !moment.isLiked;
  moment.likes += moment.isLiked ? 1 : -1;
};

const handleComment = (moment: Moment) => {
  console.log('评论动态:', moment.id);
};

const handlePublish = () => {
  publishModalVisible.value = true;
};

const closePublishModal = () => {
  publishModalVisible.value = false;
};

const onPublishMoment = (data: { content: string; images: string[]; visibility: string }) => {
  const newMoment: Moment = {
    id: Date.now().toString(),
    author: '我',
    content: data.content,
    images: data.images,
    time: '刚刚',
    likes: 0,
    comments: 0,
    isLiked: false
  };
  momentsList.value.unshift(newMoment);
  console.log('发布动态:', data);
};
</script>

<style scoped>
.moments-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

.moments-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.moments-header {
  position: relative;
  flex-shrink: 0;
}

.cover-image {
  height: 200px;
  overflow: hidden;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  position: absolute;
  bottom: -20px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.moments-list {
  flex: 1;
  overflow-y: auto;
  padding: 40px 24px 24px;
}

.moment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.moment-avatar {
  flex-shrink: 0;
}

.moment-content {
  flex: 1;
}

.moment-author {
  font-size: 15px;
  font-weight: 600;
  color: #576b95;
  margin-bottom: 4px;
}

.moment-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 8px;
}

.moment-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.moment-image {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 4px;
}

.moment-image.single {
  grid-column: span 1;
  max-width: 200px;
}

.moment-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.moment-video {
  margin-bottom: 8px;
}

.moment-video video {
  width: 100%;
  max-width: 400px;
  border-radius: 4px;
}

.moment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.moment-time {
  font-size: 12px;
  color: #999;
}

.moment-actions {
  display: flex;
  gap: 8px;
}

.moment-actions :deep(.ant-btn) {
  color: #999;
}

.moment-actions :deep(.ant-btn:hover) {
  color: #07c160;
}

.moment-actions .liked {
  color: #fa5151;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #999;
  font-size: 12px;
}

.publish-btn {
  position: absolute;
  right: 24px;
  bottom: 24px;
}
</style>
