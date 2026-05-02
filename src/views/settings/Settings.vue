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
  <div class="settings">
    <div class="settings-sidebar">
      <div class="settings-header">
        <h2>设置</h2>
      </div>
      <div class="settings-menu">
        <div
          v-for="item in menuItems"
          :key="item.key"
          class="menu-item"
          :class="{ active: activeKey === item.key }"
          @click="activeKey = item.key"
        >
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
    
    <div class="settings-content">
      <!-- 通用设置 -->
      <div v-if="activeKey === 'general'" class="settings-section">
        <h3>通用设置</h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">主题</span>
            <span class="setting-desc">选择您喜欢的界面主题</span>
          </div>
          <a-radio-group v-model:value="settings.theme" @change="handleThemeChange">
            <a-radio-button value="light">浅色</a-radio-button>
            <a-radio-button value="dark">深色</a-radio-button>
            <a-radio-button value="auto">跟随系统</a-radio-button>
          </a-radio-group>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">语言</span>
            <span class="setting-desc">选择界面显示语言</span>
          </div>
          <a-select v-model:value="settings.language" style="width: 120px" @change="handleLanguageChange">
            <a-select-option value="zh">简体中文</a-select-option>
            <a-select-option value="en">English</a-select-option>
          </a-select>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">字体大小</span>
            <span class="setting-desc">调整界面字体大小</span>
          </div>
          <a-slider v-model:value="settings.fontSize" :min="12" :max="18" style="width: 200px" @change="handleFontSizeChange" />
        </div>
      </div>
      
      <!-- 通知设置 -->
      <div v-if="activeKey === 'notification'" class="settings-section">
        <h3>通知设置</h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">消息通知</span>
            <span class="setting-desc">接收新消息时显示通知</span>
          </div>
          <a-switch v-model:checked="settings.notificationEnabled" @change="handleNotificationChange" />
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">声音提醒</span>
            <span class="setting-desc">接收新消息时播放声音</span>
          </div>
          <a-switch v-model:checked="settings.soundEnabled" @change="handleSoundChange" />
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">桌面通知</span>
            <span class="setting-desc">在桌面右下角显示消息通知</span>
          </div>
          <a-switch v-model:checked="settings.desktopNotification" @change="handleDesktopNotificationChange" />
        </div>
      </div>
      
      <!-- 界面设置 -->
      <div v-if="activeKey === 'interface'" class="settings-section">
        <h3>界面设置</h3>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">模块打开方式</span>
            <span class="setting-desc">选择收藏、文件传输等模块的打开方式</span>
          </div>
          <a-radio-group v-model:value="settings.moduleOpenMode" @change="handleModuleOpenModeChange">
            <a-radio-button value="page">页面打开</a-radio-button>
            <a-radio-button value="modal">弹窗打开</a-radio-button>
          </a-radio-group>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">显示水印</span>
            <span class="setting-desc">在界面显示 Logo 水印，防止信息泄露</span>
          </div>
          <a-switch v-model:checked="settings.watermarkEnabled" @change="handleWatermarkChange" />
        </div>

        <!-- 首页模块显示控制 -->
        <div class="setting-item module-visibility-section">
          <div class="setting-info">
            <span class="setting-label">首页模块显示</span>
            <span class="setting-desc">选择要在左侧导航栏显示的模块（通讯录之后的模块）</span>
          </div>
        </div>

        <div class="module-list">
          <div class="module-item">
            <div class="module-info">
              <StarOutlined class="module-icon" style="color: #faad14;" />
              <span class="module-name">收藏</span>
            </div>
            <a-switch v-model:checked="settings.showModules.favorite" @change="handleModuleVisibilityChange" />
          </div>

          <div class="module-item">
            <div class="module-info">
              <CameraOutlined class="module-icon" style="color: #07c160;" />
              <span class="module-name">动态</span>
            </div>
            <a-switch v-model:checked="settings.showModules.moments" @change="handleModuleVisibilityChange" />
          </div>

          <div class="module-item">
            <div class="module-info">
              <CompassOutlined class="module-icon" style="color: #1890ff;" />
              <span class="module-name">发现</span>
            </div>
            <a-switch v-model:checked="settings.showModules.discover" @change="handleModuleVisibilityChange" />
          </div>

          <div class="module-item">
            <div class="module-info">
              <SearchOutlined class="module-icon" style="color: #722ed1;" />
              <span class="module-name">搜索</span>
            </div>
            <a-switch v-model:checked="settings.showModules.search" @change="handleModuleVisibilityChange" />
          </div>

          <div class="module-item">
            <div class="module-info">
              <AppstoreOutlined class="module-icon" style="color: #52c41a;" />
              <span class="module-name">小应用</span>
            </div>
            <a-switch v-model:checked="settings.showModules.miniapp" @change="handleModuleVisibilityChange" />
          </div>

          <div class="module-item">
            <div class="module-info">
              <RobotOutlined class="module-icon" style="color: #1677ff;" />
              <span class="module-name">AI 助手</span>
            </div>
            <a-switch v-model:checked="settings.showModules.ai" @change="handleModuleVisibilityChange" />
          </div>

          <div class="module-item">
            <div class="module-info">
              <svg class="module-icon" viewBox="0 0 24 24" width="18" height="18" fill="#ff6b6b">
                <path d="M12 2C10.5 2 9.2 2.7 8.4 3.8C7.6 4.9 7.4 6.3 7.9 7.6C6.7 8.1 5.7 9 5.1 10.2C4.5 11.4 4.4 12.7 4.8 14C3.5 14.4 2.5 15.4 2.1 16.7C1.7 18 2 19.4 2.9 20.4C3.8 21.4 5.2 21.9 6.6 21.6C7.3 22.5 8.4 23 9.5 23C10.6 23 11.7 22.5 12.4 21.6C13.8 21.9 15.2 21.4 16.1 20.4C17 19.4 17.3 18 16.9 16.7C16.5 15.4 15.5 14.4 14.2 14C14.6 12.7 14.5 11.4 13.9 10.2C13.3 9 12.3 8.1 11.1 7.6C11.6 6.3 11.4 4.9 10.6 3.8C9.8 2.7 8.5 2 7 2H12Z"/>
              </svg>
              <span class="module-name">Claw</span>
            </div>
            <a-switch v-model:checked="settings.showModules.claw" @change="handleModuleVisibilityChange" />
          </div>
        </div>
      </div>
      
      <!-- 意见反馈 -->
      <div v-if="activeKey === 'feedback'" class="settings-section">
        <h3>意见反馈</h3>
        
        <div class="feedback-form">
          <a-form layout="vertical">
            <a-form-item label="反馈类型">
              <a-radio-group v-model:value="feedback.type">
                <a-radio value="bug">功能异常</a-radio>
                <a-radio value="feature">功能建议</a-radio>
                <a-radio value="experience">体验问题</a-radio>
                <a-radio value="other">其他</a-radio>
              </a-radio-group>
            </a-form-item>
            
            <a-form-item label="反馈内容">
              <a-textarea
                v-model:value="feedback.content"
                :rows="6"
                placeholder="请详细描述您遇到的问题或建议..."
                show-count
                :maxlength="500"
              />
            </a-form-item>
            
            <a-form-item label="联系方式（选填）">
              <a-input
                v-model:value="feedback.contact"
                placeholder="邮箱或手机号，方便我们联系您"
              />
            </a-form-item>
            
            <a-form-item>
              <a-button type="primary" size="large" block @click="handleSubmitFeedback">
                提交反馈
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
      
      <!-- 隐私设置 -->
      <div v-if="activeKey === 'privacy'" class="settings-section">
        <h3>隐私设置</h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">在线状态</span>
            <span class="setting-desc">允许其他人看到您的在线状态</span>
          </div>
          <a-switch v-model:checked="settings.showOnlineStatus" />
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">已读回执</span>
            <span class="setting-desc">发送消息已读回执给对方</span>
          </div>
          <a-switch v-model:checked="settings.readReceipt" />
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">通过手机号找到我</span>
            <span class="setting-desc">允许其他人通过手机号搜索到您</span>
          </div>
          <a-switch v-model:checked="settings.searchByPhone" />
        </div>
      </div>
      
      <!-- 聊天记录管理 -->
      <div v-if="activeKey === 'chatHistory'" class="settings-section">
        <h3>聊天记录管理</h3>
        
        <div class="chat-history-stats">
          <div class="stat-card">
            <div class="stat-value">{{ chatStats.totalMessages }}</div>
            <div class="stat-label">总消息数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ chatStats.totalSessions }}</div>
            <div class="stat-label">会话数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ chatStats.storageSize }}</div>
            <div class="stat-label">占用空间</div>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">自动清理聊天记录</span>
            <span class="setting-desc">自动删除超过指定时间的聊天记录</span>
          </div>
          <a-switch v-model:checked="settings.autoCleanEnabled" @change="handleAutoCleanChange" />
        </div>
        
        <div v-if="settings.autoCleanEnabled" class="setting-item">
          <div class="setting-info">
            <span class="setting-label">保留时长</span>
            <span class="setting-desc">超过此时间的聊天记录将被自动删除</span>
          </div>
          <a-select v-model:value="settings.keepDays" style="width: 150px" @change="handleKeepDaysChange">
            <a-select-option :value="7">7天</a-select-option>
            <a-select-option :value="30">30天</a-select-option>
            <a-select-option :value="90">90天</a-select-option>
            <a-select-option :value="180">半年</a-select-option>
            <a-select-option :value="365">一年</a-select-option>
          </a-select>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">清理图片和视频</span>
            <span class="setting-desc">自动清理过期的媒体文件以节省空间</span>
          </div>
          <a-switch v-model:checked="settings.cleanMediaEnabled" @change="handleCleanMediaChange" />
        </div>
        
        <div class="setting-divider"></div>
        
        <div class="chat-history-actions">
          <h4>手动管理</h4>
          
          <div class="action-list">
            <div class="action-item" @click="handleExportChat">
              <div class="action-icon">
                <ExportOutlined />
              </div>
              <div class="action-info">
                <span class="action-title">导出聊天记录</span>
                <span class="action-desc">将聊天记录导出为文件备份</span>
              </div>
              <RightOutlined class="action-arrow" />
            </div>
            
            <div class="action-item" @click="handleImportChat">
              <div class="action-icon">
                <ImportOutlined />
              </div>
              <div class="action-info">
                <span class="action-title">导入聊天记录</span>
                <span class="action-desc">从备份文件恢复聊天记录</span>
              </div>
              <RightOutlined class="action-arrow" />
            </div>
            
            <div class="action-item" @click="handleMigrateChat">
              <div class="action-icon">
                <SwapOutlined />
              </div>
              <div class="action-info">
                <span class="action-title">迁移聊天记录</span>
                <span class="action-desc">将记录迁移到其他设备</span>
              </div>
              <RightOutlined class="action-arrow" />
            </div>
            
            <div class="action-item danger" @click="handleClearAllChat">
              <div class="action-icon">
                <DeleteOutlined />
              </div>
              <div class="action-info">
                <span class="action-title">清空所有记录</span>
                <span class="action-desc">删除所有聊天记录（不可恢复）</span>
              </div>
              <RightOutlined class="action-arrow" />
            </div>
          </div>
        </div>
        
        <div class="setting-divider"></div>
        
        <div class="session-list-section">
          <h4>会话管理</h4>
          <div class="session-list">
            <div v-for="session in chatSessions" :key="session.id" class="session-item">
              <a-avatar :size="40" :src="session.avatar">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <div class="session-info">
                <span class="session-name">{{ session.name }}</span>
                <span class="session-count">{{ session.messageCount }} 条消息</span>
              </div>
              <div class="session-actions">
                <a-button type="text" size="small" @click="handleExportSession(session.id)">
                  <ExportOutlined />
                </a-button>
                <a-button type="text" size="small" danger @click="handleClearSession(session.id)">
                  <DeleteOutlined />
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 关于 -->
      <div v-if="activeKey === 'about'" class="settings-section">
        <h3>关于</h3>
        
        <div class="about-content">
          <div class="app-logo">
            <img src="/assets/logo.svg" alt="ImSky" />
          </div>
          <h2>ImSky 天信IM</h2>
          <p class="version">版本 {{ appVersion }}</p>
          <p class="description">高性能、高可用的企业级跨平台即时通讯解决方案</p>
          
          <div class="about-links">
            <a href="#" @click.prevent="openLink('privacy')">隐私政策</a>
            <a href="#" @click.prevent="openLink('terms')">服务条款</a>
            <a href="#" @click.prevent="openLink('help')">帮助中心</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 清空确认弹窗 -->
  <a-modal
    :open="clearConfirmVisible"
    title="确认清空"
    :width="400"
    @cancel="clearConfirmVisible = false"
    @ok="confirmClear"
  >
    <p>确定要清空所有聊天记录吗？此操作不可恢复。</p>
  </a-modal>
  
  <!-- 导出进度弹窗 -->
  <a-modal
    :open="exportProgressVisible"
    title="导出进度"
    :footer="null"
    :closable="false"
    :width="400"
  >
    <div class="export-progress">
      <a-progress :percent="exportProgress" status="active" />
      <p>正在导出聊天记录...</p>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  SettingOutlined,
  BellOutlined,
  SafetyOutlined,
  InfoCircleOutlined,
  DesktopOutlined,
  MessageOutlined,
  HistoryOutlined,
  ExportOutlined,
  ImportOutlined,
  SwapOutlined,
  DeleteOutlined,
  RightOutlined,
  UserOutlined,
  StarOutlined,
  CameraOutlined,
  CompassOutlined,
  SearchOutlined,
  AppstoreOutlined,
  RobotOutlined
} from '@ant-design/icons-vue';
import { useSettingsStore } from '../../stores';
import { APP_INFO } from '../../config/config';
import { message } from 'ant-design-vue';

