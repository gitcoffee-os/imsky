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
    :width="600"
    :closable="true"
    @cancel="handleClose"
    class="tags-modal"
  >
    <div class="tags-container">
      <!-- 头部 -->
      <div class="modal-header">
        <h3 class="modal-title">标签</h3>
        <a-button type="primary" @click="handleCreateTag">
          <PlusOutlined />
          新建标签
        </a-button>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <a-input
          v-model:value="searchKeyword"
          placeholder="搜索标签"
          allow-clear
          class="search-input"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>

      <!-- 标签列表 -->
      <div class="tags-list">
        <div
          v-for="tag in filteredTags"
          :key="tag.id"
          class="tag-item"
          @click="handleTagClick(tag)"
        >
          <div class="tag-icon" :style="{ backgroundColor: tag.color }">
            <TagOutlined />
          </div>
          <div class="tag-info">
            <div class="tag-name">{{ tag.name }}</div>
            <div class="tag-count">{{ tag.contactCount }} 位联系人</div>
          </div>
          <div class="tag-actions">
            <a-dropdown>
              <a-button type="text" size="small" @click.stop>
                <MoreOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="handleEditTag(tag)">
                    <EditOutlined />
                    编辑标签
                  </a-menu-item>
                  <a-menu-item @click="handleManageContacts(tag)">
                    <TeamOutlined />
                    管理联系人
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item danger @click="handleDeleteTag(tag)">
                    <DeleteOutlined />
                    删除标签
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>

        <EmptyState
          v-if="filteredTags.length === 0"
          description="暂无标签"
          class="empty-tags"
        />
      </div>

      <!-- 标签统计 -->
      <div class="tags-stats">
        <div class="stat-item">
          <div class="stat-value">{{ tags.length }}</div>
          <div class="stat-label">标签总数</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ totalTaggedContacts }}</div>
          <div class="stat-label">已标记联系人</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ untaggedContacts }}</div>
          <div class="stat-label">未标记联系人</div>
        </div>
      </div>

      <!-- 未标记联系人 -->
      <div class="untagged-section">
        <div class="section-header">
          <span class="section-title">未标记的联系人</span>
          <a-button type="link" size="small" @click="handleBatchTag">
            批量标记
          </a-button>
        </div>
        <div class="untagged-list">
          <div
            v-for="contact in untaggedList.slice(0, 5)"
            :key="contact.id"
            class="untagged-item"
          >
            <a-avatar :size="36" :src="contact.avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <span class="contact-name">{{ contact.name }}</span>
            <a-button type="link" size="small" @click="handleTagContact(contact)">
              添加标签
            </a-button>
          </div>
          <div v-if="untaggedList.length > 5" class="more-unttaged">
            还有 {{ untaggedList.length - 5 }} 位联系人...
          </div>
        </div>
      </div>
    </div>
  </a-modal>

  <!-- 创建/编辑标签弹窗 -->
  <a-modal
    v-model:open="tagFormVisible"
    :title="editingTag ? '编辑标签' : '新建标签'"
    :width="400"
    @ok="handleSaveTag"
    @cancel="closeTagForm"
  >
    <a-form :model="tagForm" layout="vertical">
      <a-form-item label="标签名称" required>
        <a-input
          v-model:value="tagForm.name"
          placeholder="请输入标签名称"
          maxlength="20"
          show-count
        />
      </a-form-item>
      <a-form-item label="标签颜色">
        <div class="color-picker">
          <div
            v-for="color in tagColors"
            :key="color"
            class="color-option"
            :class="{ active: tagForm.color === color }"
            :style="{ backgroundColor: color }"
            @click="tagForm.color = color"
          ></div>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  SearchOutlined,
  PlusOutlined,
  TagOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons-vue';
import { EmptyState } from '@gitcoffee-os/im-ui';

interface Tag {
  id: string;
  name: string;
  color: string;
  contactCount: number;
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
}

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'tagClick', tag: Tag): void;
  (e: 'createTag', tag: { name: string; color: string }): void;
  (e: 'editTag', tag: Tag): void;
  (e: 'deleteTag', tag: Tag): void;
}>();

const searchKeyword = ref('');
const tagFormVisible = ref(false);
const editingTag = ref<Tag | null>(null);

const tagForm = ref({
  name: '',
  color: '#07c160'
});

const tagColors = [
  '#07c160',
  '#1890ff',
  '#722ed1',
  '#eb2f96',
  '#fa541c',
  '#faad14',
  '#52c41a',
  '#13c2c2',
  '#2f4554',
  '#f5222d'
];

