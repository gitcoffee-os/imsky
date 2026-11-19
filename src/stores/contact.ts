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
import type { User, ContactGroup } from '@gitcoffee-os/im-ui';

export const useContactStore = defineStore('contact', () => {
  const contacts = ref<User[]>([]);
  const contactGroups = ref<ContactGroup[]>([]);
  const friendRequests = ref<any[]>([]);
  const loading = ref(false);

  const contactCount = computed(() => contacts.value.length);

  const newFriendRequestCount = computed(() => {
    return friendRequests.value.filter(r => r.status === 'pending').length;
  });

  const setContacts = (data: User[]) => {
    contacts.value = data;
  };

  const addContact = (contact: User) => {
    if (!contacts.value.find(c => c.id === contact.id)) {
      contacts.value.push(contact);
    }
  };

  const removeContact = (contactId: string) => {
    contacts.value = contacts.value.filter(c => c.id !== contactId);
  };

  const setContactGroups = (data: ContactGroup[]) => {
    contactGroups.value = data;
  };

  const setFriendRequests = (data: any[]) => {
    friendRequests.value = data;
  };

  const addFriendRequest = (request: any) => {
    friendRequests.value.unshift(request);
  };

  const updateFriendRequest = (requestId: string, updates: any) => {
    const index = friendRequests.value.findIndex(r => r.id === requestId);
    if (index > -1) {
      friendRequests.value[index] = { ...friendRequests.value[index], ...updates };
    }
  };

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  return {
    contacts,
    contactGroups,
    friendRequests,
    loading,
    contactCount,
    newFriendRequestCount,
    setContacts,
    addContact,
    removeContact,
    setContactGroups,
    setFriendRequests,
    addFriendRequest,
    updateFriendRequest,
    setLoading
  };
});
