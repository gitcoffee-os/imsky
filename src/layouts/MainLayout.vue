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
  <div class="main-layout">
    <ImLayout>
      <!-- 侧边栏导航 -->
      <template #sidebar>
        <div class="sidebar-nav">
          <!-- LOGO - 点击回到首页 -->
          <a-tooltip placement="right" title="天信 v1.0.0">
            <div class="nav-logo" @click="goHome">
              <img src="/logo.svg" alt="Logo" class="logo-img" />
            </div>
          </a-tooltip>
          
          <!-- 个人头像 -->
          <div class="nav-header">
            <a-tooltip placement="right" title="个人信息">
              <a-avatar :size="40" class="user-avatar" @click="showUserProfile">
                <template #icon><UserOutlined /></template>
              </a-avatar>
            </a-tooltip>
            <div class="user-status" :class="userStatus"></div>
          </div>
          
          <!-- 主导航菜单 -->
          <div class="nav-menu">
            <!-- 天信（聊天） -->
            <a-tooltip placement="right" title="天信">
              <div 
                class="nav-item" 
                :class="{ active: currentRoute === 'Chat' }"
                @click="navigateTo('Chat')"
              >
                <MessageOutlined />
                <a-badge 
                  v-if="totalUnreadCount > 0" 
                  :count="totalUnreadCount" 
                  class="nav-badge"
                />
              </div>
            </a-tooltip>
            
            <!-- 通讯录 -->
            <a-tooltip placement="right" title="通讯录">
              <div 
                class="nav-item" 
                :class="{ active: currentRoute === 'Contact' }"
                @click="navigateTo('Contact')"
              >
                <TeamOutlined />
              </div>
            </a-tooltip>
            
            <!-- 收藏 -->
            <a-tooltip v-if="settingsStore.showModules?.favorite" placement="right" title="收藏">
              <div 
                class="nav-item" 
                :class="{ active: currentRoute === 'Favorite' }"
                @click="openModule('favorite')"
              >
                <StarOutlined />
              </div>
            </a-tooltip>
            
            <!-- 动态（朋友圈） -->
            <a-tooltip v-if="settingsStore.showModules?.moments" placement="right" title="动态">
              <div 
                class="nav-item" 
                @click="openModal('moments')"
              >
                <CameraOutlined />
              </div>
            </a-tooltip>
            
            <!-- 发现（广场） -->
            <a-tooltip v-if="settingsStore.showModules?.discover" placement="right" title="发现">
              <div 
                class="nav-item" 
                @click="openModal('discover')"
              >
                <CompassOutlined />
              </div>
            </a-tooltip>
            
            <!-- 搜索 -->
            <a-tooltip v-if="settingsStore.showModules?.search" placement="right" title="搜索">
              <div 
                class="nav-item" 
                @click="openModal('search')"
              >
                <SearchOutlined />
              </div>
            </a-tooltip>
            
            <!-- 小应用 -->
            <a-tooltip v-if="settingsStore.showModules?.miniapp" placement="right" title="小应用">
              <div 
                class="nav-item" 
                @click="openModal('miniapp')"
              >
                <AppstoreOutlined />
              </div>
            </a-tooltip>
            
            <!-- AI -->
            <a-tooltip v-if="settingsStore.showModules?.ai" placement="right" title="AI 助手">
              <div 
                class="nav-item nav-item-ai"
                @click="openAI"
              >
                <RobotOutlined />
              </div>
            </a-tooltip>
            
            <!-- Claw -->
            <a-tooltip v-if="settingsStore.showModules?.claw" placement="right" title="Claw">
              <div
                class="nav-item nav-item-claw"
                @click="openModal('claw')"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <!-- Claw 图标 -->
                  <path d="M12 2C10.5 2 9.2 2.7 8.4 3.8C7.6 4.9 7.4 6.3 7.9 7.6C6.7 8.1 5.7 9 5.1 10.2C4.5 11.4 4.4 12.7 4.8 14C3.5 14.4 2.5 15.4 2.1 16.7C1.7 18 2 19.4 2.9 20.4C3.8 21.4 5.2 21.9 6.6 21.6C7.3 22.5 8.4 23 9.5 23C10.6 23 11.7 22.5 12.4 21.6C13.8 21.9 15.2 21.4 16.1 20.4C17 19.4 17.3 18 16.9 16.7C16.5 15.4 15.5 14.4 14.2 14C14.6 12.7 14.5 11.4 13.9 10.2C13.3 9 12.3 8.1 11.1 7.6C11.6 6.3 11.4 4.9 10.6 3.8C9.8 2.7 8.5 2 7 2H12Z"/>
                  <path d="M8 6C8 6 6 4 4 5C2 6 3 9 5 9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                  <path d="M16 6C16 6 18 4 20 5C22 6 21 9 19 9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                  <circle cx="12" cy="14" r="2" fill="#fff"/>
                  <path d="M10 17L8 20M14 17L16 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
            </a-tooltip>
          </div>
          
          <!-- 底部导航 -->
          <div class="nav-footer">
            <!-- 文件传输 -->
            <a-tooltip placement="right" title="文件传输助手">
              <div 
                class="nav-item nav-item-transfer"
                :class="{ active: modals.fileTransfer }"
                @click.stop="openFileTransfer"
              >
                <FolderOutlined />
              </div>
            </a-tooltip>
            
            <!-- 聊天文件 -->
            <a-tooltip placement="right" title="聊天文件">
              <div 
                class="nav-item nav-item-chatfile"
                :class="{ active: modals.chatFile }"
                @click.stop="openChatFile"
              >
                <FileTextOutlined />
              </div>
            </a-tooltip>
            
            <!-- 聊天记录管理 -->
            <a-tooltip placement="right" title="聊天记录">
              <div 
                class="nav-item nav-item-history"
                :class="{ active: modals.chatHistory }"
                @click.stop="openChatHistory"
              >
                <HistoryOutlined />
              </div>
            </a-tooltip>
            
            <!-- 设置 -->
            <a-tooltip placement="right" title="设置">
              <div 
                class="nav-item" 
                :class="{ active: currentRoute === 'Settings' }"
                @click="navigateTo('Settings')"
              >
                <SettingOutlined />
              </div>
            </a-tooltip>
            
            <!-- LOGO - 点击显示菜单 -->
            <a-dropdown placement="right" :trigger="['click', 'hover']">
              <div class="nav-logo-bottom">
                <img src="/logo.svg" alt="Logo" class="logo-img-small" />
              </div>
              <template #overlay>
                <a-menu class="logo-dropdown-menu">
                  <a-menu-item key="lock" @click="showLockModal">
                    <LockOutlined class="menu-icon" />
                    <span>锁定应用</span>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="about" @click="showAboutModal">
                    <InfoCircleOutlined class="menu-icon" />
                    <span>关于天信</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </template>
      
      <!-- 主内容区 -->
      <template #main>
        <router-view />
      </template>
    </ImLayout>
    
    <!-- 音视频通话窗口 -->
    <CallWindow
      v-if="isInCall"
      :call-type="callType"
      :call-status="callStatus"
      :duration="callDuration"
      :remote-user="remoteUser"
      @accept="handleAcceptCall"
      @reject="handleRejectCall"
      @hangup="handleHangup"
    />
    
    <!-- 用户资料卡片弹窗 -->
    <UserProfileModal
      v-model:visible="modals.userProfile"
      :user="currentUser"
    />
    
    <!-- 朋友圈弹窗 -->
    <MomentsModal v-model:visible="modals.moments" />
    
    <!-- 发现广场弹窗 -->
    <DiscoverModal v-model:visible="modals.discover" />
    
    <!-- 搜索弹窗 -->
    <SearchModal v-model:visible="modals.search" />
    
    <!-- 小应用弹窗 -->
    <MiniAppModal v-model:visible="modals.miniapp" />
    
    <!-- Claw 弹窗 -->
    <ClawModal v-model:visible="modals.claw" />
    
    <!-- 聊天记录管理弹窗 -->
    <ChatHistoryModal v-model:visible="modals.chatHistory" />
    
    <!-- 聊天文件管理弹窗 -->
    <ChatFileModal v-model:visible="modals.chatFile" />
    
    <!-- 文件传输助手弹窗 -->
    <FileTransferModal v-model:visible="modals.fileTransfer" />

    <!-- 通话记录弹窗 -->
    <CallHistoryModal
      :visible="modals.callHistory"
      @close="modals.callHistory = false"
      @call="handleCallFromHistory"
    />

    <!-- 关于应用弹窗 -->
    <AboutModal
      :visible="modals.about"
      @close="modals.about = false"
      @feedback="navigateTo('Settings')"
    />

    <!-- 锁定应用弹窗 -->
    <LockModal
      :visible="modals.lock"
      @close="modals.lock = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  UserOutlined, 
  MessageOutlined, 
  TeamOutlined, 
  StarOutlined,
  CameraOutlined,
  CompassOutlined,
  SearchOutlined,
  AppstoreOutlined,
  FolderOutlined,
  SettingOutlined,
  RobotOutlined,
  HistoryOutlined,
  FileTextOutlined,
  LockOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue';
