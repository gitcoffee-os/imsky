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
  <div v-if="settingsStore.watermarkEnabled" ref="watermarkRef" class="watermark-container" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useSettingsStore } from '../stores';
import LogoSvg from '/logo.svg?url';

const settingsStore = useSettingsStore();
const watermarkRef = ref<HTMLElement>();
let observer: MutationObserver | null = null;
let watermarkId = '';

// 生成水印图片
const generateWatermarkImage = async (): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(generateTextWatermark());
        return;
      }

      // 设置画布大小
      canvas.width = 200;
      canvas.height = 160;

      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 保存上下文状态
      ctx.save();

      // 移动到画布中心并旋转 -20度
      ctx.translate(100, 80);
      ctx.rotate((-20 * Math.PI) / 180);

      // 计算 Logo 大小（保持比例）
      const logoWidth = 48;
      const logoHeight = (img.height / img.width) * logoWidth;

      // 设置透明度 - Logo更淡
      ctx.globalAlpha = 0.12;

      // 绘制 Logo
      ctx.drawImage(img, -logoWidth / 2, -logoHeight / 2 - 10, logoWidth, logoHeight);

      // 绘制文字 - ImSky - 文字加深
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ImSky', 0, logoHeight / 2 + 1);

      // 绘制文字 - 天信IM - 文字加深
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.fillText('天信IM', 0, logoHeight / 2 + 14);

      // 恢复上下文状态
      ctx.restore();

      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      // 如果 Logo 加载失败，使用文字水印
      resolve(generateTextWatermark());
    };
    
    img.src = LogoSvg;
  });
};

// 生成文字水印（备用）
const generateTextWatermark = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  canvas.width = 200;
  canvas.height = 160;

  ctx.save();
  ctx.translate(100, 80);
  ctx.rotate((-20 * Math.PI) / 180);

  // 绘制圆形背景作为Logo占位
  ctx.beginPath();
  ctx.arc(0, -10, 26, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fill();

  // 在圆内绘制"IM"文字作为Logo
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('IM', 0, -10);

  // 绘制文字 - ImSky
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillText('ImSky', 0, 12);

  // 绘制文字 - 天信IM
  ctx.font = '12px Arial, sans-serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  ctx.fillText('天信IM', 0, 25);

  ctx.restore();

  return canvas.toDataURL('image/png');
};

// 创建水印
const createWatermark = async () => {
  if (!settingsStore.watermarkEnabled) {
    removeWatermark();
    return;
  }

  const imageUrl = await generateWatermarkImage();

  if (!watermarkRef.value) return;

  // 设置背景图片
  watermarkRef.value.style.backgroundImage = `url(${imageUrl})`;

  // 生成唯一ID用于防删除检测
  watermarkId = `watermark-${Date.now()}-${Math.random()}`;
  watermarkRef.value.setAttribute('data-watermark-id', watermarkId);
};

// 移除水印
const removeWatermark = () => {
  if (watermarkRef.value) {
    watermarkRef.value.style.backgroundImage = '';
  }
};

// 防删除检测
const setupAntiDelete = () => {
  if (!watermarkRef.value) return;

  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // 检测水印元素是否被删除或修改
      if (mutation.type === 'childList') {
        const removedNodes = Array.from(mutation.removedNodes);
        const isWatermarkRemoved = removedNodes.some((node) => {
          if (node instanceof HTMLElement) {
            return node.getAttribute('data-watermark-id') === watermarkId;
          }
          return false;
        });

        if (isWatermarkRemoved) {
          // 水印被删除，重新创建
          setTimeout(() => {
            createWatermark();
          }, 100);
        }
      }

      // 检测样式是否被修改
      if (mutation.type === 'attributes' && mutation.target === watermarkRef.value) {
        const target = mutation.target as HTMLElement;
        if (target.style.display === 'none' || target.style.visibility === 'hidden') {
          // 样式被修改，恢复
          setTimeout(() => {
            createWatermark();
          }, 100);
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
};

// 监听设置变化
watch(() => settingsStore.watermarkEnabled, (enabled) => {
  if (enabled) {
    createWatermark();
    setupAntiDelete();
  } else {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }
});

onMounted(() => {
  if (settingsStore.watermarkEnabled) {
    createWatermark();
    setupAntiDelete();
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<style scoped>
.watermark-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
  background-repeat: repeat;
  background-size: 200px 160px;
  user-select: none;
  -webkit-user-select: none;
}
</style>
