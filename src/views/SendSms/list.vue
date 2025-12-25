<template>
  <div class="container mt-4">

    <!-- دکمه افزودن نقش -->
    <div class="mb-3 text-end d-flex align-items-center justify-content-between">
      <h4 class="text-right">
        پیام های ارسال شده
      </h4>

      <router-link v-if="checkPermission(['sendsms_create'])" to="/send-sms/create" class="btn btn-success">
        ارسال پیامک
      </router-link>
    </div>

    <!-- جدول -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">در حال بارگذاری...</span>
          </div>
        </div>

        <div class="table-box" v-else>
          <table class="table table-bordered table-striped">
            <thead>
              <tr>
                <th>شناسه</th>
                <th>موضوع</th>
                <th>گیرنده</th>
                <th>متن</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="message in messages" :key="message.id">
                <td>{{ message.id }}</td>
                <td>{{ message.subject }}</td>
                <td>{{ message.role ? message.role.name : "" }}</td>
                <td>{{ message.body }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
const messages = ref([]);
const loading = ref(false);
let currentUrl = "/send-sms";
const getMessages = async (url = currentUrl) => {
  loading.value = true;
  try {
    const { data } = await axios.get(url);
    messages.value = data.data;
    currentUrl = url;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  getMessages();
});
</script>