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
    :open="visible"
    :footer="null"
    :width="900"
    :body-style="{ padding: 0, height: '650px', overflow: 'hidden' }"
    class="claw-modal"
    @cancel="handleClose"
    @update:open="handleClose"
  >
    <div class="claw-container">
      <!-- 头部 -->
      <div class="claw-header">
        <div class="header-content">
          <div class="logo-section">
            <div class="claw-logo">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <path d="M12 2C10.5 2 9.2 2.7 8.4 3.8C7.6 4.9 7.4 6.3 7.9 7.6C6.7 8.1 5.7 9 5.1 10.2C4.5 11.4 4.4 12.7 4.8 14C3.5 14.4 2.5 15.4 2.1 16.7C1.7 18 2 19.4 2.9 20.4C3.8 21.4 5.2 21.9 6.6 21.6C7.3 22.5 8.4 23 9.5 23C10.6 23 11.7 22.5 12.4 21.6C13.8 21.9 15.2 21.4 16.1 20.4C17 19.4 17.3 18 16.9 16.7C16.5 15.4 15.5 14.4 14.2 14C14.6 12.7 14.5 11.4 13.9 10.2C13.3 9 12.3 8.1 11.1 7.6C11.6 6.3 11.4 4.9 10.6 3.8C9.8 2.7 8.5 2 7 2H12Z"/>
                <path d="M8 6C8 6 6 4 4 5C2 6 3 9 5 9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                <path d="M16 6C16 6 18 4 20 5C22 6 21 9 19 9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                <circle cx="12" cy="14" r="2" fill="#fff"/>
                <path d="M10 17L8 20M14 17L16 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="logo-text">
              <h2>Claw中心</h2>
              <p>Claw Center</p>
            </div>
          </div>
          <div class="header-actions">
            <a-button type="primary" @click="handleEnter">
              <template #icon><LoginOutlined /></template>
              进入Claw
            </a-button>
          </div>
        </div>
      </div>
      
      <!-- 内容区 -->
      <div class="claw-content">
        <!-- 左侧菜单 -->
        <div class="content-sidebar">
          <div 
            v-for="item in menuItems" 
            :key="item.key"
            class="menu-item"
            :class="{ active: activeMenu === item.key }"
            @click="activeMenu = item.key"
          >
            <component :is="item.icon" />
            <span>{{ item.label }}</span>
          </div>
        </div>
        
        <!-- 右侧内容 -->
        <div class="content-main">
          <!-- 首页 -->
          <div v-if="activeMenu === 'home'" class="section-home">
            <div class="welcome-banner">
              <h3>欢迎来到Claw中心</h3>
              <p>探索更多精彩内容，发现无限可能</p>
            </div>
            
            <div class="feature-grid">
              <div v-for="feature in features" :key="feature.id" class="feature-card">
                <div class="feature-icon" :style="{ background: feature.color }">
                  <component :is="feature.icon" />
                </div>
                <h4>{{ feature.name }}</h4>
                <p>{{ feature.desc }}</p>
              </div>
            </div>
          </div>
          
          <!-- 热门 -->
          <div v-if="activeMenu === 'hot'" class="section-hot">
            <h3>热门推荐</h3>
            <div class="hot-list">
              <div v-for="item in hotItems" :key="item.id" class="hot-item">
                <div class="hot-rank" :class="{ top: item.rank <= 3 }">{{ item.rank }}</div>
                <div class="hot-info">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.desc }}</p>
                </div>
                <div class="hot-heat">
                  <FireOutlined />
                  <span>{{ item.heat }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分类 -->
          <div v-if="activeMenu === 'category'" class="section-category">
            <h3>内容分类</h3>
            <div class="category-grid">
              <div v-for="cat in categories" :key="cat.id" class="category-card">
                <div class="category-icon" :style="{ background: cat.color }">
                  <component :is="cat.icon" />
                </div>
                <span>{{ cat.name }}</span>
              </div>
            </div>
          </div>
          
          <!-- 我的 -->
          <div v-if="activeMenu === 'mine'" class="section-mine">
            <div class="user-card">
              <a-avatar :size="64" class="user-avatar">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <div class="user-info">
                <h4>Claw用户</h4>
                <p>探索更多，发现精彩</p>
              </div>
            </div>
            
            <div class="mine-stats">
              <div class="stat-item">
                <span class="stat-num">128</span>
                <span class="stat-label">收藏</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">56</span>
                <span class="stat-label">关注</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">2.3k</span>
                <span class="stat-label">获赞</span>
              </div>
            </div>
            
            <div class="mine-menu">
              <div v-for="menu in mineMenus" :key="menu.key" class="mine-menu-item">
                <component :is="menu.icon" />
                <span>{{ menu.label }}</span>
                <RightOutlined class="arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  HomeOutlined,
  FireOutlined,
  AppstoreOutlined,
  UserOutlined,
  LoginOutlined,
  RightOutlined,
  StarOutlined,
  CompassOutlined,
  VideoCameraOutlined,
  BookOutlined,
  ShoppingOutlined,
  SmileOutlined,
  CustomerServiceOutlined,
  PictureOutlined,
  FileTextOutlined,
  HeartOutlined,
  HistoryOutlined,
  SettingOutlined,
  MessageOutlined
} from '@ant-design/icons-vue';
import { APP_URLS } from '../../config/config';

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:visible']);

const activeMenu = ref('home');

const menuItems = [
  { key: 'home', label: '首页', icon: HomeOutlined },
  { key: 'hot', label: '热门', icon: FireOutlined },
  { key: 'category', label: '分类', icon: AppstoreOutlined },
  { key: 'mine', label: '我的', icon: UserOutlined }
];

