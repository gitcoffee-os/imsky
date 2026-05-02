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
  <div class="app-container">
    <a-config-provider :locale="antdLocale" :theme="themeConfig">
      <router-view />
    </a-config-provider>
    <!-- 水印组件 -->
    <Watermark />
  </div>
</template>

<style>
@import '@gitcoffee/theme-ui/ai.css';
@import './styles/global.css';
</style>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSettingsStore } from './stores';
import { APP_SETTING } from './config/config';
import { 
  useTheme, 
  useAntdLocale, 
  useAppInitialization 
} from '@gitcoffee/app';
import Watermark from './components/Watermark.vue';

const settingsStore = useSettingsStore();

const { themeConfig, setTheme, setupThemeListener } = useTheme();

const { antdLocale } = useAntdLocale();

const { isInitialized } = useAppInitialization({
  smartSearchDefault: APP_SETTING.smartSearch,
  settingsStore,
  onInitialized: () => {
    setTheme();
  }
});

onMounted(() => {
  setTheme();
  setupThemeListener();
});
</script>
