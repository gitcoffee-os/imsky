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
    :width="700"
    :closable="true"
    @cancel="handleClose"
    class="contact-manage-modal"
  >
    <div class="contact-manage-container">
      <!-- 头部 -->
      <div class="modal-header">
        <h3 class="modal-title">通讯录管理</h3>
        <span class="modal-subtitle">共 {{ totalContacts }} 位联系人</span>
      </div>

      <!-- 快捷操作栏 -->
      <div class="quick-actions">
        <div class="action-item" @click="handleBatchDelete">
          <div class="action-icon" style="background-color: #ff4d4f;">
            <DeleteOutlined />
          </div>
          <span class="action-name">批量删除</span>
        </div>
        <div class="action-item" @click="handleBatchTag">
          <div class="action-icon" style="background-color: #1890ff;">
            <TagsOutlined />
          </div>
          <span class="action-name">批量标签</span>
        </div>
        <div class="action-item" @click="handleBatchGroup">
          <div class="action-icon" style="background-color: #52c41a;">
            <TeamOutlined />
          </div>
          <span class="action-name">批量分组</span>
        </div>
        <div class="action-item" @click="handleExport">
          <div class="action-icon" style="background-color: #faad14;">
            <ExportOutlined />
          </div>
          <span class="action-name">导出通讯录</span>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <a-input
          v-model:value="searchKeyword"
          placeholder="搜索联系人"
          allow-clear
          class="search-input"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-select
          v-model:value="filterTag"
          placeholder="按标签筛选"
          allow-clear
          class="filter-select"
        >
          <a-select-option v-for="tag in tags" :key="tag.id" :value="tag.id">
            <span class="tag-dot" :style="{ backgroundColor: tag.color }"></span>
            {{ tag.name }}
          </a-select-option>
        </a-select>
        <a-select
          v-model:value="filterGroup"
          placeholder="按分组筛选"
          allow-clear
          class="filter-select"
        >
          <a-select-option v-for="group in groups" :key="group.id" :value="group.id">
            {{ group.name }}
          </a-select-option>
        </a-select>
      </div>

      <!-- 联系人列表 -->
      <div class="contacts-section">
        <div class="section-header">
          <a-checkbox
            v-model:checked="selectAll"
            :indeterminate="isIndeterminate"
            @change="handleSelectAll"
          >
            全选
          </a-checkbox>
          <span class="selected-count" v-if="selectedContacts.length > 0">
            已选择 {{ selectedContacts.length }} 位联系人
          </span>
          <div class="header-actions" v-if="selectedContacts.length > 0">
            <a-button type="link" danger size="small" @click="handleDeleteSelected">
              删除
            </a-button>
            <a-button type="link" size="small" @click="handleTagSelected">
              添加标签
            </a-button>
          </div>
        </div>

        <div class="contacts-list">
          <div
            v-for="contact in filteredContacts"
            :key="contact.id"
            class="contact-item"
            :class="{ selected: selectedContacts.includes(contact.id) }"
          >
            <a-checkbox
              :checked="selectedContacts.includes(contact.id)"
              @change="(e) => handleSelectContact(contact.id, e.target.checked)"
            />
            <a-avatar :size="40" :src="contact.avatar" class="contact-avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <div class="contact-info">
              <div class="contact-name">{{ contact.name }}</div>
              <div class="contact-meta">
                <span class="contact-phone">{{ contact.phone }}</span>
                <span class="contact-group">{{ contact.groupName }}</span>
              </div>
            </div>
            <div class="contact-tags">
              <a-tag
                v-for="tag in contact.tags.slice(0, 2)"
                :key="tag.id"
                :color="tag.color"
                size="small"
              >
                {{ tag.name }}
              </a-tag>
              <span v-if="contact.tags.length > 2" class="more-tags">+{{ contact.tags.length - 2 }}</span>
            </div>
            <div class="contact-actions">
              <a-button type="text" size="small" @click="handleEditContact(contact)">
                <EditOutlined />
              </a-button>
              <a-button type="text" size="small" danger @click="handleDeleteContact(contact)">
                <DeleteOutlined />
              </a-button>
            </div>
          </div>

          <EmptyState
            v-if="filteredContacts.length === 0"
            description="暂无联系人"
            class="empty-contacts"
          />
        </div>
      </div>

      <!-- 分组管理 -->
      <div class="groups-section">
        <div class="section-title">
          <span>分组管理</span>
          <a-button type="link" size="small" @click="handleCreateGroup">
            <PlusOutlined />
            新建分组
          </a-button>
        </div>
        <div class="groups-list">
          <div
            v-for="group in groups"
            :key="group.id"
            class="group-item"
          >
            <span class="group-name">{{ group.name }}</span>
            <span class="group-count">{{ group.contactCount }}人</span>
            <div class="group-actions">
              <a-button type="text" size="small" @click="handleEditGroup(group)">
                <EditOutlined />
              </a-button>
              <a-button
                type="text"
                size="small"
                danger
                :disabled="group.isDefault"
                @click="handleDeleteGroup(group)"
              >
                <DeleteOutlined />
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>

  <!-- 编辑联系人弹窗 -->
  <a-modal
    v-model:open="editContactVisible"
    title="编辑联系人"
    :width="400"
    @ok="saveContact"
    @cancel="closeEditContact"
  >
    <a-form :model="contactForm" layout="vertical">
      <a-form-item label="备注名称">
        <a-input v-model:value="contactForm.name" placeholder="请输入备注名称" />
      </a-form-item>
      <a-form-item label="分组">
        <a-select v-model:value="contactForm.groupId" placeholder="选择分组">
          <a-select-option v-for="group in groups" :key="group.id" :value="group.id">
            {{ group.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="标签">
        <a-select
          v-model:value="contactForm.tagIds"
          mode="multiple"
          placeholder="选择标签"
        >
          <a-select-option v-for="tag in tags" :key="tag.id" :value="tag.id">
            <span class="tag-dot" :style="{ backgroundColor: tag.color }"></span>
            {{ tag.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- 新建/编辑分组弹窗 -->
  <a-modal
    v-model:open="groupFormVisible"
    :title="editingGroup ? '编辑分组' : '新建分组'"
    :width="400"
    @ok="saveGroup"
    @cancel="closeGroupForm"
  >
    <a-form :model="groupForm" layout="vertical">
      <a-form-item label="分组名称" required>
        <a-input v-model:value="groupForm.name" placeholder="请输入分组名称" maxlength="20" show-count />
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- 批量标签弹窗 -->
  <a-modal
    v-model:open="batchTagVisible"
    title="批量添加标签"
    :width="400"
    @ok="applyBatchTag"
    @cancel="closeBatchTag"
  >
    <p class="batch-tip">已为 {{ selectedContacts.length }} 位联系人选择标签</p>
    <a-select
      v-model:value="batchTagIds"
      mode="multiple"
      placeholder="选择要添加的标签"
      style="width: 100%"
    >
      <a-select-option v-for="tag in tags" :key="tag.id" :value="tag.id">
        <span class="tag-dot" :style="{ backgroundColor: tag.color }"></span>
        {{ tag.name }}
      </a-select-option>
    </a-select>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  SearchOutlined,
  DeleteOutlined,
  TagsOutlined,
  TeamOutlined,
  ExportOutlined,
  UserOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
import { EmptyState } from '@gitcoffee-os/im-ui';
import { message } from 'ant-design-vue';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Group {
  id: string;
  name: string;
  contactCount: number;
  isDefault?: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  groupId: string;
  groupName: string;
  tags: Tag[];
}

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update', contacts: Contact[]): void;
}>();

// 搜索和筛选
const searchKeyword = ref('');
const filterTag = ref<string | null>(null);
const filterGroup = ref<string | null>(null);

// 选择状态
const selectedContacts = ref<string[]>([]);
const selectAll = ref(false);

// 弹窗状态
const editContactVisible = ref(false);
const groupFormVisible = ref(false);
const batchTagVisible = ref(false);
const editingContact = ref<Contact | null>(null);
const editingGroup = ref<Group | null>(null);

// 表单数据
const contactForm = ref({
  name: '',
  groupId: '',
  tagIds: [] as string[]
});

const groupForm = ref({
  name: ''
});

const batchTagIds = ref<string[]>([]);

// 模拟标签数据
const tags = ref<Tag[]>([
  { id: 't1', name: '同事', color: '#07c160' },
  { id: 't2', name: '家人', color: '#fa541c' },
  { id: 't3', name: '朋友', color: '#1890ff' },
  { id: 't4', name: '客户', color: '#722ed1' },
  { id: 't5', name: '重要', color: '#f5222d' }
]);

// 模拟分组数据
const groups = ref<Group[]>([
  { id: 'g1', name: '我的好友', contactCount: 45, isDefault: true },
  { id: 'g2', name: '同事', contactCount: 25 },
  { id: 'g3', name: '家人', contactCount: 8 },
  { id: 'g4', name: '客户', contactCount: 15 },
  { id: 'g5', name: '同学', contactCount: 20 }
]);

// 模拟联系人数据
const contacts = ref<Contact[]>([
  {
    id: 'c1',
    name: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    phone: '13800138001',
    groupId: 'g2',
    groupName: '同事',
    tags: [tags.value[0], tags.value[4]]
  },
  {
    id: 'c2',
    name: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    phone: '13800138002',
    groupId: 'g1',
    groupName: '我的好友',
    tags: [tags.value[2]]
  },
  {
    id: 'c3',
    name: '王五',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    phone: '13800138003',
    groupId: 'g3',
    groupName: '家人',
    tags: [tags.value[1]]
  },
  {
    id: 'c4',
    name: '赵六',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    phone: '13800138004',
    groupId: 'g4',
    groupName: '客户',
    tags: [tags.value[3], tags.value[4]]
  },
  {
    id: 'c5',
    name: '钱七',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
    phone: '13800138005',
    groupId: 'g5',
    groupName: '同学',
    tags: [tags.value[2]]
  },
  {
    id: 'c6',
    name: '孙八',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
    phone: '13800138006',
    groupId: 'g1',
    groupName: '我的好友',
    tags: []
  }
]);

const totalContacts = computed(() => contacts.value.length);

const filteredContacts = computed(() => {
  let result = contacts.value;

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(keyword) ||
      c.phone.includes(keyword)
    );
  }

  if (filterTag.value) {
    result = result.filter(c =>
      c.tags.some(t => t.id === filterTag.value)
    );
  }

  if (filterGroup.value) {
    result = result.filter(c => c.groupId === filterGroup.value);
  }

  return result;
});

const isIndeterminate = computed(() => {
  return selectedContacts.value.length > 0 &&
    selectedContacts.value.length < filteredContacts.value.length;
});

const handleClose = () => {
  emit('close');
};

const handleSelectAll = (e: any) => {
  if (e.target.checked) {
    selectedContacts.value = filteredContacts.value.map(c => c.id);
  } else {
    selectedContacts.value = [];
  }
};

const handleSelectContact = (contactId: string, checked: boolean) => {
  if (checked) {
    selectedContacts.value.push(contactId);
  } else {
    const index = selectedContacts.value.indexOf(contactId);
    if (index > -1) {
      selectedContacts.value.splice(index, 1);
    }
  }
};

const handleBatchDelete = () => {
  if (selectedContacts.value.length === 0) {
    message.warning('请先选择要删除的联系人');
    return;
  }
  message.info(`批量删除 ${selectedContacts.value.length} 位联系人`);
};

const handleBatchTag = () => {
  if (selectedContacts.value.length === 0) {
    message.warning('请先选择联系人');
    return;
  }
  batchTagVisible.value = true;
};

const handleBatchGroup = () => {
  if (selectedContacts.value.length === 0) {
    message.warning('请先选择联系人');
    return;
  }
  message.info('批量分组功能');
};

const handleExport = () => {
  message.success('通讯录导出成功');
};

const handleDeleteSelected = () => {
  contacts.value = contacts.value.filter(
    c => !selectedContacts.value.includes(c.id)
  );
  selectedContacts.value = [];
  message.success('删除成功');
};

const handleTagSelected = () => {
  batchTagVisible.value = true;
};

const handleEditContact = (contact: Contact) => {
  editingContact.value = contact;
  contactForm.value = {
    name: contact.name,
    groupId: contact.groupId,
    tagIds: contact.tags.map(t => t.id)
  };
  editContactVisible.value = true;
};

const handleDeleteContact = (contact: Contact) => {
  const index = contacts.value.findIndex(c => c.id === contact.id);
  if (index > -1) {
    contacts.value.splice(index, 1);
    message.success('删除成功');
  }
};

const saveContact = () => {
  if (!editingContact.value) return;

  const index = contacts.value.findIndex(c => c.id === editingContact.value!.id);
  if (index > -1) {
    const group = groups.value.find(g => g.id === contactForm.value.groupId);
    contacts.value[index] = {
      ...contacts.value[index],
      name: contactForm.value.name,
      groupId: contactForm.value.groupId,
      groupName: group?.name || '',
      tags: tags.value.filter(t => contactForm.value.tagIds.includes(t.id))
    };
    message.success('保存成功');
  }
  closeEditContact();
};

const closeEditContact = () => {
  editContactVisible.value = false;
  editingContact.value = null;
};

const handleCreateGroup = () => {
  editingGroup.value = null;
  groupForm.value = { name: '' };
  groupFormVisible.value = true;
};

const handleEditGroup = (group: Group) => {
  editingGroup.value = group;
  groupForm.value = { name: group.name };
  groupFormVisible.value = true;
};

const handleDeleteGroup = (group: Group) => {
  const index = groups.value.findIndex(g => g.id === group.id);
  if (index > -1) {
    groups.value.splice(index, 1);
    message.success('分组删除成功');
  }
};

const saveGroup = () => {
  if (!groupForm.value.name.trim()) {
    message.warning('请输入分组名称');
    return;
  }

  if (editingGroup.value) {
    const index = groups.value.findIndex(g => g.id === editingGroup.value!.id);
    if (index > -1) {
      groups.value[index].name = groupForm.value.name;
      message.success('分组修改成功');
    }
  } else {
    groups.value.push({
      id: 'g' + Date.now(),
      name: groupForm.value.name,
      contactCount: 0
    });
    message.success('分组创建成功');
  }
  closeGroupForm();
};

const closeGroupForm = () => {
  groupFormVisible.value = false;
  editingGroup.value = null;
};

const applyBatchTag = () => {
  if (batchTagIds.value.length === 0) {
    message.warning('请选择标签');
    return;
  }

  const selectedTags = tags.value.filter(t => batchTagIds.value.includes(t.id));

  contacts.value.forEach(contact => {
    if (selectedContacts.value.includes(contact.id)) {
      const existingTagIds = contact.tags.map(t => t.id);
      selectedTags.forEach(tag => {
        if (!existingTagIds.includes(tag.id)) {
          contact.tags.push(tag);
        }
      });
    }
  });

  message.success('标签添加成功');
  closeBatchTag();
};

const closeBatchTag = () => {
  batchTagVisible.value = false;
  batchTagIds.value = [];
};
</script>

<style scoped>
.contact-manage-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
}

