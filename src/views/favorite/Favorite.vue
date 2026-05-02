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
  <div class="favorite">
    <!-- 左侧栏 -->
    <div class="favorite-sidebar">
      <div class="sidebar-header">
        <h2>我的收藏</h2>
        <a-button type="primary" size="small" @click="handleNewNote">
          <template #icon><PlusOutlined /></template>
          新建笔记
        </a-button>
      </div>
      
      <div class="sidebar-menu">
        <div 
          class="menu-item"
          :class="{ active: activeCategory === 'all' }"
          @click="activeCategory = 'all'"
        >
          <StarOutlined />
          <span>全部收藏</span>
          <span class="count">{{ favorites.length }}</span>
        </div>
        
        <div class="menu-divider">笔记分类</div>
        
        <div 
          v-for="category in categories" 
          :key="category.key"
          class="menu-item"
          :class="{ active: activeCategory === category.key }"
          @click="activeCategory = category.key"
        >
          <component :is="category.icon" />
          <span>{{ category.label }}</span>
          <span class="count">{{ getCategoryCount(category.key) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 右侧内容 -->
    <div class="favorite-content">
      <!-- 工具栏 -->
      <div class="content-toolbar">
        <div class="toolbar-left">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索收藏内容"
            style="width: 240px"
            @search="handleSearch"
          />
        </div>
        <div class="toolbar-right">
          <a-select
            v-model:value="sortBy"
            style="width: 120px"
          >
            <a-select-option value="time">按时间排序</a-select-option>
            <a-select-option value="name">按名称排序</a-select-option>
          </a-select>
          <a-radio-group v-model:value="viewMode" button-style="solid">
            <a-radio-button value="grid">
              <AppstoreOutlined />
            </a-radio-button>
            <a-radio-button value="list">
              <UnorderedListOutlined />
            </a-radio-button>
          </a-radio-group>
        </div>
      </div>
      
      <!-- 收藏列表 -->
      <div class="favorite-list" :class="viewMode">
        <div v-if="filteredFavorites.length === 0" class="empty-state">
          <StarOutlined class="empty-icon" />
          <h3>暂无收藏</h3>
          <p>点击"新建笔记"开始创建您的收藏内容</p>
        </div>
        
        <!-- 笔记卡片 -->
        <div v-else>
          <div v-if="activeCategory === 'note'" class="note-list">
            <div v-for="item in filteredFavorites" :key="item.id" class="note-card">
              <div class="note-header">
                <h4>{{ item.title }}</h4>
                <div class="note-actions">
                  <a-button type="text" size="small" @click="handleEditNote(item)">
                    <EditOutlined />
                  </a-button>
                  <a-button type="text" size="small" @click="handleDeleteFavorite(item.id)">
                    <DeleteOutlined />
                  </a-button>
                </div>
              </div>
              <div class="note-content">{{ item.content }}</div>
              <div class="note-footer">
                <span class="note-time">{{ item.time }}</span>
                <a-tag :color="getCategoryColor(item.type)">{{ getCategoryLabel(item.type) }}</a-tag>
              </div>
            </div>
          </div>
          
          <!-- 其他类型卡片 -->
          <div v-else class="fav-grid" :class="viewMode">
            <div 
              v-for="item in filteredFavorites" 
              :key="item.id" 
              class="fav-card"
              @click="handlePreview(item)"
            >
              <!-- 图片类型 -->
              <div v-if="item.type === 'image'" class="card-image">
                <img :src="item.thumbnail || item.url" :alt="item.title" />
                <div class="card-overlay">
                  <EyeOutlined />
                </div>
              </div>
              
              <!-- 链接类型 -->
              <div v-else-if="item.type === 'link'" class="card-link">
                <div class="link-icon">
                  <LinkOutlined />
                </div>
                <div class="link-info">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.url }}</p>
                </div>
              </div>
              
              <!-- 文件类型 -->
              <div v-else-if="item.type === 'file'" class="card-file">
                <div class="file-icon" :class="item.fileType">
                  <FileTextOutlined v-if="item.fileType === 'doc'" />
                  <FilePdfOutlined v-else-if="item.fileType === 'pdf'" />
                  <FileZipOutlined v-else-if="item.fileType === 'zip'" />
                  <FileOutlined v-else />
                </div>
                <div class="file-info">
                  <h4>{{ item.title }}</h4>
                  <span>{{ item.size }}</span>
                </div>
              </div>
              
              <!-- 视频类型 -->
              <div v-else-if="item.type === 'video'" class="card-video">
                <img :src="item.thumbnail" :alt="item.title" />
                <div class="video-duration">{{ item.duration }}</div>
                <div class="video-play">
                  <PlayCircleOutlined />
                </div>
              </div>
              
              <!-- 音乐类型 -->
              <div v-else-if="item.type === 'audio'" class="card-audio">
                <div class="audio-icon">
                  <CustomerServiceOutlined />
                </div>
                <div class="audio-info">
                  <h4>{{ item.title }}</h4>
                  <span>{{ item.artist }}</span>
                </div>
              </div>
              
              <!-- 文字类型 -->
              <div v-else class="card-text">
                <FileTextOutlined class="text-icon" />
                <div class="text-info">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.summary }}</p>
                </div>
              </div>
              
              <div class="card-footer">
                <span class="card-time">{{ item.time }}</span>
                <a-dropdown>
                  <MoreOutlined class="more-btn" @click.stop />
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="move" @click.stop="handleMove(item)">移动到</a-menu-item>
                      <a-menu-item key="share" @click.stop="handleShare(item)">分享</a-menu-item>
                      <a-menu-item key="delete" @click.stop="handleDeleteFavorite(item.id)">删除</a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 新建/编辑笔记弹窗 -->
    <a-modal
      :open="noteModalVisible"
      :title="editingNote ? '编辑笔记' : '新建笔记'"
      :width="600"
      @cancel="handleCloseNoteModal"
      @ok="handleSaveNote"
    >
      <div class="note-form">
        <a-form layout="vertical">
          <a-form-item label="标题" required>
            <a-input v-model:value="noteForm.title" placeholder="请输入笔记标题" />
          </a-form-item>
          <a-form-item label="内容" required>
            <a-textarea 
              v-model:value="noteForm.content" 
              :rows="8" 
              placeholder="请输入笔记内容" 
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    
    <!-- 预览弹窗 -->
    <a-modal
      :open="previewVisible"
      :footer="null"
      :width="800"
      @cancel="previewVisible = false"
    >
      <div class="preview-content">
        <h3>{{ previewItem?.title }}</h3>
        <p v-if="previewItem?.url">
          <a :href="previewItem.url" target="_blank">{{ previewItem.url }}</a>
        </p>
        <img v-if="previewItem?.type === 'image'" :src="previewItem.url" style="max-width: 100%" />
        <div v-else>{{ previewItem?.summary || previewItem?.content }}</div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import {
  PlusOutlined,
  StarOutlined,
  FileTextOutlined,
  PictureOutlined,
  LinkOutlined,
  FolderOutlined,
  VideoCameraOutlined,
  CustomerServiceOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileZipOutlined,
  PlayCircleOutlined
} from '@ant-design/icons-vue';