import { ImLayout, CallWindow } from '@gitcoffee-os/im-ui';
import { useChatStore, useCallStore, useSettingsStore } from '../stores';
import { APP_URLS } from '../config/config';
import { message } from 'ant-design-vue';
import UserProfileModal from '../components/modals/UserProfileModal.vue';
import MomentsModal from '../components/modals/MomentsModal.vue';
import DiscoverModal from '../components/modals/DiscoverModal.vue';
import SearchModal from '../components/modals/SearchModal.vue';
import MiniAppModal from '../components/modals/MiniAppModal.vue';
import ClawModal from '../components/modals/ClawModal.vue';
import ChatHistoryModal from '../components/modals/ChatHistoryModal.vue';
import ChatFileModal from '../components/modals/ChatFileModal.vue';
import FileTransferModal from '../components/modals/FileTransferModal.vue';
import CallHistoryModal from '../components/modals/CallHistoryModal.vue';
import AboutModal from '../components/modals/AboutModal.vue';
import LockModal from '../components/modals/LockModal.vue';

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();
const callStore = useCallStore();
const settingsStore = useSettingsStore();

const currentRoute = computed(() => route.name as string);
const totalUnreadCount = computed(() => chatStore.totalUnreadCount);
const userStatus = computed(() => 'online');

