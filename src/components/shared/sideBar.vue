<template>
  <div id="sidebar">
    <!-- Overlay موبایل -->
    <b-collapse v-model="mobileOpen" class="d-lg-none">
      <div class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" @click="mobileOpen = false"></div>
    </b-collapse>

    <!-- Sidebar -->
    <div class="sidebar d-flex flex-column" :class="{ 'sidebar-open': mobileOpen }">
      <!-- Logo -->
      <router-link to="/dashboard"
        class="text-decoration-none p-3 d-flex justify-content-center align-items-center border-bottom logo-wrapper">
        <div class="logo-inner d-flex flex-column align-items-center">
          <i class="bi bi-hexagon-fill logo-icon"></i>
          <h2 class="logo-title">تکین آراز پرگاس</h2>
        </div>
      </router-link>

      <div class="menu-items-wrapper">
        <div v-for="item in menuItems" :key="item.name" class="w-100">
          <b-nav-item @click="mobileOpen = false" v-if="!item.children && checkPermission(item.permissions)"
            :to="item.link" class="menu-item" :class="{ 'active': isActiveRoute(item.link) }">
            <i :class="item.icon + ' me-2'"></i>
            <span>{{ item.name }}</span>
          </b-nav-item>

          <!-- آیتم با زیرمنو -->
          <div v-else-if="checkPermission(item.permissions, 'or')" class="menu-group">
            <button class="navItem btn w-100 text-start menu-group-btn"
              :class="{ 'has-active-child': hasActiveChild(item) }" @click="toggleSubmenu(item)">
              <i :class="item.icon + ' me-2'"></i>
              <span>{{ item.name }}</span>
              <i class="ms-auto bi" :class="openSubmenuStates[item.name] ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </button>
            <b-collapse v-model="openSubmenuStates[item.name]" class="submenu-wrapper">
              <b-nav vertical>
                <template v-for="child in item.children" :key="child.name">
                  <b-nav-item @click="mobileOpen = false" v-if="checkPermission(child.permissions)" :to="child.link"
                    class="submenu-item" :class="{ 'active': isActiveRoute(child.link) }">
                    <i :class="child.icon + ' me-2'"></i>
                    <span>{{ child.name }}</span>
                  </b-nav-item>
                </template>
              </b-nav>
            </b-collapse>
          </div>
        </div>
      </div>
    </div>

    <!-- Toggle Button موبایل -->
    <b-button variant="primary" class="d-lg-none mobile-toggle-btn" @click="mobileOpen = !mobileOpen">
      <i class="bi-list"></i>
    </b-button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { BNav, BNavItem, BButton, BCollapse } from "bootstrap-vue-3";
import { useAdmin } from '@/stores/modules/admin';
import { useRoute } from "vue-router";

const store = useAdmin();
const checkPermission = store.checkPermission;
const route = useRoute();

const mobileOpen = ref(true);
const windowWidth = ref(window.innerWidth);
const openSubmenuStates = ref({});
const openSubmenu = ref(null);

// بررسی می‌کنه که آیا لینک فعلی با مسیر داده شده مطابقت داره
const isActiveRoute = (link) => {
  if (!link) return false;
  return route.path === link;
};

// بررسی می‌کنه که آیا زیرمنوی باز شده شامل صفحه فعال هست
const hasActiveChild = (item) => {
  if (!item.children) return false;
  return item.children.some(child =>
    child.link && (route.path === child.link || route.path.startsWith(child.link + '/'))
  );
};

// باز کردن خودکار زیرمنویی که صفحه فعال در اون قرار داره
const autoOpenSubmenu = () => {
  menuItems.value.forEach(item => {
    if (item.children) {
      const hasActive = item.children.some(child =>
        child.link && (route.path === child.link || route.path.startsWith(child.link + '/'))
      );
      if (hasActive) {
        openSubmenuStates.value[item.name] = true;
        openSubmenu.value = item.name;
      }
    }
  });
};

const toggleSubmenu = (item) => {
  openSubmenuStates.value[item.name] = !openSubmenuStates.value[item.name];
  openSubmenu.value = openSubmenuStates.value[item.name] ? item.name : null;
};

