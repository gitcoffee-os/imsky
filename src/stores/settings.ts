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
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const STORAGE_KEY = 'imsky-settings';

export interface ModuleVisibility {
  favorite: boolean;
  moments: boolean;
  discover: boolean;
  search: boolean;
  miniapp: boolean;
  ai: boolean;
  claw: boolean;
}

export interface SettingsState {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notificationEnabled: boolean;
  soundEnabled: boolean;
  fontSize: number;
  desktopNotification: boolean;
  showOnlineStatus: boolean;
  readReceipt: boolean;
  searchByPhone: boolean;
  moduleOpenMode: 'page' | 'modal';
  watermarkEnabled: boolean;
  watermarkText: string;
  showModules: ModuleVisibility;
}

export const useSettingsStore = defineStore('settings', () => {
  // 通用设置
  const theme = ref<SettingsState['theme']>('light');
  const language = ref<SettingsState['language']>('zh');
  const fontSize = ref<SettingsState['fontSize']>(14);

  // 通知设置
  const notificationEnabled = ref<SettingsState['notificationEnabled']>(true);
  const soundEnabled = ref<SettingsState['soundEnabled']>(true);
  const desktopNotification = ref<SettingsState['desktopNotification']>(true);

  // 隐私设置
  const showOnlineStatus = ref<SettingsState['showOnlineStatus']>(true);
  const readReceipt = ref<SettingsState['readReceipt']>(true);
  const searchByPhone = ref<SettingsState['searchByPhone']>(true);

  // 界面设置
  const moduleOpenMode = ref<SettingsState['moduleOpenMode']>('page');

  // 水印设置
  const watermarkEnabled = ref<SettingsState['watermarkEnabled']>(true);
  const watermarkText = ref<SettingsState['watermarkText']>('');

  // 模块显示设置
  const showModules = ref<ModuleVisibility>({
    favorite: true,
    moments: true,
    discover: true,
    search: true,
    miniapp: true,
    ai: true,
    claw: true
  });

  // 计算属性
  const isDark = computed(() => {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme.value === 'dark';
  });

  // 保存设置到本地存储
  const saveSettings = () => {
    const settings: SettingsState = {
      theme: theme.value,
      language: language.value,
      notificationEnabled: notificationEnabled.value,
      soundEnabled: soundEnabled.value,
      fontSize: fontSize.value,
      desktopNotification: desktopNotification.value,
      showOnlineStatus: showOnlineStatus.value,
      readReceipt: readReceipt.value,
      searchByPhone: searchByPhone.value,
      moduleOpenMode: moduleOpenMode.value,
      watermarkEnabled: watermarkEnabled.value,
      watermarkText: watermarkText.value,
      showModules: showModules.value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  };

  // 从本地存储加载设置
  const loadSettings = (): SettingsState | null => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  };

  // 设置主题
  const setTheme = (value: SettingsState['theme']) => {
    theme.value = value;
    saveSettings();
  };

  // 设置语言
  const setLanguage = (value: string) => {
    language.value = value;
    saveSettings();
  };

  // 切换消息通知
  const toggleNotification = () => {
    notificationEnabled.value = !notificationEnabled.value;
    saveSettings();
  };

  // 设置消息通知
  const setNotification = (value: boolean) => {
    notificationEnabled.value = value;
    saveSettings();
  };

  // 切换声音提醒
  const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value;
    saveSettings();
  };

  // 设置声音提醒
  const setSound = (value: boolean) => {
    soundEnabled.value = value;
    saveSettings();
  };

  // 设置字体大小
  const setFontSize = (value: number) => {
    fontSize.value = value;
    saveSettings();
  };

  // 设置桌面通知
  const setDesktopNotification = (value: boolean) => {
    desktopNotification.value = value;
    saveSettings();
  };

  // 设置在线状态显示
  const setShowOnlineStatus = (value: boolean) => {
    showOnlineStatus.value = value;
    saveSettings();
  };

  // 设置已读回执
  const setReadReceipt = (value: boolean) => {
    readReceipt.value = value;
    saveSettings();
  };

  // 设置手机号搜索
  const setSearchByPhone = (value: boolean) => {
    searchByPhone.value = value;
    saveSettings();
  };

  // 设置模块打开方式
  const setModuleOpenMode = (value: SettingsState['moduleOpenMode']) => {
    moduleOpenMode.value = value;
    saveSettings();
  };

  // 设置水印开关
  const setWatermarkEnabled = (value: boolean) => {
    watermarkEnabled.value = value;
    saveSettings();
  };

  // 设置水印文字
  const setWatermarkText = (value: string) => {
    watermarkText.value = value;
    saveSettings();
  };

  // 初始化设置
  const initialize = async () => {
    const saved = loadSettings();
    if (saved) {
      theme.value = saved.theme;
      language.value = saved.language;
      notificationEnabled.value = saved.notificationEnabled;
      soundEnabled.value = saved.soundEnabled;
      fontSize.value = saved.fontSize;
      desktopNotification.value = saved.desktopNotification;
      showOnlineStatus.value = saved.showOnlineStatus;
      readReceipt.value = saved.readReceipt;
      searchByPhone.value = saved.searchByPhone;
      moduleOpenMode.value = saved.moduleOpenMode || 'page';
      watermarkEnabled.value = saved.watermarkEnabled !== false;
      watermarkText.value = saved.watermarkText || '';
      if (saved.showModules) {
        showModules.value = saved.showModules;
      }
    }
  };

  // 重置所有设置
  const resetSettings = () => {
    theme.value = 'light';
    language.value = 'zh';
    notificationEnabled.value = true;
    soundEnabled.value = true;
    fontSize.value = 14;
    desktopNotification.value = true;
    showOnlineStatus.value = true;
    readReceipt.value = true;
    searchByPhone.value = true;
    moduleOpenMode.value = 'page';
    watermarkEnabled.value = true;
    watermarkText.value = '';
    showModules.value = {
      favorite: true,
      moments: true,
      discover: true,
      search: true,
      miniapp: true,
      ai: true,
      claw: true
    };
    saveSettings();
  };

  // 设置模块显示
  const setModuleVisibility = (module: keyof ModuleVisibility, visible: boolean) => {
    showModules.value[module] = visible;
    saveSettings();
  };

  return {
    // state
    theme,
    language,
    notificationEnabled,
    soundEnabled,
    fontSize,
    desktopNotification,
    showOnlineStatus,
    readReceipt,
    searchByPhone,
    moduleOpenMode,
    watermarkEnabled,
    watermarkText,
    showModules,
    // getters
    isDark,
    // actions
    setTheme,
    setLanguage,
    toggleNotification,
    setNotification,
    toggleSound,
    setSound,
    setFontSize,
    setDesktopNotification,
    setShowOnlineStatus,
    setReadReceipt,
    setSearchByPhone,
    setModuleOpenMode,
    setWatermarkEnabled,
    setWatermarkText,
    setModuleVisibility,
    initialize,
    resetSettings,
    saveSettings,
    loadSettings
  };
});
