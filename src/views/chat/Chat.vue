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
  <div class="chat">
    <!-- 会话列表面板 -->
    <div class="session-panel" :style="{ width: sessionPanelWidth + 'px' }">
      <!-- 拖动调整宽度手柄 -->
      <div class="resize-handle" @mousedown="startResize"></div>
      <!-- 顶部标题栏 -->
      <div class="session-header">
        <div class="header-title">
          <MessageOutlined class="title-icon" />
          <span>天信</span>
        </div>
        <div class="header-actions">
          <a-badge :count="totalUnreadCount" :offset="[-2, 2]">
            <a-button type="text" size="small" class="action-btn" @click="handleAddChat">
              <PlusOutlined />
            </a-button>
          </a-badge>
          <a-dropdown>
            <a-button type="text" size="small" class="action-btn">
              <MoreOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="all-read">全部已读</a-menu-item>
                <a-menu-item key="clear">清空会话</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
      
      <!-- 搜索栏 -->
      <div class="session-search">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索会话"
          @search="handleSearch"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input-search>
      </div>
      
      <!-- 标签筛选 -->
      <div class="session-tabs">
        <div 
          class="tab-item"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          <span>全部</span>
          <a-badge v-if="allCount > 0" :count="allCount" class="tab-badge" />
        </div>
        <div 
          class="tab-item"
          :class="{ active: activeTab === 'unread' }"
          @click="activeTab = 'unread'"
        >
          <span>未读</span>
          <a-badge v-if="unreadCount > 0" :count="unreadCount" class="tab-badge" />
        </div>
        <div 
          class="tab-item"
          :class="{ active: activeTab === 'group' }"
          @click="activeTab = 'group'"
        >
          <span>群聊</span>
          <a-badge v-if="groupCount > 0" :count="groupCount" class="tab-badge" />
        </div>
      </div>
      
      <!-- 会话列表 -->
      <div class="session-list">
        <div 
          v-for="session in filteredSessions" 
          :key="session.id"
          class="session-item"
          :class="{ active: currentSessionId === session.id, unread: session.unread > 0 }"
          @click="handleSelectSession(session)"
        >
          <div class="session-avatar" :class="session.sessionType">
            <a-avatar :size="48" :src="session.avatar" :class="session.sessionType">
              <template #icon>
                <FolderOutlined v-if="session.sessionType === 'fileTransfer'" />
                <NotificationOutlined v-else-if="session.sessionType === 'system'" />
                <ReadOutlined v-else-if="session.sessionType === 'news'" />
                <MailOutlined v-else-if="session.sessionType === 'email'" />
                <RobotOutlined v-else-if="session.sessionType === 'robot'" />
                <SyncOutlined v-else-if="session.sessionType === 'smartSync'" />
                <CloudOutlined v-else-if="session.sessionType === 'storage'" />
                <CloudUploadOutlined v-else-if="session.sessionType === 'contentSync'" />
                <SearchOutlined v-else-if="session.sessionType === 'search'" />
                <CompassOutlined v-else-if="session.sessionType === 'explore'" />
                <CheckSquareOutlined v-else-if="session.sessionType === 'task'" />
                <MailOutlined v-else-if="session.sessionType === 'mail'" />
                <MobileOutlined v-else-if="session.sessionType === 'sms'" />
                <CustomerServiceOutlined v-else-if="session.sessionType === 'customerService'" />
                <FileTextOutlined v-else-if="session.sessionType === 'ticket'" />
                <BranchesOutlined v-else-if="session.sessionType === 'workflow'" />
                <FileTextOutlined v-else-if="session.sessionType === 'report'" />
                <BarChartOutlined v-else-if="session.sessionType === 'statistics'" />
                <CreditCardOutlined v-else-if="session.sessionType === 'payment'" />
                <SwapOutlined v-else-if="session.sessionType === 'trade'" />
                <RobotOutlined v-else-if="session.sessionType === 'agent'" />
                <ToolOutlined v-else-if="session.sessionType === 'skill'" />
                <ApiOutlined v-else-if="session.sessionType === 'claw'" />
                <EditOutlined v-else-if="session.sessionType === 'creation'" />
                <AppstoreOutlined v-else-if="session.sessionType === 'miniApp'" />
                <ShareAltOutlined v-else-if="session.sessionType === 'share'" />
                <TeamOutlined v-else-if="session.sessionType === 'collaborate'" />
                <TeamOutlined v-else-if="session.sessionType === 'group'" />
                <UserOutlined v-else />
              </template>
            </a-avatar>
            <div v-if="session.sessionType === 'private' && session.online" class="online-dot"></div>
            <div v-if="session.sessionType === 'group'" class="group-badge">
              <TeamOutlined />
            </div>
            <div v-if="session.sessionType === 'fileTransfer'" class="type-badge file">
              <FolderOutlined />
            </div>
            <div v-if="session.sessionType === 'system'" class="type-badge system">
              <NotificationOutlined />
            </div>
            <div v-if="session.sessionType === 'news'" class="type-badge news">
              <ReadOutlined />
            </div>
            <div v-if="session.sessionType === 'email'" class="type-badge email">
              <MailOutlined />
            </div>
            <div v-if="session.sessionType === 'robot'" class="type-badge robot">
              <RobotOutlined />
            </div>
            <div v-if="session.sessionType === 'smartSync'" class="type-badge smartSync">
              <SyncOutlined />
            </div>
            <div v-if="session.sessionType === 'storage'" class="type-badge storage">
              <CloudOutlined />
            </div>
            <div v-if="session.sessionType === 'contentSync'" class="type-badge contentSync">
              <CloudUploadOutlined />
            </div>
            <div v-if="session.sessionType === 'search'" class="type-badge search">
              <SearchOutlined />
            </div>
            <div v-if="session.sessionType === 'explore'" class="type-badge explore">
              <CompassOutlined />
            </div>
            <div v-if="session.sessionType === 'task'" class="type-badge task">
              <CheckSquareOutlined />
            </div>
            <div v-if="session.sessionType === 'mail'" class="type-badge mail">
              <MailOutlined />
            </div>
            <div v-if="session.sessionType === 'sms'" class="type-badge sms">
              <MobileOutlined />
            </div>
            <div v-if="session.sessionType === 'customerService'" class="type-badge customerService">
              <CustomerServiceOutlined />
            </div>
            <div v-if="session.sessionType === 'ticket'" class="type-badge ticket">
              <FileTextOutlined />
            </div>
            <div v-if="session.sessionType === 'workflow'" class="type-badge workflow">
              <BranchesOutlined />
            </div>
            <div v-if="session.sessionType === 'report'" class="type-badge report">
              <FileTextOutlined />
            </div>
            <div v-if="session.sessionType === 'statistics'" class="type-badge statistics">
              <BarChartOutlined />
            </div>
            <div v-if="session.sessionType === 'payment'" class="type-badge payment">
              <CreditCardOutlined />
            </div>
            <div v-if="session.sessionType === 'trade'" class="type-badge trade">
              <SwapOutlined />
            </div>
            <div v-if="session.sessionType === 'agent'" class="type-badge agent">
              <RobotOutlined />
            </div>
            <div v-if="session.sessionType === 'skill'" class="type-badge skill">
              <ToolOutlined />
            </div>
            <div v-if="session.sessionType === 'claw'" class="type-badge claw">
              <ApiOutlined />
            </div>
            <div v-if="session.sessionType === 'creation'" class="type-badge creation">
              <EditOutlined />
            </div>
            <div v-if="session.sessionType === 'miniApp'" class="type-badge miniApp">
              <AppstoreOutlined />
            </div>
            <div v-if="session.sessionType === 'share'" class="type-badge share">
              <ShareAltOutlined />
            </div>
            <div v-if="session.sessionType === 'collaborate'" class="type-badge collaborate">
              <TeamOutlined />
            </div>
          </div>
          <div class="session-content">
            <div class="session-top">
              <span class="session-name">{{ session.title }}</span>
              <span class="session-time">{{ session.lastTime }}</span>
            </div>
            <div class="session-bottom">
              <p class="session-message">
                <span v-if="session.isGroup && session.senderName" class="sender-name">{{ session.senderName }}:</span>
                {{ session.lastMessage }}
              </p>
              <a-badge v-if="session.unread > 0" :count="session.unread" class="unread-badge" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部分类栏 -->
      <div class="category-bar" :class="{ expanded: isCategoryExpanded }">
        <div class="category-list">
          <div 
            v-for="category in visibleCategories" 
            :key="category.key"
            class="category-item"
            :class="{ active: activeCategory === category.key }"
            @click="handleCategoryClick(category.key)"
          >
            <component :is="category.icon" class="category-icon" />
            <span class="category-name">{{ category.name }}</span>
          </div>
        </div>
        <div class="category-actions">
          <div 
            v-if="hasMoreCategories" 
            class="category-toggle"
            :title="isCategoryExpanded ? '收起' : '更多'"
            @click="isCategoryExpanded = !isCategoryExpanded"
          >
            <DownOutlined v-if="isCategoryExpanded" class="category-toggle-icon" />
            <UpOutlined v-else class="category-toggle-icon" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 聊天区域 -->
    <div class="chat-panel">
      <template v-if="currentSession">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="header-left">
            <a-avatar :size="40" :src="currentSession.avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <div class="header-info">
              <div class="header-name">{{ currentSession.title }}</div>
              <div class="header-status">
                <span v-if="currentSession.isGroup">{{ currentSession.memberCount }}人</span>
                <span v-else-if="currentSession.online">在线</span>
                <span v-else>离线</span>
              </div>
            </div>
          </div>
          <div class="header-right">
            <a-dropdown>
              <a-button type="text" class="header-btn">
                <MoreOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile">查看资料</a-menu-item>
                  <a-menu-item key="history">聊天记录</a-menu-item>
                  <a-menu-item key="clear">清空记录</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete" danger>删除会话</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
        
        <!-- 特殊类型会话内容区 -->
        <template v-if="isSpecialSession">
          <div class="special-session-content">

            <!-- 系统通知 -->
            <template v-if="currentSession?.sessionType === 'system'">
              <div class="system-notice-area">
                <div class="special-header">
                  <NotificationOutlined class="special-icon" />
                  <h3>系统通知</h3>
                  <p>账号安全与系统消息</p>
                </div>
                <div class="notice-list">
                  <div v-for="message in currentMessages" :key="message.id" class="notice-card">
                    <div class="notice-icon">
                      <SafetyOutlined />
                    </div>
                    <div class="notice-content">
                      <div class="notice-text">{{ message.content }}</div>
                      <div class="notice-time">{{ message.time }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- 每日资讯 -->
            <template v-if="currentSession?.sessionType === 'news'">
              <div class="news-area">
                <div class="special-header">
                  <ReadOutlined class="special-icon" />
                  <h3>每日资讯</h3>
                  <p>精选热点，一触即达</p>
                </div>
                <div class="news-list-centered">
                  <div v-for="message in currentMessages" :key="message.id" class="news-card-large">
                    <div class="news-card-image">
                      <img :src="message.newsImage" alt="资讯配图" />
                      <div class="news-card-tag">{{ message.newsTag }}</div>
                    </div>
                    <div class="news-card-content">
                      <h4 class="news-card-title">{{ message.newsTitle }}</h4>
                      <p class="news-card-summary">{{ message.newsSummary }}</p>
                      <div class="news-card-footer">
                        <span class="news-card-source">{{ message.newsSource }}</span>
                        <span class="news-card-time">{{ message.time }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- 邮箱提醒 -->
            <template v-if="currentSession?.sessionType === 'email'">
              <div class="email-area">
                <div class="special-header">
                  <MailOutlined class="special-icon" />
                  <h3>邮箱提醒</h3>
                  <p>新邮件实时推送</p>
                </div>
                <div class="email-list">
                  <div v-for="message in currentMessages" :key="message.id" class="email-card">
                    <div class="email-avatar">
                      <UserOutlined />
                    </div>
                    <div class="email-info">
                      <div class="email-sender">{{ message.content.match(/来自 "(.+?)"/)?.[1] || '未知发件人' }}</div>
                      <div class="email-subject">{{ message.content.match(/新邮件：(.+)/)?.[1] || '无主题' }}</div>
                      <div class="email-time">{{ message.time }}</div>
                    </div>
                    <a-button type="primary" size="small">查看</a-button>
                  </div>
                </div>
                <div class="special-footer">
                  <a-button type="link" block>进入邮箱查看全部</a-button>
                </div>
              </div>
            </template>

            <!-- ImSky助手 -->
            <template v-if="currentSession?.sessionType === 'robot'">
              <div class="robot-area">
                <div class="special-header">
                  <RobotOutlined class="special-icon" />
                  <h3>ImSky 助手</h3>
                  <p>智能问答，随时为您服务</p>
                </div>
                <div class="robot-chat">
                  <div v-for="message in currentMessages" :key="message.id" class="robot-message">
                    <div class="robot-avatar">
                      <RobotOutlined />
                    </div>
                    <div class="robot-bubble">
                      {{ message.content }}
                    </div>
                  </div>
                </div>
                <div class="robot-quick-actions">
                  <div class="quick-title">快速提问</div>
                  <div class="quick-buttons">
                    <a-button size="small">如何使用</a-button>
                    <a-button size="small">功能介绍</a-button>
                    <a-button size="small">联系客服</a-button>
                  </div>
                </div>
                <!-- AI对话组件 -->
                <div class="assistant-chatbot">
                  <Chatbot :show-header="false" @send-message="handleChatbotMessage" ref="chatbotRef" />
                </div>
              </div>
            </template>
          </div>
        </template>

        <!-- 普通消息列表 -->
        <template v-else>
          <div class="message-list" ref="messageListRef">
            <!-- 文件传输助手特殊头部 -->
            <div v-if="currentSession?.sessionType === 'fileTransfer'" class="file-transfer-header">
              <FolderOutlined class="file-transfer-header-icon" />
              <h3>文件传输助手</h3>
              <p>跨设备传输文件，永久保存</p>
            </div>
            <!-- 智能同步助手头部 -->
            <div v-if="currentSession?.sessionType === 'smartSync'" class="file-transfer-header smart-sync-header">
              <SyncOutlined class="file-transfer-header-icon" />
              <h3>智能同步助手</h3>
              <p>跨设备同步剪贴板、笔记和待办事项</p>
            </div>
            <!-- 存储助手头部 -->
            <div v-if="currentSession?.sessionType === 'storage'" class="file-transfer-header storage-header">
              <CloudOutlined class="file-transfer-header-icon" />
              <h3>存储助手</h3>
              <p>管理云存储空间，自动备份数据</p>
            </div>
            <!-- 内容同步助手头部 -->
            <div v-if="currentSession?.sessionType === 'contentSync'" class="file-transfer-header content-sync-header">
              <CloudUploadOutlined class="file-transfer-header-icon" />
              <h3>内容同步助手</h3>
              <p>一键同步发布至主流媒体平台</p>
            </div>
            <!-- 个性化搜索助手头部 -->
            <div v-if="currentSession?.sessionType === 'search'" class="file-transfer-header search-header">
              <SearchOutlined class="file-transfer-header-icon" />
              <h3>个性化搜索助手</h3>
              <p>一键搜索主流搜索引擎平台</p>
            </div>
            <!-- 智能探索助手头部 -->
            <div v-if="currentSession?.sessionType === 'explore'" class="file-transfer-header explore-header">
              <CompassOutlined class="file-transfer-header-icon" />
              <h3>智能探索助手</h3>
              <p>高效搜索、自由探索、深度思考</p>
            </div>
            <!-- 任务助手头部 -->
            <div v-if="currentSession?.sessionType === 'task'" class="file-transfer-header task-header">
              <CheckSquareOutlined class="file-transfer-header-icon" />
              <h3>任务助手</h3>
              <p>管理待办事项、设置提醒、跟踪进度</p>
            </div>
            <!-- 邮件助手头部 -->
            <div v-if="currentSession?.sessionType === 'mail'" class="file-transfer-header mail-header">
              <MailOutlined class="file-transfer-header-icon" />
              <h3>邮件助手</h3>
              <p>管理邮件、智能回复、定时发送</p>
            </div>
            <!-- 短信助手头部 -->
            <div v-if="currentSession?.sessionType === 'sms'" class="file-transfer-header sms-header">
              <MobileOutlined class="file-transfer-header-icon" />
              <h3>短信助手</h3>
              <p>集成云服务商短信平台，支持批量发送</p>
            </div>
            <!-- 客服助手头部 -->
            <div v-if="currentSession?.sessionType === 'customerService'" class="file-transfer-header customer-service-header">
              <CustomerServiceOutlined class="file-transfer-header-icon" />
              <h3>客服助手</h3>
              <p>管理客户咨询、智能回复、转接人工</p>
            </div>
            <!-- 工单助手头部 -->
            <div v-if="currentSession?.sessionType === 'ticket'" class="file-transfer-header ticket-header">
              <FileTextOutlined class="file-transfer-header-icon" />
              <h3>工单助手</h3>
              <p>创建、跟踪、管理工单，提高效率</p>
            </div>
            <!-- 流程助手头部 -->
            <div v-if="currentSession?.sessionType === 'workflow'" class="file-transfer-header workflow-header">
              <BranchesOutlined class="file-transfer-header-icon" />
              <h3>流程助手</h3>
              <p>管理审批流程、自动化工作流</p>
            </div>
            <!-- 报表助手头部 -->
            <div v-if="currentSession?.sessionType === 'report'" class="file-transfer-header report-header">
              <FileTextOutlined class="file-transfer-header-icon" />
              <h3>报表助手</h3>
              <p>生成各类业务报表、数据可视化</p>
            </div>
            <!-- 统计助手头部 -->
            <div v-if="currentSession?.sessionType === 'statistics'" class="file-transfer-header statistics-header">
              <BarChartOutlined class="file-transfer-header-icon" />
              <h3>统计助手</h3>
              <p>数据分析、趋势预测、指标监控</p>
            </div>
            <!-- 支付助手头部 -->
            <div v-if="currentSession?.sessionType === 'payment'" class="file-transfer-header payment-header">
              <CreditCardOutlined class="file-transfer-header-icon" />
              <h3>支付助手</h3>
              <p>管理支付方式、处理支付事务</p>
            </div>
            <!-- 交易助手头部 -->
            <div v-if="currentSession?.sessionType === 'trade'" class="file-transfer-header trade-header">
              <SwapOutlined class="file-transfer-header-icon" />
              <h3>交易助手</h3>
              <p>记录交易、对账管理、资金流水</p>
            </div>
            <!-- 智能体助手头部 -->
            <div v-if="currentSession?.sessionType === 'agent'" class="file-transfer-header agent-header">
              <RobotOutlined class="file-transfer-header-icon" />
              <h3>智能体助手</h3>
              <p>AI智能体管理、自动化任务执行</p>
            </div>
            <!-- Skill助手头部 -->
            <div v-if="currentSession?.sessionType === 'skill'" class="file-transfer-header skill-header">
              <ToolOutlined class="file-transfer-header-icon" />
              <h3>Skill助手</h3>
              <p>技能管理、工具集成、能力扩展</p>
            </div>
            <!-- Claw助手头部 -->
            <div v-if="currentSession?.sessionType === 'claw'" class="file-transfer-header claw-header">
              <ApiOutlined class="file-transfer-header-icon" />
              <h3>Claw助手</h3>
              <p>API管理、服务集成、接口调试</p>
            </div>
            <!-- 创作助手头部 -->
            <div v-if="currentSession?.sessionType === 'creation'" class="file-transfer-header creation-header">
              <EditOutlined class="file-transfer-header-icon" />
              <h3>创作助手</h3>
              <p>内容创作、文案生成、创意辅助</p>
            </div>
            <!-- 小应用助手头部 -->
            <div v-if="currentSession?.sessionType === 'miniApp'" class="file-transfer-header miniApp-header">
              <AppstoreOutlined class="file-transfer-header-icon" />
              <h3>小应用助手</h3>
              <p>小程序管理、应用市场、快捷入口</p>
            </div>
            <!-- 分享助手头部 -->
            <div v-if="currentSession?.sessionType === 'share'" class="file-transfer-header share-header">
              <ShareAltOutlined class="file-transfer-header-icon" />
              <h3>分享助手</h3>
              <p>一键生成分享链接，快速分享至社交平台</p>
            </div>
            <!-- 共享助手头部 -->
            <div v-if="currentSession?.sessionType === 'collaborate'" class="file-transfer-header collaborate-header">
              <TeamOutlined class="file-transfer-header-icon" />
              <h3>共享助手</h3>
              <p>文档协作、团队共享、实时同步</p>
            </div>
            <div v-if="loading" class="loading-more">
              <a-spin size="small" />
              <span>加载中...</span>
            </div>
            <div 
              v-for="message in currentMessages" 
              :key="message.id"
              class="message-item"
              :class="{ self: message.isSelf, recalled: message.isRecalled }"
              @contextmenu.prevent="showMessageContextMenu($event, message)"
            >
              <a-avatar :size="36" :src="message.avatar" class="message-avatar">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <div class="message-content">
                <div v-if="!message.isSelf" class="message-sender">{{ message.senderName }}</div>
                <div class="message-bubble" :class="[message.type, { recalled: message.isRecalled }]">
                  <template v-if="message.isRecalled">
                    <div class="recalled-content">
                      <RollbackOutlined />
                      <span>{{ message.isSelf ? '你撤回了一条消息' : '对方撤回了一条消息' }}</span>
                      <a-button 
                        v-if="message.isSelf && message.type === 'text'" 
                        type="link" 
                        size="small" 
                        class="re-edit-btn"
                        @click.stop="handleReEdit(message)"
                      >
                        重新编辑
                      </a-button>
                    </div>
                  </template>
                  <template v-else>
                    <div v-if="message.type === 'text'" class="text-content">{{ message.content }}</div>
                    <div v-else-if="message.type === 'image'" class="image-content">
                      <img :src="message.content" alt="图片" />
                    </div>
                    <div v-else-if="message.type === 'file'" class="file-content">
                      <FileOutlined class="file-icon" />
                      <div class="file-info">
                        <div class="file-name">{{ message.fileName }}</div>
                        <div class="file-size">{{ message.fileSize }}</div>
                      </div>
                      <a-button type="text" size="small">
                        <DownloadOutlined />
                      </a-button>
                    </div>
                    <div v-else-if="message.type === 'video'" class="video-content">
                      <div class="video-wrapper" @click="handlePlayVideo(message.content)">
                        <img :src="message.videoCover" alt="视频封面" class="video-cover" />
                        <div class="video-play-btn">
                          <PlayCircleOutlined />
                        </div>
                        <div class="video-duration">{{ message.videoDuration }}</div>
                      </div>
                    </div>
                    <div v-else-if="message.type === 'music'" class="music-content">
                      <div class="music-cover">
                        <img :src="message.musicCover" alt="音乐封面" />
                        <div class="music-play-icon">
                          <PlayCircleOutlined />
                        </div>
                      </div>
                      <div class="music-info">
                        <div class="music-name">{{ message.musicName }}</div>
                        <div class="music-artist">{{ message.musicArtist }}</div>
                      </div>
                      <div class="music-duration">{{ message.musicDuration }}</div>
                    </div>
                    <div v-else-if="message.type === 'link'" class="link-content" @click="handleOpenLink(message.linkUrl)">
                      <div class="link-image" v-if="message.linkImage">
                        <img :src="message.linkImage" alt="链接图片" />
                      </div>
                      <div class="link-info">
                        <div class="link-title">{{ message.linkTitle }}</div>
                        <div class="link-desc">{{ message.linkDesc }}</div>
                        <div class="link-url">{{ message.linkUrl }}</div>
                      </div>
                    </div>
                    <div v-else-if="message.type === 'groupInvite'" class="group-invite-content">
                      <div class="group-invite-header">
                        <a-avatar :src="message.groupAvatar" :size="48" />
                        <div class="group-invite-info">
                          <div class="group-invite-name">{{ message.groupName }}</div>
                          <div class="group-invite-count">{{ message.groupMemberCount }}人</div>
                        </div>
                      </div>
                      <div class="group-invite-reason" v-if="message.inviteReason">{{ message.inviteReason }}</div>
                      <a-button type="primary" size="small" block class="group-invite-btn" @click="handleJoinGroup(message)">加入群聊</a-button>
                    </div>
                    <div v-else-if="message.type === 'contactCard'" class="contact-card-content" @click="handleViewContact(message)">
                      <div class="contact-card-header">
                        <a-avatar :src="message.contactAvatar" :size="48" />
                        <div class="contact-card-info">
                          <div class="contact-card-name">{{ message.contactName }}</div>
                          <div class="contact-card-title">{{ message.contactTitle }}</div>
                          <div class="contact-card-company">{{ message.contactCompany }}</div>
                        </div>
                      </div>
                      <div class="contact-card-footer">个人名片</div>
                    </div>
                    <div v-else-if="message.type === 'location'" class="location-content" @click="handleOpenLocation(message)">
                      <div class="location-map">
                        <img :src="message.locationImage" alt="位置地图" />
                        <div class="location-marker">
                          <EnvironmentOutlined />
                        </div>
                      </div>
                      <div class="location-info">
                        <div class="location-name">{{ message.locationName }}</div>
                        <div class="location-address">{{ message.locationAddress }}</div>
                      </div>
                    </div>
                    <div v-else-if="message.type === 'redPacket'" class="red-packet-content" :class="[message.redPacketStatus, message.redPacketType]" @click="handleOpenRedPacket(message)">
                      <div class="red-packet-icon">
                        <GiftOutlined v-if="message.redPacketType === 'lucky'" />
                        <RedEnvelopeOutlined v-else />
                      </div>
                      <div class="red-packet-info">
                        <div class="red-packet-message">{{ message.redPacketMessage || '恭喜发财，大吉大利' }}</div>
                        <div class="red-packet-status">{{ message.redPacketStatus === 'opened' ? '已领取' : message.redPacketStatus === 'expired' ? '已过期' : '领取红包' }}</div>
                      </div>
                    </div>
                    <div v-else-if="message.type === 'callInvite'" class="call-invite-content" :class="message.callStatus">
                      <div class="call-invite-icon">
                        <PhoneOutlined v-if="message.callType === 'audio'" />
                        <VideoCameraOutlined v-else />
                      </div>
                      <div class="call-invite-info">
                        <div class="call-invite-text">{{ getCallInviteText(message) }}</div>
                        <div class="call-invite-duration" v-if="message.callDuration">{{ message.callDuration }}</div>
                      </div>
                    </div>
                    <div v-else-if="message.type === 'gift'" class="gift-content">
                      <div class="gift-animation">
                        <img :src="message.giftIcon" :alt="message.giftName" />
                      </div>
                      <div class="gift-info">
                        <span class="gift-sender">{{ message.isSelf ? '你' : message.senderName }}</span>
                        <span class="gift-action">送出了</span>
                        <span class="gift-name">{{ message.giftName }}</span>
                        <span class="gift-count">x{{ message.giftCount }}</span>
                      </div>
                    </div>
                    <div v-else-if="message.type === 'favorite'" class="favorite-content" @click="handleOpenFavorite(message)">
                      <div class="favorite-icon">
                        <StarOutlined />
                      </div>
                      <div class="favorite-info">
                        <div class="favorite-title">{{ message.favoriteTitle || '收藏' }}</div>
                        <div class="favorite-content-preview">{{ message.favoriteContent }}</div>
                      </div>
                    </div>
                    <div v-else-if="message.type === 'emoji'" class="emoji-content">
                      <img :src="message.emojiUrl" :alt="message.emojiCode" class="emoji-image" />
                    </div>
                    <div v-else-if="message.type === 'sticker'" class="sticker-content">
                      <img :src="message.stickerUrl" :alt="message.stickerName" class="sticker-image" />
                    </div>
                    <div v-else-if="message.type === 'transfer'" class="transfer-content" :class="message.transferStatus" @click="handleTransferClick(message)">
                      <div class="transfer-icon">
                        <TransactionOutlined />
                      </div>
                      <div class="transfer-info">
                        <div class="transfer-amount">¥{{ message.transferAmount }}</div>
                        <div class="transfer-note">{{ message.transferNote || '转账' }}</div>
                        <div class="transfer-status">{{ getTransferStatusText(message.transferStatus) }}</div>
                      </div>
                    </div>
                    <div v-else-if="message.type === 'miniApp'" class="mini-app-content" @click="handleOpenMiniApp(message)">
                      <div class="mini-app-header">
                        <img :src="message.miniAppIcon" class="mini-app-icon" />
                        <span class="mini-app-name">{{ message.miniAppName }}</span>
                      </div>
                      <div class="mini-app-desc">{{ message.miniAppDesc }}</div>
                      <div class="mini-app-image" v-if="message.miniAppImage">
                        <img :src="message.miniAppImage" />
                      </div>
                      <div class="mini-app-footer">
                        <AppstoreOutlined />
                        <span>小程序</span>
                      </div>
                    </div>
                    <div v-else-if="message.type === 'channels'" class="channels-content" @click="handleOpenChannels(message)">
                      <div class="channels-video">
                        <img :src="message.channelsCover" class="channels-cover" />
                        <div class="channels-play">
                          <PlayCircleOutlined />
                        </div>
                        <div class="channels-duration">{{ message.channelsDuration }}</div>
                      </div>
                      <div class="channels-info">
                        <div class="channels-title">{{ message.channelsTitle }}</div>
                        <div class="channels-meta">
                          <img :src="message.channelsAvatar" class="channels-avatar-small" />
                          <span class="channels-author">{{ message.channelsAuthor }}</span>
                          <span class="channels-stats">
                            <LikeOutlined /> {{ message.channelsLikes }}
                            <EyeOutlined /> {{ message.channelsViews }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div v-else-if="message.type === 'quote'" class="quote-content">
                      <div class="quote-reference" @click="handleScrollToQuote(message.quoteMessageId)">
                        <div class="quote-sender">{{ message.quoteSenderName }}</div>
                        <div class="quote-text">{{ message.quoteContent }}</div>
                      </div>
                      <div class="quote-reply">{{ message.content }}</div>
                    </div>
                    <div v-else-if="message.type === 'forward'" class="forward-content" @click="handleOpenForward(message)">
                      <div class="forward-header">
                        <div class="forward-icon">
                          <MessageOutlined />
                        </div>
                        <div class="forward-title">{{ message.forwardTitle }}</div>
                      </div>
                      <div class="forward-preview">
                        <div v-for="(msg, idx) in message.forwardMessages?.slice(0, 3)" :key="idx" class="forward-item">
                          <span class="forward-sender">{{ msg.sender }}:</span>
                          <span class="forward-text">{{ msg.content }}</span>
                        </div>
                      </div>
                      <div class="forward-footer">
                        <span>{{ message.forwardSenders?.join('、') }} 的 {{ message.forwardCount }} 条消息</span>
                      </div>
                    </div>
                    <div v-else-if="message.type === 'pat'" class="pat-content">
                      <span class="pat-text">{{ message.isSelf ? '你' : message.senderName }} {{ message.patAction }} {{ message.patTarget }}</span>
                    </div>
                  </template>
                </div>
                <div class="message-meta">
                  <span class="message-time">{{ message.time }}</span>
                  <span v-if="message.isSelf && !message.isRecalled" class="message-status">
                    <CheckCircleOutlined v-if="message.status === 'read'" class="read" />
                    <CheckCircleOutlined v-else-if="message.status === 'sent'" />
                    <ClockCircleOutlined v-else-if="message.status === 'sending'" />
                    <CloseCircleOutlined v-else-if="message.status === 'failed'" class="failed" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 输入框 - 仅普通会话显示 -->
        <div v-if="!isSpecialSession && !isAssistantSession" class="chat-input">
          <div class="input-area">
            <a-textarea
              v-model:value="inputMessage"
              placeholder="输入消息..."
              :auto-size="{ minRows: 3, maxRows: 6 }"
              class="chat-textarea"
              @pressEnter="handleSendMessage"
            />
            <div class="input-shortcuts">
              <span class="shortcut-key">Enter</span>
              <span class="shortcut-text">发送</span>
              <span class="shortcut-divider">|</span>
              <span class="shortcut-key">Ctrl+Enter</span>
              <span class="shortcut-text">换行</span>
            </div>
          </div>
          <!-- 工具栏和发送按钮 -->
          <div class="toolbar-container">
            <!-- 私聊工具栏 -->
            <div v-if="!currentSession?.isGroup" class="input-toolbar private-toolbar">
              <a-tooltip title="相册">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('album')">
                  <FileImageOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="拍照">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('camera')">
                  <CameraOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="视频通话">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('videoCall')">
                  <VideoCameraOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="语音通话">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('audioCall')">
                  <PhoneOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="位置">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('location')">
                  <EnvironmentOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="红包">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('redPacket')">
                  <RedEnvelopeOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="礼物">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('gift')">
                  <GiftOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="转账">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('transfer')">
                  <TransactionOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="语音输入(转文字)">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('voiceInput')">
                  <AudioOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="发送语音">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('voiceMessage')">
                  <SoundOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="表情">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('emoji')">
                  <SmileOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="收藏">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('favorite')">
                  <StarOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="名片">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('contactCard')">
                  <IdcardOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="文件">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('file')">
                  <FileOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="音乐">
                <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('music')">
                  <CustomerServiceOutlined />
                </a-button>
              </a-tooltip>
            </div>
          <!-- 群聊工具栏 -->
          <div v-else class="input-toolbar group-toolbar">
            <a-tooltip title="相册">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('album')">
                <FileImageOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="拍照">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('camera')">
                <CameraOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="视频通话">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('videoCall')">
                <VideoCameraOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="语音通话">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('audioCall')">
                <PhoneOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="位置">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('location')">
                <EnvironmentOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="红包">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('redPacket')">
                <RedEnvelopeOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="礼物">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('gift')">
                <GiftOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="转账">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('transfer')">
                <TransactionOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="语音输入(转文字)">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('voiceInput')">
                <AudioOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="发送语音">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('voiceMessage')">
                <SoundOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="表情">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('emoji')">
                <SmileOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="收藏">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('favorite')">
                <StarOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="名片">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('contactCard')">
                <IdcardOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="文件">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('file')">
                <FileOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="音乐">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('music')">
                <CustomerServiceOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="群投票">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('vote')">
                <PieChartOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="群工具">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('groupTool')">
                <AppstoreOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="接龙">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('relay')">
                <OrderedListOutlined />
              </a-button>
            </a-tooltip>
            <a-tooltip title="直播">
              <a-button type="text" class="toolbar-btn" @click="handleToolbarAction('live')">
                <PlayCircleOutlined />
              </a-button>
            </a-tooltip>
          </div>
          <!-- 发送按钮 -->
          <div class="toolbar-send-wrapper">
            <span v-if="inputMessage.length > 0" class="toolbar-char-count">{{ inputMessage.length }} 字</span>
            <a-button 
              type="primary" 
              :disabled="!inputMessage.trim()" 
              @click="handleSendMessage"
              class="toolbar-send-btn"
            >
              <SendOutlined />
              发送
            </a-button>
          </div>
        </div>
        </div>
      </template>

      <!-- 助手类会话的AI对话组件 -->
      <div v-if="isAssistantSession" class="assistant-chatbot-container">
        <Chatbot :show-header="false" @send-message="handleAssistantChatbotMessage" ref="assistantChatbotRef" />
      </div>

      <!-- 空状态 - 仅当没有选中会话时显示 -->
      <div v-if="!currentSession" class="empty-state">
        <div class="empty-content">
          <MessageOutlined class="empty-icon" />
          <h3>欢迎使用天信</h3>
          <p>选择一个会话开始聊天，或点击右上角发起新会话</p>
          <a-button type="primary" @click="handleAddChat">
            <PlusOutlined />
            新建会话
          </a-button>
        </div>
      </div>
    </div>
  </div>

  <!-- 添加好友弹窗 -->
  <AddFriendModal
    :visible="addFriendModalVisible"
    @close="addFriendModalVisible = false"
    @add="handleFriendAdded"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  MessageOutlined,
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  FolderOutlined,
  NotificationOutlined,
  ReadOutlined,
  MailOutlined,
  RobotOutlined,
  SafetyOutlined,
  UploadOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  FileOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileImageOutlined,
  CameraOutlined,
  AudioOutlined,
  SmileOutlined,
  SendOutlined,
  PlayCircleOutlined,
  EnvironmentOutlined,
  GiftOutlined,
  RedEnvelopeOutlined,
  StarOutlined,
  TransactionOutlined,
  AppstoreOutlined,
  ShareAltOutlined,
  LikeOutlined,
  EyeOutlined,
  IdcardOutlined,
  CustomerServiceOutlined,
  PieChartOutlined,
  OrderedListOutlined,
  SoundOutlined,
  SyncOutlined,
  CloudOutlined,
  CloudUploadOutlined,
  CompassOutlined,
  CheckSquareOutlined,
  MobileOutlined,
  SolutionOutlined,
  FileTextOutlined,
  BranchesOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  SwapOutlined,
  ToolOutlined,
  ApiOutlined,
  EditOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons-vue';
import { message as antMessage } from 'ant-design-vue';
import { useChatStore, useCallStore } from '../../stores';
import { APP_URLS } from '../../config/config';
import { im } from '@gitcoffee/api';
import AddFriendModal from '../../components/modals/AddFriendModal.vue';
import { Chatbot } from '@gitcoffee/chatbot-ui';

// API functions available for future use
// const { getSessionListApi, getMessageListApi, sendMessageApi } = im;

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();
const callStore = useCallStore();

// 类型定义
type SessionType = 'private' | 'group' | 'fileTransfer' | 'news' | 'system' | 'email' | 'robot' | 'smartSync' | 'storage' | 'contentSync' | 'search' | 'explore' | 'task' | 'mail' | 'sms' | 'customerService' | 'ticket' | 'workflow' | 'report' | 'statistics' | 'payment' | 'trade' | 'agent' | 'skill' | 'claw' | 'creation' | 'miniApp' | 'share' | 'collaborate';

const searchKeyword = ref('');
const inputMessage = ref('');
const aiInputMessage = ref('');
const activeTab = ref('all');
const messageListRef = ref<HTMLElement | null>(null);

// 分类栏相关
const isCategoryExpanded = ref(false);
const activeCategory = ref<string | null>(null);

// 分类定义
const categories = [
  { key: 'assistant', name: '助手', icon: 'CustomerServiceOutlined' },
  { key: 'agent', name: '智能体', icon: 'RobotOutlined' },
  { key: 'skill', name: 'Skill', icon: 'ToolOutlined' },
  { key: 'claw', name: 'Claw', icon: 'ApiOutlined' },
  { key: 'official', name: '天信号', icon: 'ReadOutlined' },
  { key: 'miniApp', name: '小应用', icon: 'AppstoreOutlined' }
];

// 可见分类（根据展开状态显示不同数量）
const visibleCategories = computed(() => {
  if (isCategoryExpanded.value) {
    return categories;
  }
  // 折叠状态只显示前4个
  return categories.slice(0, 4);
});

// 是否有更多分类
const hasMoreCategories = computed(() => {
  return categories.length > 4;
});

// 处理分类点击
const handleCategoryClick = (categoryKey: string) => {
  if (activeCategory.value === categoryKey) {
    activeCategory.value = null;
    // 重置筛选，显示全部
    activeTab.value = 'all';
  } else {
    activeCategory.value = categoryKey;
    // 根据分类筛选会话
    filterSessionsByCategory(categoryKey);
  }
};

// 根据分类筛选会话
const filterSessionsByCategory = (categoryKey: string) => {
  const categorySessionTypes: Record<string, SessionType[]> = {
    'assistant': ['smartSync', 'storage', 'contentSync', 'search', 'explore', 'task', 'mail', 'sms', 'customerService', 'ticket', 'workflow', 'report', 'statistics', 'payment', 'trade', 'creation'],
    'agent': ['agent'],
    'skill': ['skill'],
    'claw': ['claw'],
    'official': ['news', 'system', 'email', 'robot'],
    'miniApp': ['miniApp']
  };
  
  const types = categorySessionTypes[categoryKey] || [];
  // 这里可以设置一个筛选状态，用于过滤会话列表
  // 暂时通过 activeTab 来标记
  activeTab.value = `category_${categoryKey}`;
};

interface SessionItem {
  id: string;
  title: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  isGroup: boolean;
  sessionType: SessionType;
  senderName?: string;
  memberCount?: number;
}

interface MessageItem {
  id: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'news' | 'music' | 'link' | 'groupInvite' | 'contactCard' | 'location' | 'redPacket' | 'callInvite' | 'gift' | 'favorite' | 'emoji' | 'sticker' | 'transfer' | 'miniApp' | 'channels' | 'quote' | 'forward' | 'pat';
  content: string;
  avatar: string;
  senderName: string;
  senderId: string;
  isSelf: boolean;
  time: string;
  status: 'sending' | 'sent' | 'read' | 'failed';
  fileName?: string;
  fileSize?: string;
  isRecalled?: boolean;
  originalContent?: string;
  // 资讯相关字段
  newsTitle?: string;
  newsSummary?: string;
  newsImage?: string;
  newsSource?: string;
  newsTag?: string;
  // 音乐相关字段
  musicName?: string;
  musicArtist?: string;
  musicCover?: string;
  musicDuration?: string;
  // 链接相关字段
  linkTitle?: string;
  linkDesc?: string;
  linkImage?: string;
  linkUrl?: string;
  // 视频相关字段
  videoCover?: string;
  videoDuration?: string;
  videoWidth?: number;
  videoHeight?: number;
  // 群邀请相关字段
  groupName?: string;
  groupAvatar?: string;
  groupMemberCount?: number;
  inviteReason?: string;
  // 名片相关字段
  contactName?: string;
  contactAvatar?: string;
  contactTitle?: string;
  contactCompany?: string;
  // 位置相关字段
  locationName?: string;
  locationAddress?: string;
  locationLat?: number;
  locationLng?: number;
  locationImage?: string;
  // 红包相关字段
  redPacketType?: 'normal' | 'lucky';
  redPacketAmount?: string;
  redPacketCount?: number;
  redPacketMessage?: string;
  redPacketStatus?: 'pending' | 'opened' | 'expired';
  // 通话邀请相关字段
  callType?: 'audio' | 'video';
  callStatus?: 'inviting' | 'connected' | 'ended' | 'missed';
  callDuration?: string;
  // 礼物相关字段
  giftName?: string;
  giftIcon?: string;
  giftCount?: number;
  // 收藏相关字段
  favoriteType?: 'text' | 'image' | 'link' | 'file';
  favoriteTitle?: string;
  favoriteContent?: string;
  // 表情/动图相关字段
  emojiCode?: string;
  emojiUrl?: string;
  stickerUrl?: string;
  stickerName?: string;
  // 转账相关字段
  transferAmount?: string;
  transferStatus?: 'pending' | 'received' | 'refunded';
  transferNote?: string;
  transferTime?: string;
  // 小程序相关字段
  miniAppName?: string;
  miniAppIcon?: string;
  miniAppDesc?: string;
  miniAppPage?: string;
  miniAppImage?: string;
  // 视频号相关字段
  channelsTitle?: string;
  channelsAuthor?: string;
  channelsAvatar?: string;
  channelsCover?: string;
  channelsDuration?: string;
  channelsViews?: string;
  channelsLikes?: string;
  // 引用回复相关字段
  quoteMessageId?: string;
  quoteContent?: string;
  quoteSenderName?: string;
  quoteMessageType?: string;
  // 合并转发相关字段
  forwardTitle?: string;
  forwardCount?: number;
  forwardSenders?: string[];
  forwardMessages?: { sender: string; content: string; type: string }[];
  // 拍一拍相关字段
  patTarget?: string;
  patAction?: string;
}

const sessions = ref<SessionItem[]>([
  {
    id: '1',
    title: '文件传输助手',
    avatar: '',
    lastMessage: '项目资料.zip 已发送',
    lastTime: '刚刚',
    unread: 0,
    online: true,
    isGroup: false,
    sessionType: 'fileTransfer'
  },
  {
    id: '2',
    title: '系统通知',
    avatar: '',
    lastMessage: '您的账号登录成功',
    lastTime: '5分钟前',
    unread: 1,
    online: true,
    isGroup: false,
    sessionType: 'system'
  },
  {
    id: '3',
    title: '每日资讯',
    avatar: '',
    lastMessage: '今日科技热点：AI技术新突破',
    lastTime: '30分钟前',
    unread: 3,
    online: true,
    isGroup: false,
    sessionType: 'news'
  },
  {
    id: '4',
    title: '邮箱提醒',
    avatar: '',
    lastMessage: '您有2封未读邮件',
    lastTime: '1小时前',
    unread: 2,
    online: true,
    isGroup: false,
    sessionType: 'email'
  },
  {
    id: '5',
    title: 'ImSky助手',
    avatar: '',
    lastMessage: '您好，有什么可以帮助您的吗？',
    lastTime: '2小时前',
    unread: 0,
    online: true,
    isGroup: false,
    sessionType: 'robot'
  },
  {
    id: '6',
    title: '智能同步助手',
    avatar: '',
    lastMessage: '剪贴板内容已同步到手机',
    lastTime: '刚刚',
    unread: 1,
    online: true,
    isGroup: false,
    sessionType: 'smartSync'
  },
  {
    id: '7',
    title: '存储助手',
    avatar: '',
    lastMessage: '云存储空间使用 12.5GB/50GB',
    lastTime: '10分钟前',
    unread: 0,
    online: true,
    isGroup: false,
    sessionType: 'storage'
  },
  {
    id: '8',
    title: '内容同步助手',
    avatar: '',
    lastMessage: '文章已成功同步发布到 5 个平台',
    lastTime: '刚刚',
    unread: 2,
    online: true,
    isGroup: false,
    sessionType: 'contentSync'
  },
  {
    id: 'search-assistant',
    title: '个性化搜索助手',
    avatar: '',
    lastMessage: '已为您搜索到 128 条相关结果',
    lastTime: '刚刚',
    unread: 0,
    online: true,
    isGroup: false,
    sessionType: 'search'
  },
  {
    id: 'explore-assistant',
    title: '智能探索助手',
    avatar: '',
    lastMessage: '深度思考完成，为您生成分析报告',
    lastTime: '2分钟前',
    unread: 1,
    online: true,
    isGroup: false,
    sessionType: 'explore'
  },
  {
    id: 'task-assistant',
    title: '任务助手',
    avatar: '',
    lastMessage: '您有 3 个待办任务即将到期',
    lastTime: '5分钟前',
    unread: 3,
    online: true,
    isGroup: false,
    sessionType: 'task'
  },
  {
    id: 'mail-assistant',
    title: '邮件助手',
    avatar: '',
    lastMessage: '已为您发送邮件给张经理',
    lastTime: '10分钟前',
    unread: 0,
    online: true,
    isGroup: false,
    sessionType: 'mail'
  },
  {
    id: 'sms-assistant',
    title: '短信助手',
    avatar: '',
    lastMessage: '验证码短信已发送成功',
    lastTime: '刚刚',
    unread: 1,
    online: true,
    isGroup: false,
    sessionType: 'sms'
  },
  {
    id: 'customer-service-assistant',
    title: '客服助手',
    avatar: '',
    lastMessage: '已为您转接人工客服',
    lastTime: '15分钟前',
    unread: 0,
    online: true,
    isGroup: false,
    sessionType: 'customerService'
  },
  {
    id: 'ticket-assistant',
    title: '工单助手',
    avatar: '',
    lastMessage: '工单 #2024-001 已处理完成',
    lastTime: '30分钟前',
    unread: 1,
    online: true,
    isGroup: false,
    sessionType: 'ticket'
  },
  {
    id: 'workflow-assistant',
    title: '流程助手',
    avatar: '',
    lastMessage: '审批流程已自动通过',
    lastTime: '1小时前',
    unread: 0,
    online: true,
    isGroup: false,
    sessionType: 'workflow'
  },
  {
    id: 'report-assistant',
    title: '报表助手',
    avatar: '',
    lastMessage: '月度销售报表已生成',
    lastTime: '刚刚',
    unread: 1,
    online: true,
    isGroup: false,
    sessionType: 'report'
  },
  {
    id: 'statistics-assistant',
    title: '统计助手',
    avatar: '',
    lastMessage: '本周数据增长 23%，表现良好',
    lastTime: '5分钟前',
    unread: 0,
    online: true,
    isGroup: false,
    sessionType: 'statistics'
  },
  {
    id: 'payment-assistant',
    title: '支付助手',
    avatar: '',
    lastMessage: '支付订单 #2024-888 已完成',
    lastTime: '10分钟前',
    unread: 1,
    online: true,
    isGroup: false,
    sessionType: 'payment'
  },
  {
    id: 'trade-assistant',
    title: '交易助手',
    avatar: '',
    lastMessage: '今日交易对账完成，无异常',
    lastTime: '30分钟前',
    unread: 0,
    online: true,
    isGroup: false,
    sessionType: 'trade'
  },
  {
    id: 'agent-assistant',
    title: '智能体助手',
    avatar: '',
    lastMessage: '智能体 "数据分析师" 已完成任务',
    lastTime: '刚刚',
    unread: 2,
    online: true,
    isGroup: false,
    sessionType: 'agent'
  },
  {
    id: 'skill-assistant',
    title: 'Skill助手',
    avatar: '',
    lastMessage: '新技能 "PDF转Word" 已安装',
    lastTime: '1小时前',
    unread: 0,
    online: true,
    isGroup: false,
    sessionType: 'skill'
  },
  {
    id: 'claw-assistant',
    title: 'Claw助手',
    avatar: '',
    lastMessage: 'API 接口测试全部通过',
    lastTime: '2小时前',
    unread: 0,
    online: true,
    isGroup: false,
    sessionType: 'claw'
  },
  {
    id: 'creation-assistant',
    title: '创作助手',
    avatar: '',
    lastMessage: '文章创作完成，已保存到草稿箱',
    lastTime: '刚刚',
    unread: 1,
    online: true,
    isGroup: false,
    sessionType: 'creation'
  },
  {
    id: 'miniApp-assistant',
    title: '小应用助手',
    avatar: '',
    lastMessage: '新应用 "天气查询" 已安装',
    lastTime: '10分钟前',
    unread: 0,
    online: true,
    isGroup: false,
    sessionType: 'miniApp'
  },
  {
    id: 'share-assistant',
    title: '分享助手',
    avatar: '',
    lastMessage: '已生成分享链接，可一键分享至社交平台',
    lastTime: '刚刚',
    unread: 1,
    online: true,
    isGroup: false,
    sessionType: 'share'
  },
  {
    id: 'collaborate-assistant',
    title: '共享助手',
    avatar: '',
    lastMessage: '文档协作邀请：项目计划书.pdf',
    lastTime: '5分钟前',
    unread: 2,
    online: true,
    isGroup: false,
    sessionType: 'collaborate'
  },
  {
    id: '19',
    title: '技术交流群',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=group1',
    lastMessage: '欢迎大家加入技术交流群',
    lastTime: '刚刚',
    unread: 5,
    online: true,
    isGroup: true,
    sessionType: 'group',
    senderName: '群主',
    memberCount: 128
  },
  {
    id: '10',
    title: '张小明',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm',
    lastMessage: '好的，我马上处理',
    lastTime: '10分钟前',
    unread: 2,
    online: true,
    isGroup: false,
    sessionType: 'private'
  },
  {
    id: '11',
    title: '产品经理李华',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lihua',
    lastMessage: '新版本的需求文档已上传',
    lastTime: '30分钟前',
    unread: 0,
    online: false,
    isGroup: false,
    sessionType: 'private'
  },
  {
    id: '12',
    title: '前端开发组',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=frontend',
    lastMessage: '关于Vue3的性能优化讨论',
    lastTime: '1小时前',
    unread: 12,
    online: true,
    isGroup: true,
    sessionType: 'group',
    senderName: '王工',
    memberCount: 45
  },
  {
    id: '13',
    title: '陈思思',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=css',
    lastMessage: '周末一起去逛街吗？',
    lastTime: '2小时前',
    unread: 1,
    online: true,
    isGroup: false,
    sessionType: 'private'
  },
  {
    id: '14',
    title: '工作通知',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=work',
    lastMessage: '【通知】明天下午3点开会',
    lastTime: '昨天',
    unread: 0,
    online: true,
    isGroup: true,
    sessionType: 'group',
    senderName: '系统',
    memberCount: 256
  },
  {
    id: '15',
    title: '刘老师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liulaoshi',
    lastMessage: '作业已批改，请查收',
    lastTime: '昨天',
    unread: 0,
    online: false,
    isGroup: false,
    sessionType: 'private'
  },
  {
    id: '16',
    title: '美食分享群',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=food',
    lastMessage: '这家餐厅的招牌菜很不错',
    lastTime: '3天前',
    unread: 0,
    online: true,
    isGroup: true,
    sessionType: 'group',
    senderName: '美食达人',
    memberCount: 89
  },
  {
    id: '17',
    title: '设计讨论群',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=design',
    lastMessage: '设计规范.sketch',
    lastTime: '09:15',
    unread: 2,
    online: true,
    isGroup: true,
    sessionType: 'group',
    senderName: '设计师小王',
    memberCount: 12
  },
  {
    id: '15',
    title: '家人群',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=family',
    lastMessage: '哈哈，我也想吃',
    lastTime: '08:35',
    unread: 0,
    online: true,
    isGroup: true,
    sessionType: 'group',
    senderName: '我',
    memberCount: 5
  }
]);

const messages = ref<Record<string, MessageItem[]>>({
  // 文件传输助手 - 支持双向聊天和文件传输
  '1': [
    { id: '1', type: 'text', content: '欢迎使用文件传输助手！你可以在这里发送和接收文件，也可以直接聊天。', avatar: '', senderName: '文件传输助手', senderId: 'fileTransfer', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read', fileName: '项目资料.zip', fileSize: '156 MB' },
    { id: '3', type: 'text', content: '文件已发送成功，请在手机端查看', avatar: '', senderName: '文件传输助手', senderId: 'fileTransfer', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '4', type: 'text', content: '好的，我收到了', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone', senderName: '我的手机', senderId: 'phone', isSelf: false, time: '刚刚', status: 'sent' },
    // 从手机端接收的文件
    { id: '5', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone', senderName: '我的手机', senderId: 'phone', isSelf: false, time: '5分钟前', status: 'sent', fileName: '手机照片备份.zip', fileSize: '523 MB' },
    { id: '6', type: 'text', content: '手机照片已备份到电脑', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone', senderName: '我的手机', senderId: 'phone', isSelf: false, time: '5分钟前', status: 'sent' },
    { id: '7', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '昨天', status: 'read', fileName: '设计稿_v2.psd', fileSize: '45 MB' },
    { id: '8', type: 'image', content: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&h=300&fit=crop', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '昨天', status: 'read' },
    { id: '9', type: 'text', content: '设计稿预览图已生成', avatar: '', senderName: '文件传输助手', senderId: 'fileTransfer', isSelf: false, time: '昨天', status: 'sent' },
    { id: '10', type: 'text', content: '收到了，设计看起来不错', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone', senderName: '我的手机', senderId: 'phone', isSelf: false, time: '昨天', status: 'sent' },
    // 从手机端接收的截图
    { id: '11', type: 'image', content: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone', senderName: '我的手机', senderId: 'phone', isSelf: false, time: '昨天', status: 'sent' },
    { id: '12', type: 'text', content: '这是手机上的截图', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone', senderName: '我的手机', senderId: 'phone', isSelf: false, time: '昨天', status: 'sent' },
    { id: '13', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '3天前', status: 'read', fileName: '会议录音.mp3', fileSize: '12 MB' },
    { id: '14', type: 'text', content: '会议录音已保存', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone', senderName: '我的手机', senderId: 'phone', isSelf: false, time: '3天前', status: 'sent' },
    // 从手机端接收的文档
    { id: '15', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone', senderName: '我的手机', senderId: 'phone', isSelf: false, time: '4天前', status: 'sent', fileName: '手机通讯录导出.vcf', fileSize: '156 KB' },
    { id: '16', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '上周', status: 'read', fileName: '年终总结.docx', fileSize: '856 KB' },
    // 从手机端接收的视频
    { id: '17', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone', senderName: '我的手机', senderId: 'phone', isSelf: false, time: '上周', status: 'sent', fileName: '旅行视频片段.mp4', fileSize: '128 MB' },
    { id: '18', type: 'text', content: '这是上周旅行拍的视频', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone', senderName: '我的手机', senderId: 'phone', isSelf: false, time: '上周', status: 'sent' },
    { id: '19', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '2周前', status: 'read', fileName: '产品演示视频.mp4', fileSize: '234 MB' },
    { id: '20', type: 'text', content: '视频文件较大，建议在WiFi环境下下载', avatar: '', senderName: '文件传输助手', senderId: 'fileTransfer', isSelf: false, time: '2周前', status: 'sent' },
    { id: '21', type: 'text', content: '好的，等我有WiFi再下载', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone', senderName: '我的手机', senderId: 'phone', isSelf: false, time: '2周前', status: 'sent' }
  ],
  // 系统通知
  '2': [
    { id: '1', type: 'text', content: '您的账号在 MacBook Pro 登录成功', avatar: '', senderName: '系统通知', senderId: 'system', isSelf: false, time: '5分钟前', status: 'sent' },
    { id: '2', type: 'text', content: '密码修改成功，请妥善保管新密码', avatar: '', senderName: '系统通知', senderId: 'system', isSelf: false, time: '昨天', status: 'sent' },
    { id: '3', type: 'text', content: '您的账号已完成实名认证', avatar: '', senderName: '系统通知', senderId: 'system', isSelf: false, time: '3天前', status: 'sent' },
    { id: '4', type: 'text', content: '检测到异地登录，请确认是否为本人操作', avatar: '', senderName: '安全提醒', senderId: 'security', isSelf: false, time: '1周前', status: 'sent' },
    { id: '5', type: 'text', content: '您的会员即将到期，请及时续费', avatar: '', senderName: '系统通知', senderId: 'system', isSelf: false, time: '2周前', status: 'sent' }
  ],
  // 每日资讯
  '3': [
    {
      id: '1',
      type: 'news',
      content: '',
      avatar: '',
      senderName: '每日资讯',
      senderId: 'news',
      isSelf: false,
      time: '30分钟前',
      status: 'sent',
      newsTag: '科技',
      newsTitle: 'OpenAI 发布 GPT-5，性能提升显著，多模态能力全面突破',
      newsSummary: 'OpenAI 今日正式发布 GPT-5 模型，在推理能力、代码生成、多语言支持等方面均有大幅提升。新模型支持更长的上下文窗口，可处理长达 100万 token 的文本...',
      newsImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
      newsSource: '科技前沿'
    },
    {
      id: '2',
      type: 'news',
      content: '',
      avatar: '',
      senderName: '每日资讯',
      senderId: 'news',
      isSelf: false,
      time: '昨天',
      status: 'sent',
      newsTag: '财经',
      newsTitle: '今日股市收盘：上证指数涨 1.2%，创业板指涨 2.3%',
      newsSummary: '今日A股三大指数集体收涨，上证指数报 3050.32 点，上涨 1.2%；深证成指报 9876.54 点，上涨 1.8%；创业板指报 1890.21 点，上涨 2.3%...',
      newsImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
      newsSource: '财经早报'
    },
    {
      id: '3',
      type: 'news',
      content: '',
      avatar: '',
      senderName: '每日资讯',
      senderId: 'news',
      isSelf: false,
      time: '2天前',
      status: 'sent',
      newsTag: '体育',
      newsTitle: 'NBA 季后赛：湖人队 4-2 淘汰勇士晋级西部决赛',
      newsSummary: '在今日结束的 NBA 季后赛西部半决赛第六场比赛中，洛杉矶湖人队主场以 122-101 战胜金州勇士队，总比分 4-2 晋级西部决赛...',
      newsImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
      newsSource: '体育快讯'
    },
    {
      id: '4',
      type: 'news',
      content: '',
      avatar: '',
      senderName: '每日资讯',
      senderId: 'news',
      isSelf: false,
      time: '3天前',
      status: 'sent',
      newsTag: '生活',
      newsTitle: '春季养生指南：这5种食物助你增强免疫力',
      newsSummary: '春季是养生的好时节，合理的饮食可以帮助我们增强免疫力。专家建议多食用新鲜蔬菜水果，适量补充蛋白质，保持规律作息...',
      newsImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
      newsSource: '健康生活'
    },
    {
      id: '5',
      type: 'news',
      content: '',
      avatar: '',
      senderName: '每日资讯',
      senderId: 'news',
      isSelf: false,
      time: '4天前',
      status: 'sent',
      newsTag: '娱乐',
      newsTitle: '第96届奥斯卡金像奖获奖名单揭晓',
      newsSummary: '第96届奥斯卡金像奖颁奖典礼在洛杉矶举行，《奥本海默》成为最大赢家，斩获最佳影片、最佳导演等7项大奖...',
      newsImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop',
      newsSource: '娱乐八卦'
    }
  ],
  // 邮箱提醒
  '4': [
    { id: '1', type: 'text', content: '您收到来自 "产品经理李华" 的新邮件：关于Q4产品规划', avatar: '', senderName: '邮箱提醒', senderId: 'email', isSelf: false, time: '1小时前', status: 'sent' },
    { id: '2', type: 'text', content: '您收到来自 "HR部门" 的新邮件：月度考勤统计', avatar: '', senderName: '邮箱提醒', senderId: 'email', isSelf: false, time: '昨天', status: 'sent' },
    { id: '3', type: 'text', content: '您收到来自 "CTO" 的新邮件：技术架构评审会议通知', avatar: '', senderName: '邮箱提醒', senderId: 'email', isSelf: false, time: '2天前', status: 'sent' },
    { id: '4', type: 'text', content: '您收到来自 "财务部门" 的新邮件：报销审批结果', avatar: '', senderName: '邮箱提醒', senderId: 'email', isSelf: false, time: '3天前', status: 'sent' }
  ],
  // ImSky助手
  '5': [
    { id: '1', type: 'text', content: '您好！我是 ImSky 智能助手，有什么可以帮助您的吗？', avatar: '', senderName: 'ImSky助手', senderId: 'robot', isSelf: false, time: '2小时前', status: 'sent' },
    { id: '2', type: 'text', content: '您可以问我关于产品使用、技术支持、常见问题等方面的内容', avatar: '', senderName: 'ImSky助手', senderId: 'robot', isSelf: false, time: '2小时前', status: 'sent' },
    { id: '3', type: 'text', content: '如何创建群聊？', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '1小时前', status: 'read' },
    { id: '4', type: 'text', content: '您可以在通讯录中选择"发起群聊"，然后选择要邀请的好友即可创建群聊。', avatar: '', senderName: 'ImSky助手', senderId: 'robot', isSelf: false, time: '1小时前', status: 'sent' }
  ],
  // 智能同步助手 - 剪贴板同步、跨设备同步
  '6': [
    { id: '1', type: 'text', content: '欢迎使用智能同步助手！我可以帮助你在不同设备间同步剪贴板内容、笔记和待办事项。', avatar: '', senderName: '智能同步助手', senderId: 'smartSync', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '剪贴板内容已同步到手机', avatar: '', senderName: '智能同步助手', senderId: 'smartSync', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '3', type: 'text', content: 'https://github.com/gitcoffee-os/imsky', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '已同步到 3 台设备：iPhone 15 Pro、iPad Air、MacBook Pro', avatar: '', senderName: '智能同步助手', senderId: 'smartSync', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '5', type: 'text', content: '手机截图已同步到电脑', avatar: '', senderName: '智能同步助手', senderId: 'smartSync', isSelf: false, time: '5分钟前', status: 'sent' },
    { id: '6', type: 'image', content: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop', avatar: '', senderName: '智能同步助手', senderId: 'smartSync', isSelf: false, time: '5分钟前', status: 'sent' },
    { id: '7', type: 'text', content: '待办事项同步完成', avatar: '', senderName: '智能同步助手', senderId: 'smartSync', isSelf: false, time: '10分钟前', status: 'sent' },
    { id: '8', type: 'text', content: '• 完成项目文档编写\n• 预约周三的会议\n• 购买办公用品', avatar: '', senderName: '智能同步助手', senderId: 'smartSync', isSelf: false, time: '10分钟前', status: 'sent' },
    { id: '9', type: 'text', content: '昨天的笔记已同步', avatar: '', senderName: '智能同步助手', senderId: 'smartSync', isSelf: false, time: '昨天', status: 'sent' },
    { id: '10', type: 'text', content: '会议纪要：\n1. 确定产品发布时间为下月初\n2. 设计团队需要在本周五前完成UI评审\n3. 后端API接口已更新到v2.0', avatar: '', senderName: '智能同步助手', senderId: 'smartSync', isSelf: false, time: '昨天', status: 'sent' }
  ],
  // 存储助手 - 云存储空间管理
  '7': [
    { id: '1', type: 'text', content: '欢迎使用存储助手！我可以帮你管理云存储空间，查看存储使用情况。', avatar: '', senderName: '存储助手', senderId: 'storage', isSelf: false, time: '10分钟前', status: 'sent' },
    { id: '2', type: 'text', content: '云存储空间使用 12.5GB/50GB', avatar: '', senderName: '存储助手', senderId: 'storage', isSelf: false, time: '10分钟前', status: 'sent' },
    { id: '3', type: 'text', content: '存储分析：\n📁 文档文件：4.2GB\n🖼️ 图片视频：6.8GB\n📦 应用备份：1.5GB', avatar: '', senderName: '存储助手', senderId: 'storage', isSelf: false, time: '10分钟前', status: 'sent' },
    { id: '4', type: 'text', content: '自动备份已开启', avatar: '', senderName: '存储助手', senderId: 'storage', isSelf: false, time: '1小时前', status: 'sent' },
    { id: '5', type: 'text', content: '每天凌晨 2:00 自动备份聊天记录和文件', avatar: '', senderName: '存储助手', senderId: 'storage', isSelf: false, time: '1小时前', status: 'sent' },
    { id: '6', type: 'text', content: '大文件清理建议', avatar: '', senderName: '存储助手', senderId: 'storage', isSelf: false, time: '昨天', status: 'sent' },
    { id: '7', type: 'text', content: '发现 3 个超过 500MB 的文件：\n1. 产品演示视频.mp4 (234MB)\n2. 手机照片备份.zip (523MB)\n3. 设计素材包.psd (189MB)', avatar: '', senderName: '存储助手', senderId: 'storage', isSelf: false, time: '昨天', status: 'sent' },
    { id: '8', type: 'text', content: '最近删除的文件已保留 30 天，到期后将自动清理', avatar: '', senderName: '存储助手', senderId: 'storage', isSelf: false, time: '3天前', status: 'sent' }
  ],
  // 技术交流群 - 包含群邀请、名片、位置、红包、通话邀请、礼物、收藏
  '19': [
    { id: '1', type: 'text', content: '欢迎大家加入技术交流群', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=admin', senderName: '群主', senderId: 'admin', isSelf: false, time: '09:00', status: 'sent' },
    { id: '2', type: 'groupInvite', content: '', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=admin', senderName: '群主', senderId: 'admin', isSelf: false, time: '09:01', status: 'sent', groupName: '前端进阶交流群', groupAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=frontend2', groupMemberCount: 256, inviteReason: '邀请你加入前端进阶交流群，一起学习成长' },
    { id: '3', type: 'text', content: '请大家自我介绍一下吧', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=admin', senderName: '群主', senderId: 'admin', isSelf: false, time: '09:02', status: 'sent' },
    { id: '4', type: 'contactCard', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', senderName: '王工', senderId: 'user1', isSelf: false, time: '09:05', status: 'sent', contactName: '王工程师', contactAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', contactTitle: '高级前端工程师', contactCompany: 'GitCoffee科技' },
    { id: '5', type: 'text', content: '欢迎欢迎！我是后端开发，主要用Java和Go', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', senderName: '李后端', senderId: 'user2', isSelf: false, time: '09:06', status: 'sent' },
    { id: '6', type: 'image', content: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', senderName: '王工', senderId: 'user1', isSelf: false, time: '09:10', status: 'sent' },
    { id: '7', type: 'text', content: '分享一张我们项目的架构图', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', senderName: '王工', senderId: 'user1', isSelf: false, time: '09:11', status: 'sent' },
    { id: '8', type: 'location', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', senderName: '李后端', senderId: 'user2', isSelf: false, time: '09:15', status: 'sent', locationName: 'GitCoffee科技园', locationAddress: '北京市海淀区中关村软件园', locationLat: 39.999, locationLng: 116.326, locationImage: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=400&h=200&fit=crop' },
    { id: '9', type: 'text', content: '这是我们公司地址，周末有空可以来玩', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', senderName: '李后端', senderId: 'user2', isSelf: false, time: '09:16', status: 'sent' },
    { id: '10', type: 'redPacket', content: '', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=admin', senderName: '群主', senderId: 'admin', isSelf: false, time: '09:20', status: 'sent', redPacketType: 'normal', redPacketAmount: '200', redPacketCount: 10, redPacketMessage: '庆祝群成员突破500人！', redPacketStatus: 'pending' },
    { id: '11', type: 'text', content: '抢到红包了，谢谢群主！', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', senderName: '王工', senderId: 'user1', isSelf: false, time: '09:21', status: 'sent' },
    { id: '12', type: 'callInvite', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', senderName: '李后端', senderId: 'user2', isSelf: false, time: '09:30', status: 'sent', callType: 'audio', callStatus: 'ended', callDuration: '15:32' },
    { id: '13', type: 'gift', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3', senderName: '前端小王', senderId: 'user3', isSelf: false, time: '09:35', status: 'sent', giftName: '火箭', giftIcon: 'https://cdn-icons-png.flaticon.com/128/947/947694.png', giftCount: 3 },
    { id: '14', type: 'favorite', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', senderName: '王工', senderId: 'user1', isSelf: false, time: '09:40', status: 'sent', favoriteType: 'link', favoriteTitle: 'Vue3 官方文档', favoriteContent: 'https://vuejs.org/' },
    { id: '15', type: 'text', content: '这个文档很有用，收藏了', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', senderName: '王工', senderId: 'user1', isSelf: false, time: '09:41', status: 'sent' },
    { id: '16', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', senderName: '李后端', senderId: 'user2', isSelf: false, time: '09:45', status: 'sent', fileName: 'API接口文档.md', fileSize: '25 KB' },
    { id: '17', type: 'text', content: '这是最新的接口文档，大家看一下', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', senderName: '李后端', senderId: 'user2', isSelf: false, time: '09:46', status: 'sent' },
    { id: '18', type: 'text', content: '收到，我下午看一下', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '09:50', status: 'read' },
    { id: '19', type: 'text', content: '大家觉得Vue3的Composition API怎么样？', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3', senderName: '前端小王', senderId: 'user3', isSelf: false, time: '10:00', status: 'sent' },
    { id: '20', type: 'text', content: '用起来很爽，逻辑复用方便多了', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', senderName: '王工', senderId: 'user1', isSelf: false, time: '10:05', status: 'sent' },
    { id: '21', type: 'text', content: '确实，比mixin清晰多了', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '10:06', status: 'read' },
    { id: '22', type: 'callInvite', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '10:30', status: 'read', callType: 'video', callStatus: 'missed' },
    { id: '23', type: 'redPacket', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '10:35', status: 'read', redPacketType: 'lucky', redPacketAmount: '100', redPacketCount: 5, redPacketMessage: '手气红包，快来抢！', redPacketStatus: 'opened' },
    { id: '24', type: 'emoji', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', senderName: '王工', senderId: 'user1', isSelf: false, time: '10:40', status: 'sent', emojiCode: '[微笑]', emojiUrl: 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f600.png' },
    { id: '25', type: 'sticker', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', senderName: '李后端', senderId: 'user2', isSelf: false, time: '10:42', status: 'sent', stickerName: '点赞', stickerUrl: 'https://media.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif' },
    { id: '26', type: 'transfer', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3', senderName: '前端小王', senderId: 'user3', isSelf: false, time: '10:45', status: 'sent', transferAmount: '520.00', transferStatus: 'pending', transferNote: '生日快乐！', transferTime: '2024-01-15 10:45' },
    { id: '27', type: 'miniApp', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', senderName: '王工', senderId: 'user1', isSelf: false, time: '10:50', status: 'sent', miniAppName: '美团外卖', miniAppIcon: 'https://via.placeholder.com/40/FFD100/000000?text=美团', miniAppDesc: '附近美食，30分钟送达', miniAppImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
    { id: '28', type: 'channels', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', senderName: '李后端', senderId: 'user2', isSelf: false, time: '11:00', status: 'sent', channelsTitle: '2024年最值得学习的5个前端技术', channelsAuthor: '技术大咖', channelsAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech', channelsCover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop', channelsDuration: '08:32', channelsViews: '12.5万', channelsLikes: '3.2万' },
    { id: '29', type: 'quote', content: '确实，TypeScript 是前端开发的必备技能了', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', senderName: '王工', senderId: 'user1', isSelf: false, time: '11:05', status: 'sent', quoteMessageId: '19', quoteContent: '大家觉得Vue3的Composition API怎么样？', quoteSenderName: '前端小王', quoteMessageType: 'text' },
    { id: '30', type: 'forward', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3', senderName: '前端小王', senderId: 'user3', isSelf: false, time: '11:10', status: 'sent', forwardTitle: '群聊的聊天记录', forwardCount: 5, forwardSenders: ['王工', '李后端'], forwardMessages: [{ sender: '王工', content: '大家觉得Vue3的Composition API怎么样？', type: 'text' }, { sender: '李后端', content: '用起来很爽，逻辑复用方便多了', type: 'text' }, { sender: '王工', content: '[图片]', type: 'image' }] },
    { id: '31', type: 'pat', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', senderName: '王工', senderId: 'user1', isSelf: false, time: '11:15', status: 'sent', patTarget: '前端小王', patAction: '拍了拍' },
    { id: '32', type: 'transfer', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '11:20', status: 'read', transferAmount: '200.00', transferStatus: 'received', transferNote: '谢谢！', transferTime: '2024-01-15 11:20' }
  ],
  // 内容同步助手 - 同步发布到主流媒体平台
  '8': [
    { id: '1', type: 'text', content: '欢迎使用内容同步助手！我可以帮助你将文章、笔记、动态、图片、视频、音频等内容，一键同步发布至主流媒体平台。', avatar: '', senderName: '内容同步助手', senderId: 'contentSync', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '📱 已连接平台：微信公众号、微博、知乎、抖音、小红书、B站、今日头条、百家号', avatar: '', senderName: '内容同步助手', senderId: 'contentSync', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '3', type: 'text', content: '我要发布一篇技术文章', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '好的，请发送你要发布的文章内容，支持图文、Markdown、链接等多种形式。', avatar: '', senderName: '内容同步助手', senderId: 'contentSync', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '5', type: 'text', content: 'Vue3 + TypeScript 实战教程：从入门到精通\n\n本文将带你深入了解 Vue3 的 Composition API 和 TypeScript 的结合使用...', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '5分钟前', status: 'read' },
    { id: '6', type: 'image', content: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '5分钟前', status: 'read' },
    { id: '7', type: 'text', content: '✅ 内容已接收！正在为你生成各平台适配版本...', avatar: '', senderName: '内容同步助手', senderId: 'contentSync', isSelf: false, time: '5分钟前', status: 'sent' },
    { id: '8', type: 'text', content: '📝 平台适配完成：\n• 微信公众号：已优化排版，支持阅读原文链接\n• 知乎：已转换为专栏文章格式\n• 微博：已生成图文卡片（限9张图）\n• 小红书：已提取关键内容生成笔记\n• B站：已生成专栏文章\n• 今日头条：已优化标题和摘要\n• 百家号：已适配百度生态格式', avatar: '', senderName: '内容同步助手', senderId: 'contentSync', isSelf: false, time: '4分钟前', status: 'sent' },
    { id: '9', type: 'text', content: '确认发布到所有平台吗？', avatar: '', senderName: '内容同步助手', senderId: 'contentSync', isSelf: false, time: '4分钟前', status: 'sent' },
    { id: '10', type: 'text', content: '确认发布', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '3分钟前', status: 'read' },
    { id: '11', type: 'text', content: '🚀 正在同步发布...', avatar: '', senderName: '内容同步助手', senderId: 'contentSync', isSelf: false, time: '3分钟前', status: 'sent' },
    { id: '12', type: 'text', content: '🎉 发布成功！文章已成功同步发布到 7 个平台\n\n📊 发布统计：\n✅ 微信公众号：已发布\n✅ 知乎专栏：已发布\n✅ 微博：已发布\n✅ 小红书：已发布\n✅ B站专栏：已发布\n✅ 今日头条：已发布\n✅ 百家号：已发布', avatar: '', senderName: '内容同步助手', senderId: 'contentSync', isSelf: false, time: '2分钟前', status: 'sent' },
    { id: '13', type: 'text', content: '帮我查看一下各平台的数据表现', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '1分钟前', status: 'read' },
    { id: '14', type: 'text', content: '📈 数据汇总（最近24小时）：\n\n👁️ 总阅读量：12,580\n👍 总点赞数：856\n💬 总评论数：234\n🔄 总转发数：567\n\n🏆 表现最佳平台：知乎（阅读量 5,230）', avatar: '', senderName: '内容同步助手', senderId: 'contentSync', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '15', type: 'text', content: '我想同步发布一个短视频', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '16', type: 'text', content: '好的，请上传你的视频文件，支持抖音、快手、视频号、B站等平台同步发布。我会自动适配各平台的视频规格要求。', avatar: '', senderName: '内容同步助手', senderId: 'contentSync', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 张小明 - 丰富的消息类型（包含视频、音乐、链接）
  '9': [
    { id: '1', type: 'text', content: '项目进度怎么样了？', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '10:30', status: 'read' },
    { id: '2', type: 'text', content: '正在进行中，预计今天能完成', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm', senderName: '张小明', senderId: 'zxm', isSelf: false, time: '10:32', status: 'sent' },
    { id: '3', type: 'image', content: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm', senderName: '张小明', senderId: 'zxm', isSelf: false, time: '10:33', status: 'sent' },
    { id: '4', type: 'text', content: '这是目前的进度截图', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm', senderName: '张小明', senderId: 'zxm', isSelf: false, time: '10:34', status: 'sent' },
    { id: '5', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm', senderName: '张小明', senderId: 'zxm', isSelf: false, time: '10:35', status: 'sent', fileName: '项目进度表.xlsx', fileSize: '45 KB' },
    { id: '6', type: 'text', content: '好的，我马上处理', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm', senderName: '张小明', senderId: 'zxm', isSelf: false, time: '10:36', status: 'sent' },
    { id: '7', type: 'text', content: '晚上有空一起吃饭吗？', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm', senderName: '张小明', senderId: 'zxm', isSelf: false, time: '11:00', status: 'sent' },
    { id: '8', type: 'text', content: '可以啊，去哪里吃？', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '11:05', status: 'read' },
    { id: '9', type: 'text', content: '附近新开了一家火锅店，听说不错', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm', senderName: '张小明', senderId: 'zxm', isSelf: false, time: '11:06', status: 'sent' },
    { id: '10', type: 'image', content: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=300&fit=crop', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm', senderName: '张小明', senderId: 'zxm', isSelf: false, time: '11:07', status: 'sent' },
    { id: '11', type: 'video', content: 'https://example.com/video1.mp4', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm', senderName: '张小明', senderId: 'zxm', isSelf: false, time: '14:00', status: 'sent', videoCover: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop', videoDuration: '02:35' },
    { id: '12', type: 'text', content: '分享一个有趣的视频给你', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm', senderName: '张小明', senderId: 'zxm', isSelf: false, time: '14:01', status: 'sent' },
    { id: '13', type: 'music', content: 'https://example.com/music1.mp3', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '14:30', status: 'read', musicName: '晴天', musicArtist: '周杰伦', musicCover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop', musicDuration: '04:29' },
    { id: '14', type: 'link', content: 'https://github.com/vuejs/core', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm', senderName: '张小明', senderId: 'zxm', isSelf: false, time: '15:00', status: 'sent', linkTitle: 'GitHub - vuejs/core', linkDesc: 'Vue.js 是一个渐进式 JavaScript 框架', linkImage: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=300&h=200&fit=crop', linkUrl: 'https://github.com/vuejs/core' },
    { id: '15', type: 'music', content: 'https://example.com/music2.mp3', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm', senderName: '张小明', senderId: 'zxm', isSelf: false, time: '15:30', status: 'sent', musicName: '稻香', musicArtist: '周杰伦', musicCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop', musicDuration: '03:43' }
  ],
  // 产品经理李华 - 丰富的消息类型
  '10': [
    { id: '1', type: 'text', content: '新版本的需求文档已上传', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lihua', senderName: '李华', senderId: 'lihua', isSelf: false, time: '14:30', status: 'sent' },
    { id: '2', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lihua', senderName: '李华', senderId: 'lihua', isSelf: false, time: '14:30', status: 'sent', fileName: '产品需求文档v2.0.pdf', fileSize: '2.5 MB' },
    { id: '3', type: 'text', content: '主要更新了以下功能点：', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lihua', senderName: '李华', senderId: 'lihua', isSelf: false, time: '14:31', status: 'sent' },
    { id: '4', type: 'text', content: '1. 新增用户画像功能\n2. 优化搜索算法\n3. 支持多语言切换\n4. 改进消息推送机制', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lihua', senderName: '李华', senderId: 'lihua', isSelf: false, time: '14:32', status: 'sent' },
    { id: '5', type: 'image', content: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&h=300&fit=crop', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lihua', senderName: '李华', senderId: 'lihua', isSelf: false, time: '14:35', status: 'sent' },
    { id: '6', type: 'text', content: '这是新的UI设计稿，你看一下', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lihua', senderName: '李华', senderId: 'lihua', isSelf: false, time: '14:36', status: 'sent' },
    { id: '7', type: 'text', content: '收到，我看一下', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '14:40', status: 'read' },
    { id: '8', type: 'text', content: '整体风格不错，但是配色可能需要调整一下', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '14:45', status: 'read' },
    { id: '9', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '14:46', status: 'read', fileName: '修改建议.docx', fileSize: '15 KB' },
    { id: '10', type: 'text', content: '好的，我会让设计同事再优化一下', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lihua', senderName: '李华', senderId: 'lihua', isSelf: false, time: '15:00', status: 'sent' }
  ],
  // 新增：设计讨论群 (id: 16)
  '16': [
    { id: '1', type: 'text', content: '大家看一下这个配色方案', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=designer1', senderName: '设计师小王', senderId: 'designer1', isSelf: false, time: '09:00', status: 'sent' },
    { id: '2', type: 'image', content: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=designer1', senderName: '设计师小王', senderId: 'designer1', isSelf: false, time: '09:01', status: 'sent' },
    { id: '3', type: 'text', content: '主色调用蓝色怎么样？', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=designer2', senderName: '设计师小李', senderId: 'designer2', isSelf: false, time: '09:05', status: 'sent' },
    { id: '4', type: 'text', content: '可以，蓝色比较符合品牌调性', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '09:10', status: 'read' },
    { id: '5', type: 'file', content: '', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=designer1', senderName: '设计师小王', senderId: 'designer1', isSelf: false, time: '09:15', status: 'sent', fileName: '设计规范.sketch', fileSize: '12 MB' }
  ],
  // 新增：家人群 (id: 17)
  '17': [
    { id: '1', type: 'text', content: '周末回家吃饭吗？', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mom', senderName: '妈妈', senderId: 'mom', isSelf: false, time: '08:00', status: 'sent' },
    { id: '2', type: 'text', content: '回的，我想吃红烧肉了', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '08:30', status: 'read' },
    { id: '3', type: 'text', content: '好，我让你爸去买菜', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mom', senderName: '妈妈', senderId: 'mom', isSelf: false, time: '08:31', status: 'sent' },
    { id: '4', type: 'image', content: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mom', senderName: '妈妈', senderId: 'mom', isSelf: false, time: '08:32', status: 'sent' },
    { id: '5', type: 'text', content: '今天做的饺子，你弟吃了两大盘', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mom', senderName: '妈妈', senderId: 'mom', isSelf: false, time: '08:33', status: 'sent' },
    { id: '6', type: 'text', content: '哈哈，我也想吃', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '08:35', status: 'read' }
  ],
  // 个性化搜索助手
  'search-assistant': [
    { id: '1', type: 'text', content: '欢迎使用个性化搜索助手！我可以帮你一键搜索主流搜索引擎平台。', avatar: '', senderName: '搜索助手', senderId: 'search', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '🔍 已连接平台：百度、Google、必应、搜狗、360搜索、神马搜索', avatar: '', senderName: '搜索助手', senderId: 'search', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '3', type: 'text', content: '搜索 Vue3 教程', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ 已为您搜索到 128 条相关结果\n\n📊 搜索结果分布：\n• 百度：45 条\n• Google：38 条\n• 必应：25 条\n• 搜狗：12 条\n• 知乎：8 条', avatar: '', senderName: '搜索助手', senderId: 'search', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 智能探索助手
  'explore-assistant': [
    { id: '1', type: 'text', content: '欢迎使用智能探索助手！我是高效搜索、自由探索、深度思考的效率工具。', avatar: '', senderName: '探索助手', senderId: 'explore', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '🚀 整合 AI 对话、AI 搜索、传统搜索、社交媒体、学术搜索等多种搜索类型，让搜索更智能、更高效！', avatar: '', senderName: '探索助手', senderId: 'explore', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '3', type: 'text', content: '帮我分析一下前端框架的发展趋势', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '2分钟前', status: 'read' },
    { id: '4', type: 'text', content: '🤔 深度思考中...', avatar: '', senderName: '探索助手', senderId: 'explore', isSelf: false, time: '2分钟前', status: 'sent' },
    { id: '5', type: 'text', content: '📈 分析报告已生成：\n\n1. React 依然占据主导地位，生态系统成熟\n2. Vue3 增长迅速，Composition API 受到欢迎\n3. Svelte 和 Solid 等新兴框架崭露头角\n4. 微前端架构成为大型项目首选\n5. TypeScript 采用率持续上升', avatar: '', senderName: '探索助手', senderId: 'explore', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 任务助手
  'task-assistant': [
    { id: '1', type: 'text', content: '欢迎使用任务助手！我可以帮你管理待办事项、设置提醒、跟踪任务进度。', avatar: '', senderName: '任务助手', senderId: 'task', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '📋 今日待办（3项）：\n1. ⏰ 14:00 项目评审会议\n2. 📝 完成需求文档\n3. 📧 回复客户邮件', avatar: '', senderName: '任务助手', senderId: 'task', isSelf: false, time: '5分钟前', status: 'sent' },
    { id: '3', type: 'text', content: '添加一个任务：明天上午10点面试候选人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ 任务已添加：明天上午 10:00 面试候选人\n\n📅 已设置提醒：提前 30 分钟通知', avatar: '', senderName: '任务助手', senderId: 'task', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 邮件助手
  'mail-assistant': [
    { id: '1', type: 'text', content: '欢迎使用邮件助手！我可以帮你管理邮件、智能回复、定时发送。', avatar: '', senderName: '邮件助手', senderId: 'mail', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '📧 邮箱状态：已连接 3 个账户\n✉️ 未读邮件：12 封\n📤 待发送：2 封', avatar: '', senderName: '邮件助手', senderId: 'mail', isSelf: false, time: '10分钟前', status: 'sent' },
    { id: '3', type: 'text', content: '发送邮件给张经理，内容是关于项目进度汇报', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ 邮件已发送给张经理\n\n📋 邮件内容：\n主题：项目进度汇报\n内容：尊敬的张经理，现将本周项目进度汇报如下...', avatar: '', senderName: '邮件助手', senderId: 'mail', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 短信助手
  'sms-assistant': [
    { id: '1', type: 'text', content: '欢迎使用短信助手！我已集成阿里云、腾讯云短信平台，支持批量发送和模板管理。', avatar: '', senderName: '短信助手', senderId: 'sms', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '📱 已连接服务商：阿里云 SMS、腾讯云 SMS\n💬 今日发送：156 条\n✅ 成功率：99.2%', avatar: '', senderName: '短信助手', senderId: 'sms', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '3', type: 'text', content: '发送验证码短信给 13800138000', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ 验证码短信已发送\n\n📱 手机号：138****8000\n🔢 验证码：784291\n⏰ 有效期：5 分钟', avatar: '', senderName: '短信助手', senderId: 'sms', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 客服助手
  'customer-service-assistant': [
    { id: '1', type: 'text', content: '欢迎使用客服助手！我可以帮你管理客户咨询、智能回复、转接人工客服。', avatar: '', senderName: '客服助手', senderId: 'customerService', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '📊 今日客服数据：\n👥 咨询客户：23 人\n💬 已回复：18 条\n⏳ 待处理：5 条\n⭐ 满意度：4.8/5.0', avatar: '', senderName: '客服助手', senderId: 'customerService', isSelf: false, time: '15分钟前', status: 'sent' },
    { id: '3', type: 'text', content: '帮我转接人工客服', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ 已为您转接人工客服\n\n👤 客服专员：小李\n⏰ 预计等待：2 分钟\n📋 会话编号：CS-2024-001', avatar: '', senderName: '客服助手', senderId: 'customerService', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 工单助手
  'ticket-assistant': [
    { id: '1', type: 'text', content: '欢迎使用工单助手！我可以帮你创建、跟踪、管理工单，提高问题解决效率。', avatar: '', senderName: '工单助手', senderId: 'ticket', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '📋 工单统计：\n🟢 已解决：45 个\n🟡 处理中：8 个\n🔴 待分配：3 个\n📊 平均处理时间：2.5 小时', avatar: '', senderName: '工单助手', senderId: 'ticket', isSelf: false, time: '30分钟前', status: 'sent' },
    { id: '3', type: 'text', content: '查看工单 #2024-001 的状态', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ 工单 #2024-001 已处理完成\n\n📋 工单详情：\n标题：系统登录异常\n状态：已解决\n处理人：技术部-张工\n解决时间：2024-01-15 14:30', avatar: '', senderName: '工单助手', senderId: 'ticket', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 流程助手
  'workflow-assistant': [
    { id: '1', type: 'text', content: '欢迎使用流程助手！我可以帮你管理审批流程、自动化工作流、流程优化建议。', avatar: '', senderName: '流程助手', senderId: 'workflow', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '📊 流程统计：\n🔄 进行中：3 个\n✅ 已通过：12 个\n❌ 已驳回：2 个\n⏱️ 平均审批时间：1.2 小时', avatar: '', senderName: '流程助手', senderId: 'workflow', isSelf: false, time: '1小时前', status: 'sent' },
    { id: '3', type: 'text', content: '查看我的审批流程', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '📋 您的审批流程：\n\n1. ✅ 请假申请（已通过）\n2. ✅ 报销审批（已通过）\n3. 🔄 采购申请（审批中 - 等待部门经理审批）\n4. ✅ 出差申请（已通过）', avatar: '', senderName: '流程助手', senderId: 'workflow', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 报表助手
  'report-assistant': [
    { id: '1', type: 'text', content: '欢迎使用报表助手！我可以帮你生成各类业务报表、数据可视化、报表订阅。', avatar: '', senderName: '报表助手', senderId: 'report', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '📊 可用报表模板：\n• 销售日报/周报/月报\n• 财务报表\n• 用户行为分析\n• 运营数据看板', avatar: '', senderName: '报表助手', senderId: 'report', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '3', type: 'text', content: '生成上个月的销售报表', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ 月度销售报表已生成\n\n📈 关键数据：\n• 总销售额：¥1,234,567\n• 环比增长：+15.3%\n• 订单量：1,234 单\n• 客单价：¥1,000', avatar: '', senderName: '报表助手', senderId: 'report', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 统计助手
  'statistics-assistant': [
    { id: '1', type: 'text', content: '欢迎使用统计助手！我可以帮你进行数据分析、趋势预测、指标监控。', avatar: '', senderName: '统计助手', senderId: 'statistics', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '📊 本周数据概览：\n• 访问量：45,678\n• 转化率：3.2%\n• 留存率：68%\n• 用户增长：+23%', avatar: '', senderName: '统计助手', senderId: 'statistics', isSelf: false, time: '5分钟前', status: 'sent' },
    { id: '3', type: 'text', content: '分析一下用户增长趋势', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '📈 用户增长趋势分析：\n\n近30天用户增长稳健，主要驱动因素：\n1. 新功能上线带来 15% 增长\n2. 营销活动带来 8% 增长\n3. 口碑传播带来 5% 增长\n\n预计下月增长将保持在 20% 左右', avatar: '', senderName: '统计助手', senderId: 'statistics', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 支付助手
  'payment-assistant': [
    { id: '1', type: 'text', content: '欢迎使用支付助手！我可以帮你管理支付方式、处理支付事务、对账查询。', avatar: '', senderName: '支付助手', senderId: 'payment', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '💳 已接入支付方式：\n• 微信支付\n• 支付宝\n• 银联卡\n• Apple Pay', avatar: '', senderName: '支付助手', senderId: 'payment', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '3', type: 'text', content: '查询订单 #2024-888 的支付状态', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ 支付订单 #2024-888 已完成\n\n💰 支付金额：¥999.00\n💳 支付方式：微信支付\n⏰ 支付时间：2024-01-15 14:30:25\n📝 订单状态：已支付', avatar: '', senderName: '支付助手', senderId: 'payment', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 交易助手
  'trade-assistant': [
    { id: '1', type: 'text', content: '欢迎使用交易助手！我可以帮你记录交易、对账管理、资金流水查询。', avatar: '', senderName: '交易助手', senderId: 'trade', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '💰 今日交易统计：\n• 交易笔数：156 笔\n• 交易金额：¥89,456.00\n• 退款金额：¥1,234.00\n• 手续费：¥456.00', avatar: '', senderName: '交易助手', senderId: 'trade', isSelf: false, time: '30分钟前', status: 'sent' },
    { id: '3', type: 'text', content: '进行今日交易对账', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ 今日交易对账完成\n\n📊 对账结果：无异常\n• 系统记录：156 笔\n• 银行记录：156 笔\n• 差异：0 笔\n• 对账时间：2024-01-15 18:00:00', avatar: '', senderName: '交易助手', senderId: 'trade', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 智能体助手
  'agent-assistant': [
    { id: '1', type: 'text', content: '欢迎使用智能体助手！我可以帮你管理AI智能体、自动化任务执行、智能体调度。', avatar: '', senderName: '智能体助手', senderId: 'agent', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '🤖 可用智能体：\n• 数据分析师\n• 客服助手\n• 代码审查员\n• 文档生成器', avatar: '', senderName: '智能体助手', senderId: 'agent', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '3', type: 'text', content: '让数据分析师处理一下销售数据', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '🤖 智能体 "数据分析师" 已启动\n\n📊 任务：销售数据分析\n⏱️ 预计耗时：2 分钟\n📝 状态：执行中...', avatar: '', senderName: '智能体助手', senderId: 'agent', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '5', type: 'text', content: '✅ 智能体 "数据分析师" 已完成任务\n\n📈 分析结果：\n• 发现3个异常订单\n• 识别出2个高价值客户\n• 生成趋势预测报告', avatar: '', senderName: '智能体助手', senderId: 'agent', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // Skill助手
  'skill-assistant': [
    { id: '1', type: 'text', content: '欢迎使用Skill助手！我可以帮你管理技能、工具集成、能力扩展。', avatar: '', senderName: 'Skill助手', senderId: 'skill', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '🛠️ 已安装技能：\n• PDF转Word\n• 图片压缩\n• 二维码生成\n• 代码格式化', avatar: '', senderName: 'Skill助手', senderId: 'skill', isSelf: false, time: '1小时前', status: 'sent' },
    { id: '3', type: 'text', content: '安装 "Excel数据处理" 技能', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ 新技能 "PDF转Word" 已安装\n\n📝 技能说明：\n• 支持批量转换\n• 保留原始格式\n• 支持密码保护PDF\n\n使用方法：发送PDF文件即可自动转换', avatar: '', senderName: 'Skill助手', senderId: 'skill', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // Claw助手
  'claw-assistant': [
    { id: '1', type: 'text', content: '欢迎使用Claw助手！我可以帮你管理API、服务集成、接口调试。', avatar: '', senderName: 'Claw助手', senderId: 'claw', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '🔌 已集成服务：\n• REST API\n• GraphQL\n• WebSocket\n• gRPC', avatar: '', senderName: 'Claw助手', senderId: 'claw', isSelf: false, time: '2小时前', status: 'sent' },
    { id: '3', type: 'text', content: '测试用户API接口', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ API 接口测试全部通过\n\n📊 测试结果：\n• /api/users - 200 OK (45ms)\n• /api/orders - 200 OK (32ms)\n• /api/products - 200 OK (28ms)\n• 平均响应时间：35ms', avatar: '', senderName: 'Claw助手', senderId: 'claw', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 创作助手
  'creation-assistant': [
    { id: '1', type: 'text', content: '欢迎使用创作助手！我可以帮你进行内容创作、文案生成、创意辅助。', avatar: '', senderName: '创作助手', senderId: 'creation', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '📝 创作功能：\n• 文章撰写\n• 营销文案\n• 创意灵感\n• 内容优化', avatar: '', senderName: '创作助手', senderId: 'creation', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '3', type: 'text', content: '帮我写一篇关于人工智能的文章', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '📝 文章创作完成\n\n《人工智能：改变世界的力量》\n\n人工智能正在深刻改变我们的生活...\n\n✅ 已保存到草稿箱，您可以继续编辑', avatar: '', senderName: '创作助手', senderId: 'creation', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 小应用助手
  'miniApp-assistant': [
    { id: '1', type: 'text', content: '欢迎使用小应用助手！我可以帮你管理小程序、应用市场、快捷入口。', avatar: '', senderName: '小应用助手', senderId: 'miniApp', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '📱 推荐应用：\n• 天气查询\n• 快递追踪\n• 翻译工具\n• 计算器', avatar: '', senderName: '小应用助手', senderId: 'miniApp', isSelf: false, time: '10分钟前', status: 'sent' },
    { id: '3', type: 'text', content: '安装天气查询应用', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ 新应用 "天气查询" 已安装\n\n🌤️ 功能介绍：\n• 实时天气查询\n• 7天天气预报\n• 空气质量指数\n• 生活指数建议\n\n已添加到您的小程序列表', avatar: '', senderName: '小应用助手', senderId: 'miniApp', isSelf: false, time: '刚刚', status: 'sent' }
  ],
  // 分享助手
  'share-assistant': [
    { id: '1', type: 'text', content: '欢迎使用分享助手！我可以帮你一键生成分享链接，快速分享至各大社交平台。', avatar: '', senderName: '分享助手', senderId: 'share', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '📤 支持分享平台：\n• 微信朋友圈\n• 微博\n• QQ空间\n• 钉钉\n• 飞书\n• 企业微信', avatar: '', senderName: '分享助手', senderId: 'share', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '3', type: 'text', content: '生成项目文档分享链接', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: `✅ 分享链接已生成\n\n🔗 ${APP_URLS.shareSite}/doc/abc123\n\n📊 分享统计：\n• 有效期：7天\n• 访问密码：无\n• 权限：仅查看\n\n链接已复制到剪贴板，可直接粘贴分享`, avatar: '', senderName: '分享助手', senderId: 'share', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '5', type: 'text', content: '查看分享记录', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '5分钟前', status: 'read' },
    { id: '6', type: 'text', content: '📈 近期分享记录：\n\n1. 项目文档.pdf\n   访问：128次 | 下载：45次\n   创建于：昨天\n\n2. 设计稿_v2.psd\n   访问：56次 | 下载：12次\n   创建于：3天前\n\n3. 会议录音.mp3\n   访问：23次 | 下载：8次\n   创建于：1周前', avatar: '', senderName: '分享助手', senderId: 'share', isSelf: false, time: '5分钟前', status: 'sent' }
  ],
  // 共享助手
  'collaborate-assistant': [
    { id: '1', type: 'text', content: '欢迎使用共享助手！我可以帮你进行文档协作、团队共享和实时同步。', avatar: '', senderName: '共享助手', senderId: 'collaborate', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '2', type: 'text', content: '👥 协作功能：\n• 多人实时编辑\n• 版本历史管理\n• 评论与批注\n• 权限精细控制\n• 自动保存同步', avatar: '', senderName: '共享助手', senderId: 'collaborate', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '3', type: 'text', content: '创建团队共享空间', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '刚刚', status: 'read' },
    { id: '4', type: 'text', content: '✅ 团队共享空间创建成功\n\n🏢 空间名称：产品研发部\n👥 成员：8人\n💾 存储配额：100GB\n\n📁 默认文件夹：\n• 产品文档\n• 设计资源\n• 技术规范\n• 会议纪要\n\n邀请链接已发送给团队成员', avatar: '', senderName: '共享助手', senderId: 'collaborate', isSelf: false, time: '刚刚', status: 'sent' },
    { id: '5', type: 'text', content: '查看协作动态', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', senderName: '我', senderId: 'me', isSelf: true, time: '5分钟前', status: 'read' },
    { id: '6', type: 'text', content: '📊 今日协作动态：\n\n📝 产品需求文档.docx\n   张三 编辑了 5分钟前\n   李四 添加了评论 10分钟前\n\n🎨 首页设计稿.fig\n   王五 上传了新版本 30分钟前\n\n📋 项目计划.xlsx\n   赵六 更新了进度 1小时前', avatar: '', senderName: '共享助手', senderId: 'collaborate', isSelf: false, time: '5分钟前', status: 'sent' }
  ]
});

const currentSessionId = computed(() => chatStore.currentSessionId);

const currentSession = computed(() => {
  return sessions.value.find(s => s.id === currentSessionId.value);
});

const currentMessages = computed(() => {
  if (!currentSessionId.value) return [];
  return messages.value[currentSessionId.value] || [];
});

const loading = computed(() => chatStore.loading);

const currentUser = ref({
  id: 'me',
  name: '我',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me'
});

const filteredSessions = computed(() => {
  let list = sessions.value;
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    list = list.filter(s => 
      s.title.toLowerCase().includes(keyword) ||
      s.lastMessage.toLowerCase().includes(keyword)
    );
  }
  
  // 如果有选中的分类，按分类筛选
  if (activeCategory.value) {
    const categorySessionTypes: Record<string, SessionType[]> = {
      'assistant': ['smartSync', 'storage', 'contentSync', 'search', 'explore', 'task', 'mail', 'sms', 'customerService', 'ticket', 'workflow', 'report', 'statistics', 'payment', 'trade', 'creation'],
      'agent': ['agent'],
      'skill': ['skill'],
      'claw': ['claw'],
      'official': ['news'],
      'miniApp': ['miniApp']
    };
    const types = categorySessionTypes[activeCategory.value] || [];
    list = list.filter(s => types.includes(s.sessionType));
  } else {
    // 没有选中分类时，按标签页筛选
    switch (activeTab.value) {
      case 'unread':
        list = list.filter(s => s.unread > 0);
        break;
      case 'group':
        list = list.filter(s => s.isGroup);
        break;
    }
  }
  
  return list;
});

const allCount = computed(() => sessions.value.length);
const unreadCount = computed(() => sessions.value.filter(s => s.unread > 0).length);
const groupCount = computed(() => sessions.value.filter(s => s.isGroup).length);
const totalUnreadCount = computed(() => sessions.value.reduce((sum, s) => sum + s.unread, 0));

// 是否为特殊类型会话（系统通知、资讯、邮箱、机器人）- 文件传输助手支持聊天
const isSpecialSession = computed(() => {
  const specialTypes: SessionType[] = ['system', 'news', 'email', 'robot'];
  return currentSession.value && specialTypes.includes(currentSession.value.sessionType);
});

// 是否为助手类会话（包括所有助手类型）
const isAssistantSession = computed(() => {
  const assistantTypes: SessionType[] = ['smartSync', 'storage', 'contentSync', 'search', 'explore', 'task', 'mail', 'sms', 'customerService', 'ticket', 'workflow', 'report', 'statistics', 'payment', 'trade', 'agent', 'skill', 'claw', 'creation', 'miniApp', 'share', 'collaborate'];
  return currentSession.value && assistantTypes.includes(currentSession.value.sessionType);
});

// 会话面板宽度（可拖动调整）
const sessionPanelWidth = ref(300);
const isResizing = ref(false);
const startX = ref(0);
const startWidth = ref(0);

// 添加好友弹窗
const addFriendModalVisible = ref(false);

const startResize = (e: MouseEvent) => {
  isResizing.value = true;
  startX.value = e.clientX;
  startWidth.value = sessionPanelWidth.value;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
};

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return;
  const diff = e.clientX - startX.value;
  const newWidth = startWidth.value + diff;
  // 限制最小和最大宽度
  sessionPanelWidth.value = Math.max(250, Math.min(500, newWidth));
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
};

onMounted(() => {
  const sessionId = route.params.sessionId as string;
  if (sessionId) {
    chatStore.setCurrentSession(sessionId);
  }
});

const handleSelectSession = (session: SessionItem) => {
  chatStore.setCurrentSession(session.id);
  router.push({ name: 'ChatSession', params: { sessionId: session.id } });
};

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword;
};

const handleAddChat = () => {
  addFriendModalVisible.value = true;
};

const handleFriendAdded = (user: any) => {
  console.log('添加好友:', user);
  // 可以在这里创建新的会话
};

// 工具栏操作处理
const handleToolbarAction = (action: string) => {
  switch (action) {
    case 'album':
      antMessage.info('相册功能开发中');
      break;
    case 'camera':
      antMessage.info('拍照功能开发中');
      break;
    case 'videoCall':
      handleVideoCall();
      break;
    case 'audioCall':
      handleAudioCall();
      break;
    case 'location':
      antMessage.info('位置功能开发中');
      break;
    case 'redPacket':
      antMessage.info('红包功能开发中');
      break;
    case 'gift':
      antMessage.info('礼物功能开发中');
      break;
    case 'transfer':
      antMessage.info('转账功能开发中');
      break;
    case 'voiceInput':
      antMessage.info('语音输入功能开发中 - 按住说话转为文字');
      break;
    case 'voiceMessage':
      antMessage.info('发送语音功能开发中 - 按住录音后发送');
      break;
    case 'emoji':
      antMessage.info('表情功能开发中');
      break;
    case 'favorite':
      antMessage.info('收藏功能开发中');
      break;
    case 'contactCard':
      antMessage.info('名片功能开发中');
      break;
    case 'file':
      antMessage.info('文件功能开发中');
      break;
    case 'music':
      antMessage.info('音乐功能开发中');
      break;
    case 'vote':
      antMessage.info('群投票功能开发中');
      break;
    case 'groupTool':
      antMessage.info('群工具功能开发中');
      break;
    case 'relay':
      antMessage.info('接龙功能开发中');
      break;
    case 'live':
      antMessage.info('直播功能开发中');
      break;
    default:
      antMessage.info('功能开发中');
  }
};

const handleSendMessage = () => {
  if (!inputMessage.value.trim() || !currentSessionId.value) return;
  
  const newMessage: MessageItem = {
    id: Date.now().toString(),
    type: 'text',
    content: inputMessage.value,
    avatar: currentUser.value.avatar,
    senderName: currentUser.value.name,
    senderId: currentUser.value.id,
    isSelf: true,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    status: 'sent'
  };
  
  if (!messages.value[currentSessionId.value]) {
    messages.value[currentSessionId.value] = [];
  }
  messages.value[currentSessionId.value].push(newMessage);
  inputMessage.value = '';
  
  setTimeout(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  }, 0);
};

const handleAudioCall = () => {
  if (!currentSession.value) return;
  antMessage.info('语音通话功能开发中');
};

const handleVideoCall = () => {
  if (!currentSession.value) return;
  antMessage.info('视频通话功能开发中');
};

// 消息右键菜单
const showMessageContextMenu = (e: MouseEvent, message: MessageItem) => {
  e.preventDefault();
  e.stopPropagation();
  
  const menuItems: { key: string; label: string; danger?: boolean; onClick: () => void }[] = [];
  
  // 复制功能
  if (message.type === 'text' && !message.isRecalled) {
    menuItems.push({
      key: 'copy',
      label: '复制',
      onClick: () => {
        navigator.clipboard.writeText(message.content);
        antMessage.success('已复制到剪贴板');
      }
    });
  }
  
  // 撤回功能（仅自己的消息）
  if (message.isSelf && !message.isRecalled) {
    menuItems.push({
      key: 'recall',
      label: '撤回',
      onClick: () => handleRecallMessage(message)
    });
  }
  
  // 删除功能
  menuItems.push({
    key: 'delete',
    label: '删除',
    danger: true,
    onClick: () => handleDeleteMessage(message)
  });
  
  // 创建右键菜单
  const menuDiv = document.createElement('div');
  menuDiv.className = 'message-context-menu';
  menuDiv.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 4px 0;
    z-index: 9999;
    min-width: 120px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  menuItems.forEach((item) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'message-context-menu-item' + (item.danger ? ' danger' : '');
    itemDiv.style.cssText = `
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      color: ${item.danger ? '#ff4d4f' : '#333'};
      transition: background 0.2s;
      white-space: nowrap;
    `;
    itemDiv.textContent = item.label;
    itemDiv.onmouseenter = () => itemDiv.style.background = item.danger ? '#fff1f0' : '#f5f5f5';
    itemDiv.onmouseleave = () => itemDiv.style.background = 'transparent';
    itemDiv.onclick = (ev) => {
      ev.stopPropagation();
      item.onClick();
      if (document.body.contains(menuDiv)) {
        document.body.removeChild(menuDiv);
      }
    };
    menuDiv.appendChild(itemDiv);
  });
  
  document.body.appendChild(menuDiv);
  
  // 点击其他地方关闭菜单
  const closeMenu = (ev: MouseEvent) => {
    if (!menuDiv.contains(ev.target as Node)) {
      if (document.body.contains(menuDiv)) {
        document.body.removeChild(menuDiv);
      }
      document.removeEventListener('click', closeMenu);
      document.removeEventListener('contextmenu', closeMenu);
    }
  };
  
  // 延迟添加事件监听，避免立即触发
  requestAnimationFrame(() => {
    document.addEventListener('click', closeMenu);
    document.addEventListener('contextmenu', closeMenu);
  });
};

// 撤回消息
const handleRecallMessage = (message: MessageItem) => {
  if (!currentSessionId.value) return;

  const messageList = messages.value[currentSessionId.value];
  const index = messageList.findIndex((m: MessageItem) => m.id === message.id);

  if (index > -1) {
    // 保存原始内容以便重新编辑
    if (message.type === 'text') {
      messageList[index].originalContent = message.content;
    }
    // 标记消息为已撤回
    messageList[index].isRecalled = true;
    antMessage.success('消息已撤回');
  }
};

// 删除消息
const handleDeleteMessage = (message: MessageItem) => {
  if (!currentSessionId.value) return;
  
  const messageList = messages.value[currentSessionId.value];
  const index = messageList.findIndex((m: MessageItem) => m.id === message.id);
  
  if (index > -1) {
    messageList.splice(index, 1);
    antMessage.success('消息已删除');
  }
};

// 重新编辑撤回的消息
const handleReEdit = (message: MessageItem) => {
  if (message.originalContent) {
    inputMessage.value = message.originalContent;
  } else if (message.content && !message.isRecalled) {
    inputMessage.value = message.content;
  }
  antMessage.info('消息已恢复到输入框');
};

// 播放视频
const handlePlayVideo = (url: string) => {
  antMessage.info('视频播放功能开发中');
  console.log('播放视频:', url);
};

// 打开链接
const handleOpenLink = (url?: string) => {
  if (url) {
    window.open(url, '_blank');
  }
};

// 加入群聊
const handleJoinGroup = (message: MessageItem) => {
  antMessage.success(`已申请加入群聊：${message.groupName}`);
};

// 查看联系人名片
const handleViewContact = (message: MessageItem) => {
  antMessage.info(`查看联系人：${message.contactName}`);
};

// 打开位置
const handleOpenLocation = (message: MessageItem) => {
  const url = `https://map.baidu.com/search/${encodeURIComponent(message.locationName || '')}`;
  window.open(url, '_blank');
};

// 打开红包
const handleOpenRedPacket = (message: MessageItem) => {
  if (message.redPacketStatus === 'pending') {
    antMessage.success('红包领取成功！');
    message.redPacketStatus = 'opened';
  } else if (message.redPacketStatus === 'opened') {
    antMessage.info('红包已被领取');
  } else {
    antMessage.warning('红包已过期');
  }
};

// 获取通话邀请文本
const getCallInviteText = (message: MessageItem) => {
  const typeText = message.callType === 'audio' ? '语音' : '视频';
  switch (message.callStatus) {
    case 'inviting':
      return `${message.isSelf ? '你' : message.senderName}发起${typeText}通话`;
    case 'connected':
      return `${typeText}通话中`;
    case 'ended':
      return `${typeText}通话已结束`;
    case 'missed':
      return `未接听${typeText}通话`;
    default:
      return `${typeText}通话`;
  }
};

// 打开收藏
const handleOpenFavorite = (message: MessageItem) => {
  antMessage.info('正在打开收藏...');
};

// 转账状态文本
const getTransferStatusText = (status?: string) => {
  switch (status) {
    case 'pending':
      return '待收款';
    case 'received':
      return '已收款';
    case 'refunded':
      return '已退还';
    default:
      return '转账';
  }
};

// 点击转账
const handleTransferClick = (message: MessageItem) => {
  if (message.transferStatus === 'pending') {
    antMessage.success(`收款成功：¥${message.transferAmount}`);
    message.transferStatus = 'received';
  } else if (message.transferStatus === 'received') {
    antMessage.info('转账已收款');
  } else {
    antMessage.info('转账已退还');
  }
};

// 打开小程序
const handleOpenMiniApp = (message: MessageItem) => {
  antMessage.info(`打开小程序：${message.miniAppName}`);
};

// 打开视频号
const handleOpenChannels = (message: MessageItem) => {
  antMessage.info(`打开视频号：${message.channelsTitle}`);
};

// 滚动到引用消息
const handleScrollToQuote = (messageId?: string) => {
  if (messageId) {
    antMessage.info('跳转到引用消息');
  }
};

// 打开合并转发消息
const handleOpenForward = (message: MessageItem) => {
  antMessage.info(`查看 ${message.forwardCount} 条转发消息`);
};

// 处理AI输入发送
const handleAIInputSend = () => {
  if (!aiInputMessage.value.trim() || !currentSessionId.value) return;

  const content = aiInputMessage.value;
  const sessionType = currentSession.value?.sessionType;

  // 根据会话类型确定助手名称
  let assistantName = 'AI助手';
  let assistantId = 'ai';
  switch (sessionType) {
    case 'robot':
      assistantName = 'ImSky 助手';
      assistantId = 'robot';
      break;
    case 'smartSync':
      assistantName = '智能同步助手';
      assistantId = 'smartSync';
      break;
    case 'storage':
      assistantName = '存储助手';
      assistantId = 'storage';
      break;
    case 'contentSync':
      assistantName = '内容同步助手';
      assistantId = 'contentSync';
      break;
  }

  // 添加用户消息
  if (!messages.value[currentSessionId.value]) {
    messages.value[currentSessionId.value] = [];
  }
  messages.value[currentSessionId.value].push({
    id: Date.now().toString(),
    type: 'text',
    content: content,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
    senderName: '我',
    senderId: 'me',
    isSelf: true,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    status: 'sent'
  });

  // 清空输入
  aiInputMessage.value = '';

  // 模拟AI回复
  setTimeout(() => {
    messages.value[currentSessionId.value || ''].push({
      id: (Date.now() + 1).toString(),
      type: 'text',
      content: `${assistantName}回复: 收到你的问题 "${content}"。我正在为你处理，请稍候...`,
      avatar: '',
      senderName: assistantName,
      senderId: assistantId,
      isSelf: false,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    });
  }, 1000);
};

// Chatbot组件引用
const chatbotRef = ref<InstanceType<typeof Chatbot> | null>(null);
const assistantChatbotRef = ref<InstanceType<typeof Chatbot> | null>(null);

// 处理ImSky助手Chatbot消息
const handleChatbotMessage = async (data: { content: string; tags: string[] }) => {
  try {
    antMessage.info(`AI助手处理中: ${data.content}`);
    // 添加用户消息
    if (!messages.value[currentSessionId.value || '']) {
      messages.value[currentSessionId.value || ''] = [];
    }
    messages.value[currentSessionId.value || ''].push({
      id: Date.now().toString(),
      type: 'text',
      content: data.content,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
      senderName: '我',
      senderId: 'me',
      isSelf: true,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    });
    // 模拟AI回复
    setTimeout(() => {
      messages.value[currentSessionId.value || ''].push({
        id: (Date.now() + 1).toString(),
        type: 'text',
        content: `AI回复: 我理解你的问题是 "${data.content}"。让我为你提供帮助...`,
        avatar: '',
        senderName: 'ImSky 助手',
        senderId: 'robot',
        isSelf: false,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      });
    }, 1000);
  } catch (error) {
    console.error('处理Chatbot消息失败:', error);
  } finally {
    chatbotRef.value?.resetSendState?.();
  }
};

// 处理助手类会话Chatbot消息
const handleAssistantChatbotMessage = async (data: { content: string; tags: string[] }) => {
  try {
    const sessionType = currentSession.value?.sessionType;
    let assistantName = '助手';
    switch (sessionType) {
      case 'smartSync':
        assistantName = '智能同步助手';
        break;
      case 'storage':
        assistantName = '存储助手';
        break;
      case 'contentSync':
        assistantName = '内容同步助手';
        break;
      case 'search':
        assistantName = '个性化搜索助手';
        break;
      case 'explore':
        assistantName = '智能探索助手';
        break;
      case 'task':
        assistantName = '任务助手';
        break;
      case 'mail':
        assistantName = '邮件助手';
        break;
      case 'sms':
        assistantName = '短信助手';
        break;
      case 'customerService':
        assistantName = '客服助手';
        break;
      case 'ticket':
        assistantName = '工单助手';
        break;
      case 'workflow':
        assistantName = '流程助手';
        break;
      case 'report':
        assistantName = '报表助手';
        break;
      case 'statistics':
        assistantName = '统计助手';
        break;
      case 'payment':
        assistantName = '支付助手';
        break;
      case 'trade':
        assistantName = '交易助手';
        break;
      case 'agent':
        assistantName = '智能体助手';
        break;
      case 'skill':
        assistantName = 'Skill助手';
        break;
      case 'claw':
        assistantName = 'Claw助手';
        break;
      case 'creation':
        assistantName = '创作助手';
        break;
      case 'miniApp':
        assistantName = '小应用助手';
        break;
    }
    antMessage.info(`${assistantName}处理中: ${data.content}`);
    // 添加用户消息
    if (!messages.value[currentSessionId.value || '']) {
      messages.value[currentSessionId.value || ''] = [];
    }
    messages.value[currentSessionId.value || ''].push({
      id: Date.now().toString(),
      type: 'text',
      content: data.content,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
      senderName: '我',
      senderId: 'me',
      isSelf: true,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    });
    // 模拟AI回复
    setTimeout(() => {
      messages.value[currentSessionId.value || ''].push({
        id: (Date.now() + 1).toString(),
        type: 'text',
        content: `${assistantName}回复: 收到你的请求 "${data.content}"。正在为你处理...`,
        avatar: '',
        senderName: assistantName,
        senderId: sessionType || 'assistant',
        isSelf: false,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      });
    }, 1000);
  } catch (error) {
    console.error('处理助手Chatbot消息失败:', error);
  } finally {
    assistantChatbotRef.value?.resetSendState?.();
  }
};
</script>

<style scoped>
.chat {
  display: flex;
  height: 100%;
  background: #f5f5f5;
}

.session-panel {
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  position: relative;
  flex-shrink: 0;
}

/* 拖动调整宽度手柄 */
.resize-handle {
  position: absolute;
  right: -4px;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  z-index: 10;
  transition: background 0.2s;
}

.resize-handle:hover {
  background: rgba(7, 193, 96, 0.2);
}

.resize-handle::after {
  content: '';
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 40px;
  background: #e0e0e0;
  border-radius: 1px;
  transition: background 0.2s;
}

.resize-handle:hover::after {
  background: #07c160;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
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

.title-icon {
  font-size: 22px;
  color: #07c160;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  color: #666;
}

.action-btn:hover {
  color: #07c160;
  background: #f5f5f5;
}

.session-search {
  padding: 12px 16px;
}

.session-tabs {
  display: flex;
  padding: 0 16px;
  margin-bottom: 8px;
  gap: 8px;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  min-width: 0;
}

.tab-item:hover {
  background: #e8e8e8;
}

.tab-item.active {
  background: #07c160;
  color: #fff;
}

.tab-badge :deep(.ant-badge-count) {
  background: #ff4d4f;
}

.tab-item.active .tab-badge :deep(.ant-badge-count) {
  background: #fff;
  color: #07c160;
  box-shadow: none;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

/* 底部分类栏 */
.category-bar {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-top: 1px solid #e8e8e8;
  background: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
  gap: 6px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.category-bar.expanded {
  flex-wrap: wrap;
}

.category-list {
  display: flex;
  flex: 1;
  gap: 5px;
  overflow: hidden;
  flex-wrap: nowrap;
}

.category-bar.expanded .category-list {
  flex-wrap: wrap;
  gap: 6px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #fff;
  border: 1px solid #d9d9d9;
  font-size: 12px;
  color: #595959;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.category-item:hover {
  background: #fff;
  border-color: #07c160;
  color: #07c160;
  box-shadow: 0 2px 6px rgba(7, 193, 96, 0.2);
  transform: translateY(-1px);
}

.category-item.active {
  background: #07c160;
  border-color: #07c160;
  color: #fff;
  box-shadow: 0 2px 8px rgba(7, 193, 96, 0.35);
}

.category-icon {
  font-size: 14px;
}

.category-name {
  font-size: 12px;
}

/* 展开/收起按钮 */
.category-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.25s ease;
  background: linear-gradient(135deg, #fff 0%, #f5f5f5 100%);
  border: 1.5px solid;
  border-color: #73d13d;
  color: #52c41a;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(82, 196, 26, 0.15);
}

.category-toggle:hover {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  border-color: #52c41a;
  color: #389e0d;
  box-shadow: 0 2px 6px rgba(82, 196, 26, 0.25);
}

.category-toggle:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #69c0ff 100%);
  box-shadow: 0 3px 8px rgba(24, 144, 255, 0.4);
  transform: translateY(-1px);
}

.category-toggle-icon {
  font-size: 13px;
}

/* 分类操作区 */
.category-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 隐藏按钮 */
.category-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #8c8c8c;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.category-toggle-btn:hover {
  background: #fff;
  border-color: #40a9ff;
  color: #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2);
}

.session-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.session-item:hover {
  background: #f5f5f5;
}

.session-item.active {
  background: #e8f5e9;
}

.session-item.unread {
  background: #f0fdf4;
}

.session-avatar {
  position: relative;
  flex-shrink: 0;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #07c160;
  border: 2px solid #fff;
  border-radius: 50%;
}

.group-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: #1890ff;
  border: 2px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #fff;
}

.type-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #fff;
}

.type-badge.file {
  background: #fa8c16;
}

.type-badge.system {
  background: #ff4d4f;
}

.type-badge.news {
  background: #722ed1;
}

.type-badge.email {
  background: #13c2c2;
}

.type-badge.robot {
  background: #eb2f96;
}

.type-badge.smartSync {
  background: #1890ff;
}

.type-badge.storage {
  background: #52c41a;
}

.type-badge.contentSync {
  background: #722ed1;
}

.type-badge.search {
  background: #1890ff;
}

.type-badge.explore {
  background: #13c2c2;
}

.type-badge.task {
  background: #52c41a;
}

.type-badge.mail {
  background: #722ed1;
}

.type-badge.sms {
  background: #fa8c16;
}

.type-badge.customerService {
  background: #eb2f96;
}

.type-badge.ticket {
  background: #1890ff;
}

.type-badge.workflow {
  background: #13c2c2;
}

.type-badge.report {
  background: #1890ff;
}

.type-badge.statistics {
  background: #722ed1;
}

.type-badge.payment {
  background: #52c41a;
}

.type-badge.trade {
  background: #fa8c16;
}

.type-badge.agent {
  background: #eb2f96;
}

.type-badge.skill {
  background: #13c2c2;
}

.type-badge.claw {
  background: #1890ff;
}

.type-badge.creation {
  background: #f5222d;
}

.type-badge.miniApp {
  background: #faad14;
}

.type-badge.share {
  background: #13c2c2;
}

.type-badge.collaborate {
  background: #722ed1;
}

/* 特殊类型头像背景色 */
.session-avatar :deep(.ant-avatar) {
  background: #e0e0e0;
}

.session-avatar :deep(.ant-avatar.fileTransfer) {
  background: #fff7e6;
  color: #fa8c16;
}

.session-avatar :deep(.ant-avatar.system) {
  background: #fff1f0;
  color: #ff4d4f;
}

.session-avatar :deep(.ant-avatar.news) {
  background: #f9f0ff;
  color: #722ed1;
}

.session-avatar :deep(.ant-avatar.email) {
  background: #e6fffb;
  color: #13c2c2;
}

.session-avatar :deep(.ant-avatar.robot) {
  background: #fff0f6;
  color: #eb2f96;
}

.session-avatar :deep(.ant-avatar.smartSync) {
  background: #e6f7ff;
  color: #1890ff;
}

.session-avatar :deep(.ant-avatar.storage) {
  background: #f6ffed;
  color: #52c41a;
}

.session-avatar :deep(.ant-avatar.contentSync) {
  background: #f9f0ff;
  color: #722ed1;
}

.session-avatar :deep(.ant-avatar.search) {
  background: #e6f7ff;
  color: #1890ff;
}

.session-avatar :deep(.ant-avatar.explore) {
  background: #e6fffb;
  color: #13c2c2;
}

.session-avatar :deep(.ant-avatar.task) {
  background: #f6ffed;
  color: #52c41a;
}

.session-avatar :deep(.ant-avatar.mail) {
  background: #f9f0ff;
  color: #722ed1;
}

.session-avatar :deep(.ant-avatar.sms) {
  background: #fff7e6;
  color: #fa8c16;
}

.session-avatar :deep(.ant-avatar.customerService) {
  background: #fff0f6;
  color: #eb2f96;
}

.session-avatar :deep(.ant-avatar.ticket) {
  background: #e6f7ff;
  color: #1890ff;
}

.session-avatar :deep(.ant-avatar.workflow) {
  background: #e6fffb;
  color: #13c2c2;
}

.session-avatar :deep(.ant-avatar.report) {
  background: #e6f7ff;
  color: #1890ff;
}

.session-avatar :deep(.ant-avatar.statistics) {
  background: #f9f0ff;
  color: #722ed1;
}

.session-avatar :deep(.ant-avatar.payment) {
  background: #f6ffed;
  color: #52c41a;
}

.session-avatar :deep(.ant-avatar.trade) {
  background: #fff7e6;
  color: #fa8c16;
}

.session-avatar :deep(.ant-avatar.agent) {
  background: #fff0f6;
  color: #eb2f96;
}

.session-avatar :deep(.ant-avatar.skill) {
  background: #e6fffb;
  color: #13c2c2;
}

.session-avatar :deep(.ant-avatar.claw) {
  background: #e6f7ff;
  color: #1890ff;
}

.session-avatar :deep(.ant-avatar.creation) {
  background: #fff1f0;
  color: #f5222d;
}

.session-avatar :deep(.ant-avatar.miniApp) {
  background: #fffbe6;
  color: #faad14;
}

.session-avatar :deep(.ant-avatar.share) {
  background: #e6fffb;
  color: #13c2c2;
}

.session-avatar :deep(.ant-avatar.collaborate) {
  background: #f9f0ff;
  color: #722ed1;
}

.session-avatar :deep(.ant-avatar.group) {
  background: #e6f7ff;
  color: #1890ff;
}

.session-avatar :deep(.ant-avatar.private) {
  background: #f6ffed;
  color: #52c41a;
}

.session-content {
  flex: 1;
  min-width: 0;
}

.session-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.session-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.session-time {
  font-size: 12px;
  color: #999;
}

.session-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-message {
  flex: 1;
  font-size: 13px;
  color: #999;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sender-name {
  color: #666;
  margin-right: 4px;
}

.unread-badge :deep(.ant-badge-count) {
  background: #ff4d4f;
}

.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.header-status {
  font-size: 12px;
  color: #999;
}

.header-right {
  display: flex;
  gap: 4px;
}

.header-btn {
  color: #666;
  font-size: 18px;
}

.header-btn:hover {
  color: #07c160;
  background: #f5f5f5;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 文件传输助手头部样式 */
.file-transfer-header {
  text-align: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  color: #fff;
}

.file-transfer-header-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.9;
}

.file-transfer-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #fff;
}

.file-transfer-header p {
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.9);
}

/* 智能同步助手头部 - 蓝色 */
.smart-sync-header {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
}

/* 存储助手头部 - 绿色 */
.storage-header {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

/* 内容同步助手头部 - 紫色 */
.content-sync-header {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
}

/* 个性化搜索助手头部 - 蓝色 */
.search-header {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
}

/* 智能探索助手头部 - 青色 */
.explore-header {
  background: linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%);
}

/* 任务助手头部 - 绿色 */
.task-header {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

/* 邮件助手头部 - 紫色 */
.mail-header {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
}

/* 短信助手头部 - 橙色 */
.sms-header {
  background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
}

/* 客服助手头部 - 粉色 */
.customer-service-header {
  background: linear-gradient(135deg, #eb2f96 0%, #ff4d9e 100%);
}

/* 工单助手头部 - 蓝色 */
.ticket-header {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
}

/* 流程助手头部 - 青色 */
.workflow-header {
  background: linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%);
}

/* 报表助手头部 - 蓝色 */
.report-header {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
}

/* 统计助手头部 - 紫色 */
.statistics-header {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
}

/* 支付助手头部 - 绿色 */
.payment-header {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

/* 交易助手头部 - 橙色 */
.trade-header {
  background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
}

/* 智能体助手头部 - 粉色 */
.agent-header {
  background: linear-gradient(135deg, #eb2f96 0%, #ff4d9e 100%);
}

/* Skill助手头部 - 青色 */
.skill-header {
  background: linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%);
}

/* Claw助手头部 - 蓝色 */
.claw-header {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
}

/* 创作助手头部 - 红色 */
.creation-header {
  background: linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%);
}

/* 小应用助手头部 - 橙色 */
.miniApp-header {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
}

/* 分享助手头部 - 青色 */
.share-header {
  background: linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%);
}

/* 共享助手头部 - 紫色 */
.collaborate-header {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
}

.loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: #999;
}

.message-item {
  display: flex;
  gap: 12px;
  max-width: 70%;
}

.message-item.self {
  flex-direction: row-reverse;
  margin-left: auto;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-sender {
  font-size: 12px;
  color: #999;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-item.self .message-bubble {
  background: #07c160;
  color: #fff;
}

.text-content {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.image-content img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
}

.file-content {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
}

.file-icon {
  font-size: 32px;
  color: #07c160;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.message-item.self .file-size {
  color: rgba(255, 255, 255, 0.8);
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.message-item.self .message-meta {
  flex-direction: row-reverse;
}

.message-status {
  display: flex;
  align-items: center;
}

.message-status .read {
  color: #07c160;
}

.message-status .failed {
  color: #ff4d4f;
}

/* 撤回消息样式 */
.message-bubble.recalled {
  background: #f5f5f5 !important;
  color: #999 !important;
  border: 1px dashed #ddd;
}

.message-item.self .message-bubble.recalled {
  background: #f5f5f5 !important;
  color: #999 !important;
}

.recalled-content {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #999;
  padding: 4px 8px;
  flex-wrap: wrap;
}

.recalled-content .anticon {
  font-size: 14px;
}

.re-edit-btn {
  margin-left: 8px;
  font-size: 12px;
  padding: 0 4px;
  height: auto;
  line-height: 1.5;
}

/* 消息右键菜单样式 */
.message-context-menu {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 120px;
}

.message-context-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.2s;
}

.message-context-menu-item:hover {
  background: #f5f5f5;
}

.message-context-menu-item.danger {
  color: #ff4d4f;
}

.message-context-menu-item.danger:hover {
  background: #fff1f0;
}

/* 视频消息样式 */
.video-content {
  max-width: 300px;
}

.video-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

.video-cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.video-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  transition: all 0.3s;
}

.video-wrapper:hover .video-play-btn {
  background: rgba(0, 0, 0, 0.8);
  transform: translate(-50%, -50%) scale(1.1);
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 音乐消息样式 */
.music-content {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 240px;
  padding: 8px;
  background: #f8f8f8;
  border-radius: 8px;
}

.message-item.self .music-content {
  background: rgba(255, 255, 255, 0.2);
}

.music-cover {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.music-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.music-play-icon:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: translate(-50%, -50%) scale(1.1);
}

.music-info {
  flex: 1;
  min-width: 0;
}

.music-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-item.self .music-name {
  color: #fff;
}

.music-artist {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-item.self .music-artist {
  color: rgba(255, 255, 255, 0.8);
}

.music-duration {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.message-item.self .music-duration {
  color: rgba(255, 255, 255, 0.8);
}

/* 链接消息样式 */
.link-content {
  display: flex;
  gap: 12px;
  max-width: 320px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.link-content:hover {
  background: #f0f0f0;
}

.message-item.self .link-content {
  background: rgba(255, 255, 255, 0.2);
}

.message-item.self .link-content:hover {
  background: rgba(255, 255, 255, 0.3);
}

.link-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.link-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.link-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.link-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-item.self .link-title {
  color: #fff;
}

.link-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-item.self .link-desc {
  color: rgba(255, 255, 255, 0.8);
}

.link-url {
  font-size: 11px;
  color: #07c160;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-item.self .link-url {
  color: rgba(255, 255, 255, 0.9);
}

/* 群邀请消息样式 */
.group-invite-content {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  min-width: 240px;
}

.group-invite-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.group-invite-info {
  flex: 1;
}

.group-invite-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.group-invite-count {
  font-size: 12px;
  color: #999;
}

.group-invite-reason {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.group-invite-btn {
  border-radius: 4px;
}

/* 名片消息样式 */
.contact-card-content {
  background: #fff;
  border-radius: 8px;
  min-width: 260px;
  cursor: pointer;
  transition: all 0.3s;
}

.contact-card-content:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.contact-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.contact-card-info {
  flex: 1;
}

.contact-card-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.contact-card-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.contact-card-company {
  font-size: 11px;
  color: #999;
}

.contact-card-footer {
  padding: 8px 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #999;
  text-align: center;
}

/* 位置消息样式 */
.location-content {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  max-width: 280px;
}

.location-map {
  position: relative;
  height: 120px;
}

.location-map img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.location-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  background: #ff4d4f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.4);
}

.location-info {
  padding: 10px 12px;
}

.location-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.location-address {
  font-size: 12px;
  color: #999;
}

/* 红包消息样式 */
.red-packet-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  min-width: 220px;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #fa8c16 0%, #ff4d4f 100%);
}

.red-packet-content.opened {
  background: linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%);
}

.red-packet-content.expired {
  background: linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%);
  opacity: 0.7;
}

.red-packet-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.red-packet-info {
  flex: 1;
}

.red-packet-message {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  margin-bottom: 4px;
}

.red-packet-status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* 通话邀请消息样式 */
.call-invite-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 200px;
}

.call-invite-content.missed {
  background: #fff1f0;
}

.call-invite-icon {
  width: 40px;
  height: 40px;
  background: #07c160;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

.call-invite-content.missed .call-invite-icon {
  background: #ff4d4f;
}

.call-invite-info {
  flex: 1;
}

.call-invite-text {
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.call-invite-duration {
  font-size: 12px;
  color: #999;
}

/* 礼物消息样式 */
.gift-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #ffd666 0%, #ffa940 100%);
  border-radius: 12px;
  min-width: 180px;
}

.gift-animation {
  width: 60px;
  height: 60px;
  margin-bottom: 8px;
}

.gift-animation img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.gift-info {
  font-size: 13px;
  color: #fff;
  text-align: center;
}

.gift-sender {
  font-weight: 500;
}

.gift-action {
  margin: 0 4px;
}

.gift-name {
  font-weight: 500;
}

.gift-count {
  margin-left: 4px;
  font-weight: 600;
}

/* 收藏消息样式 */
.favorite-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 220px;
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-content:hover {
  background: #e8e8e8;
}

.favorite-icon {
  width: 40px;
  height: 40px;
  background: #faad14;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

.favorite-info {
  flex: 1;
}

.favorite-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.favorite-content-preview {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 表情消息样式 */
.emoji-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-image {
  width: 32px;
  height: 32px;
}

/* 动图消息样式 */
.sticker-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sticker-image {
  max-width: 120px;
  max-height: 120px;
  border-radius: 8px;
}

/* 转账消息样式 */
.transfer-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fa8c16;
  border-radius: 8px;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.3s;
}

.transfer-content.received {
  background: #d9d9d9;
}

.transfer-content.refunded {
  background: #d9d9d9;
  opacity: 0.7;
}

.transfer-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.transfer-info {
  flex: 1;
}

.transfer-amount {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.transfer-note {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2px;
}

.transfer-status {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

/* 小程序消息样式 */
.mini-app-content {
  background: #fff;
  border-radius: 8px;
  min-width: 240px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.mini-app-content:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mini-app-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.mini-app-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.mini-app-name {
  font-size: 13px;
  color: #999;
}

.mini-app-desc {
  padding: 12px;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.mini-app-image {
  padding: 0 12px 12px;
}

.mini-app-image img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 4px;
}

.mini-app-footer {
  padding: 8px 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #999;
}

/* 视频号消息样式 */
.channels-content {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  max-width: 280px;
}

.channels-video {
  position: relative;
  height: 160px;
}

.channels-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.channels-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.channels-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.channels-info {
  padding: 12px;
}

.channels-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.channels-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.channels-avatar-small {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.channels-author {
  flex: 1;
}

.channels-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.channels-stats :deep(.anticon) {
  margin-right: 2px;
}

/* 引用回复消息样式 */
.quote-content {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  min-width: 240px;
}

.quote-reference {
  background: rgba(0, 0, 0, 0.03);
  border-left: 3px solid #07c160;
  padding: 8px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
}

.quote-reference:hover {
  background: rgba(0, 0, 0, 0.06);
}

.quote-sender {
  font-size: 12px;
  color: #07c160;
  margin-bottom: 2px;
}

.quote-text {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quote-reply {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

/* 合并转发消息样式 */
.forward-content {
  background: #fff;
  border-radius: 8px;
  min-width: 260px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.forward-content:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.forward-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8f8f8;
  border-bottom: 1px solid #f0f0f0;
}

.forward-icon {
  width: 36px;
  height: 36px;
  background: #07c160;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
}

.forward-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.forward-preview {
  padding: 12px;
}

.forward-item {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.forward-item:last-child {
  margin-bottom: 0;
}

.forward-sender {
  color: #999;
}

.forward-text {
  color: #666;
}

.forward-footer {
  padding: 8px 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #999;
}

/* 拍一拍消息样式 */
.pat-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  font-size: 13px;
  color: #999;
}

.pat-text {
  font-style: italic;
}

.chat-input {
  background: #fff;
  border-top: 1px solid #e0e0e0;
  padding: 12px 20px;
}

/* AI对话组件样式 */
.assistant-chatbot-container,
.assistant-chatbot {
  background: #fff;
  border-top: 1px solid #e0e0e0;
  padding: 12px 20px;
}

.assistant-chatbot-container {
  position: sticky;
  bottom: 0;
}

.toolbar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0 0;
  margin-top: 8px;
  border-top: 1px solid #e8e8e8;
}

.input-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  align-items: center;
}

.private-toolbar {
  justify-content: flex-start;
}

.group-toolbar {
  justify-content: flex-start;
}

.toolbar-btn {
  color: #666;
  font-size: 20px;
  padding: 6px;
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toolbar-btn:hover {
  color: #07c160;
  background: rgba(7, 193, 96, 0.1);
}

.toolbar-send-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}

.toolbar-char-count {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.toolbar-send-btn {
  min-width: 80px;
  height: 36px;
  border-radius: 18px;
  font-weight: 500;
  flex-shrink: 0;
}

.toolbar-send-btn:not(:disabled) {
  background: linear-gradient(135deg, #07c160 0%, #00b45a 100%);
  border: none;
}

.toolbar-send-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #06ad56 0%, #00a050 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.3);
}

.input-area {
  position: relative;
  margin-bottom: 8px;
}

.chat-textarea {
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  transition: all 0.3s;
}

.chat-textarea:hover,
.chat-textarea:focus {
  border-color: #07c160;
  box-shadow: 0 0 0 2px rgba(7, 193, 96, 0.1);
}

.input-shortcuts {
  position: absolute;
  bottom: 8px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #999;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.shortcut-key {
  background: #f0f0f0;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  color: #666;
  font-weight: 500;
  border: 1px solid #e0e0e0;
}

.shortcut-text {
  color: #999;
  margin-left: 2px;
}

.shortcut-divider {
  color: #ddd;
  margin: 0 4px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.input-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.char-count {
  font-size: 12px;
  color: #999;
}

.send-btn {
  min-width: 80px;
  height: 36px;
  border-radius: 18px;
  font-weight: 500;
}

.send-btn:not(:disabled) {
  background: linear-gradient(135deg, #07c160 0%, #00b45a 100%);
  border: none;
}

.send-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #06ad56 0%, #00a050 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.3);
}

.input-hint {
  font-size: 12px;
  color: #999;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.empty-content {
  text-align: center;
  color: #fff;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.8;
}

.empty-content h3 {
  font-size: 24px;
  margin-bottom: 12px;
}

.empty-content p {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 20px;
}

.empty-content .ant-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}

.empty-content .ant-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 特殊类型会话内容区 */
.special-session-content {
  flex: 1;
  overflow-y: auto;
  background: #f8f9fa;
  padding: 20px;
}

/* 特殊类型头部 */
.special-header {
  text-align: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  color: #fff;
}

.special-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.9;
}

.special-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.special-header p {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

.special-footer {
  margin-top: 20px;
  padding: 0 20px;
}

/* 文件传输助手 */
.file-transfer-area .special-header {
  background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
}

.file-list-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.file-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.file-card-icon {
  width: 48px;
  height: 48px;
  background: #fff7e6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fa8c16;
}

.file-card-info {
  flex: 1;
}

.file-card-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.file-card-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #999;
}

.file-card-action {
  color: #666;
  font-size: 18px;
}

.file-card-action:hover {
  color: #fa8c16;
}

/* 系统通知 */
.system-notice-area .special-header {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #ff4d4f;
}

.notice-icon {
  width: 40px;
  height: 40px;
  background: #fff1f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #ff4d4f;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
}

.notice-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 8px;
}

.notice-time {
  font-size: 12px;
  color: #999;
}

/* 每日资讯 - 微信公众号风格 */
.news-area {
  background: #f5f5f5;
  padding: 20px;
}

.news-list-centered {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-card-large {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.news-card-large:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.news-card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.news-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.news-card-large:hover .news-card-image img {
  transform: scale(1.05);
}

.news-card-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: rgba(114, 46, 209, 0.9);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.news-card-content {
  padding: 20px;
}

.news-card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-card-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.news-card-source {
  font-size: 13px;
  color: #722ed1;
  font-weight: 500;
}

.news-card-time {
  font-size: 12px;
  color: #999;
}

/* 旧样式兼容 */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.news-card {
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.news-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.news-tag {
  display: inline-block;
  padding: 4px 10px;
  background: #f9f0ff;
  color: #722ed1;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  margin-bottom: 10px;
}

.news-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  line-height: 1.5;
  margin-bottom: 8px;
}

.news-time {
  font-size: 12px;
  color: #999;
}

/* 邮箱提醒 */
.email-area .special-header {
  background: linear-gradient(135deg, #13c2c2 0%, #5cdbd3 100%);
}

.email-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.email-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.email-avatar {
  width: 44px;
  height: 44px;
  background: #e6fffb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #13c2c2;
  flex-shrink: 0;
}

.email-info {
  flex: 1;
  min-width: 0;
}

.email-sender {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.email-subject {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-time {
  font-size: 12px;
  color: #999;
}

/* ImSky助手 */
.robot-area .special-header {
  background: linear-gradient(135deg, #eb2f96 0%, #ff85c0 100%);
}

.robot-chat {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.robot-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.robot-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #eb2f96 0%, #ff85c0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  flex-shrink: 0;
}

.robot-bubble {
  max-width: 70%;
  padding: 12px 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.robot-quick-actions {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.quick-title {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-buttons .ant-btn {
  border-radius: 16px;
}
</style>