interface FavoriteItem {
  id: string;
  title: string;
  type: string;
  url?: string;
  thumbnail?: string;
  summary?: string;
  content?: string;
  size?: string;
  duration?: string;
  artist?: string;
  fileType?: string;
  time: string;
}

const activeCategory = ref('all');
const searchText = ref('');
const sortBy = ref('time');
const viewMode = ref('grid');
const noteModalVisible = ref(false);
const previewVisible = ref(false);
const editingNote = ref<FavoriteItem | null>(null);
const previewItem = ref<FavoriteItem | null>(null);

const noteForm = ref({
  title: '',
  content: ''
});

const categories = [
  { key: 'note', label: '笔记', icon: FileTextOutlined },
  { key: 'image', label: '图片', icon: PictureOutlined },
  { key: 'link', label: '链接', icon: LinkOutlined },
  { key: 'file', label: '文件', icon: FolderOutlined },
  { key: 'video', label: '视频', icon: VideoCameraOutlined },
  { key: 'audio', label: '音乐', icon: CustomerServiceOutlined }
];

// 模拟收藏数据
const favorites = ref<FavoriteItem[]>([
  { id: '1', title: '项目需求文档', type: 'note', content: '这是项目需求文档的内容...', time: '2024-01-15' },
  { id: '2', title: '会议纪要', type: 'note', content: '本次会议主要讨论了...', time: '2024-01-14' },
  { id: '3', title: '美丽风景', type: 'image', thumbnail: 'https://picsum.photos/300/200', url: 'https://picsum.photos/800/600', summary: '美丽的风景照片', time: '2024-01-13' },
  { id: '4', title: 'GitHub', type: 'link', url: 'https://github.com', summary: '代码托管平台', time: '2024-01-12' },
  { id: '5', title: '工作汇报.docx', type: 'file', fileType: 'doc', size: '2.5MB', summary: 'Word 文档', time: '2024-01-11' },
  { id: '6', title: '技术文档.pdf', type: 'file', fileType: 'pdf', size: '5.8MB', summary: 'PDF 文档', time: '2024-01-10' },
  { id: '7', title: '教程视频', type: 'video', thumbnail: 'https://picsum.photos/300/180', duration: '12:35', summary: 'Vue3 教程视频', time: '2024-01-09' },
  { id: '8', title: '轻音乐', type: 'audio', artist: '未知艺术家', summary: '放松音乐', time: '2024-01-08' },
  { id: '9', title: '收藏的文章', type: 'link', url: 'https://example.com/article', summary: '一篇好文章', time: '2024-01-07' },
  { id: '10', title: '随手记', type: 'note', content: '今天的工作计划...', time: '2024-01-06' }
]);