const settingsStore = useSettingsStore();

const activeKey = ref('general');
const appVersion = APP_INFO.version;
const clearConfirmVisible = ref(false);
const exportProgressVisible = ref(false);
const exportProgress = ref(0);

const menuItems = [
  { key: 'general', label: '通用设置', icon: SettingOutlined },
  { key: 'notification', label: '通知设置', icon: BellOutlined },
  { key: 'interface', label: '界面设置', icon: DesktopOutlined },
  { key: 'privacy', label: '隐私设置', icon: SafetyOutlined },
  { key: 'chatHistory', label: '聊天记录', icon: HistoryOutlined },
  { key: 'feedback', label: '意见反馈', icon: MessageOutlined },
  { key: 'about', label: '关于', icon: InfoCircleOutlined }
];

// 聊天记录统计数据
const chatStats = reactive({
  totalMessages: '12,580',
  totalSessions: 48,
  storageSize: '256 MB'
});

// 会话列表
const chatSessions = ref([
  { id: '1', name: '张三', avatar: '', messageCount: 1250 },
  { id: '2', name: '李四', avatar: '', messageCount: 890 },
  { id: '3', name: '工作群', avatar: '', messageCount: 3200 },
  { id: '4', name: '家人群', avatar: '', messageCount: 560 },
  { id: '5', name: '王五', avatar: '', messageCount: 430 }
]);

