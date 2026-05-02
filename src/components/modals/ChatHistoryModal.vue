<template>
  <a-modal
    :open="visible"
    :footer="null"
    :width="800"
    :body-style="{ padding: 0, height: '600px', overflow: 'hidden' }"
    class="chat-history-modal"
    @cancel="handleClose"
    @update:open="handleClose"
  >
    <div class="chat-history-container">
      <!-- 左侧菜单 -->
      <div class="history-sidebar">
        <div class="sidebar-header">
          <h3>聊天记录</h3>
        </div>
        
        <div class="sidebar-menu">
          <div 
            class="menu-item"
            :class="{ active: activeTab === 'stats' }"
            @click="activeTab = 'stats'"
          >
            <PieChartOutlined />
            <span>统计概览</span>
          </div>
          <div 
            class="menu-item"
            :class="{ active: activeTab === 'sessions' }"
            @click="activeTab = 'sessions'"
          >
            <MessageOutlined />
            <span>会话管理</span>
          </div>
          <div 
            class="menu-item"
            :class="{ active: activeTab === 'backup' }"
            @click="activeTab = 'backup'"
          >
            <CloudOutlined />
            <span>备份与恢复</span>
          </div>
          <div 
            class="menu-item"
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            <SettingOutlined />
            <span>自动清理</span>
          </div>
        </div>
      </div>
      
      <!-- 右侧内容 -->
      <div class="history-content">
        <!-- 统计概览 -->
        <div v-if="activeTab === 'stats'" class="content-section">
          <h4>统计概览</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon blue">
                <MessageOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ chatStats.totalMessages }}</div>
                <div class="stat-label">总消息数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green">
                <TeamOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ chatStats.totalSessions }}</div>
                <div class="stat-label">会话数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon orange">
                <FileOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ chatStats.totalFiles }}</div>
                <div class="stat-label">文件数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon purple">
                <DatabaseOutlined />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ chatStats.storageSize }}</div>
                <div class="stat-label">占用空间</div>
              </div>
            </div>
          </div>
          
          <div class="chart-section">
            <h5>消息趋势（近7天）</h5>
            <div class="chart-placeholder">
              <div v-for="(day, index) in messageTrend" :key="index" class="chart-bar">
                <div class="bar" :style="{ height: day.count + '%' }"></div>
                <span class="bar-label">{{ day.date }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 会话管理 -->
        <div v-if="activeTab === 'sessions'" class="content-section">
          <div class="section-header">
            <h4>会话列表</h4>
            <a-input-search
              v-model:value="searchText"
              placeholder="搜索会话"
              style="width: 200px"
              size="small"
            />
          </div>
          
          <div class="session-list">
            <div v-for="session in filteredSessions" :key="session.id" class="session-item">
              <a-avatar :size="40" :src="session.avatar">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <div class="session-info">
                <div class="session-name">{{ session.name }}</div>
                <div class="session-meta">
                  <span>{{ session.messageCount }} 条消息</span>
                  <span>·</span>
                  <span>{{ session.lastTime }}</span>
                </div>
              </div>
              <div class="session-size">{{ session.size }}</div>
              <div class="session-actions">
                <a-button type="text" size="small" @click="handleExportSession(session)">
                  <ExportOutlined />
                </a-button>
                <a-button type="text" size="small" danger @click="handleClearSession(session)">
                  <DeleteOutlined />
                </a-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 备份与恢复 -->
        <div v-if="activeTab === 'backup'" class="content-section">
          <h4>备份与恢复</h4>
          
          <div class="backup-actions">
            <div class="action-card" @click="handleExportAll">
              <div class="action-icon">
                <ExportOutlined />
              </div>
              <div class="action-title">导出全部记录</div>
              <div class="action-desc">将所有聊天记录导出为备份文件</div>
            </div>
            
            <div class="action-card" @click="handleImport">
              <div class="action-icon">
                <ImportOutlined />
              </div>
              <div class="action-title">导入记录</div>
              <div class="action-desc">从备份文件恢复聊天记录</div>
            </div>
            
            <div class="action-card" @click="handleMigrate">
              <div class="action-icon">
                <SwapOutlined />
              </div>
              <div class="action-title">迁移记录</div>
              <div class="action-desc">将记录迁移到其他设备</div>
            </div>
          </div>
          
          <div class="backup-history">
            <h5>备份历史</h5>
            <a-empty v-if="backupHistory.length === 0" description="暂无备份记录" />
            <div v-else class="history-list">
              <div v-for="(item, index) in backupHistory" :key="index" class="history-item">
                <FileTextOutlined class="history-icon" />
                <div class="history-info">
                  <div class="history-name">{{ item.name }}</div>
                  <div class="history-time">{{ item.time }} · {{ item.size }}</div>
                </div>
                <a-button type="link" size="small" @click="handleRestore(item)">恢复</a-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 自动清理 -->
        <div v-if="activeTab === 'settings'" class="content-section">
          <h4>自动清理设置</h4>
          
          <div class="setting-list">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-title">自动清理聊天记录</span>
                <span class="setting-desc">自动删除超过指定时间的聊天记录</span>
              </div>
              <a-switch v-model:checked="autoSettings.autoCleanEnabled" />
            </div>
            
            <div v-if="autoSettings.autoCleanEnabled" class="setting-item">
              <div class="setting-info">
                <span class="setting-title">保留时长</span>
                <span class="setting-desc">超过此时间的记录将被自动删除</span>
              </div>
              <a-select v-model:value="autoSettings.keepDays" style="width: 120px" size="small">
                <a-select-option :value="7">7天</a-select-option>
                <a-select-option :value="30">30天</a-select-option>
                <a-select-option :value="90">90天</a-select-option>
                <a-select-option :value="180">半年</a-select-option>
                <a-select-option :value="365">一年</a-select-option>
              </a-select>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-title">清理媒体文件</span>
                <span class="setting-desc">自动清理过期的图片、视频等</span>
              </div>
              <a-switch v-model:checked="autoSettings.cleanMediaEnabled" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-title">清理缓存文件</span>
                <span class="setting-desc">定期清理临时缓存文件</span>
              </div>
              <a-switch v-model:checked="autoSettings.cleanCacheEnabled" />
            </div>
          </div>
          
          <div class="danger-zone">
            <h5>危险操作</h5>
            <a-button type="primary" danger block @click="handleClearAll">
              <DeleteOutlined />
              清空所有聊天记录
            </a-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 导出进度弹窗 -->
    <a-modal
      :open="exportVisible"
      title="导出进度"
      :footer="null"
      :closable="false"
      :width="400"
      @update:open="exportVisible = $event"
    >
      <div class="export-progress">
        <a-progress :percent="exportProgress" status="active" />
        <p>正在导出聊天记录...</p>
      </div>
    </a-modal>
    
    <!-- 清空确认弹窗 -->
    <a-modal
      :open="clearConfirmVisible"
      title="确认清空"
      :width="400"
      @cancel="clearConfirmVisible = false"
      @ok="confirmClear"
      @update:open="clearConfirmVisible = $event"
    >
      <a-alert type="warning" show-icon message="此操作不可恢复" />
      <p style="margin-top: 16px;">确定要清空所有聊天记录吗？</p>
    </a-modal>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import {
  PieChartOutlined,
  MessageOutlined,
  CloudOutlined,
  SettingOutlined,
  TeamOutlined,
  FileOutlined,
  DatabaseOutlined,
  UserOutlined,
  ExportOutlined,
  ImportOutlined,
  SwapOutlined,
  DeleteOutlined,
  FileTextOutlined,
  SearchOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const activeTab = ref('stats');
const searchText = ref('');
const exportVisible = ref(false);
const exportProgress = ref(0);
const clearConfirmVisible = ref(false);

// 统计数据
const chatStats = reactive({
  totalMessages: '12,580',
  totalSessions: 48,
  totalFiles: '1,234',
  storageSize: '256 MB'
});

// 消息趋势
const messageTrend = ref([
  { date: '周一', count: 30 },
  { date: '周二', count: 45 },
  { date: '周三', count: 60 },
  { date: '周四', count: 40 },
  { date: '周五', count: 80 },
  { date: '周六', count: 55 },
  { date: '周日', count: 35 }
]);

// 会话列表
const chatSessions = ref([
  { id: '1', name: '张三', avatar: '', messageCount: 1250, lastTime: '2小时前', size: '15 MB' },
  { id: '2', name: '李四', avatar: '', messageCount: 890, lastTime: '昨天', size: '8 MB' },
  { id: '3', name: '工作群', avatar: '', messageCount: 3200, lastTime: '3分钟前', size: '45 MB' },
  { id: '4', name: '家人群', avatar: '', messageCount: 560, lastTime: '上周', size: '12 MB' },
  { id: '5', name: '王五', avatar: '', messageCount: 430, lastTime: '2天前', size: '5 MB' },
  { id: '6', name: '技术交流群', avatar: '', messageCount: 2100, lastTime: '1小时前', size: '28 MB' }
]);

// 备份历史
const backupHistory = ref([
  { name: '聊天记录备份_20250401.zip', time: '2025-04-01 10:30', size: '120 MB' },
  { name: '聊天记录备份_20250315.zip', time: '2025-03-15 14:20', size: '98 MB' }
]);

// 自动清理设置
const autoSettings = reactive({
  autoCleanEnabled: false,
  keepDays: 30,
  cleanMediaEnabled: true,
  cleanCacheEnabled: true
});

// 过滤后的会话
const filteredSessions = computed(() => {
  if (!searchText.value) return chatSessions.value;
  return chatSessions.value.filter(s => 
    s.name.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

const handleClose = () => {
  emit('update:visible', false);
};

const handleExportSession = (session: any) => {
  message.success(`正在导出「${session.name}」的聊天记录`);
};

const handleClearSession = (session: any) => {
  const index = chatSessions.value.findIndex(s => s.id === session.id);
  if (index !== -1) {
    chatSessions.value.splice(index, 1);
    chatStats.totalSessions--;
    message.success(`已清空「${session.name}」的聊天记录`);
  }
};

const handleExportAll = () => {
  exportVisible.value = true;
  exportProgress.value = 0;
  
  const timer = setInterval(() => {
    exportProgress.value += 10;
    if (exportProgress.value >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        exportVisible.value = false;
        message.success('聊天记录导出成功');
      }, 500);
    }
  }, 200);
};

const handleImport = () => {
  message.info('请选择要导入的备份文件');
};

const handleMigrate = () => {
  message.info('迁移功能开发中');
};

const handleRestore = (item: any) => {
  message.success(`正在恢复：${item.name}`);
};

const handleClearAll = () => {
  clearConfirmVisible.value = true;
};

const confirmClear = () => {
  clearConfirmVisible.value = false;
  chatSessions.value = [];
  chatStats.totalMessages = '0';
  chatStats.totalSessions = 0;
  chatStats.totalFiles = '0';
  chatStats.storageSize = '0 MB';
  message.success('所有聊天记录已清空');
};
</script>

<style scoped>
.chat-history-container {
  display: flex;
  height: 100%;
}

.history-sidebar {
  width: 180px;
  background: #f7f7f7;
  border-right: 1px solid #e0e0e0;
  padding: 20px 0;
}

.sidebar-header {
  padding: 0 20px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.sidebar-menu {
  padding: 12px;
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

.history-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.content-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #333;
}

/* 统计概览 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f7f7f7;
  border-radius: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-icon.orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.purple { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

/* 图表 */
.chart-section {
  background: #f7f7f7;
  border-radius: 12px;
  padding: 20px;
}

.chart-section h5 {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 16px 0;
  color: #666;
}

.chart-placeholder {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 120px;
  padding: 0 20px;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 32px;
  background: linear-gradient(to top, #07c160, #10b981);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: all 0.3s;
}

.bar-label {
  font-size: 12px;
  color: #999;
}

/* 会话列表 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f7f7f7;
  border-radius: 8px;
  transition: all 0.2s;
}

.session-item:hover {
  background: #e6e6e6;
}

.session-info {
  flex: 1;
  margin-left: 12px;
}

.session-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.session-meta {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.session-meta span {
  margin-right: 4px;
}

.session-size {
  font-size: 12px;
  color: #999;
  margin-right: 12px;
}

.session-actions {
  display: flex;
  gap: 4px;
}

/* 备份操作 */
.backup-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.action-card {
  text-align: center;
  padding: 24px 16px;
  background: #f7f7f7;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  background: #e6e6e6;
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #07c160;
  margin: 0 auto 12px;
}

.action-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 12px;
  color: #999;
}

/* 备份历史 */
.backup-history h5 {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: #666;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f7f7f7;
  border-radius: 8px;
}

.history-icon {
  font-size: 24px;
  color: #999;
  margin-right: 12px;
}

.history-info {
  flex: 1;
}

.history-name {
  font-size: 14px;
  color: #333;
}

.history-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* 设置 */
.setting-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f7f7f7;
  border-radius: 8px;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.setting-desc {
  font-size: 12px;
  color: #999;
}

.danger-zone {
  padding: 20px;
  background: #fff2f0;
  border-radius: 8px;
  border: 1px solid #ffccc7;
}

.danger-zone h5 {
  font-size: 14px;
  font-weight: 500;
  color: #ff4d4f;
  margin: 0 0 12px 0;
}

/* 导出进度 */
.export-progress {
  text-align: center;
  padding: 20px;
}

.export-progress p {
  margin-top: 16px;
  color: #666;
}
</style>
