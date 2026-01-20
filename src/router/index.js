import { createRouter, createWebHistory } from "vue-router";
import login from "../views/login.vue";
import dashboard from "../views/dashboard/dashboard.vue";

const routes = [
  { path: "/login", name: "login", component: login },
  { path: "/dashboard", name: "dashboard", component: dashboard },
  {
    path: "/users",
    name: "users-list",
    component: () => import("@/views/users/User/list.vue"),
  },
  {
    path: "/users/detail/:id",
    name: "users-detail",
    component: () => import("@/views/users/User/detail.vue"),
  },

  {
    path: "/users/create",
    name: "users-create",
    component: () => import("@/views/users/User/create.vue"),
  },

  {
    path: "/users/:id/edit",
    name: "users-edit",
    component: () => import("@/views/users/User/edit.vue"),
  },

  {
    path: "/users/managers",
    name: "users-managers",
    component: () => import("@/views/users/Manager/list.vue"),
  },

  {
    path: "/users/managers/create",
    name: "users-managers-create",
    component: () => import("@/views/users/Manager/create.vue"),
  },
  {
    path: "/users/managers/:id/edit",
    name: "users-managers-edit",
    component: () => import("@/views/users/Manager/edit.vue"),
  },

  {
    path: "/send-sms",
    name: "send-sms",
    component: () => import("@/views/SendSms/list.vue"),
  },
  {
    path: "/send-sms/create",
    name: "send-sms-create",
    component: () => import("@/views/SendSms/create.vue"),
  },
  {
    path: "/users/roles",
    name: "users-roles",
    component: () => import("@/views/users/Role/list.vue"),
  },
  {
    path: "/users/roles/create",
    name: "users-roles-create",
    component: () => import("@/views/users/Role/create.vue"),
  },
  {
    path: "/users/roles/:id/edit",
    name: "users-roles-edit",
    component: () => import("@/views/users/Role/edit.vue"),
  },

  {
    path: "/sales-plan/list",
    name: "sales-plan",
    component: () => import("@/views/salesPlan/list.vue"),
  },
  {
    path: "/sales-plan/create",
    name: "sales-plan-create",
    component: () => import("@/views/salesPlan/create.vue"),
  },
  {
    path: "/sales-plan/:id/edit",
    name: "sales-plan-edit",
    component: () => import("@/views/salesPlan/edit.vue"),
  },
  {
    path: "/receipts",
    name: "receipts",
    component: () => import("@/views/wallet/Wallet/receipts.vue"),
  },
  {
    path: "/wallets",
    name: "wallets",
    component: () => import("@/views/wallet/Wallet/list.vue"),
  },
  {
    path: "/wallet-transaction",
    name: "wallet-transactions",
    component: () => import("@/views/wallet/Wallet/transactions.vue"),
  },

  {
    path: "/settings",
    name: "settings",
    component: () => import("@/views/settings/index.vue"),
  },

  {
    path: "/content/sliders",
    name: "content-sliders",
    component: () => import("@/views/content/Slider/list.vue"),
  },

  {
    path: "/content/sliders/create",
    name: "content-sliders-create",
    component: () => import("@/views/content/Slider/create.vue"),
  },
  {
    path: "/content/sliders/:id/edit",
    name: "content-sliders-edit",
    component: () => import("@/views/content/Slider/edit.vue"),
  },

  {
    path: "/content/menus",
    name: "content-menus",
    component: () => import("@/views/content/Menu/list.vue"),
  },

  {
    path: "/content/menus/create",
    name: "content-menus-create",
    component: () => import("@/views/content/Menu/create.vue"),
  },

  {
    path: "/content/menus/:id/edit",
    name: "content-menus-edit",
    component: () => import("@/views/content/Menu/edit.vue"),
  },
  {
    path: "/cars/categories/list",
    name: "cars-categories",
    component: () => import("@/views/cars/categories/list.vue"),
  },
  {
    path: "/cars/categories/create",
    name: "cars-categories-create",
    component: () => import("@/views/cars/categories/create.vue"),
  },
  {
    path: "/cars/categories/:id/edit",
    name: "cars-categories-edit",
    component: () => import("@/views/cars/categories/edit.vue"),
  },

  {
    path: "/cars/brands/list",
    name: "cars-brands",
    component: () => import("@/views/cars/brands/list.vue"),
  },
  {
    path: "/cars/brands/create",
    name: "cars-brands-create",
    component: () => import("@/views/cars/brands/create.vue"),
  },
  {
    path: "/cars/brands/:id/edit",
    name: "cars-brands-edit",
    component: () => import("@/views/cars/brands/edit.vue"),
  },

  {
    path: "/cars/list",
    name: "cars-list",
    component: () => import("@/views/cars/cars/list.vue"),
  },
  {
    path: "/cars/create",
    name: "cars-create",
    component: () => import("@/views/cars/cars/create.vue"),
  },
  {
    path: "/cars/:id/edit",
    name: "cars-edit",
    component: () => import("@/views/cars/cars/edit.vue"),
  },
  {
    path: "/specification/list",
    name: "specification-list",
    component: () => import("@/views/specification/Specification/list.vue"),
  },
  {
    path: "/specification/create",
    name: "specification-create",
    component: () => import("@/views/specification/Specification/create.vue"),
  },
  {
    path: "/specification/:id/edit",
    name: "specification-edit",
    component: () => import("@/views/specification/Specification/edit.vue"),
  },
  {
    path: "/specification/group/list",
    name: "specification-group-list",
    component: () => import("@/views/specification/group/list.vue"),
  },
  {
    path: "/specification/group/create",
    name: "specification-group-create",
    component: () => import("@/views/specification/group/create.vue"),
  },
  {
    path: "/specification/group/:id/edit",
    name: "specification-group-edit",
    component: () => import("@/views/specification/group/edit.vue"),
  },
  {
    path: "/content/banners",
    name: "content-banners",
    component: () => import("@/views/content/Banner/list.vue"),
  },

  {
    path: "/content/banners/create",
    name: "content-banners-create",
    component: () => import("@/views/content/Banner/create.vue"),
  },

  {
    path: "/content/banners/:id/edit",
    name: "content-banners-edit",
    component: () => import("@/views/content/Banner/edit.vue"),
  },

  {
    path: "/team/list",
    name: "team-list",
    component: () => import("@/views/Team/list.vue"),
  },
  {
    path: "/team/create",
    name: "team-create",
    component: () => import("@/views/Team/create.vue"),
  },
  {
    path: "/team/:id/edit",
    name: "team-edit",
    component: () => import("@/views/Team/edit.vue"),
  },
  {
    path: "/articles/list",
    name: "articles-list",
    component: () => import("@/views/articles/Article/list.vue"),
  },
  {
    path: "/articles/create",
    name: "articles-create",
    component: () => import("@/views/articles/Article/create.vue"),
  },
  {
    path: "/articles/:id/edit",
    name: "articles-edit",
    component: () => import("@/views/articles/Article/edit.vue"),
  },
  {
    path: "/articles/categories",
    name: "articles-categories",
    component: () => import("@/views/articles/Category/list.vue"),
  },
  {
    path: "/articles/categories/create",
    name: "articles-categories-create",
    component: () => import("@/views/articles/Category/create.vue"),
  },
  {
    path: "/articles/categories/:id/edit",
    name: "articles-categories-edit",
    component: () => import("@/views/articles/Category/edit.vue"),
  },

  {
    path: "/comments/articles",
    name: "comments-articles",
    component: () => import("@/views/comments/Articles.vue"),
  },
  {
    path: "/location/provinces/list",
    name: "location-province-list",
    component: () => import("@/views/location/Province/list.vue"),
  },

  {
    path: "/location/provinces/create",
    name: "location-province-create",
    component: () => import("@/views/location/Province/create.vue"),
  },

  {
    path: "/location/provinces/:id/edit",
    name: "location-province-edit",
    component: () => import("@/views/location/Province/edit.vue"),
  },

  {
    path: "/location/cities/list",
    name: "location-cities-list",
    component: () => import("@/views/location/City/list.vue"),
  },

  {
    path: "/location/cities/create",
    name: "location-cities-create",
    component: () => import("@/views/location/City/create.vue"),
  },

  {
    path: "/location/cities/:id/edit",
    name: "location-cities-edit",
    component: () => import("@/views/location/City/edit.vue"),
  },

  {
    path: "/reports/users",
    name: "reports-users",
    component: () => import("@/views/reports/users.vue"),
  },

  {
    path: "/reports/car-request",
    name: "reports-car-request",
    component: () => import("@/views/reports/carRequest.vue"),
  },

  {
    path: "/car-requests",
    name: "car-requests-list",
    component: () => import("@/views/carRequests/list.vue"),
  },
  {
    path: "/reports/cars",
    name: "reports-cars",
    component: () => import("@/views/reports/cars.vue"),
  },
  { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
