<template>
  <div class="container mt-3 mt-md-4 px-2 px-md-3">

    <!-- باکس فیلتر -->
    <div class="card mb-3 header-card">
      <div class="card-body">
        <form @submit.prevent="getCities">
          <div class="row g-2">
            <div class="col-12 col-sm-6 col-md-4">
              <input v-model="filters.name" type="text" class="form-control search-input" placeholder="جستجو بر اساس نام شهر" />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <select v-model="filters.province_id" class="form-select">
                <option value="">همه استان‌ها</option>
                <option v-for="prov in provinces" :key="prov.id" :value="prov.id">
                  {{ prov.name }}
                </option>
              </select>
            </div>
            <div class="col-12 col-sm-6 col-md-2">
              <button class="btn btn-primary w-100" type="submit">جستجو</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- دکمه افزودن -->
    <div class="mb-3 d-flex justify-content-stretch justify-content-sm-end">
      <router-link v-if="checkPermission(['city_store'])" to="/location/cities/create" class="btn btn-success add-btn w-100 w-sm-auto">
        <i class="bi bi-plus"></i>
        <span>افزودن شهر</span>
      </router-link>
    </div>

    <!-- جدول -->
    <div class="card">
      <div class="card-body p-2 p-md-3">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div class="table-box" v-else>
          <!-- ===== نمایش جدول در دسکتاپ ===== -->
          <div class="table-responsive d-none d-md-block">
            <table class="table table-bordered table-striped mb-0">
              <thead>
                <tr>
                  <th>شناسه</th>
                  <th>نام شهر</th>
                  <th>استان</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="city in cities.data" :key="city.id">
                  <td>{{ city.id }}</td>
                  <td>{{ city.name }}</td>
                  <td>{{ city.province?.name || '---' }}</td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <router-link v-if="checkPermission(['city_update'])" :to="`/location/cities/${city.id}/edit`"
                        class="btn btn-sm btn-warning">
                        <i class="bi bi-pen"></i>
                        <span>ویرایش</span>
                      </router-link>
                      <button v-if="checkPermission(['city_delete'])" class="btn btn-sm btn-danger"
                        @click="deleteCity(city.id)">
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
          <div class="d-md-none city-cards">
            <div
              v-for="city in cities.data"
              :key="city.id"
              class="city-card"
            >
              <div class="city-card-header">
                <div class="city-id-badge">#{{ city.id }}</div>
                <div class="city-name">{{ city.name }}</div>
              </div>

              <div class="city-card-body">
                <div class="city-info-row">
                  <i class="bi bi-map"></i>
                  <span class="info-label">استان:</span>
                  <span class="info-value">{{ city.province?.name || '---' }}</span>
                </div>
              </div>

              <div class="city-card-actions">
                <router-link v-if="checkPermission(['city_update'])" :to="`/location/cities/${city.id}/edit`"
                  class="btn btn-sm btn-warning flex-fill">
                  <i class="bi bi-pen"></i>
                  <span>ویرایش</span>
                </router-link>
                <button v-if="checkPermission(['city_delete'])" class="btn btn-sm btn-danger flex-fill"
                  @click="deleteCity(city.id)">
                  <i class="bi bi-trash3-fill"></i>
                  <span>حذف</span>
                </button>
              </div>
            </div>

            <!-- حالت خالی -->
            <div v-if="!cities.data || cities.data.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              <p>شهری یافت نشد</p>
            </div>
          </div>

          <!-- صفحه بندی -->
          <b-pagination v-model="currentPage" :total-rows="cities.total" v-if="cities.last_page != 1"
            :per-page="cities.per_page" @Update:modelValue="changePage" align="center"
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
const store = useAdmin();
const checkPermission = store.checkPermission;
const cities = ref({ data: [], meta: null });
const provinces = ref([]);
const loading = ref(false);
const filters = ref({ name: "", province_id: "" });
let currentUrl = "/cities";

// دریافت لیست شهرها
const getCities = async (url = currentUrl) => {
  loading.value = true;
  try {
    const { data } = await axios.get(url, { params: filters.value });
    cities.value = data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// دریافت لیست استان‌ها برای فیلتر
const getProvinces = async () => {
  try {
    const { data } = await axios.get("/provinces");
    provinces.value = data.data;
  } catch (err) {
    console.error(err);
  }
};

const changePage = (page) => {
  if (page) getCities(`${currentUrl}?page=${page}`);
  else currentUrl = "/cities"
};
const deleteCity = (id) => {
  Swal.fire({
    title: "حذف شهر",
    text: "آیا مطمئن هستید؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "بله، حذف شود",
    cancelButtonText: "انصراف",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`/cities/${id}`);
        Swal.fire("موفق", "شهر حذف شد", "success");
        getCities();
      } catch (err) {
        Swal.fire("خطا", "مشکلی در حذف پیش آمد", "error");
      }
    }
  });
};

onMounted(() => {
  getProvinces();
  getCities();
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
.city-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.city-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.city-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.city-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.city-id-badge {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}

.city-name {
  font-weight: 700;
  color: #2d3436;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.city-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.city-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.city-info-row i {
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

.city-card-actions {
  display: flex;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.city-card-actions .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.75rem;
  padding: 6px 8px;
  white-space: nowrap;
}

.city-card-actions .btn span {
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
  .city-card-actions .btn span {
    display: inline;
  }
}

/* ========================================= */
/* ===== موبایل کوچک (کمتر از 400px) ===== */
/* ========================================= */
@media (max-width: 399.98px) {
  .city-card {
    padding: 12px;
  }

  .city-name {
    font-size: 0.9rem;
  }

  .city-info-row {
    font-size: 0.78rem;
  }

  .city-card-actions .btn {
    font-size: 0.7rem;
    padding: 5px 6px;
  }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
  .city-cards {
    display: none;
  }
}
</style>