const isInCall = computed(() => callStore.isInCall);
const callType = computed(() => callStore.callType);
const callStatus = computed(() => callStore.callStatus);
const callDuration = computed(() => callStore.callDuration);
const remoteUser = computed(() => callStore.remoteUser);

// 当前用户（模拟数据）
const currentUser = computed(() => ({
  id: '1',
  name: '当前用户',
  avatar: '',
  status: 'online'
}));

// 弹窗状态
const modals = reactive({
  userProfile: false,
  moments: false,
  discover: false,
  search: false,
  miniapp: false,
  claw: false,
  chatHistory: false,
  chatFile: false,
  fileTransfer: false,
  callHistory: false,
  about: false,
  lock: false
});

// 导航到页面
const navigateTo = (name: string) => {
  router.push({ name });
};

// 回到首页
const goHome = () => {
  router.push({ name: 'Chat' });
};

// 打开模块（根据设置决定是页面还是弹窗）
const openModule = (module: string) => {
  const openMode = settingsStore.moduleOpenMode || 'page';
  
  if (openMode === 'modal') {
    // 弹窗模式
    switch (module) {
      case 'favorite':
        router.push({ name: 'Favorite' });
        break;
      case 'fileTransfer':
        message.info('文件传输助手弹窗开发中');
        break;
    }
  } else {
    // 页面模式
    switch (module) {
      case 'favorite':
        router.push({ name: 'Favorite' });
        break;
      case 'fileTransfer':
        message.info('文件传输助手页面开发中');
        break;
    }
  }
};

