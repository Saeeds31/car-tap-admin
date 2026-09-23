<template>
  <div class="container mt-3 mt-md-4 px-2 px-md-3">

    <!-- فیلتر -->
    <div class="card mb-3 header-card">
      <div class="card-body">
        <form @submit.prevent="getCars">
          <div class="row g-2">
            <div class="col-12 col-sm-8 col-md-4">
              <input v-model="filters.title" type="text" class="form-control search-input" placeholder="جستجو بر اساس عنوان" />
            </div>
            <div class="col-12 col-sm-4 col-md-2">
              <button class="btn btn-primary w-100" type="submit">جستجو</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- دکمه افزودن -->
    <div class="mb-3 d-flex justify-content-stretch justify-content-sm-end">
      <router-link v-if="checkPermission(['car_store'])" to="/cars/create" class="btn btn-success add-btn w-100 w-sm-auto">
        <i class="bi bi-plus"></i>
        <span>افزودن ماشین</span>
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
                  <th>عنوان</th>
                  <th>دسته بندی</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="car in cars.data" :key="car.id">
                  <td>{{ car.id }}</td>
                  <td>{{ car.name }}</td>
                  <td>{{ car.category?.title }}</td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <router-link v-if="checkPermission(['car_update'])" :to="`/cars/${car.id}/edit`"
                        class="btn btn-sm btn-warning">
                        <i class="bi bi-pen"></i>
                        <span>ویرایش</span>
                      </router-link>
                      <button class="btn btn-sm btn-danger" v-if="checkPermission(['car_delete'])"
                        @click="deletecar(car.id)">
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
          <div class="d-md-none car-cards">
            <div
              v-for="car in cars.data"
              :key="car.id"
              class="car-card"
            >
              <div class="car-card-header">
                <div class="car-id-badge">#{{ car.id }}</div>
                <div class="car-title">{{ car.name }}</div>
              </div>

              <div class="car-card-body">
                <div class="car-info-row">
                  <i class="bi bi-bookmark"></i>
                  <span class="info-label">دسته بندی:</span>
                  <span class="info-value">{{ car.category?.title ?? '-' }}</span>
                </div>
              </div>

              <div class="car-card-actions">
                <router-link v-if="checkPermission(['car_update'])" :to="`/cars/${car.id}/edit`"
                  class="btn btn-sm btn-warning flex-fill">
                  <i class="bi bi-pen"></i>
                  <span>ویرایش</span>
                </router-link>
                <button class="btn btn-sm btn-danger flex-fill" v-if="checkPermission(['car_delete'])"
                  @click="deletecar(car.id)">
                  <i class="bi bi-trash3-fill"></i>
                  <span>حذف</span>
                </button>
              </div>
            </div>

            <!-- حالت خالی -->
            <div v-if="!cars.data || cars.data.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              <p>ماشینی یافت نشد</p>
            </div>
          </div>

          <!-- صفحه بندی  -->
          <b-pagination v-model="currentPage" :total-rows="cars.total" v-if="cars.last_page != 1"
            :per-page="cars.per_page" @Update:modelValue="changePage" align="center"
            class="mt-3 pagination-responsive"></b-pagination>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useAdmin } from '@/stores/modules/admin';
import { useRoute, useRouter } from "vue-router"
const route = useRoute();
const router = useRouter();
const store = useAdmin();
const checkPermission = store.checkPermission;
const currentPage = ref(1)
const cars = ref({ data: [], meta: null });
const loading = ref(false);
const filters = ref({ title: "" });
let currentUrl = route.query.page ? `/cars?page=${route.query.page}` : "/cars";
async function getCars(url) {
  loading.value = true;
  try {
    const { data } = await axios.get(url, { params: filters.value });
    cars.value = data;
    currentPage.value = cars.value.current_page
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  router.replace({ name: route.name, query: { page: page } })
  if (page) getCars(`${currentUrl}?page=${page}`);
  else currentUrl = "/cars"
};

const deletecar = (id) => {
  Swal.fire({
    title: "حذف ماشین",
    text: "آیا مطمئن هستید؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "بله، حذف شود",
    cancelButtonText: "انصراف",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`/cars/${id}`);
        Swal.fire("موفق", "ماشین حذف شد", "success");
        getCars(currentUrl);
      } catch (err) {
        Swal.fire("خطا", "مشکلی در حذف پیش آمد", "error");
      }
    }
  });
};

onMounted(() => {
  getCars(currentUrl);
});
</script>

<style scoped>
/* ===== هدر صفحه ===== */
.header-card .card-body {
  padding: 16px 20px;
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

.table th,
.table td {
  vertical-align: middle;
}

.table thead th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2d3436;
  white-space: nowrap;
  font-size: 0.9rem;
}

.table tbody td {
  font-size: 0.9rem;
}

/* ===== کارت‌های موبایل ===== */
.car-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.car-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.car-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.car-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.car-id-badge {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}

.car-title {
  font-weight: 700;
  color: #2d3436;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.car-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.car-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.car-info-row i {
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
  word-break: break-word;
  text-align: left;
}

.car-card-actions {
  display: flex;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.car-card-actions .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.75rem;
  padding: 6px 8px;
  white-space: nowrap;
}

.car-card-actions .btn span {
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
  .header-card .card-body {
    padding: 12px 14px;
  }

  .search-input {
    padding: 9px 12px;
    font-size: 0.9rem;
  }

  /* نمایش label دکمه‌ها در موبایل */
  .car-card-actions .btn span {
    display: inline;
  }
}

/* ========================================= */
/* ===== موبایل کوچک (کمتر از 400px) ===== */
/* ========================================= */
@media (max-width: 399.98px) {
  .car-card {
    padding: 12px;
  }

  .car-title {
    font-size: 0.9rem;
  }

  .car-info-row {
    font-size: 0.78rem;
  }

  .car-card-actions .btn {
    font-size: 0.7rem;
    padding: 5px 6px;
  }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
  .car-cards {
    display: none;
  }
}
</style>