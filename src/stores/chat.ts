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
import type { Session, Message } from '@gitcoffee/im-ui';

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<Session[]>([]);
  const currentSessionId = ref<string>('');
  const messages = ref<Map<string, Message[]>>(new Map());
  const loading = ref(false);

  const currentSession = computed(() => {
    return sessions.value.find(s => s.id === currentSessionId.value);
  });

  const currentMessages = computed(() => {
    return messages.value.get(currentSessionId.value) || [];
  });

  const totalUnreadCount = computed(() => {
    return sessions.value.reduce((total, session) => total + (session.unreadCount || 0), 0);
  });

  const setSessions = (data: Session[]) => {
    sessions.value = data;
  };

  const addSession = (session: Session) => {
    const index = sessions.value.findIndex(s => s.id === session.id);
    if (index > -1) {
      sessions.value[index] = session;
    } else {
      sessions.value.unshift(session);
    }
  };

  const removeSession = (sessionId: string) => {
    sessions.value = sessions.value.filter(s => s.id !== sessionId);
    messages.value.delete(sessionId);
  };

  const setCurrentSession = (sessionId: string) => {
    currentSessionId.value = sessionId;
    const session = sessions.value.find(s => s.id === sessionId);
    if (session) {
      session.unreadCount = 0;
    }
  };

  const setMessages = (sessionId: string, data: Message[]) => {
    messages.value.set(sessionId, data);
  };

  const addMessage = (sessionId: string, message: Message) => {
    const list = messages.value.get(sessionId) || [];
    list.push(message);
    messages.value.set(sessionId, list);
  };

  const prependMessages = (sessionId: string, data: Message[]) => {
    const list = messages.value.get(sessionId) || [];
    messages.value.set(sessionId, [...data, ...list]);
  };

  const updateMessage = (sessionId: string, messageId: string, updates: Partial<Message>) => {
    const list = messages.value.get(sessionId) || [];
    const index = list.findIndex(m => m.id === messageId);
    if (index > -1) {
      list[index] = { ...list[index], ...updates };
      messages.value.set(sessionId, list);
    }
  };

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  return {
    sessions,
    currentSessionId,
    messages,
    loading,
    currentSession,
    currentMessages,
    totalUnreadCount,
    setSessions,
    addSession,
    removeSession,
    setCurrentSession,
    setMessages,
    addMessage,
    prependMessages,
    updateMessage,
    setLoading
  };
});