// 打开弹窗
const openModal = (modalName: keyof typeof modals) => {
  modals[modalName] = true;
};

// 显示用户资料
const showUserProfile = () => {
  modals.userProfile = true;
};

// 显示关于应用弹窗
const showAboutModal = () => {
  modals.about = true;
};

// 显示锁定应用弹窗
const showLockModal = () => {
  modals.lock = true;
};

// 打开 AI
const openAI = () => {
  window.open(APP_URLS.aiSite, '_blank');
};

// 打开聊天记录管理（默认弹窗模式）
const openChatHistory = () => {
  console.log('openChatHistory clicked');
  // 聊天记录管理默认使用弹窗模式
  modals.chatHistory = true;
  console.log('modals.chatHistory set to:', modals.chatHistory);
};

// 打开聊天文件管理（默认弹窗模式）
const openChatFile = () => {
  console.log('openChatFile clicked');
  // 聊天文件管理默认使用弹窗模式
  modals.chatFile = true;
  console.log('modals.chatFile set to:', modals.chatFile);
};

// 打开文件传输助手（默认弹窗模式）
const openFileTransfer = () => {
  console.log('openFileTransfer clicked');
  // 文件传输助手默认使用弹窗模式
  modals.fileTransfer = true;
  console.log('modals.fileTransfer set to:', modals.fileTransfer);
};

const handleAcceptCall = () => {
  callStore.setCallStatus('connected');
};

const handleRejectCall = () => {
  callStore.endCall();
};

const handleHangup = () => {
  callStore.endCall();
};

// 打开通话记录
const openCallHistory = () => {
  modals.callHistory = true;
};

// 从通话记录发起通话
const handleCallFromHistory = (call: any) => {
  message.success(`正在呼叫 ${call.name}...`);
  // 这里可以调用 callStore 发起通话
};
</script>

<style scoped>
.sidebar-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #2e2e2e;
  padding: 12px 0;
  overflow: hidden;
}

.nav-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.nav-logo:hover {
  transform: scale(1.05);
}

.logo-img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.nav-header {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  cursor: pointer;
  transition: transform 0.2s;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #2e2e2e;
}

.user-status.online {
  background: #07c160;
}

.user-status.offline {
  background: #999;
}

.user-status.busy {
  background: #fa5151;
}

.user-status.away {
  background: #ffc300;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0 8px;
}

.nav-menu::-webkit-scrollbar {
  display: none;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border-radius: 8px;
  cursor: pointer;
  color: #999;
  font-size: 20px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  color: #07c160;
}

.nav-item-ai {
  color: #1677ff;
}

.nav-item-ai:hover {
  color: #4096ff;
  background: rgba(22, 119, 255, 0.15);
}

.nav-item-claw {
  color: #ff6b6b;
}

.nav-item-claw:hover {
  color: #ff5252;
  background: rgba(255, 107, 107, 0.15);
}

.nav-item-history {
  color: #999;
}

.nav-item-history:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-item-history.active {
  color: #07c160;
}

.nav-item-chatfile {
  color: #999;
}

.nav-item-chatfile:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-item-chatfile.active {
  color: #07c160;
}

.nav-item-transfer {
  color: #999;
}

.nav-item-transfer:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-item-transfer.active {
  color: #07c160;
}

.nav-badge {
  position: absolute;
  top: 2px;
  right: 2px;
}

.nav-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  flex-shrink: 0;
}

.nav-logo-bottom {
  display: flex;
  justify-content: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #444;
  cursor: pointer;
  transition: transform 0.2s;
}

.nav-logo-bottom:hover {
  transform: scale(1.05);
}

.logo-img-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  opacity: 0.9;
}

.nav-logo-bottom:hover .logo-img-small {
  opacity: 1;
}

/* LOGO下拉菜单样式 */
.logo-dropdown-menu :deep(.ant-dropdown-menu-item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}

.logo-dropdown-menu .menu-icon {
  font-size: 16px;
  margin-right: 4px;
}
</style>
