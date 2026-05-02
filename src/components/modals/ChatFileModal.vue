<template>
  <a-modal
    :open="visible"
    :footer="null"
    :width="900"
    :body-style="{ padding: 0, height: '650px', overflow: 'hidden' }"
    class="chat-file-modal"
    @cancel="handleClose"
    @update:open="handleClose"
  >
    <div class="chat-file-container">
      <!-- 左侧边栏 -->
      <div class="file-sidebar">
        <div class="sidebar-header">
          <h3>聊天文件</h3>
        </div>
        
        <div class="file-stats">
          <div class="stat-item">
            <span class="stat-value">{{ fileStats.totalFiles }}</span>
            <span class="stat-label">文件总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ fileStats.totalSize }}</span>
            <span class="stat-label">占用空间</span>
          </div>
        </div>
        
        <div class="sidebar-menu">
          <div 
            class="menu-item"
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            <FolderOutlined />
            <span>全部文件</span>
            <span class="menu-count">{{ allFiles.length }}</span>
          </div>
          <div 
            class="menu-item"
            :class="{ active: activeTab === 'image' }"
            @click="activeTab = 'image'"
          >
            <PictureOutlined />
            <span>图片</span>
            <span class="menu-count">{{ imageFiles.length }}</span>
          </div>
          <div 
            class="menu-item"
            :class="{ active: activeTab === 'document' }"
            @click="activeTab = 'document'"
          >
            <FileTextOutlined />
            <span>文档</span>
            <span class="menu-count">{{ documentFiles.length }}</span>
          </div>
          <div 
            class="menu-item"
            :class="{ active: activeTab === 'video' }"
            @click="activeTab = 'video'"
          >
            <VideoCameraOutlined />
            <span>视频</span>
            <span class="menu-count">{{ videoFiles.length }}</span>
          </div>
          <div 
            class="menu-item"
            :class="{ active: activeTab === 'audio' }"
            @click="activeTab = 'audio'"
          >
            <AudioOutlined />
            <span>音频</span>
            <span class="menu-count">{{ audioFiles.length }}</span>
          </div>
          <div 
            class="menu-item"
            :class="{ active: activeTab === 'other' }"
            @click="activeTab = 'other'"
          >
            <FileOutlined />
            <span>其他</span>
            <span class="menu-count">{{ otherFiles.length }}</span>
          </div>
        </div>
        
        <div class="sidebar-footer">
          <a-button type="primary" block @click="handleOpenFileTransfer">
            <FolderOpenOutlined />
            打开文件传输助手
          </a-button>
        </div>
      </div>
      
      <!-- 右侧内容 -->
      <div class="file-content">
        <!-- 工具栏 -->
        <div class="content-toolbar">
          <div class="toolbar-left">
            <a-input-search
              v-model:value="searchText"
              placeholder="搜索文件"
              style="width: 240px"
              @search="handleSearch"
            />
            <a-select
              v-model:value="sortBy"
              style="width: 120px; margin-left: 12px"
              size="small"
            >
              <a-select-option value="time">按时间</a-select-option>
              <a-select-option value="size">按大小</a-select-option>
              <a-select-option value="name">按名称</a-select-option>
            </a-select>
          </div>
          <div class="toolbar-right">
            <a-radio-group v-model:value="viewMode" button-style="solid" size="small">
              <a-radio-button value="grid">
                <AppstoreOutlined />
              </a-radio-button>
              <a-radio-button value="list">
                <UnorderedListOutlined />
              </a-radio-button>
            </a-radio-group>
            <a-button type="primary" size="small" @click="handleUpload">
              <UploadOutlined />
              上传文件
            </a-button>
          </div>
        </div>
        
        <!-- 文件列表 -->
        <div class="file-list" :class="viewMode">
          <div v-if="filteredFiles.length === 0" class="empty-state">
            <InboxOutlined class="empty-icon" />
            <p>暂无文件</p>
          </div>
          
          <!-- 网格视图 -->
          <template v-else-if="viewMode === 'grid'">
            <div v-for="file in filteredFiles" :key="file.id" class="file-card" @click="handlePreview(file)">
              <div class="file-thumbnail">
                <img v-if="file.type === 'image'" :src="file.thumbnail" :alt="file.name" />
                <div v-else class="file-icon" :class="file.type">
                  <PictureOutlined v-if="file.type === 'image'" />
                  <FileTextOutlined v-else-if="file.type === 'document'" />
                  <VideoCameraOutlined v-else-if="file.type === 'video'" />
                  <AudioOutlined v-else-if="file.type === 'audio'" />
                  <FileOutlined v-else />
                </div>
              </div>
              <div class="file-info">
                <div class="file-name" :title="file.name">{{ file.name }}</div>
                <div class="file-meta">
                  <span>{{ file.size }}</span>
                  <span>{{ file.time }}</span>
                </div>
              </div>
              <div class="file-actions">
                <a-dropdown>
                  <MoreOutlined class="more-btn" @click.stop />
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="download" @click.stop="handleDownload(file)">
                        <DownloadOutlined />
                        下载
                      </a-menu-item>
                      <a-menu-item key="share" @click.stop="handleShare(file)">
                        <ShareAltOutlined />
                        分享
                      </a-menu-item>
                      <a-menu-item key="delete" danger @click.stop="handleDelete(file)">
                        <DeleteOutlined />
                        删除
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </template>
          
          <!-- 列表视图 -->
          <template v-else>
            <div v-for="file in filteredFiles" :key="file.id" class="file-list-item" @click="handlePreview(file)">
              <div class="file-icon-small" :class="file.type">
                <PictureOutlined v-if="file.type === 'image'" />
                <FileTextOutlined v-else-if="file.type === 'document'" />
                <VideoCameraOutlined v-else-if="file.type === 'video'" />
                <AudioOutlined v-else-if="file.type === 'audio'" />
                <FileOutlined v-else />
              </div>
              <div class="file-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-meta">
                  <span>{{ file.size }}</span>
                  <span>{{ file.time }}</span>
                  <span>来自: {{ file.from }}</span>
                </div>
              </div>
              <div class="file-actions">
                <a-button type="text" size="small" @click.stop="handleDownload(file)">
                  <DownloadOutlined />
                </a-button>
                <a-button type="text" size="small" @click.stop="handleShare(file)">
                  <ShareAltOutlined />
                </a-button>
                <a-button type="text" size="small" danger @click.stop="handleDelete(file)">
                  <DeleteOutlined />
                </a-button>
              </div>
            </div>
          </template>
        </div>
        
        <!-- 批量操作栏 -->
        <div v-if="selectedFiles.length > 0" class="batch-actions">
          <span>已选择 {{ selectedFiles.length }} 个文件</span>
          <div class="batch-btns">
            <a-button size="small" @click="handleBatchDownload">
              <DownloadOutlined />
              下载
            </a-button>
            <a-button size="small" danger @click="handleBatchDelete">
              <DeleteOutlined />
              删除
            </a-button>
            <a-button size="small" @click="selectedFiles = []">取消</a-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 文件预览弹窗 -->
    <a-modal
      :open="previewVisible"
      :footer="null"
      :width="800"
      @cancel="previewVisible = false"
      @update:open="previewVisible = $event"
    >
      <div class="file-preview">
        <img v-if="previewFile?.type === 'image'" :src="previewFile?.url" style="max-width: 100%" />
        <div v-else class="preview-placeholder">
          <FileOutlined class="preview-icon" />
          <p>{{ previewFile?.name }}</p>
          <a-button type="primary" @click="handleDownload(previewFile)">
            <DownloadOutlined />
            下载文件
          </a-button>
        </div>
      </div>
    </a-modal>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import {
  FolderOutlined,
  PictureOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  SearchOutlined,
  MoreOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  InboxOutlined,
  FolderOpenOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const activeTab = ref('all');
const searchText = ref('');
const sortBy = ref('time');
const viewMode = ref('grid');
const previewVisible = ref(false);
const previewFile = ref<any>(null);
const selectedFiles = ref<string[]>([]);

// 文件统计
const fileStats = reactive({
  totalFiles: 128,
  totalSize: '2.5 GB'
});

// 模拟文件数据
const allFiles = ref([
  { id: '1', name: '微信图片_20250401.jpg', type: 'image', size: '2.5 MB', time: '今天 10:30', from: '张三', thumbnail: 'https://picsum.photos/200/200?random=1', url: 'https://picsum.photos/800/600?random=1' },
  { id: '2', name: '项目需求文档.pdf', type: 'document', size: '1.8 MB', time: '昨天 15:20', from: '李四', thumbnail: '', url: '' },
  { id: '3', name: '会议记录.docx', type: 'document', size: '856 KB', time: '昨天 09:15', from: '王五', thumbnail: '', url: '' },
  { id: '4', name: '产品演示视频.mp4', type: 'video', size: '156 MB', time: '3天前', from: '张三', thumbnail: 'https://picsum.photos/200/150?random=2', url: '' },
  { id: '5', name: '语音消息.amr', type: 'audio', size: '256 KB', time: '3天前', from: '李四', thumbnail: '', url: '' },
  { id: '6', name: '设计稿_v2.psd', type: 'other', size: '45 MB', time: '上周', from: '王五', thumbnail: '', url: '' },
  { id: '7', name: '团队合照.jpg', type: 'image', size: '3.2 MB', time: '上周', from: '张三', thumbnail: 'https://picsum.photos/200/200?random=3', url: 'https://picsum.photos/800/600?random=3' },
  { id: '8', name: '年终总结.pptx', type: 'document', size: '5.6 MB', time: '2周前', from: '李四', thumbnail: '', url: '' },
  { id: '9', name: '培训视频.mp4', type: 'video', size: '280 MB', time: '2周前', from: '王五', thumbnail: 'https://picsum.photos/200/150?random=4', url: '' },
  { id: '10', name: '背景音乐.mp3', type: 'audio', size: '4.5 MB', time: '3周前', from: '张三', thumbnail: '', url: '' }
]);

// 按类型分类
const imageFiles = computed(() => allFiles.value.filter(f => f.type === 'image'));
const documentFiles = computed(() => allFiles.value.filter(f => f.type === 'document'));
const videoFiles = computed(() => allFiles.value.filter(f => f.type === 'video'));
const audioFiles = computed(() => allFiles.value.filter(f => f.type === 'audio'));
const otherFiles = computed(() => allFiles.value.filter(f => f.type === 'other'));

// 过滤后的文件
const filteredFiles = computed(() => {
  let files = allFiles.value;
  
  // 按类型筛选
  if (activeTab.value !== 'all') {
    files = files.filter(f => f.type === activeTab.value);
  }
  
  // 按搜索词筛选
  if (searchText.value) {
    files = files.filter(f => f.name.toLowerCase().includes(searchText.value.toLowerCase()));
  }
  
  // 排序
  return files.sort((a, b) => {
    switch (sortBy.value) {
      case 'size':
        return parseFloat(a.size) - parseFloat(b.size);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'time':
      default:
        return 0;
    }
  });
});

const handleClose = () => {
  emit('update:visible', false);
};

const handleSearch = () => {
  // 搜索逻辑已在 computed 中处理
};

const handleUpload = () => {
  message.info('上传功能开发中');
};

const handlePreview = (file: any) => {
  previewFile.value = file;
  previewVisible.value = true;
};

const handleDownload = (file: any) => {
  message.success(`开始下载: ${file?.name || '文件'}`);
};

const handleShare = (file: any) => {
  message.success(`分享文件: ${file.name}`);
};

const handleDelete = (file: any) => {
  const index = allFiles.value.findIndex(f => f.id === file.id);
  if (index !== -1) {
    allFiles.value.splice(index, 1);
    fileStats.totalFiles--;
    message.success('文件已删除');
  }
};

const handleBatchDownload = () => {
  message.success(`批量下载 ${selectedFiles.value.length} 个文件`);
};

const handleBatchDelete = () => {
  allFiles.value = allFiles.value.filter(f => !selectedFiles.value.includes(f.id));
  fileStats.totalFiles -= selectedFiles.value.length;
  selectedFiles.value = [];
  message.success('批量删除成功');
};

const handleOpenFileTransfer = () => {
  message.info('打开文件传输助手');
  handleClose();
};
</script>

<style scoped>
.chat-file-container {
  display: flex;
  height: 100%;
}

.file-sidebar {
  width: 220px;
  background: #f7f7f7;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.file-stats {
  display: flex;
  padding: 16px 20px;
  gap: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.sidebar-menu {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.menu-item:hover {
  background: #e6e6e6;
}

.menu-item.active {
  background: #07c160;
  color: #fff;
}

.menu-count {
  margin-left: auto;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.menu-item.active .menu-count {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.file-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.file-list.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.file-list.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

/* 网格视图卡片 */
.file-card {
  background: #f7f7f7;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-thumbnail {
  height: 120px;
  background: #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.file-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.file-icon.image { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.file-icon.document { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.file-icon.video { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.file-icon.audio { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.file-icon.other { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }

.file-info {
  padding: 12px;
}

.file-name {
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #999;
}

.file-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-card:hover .file-actions {
  opacity: 1;
}

.more-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
}

/* 列表视图 */
.file-list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f7f7f7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-list-item:hover {
  background: #e6e6e6;
}

.file-icon-small {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  margin-right: 12px;
}

.file-icon-small.image { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.file-icon-small.document { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.file-icon-small.video { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.file-icon-small.audio { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.file-icon-small.other { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }

.file-list-item .file-info {
  flex: 1;
  padding: 0;
}

.file-list-item .file-name {
  font-size: 14px;
  margin-bottom: 2px;
}

.file-list-item .file-meta {
  font-size: 12px;
}

.file-list-item .file-meta span {
  margin-right: 12px;
}

.file-list-item .file-actions {
  position: static;
  opacity: 1;
  display: flex;
  gap: 4px;
}

/* 批量操作栏 */
.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #e6f7ff;
  border-top: 1px solid #91d5ff;
}

.batch-btns {
  display: flex;
  gap: 8px;
}

/* 文件预览 */
.file-preview {
  text-align: center;
  padding: 20px;
}

.preview-placeholder {
  padding: 40px;
}

.preview-icon {
  font-size: 80px;
  color: #ddd;
  margin-bottom: 16px;
}
</style>
