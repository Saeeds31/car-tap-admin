<template>
  <div class="container mt-3 mt-md-4 px-2 px-md-3 specifications-page">
    <!-- Header -->
    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3 header-row">
      <h4 class="mb-0 page-title">مدیریت مشخصات</h4>
      <router-link to="/specification/create" class="btn btn-primary add-btn">
        <i class="bi bi-plus"></i>
        <span>افزودن مشخصه</span>
      </router-link>
    </div>

    <!-- Filters -->
    <div class="card mb-3 header-card">
      <div class="card-body row g-2">
        <div class="col-12 col-sm-8 col-md-4">
          <input v-model="filters.search" @input="getSpecifications" type="text" class="form-control search-input"
            placeholder="جستجو در عنوان مشخصه" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-body p-2 p-md-3">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border" role="status"></div>
        </div>

        <div v-else>
          <!-- ===== نمایش جدول در دسکتاپ ===== -->
          <div class="table-responsive d-none d-md-block">
            <table class="table table-bordered align-middle text-center mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>عنوان مشخصه</th>
                  <th>تعداد مقادیر</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="spec in specifications.data" :key="spec.id">
                  <td>{{ spec.id }}</td>
                  <td>{{ spec.title }}</td>
                  <td>{{ spec.values.length }}</td>
                  <td>
                    <div class="d-flex flex-wrap gap-1 justify-content-center">
                      <router-link :to="`/specification/${spec.id}/edit`" class="btn btn-sm btn-info">
                        <i class="bi bi-pen"></i>
                        <span>ویرایش</span>
                      </router-link>
                      <button class="btn btn-sm btn-danger" @click="confirmDelete(spec.id)">
                        <i class="bi bi-trash3-fill"></i>
                        <span>حذف</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="specifications.data.length === 0">
                  <td colspan="4" class="text-center py-4">هیچ مشخصه‌ای یافت نشد</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ===== نمایش کارتی در موبایل ===== -->
          <div class="d-md-none specification-cards">
            <div
              v-for="spec in specifications.data"
              :key="spec.id"
              class="specification-card"
            >
              <div class="specification-card-header">
                <div class="specification-id-badge">#{{ spec.id }}</div>
                <div class="specification-title">{{ spec.title }}</div>
              </div>

              <div class="specification-card-body">
                <div class="specification-info-row">
                  <i class="bi bi-list-ol"></i>
                  <span class="info-label">تعداد مقادیر:</span>
                  <span class="info-value">{{ spec.values.length }}</span>
                </div>
              </div>

              <div class="specification-card-actions">
                <router-link :to="`/specification/${spec.id}/edit`" class="btn btn-sm btn-info flex-fill">
                  <i class="bi bi-pen"></i>
                  <span>ویرایش</span>
                </router-link>
                <button class="btn btn-sm btn-danger flex-fill" @click="confirmDelete(spec.id)">
                  <i class="bi bi-trash3-fill"></i>
                  <span>حذف</span>
                </button>
              </div>
            </div>

            <!-- حالت خالی -->
            <div v-if="!specifications.data || specifications.data.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              <p>مشخصه‌ای یافت نشد</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <b-pagination v-model="currentPage" :total-rows="specifications.total" v-if="specifications.last_page != 1"
      :per-page="specifications.per_page" @Update:modelValue="changePage" align="center"
      class="mt-3 pagination-responsive"></b-pagination>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const specifications = ref({ data: [] });
const loading = ref(false);
const filters = ref({ search: "" });
const currentPage = ref(1);

const getSpecifications = async (page = 1) => {
  loading.value = true;
  try {
    const response = await axios.get("/specifications", {
      params: {
        page,
        search: filters.value.search,
      },
    });
    specifications.value = response.data.data;
    currentPage.value = page;
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page) getSpecifications(page);
  else currentUrl = "/specifications"
};

const confirmDelete = (id) => {
  Swal.fire({
    title: "حذف مشخصه",
    text: "آیا از حذف این مشخصه مطمئن هستید؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "بله، حذف شود",
    cancelButtonText: "انصراف",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await axios.delete(`/specifications/${id}`);
      getSpecifications(currentPage.value);
      Swal.fire("حذف شد!", "مشخصه با موفقیت حذف گردید.", "success");
    }
  });
};

onMounted(() => {
  getSpecifications();
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

.search-input {
  border-radius: 10px;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #6c5ce7;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
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

/* ===== کارت‌های موبایل ===== */
.specification-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.specification-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.specification-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.specification-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.specification-id-badge {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}

.specification-title {
  font-weight: 700;
  color: #2d3436;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.specification-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.specification-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.specification-info-row i {
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

.info-value {
  color: #2d3436;
  font-weight: 600;
  margin-right: auto;
  text-align: left;
}

.specification-card-actions {
  display: flex;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.specification-card-actions .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.75rem;
  padding: 6px 8px;
  white-space: nowrap;
}

.specification-card-actions .btn span {
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
  .page-title {
    font-size: 1.15rem;
    text-align: center;
    width: 100%;
  }

  .add-btn {
    width: 100%;
  }

  .search-input {
    padding: 9px 12px;
    font-size: 0.9rem;
  }

  /* نمایش label دکمه‌ها در موبایل */
  .specification-card-actions .btn span {
    display: inline;
  }
}

/* ========================================= */
/* ===== موبایل کوچک (کمتر از 400px) ===== */
/* ========================================= */
@media (max-width: 399.98px) {
  .page-title {
    font-size: 1rem;
  }

  .specification-card {
    padding: 12px;
  }

  .specification-title {
    font-size: 0.9rem;
  }

  .specification-info-row {
    font-size: 0.78rem;
  }

  .specification-card-actions .btn {
    font-size: 0.7rem;
    padding: 5px 6px;
  }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
  .specification-cards {
    display: none;
  }
}
</style>