const filteredFavorites = computed(() => {
  let result = [...favorites.value];
  
  // 分类筛选
  if (activeCategory.value !== 'all') {
    result = result.filter(item => item.type === activeCategory.value);
  }
  
  // 搜索筛选
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase();
    result = result.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      (item.summary && item.summary.toLowerCase().includes(keyword)) ||
      (item.content && item.content.toLowerCase().includes(keyword))
    );
  }
  
  // 排序
  if (sortBy.value === 'time') {
    result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  } else {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }
  
  return result;
});

const getCategoryCount = (key: string) => {
  return favorites.value.filter(item => item.type === key).length;
};

const getCategoryColor = (type: string) => {
  const colors: Record<string, string> = {
    note: 'blue',
    image: 'green',
    link: 'orange',
    file: 'purple',
    video: 'red',
    audio: 'cyan'
  };
  return colors[type] || 'default';
};

const getCategoryLabel = (type: string) => {
  const labels: Record<string, string> = {
    note: '笔记',
    image: '图片',
    link: '链接',
    file: '文件',
    video: '视频',
    audio: '音乐'
  };
  return labels[type] || type;
};

const handleNewNote = () => {
  editingNote.value = null;
  noteForm.value = { title: '', content: '' };
  noteModalVisible.value = true;
};

const handleEditNote = (item: FavoriteItem) => {
  editingNote.value = item;
  noteForm.value = { 
    title: item.title, 
    content: item.content || '' 
  };
  noteModalVisible.value = true;
};

const handleSaveNote = () => {
  if (!noteForm.value.title.trim()) {
    message.warning('请输入笔记标题');
    return;
  }
  if (!noteForm.value.content.trim()) {
    message.warning('请输入笔记内容');
    return;
  }
  
  if (editingNote.value) {
    // 编辑
    const index = favorites.value.findIndex(item => item.id === editingNote.value!.id);
    if (index !== -1) {
      favorites.value[index] = {
        ...favorites.value[index],
        title: noteForm.value.title,
        content: noteForm.value.content
      };
    }
    message.success('笔记已更新');
  } else {
    // 新建
    favorites.value.unshift({
      id: Date.now().toString(),
      title: noteForm.value.title,
      type: 'note',
      content: noteForm.value.content,
      time: new Date().toLocaleDateString('zh-CN')
    });
    message.success('笔记已创建');
  }
  
  noteModalVisible.value = false;
};

