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
import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import Chat from '../views/chat/Chat.vue';
import Contact from '../views/contact/Contact.vue';
import Settings from '../views/settings/Settings.vue';
import Favorite from '../views/favorite/Favorite.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        redirect: '/chat'
      },
      {
        path: 'chat',
        name: 'Chat',
        component: Chat
      },
      {
        path: 'chat/:sessionId',
        name: 'ChatSession',
        component: Chat
      },
      {
        path: 'contact',
        name: 'Contact',
        component: Contact
      },
      {
        path: 'favorite',
        name: 'Favorite',
        component: Favorite
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory('/im/'),
  routes
});

export default router;
