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
import type { CallSession, CallType, CallStatus, User } from '@gitcoffee/im-ui';

export const useCallStore = defineStore('call', () => {
  const currentCall = ref<CallSession | null>(null);
  const callHistory = ref<CallSession[]>([]);
  const isInCall = ref(false);
  const callDuration = ref(0);
  const remoteUser = ref<User | null>(null);

  const callStatus = computed(() => currentCall.value?.status || 'idle');
  const callType = computed(() => currentCall.value?.type || 'audio');

  const setCurrentCall = (call: CallSession | null) => {
    currentCall.value = call;
    isInCall.value = call !== null;
    if (call) {
      callDuration.value = 0;
    }
  };

  const setCallStatus = (status: CallStatus) => {
    if (currentCall.value) {
      currentCall.value.status = status;
    }
  };

  const setRemoteUser = (user: User | null) => {
    remoteUser.value = user;
  };

  const incrementDuration = () => {
    callDuration.value++;
  };

  const setCallHistory = (history: CallSession[]) => {
    callHistory.value = history;
  };

  const addCallRecord = (record: CallSession) => {
    callHistory.value.unshift(record);
  };

  const endCall = () => {
    if (currentCall.value) {
      currentCall.value.endTime = Date.now();
      addCallRecord(currentCall.value);
    }
    currentCall.value = null;
    isInCall.value = false;
    callDuration.value = 0;
    remoteUser.value = null;
  };

  return {
    currentCall,
    callHistory,
    isInCall,
    callDuration,
    remoteUser,
    callStatus,
    callType,
    setCurrentCall,
    setCallStatus,
    setRemoteUser,
    incrementDuration,
    setCallHistory,
    addCallRecord,
    endCall
  };
});