.contact-manage-modal :deep(.ant-modal-body) {
  padding: 0;
}

.contact-manage-container {
  padding: 24px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.modal-subtitle {
  font-size: 14px;
  color: #999;
}

.quick-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 12px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.action-item:hover {
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  transition: all 0.3s ease;
}

.action-item:hover .action-icon {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-name {
  font-size: 13px;
  color: #666;
}

.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
}

.search-input :deep(.ant-input) {
  border-radius: 20px;
  background: #f5f5f5;
  border: none;
}

.filter-select {
  width: 140px;
}

.contacts-section {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.selected-count {
  font-size: 13px;
  color: #666;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.contacts-list {
  max-height: 300px;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.contact-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.contact-item.selected {
  background: #e6f7ed;
}

.contact-avatar {
  flex-shrink: 0;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.contact-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.contact-phone {
  color: #666;
}

.contact-group {
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 10px;
}

.contact-tags {
  display: flex;
  gap: 4px;
  align-items: center;
}

.more-tags {
  font-size: 12px;
  color: #999;
}

.contact-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.contact-item:hover .contact-actions {
  opacity: 1;
}

.empty-contacts {
  padding: 40px 0;
}

.groups-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.group-item:hover {
  background: #f0f0f0;
}

.group-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.group-count {
  font-size: 13px;
  color: #999;
}

.group-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.group-item:hover .group-actions {
  opacity: 1;
}

.tag-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.batch-tip {
  margin-bottom: 16px;
  color: #666;
}
</style>