const features = [
  { id: 1, name: '发现', desc: '探索精彩内容', icon: CompassOutlined, color: '#1677ff' },
  { id: 2, name: '视频', desc: '观看热门视频', icon: VideoCameraOutlined, color: '#ff4d4f' },
  { id: 3, name: '阅读', desc: '精品文章阅读', icon: BookOutlined, color: '#52c41a' },
  { id: 4, name: '购物', desc: '好物推荐', icon: ShoppingOutlined, color: '#faad14' },
  { id: 5, name: '游戏', desc: '休闲娱乐', icon: SmileOutlined, color: '#722ed1' },
  { id: 6, name: '音乐', desc: '音乐欣赏', icon: CustomerServiceOutlined, color: '#eb2f96' }
];

const hotItems = [
  { id: 1, rank: 1, title: '今日热门话题', desc: '讨论人数 10万+', heat: '98.5万' },
  { id: 2, rank: 2, title: '精选推荐内容', desc: '浏览量 50万+', heat: '85.2万' },
  { id: 3, rank: 3, title: '热门视频榜单', desc: '播放量 100万+', heat: '72.8万' },
  { id: 4, rank: 4, title: '新鲜事速递', desc: '实时更新', heat: '56.3万' },
  { id: 5, rank: 5, title: '用户创作精选', desc: '优质内容', heat: '43.1万' }
];

const categories = [
  { id: 1, name: '图文', icon: PictureOutlined, color: '#1677ff' },
  { id: 2, name: '视频', icon: VideoCameraOutlined, color: '#ff4d4f' },
  { id: 3, name: '文章', icon: FileTextOutlined, color: '#52c41a' },
  { id: 4, name: '音乐', icon: CustomerServiceOutlined, color: '#faad14' },
  { id: 5, name: '直播', icon: FireOutlined, color: '#722ed1' },
  { id: 6, name: '购物', icon: ShoppingOutlined, color: '#eb2f96' },
  { id: 7, name: '游戏', icon: SmileOutlined, color: '#13c2c2' },
  { id: 8, name: '更多', icon: AppstoreOutlined, color: '#595959' }
];

const mineMenus = [
  { key: 'fav', label: '我的收藏', icon: StarOutlined },
  { key: 'like', label: '我的点赞', icon: HeartOutlined },
  { key: 'history', label: '浏览历史', icon: HistoryOutlined },
  { key: 'msg', label: '消息通知', icon: MessageOutlined },
  { key: 'setting', label: '设置', icon: SettingOutlined }
];

const handleClose = () => {
  emit('update:visible', false);
};

const handleEnter = () => {
  // 可以打开外部链接或内部页面
  window.open(APP_URLS.clawSite, '_blank');
};
</script>

<style scoped>
.claw-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.claw-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  padding: 24px 32px;
  color: #fff;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.claw-logo {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.logo-text h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.logo-text p {
  margin: 4px 0 0;
  opacity: 0.9;
  font-size: 14px;
}

.claw-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.content-sidebar {
  width: 120px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 16px 0;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.menu-item:hover {
  color: #ff6b6b;
  background: #fff2f0;
}

.menu-item.active {
  color: #ff6b6b;
  background: #fff2f0;
  font-weight: 500;
}

.content-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 首页 */
.welcome-banner {
  background: linear-gradient(135deg, #fff 0%, #fff2f0 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #ffccc7;
}

.welcome-banner h3 {
  margin: 0 0 8px;
  color: #ff6b6b;
  font-size: 20px;
}

.welcome-banner p {
  margin: 0;
  color: #666;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.feature-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e8e8e8;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  margin: 0 auto 12px;
}

.feature-card h4 {
  margin: 0 0 8px;
  font-size: 16px;
}

.feature-card p {
  margin: 0;
  color: #999;
  font-size: 12px;
}

/* 热门 */
.section-hot h3 {
  margin: 0 0 16px;
  font-size: 18px;
}

.hot-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.hot-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.hot-item:last-child {
  border-bottom: none;
}

.hot-rank {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #666;
  margin-right: 16px;
}

.hot-rank.top {
  background: #ff6b6b;
  color: #fff;
}

.hot-info {
  flex: 1;
}

.hot-info h4 {
  margin: 0 0 4px;
  font-size: 15px;
}

.hot-info p {
  margin: 0;
  color: #999;
  font-size: 12px;
}

.hot-heat {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ff6b6b;
  font-size: 13px;
}

/* 分类 */
.section-category h3 {
  margin: 0 0 16px;
  font-size: 18px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.category-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e8e8e8;
}

.category-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  margin: 0 auto 12px;
}

.category-card span {
  font-size: 14px;
  color: #333;
}

/* 我的 */
.section-mine .user-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.user-avatar {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
}

.user-info h4 {
  margin: 0 0 4px;
  font-size: 18px;
}

.user-info p {
  margin: 0;
  color: #999;
  font-size: 13px;
}

.mine-stats {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.mine-menu {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.mine-menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid #f0f0f0;
}

.mine-menu-item:last-child {
  border-bottom: none;
}

.mine-menu-item:hover {
  background: #f5f5f5;
}

.mine-menu-item :deep(svg) {
  font-size: 20px;
  margin-right: 12px;
  color: #666;
}

.mine-menu-item span {
  flex: 1;
  font-size: 14px;
}

.mine-menu-item .arrow {
  color: #ccc;
  font-size: 14px;
}
</style>
