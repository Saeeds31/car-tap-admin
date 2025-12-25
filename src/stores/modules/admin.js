import axios from "axios";
import { defineStore } from "pinia";

export const useAdmin = defineStore("admin", {
  state: () => ({
    admin: null,
    permissions: [],
    loader: false,
    notifs: [],
  }),

  getters: {
    getAdmin: (state) => state.admin,
    getLoader: (state) => state.loader,
    getPermissions: (state) => state.permissions,
    notifications: (state) => state.notifs,
  },

  actions: {
    checkPermission(permissions, type) {
      let res = false;
      if (type == "or") {
        res = permissions.some((adminPer) =>
          this.permissions.includes(adminPer)
        );
      } else {
        res = permissions.every((adminPer) =>
          this.permissions.includes(adminPer)
        );
      }
      return res;
    },
    async getAdminDetail() {
      this.loader = true;
      try {
        const { data } = await axios.get("/admin-info");
        this.admin = data.user;
        this.permissions = data.permissions;
      } catch (e) {
        console.log(e);
      } finally {
        this.loader = false;
      }
    },
    async getNotifications() {
      this.loader = true;
      try {
        const { data } = await axios.get("/notifications");
        this.notifs = data.data;
      } catch (e) {
        console.log(e);
      } finally {
        this.loader = false;
      }
    },
  },
});