const settings = reactive({
  theme: settingsStore.theme,
  language: settingsStore.language,
  fontSize: settingsStore.fontSize,
  notificationEnabled: settingsStore.notificationEnabled,
  soundEnabled: settingsStore.soundEnabled,
  desktopNotification: settingsStore.desktopNotification,
  showOnlineStatus: settingsStore.showOnlineStatus,
  readReceipt: settingsStore.readReceipt,
  searchByPhone: settingsStore.searchByPhone,
  moduleOpenMode: settingsStore.moduleOpenMode || 'page',
  watermarkEnabled: settingsStore.watermarkEnabled,
  watermarkText: settingsStore.watermarkText,
  autoCleanEnabled: false,
  keepDays: 30,
  cleanMediaEnabled: true,
  showModules: { ...settingsStore.showModules }
});

// 反馈表单
const feedback = reactive({
  type: 'bug',
  content: '',
  contact: ''
});

onMounted(() => {
  // 从 store 同步设置
  settings.theme = settingsStore.theme;
  settings.language = settingsStore.language;
  settings.fontSize = settingsStore.fontSize;
  settings.notificationEnabled = settingsStore.notificationEnabled;
  settings.soundEnabled = settingsStore.soundEnabled;
});

const handleThemeChange = () => {
  settingsStore.setTheme(settings.theme);
};

