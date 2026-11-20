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
import {
  ImSkyMainLayout,
  ImskyChat,
  ImskyContact,
  ImskyFavorite,
  ImskySettings,
  ImskyLogin,
  ImskyRegister,
  ImskyForgotPassword
} from '@gitcoffee-os/imsky-ui';

const routes = [
  {
    path: '/',
    component: ImSkyMainLayout,
    children: [
      {
        path: '',
        redirect: '/chat'
      },
      {
        path: 'chat',
        name: 'Chat',
        component: ImskyChat
      },
      {
        path: 'chat/:sessionId',
        name: 'ChatSession',
        component: ImskyChat
      },
      {
        path: 'contact',
        name: 'Contact',
        component: ImskyContact
      },
      {
        path: 'favorite',
        name: 'Favorite',
        component: ImskyFavorite
      },
      {
        path: 'settings',
        name: 'Settings',
        component: ImskySettings
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: ImskyLogin
  },
  {
    path: '/register',
    name: 'Register',
    component: ImskyRegister
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ImskyForgotPassword
  }
];

const router = createRouter({
  history: createWebHistory('/im/'),
  routes
});

export default router;
