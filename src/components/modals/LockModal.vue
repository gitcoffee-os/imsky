<template>
  <!-- 全屏锁定遮罩 -->
  <Transition name="lock-fade">
    <div v-if="visible" class="lock-screen-overlay">
      <div class="lock-content">
        <!-- 锁定状态 -->
        <template v-if="isLocked">
          <div class="lock-icon">
            <LockOutlined />
          </div>
          <h3 class="lock-title">应用已锁定</h3>
          <p class="lock-desc">请输入密码解锁，或在移动端应用中点击解锁</p>
          
          <!-- 密码输入 -->
          <div class="password-input-wrapper">
            <a-input-password
              v-model:value="password"
              placeholder="请输入解锁密码"
              size="large"
              class="password-input"
              @pressEnter="handleUnlock"
            />
          </div>
          
          <!-- 错误提示 -->
          <div v-if="errorMsg" class="error-msg">
            {{ errorMsg }}
          </div>
          
          <!-- 解锁按钮 -->
          <a-button
            type="primary"
            size="large"
            block
            class="unlock-btn"
            :loading="unlocking"
            @click="handleUnlock"
          >
            <UnlockOutlined />
            解锁
          </a-button>
          
          <!-- 移动端解锁提示 -->
          <div class="mobile-unlock-tip">
            <MobileOutlined />
            <span>也可在移动端应用中点击解锁</span>
          </div>
        </template>
        
        <!-- 设置密码状态 -->
        <template v-else>
          <div class="lock-icon">
            <SafetyOutlined />
          </div>
          <h3 class="lock-title">设置锁定密码</h3>
          <p class="lock-desc">请设置一个密码用于锁定应用</p>
          
          <div class="password-form">
            <a-input-password
              v-model:value="newPassword"
              placeholder="请输入密码"
              size="large"
              class="password-input"
            />
            <a-input-password
              v-model:value="confirmPassword"
              placeholder="请确认密码"
              size="large"
              class="password-input"
              @pressEnter="handleSetPassword"
            />
          </div>
          
          <div v-if="errorMsg" class="error-msg">
            {{ errorMsg }}
          </div>
          
          <a-button
            type="primary"
            size="large"
            block
            class="unlock-btn"
            @click="handleSetPassword"
          >
            设置密码并锁定
          </a-button>
          
          <a-button
            type="text"
            block
            class="cancel-btn"
            @click="handleCancel"
          >
            取消
          </a-button>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { LockOutlined, UnlockOutlined, MobileOutlined, SafetyOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'lock'): void;
  (e: 'unlock'): void;
}>();

// 锁定状态
const isLocked = ref(false);
const password = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMsg = ref('');
const unlocking = ref(false);

const STORAGE_KEY = 'app_lock_password_hash';

const hashPassword = async (pwd: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pwd + 'imsky-lock-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const storedPasswordHash = ref(localStorage.getItem(STORAGE_KEY) || '');

// 监听弹窗显示
watch(() => props.visible, (val) => {
  if (val) {
    isLocked.value = !!storedPasswordHash.value;
    password.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    errorMsg.value = '';
  }
});

// 设置密码并锁定
const handleSetPassword = async () => {
  errorMsg.value = '';
  
  if (!newPassword.value) {
    errorMsg.value = '请输入密码';
    return;
  }
  
  if (newPassword.value.length < 4) {
    errorMsg.value = '密码长度至少4位';
    return;
  }
  
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = '两次输入的密码不一致';
    return;
  }
  
  const hash = await hashPassword(newPassword.value);
  storedPasswordHash.value = hash;
  localStorage.setItem(STORAGE_KEY, hash);
  
  isLocked.value = true;
  message.success('密码设置成功，应用已锁定');
  emit('lock');
};

// 解锁
const handleUnlock = async () => {
  errorMsg.value = '';
  
  if (!password.value) {
    errorMsg.value = '请输入密码';
    return;
  }
  
  unlocking.value = true;
  
  try {
    const hash = await hashPassword(password.value);
    if (hash === storedPasswordHash.value) {
      message.success('解锁成功');
      password.value = '';
      unlocking.value = false;
      emit('unlock');
      emit('close');
    } else {
      errorMsg.value = '密码错误，请重试';
      unlocking.value = false;
    }
  } catch {
    errorMsg.value = '解锁失败，请重试';
    unlocking.value = false;
  }
};

// 取消/关闭
const handleCancel = () => {
  // 如果已经锁定，不能关闭弹窗
  if (isLocked.value) {
    return;
  }
  emit('close');
};
</script>

<style scoped>
/* 全屏锁定遮罩 */
.lock-screen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 过渡动画 */
.lock-fade-enter-active,
.lock-fade-leave-active {
  transition: opacity 0.3s ease;
}

.lock-fade-enter-from,
.lock-fade-leave-to {
  opacity: 0;
}

.lock-content {
  width: 100%;
  max-width: 420px;
  padding: 40px 32px;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.lock-icon {
  font-size: 64px;
  color: #07c160;
  margin-bottom: 20px;
}

.lock-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.lock-desc {
  font-size: 14px;
  color: #999;
  margin: 0 0 28px;
}

.password-input-wrapper {
  margin-bottom: 16px;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.password-input {
  border-radius: 8px;
}

.password-input :deep(.ant-input) {
  border-radius: 8px;
}

.error-msg {
  color: #ff4d4f;
  font-size: 13px;
  margin-bottom: 16px;
}

.unlock-btn {
  border-radius: 8px;
  height: 44px;
  font-size: 15px;
  background: linear-gradient(135deg, #07c160 0%, #00b45a 100%);
  border: none;
}

.unlock-btn:hover {
  background: linear-gradient(135deg, #06ad56 0%, #00a050 100%);
}

.cancel-btn {
  margin-top: 12px;
  color: #999;
}

.mobile-unlock-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #e8e8e8;
  color: #999;
  font-size: 13px;
}

.mobile-unlock-tip :deep(.anticon) {
  font-size: 16px;
}
</style>
