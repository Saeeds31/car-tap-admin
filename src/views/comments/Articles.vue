<template>
  <div class="container mt-3 mt-md-4 px-2 px-md-3">

    <!-- دکمه افزودن -->
    <div class="mb-3 d-flex justify-content-stretch justify-content-sm-end">
      <router-link to="/comments/create" class="btn btn-success add-btn w-100 w-sm-auto">
        <i class="bi bi-plus"></i>
        <span>افزودن کامنت</span>
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
                  <th>کاربر</th>
                  <th>متن</th>
                  <th>امتیاز</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="comment in comments.data" :key="comment.id">
                  <td>{{ comment.id }}</td>
                  <td>{{ comment.user?.name || '---' }}</td>
                  <td>
                    <div class="comment-text">{{ comment.content }}</div>
                  </td>
                  <td>
                    <span v-if="comment.rating" class="badge bg-warning text-dark">
                      <i class="bi bi-star-fill"></i> {{ comment.rating }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span :class="comment.status ? 'badge bg-success' : 'badge bg-secondary'">
                      {{ comment.status ? 'فعال' : 'غیرفعال' }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <router-link :to="`/comments/${comment.id}/edit`" class="btn btn-sm btn-warning">
                        <i class="bi bi-pen"></i>
                        <span>ویرایش</span>
                      </router-link>
                      <button class="btn btn-sm btn-danger" @click="deleteComment(comment.id)">
                        <i class="bi bi-trash3-fill"></i>
                        <span>حذف</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ===== نمایش کارتی در موبایل ===== -->
          <div class="d-md-none comment-cards">
            <div
              v-for="comment in comments.data"
              :key="comment.id"
              class="comment-card"
            >
              <div class="comment-card-header">
                <div class="comment-id-badge">#{{ comment.id }}</div>
                <div class="comment-user">{{ comment.user?.name || '---' }}</div>
                <span :class="comment.status ? 'badge bg-success' : 'badge bg-secondary'">
                  {{ comment.status ? 'فعال' : 'غیرفعال' }}
                </span>
              </div>

              <div class="comment-card-body">
                <div class="comment-text-box">{{ comment.content }}</div>

                <div class="comment-info-row" v-if="comment.rating">
                  <i class="bi bi-star"></i>
                  <span class="info-label">امتیاز:</span>
                  <span class="badge bg-warning text-dark">
                    <i class="bi bi-star-fill"></i> {{ comment.rating }}
                  </span>
                </div>
              </div>

              <div class="comment-card-actions">
                <router-link :to="`/comments/${comment.id}/edit`" class="btn btn-sm btn-warning flex-fill">
                  <i class="bi bi-pen"></i>
                  <span>ویرایش</span>
                </router-link>
                <button class="btn btn-sm btn-danger flex-fill" @click="deleteComment(comment.id)">
                  <i class="bi bi-trash3-fill"></i>
                  <span>حذف</span>
                </button>
              </div>
            </div>

            <!-- حالت خالی -->
            <div v-if="!comments.data || comments.data.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              <p>کامنتی یافت نشد</p>
            </div>
          </div>

          <!-- صفحه بندی -->
          <nav v-if="comments.meta" class="mt-3">
            <ul class="pagination justify-content-center pagination-responsive">
              <li v-for="link in comments.meta.links" :key="link.label"
                :class="['page-item', { active: link.active, disabled: !link.url }]">
                <a href="#" class="page-link" v-html="link.label" @click.prevent="changePage(link.url)"></a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const comments = ref({ data: [], meta: null });
const loading = ref(false);
const filters = ref({ content: "" });
let currentUrl = "/api/comments";

const getComments = async (url = currentUrl) => {
  loading.value = true;
  try {
    const { data } = await axios.get(url, { params: filters.value });
    comments.value = data;
    currentUrl = url;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const changePage = (url) => {
  if (url) getComments(url);
};

const deleteComment = (id) => {
  Swal.fire({
    title: "حذف کامنت",
    text: "آیا مطمئن هستید؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "بله، حذف شود",
    cancelButtonText: "انصراف",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`/comments/${id}`);
        Swal.fire("موفق", "کامنت حذف شد", "success");
        getComments();
      } catch (err) {
        Swal.fire("خطا", "مشکلی در حذف پیش آمد", "error");
      }
    }
  });
};

onMounted(() => {
  getComments();
});
</script>

<style scoped>
/* ===== دکمه افزودن ===== */
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

.comment-text {
  max-width: 300px;
  word-wrap: break-word;
}

.badge {
  font-size: 0.8rem;
  padding: 0.35rem 0.65rem;
}

/* ===== کارت‌های موبایل ===== */
.comment-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.comment-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.comment-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.comment-id-badge {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}

.comment-user {
  font-weight: 700;
  color: #2d3436;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.comment-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.comment-text-box {
  color: #495057;
  font-size: 0.85rem;
  line-height: 1.6;
  word-wrap: break-word;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
}

.comment-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.comment-info-row i {
  color: #6c5ce7;
  font-size: 0.95rem;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.info-label {
  color: #6c757d;
  flex-shrink: 0;
}

.comment-card-actions {
  display: flex;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.comment-card-actions .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.75rem;
  padding: 6px 8px;
  white-space: nowrap;
}

.comment-card-actions .btn span {
  display: none;
}

/* ===== Pagination ===== */
.pagination-responsive {
  flex-wrap: wrap;
  justify-content: center;
}

/* ========================================= */
/* ===== موبایل (کمتر از 768px) ===== */
/* ========================================= */
@media (max-width: 767.98px) {
  /* نمایش label دکمه‌ها در موبایل */
  .comment-card-actions .btn span {
    display: inline;
  }
}

/* ========================================= */
/* ===== موبایل کوچک (کمتر از 400px) ===== */
/* ========================================= */
@media (max-width: 399.98px) {
  .comment-card {
    padding: 12px;
  }

  .comment-user {
    font-size: 0.85rem;
  }

  .comment-text-box {
    font-size: 0.78rem;
  }

  .comment-info-row {
    font-size: 0.78rem;
  }

  .comment-card-actions .btn {
    font-size: 0.7rem;
    padding: 5px 6px;
  }

  .badge {
    font-size: 0.7rem;
    padding: 0.3rem 0.5rem;
  }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
  .comment-cards {
    display: none;
  }
}
</style>