<template>
  <div class="container mt-4">

    <!-- فیلتر -->
    <div class="card mb-3">
      <div class="card-body">
        <form @submit.prevent="getCars">
          <div class="row g-2">
            <div class="col-md-4">
              <input v-model="filters.title" type="text" class="form-control" placeholder="جستجو بر اساس عنوان" />
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary w-100" type="submit">جستجو</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- دکمه افزودن -->
    <div class="mb-3 text-end">
      <router-link v-if="checkPermission(['car_store'])" to="/cars/create" class="btn btn-success">
        افزودن ماشین
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
                  <router-link v-if="checkPermission(['car_update'])" :to="`/cars/${car.id}/edit`"
                    class="btn btn-sm btn-warning me-2">
                    ویرایش
                  </router-link>
                  <button class="btn btn-sm btn-danger" v-if="checkPermission(['car_delete'])"
                    @click="deletecar(car.id)">
                    حذف
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- صفحه بندی  -->

          <b-pagination v-model="currentPage" :total-rows="cars.total" v-if="cars.last_page != 1"
            :per-page="cars.per_page" @Update:modelValue="changePage" align="center" class="mt-3"></b-pagination>

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
const currentPage = ref(1)
const cars = ref({ data: [], meta: null });
const loading = ref(false);
const filters = ref({ title: "" });
let currentUrl = "/cars";
async function getCars(url) {
  loading.value = true;
  try {
    const { data } = await axios.get(url, { params: filters.value });
    cars.value = data;
    currentPage.value = data.data.current_page
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
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
.table th,
.table td {
  vertical-align: middle;
}
</style>