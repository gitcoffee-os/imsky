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
    :width="700"
    :body-style="{ padding: 0, height: '600px', overflow: 'hidden' }"
    class="miniapp-modal"
    @cancel="handleClose"
  >
    <div class="miniapp-container">
      <!-- 头部 -->
      <div class="miniapp-header">
        <div class="header-title">
          <AppstoreOutlined />
          <span>小应用</span>
        </div>
        <a-input-search
          v-model:value="searchQuery"
          placeholder="搜索应用"
          style="width: 200px"
          size="small"
        />
      </div>
      
      <!-- 分类标签 -->
      <div class="category-tabs">
        <div
          v-for="cat in categories"
          :key="cat.key"
          class="category-tab"
          :class="{ active: activeCategory === cat.key }"
          @click="activeCategory = cat.key"
        >
          {{ cat.label }}
        </div>
      </div>
      
      <!-- 应用列表 -->
      <div class="miniapp-content">
        <!-- 最近使用 -->
        <div v-if="activeCategory === 'recent'" class="app-section">
          <div class="section-title">最近使用</div>
          <div class="app-grid">
            <div
              v-for="app in recentApps"
              :key="app.id"
              class="app-item"
              @click="handleOpenApp(app)"
            >
              <div class="app-icon" :style="{ background: app.color }">
                <component :is="app.icon" />
              </div>
              <div class="app-name">{{ app.name }}</div>
            </div>
          </div>
        </div>
        
        <!-- 我的应用 -->
        <div v-if="activeCategory === 'mine'" class="app-section">
          <div class="section-title">我的应用</div>
          <div class="app-grid">
            <div
              v-for="app in myApps"
              :key="app.id"
              class="app-item"
              @click="handleOpenApp(app)"
            >
              <div class="app-icon" :style="{ background: app.color }">
                <component :is="app.icon" />
              </div>
              <div class="app-name">{{ app.name }}</div>
              <a-button
                type="link"
                size="small"
                class="unpin-btn"
                @click.stop="handleUnpinApp(app)"
              >
                取消固定
              </a-button>
            </div>
          </div>
        </div>
        
        <!-- 应用市场 -->
        <div v-if="activeCategory === 'market'" class="app-section">
          <div class="section-title">应用市场</div>
          <div class="app-list">
            <div
              v-for="app in marketApps"
              :key="app.id"
              class="app-card"
              @click="handleOpenApp(app)"
            >
              <div class="app-icon large" :style="{ background: app.color }">
                <component :is="app.icon" />
              </div>
              <div class="app-info">
                <div class="app-name">{{ app.name }}</div>
                <div class="app-desc">{{ app.description }}</div>
                <div class="app-meta">
                  <a-rate :value="app.rating" disabled size="small" />
                  <span class="app-downloads">{{ app.downloads }}次下载</span>
                </div>
              </div>
              <a-button
                v-if="!app.isInstalled"
                type="primary"
                size="small"
                @click.stop="handleInstallApp(app)"
              >
                安装
              </a-button>
              <a-button
                v-else
                size="small"
                disabled
              >
                已安装
              </a-button>
            </div>
          </div>
        </div>
        
        <!-- 工具分类 -->
        <div v-if="['office', 'life', 'entertainment'].includes(activeCategory)" class="app-section">
          <div class="section-title">{{ getCategoryLabel(activeCategory) }}</div>
          <div class="app-grid">
            <div
              v-for="app in getCategoryApps(activeCategory)"
              :key="app.id"
              class="app-item"
              @click="handleOpenApp(app)"
            >
              <div class="app-icon" :style="{ background: app.color }">
                <component :is="app.icon" />
              </div>
              <div class="app-name">{{ app.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  AppstoreOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  TranslationOutlined,
  FileTextOutlined,
  CloudOutlined,
  MailOutlined,
  VideoCameraOutlined,
  CustomerServiceOutlined,
  SmileOutlined,
  ShoppingOutlined,
  CarOutlined,
  MedicineBoxOutlined,
  BankOutlined,
  ToolOutlined
} from '@ant-design/icons-vue';

interface MiniApp {
  id: string;
  name: string;
  icon: any;
  color: string;
  description?: string;
  category: string;
  rating?: number;
  downloads?: string;
  isInstalled?: boolean;
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

const searchQuery = ref('');
const activeCategory = ref('recent');

const categories = [
  { key: 'recent', label: '最近使用' },
  { key: 'mine', label: '我的应用' },
  { key: 'market', label: '应用市场' },
  { key: 'office', label: '办公效率' },
  { key: 'life', label: '生活服务' },
  { key: 'entertainment', label: '娱乐休闲' }
];

// 模拟应用数据
const allApps: MiniApp[] = [
  { id: '1', name: '计算器', icon: CalculatorOutlined, color: '#1890ff', category: 'office', description: '科学计算器，支持复杂运算', rating: 4.5, downloads: '10万+' },
  { id: '2', name: '日历', icon: CalendarOutlined, color: '#52c41a', category: 'office', description: '日程管理，提醒事项', rating: 4.8, downloads: '50万+' },
  { id: '3', name: '翻译', icon: TranslationOutlined, color: '#722ed1', category: 'office', description: '多语言翻译，实时对话', rating: 4.6, downloads: '30万+' },
  { id: '4', name: '笔记', icon: FileTextOutlined, color: '#fa8c16', category: 'office', description: '随时记录，云端同步', rating: 4.7, downloads: '20万+' },
  { id: '5', name: '网盘', icon: CloudOutlined, color: '#13c2c2', category: 'office', description: '文件存储，多端同步', rating: 4.4, downloads: '100万+' },
  { id: '6', name: '邮箱', icon: MailOutlined, color: '#eb2f96', category: 'office', description: '邮件收发，高效办公', rating: 4.3, downloads: '80万+' },
  { id: '7', name: '视频', icon: VideoCameraOutlined, color: '#f5222d', category: 'entertainment', description: '精彩视频，随时观看', rating: 4.5, downloads: '200万+' },
  { id: '8', name: '音乐', icon: CustomerServiceOutlined, color: '#fa541c', category: 'entertainment', description: '海量音乐，随心听', rating: 4.7, downloads: '150万+' },
  { id: '9', name: '游戏中心', icon: SmileOutlined, color: '#faad14', category: 'entertainment', description: '精品游戏，畅玩不停', rating: 4.2, downloads: '300万+' },
  { id: '10', name: '购物', icon: ShoppingOutlined, color: '#eb2f96', category: 'life', description: '好物推荐，优惠不断', rating: 4.6, downloads: '500万+' },
  { id: '11', name: '出行', icon: CarOutlined, color: '#1890ff', category: 'life', description: '打车租车，出行便利', rating: 4.5, downloads: '400万+' },
  { id: '12', name: '健康', icon: MedicineBoxOutlined, color: '#52c41a', category: 'life', description: '健康管理，运动记录', rating: 4.4, downloads: '60万+' },
  { id: '13', name: '理财', icon: BankOutlined, color: '#fa8c16', category: 'life', description: '财富管理，投资理财', rating: 4.3, downloads: '40万+' },
  { id: '14', name: '工具箱', icon: ToolOutlined, color: '#595959', category: 'office', description: '实用工具，一应俱全', rating: 4.5, downloads: '25万+' }
];

const recentApps = computed(() => allApps.slice(0, 6));
const myApps = computed(() => allApps.filter(app => ['1', '2', '3', '4'].includes(app.id)));
const marketApps = computed(() => allApps.map(app => ({ ...app, isInstalled: ['1', '2'].includes(app.id) })));

const getCategoryApps = (category: string) => {
  return allApps.filter(app => app.category === category);
};

const getCategoryLabel = (key: string) => {
  const cat = categories.find(c => c.key === key);
  return cat?.label || '';
};

const handleClose = () => {
  visible.value = false;
};

const handleOpenApp = (app: MiniApp) => {
  console.log('打开应用:', app.name);
};

const handleInstallApp = (app: MiniApp) => {
  console.log('安装应用:', app.name);
  app.isInstalled = true;
};

const handleUnpinApp = (app: MiniApp) => {
  console.log('取消固定:', app.name);
};
</script>

<style scoped>
.miniapp-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

.miniapp-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.miniapp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.category-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 24px;
  border-bottom: 1px solid #f0f0f0;
  overflow-x: auto;
}

.category-tab {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.category-tab:hover {
  background: #f5f5f5;
}

.category-tab.active {
  background: #07c160;
  color: #fff;
}

.miniapp-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.app-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

/* 应用网格 */
.app-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.app-item:hover {
  background: #f5f5f5;
}

.app-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  margin-bottom: 8px;
}

.app-icon.large {
  width: 64px;
  height: 64px;
  font-size: 32px;
}

.app-name {
  font-size: 13px;
  color: #333;
  text-align: center;
}

.unpin-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.app-item:hover .unpin-btn {
  opacity: 1;
}

/* 应用列表 */
.app-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid #f0f0f0;
}

.app-card:hover {
  background: #f5f5f5;
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.app-downloads {
  font-size: 12px;
  color: #999;
}
</style>