// منوها
const menuItems = ref(
  [
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
    { name: "رسید های واریزی", link: "/receipts", permissions: ['receipts_view'], icon: "bi-receipt" },

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
      name: "درخواست های خودرو",
      permissions: ['carrequest_view'],
      icon: "bi-arrow-left-right",
      children: [
        { name: "لیست", link: "/car-requests", permissions: ['carrequest_view'], icon: "bi-list" },
      ],
    },
    {
      name: "گزارشات",
      permissions: ['report_users'],
      icon: "bi-graph-up",
      children: [
        { name: "کاربران", link: "/reports/users", permissions: ['report_users'], icon: "bi-people" },
        { name: "پیش فروش", link: "/reports/car-request", permissions: ['report_sales'], icon: "bi-bag-fill" },
        { name: "خودروها", link: "/reports/cars", permissions: ['report_car'], icon: "bi-car-front" },
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
  ]
);

const updateWidth = () => (windowWidth.value = window.innerWidth);

// وقتی مسیر تغییر می‌کنه، زیرمنوی مربوطه رو باز کن
watch(() => route.path, () => {
  autoOpenSubmenu();
}, { immediate: true });

onMounted(() => {
  window.addEventListener("resize", updateWidth);
  autoOpenSubmenu();
});
onBeforeUnmount(() => window.removeEventListener("resize", updateWidth));
</script>

<style scoped>
/* ===== استایل اصلی سایدبار ===== */
.sidebar {
  width: 260px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
  background: linear-gradient(180deg, #1a1f2e 0%, #161a26 100%);
  color: #e4e6eb;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.08);
  font-family: 'IRANSans', 'Vazir', 'Segoe UI', Tahoma, sans-serif;
}

/* اسکرول بار سفارشی */
.sidebar::-webkit-scrollbar {
  width: 5px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #3b4254;
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #4a5568;
}

/* ===== لوگو ===== */
.logo-wrapper {
  border-bottom: 1px solid #2d3348 !important;
  padding: 1.5rem 1.25rem !important;
  background: rgba(26, 31, 46, 0.6);
  transition: background 0.2s ease;
}

.logo-wrapper:hover {
  background: rgba(45, 51, 72, 0.5);
}

.logo-inner {
  gap: 8px;
}

.logo-icon {
  font-size: 2rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 6px rgba(59, 130, 246, 0.4));
}

.logo-title {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.3px;
  text-align: center;
}

/* ===== محتوای منوها ===== */
.menu-items-wrapper {
  padding: 0.75rem 0 1.5rem;
  flex: 1;
}

/* ===== آیتم منوی اصلی ===== */
.menu-item {
  display: flex !important;
  align-items: center !important;
  padding: 0.7rem 1.25rem !important;
  margin: 0.25rem 0.75rem !important;
  border-radius: 10px !important;
  color: #b8c1d1 !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  position: relative;
}

.menu-item:hover {
  background: rgba(45, 51, 72, 0.8) !important;
  color: #ffffff !important;
  transform: translateX(-3px);
}

.menu-item.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.menu-item.active::before {
  content: '';
  position: absolute;
  right: -0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: #60a5fa;
  border-radius: 4px 0 0 4px;
}

.menu-item i {
  font-size: 1.15rem;
  width: 1.5rem;
  transition: transform 0.2s ease;
}

.menu-item:hover i {
  transform: scale(1.08);
}

/* ===== گروه منو با زیرمنو ===== */
.menu-group {
  margin: 0.25rem 0;
}

.menu-group-btn {
  display: flex !important;
  align-items: center !important;
  padding: 0.7rem 1.25rem !important;
  margin: 0.25rem 0.75rem !important;
  border-radius: 10px !important;
  background: transparent !important;
  color: #b8c1d1 !important;
  border: none !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
}

.menu-group-btn:hover {
  background: rgba(45, 51, 72, 0.8) !important;
  color: #ffffff !important;
  transform: translateX(-3px);
}

.menu-group-btn.has-active-child {
  background: rgba(59, 130, 246, 0.15) !important;
  color: #60a5fa !important;
}

.menu-group-btn i:first-child {
  font-size: 1.15rem;
  width: 1.5rem;
  transition: transform 0.2s ease;
}

.menu-group-btn:hover i:first-child {
  transform: scale(1.08);
}

.menu-group-btn .bi-chevron-up,
.menu-group-btn .bi-chevron-down {
  font-size: 0.75rem;
  transition: transform 0.25s ease;
}

/* ===== زیرمنو ===== */
.submenu-wrapper {
  margin-right: 0.5rem;
  position: relative;
}

.submenu-wrapper::before {
  content: '';
  position: absolute;
  right: 1.5rem;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(59, 130, 246, 0.2);
}

.submenu-item {
  display: flex !important;
  align-items: center !important;
  padding: 0.55rem 1.25rem 0.55rem 1rem !important;
  margin: 0.125rem 0.75rem !important;
  border-radius: 8px !important;
  color: #858d9d !important;
  font-size: 0.8125rem !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  position: relative;
}

.submenu-item:hover {
  background: rgba(45, 51, 72, 0.6) !important;
  color: #e4e6eb !important;
  transform: translateX(-3px);
}

.submenu-item.active {
  background: rgba(59, 130, 246, 0.2) !important;
  color: #60a5fa !important;
}

.submenu-item.active::before {
  content: '';
  position: absolute;
  right: -0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 18px;
  background: #60a5fa;
  border-radius: 3px 0 0 3px;
}

.submenu-item i {
  font-size: 0.9rem;
  width: 1.25rem;
  transition: transform 0.2s ease;
}

.submenu-item:hover i {
  transform: scale(1.1);
}

/* ===== دکمه موبایل ===== */
.mobile-toggle-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1100;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transition: all 0.2s ease;
}

