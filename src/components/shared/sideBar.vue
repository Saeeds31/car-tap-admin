<template>
  <div id="sidebar">
    <!-- Overlay موبایل -->
    <b-collapse v-model="mobileOpen" class="d-lg-none">
      <div class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style="z-index: 1000;"
        @click="mobileOpen = false"></div>
    </b-collapse>
    <!-- Sidebar -->
    <div class="sidebar d-flex flex-column bg-light" :class="{ 'sidebar-open': mobileOpen }">
      <!-- Logo -->
      <router-link to="#" class="p-3 d-flex justify-content-center border-bottom">
        <img src="../../assets/images/logo.png" alt="Logo" class="img-fluid" />
      </router-link>

      <!-- Menu Items -->
      <b-nav vertical class="flex-column mt-2">
        <div v-for="item in menuItems" :key="item.name" class="w-100">
          <!-- آیتم اصلی -->
          <b-nav-item v-if="!item.children && checkPermission(item.permissions)" :to="item.link"
            class="d-flex align-items-center">
            <i :class="item.icon + ' me-2'"></i>
            <span v-if="mobileOpen || windowWidth < 992">{{ item.name }}</span>
          </b-nav-item>

          <!-- آیتم با زیرمنو -->
          <div v-else-if="checkPermission(item.permissions, 'or')">
            <button class=" navItem btn w-100 text-start d-flex align-items-center" @click="toggleSubmenu(item)">
              <i :class="item.icon + ' me-2'"></i>
              <span v-if="mobileOpen || windowWidth < 992">{{ item.name }}</span>
              <i class="mr-auto bi" :class="openSubmenu === item.name ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </button>
            <b-collapse v-model="openSubmenuStates[item.name]" class="ps-4">
              <b-nav vertical>
                <template v-for="child in item.children" :key="child.name">
                  <b-nav-item v-if="checkPermission(child.permissions)" :to="child.link"
                    class="d-flex align-items-center">
                    <i :class="child.icon + ' me-2'"></i>
                    <span v-if="mobileOpen || windowWidth < 992">{{ child.name }}</span>
                  </b-nav-item>
                </template>
              </b-nav>
            </b-collapse>
          </div>
        </div>
      </b-nav>
    </div>
    <!-- Toggle Button موبایل -->
    <b-button variant="primary" id="toggleMenuButton" class="d-lg-none position-fixed top-3 start-3"
      @click="mobileOpen = !mobileOpen">
      <i class="bi-list"></i>
    </b-button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { BNav, BNavItem, BButton, BCollapse } from "bootstrap-vue-3";
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
const mobileOpen = ref(true);
const windowWidth = ref(window.innerWidth);
// ذخیره وضعیت باز/بسته بودن زیرمنوها
const openSubmenuStates = ref({});
const openSubmenu = ref(null);
const toggleSubmenu = (item) => {
  openSubmenuStates.value[item.name] = !openSubmenuStates.value[item.name];
  openSubmenu.value = openSubmenuStates.value[item.name] ? item.name : null;
};
// منوها

