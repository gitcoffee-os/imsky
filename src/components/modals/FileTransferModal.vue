<template>
  <a-modal
    :open="visible"
    :footer="null"
    :width="850"
    :body-style="{ padding: 0, height: '620px', overflow: 'hidden' }"
    class="file-transfer-modal"
    @cancel="handleClose"
    @update:open="handleClose"
  >
    <div class="file-transfer-container">
      <!-- 左侧会话列表 -->
      <div class="transfer-sidebar">
        <div class="sidebar-header">
          <h3>文件传输助手</h3>
          <a-button type="text" size="small" @click="handleNewTransfer">
            <PlusOutlined />
          </a-button>
        </div>
        
        <div class="transfer-tabs">
          <div 
            class="tab-item"
            :class="{ active: activeTab === 'sending' }"
            @click="activeTab = 'sending'"
          >
            <UploadOutlined />
            <span>发送中</span>
            <a-badge v-if="sendingCount > 0" :count="sendingCount" class="tab-badge" />
          </div>
          <div 
            class="tab-item"
            :class="{ active: activeTab === 'receiving' }"
            @click="activeTab = 'receiving'"
          >
            <DownloadOutlined />
            <span>接收中</span>
            <a-badge v-if="receivingCount > 0" :count="receivingCount" class="tab-badge" />
          </div>
          <div 
            class="tab-item"
            :class="{ active: activeTab === 'completed' }"
            @click="activeTab = 'completed'"
          >
            <CheckCircleOutlined />
            <span>已完成</span>
          </div>
        </div>
        
        <div class="device-list">
          <div class="device-section-title">我的设备</div>
          <div 
            v-for="device in devices" 
            :key="device.id"
            class="device-item"
            :class="{ active: selectedDevice?.id === device.id, online: device.online }"
            @click="selectDevice(device)"
          >
            <div class="device-icon">
              <DesktopOutlined v-if="device.type === 'pc'" />
              <MobileOutlined v-else-if="device.type === 'mobile'" />
              <TabletOutlined v-else-if="device.type === 'tablet'" />
              <LaptopOutlined v-else />
            </div>
            <div class="device-info">
              <div class="device-name">{{ device.name }}</div>
              <div class="device-status">{{ device.online ? '在线' : '离线' }}</div>
            </div>
            <div v-if="device.unread > 0" class="device-unread">{{ device.unread }}</div>
          </div>
        </div>
        
        <div class="sidebar-footer">
          <a-button type="link" block @click="handleOpenChatFile">
            <FolderOpenOutlined />
            打开聊天文件
          </a-button>
        </div>
      </div>
      
      <!-- 右侧传输内容 -->
      <div class="transfer-content">
        <!-- 设备信息栏 -->
        <div v-if="selectedDevice" class="device-header">
          <div class="device-header-info">
            <div class="device-header-icon">
              <DesktopOutlined v-if="selectedDevice.type === 'pc'" />
              <MobileOutlined v-else-if="selectedDevice.type === 'mobile'" />
              <TabletOutlined v-else-if="selectedDevice.type === 'tablet'" />
              <LaptopOutlined v-else />
            </div>
            <div>
              <div class="device-header-name">{{ selectedDevice.name }}</div>
              <div class="device-header-status">
                <span class="status-dot" :class="{ online: selectedDevice.online }"></span>
                {{ selectedDevice.online ? '在线' : '离线' }}
              </div>
            </div>
          </div>
          <div class="device-header-actions">
            <a-button type="primary" size="small" @click="handleSendFile">
              <UploadOutlined />
              发送文件
            </a-button>
            <a-button size="small" @click="handleSendFolder">
              <FolderOpenOutlined />
              发送文件夹
            </a-button>
          </div>
        </div>
        
        <!-- 传输列表 -->
        <div class="transfer-list">
          <div v-if="filteredTransfers.length === 0" class="empty-state">
            <InboxOutlined class="empty-icon" />
            <p>{{ emptyText }}</p>
            <a-button v-if="activeTab === 'sending' || activeTab === 'receiving'" type="primary" @click="handleNewTransfer">
              开始传输
            </a-button>
          </div>
          
          <div v-else class="transfer-items">
            <div 
              v-for="transfer in filteredTransfers" 
              :key="transfer.id"
              class="transfer-item"
              :class="{ failed: transfer.status === 'failed', paused: transfer.status === 'paused' }"
            >
              <div class="transfer-icon" :class="transfer.type">
                <PictureOutlined v-if="transfer.type === 'image'" />
                <FileTextOutlined v-else-if="transfer.type === 'document'" />
                <VideoCameraOutlined v-else-if="transfer.type === 'video'" />
                <FolderOutlined v-else-if="transfer.type === 'folder'" />
                <FileOutlined v-else />
              </div>
              
              <div class="transfer-info">
                <div class="transfer-name">{{ transfer.name }}</div>
                <div class="transfer-meta">
                  <span>{{ transfer.size }}</span>
                  <span>·</span>
                  <span>{{ transfer.deviceName }}</span>
                  <span v-if="transfer.status === 'completed'">· {{ transfer.time }}</span>
                </div>
                
                <!-- 进度条 -->
                <div v-if="transfer.status === 'sending' || transfer.status === 'receiving' || transfer.status === 'paused'" class="transfer-progress">
                  <a-progress 
                    :percent="transfer.progress" 
                    :status="transfer.status === 'paused' ? 'normal' : 'active'"
                    :show-info="false"
                    size="small"
                  />
                  <div class="progress-info">
                    <span>{{ transfer.speed }}</span>
                    <span>{{ transfer.progress }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="transfer-actions">
                <!-- 发送/接收中/暂停 -->
                <template v-if="transfer.status === 'sending' || transfer.status === 'receiving' || transfer.status === 'paused'">
                  <a-button 
                    v-if="transfer.status === 'paused'" 
                    type="text" 
                    size="small"
                    @click="handleResume(transfer)"
                  >
                    <PlayCircleOutlined />
                  </a-button>
                  <a-button 
                    v-else 
                    type="text" 
                    size="small"
                    @click="handlePause(transfer)"
                  >
                    <PauseCircleOutlined />
                  </a-button>
                  <a-button type="text" size="small" danger @click="handleCancel(transfer)">
                    <CloseCircleOutlined />
                  </a-button>
                </template>
                
                <!-- 已完成 -->
                <template v-else-if="transfer.status === 'completed'">
                  <a-button type="text" size="small" @click="handleOpen(transfer)">
                    <FolderOpenOutlined />
                  </a-button>
                  <a-dropdown>
                    <MoreOutlined class="more-btn" />
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="open" @click="handleOpen(transfer)">打开文件</a-menu-item>
                        <a-menu-item key="openFolder" @click="handleOpenFolder(transfer)">打开所在文件夹</a-menu-item>
                        <a-menu-item key="delete" danger @click="handleDelete(transfer)">删除记录</a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </template>
                
                <!-- 失败 -->
                <template v-else-if="transfer.status === 'failed'">
                  <a-button type="text" size="small" @click="handleRetry(transfer)">
                    <RedoOutlined />
                  </a-button>
                  <a-button type="text" size="small" danger @click="handleDelete(transfer)">
                    <DeleteOutlined />
                  </a-button>
                </template>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 底部统计 -->
        <div class="transfer-footer">
          <div class="footer-stats">
            <span>今日发送: {{ todayStats.sent }}</span>
            <span>今日接收: {{ todayStats.received }}</span>
          </div>
          <a-button type="link" size="small" @click="handleClearCompleted">
            清空已完成
          </a-button>
        </div>
      </div>
    </div>
    
    <!-- 发送文件弹窗 -->
    <a-modal
      :open="sendModalVisible"
      title="发送文件"
      :width="500"
      @cancel="sendModalVisible = false"
      @ok="confirmSend"
      @update:open="sendModalVisible = $event"
    >
      <div class="send-file-content">
        <a-form layout="vertical">
          <a-form-item label="选择设备">
            <a-select v-model:value="selectedTargetDevice" placeholder="选择目标设备">
              <a-select-option v-for="device in onlineDevices" :key="device.id" :value="device.id">
                {{ device.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="选择文件">
            <a-upload-dragger
              v-model:fileList="fileList"
              :multiple="true"
              :before-upload="beforeUpload"
            >
              <p class="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p class="ant-upload-text">点击或拖拽文件到此处上传</p>
              <p class="ant-upload-hint">支持单个或批量上传</p>
            </a-upload-dragger>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import {
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  LaptopOutlined,
  FolderOpenOutlined,
  InboxOutlined,
  PictureOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  FolderOutlined,
  FileOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  RedoOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const activeTab = ref('sending');
const selectedDevice = ref<any>(null);
const sendModalVisible = ref(false);
const selectedTargetDevice = ref<string>('');
const fileList = ref<any[]>([]);

// 设备列表
const devices = ref([
  { id: '1', name: '我的电脑', type: 'pc', online: true, unread: 2 },
  { id: '2', name: 'iPhone 15', type: 'mobile', online: true, unread: 0 },
  { id: '3', name: 'iPad Pro', type: 'tablet', online: false, unread: 0 },
  { id: '4', name: 'MacBook Pro', type: 'laptop', online: true, unread: 1 }
]);

// 传输记录
const transfers = ref([
  { id: '1', name: '项目资料.zip', type: 'folder', size: '156 MB', deviceName: '我的电脑', status: 'sending', progress: 65, speed: '2.5 MB/s', time: '' },
  { id: '2', name: '产品设计图.psd', type: 'image', size: '45 MB', deviceName: 'iPhone 15', status: 'receiving', progress: 30, speed: '1.2 MB/s', time: '' },
  { id: '3', name: '会议录音.mp3', type: 'audio', size: '12 MB', deviceName: 'MacBook Pro', status: 'completed', progress: 100, speed: '', time: '10:30' },
  { id: '4', name: '演示视频.mp4', type: 'video', size: '280 MB', deviceName: 'iPad Pro', status: 'failed', progress: 45, speed: '', time: '' },
  { id: '5', name: '合同文档.pdf', type: 'document', size: '2.5 MB', deviceName: '我的电脑', status: 'completed', progress: 100, speed: '', time: '昨天' },
  { id: '6', name: '照片合集.zip', type: 'folder', size: '1.2 GB', deviceName: 'iPhone 15', status: 'paused', progress: 78, speed: '', time: '' }
]);

// 今日统计
const todayStats = reactive({
  sent: '1.5 GB',
  received: '856 MB'
});

// 在线设备
const onlineDevices = computed(() => devices.value.filter(d => d.online));

// 发送中数量
const sendingCount = computed(() => transfers.value.filter(t => t.status === 'sending' || t.status === 'paused').length);

// 接收中数量
const receivingCount = computed(() => transfers.value.filter(t => t.status === 'receiving').length);

// 过滤后的传输列表
const filteredTransfers = computed(() => {
  let list = transfers.value;
  
  // 按标签筛选
  switch (activeTab.value) {
    case 'sending':
      list = list.filter(t => t.status === 'sending' || t.status === 'paused');
      break;
    case 'receiving':
      list = list.filter(t => t.status === 'receiving');
      break;
    case 'completed':
      list = list.filter(t => t.status === 'completed' || t.status === 'failed');
      break;
  }
  
  // 按设备筛选
  if (selectedDevice.value) {
    list = list.filter(t => t.deviceName === selectedDevice.value.name);
  }
  
  return list;
});

// 空状态文本
const emptyText = computed(() => {
  switch (activeTab.value) {
    case 'sending':
      return '暂无发送中的文件';
    case 'receiving':
      return '暂无接收中的文件';
    case 'completed':
      return '暂无已完成记录';
    default:
      return '暂无传输记录';
  }
});

const handleClose = () => {
  emit('update:visible', false);
};

const selectDevice = (device: any) => {
  selectedDevice.value = device;
};

const handleNewTransfer = () => {
  sendModalVisible.value = true;
};

const handleSendFile = () => {
  sendModalVisible.value = true;
};

const handleSendFolder = () => {
  message.info('发送文件夹功能开发中');
};

const handlePause = (transfer: any) => {
  transfer.status = 'paused';
  message.success('传输已暂停');
};

const handleResume = (transfer: any) => {
  transfer.status = transfer.id % 2 === 0 ? 'receiving' : 'sending';
  message.success('传输已恢复');
};

const handleCancel = (transfer: any) => {
  const index = transfers.value.findIndex(t => t.id === transfer.id);
  if (index !== -1) {
    transfers.value.splice(index, 1);
    message.success('传输已取消');
  }
};

const handleRetry = (transfer: any) => {
  transfer.status = transfer.id % 2 === 0 ? 'receiving' : 'sending';
  transfer.progress = 0;
  message.success('开始重试');
};

const handleOpen = (transfer: any) => {
  message.success(`打开文件: ${transfer.name}`);
};

const handleOpenFolder = (transfer: any) => {
  message.success('打开所在文件夹');
};

const handleDelete = (transfer: any) => {
  const index = transfers.value.findIndex(t => t.id === transfer.id);
  if (index !== -1) {
    transfers.value.splice(index, 1);
    message.success('记录已删除');
  }
};

const handleClearCompleted = () => {
  transfers.value = transfers.value.filter(t => t.status !== 'completed');
  message.success('已完成记录已清空');
};

const handleOpenChatFile = () => {
  message.info('打开聊天文件');
  handleClose();
};

const beforeUpload = () => {
  return false;
};

const confirmSend = () => {
  if (!selectedTargetDevice.value) {
    message.warning('请选择目标设备');
    return;
  }
  if (fileList.value.length === 0) {
    message.warning('请选择要发送的文件');
    return;
  }
  
  const device = devices.value.find(d => d.id === selectedTargetDevice.value);
  fileList.value.forEach((file, index) => {
    transfers.value.unshift({
      id: String(Date.now() + index),
      name: file.name,
      type: getFileType(file.name),
      size: formatFileSize(file.size),
      deviceName: device?.name || '未知设备',
      status: 'sending',
      progress: 0,
      speed: '0 KB/s',
      time: ''
    });
  });
  
  sendModalVisible.value = false;
  fileList.value = [];
  selectedTargetDevice.value = '';
  activeTab.value = 'sending';
  message.success('文件开始发送');
};

const getFileType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) return 'audio';
  if (['doc', 'docx', 'pdf', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'document';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'folder';
  return 'other';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.file-transfer-container {
  display: flex;
  height: 100%;
}

.transfer-sidebar {
  width: 240px;
  background: #f7f7f7;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.transfer-tabs {
  display: flex;
  padding: 12px;
  gap: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  transition: all 0.2s;
  position: relative;
}

.tab-item:hover {
  background: #e6e6e6;
}

.tab-item.active {
  background: #07c160;
  color: #fff;
}

.tab-badge {
  position: absolute;
  top: 4px;
  right: 4px;
}

.device-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.device-section-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  padding: 0 8px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
  position: relative;
}

.device-item:hover {
  background: #e6e6e6;
}

.device-item.active {
  background: #07c160;
  color: #fff;
}

.device-item.online .device-status {
  color: #07c160;
}

.device-item.active.online .device-status {
  color: rgba(255, 255, 255, 0.8);
}

.device-icon {
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #666;
}

.device-item.active .device-icon {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 14px;
  font-weight: 500;
}

.device-status {
  font-size: 12px;
  color: #999;
}

.device-unread {
  width: 18px;
  height: 18px;
  background: #ff4d4f;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e0e0e0;
}

.transfer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.device-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-header-icon {
  width: 48px;
  height: 48px;
  background: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #666;
}

.device-header-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.device-header-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #999;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
}

.status-dot.online {
  background: #07c160;
}

.device-header-actions {
  display: flex;
  gap: 8px;
}

.transfer-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
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

.empty-state p {
  margin-bottom: 16px;
}

.transfer-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transfer-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f7f7f7;
  border-radius: 12px;
  transition: all 0.2s;
}

.transfer-item:hover {
  background: #f0f0f0;
}

.transfer-item.failed {
  background: #fff2f0;
}

.transfer-item.paused {
  background: #fffbe6;
}

.transfer-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  flex-shrink: 0;
}

.transfer-icon.image { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.transfer-icon.document { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.transfer-icon.video { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.transfer-icon.audio { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.transfer-icon.folder { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.transfer-icon.other { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }

.transfer-info {
  flex: 1;
  min-width: 0;
}

.transfer-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transfer-meta {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.transfer-meta span {
  margin-right: 6px;
}

.transfer-progress {
  margin-top: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.transfer-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.more-btn {
  cursor: pointer;
  color: #999;
}

.transfer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
}

.footer-stats {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #666;
}

.send-file-content {
  padding: 16px 0;
}

.send-file-content .ant-upload-drag {
  padding: 32px;
}

.send-file-content .ant-upload-drag-icon {
  font-size: 48px;
  color: #07c160;
  margin-bottom: 16px;
}

.send-file-content .ant-upload-text {
  font-size: 14px;
  margin-bottom: 8px;
}

.send-file-content .ant-upload-hint {
  font-size: 12px;
  color: #999;
}
</style>