.mobile-toggle-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
}

/* ===== ریسپانسیو ===== */
@media (max-width: 991px) {
  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 280px;
    z-index: 1050;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar-open {
    transform: translateX(0);
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.4);
  }
}

/* انیمیشن‌های نرم */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

a.nav-link i,
a.nav-link span {
  color: #b8c1d1 !important;
}

a.nav-link {
  color: #b8c1d1 !important;
}

a.nav-link:hover,
a.nav-link:hover i,
a.nav-link:hover span {
  color: #ffffff !important;
}

/* ===== بهبودهای ریسپانسیو اضافه شده ===== */
@media (max-width: 991.98px) {

  /* اطمینان از تمام عرض بودن منوها در موبایل */
  .menu-items-wrapper {
    padding: 0.5rem 0 1rem;
  }

  .menu-item,
  .menu-group-btn {
    padding: 0.8rem 1rem !important;
    margin: 0.25rem 0.5rem !important;
    font-size: 0.9375rem !important;
  }

  .submenu-item {
    padding: 0.65rem 1rem 0.65rem 0.75rem !important;
    margin: 0.125rem 0.5rem !important;
    font-size: 0.875rem !important;
  }

  /* دکمه موبایل کمی بزرگ‌تر و خواناتر */
  .mobile-toggle-btn {
    padding: 0.625rem 0.875rem;
    font-size: 1.125rem;
  }
}

/* در صفحات بسیار کوچک، سایدبار کمی باریک‌تر */
@media (max-width: 400px) {
  .sidebar {
    width: 250px;
  }

  .menu-item,
  .menu-group-btn {
    padding: 0.7rem 0.875rem !important;
    font-size: 0.875rem !important;
  }

  .submenu-item {
    padding: 0.55rem 0.875rem 0.55rem 0.625rem !important;
    font-size: 0.8125rem !important;
  }

  .logo-title {
    font-size: 0.95rem;
  }

  .logo-icon {
    font-size: 1.7rem;
  }
}

/* وقتی سایدبار در دسکتاپ جمع می‌شود (در صورت نیاز) */
@media (min-width: 992px) {
  .mobile-toggle-btn {
    display: none !important;
  }
}
</style>