const handleCloseNoteModal = () => {
  noteModalVisible.value = false;
  editingNote.value = null;
};

const handleDeleteFavorite = (id: string) => {
  favorites.value = favorites.value.filter(item => item.id !== id);
  message.success('已删除');
};

const handlePreview = (item: FavoriteItem) => {
  previewItem.value = item;
  previewVisible.value = true;
};

const handleMove = (item: FavoriteItem) => {
  message.info('移动功能开发中');
};

const handleShare = (item: FavoriteItem) => {
  message.info('分享功能开发中');
};

const handleSearch = () => {
  // 搜索已在 computed 中处理
};
</script>

<style scoped>
.favorite {
  display: flex;
  height: 100%;
  background: #f5f5f5;
}

.favorite-sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.menu-item:hover {
  background: #f5f5f5;
  color: #333;
}

.menu-item.active {
  background: #e6f7ff;
  color: #1890ff;
}

.menu-item span:first-of-type {
  margin-left: 10px;
  flex: 1;
}

.menu-item .count {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: #999;
}

.menu-divider {
  padding: 12px 20px 8px;
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
}

.favorite-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-toolbar {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.favorite-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #d9d9d9;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: #333;
}

.empty-state p {
  margin: 0;
}

/* 笔记列表 */
.note-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.note-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.note-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.note-header h4 {
  margin: 0;
  font-size: 16px;
}

.note-actions {
  display: flex;
  gap: 4px;
}

.note-content {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
  max-height: 80px;
  overflow: hidden;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-time {
  font-size: 12px;
  color: #999;
}

/* 收藏网格 */
.fav-grid {
  display: grid;
  gap: 16px;
}

.fav-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.fav-grid.list {
  grid-template-columns: 1fr;
}

.fav-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  cursor: pointer;
}

.fav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-image {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
  opacity: 0;
  transition: opacity 0.3s;
}

.card-image:hover .card-overlay {
  opacity: 1;
}

.card-link {
  padding: 16px;
  display: flex;
  gap: 12px;
}

.link-icon {
  width: 48px;
  height: 48px;
  background: #1890ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.link-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
}

.link-info p {
  margin: 0;
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-file {
  padding: 16px;
  display: flex;
  gap: 12px;
}

.file-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.file-icon.doc {
  background: #1890ff;
  color: #fff;
}

.file-icon.pdf {
  background: #ff4d4f;
  color: #fff;
}

.file-icon.zip {
  background: #faad14;
  color: #fff;
}

.file-icon {
  background: #52c41a;
  color: #fff;
}

.file-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
}

.file-info span {
  font-size: 12px;
  color: #999;
}

.card-video {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.card-video img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.video-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 48px;
  opacity: 0;
  transition: opacity 0.3s;
}

.card-video:hover .video-play {
  opacity: 1;
}

.card-audio {
  padding: 16px;
  display: flex;
  gap: 12px;
}

.audio-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.audio-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
}

.audio-info span {
  font-size: 12px;
  color: #999;
}

.card-text {
  padding: 16px;
  display: flex;
  gap: 12px;
}

.text-icon {
  font-size: 32px;
  color: #1890ff;
}

.text-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
}

.text-info p {
  margin: 0;
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-time {
  font-size: 12px;
  color: #999;
}

.more-btn {
  color: #999;
  cursor: pointer;
}

.more-btn:hover {
  color: #333;
}

.note-form {
  padding: 20px 0;
}

.preview-content h3 {
  margin-bottom: 16px;
}

.preview-content img {
  max-width: 100%;
  border-radius: 8px;
}
</style>
