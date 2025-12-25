<script setup>
import Sidebar from './components/shared/sideBar.vue'
import Toolbar from './components/shared/toolBar.vue'
import axios from "axios";
import { getCookie } from "./tools/methods.js";
import { useAdmin } from '@/stores/modules/admin';

import { useRouter, useRoute } from "vue-router"
import { computed } from 'vue';
const router = useRouter();
const route = useRoute();
const store = useAdmin();
let loader = computed(() => {
  return store.getLoader;
})
if (getCookie('token')) {
  axios.defaults.headers.common.Authorization = `Bearer ${getCookie('token')}`
  getBaseInfo();
} else {
  router.push("/login")
}
function getBaseInfo() {
  store.getAdminDetail();
  store.getNotifications();
}
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      router.push({ name: "login" }); // برو به صفحه لاگین
    }
    return Promise.reject(error);
  }
);
</script>
<template>
  <div class="d-flex w-100">
    <Sidebar v-if="route.path != '/login' && route.name != 'contract-print' && route.name != 'users-print-card'" />
    <div class="flex-grow-1" id="mainContent">
      <Toolbar v-if="route.path != '/login' && route.name != 'contract-print' && route.name != 'users-print-card'" />
      <div class="pageContainer">
        <!--  -->
        <div v-if="loader && route.path != '/login'" class="loaderContainer mt-4">
          <span class="loader"></span>
        </div>
        <router-view v-else></router-view>

      </div>
    </div>
  </div>
</template>

<style>
.loader {
  width: 48px;
  height: 48px;
  border: 3px solid #FFF;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

.loader::after {
  content: '';
  box-sizing: border-box;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid;
  border-color: #FF3D00 transparent;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

div#mainContent {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-right: 250px;
}

@media (max-width:991px) {
  div#mainContent {
    margin-right: 0px;
    max-width: 100%;
  }

  nav#mainNavbar {
    padding-right: 48px !important;
    position: fixed;
    width: 100%;
    z-index: 999;
  }

  .pageContainer {
    padding-top: 64px;
  }
}

.loaderContainer.mt-4 {
  position: fixed;
  top: 50%;
  right: 50%;
  transform: scale(2.5);
}
</style>