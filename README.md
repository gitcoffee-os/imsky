# ImSky 天信IM - PC 端即时通讯应用

ImSky 天信IM 是一款高性能、高可用的企业级跨平台即时通讯解决方案。

## 项目结构

```
/apps/imsky
├── src/
│   ├── components/          # 组件注册
│   │   └── antdv.register.ts
│   ├── config/              # 配置文件
│   │   └── config.ts
│   ├── layouts/             # 布局组件
│   │   └── MainLayout.vue   # 主布局（侧边栏 + 内容区）
│   ├── locales/             # 国际化
│   │   ├── zh/              # 中文
│   │   └── en/              # 英文
│   ├── router/              # 路由配置
│   │   └── index.ts
│   ├── stores/              # Pinia 状态管理
│   │   ├── index.ts
│   │   ├── settings.ts      # 设置状态
│   │   ├── chat.ts          # 聊天状态
│   │   ├── contact.ts       # 联系人状态
│   │   └── call.ts          # 通话状态
│   ├── styles/              # 全局样式
│   │   └── global.css
│   ├── views/               # 页面视图
│   │   ├── chat/            # 聊天页面
│   │   │   └── ChatView.vue
│   │   └── contact/         # 通讯录页面
│   │       └── ContactView.vue
│   ├── App.vue              # 根组件
│   └── main.tsx             # 入口文件
├── index.html
└── package.json
```

## 功能模块

### 1. 聊天模块 (Chat)
- 会话列表展示
- 消息收发（文本、图片、文件、语音）
- 消息搜索
- 消息撤回
- 音视频通话入口

### 2. 通讯录模块 (Contact)
- 联系人列表
- 联系人分组
- 新的朋友（好友申请）
- 群聊列表
- 标签管理
- 联系人详情

### 3. 通话模块 (Call)
- 语音通话
- 视频通话
- 通话记录

### 4. 设置模块 (Settings)
- 主题切换（浅色/深色）
- 语言切换
- 通知设置
- 字体大小调整

## 依赖包

### @gitcoffee/im-ui
IM 专用 UI 组件库，包含：
- 布局组件：ImLayout, ImSidebar, ImMain
- 会话组件：SessionList, SessionItem, SessionSearch
- 聊天组件：ChatHeader, ChatMessageList, ChatMessageItem, ChatInputBox
- 联系人组件：ContactList, ContactGroup, ContactItem
- 通话组件：CallPanel, CallWindow, VideoPlayer
- 通用组件：EmptyState, LoadingState, ContextMenu

### @gitcoffee/im-utils
IM 工具函数库，包含：
- dateTime: 日期时间处理
- file: 文件处理
- message: 消息处理
- session: 会话处理
- user: 用户处理
- websocket: WebSocket 管理
- storage: 本地存储管理
- validate: 验证工具

### @gitcoffee/api
API 接口库，IM 相关接口位于 `/api/authority/im/`：
- chat.api.ts: 消息相关接口
- session.api.ts: 会话相关接口
- contact.api.ts: 联系人相关接口
- contactGroups.api.ts: 联系人分组接口
- group.api.ts: 群聊相关接口
- call.api.ts: 通话相关接口
- imUser.api.ts: IM 用户相关接口

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build
```

## 技术栈

- Vue 3 + TypeScript
- Pinia 状态管理
- Vue Router 路由
- Ant Design Vue UI 组件库
- WebSocket 实时通信
