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
  <div class="contact">
    <!-- 联系人列表 -->
    <div class="contact-panel">
      <!-- 联系人分组列表 -->
      <ContactList
        :groups="filteredContactGroups"
        :new-friend-count="newFriendRequestCount"
        @contact-click="handleSelectContact"
        @context-menu="handleContactContextMenu"
        @new-friends="showNewFriends"
        @group-chats="showGroups"
        @tags="showTags"
        @manage="showContactManage"
      />
    </div>
    
    <!-- 联系人详情 -->
    <div class="contact-detail">
      <template v-if="selectedContact">
        <div class="detail-header">
          <a-avatar :size="80" :src="selectedContact.avatar" class="detail-avatar">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <h2 class="detail-name">{{ selectedContact.nickname }}</h2>
          <p class="detail-account">账号: {{ selectedContact.id }}</p>
          <div class="detail-status" :class="selectedContact.status">
            <span class="status-dot"></span>
            {{ selectedContact.status === 'online' ? '在线' : selectedContact.status === 'busy' ? '忙碌' : selectedContact.status === 'away' ? '离开' : '离线' }}
          </div>
        </div>

        <div class="detail-info">
          <div class="info-item">
            <span class="info-label">部门</span>
            <span class="info-value">{{ selectedContact.department || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">职位</span>
            <span class="info-value">{{ selectedContact.position || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">个性签名</span>
            <span class="info-value">{{ selectedContact.signature || '这个人很懒，什么都没写' }}</span>
          </div>
        </div>

        <!-- 好友动态 -->
        <div class="contact-moments">
          <div class="moments-header">
            <span class="moments-title">动态</span>
            <span class="moments-count">{{ contactMoments.length }}条</span>
          </div>
          <div class="moments-list">
            <div
              v-for="moment in contactMoments.slice(0, 4)"
              :key="moment.id"
              class="moment-thumb"
              @click="viewMoment(moment)"
            >
              <img v-if="moment.images && moment.images.length > 0" :src="moment.images[0]" alt="动态图片">
              <div v-else class="moment-text-only">
                <FileTextOutlined />
              </div>
            </div>
            <div v-if="contactMoments.length === 0" class="moments-empty">
              <span>暂无动态</span>
            </div>
          </div>
        </div>

        <div class="detail-actions">
          <a-button type="primary" size="large" block @click="startChat">
            <MessageOutlined />
            发消息
          </a-button>
          <a-button size="large" block @click="startAudioCall">
            <PhoneOutlined />
            语音通话
          </a-button>
          <a-button size="large" block @click="startVideoCall">
            <VideoCameraOutlined />
            视频通话
          </a-button>
        </div>
      </template>
      <div v-else class="empty-state">
        <div class="empty-illustration">
          <div class="empty-bg-circle"></div>
          <div class="empty-icon">
            <TeamOutlined />
          </div>
        </div>
        <h3 class="empty-title">选择联系人</h3>
        <p class="empty-desc">从左侧列表选择一个联系人查看详情<br>或开始聊天</p>
        <div class="empty-tips">
          <div class="tip-item">
            <MessageOutlined class="tip-icon" />
            <span>发送消息</span>
          </div>
          <div class="tip-item">
            <PhoneOutlined class="tip-icon" />
            <span>语音通话</span>
          </div>
          <div class="tip-item">
            <VideoCameraOutlined class="tip-icon" />
            <span>视频通话</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 好友动态列表弹窗 -->
    <a-modal
      :open="momentModalVisible"
      :footer="null"
      :width="500"
      :closable="true"
      @cancel="closeMomentModal"
      class="moments-list-modal"
    >
      <div class="moments-list-container">
        <!-- 弹窗头部 -->
        <div class="moments-modal-header">
          <div class="moments-cover"></div>
          <div class="moments-user">
            <span class="moments-username">{{ selectedContact?.nickname }}</span>
            <a-avatar :size="64" :src="selectedContact?.avatar" class="moments-avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
          </div>
        </div>
        <!-- 动态列表 -->
        <div class="moments-feed">
          <MomentItem
            v-for="moment in contactMoments"
            :key="moment.id"
            :moment="moment"
            :user-name="selectedContact?.nickname || ''"
            :user-avatar="selectedContact?.avatar"
            :like-users="moment.likeUsers"
            @click="onMomentClick"
            @like="onMomentLike"
            @comment="onMomentComment"
          />
        </div>
      </div>
    </a-modal>

    <!-- 动态详情弹窗 -->
    <MomentDetailModal
      :visible="momentDetailVisible"
      :moment="currentMoment"
      :user-name="selectedContact?.nickname || ''"
      :user-avatar="selectedContact?.avatar"
      :likes="momentLikes"
      :comments="momentComments"
      :is-liked="momentIsLiked"
      @close="closeMomentDetail"
      @like="onDetailLike"
      @comment="onDetailComment"
      @comment-like="onCommentLike"
      @share="onMomentShare"
    />

    <!-- 新的朋友弹窗 -->
    <NewFriendsModal
      :visible="newFriendsModalVisible"
      @close="closeNewFriendsModal"
      @accept="onAcceptFriend"
      @reject="onRejectFriend"
      @addFriend="onAddFriendClick"
    />

    <!-- 群聊弹窗 -->
    <GroupChatsModal
      :visible="groupChatsModalVisible"
      @close="closeGroupChatsModal"
      @createGroup="onCreateGroup"
      @groupClick="onGroupClick"
      @joinGroup="onJoinGroup"
    />

    <!-- 标签弹窗 -->
    <TagsModal
      :visible="tagsModalVisible"
      @close="closeTagsModal"
      @tagClick="onTagClick"
      @createTag="onCreateTag"
      @editTag="onEditTag"
      @deleteTag="onDeleteTag"
    />

    <!-- 通讯录管理弹窗 -->
    <ContactManageModal
      :visible="contactManageModalVisible"
      @close="closeContactManageModal"
      @update="onContactsUpdate"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  UserOutlined,
  TeamOutlined,
  MessageOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  LikeOutlined
} from '@ant-design/icons-vue';
import { ContactList, EmptyState, MomentItem, MomentDetailModal } from '@gitcoffee-os/im-ui';
import type { User, Moment, Comment, Like } from '@gitcoffee-os/im-ui';
import { useContactStore, useCallStore, useChatStore } from '../../stores';
import { im } from '@gitcoffee-os/api';
import NewFriendsModal from '../../components/modals/NewFriendsModal.vue';
import GroupChatsModal from '../../components/modals/GroupChatsModal.vue';
import TagsModal from '../../components/modals/TagsModal.vue';
import ContactManageModal from '../../components/modals/ContactManageModal.vue';

// 定义联系人分组接口（避免与组件名冲突）
interface ContactGroupItem {
  id: string;
  name: string;
  contacts: User[];
}

const { getContactListApi, getContactGroupsApi, createSessionApi } = im;

const router = useRouter();
const contactStore = useContactStore();
const callStore = useCallStore();
const chatStore = useChatStore();

const searchKeyword = ref('');
const selectedContact = ref<User | null>(null);

// 动态弹窗状态
const momentModalVisible = ref(false);
const currentMoment = ref<Moment | null>(null);
const momentDetailVisible = ref(false);
const momentLikes = ref<Like[]>([]);
const momentComments = ref<Comment[]>([]);
const momentIsLiked = ref(false);

// 新的朋友、群聊、标签弹窗状态
const newFriendsModalVisible = ref(false);
const groupChatsModalVisible = ref(false);
const tagsModalVisible = ref(false);
const contactManageModalVisible = ref(false);

// 好友动态数据（Mock）
const contactMoments = ref([
  {
    id: 'moment1',
    content: '今天天气真好，出去散步了！',
    images: ['https://picsum.photos/200/200?random=1'],
    createTime: Date.now() - 3600000,
    likes: 5,
    comments: 3,
    likeUsers: [
      { id: 'l1', userId: 'user1', userName: '小明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
      { id: 'l2', userId: 'user2', userName: '小红', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
      { id: 'l3', userId: 'user3', userName: '小李', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
      { id: 'l4', userId: 'user4', userName: '小张', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
      { id: 'l5', userId: 'user5', userName: '小王', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' },
      { id: 'l6', userId: 'user6', userName: '小刘', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' }
    ]
  },
  {
    id: 'moment2',
    content: '分享一篇好文章',
    images: ['https://picsum.photos/200/200?random=2', 'https://picsum.photos/200/200?random=3'],
    createTime: Date.now() - 86400000,
    likes: 3,
    comments: 1,
    likeUsers: [
      { id: 'l1', userId: 'user1', userName: '小明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
      { id: 'l7', userId: 'user7', userName: '小陈', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7' },
      { id: 'l8', userId: 'user8', userName: '小赵', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8' }
    ]
  },
  {
    id: 'moment3',
    content: '今天的工作完成了，很有成就感！',
    images: [],
    createTime: Date.now() - 172800000,
    likes: 8,
    comments: 5,
    likeUsers: [
      { id: 'l1', userId: 'user1', userName: '小明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
      { id: 'l2', userId: 'user2', userName: '小红', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
      { id: 'l3', userId: 'user3', userName: '小李', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
      { id: 'l4', userId: 'user4', userName: '小张', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' }
    ]
  },
  {
    id: 'moment4',
    content: '周末愉快~',
    images: ['https://picsum.photos/200/200?random=4'],
    createTime: Date.now() - 259200000,
    likes: 2,
    comments: 0,
    likeUsers: [
      { id: 'l2', userId: 'user2', userName: '小红', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
      { id: 'l9', userId: 'user9', userName: '小周', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=9' }
    ]
  }
]);

const contacts = computed(() => contactStore.contacts);
const contactGroups = computed(() => contactStore.contactGroups);
const newFriendRequestCount = computed(() => contactStore.newFriendRequestCount);

const filteredContactGroups = computed<ContactGroupItem[]>(() => {
  if (!searchKeyword.value) return contactGroups.value as ContactGroupItem[];
  const keyword = searchKeyword.value.toLowerCase();
  return (contactGroups.value as ContactGroupItem[]).map((group: ContactGroupItem) => ({
    ...group,
    contacts: group.contacts.filter((c: User) =>
      (c.nickname?.toLowerCase().includes(keyword) ?? false) ||
      (c.id?.toLowerCase().includes(keyword) ?? false)
    )
  })).filter((group: ContactGroupItem) => group.contacts.length > 0);
});

onMounted(() => {
  // 加载 Mock 数据
  loadMockData();
  loadContacts();
  loadContactGroups();
});

// 加载 Mock 联系人数据
const loadMockData = () => {
  const mockContacts: User[] = [
    {
      id: 'user1',
      nickname: '张小明',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zxm',
      status: 'online',
      signature: '生活不止眼前的苟且，还有诗和远方'
    },
    {
      id: 'user2',
      nickname: '李华',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lihua',
      status: 'online',
      signature: '产品经理 | 热爱创新'
    },
    {
      id: 'user3',
      nickname: '王工',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
      status: 'offline',
      signature: '代码如诗，编程如画'
    },
    {
      id: 'user4',
      nickname: '陈思思',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen',
      status: 'online',
      signature: '设计师 | 追求极致体验'
    },
    {
      id: 'user5',
      nickname: '刘总',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liu',
      status: 'offline',
      signature: '格局决定结局'
    },
    {
      id: 'user6',
      nickname: '赵敏',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao',
      status: 'online',
      signature: '吃货一枚，美食探店中'
    },
    {
      id: 'user7',
      nickname: '孙强',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sun',
      status: 'offline',
      signature: '架构师的自我修养'
    },
    {
      id: 'user8',
      nickname: '周雅',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhou',
      status: 'online',
      signature: '运营小姐姐'
    },
    {
      id: 'user9',
      nickname: '吴磊',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wu',
      status: 'offline',
      signature: '全栈开发者'
    },
    {
      id: 'user10',
      nickname: '郑芳',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zheng',
      status: 'online',
      signature: '人才是企业最大的财富'
    },
    {
      id: 'user11',
      nickname: '钱多多',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qian',
      status: 'offline',
      signature: '财务小姐姐'
    },
    {
      id: 'user12',
      nickname: '冯大伟',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=feng',
      status: 'online',
      signature: '测试工程师，bug终结者'
    }
  ];

  const mockGroups: ContactGroupItem[] = [
    {
      id: 'group1',
      name: 'A',
      contacts: mockContacts.filter((c: User) => ['张小明'].includes(c.nickname || ''))
    },
    {
      id: 'group2',
      name: 'C',
      contacts: mockContacts.filter((c: User) => ['陈思思'].includes(c.nickname || ''))
    },
    {
      id: 'group3',
      name: 'F',
      contacts: mockContacts.filter((c: User) => ['冯大伟'].includes(c.nickname || ''))
    },
    {
      id: 'group4',
      name: 'L',
      contacts: mockContacts.filter((c: User) => ['李华', '刘总'].includes(c.nickname || ''))
    },
    {
      id: 'group5',
      name: 'Q',
      contacts: mockContacts.filter((c: User) => ['钱多多'].includes(c.nickname || ''))
    },
    {
      id: 'group6',
      name: 'S',
      contacts: mockContacts.filter((c: User) => ['孙强'].includes(c.nickname || ''))
    },
    {
      id: 'group7',
      name: 'W',
      contacts: mockContacts.filter((c: User) => ['王工', '吴磊', '周雅'].includes(c.nickname || ''))
    },
    {
      id: 'group8',
      name: 'Z',
      contacts: mockContacts.filter((c: User) => ['赵敏', '郑芳'].includes(c.nickname || ''))
    }
  ];

  contactStore.setContacts(mockContacts);
  contactStore.setContactGroups(mockGroups);
  
  // 添加一些好友申请 Mock 数据
  contactStore.setFriendRequests([
    { id: 'req1', fromId: 'user99', fromName: '马总', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ma', status: 'pending', message: '你好，我是马总', time: '10分钟前' },
    { id: 'req2', fromId: 'user98', fromName: '林妹妹', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lin', status: 'pending', message: '通过一下呗', time: '2小时前' }
  ]);
};

const loadContacts = async () => {
  try {
    const res = await getContactListApi();
    if (res?.data) {
      contactStore.setContacts(res.data);
    }
  } catch (error) {
    console.error('加载联系人失败:', error);
  }
};

const loadContactGroups = async () => {
  try {
    const res = await getContactGroupsApi();
    if (res?.data) {
      contactStore.setContactGroups(res.data);
    }
  } catch (error) {
    console.error('加载联系人分组失败:', error);
  }
};

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword;
};

const handleSelectContact = (contact: User) => {
  selectedContact.value = contact;
};

const startChat = async () => {
  if (!selectedContact.value) return;
  
  try {
    const res = await createSessionApi({
      type: 'private',
      targetId: selectedContact.value.id
    });
    if (res?.data) {
      chatStore.addSession(res.data);
      router.push({ name: 'ChatSession', params: { sessionId: res.data.id } });
    }
  } catch (error) {
    console.error('创建会话失败:', error);
  }
};

const startAudioCall = () => {
  if (!selectedContact.value) return;
  callStore.setCurrentCall({
    id: Date.now().toString(),
    type: 'audio',
    status: 'calling',
    callerId: 'current-user',
    calleeId: selectedContact.value.id,
    startTime: Date.now()
  });
  callStore.setRemoteUser(selectedContact.value);
};

const startVideoCall = () => {
  if (!selectedContact.value) return;
  callStore.setCurrentCall({
    id: Date.now().toString(),
    type: 'video',
    status: 'calling',
    callerId: 'current-user',
    calleeId: selectedContact.value.id,
    startTime: Date.now()
  });
  callStore.setRemoteUser(selectedContact.value);
};

const showNewFriends = () => {
  newFriendsModalVisible.value = true;
};

const closeNewFriendsModal = () => {
  newFriendsModalVisible.value = false;
};

const onAcceptFriend = (request: any) => {
  console.log('接受好友请求:', request);
  newFriendRequestCount.value = Math.max(0, newFriendRequestCount.value - 1);
};

const onRejectFriend = (request: any) => {
  console.log('拒绝好友请求:', request);
  newFriendRequestCount.value = Math.max(0, newFriendRequestCount.value - 1);
};

const onAddFriendClick = () => {
  console.log('添加好友');
};

const showGroups = () => {
  groupChatsModalVisible.value = true;
};

const closeGroupChatsModal = () => {
  groupChatsModalVisible.value = false;
};

const onCreateGroup = () => {
  console.log('创建群聊');
};

const onGroupClick = (group: any) => {
  console.log('点击群聊:', group);
};

const onJoinGroup = (group: any) => {
  console.log('加入群聊:', group);
};

const showTags = () => {
  tagsModalVisible.value = true;
};

const closeTagsModal = () => {
  tagsModalVisible.value = false;
};

const onTagClick = (tag: any) => {
  console.log('点击标签:', tag);
};

const onCreateTag = (tag: any) => {
  console.log('创建标签:', tag);
};

const onEditTag = (tag: any) => {
  console.log('编辑标签:', tag);
};

const onDeleteTag = (tag: any) => {
  console.log('删除标签:', tag);
};

const showContactManage = () => {
  contactManageModalVisible.value = true;
};

const closeContactManageModal = () => {
  contactManageModalVisible.value = false;
};

const onContactsUpdate = (contacts: any[]) => {
  console.log('通讯录已更新:', contacts);
};

const viewMoment = (moment: any) => {
  momentModalVisible.value = true;
};

const closeMomentModal = () => {
  momentModalVisible.value = false;
};

// 动态列表点击事件
const onMomentClick = (moment: Moment) => {
  currentMoment.value = moment;
  // 加载该动态的点赞和评论数据
  loadMomentInteraction(moment);
  momentDetailVisible.value = true;
};

const onMomentLike = (moment: Moment) => {
  console.log('点赞动态:', moment);
};

const onMomentComment = (moment: Moment) => {
  console.log('评论动态:', moment);
};

// 加载动态互动数据
const loadMomentInteraction = (moment: Moment) => {
  // Mock 点赞数据
  momentLikes.value = [
    { id: '1', userId: 'user1', userName: '小明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    { id: '2', userId: 'user2', userName: '小红', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
    { id: '3', userId: 'user3', userName: '小李', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' }
  ];

  // Mock 评论数据
  momentComments.value = [
    {
      id: 'c1',
      userId: 'user1',
      userName: '小明',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      content: '真不错！',
      time: '2小时前',
      likes: 5
    },
    {
      id: 'c2',
      userId: 'user2',
      userName: '小红',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      content: '天气确实很好呀~',
      time: '1小时前',
      likes: 3
    }
  ];

  momentIsLiked.value = false;
};

// 关闭动态详情
const closeMomentDetail = () => {
  momentDetailVisible.value = false;
};

// 详情页点赞
const onDetailLike = (moment: Moment) => {
  momentIsLiked.value = !momentIsLiked.value;
};

// 详情页评论
const onDetailComment = (moment: Moment, content: string, replyTo?: Comment) => {
  const newComment: Comment = {
    id: Date.now().toString(),
    userId: 'currentUser',
    userName: '我',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
    content: content,
    time: '刚刚',
    likes: 0
  };
  if (replyTo) {
    newComment.content = '回复 ' + replyTo.userName + ': ' + content;
  }
  momentComments.value.unshift(newComment);
};

// 评论点赞
const onCommentLike = (comment: Comment) => {
  const idx = momentComments.value.findIndex((c: Comment) => c.id === comment.id);
  if (idx !== -1) {
    momentComments.value[idx].likes = (momentComments.value[idx].likes || 0) + 1;
  }
};

// 分享动态
const onMomentShare = (moment: Moment) => {
  console.log('分享动态:', moment);
};

const formatMomentTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < 7 * day) {
    return Math.floor(diff / day) + '天前';
  } else {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
};

const handleContactContextMenu = (event: { contact: User; x: number; y: number }) => {
  console.log('联系人右键菜单:', event);
};
</script>

<style scoped>
.contact {
  display: flex;
  height: 100%;
}

.contact-panel {
  width: 280px;
  border-right: 1px solid #e0e0e0;
  background: #f7f7f7;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.contact-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 40px;
  background: linear-gradient(180deg, #f8fffe 0%, #fff 30%);
  position: relative;
  overflow-y: auto;
}

.contact-detail::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, #e6f7ed 0%, #f0f9ff 100%);
  z-index: 0;
}

.detail-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.detail-avatar {
  margin-bottom: 20px;
  border: 4px solid #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.detail-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.detail-name {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.detail-account {
  font-size: 14px;
  color: #888;
  margin-bottom: 14px;
  font-family: 'Monaco', monospace;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 12px;
}

.detail-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #999;
  padding: 6px 14px;
  background: #f5f5f5;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.detail-status .status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #999;
  box-shadow: 0 0 0 3px rgba(153, 153, 153, 0.2);
}

.detail-status.online {
  color: #07c160;
  background: #e6f7ed;
}

.detail-status.online .status-dot {
  background: #07c160;
  box-shadow: 0 0 0 3px rgba(7, 193, 96, 0.2);
  animation: pulse 2s infinite;
}

.detail-status.busy {
  color: #ff4d4f;
  background: #fff1f0;
}

.detail-status.busy .status-dot {
  background: #ff4d4f;
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.2);
}

.detail-status.away {
  color: #faad14;
  background: #fffbe6;
}

.detail-status.away .status-dot {
  background: #faad14;
  box-shadow: 0 0 0 3px rgba(250, 173, 20, 0.2);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.detail-info {
  width: 100%;
  max-width: 420px;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;
}

.info-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #fafafa;
  margin: 0 -12px;
  padding: 12px 12px;
  border-radius: 8px;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 70px;
  color: #999;
  font-size: 14px;
  font-weight: 500;
}

.info-value {
  flex: 1;
  color: #333;
  font-size: 14px;
  font-weight: 400;
}

.detail-actions {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  z-index: 1;
}

.detail-actions .ant-btn {
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.detail-actions .ant-btn-primary {
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(7, 193, 96, 0.35);
}

.detail-actions .ant-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(7, 193, 96, 0.45);
}

.detail-actions .ant-btn:not(.ant-btn-primary) {
  border: 1px solid #e0e0e0;
  color: #666;
}

.detail-actions .ant-btn:not(.ant-btn-primary):hover {
  border-color: #07c160;
  color: #07c160;
  background: #f0f9f4;
}

/* 空状态样式 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: linear-gradient(180deg, #f8fffe 0%, #fff 50%);
  position: relative;
  overflow-y: auto;
}

.empty-illustration {
  position: relative;
  margin-bottom: 32px;
}

.empty-bg-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e6f7ed 0%, #f0f9ff 100%);
  animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

.empty-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 40px;
  box-shadow: 0 8px 32px rgba(7, 193, 96, 0.35);
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.empty-desc {
  font-size: 15px;
  color: #888;
  text-align: center;
  line-height: 1.8;
  margin-bottom: 40px;
}

.empty-tips {
  display: flex;
  gap: 32px;
}

.tip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.tip-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.tip-icon {
  font-size: 24px;
  color: #07c160;
}

.tip-item span {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

/* 好友动态样式 */
.contact-moments {
  width: 100%;
  max-width: 420px;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;
}

.moments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.moments-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  position: relative;
  padding-left: 12px;
}

.moments-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #07c160 0%, #10b981 100%);
  border-radius: 2px;
}

.moments-count {
  font-size: 13px;
  color: #999;
  background: #f5f5f5;
  padding: 4px 10px;
  border-radius: 10px;
}

.moments-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.moment-thumb {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.moment-thumb:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.moment-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.moment-thumb:hover img {
  transform: scale(1.1);
}

.moment-text-only {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0f9f4 0%, #e6f7ed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #07c160;
  font-size: 28px;
}

.moments-empty {
  width: 100%;
  padding: 24px;
  text-align: center;
  color: #999;
  font-size: 14px;
  background: #fafafa;
  border-radius: 12px;
}

/* 动态列表弹窗样式 */
.moments-list-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
  max-height: 80vh;
}

.moments-list-modal :deep(.ant-modal-body) {
  padding: 0;
  max-height: 80vh;
  overflow-y: auto;
}

.moments-list-container {
  background: #f5f5f5;
}

.moments-modal-header {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #e6f7ed 0%, #f0f9ff 100%);
}

.moments-cover {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #07c160 0%, #10b981 50%, #52c41a 100%);
  opacity: 0.8;
}

.moments-user {
  position: absolute;
  bottom: -32px;
  right: 24px;
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.moments-username {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 8px;
}

.moments-avatar {
  border: 4px solid #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.moments-feed {
  padding: 48px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

</style>