const handleLanguageChange = () => {
  settingsStore.setLanguage(settings.language);
};

const handleFontSizeChange = () => {
  settingsStore.setFontSize(settings.fontSize);
};

const handleNotificationChange = () => {
  settingsStore.toggleNotification();
};

const handleSoundChange = () => {
  settingsStore.toggleSound();
};

const handleDesktopNotificationChange = () => {
  settingsStore.setDesktopNotification(settings.desktopNotification);
};

const handleModuleOpenModeChange = () => {
  settingsStore.moduleOpenMode = settings.moduleOpenMode;
  settingsStore.saveSettings();
};

const handleWatermarkChange = () => {
  settingsStore.setWatermarkEnabled(settings.watermarkEnabled);
};

const handleWatermarkTextChange = () => {
  settingsStore.setWatermarkText(settings.watermarkText);
};

// 模块显示控制
const handleModuleVisibilityChange = () => {
  settingsStore.showModules = { ...settings.showModules };
  settingsStore.saveSettings();
  message.success('模块显示设置已保存');
};

// 聊天记录管理
const handleAutoCleanChange = () => {
  message.success(settings.autoCleanEnabled ? '已开启自动清理' : '已关闭自动清理');
};

const handleKeepDaysChange = () => {
  message.success(`已设置保留 ${settings.keepDays} 天`);
};