const menuItems = [
  { name: "داشبورد", link: "/", icon: "bi-speedometer", permissions: ['dashboard_view'] },

  {
    permissions: ['user_view', 'role_view', 'manage_view'],
    name: "کاربران",
    icon: "bi-people",
    children: [
      { name: "لیست کاربران", link: "/users", permissions: ['user_view'], icon: "bi-list-ul" },
      { name: "نقش ها", link: "/users/roles", permissions: ['role_view'], icon: "bi-person-badge" },
      { name: "مدیران", link: "/users/managers", permissions: ['manager_view'], icon: "bi-shield-check" },
      { name: "کارفرمایان", link: "/users/employers", permissions: ['employers_view'], icon: "bi-person" },
      { name: "دسترسی شهری", link: "/users/city-permission", permissions: ['citypermission_view'], icon: "bi-building" },
    ],
  },



  {
    name: "محتوا",
    permissions: ['menu_view', 'slider_view', 'banner_view'],
    icon: "bi-folder2",
    children: [
      { name: "منو", link: "/content/menus", permissions: ['menu_view'], icon: "bi-menu-button" },
      { name: "اسلایدر", link: "/content/sliders", permissions: ['slider_view'], icon: "bi-images" },
      { name: "بنر", link: "/content/banners", permissions: ['banner_view'], icon: "bi-layout-sidebar" },
    ],
  },

  {
    name: "مشخصات",
    permissions: ['specification_view', 'specification_group_view'],
    icon: "bi-folder2",
    children: [
      { name: "گروه", link: "/specification/group/list", permissions: ['brand_view'], icon: "bi-view-list" },
      { name: "مشخصات", link: "/specification/list", permissions: ['specification_view'], icon: "bi-list-check" },
    ],
  },
  {
    name: "خودرو",
    permissions: ['category_view', 'car_view', 'brand_view'],
    icon: "bi-car-front",
    children: [
      { name: "دسته بندی", link: "/cars/categories/list", permissions: ['category_view'], icon: "bi-bookmark" },
      { name: "برند", link: "/cars/brands/list", permissions: ['brand_view'], icon: "bi-bing" },
      { name: "خودرو", link: "/cars/list", permissions: ['car_view'], icon: "bi-list" },
    ],
  },
  {
    name: "طرح فروش",
    permissions: ['salesplan_view'],
    icon: "bi-bag-fill",
    children: [
      { name: "لیست", link: "/sales-plan/list", permissions: ['salesplan_view'], icon: "bi-list" },
    ],
  },
  {
    name: "گزارشات",
    permissions: ['report_users'],
    icon: "bi-graph-up",
    children: [
    ],
  },
  {
    name: "مکان‌ها",
    permissions: ['city_view', 'province_view'],
    icon: "bi-geo-alt",
    children: [
      { name: "استان‌ها", link: "/location/provinces/list", permissions: ['province_view'], icon: "bi-map" },
      { name: "شهرها", link: "/location/cities/list", permissions: ['city_view'], icon: "bi-map-fill" },
    ],
  },

  {
    name: "دیدگاه‌ها",
    permissions: ['comment_view'],
    icon: "bi-chat-left-text",
    children: [
      { name: "مقالات", link: "/comments/articles", permissions: ['comment_view'], icon: "bi-journal-text" },
    ],
  },

  {
    name: "مقالات",
    permissions: ['articlecategory_view', 'article_view'],
    icon: "bi-journal-richtext",
    children: [
      { name: "دسته‌بندی‌ها", link: "/articles/categories", permissions: ['articlecategory_view'], icon: "bi-tags" },
      { name: "لیست مقالات", link: "/articles/list", permissions: ['article_view'], icon: "bi-file-text" },
    ],
  },

  {
    name: "تیم",
    permissions: ['team_view'],
    icon: "bi-people",
    link: "/team/list",
  },

  {
    name: "پیامک همگانی",
    permissions: ['sendsms_view'],
    icon: "bi-phone",
    link: "/send-sms",
  },

  {
    name: "تنظیمات",
    permissions: ['setting_view'],
    icon: "bi-gear",
    link: "/settings",
  },
];

const updateWidth = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value < 768) {
    mobileOpen.value = false;
  } else {
    mobileOpen.value = true;

  }
};
onMounted(() => {
  window.addEventListener("resize", updateWidth);
  updateWidth();
});
onBeforeUnmount(() => window.removeEventListener("resize", updateWidth));

</script>

<style scoped>
.sidebar {
  width: 250px;
  transition: width 0.2s;
  height: 100vh;
  overflow: auto;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
}

.sidebar-open {
  width: 250px;
  /* expanded */
}

.nav-link {
  padding: 0.5rem 1rem;
}

@media (max-width: 991px) {
  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 250px;
    z-index: 1050;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }

  .sidebar-open {
    transform: translateX(0);
  }

  button#toggleMenuButton {
    z-index: 1000;
    right: 8px;
    top: 8px;
  }
}
</style>