// 模拟标签数据
const tags = ref<Tag[]>([
  {
    id: 't1',
    name: '同事',
    color: '#07c160',
    contactCount: 25
  },
  {
    id: 't2',
    name: '家人',
    color: '#fa541c',
    contactCount: 8
  },
  {
    id: 't3',
    name: '朋友',
    color: '#1890ff',
    contactCount: 32
  },
  {
    id: 't4',
    name: '客户',
    color: '#722ed1',
    contactCount: 15
  },
  {
    id: 't5',
    name: '同学',
    color: '#faad14',
    contactCount: 20
  },
  {
    id: 't6',
    name: '重要',
    color: '#f5222d',
    contactCount: 10
  }
]);

// 未标记联系人
const untaggedList = ref<Contact[]>([
  { id: 'u1', name: '张三', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
  { id: 'u2', name: '李四', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
  { id: 'u3', name: '王五', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
  { id: 'u4', name: '赵六', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
  { id: 'u5', name: '钱七', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' },
  { id: 'u6', name: '孙八', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' },
  { id: 'u7', name: '周九', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7' }
]);

const filteredTags = computed(() => {
  if (!searchKeyword.value) return tags.value;
  const keyword = searchKeyword.value.toLowerCase();
  return tags.value.filter(t =>
    t.name.toLowerCase().includes(keyword)
  );
});

const totalTaggedContacts = computed(() => {
  return tags.value.reduce((sum, tag) => sum + tag.contactCount, 0);
});

const untaggedContacts = computed(() => {
  return untaggedList.value.length;
});

const handleClose = () => {
  emit('close');
};

const handleTagClick = (tag: Tag) => {
  emit('tagClick', tag);
};

const handleCreateTag = () => {
  editingTag.value = null;
  tagForm.value = { name: '', color: '#07c160' };
  tagFormVisible.value = true;
};

const handleEditTag = (tag: Tag) => {
  editingTag.value = tag;
  tagForm.value = { name: tag.name, color: tag.color };
  tagFormVisible.value = true;
};

const closeTagForm = () => {
  tagFormVisible.value = false;
  editingTag.value = null;
};

const handleSaveTag = () => {
  if (!tagForm.value.name.trim()) return;

  if (editingTag.value) {
    const index = tags.value.findIndex(t => t.id === editingTag.value!.id);
    if (index !== -1) {
      tags.value[index] = {
        ...tags.value[index],
        name: tagForm.value.name,
        color: tagForm.value.color
      };
      emit('editTag', tags.value[index]);
    }
  } else {
    const newTag: Tag = {
      id: 't' + Date.now(),
      name: tagForm.value.name,
      color: tagForm.value.color,
      contactCount: 0
    };
    tags.value.push(newTag);
    emit('createTag', { name: newTag.name, color: newTag.color });
  }

  closeTagForm();
};

const handleDeleteTag = (tag: Tag) => {
  const index = tags.value.findIndex(t => t.id === tag.id);
  if (index !== -1) {
    tags.value.splice(index, 1);
    emit('deleteTag', tag);
  }
};

const handleManageContacts = (tag: Tag) => {
  console.log('管理标签联系人:', tag);
};

const handleBatchTag = () => {
  console.log('批量标记联系人');
};

const handleTagContact = (contact: Contact) => {
  console.log('给联系人添加标签:', contact);
};
</script>

<style scoped>
.tags-modal :deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
}

.tags-modal :deep(.ant-modal-body) {
  padding: 0;
}

.tags-container {
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

.search-section {
  margin-bottom: 20px;
}

.search-input :deep(.ant-input) {
  border-radius: 20px;
  background: #f5f5f5;
  border: none;
}

.tags-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  background: #f5f5f5;
}

.tag-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
}

.tag-info {
  flex: 1;
  min-width: 0;
}

.tag-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.tag-count {
  font-size: 13px;
  color: #999;
}

.tag-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tag-item:hover .tag-actions {
  opacity: 1;
}

.empty-tags {
  padding: 40px 0;
}

.tags-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 12px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e0e0e0;
}

.untagged-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.untagged-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.untagged-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8f8f8;
  border-radius: 8px;
}

.contact-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.more-unttaged {
  text-align: center;
  padding: 8px;
  color: #999;
  font-size: 13px;
}

/* 颜色选择器 */
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #1a1a1a;
  transform: scale(1.15);
}
</style>
