<template>
  <div class="container mt-3 mt-md-4 px-2 px-md-3">

    <!-- دکمه افزودن نقش -->
    <div class="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-2 mb-3 header-row">
      <h4 class="mb-0 page-title">
        پیام های ارسال شده
      </h4>

      <router-link v-if="checkPermission(['sendsms_create'])" to="/send-sms/create" class="btn btn-success add-btn">
        <i class="bi bi-plus"></i>
        <span>ارسال پیامک</span>
      </router-link>
    </div>

    <!-- جدول -->
    <div class="card">
      <div class="card-body p-2 p-md-3">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">در حال بارگذاری...</span>
          </div>
        </div>

        <div class="table-box" v-else>
          <!-- ===== نمایش جدول در دسکتاپ ===== -->
          <div class="table-responsive d-none d-md-block">
            <table class="table table-bordered table-striped mb-0">
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
                  <td>
                    <div class="message-text">{{ message.body }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ===== نمایش کارتی در موبایل ===== -->
          <div class="d-md-none message-cards">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message-card"
            >
              <div class="message-card-header">
                <div class="message-id-badge">#{{ message.id }}</div>
                <div class="message-subject">{{ message.subject }}</div>
              </div>

              <div class="message-card-body">
                <div class="message-info-row">
                  <i class="bi bi-person"></i>
                  <span class="info-label">گیرنده:</span>
                  <span class="info-value">{{ message.role ? message.role.name : '---' }}</span>
                </div>
                <div class="message-info-row">
                  <i class="bi bi-chat-left-text"></i>
                  <span class="info-label">متن:</span>
                  <span class="info-value message-text">{{ message.body }}</span>
                </div>
              </div>
            </div>

            <!-- حالت خالی -->
            <div v-if="!messages || messages.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              <p>پیامی یافت نشد</p>
            </div>
          </div>
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

<style scoped>
/* ===== هدر صفحه ===== */
.header-row {
  padding: 0 4px;
}

.page-title {
  font-weight: 700;
  color: #2d3436;
  font-size: 1.4rem;
}

.add-btn {
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

/* ===== جدول ===== */
.table {
  margin-bottom: 0;
}

.table thead th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2d3436;
  white-space: nowrap;
  font-size: 0.9rem;
}

.table tbody td {
  vertical-align: middle;
  font-size: 0.9rem;
}

.message-text {
  max-width: 350px;
  word-wrap: break-word;
}

/* ===== کارت‌های موبایل ===== */
.message-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.message-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.message-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.message-id-badge {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}

.message-subject {
  font-weight: 700;
  color: #2d3436;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.message-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.85rem;
}

.message-info-row i {
  color: #6c5ce7;
  font-size: 0.95rem;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-label {
  color: #6c757d;
  flex-shrink: 0;
}

.info-value {
  color: #2d3436;
  font-weight: 600;
  margin-right: auto;
  word-break: break-word;
  text-align: right;
}

/* ========================================= */
/* ===== موبایل (کمتر از 768px) ===== */
/* ========================================= */
@media (max-width: 767.98px) {
  .page-title {
    font-size: 1.15rem;
    text-align: center;
    width: 100%;
  }

  .add-btn {
    width: 100%;
  }
}

/* ========================================= */
/* ===== موبایل کوچک (کمتر از 400px) ===== */
/* ========================================= */
@media (max-width: 399.98px) {
  .page-title {
    font-size: 1rem;
  }

  .message-card {
    padding: 12px;
  }

  .message-subject {
    font-size: 0.85rem;
  }

  .message-info-row {
    font-size: 0.78rem;
  }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
  .message-cards {
    display: none;
  }
}
</style>