const handleCleanMediaChange = () => {
  message.success(settings.cleanMediaEnabled ? '已开启媒体清理' : '已关闭媒体清理');
};

const handleExportChat = () => {
  exportProgressVisible.value = true;
  exportProgress.value = 0;
  
  // 模拟导出进度
  const timer = setInterval(() => {
    exportProgress.value += 10;
    if (exportProgress.value >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        exportProgressVisible.value = false;
        message.success('聊天记录导出成功');
      }, 500);
    }
  }, 200);
};

const handleImportChat = () => {
  message.info('请选择要导入的备份文件');
};

const handleMigrateChat = () => {
  message.info('迁移功能开发中');
};

const handleClearAllChat = () => {
  clearConfirmVisible.value = true;
};

const confirmClear = () => {
  clearConfirmVisible.value = false;
  // 模拟清空
  chatSessions.value = [];
  chatStats.totalMessages = '0';
  chatStats.totalSessions = 0;
  chatStats.storageSize = '0 MB';
  message.success('所有聊天记录已清空');
};

const handleExportSession = (sessionId: string) => {
  const session = chatSessions.value.find(s => s.id === sessionId);
  message.success(`正在导出「${session?.name}」的聊天记录`);
};

const handleClearSession = (sessionId: string) => {
  const index = chatSessions.value.findIndex(s => s.id === sessionId);
  if (index !== -1) {
    const session = chatSessions.value[index];
    chatSessions.value.splice(index, 1);
    chatStats.totalSessions--;
    message.success(`已清空「${session.name}」的聊天记录`);
  }
};

const handleSubmitFeedback = () => {
  if (!feedback.content.trim()) {
    message.warning('请输入反馈内容');
    return;
  }
  // 模拟提交反馈
  console.log('提交反馈:', feedback);
  message.success('反馈提交成功，感谢您的建议！');
  feedback.type = 'bug';
  feedback.content = '';
  feedback.contact = '';
};

const openLink = (type: string) => {
  console.log('打开链接:', type);
};
</script>

<style scoped>
.settings {
  display: flex;
  height: 100%;
  background: #fff;
}

.settings-sidebar {
  width: 200px;
  background: #f7f7f7;
  border-right: 1px solid #e0e0e0;
}

.settings-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.settings-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.settings-menu {
  padding: 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  transition: all 0.2s;
}

.menu-item:hover {
  background: #e6e6e6;
}

.menu-item.active {
  background: #07c160;
  color: #fff;
}

.settings-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.settings-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.setting-desc {
  font-size: 12px;
  color: #999;
}

.about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.app-logo {
  width: 100px;
  height: 100px;
  margin-bottom: 24px;
}

.app-logo img {
  width: 100%;
  height: 100%;
}

.about-content h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.version {
  font-size: 14px;
  color: #999;
  margin: 0 0 16px 0;
}

.description {
  font-size: 14px;
  color: #666;
  margin: 0 0 32px 0;
  text-align: center;
  max-width: 400px;
}

.about-links {
  display: flex;
  gap: 24px;
}

.about-links a {
  color: #07c160;
  text-decoration: none;
  font-size: 14px;
}

.about-links a:hover {
  text-decoration: underline;
}

/* 聊天记录管理样式 */
.chat-history-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: #fff;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.setting-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 24px 0;
}

.module-visibility-section {
  padding-bottom: 8px;
}

.module-list {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.module-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.module-item:hover {
  background: #f0f0f0;
}

.module-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.module-icon {
  font-size: 16px;
}

.module-name {
  font-size: 14px;
  color: #333;
}

.chat-history-actions h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f7f7f7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  background: #e6e6e6;
}

.action-item.danger {
  background: #fff2f0;
}

.action-item.danger:hover {
  background: #ffccc7;
}

.action-icon {
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #666;
  margin-right: 16px;
}

.action-item.danger .action-icon {
  color: #ff4d4f;
}

.action-info {
  flex: 1;
}

.action-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 12px;
  color: #999;
}

.action-arrow {
  color: #ccc;
}

.session-list-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f7f7f7;
  border-radius: 8px;
}

.session-info {
  flex: 1;
  margin-left: 12px;
}

.session-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.session-count {
  font-size: 12px;
  color: #999;
}

.session-actions {
  display: flex;
  gap: 8px;
}

.export-progress {
  text-align: center;
  padding: 20px;
}

.export-progress p {
  margin-top: 16px;
  color: #666;
}
</style>
