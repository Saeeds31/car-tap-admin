<template>
  <div class="container mt-4">

    <!-- فیلتر -->
    <div class="card mb-3">
      <div class="card-body">
        <form @submit.prevent="getBrand">
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
      <router-link v-if="checkPermission(['brand_store'])" to="/cars/brands/create" class="btn btn-success">
        افزودن برند
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
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="brand in brands.data" :key="brand.id">
                <td>{{ brand.id }}</td>
                <td>{{ brand.title }}</td>
                <td>
                  <router-link v-if="checkPermission(['brand_update'])" :to="`/cars/brands/${brand.id}/edit`"
                    class="btn btn-sm btn-warning me-2">
                    ویرایش
                  </router-link>
                  <button class="btn btn-sm btn-danger" v-if="checkPermission(['brand_delete'])"
                    @click="deletebrand(brand.id)">
                    حذف
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- صفحه بندی  -->

          <b-pagination v-model="currentPage" :total-rows="brands.total" v-if="brands.last_page != 1"
            :per-page="brands.per_page" @Update:modelValue="changePage" align="center" class="mt-3"></b-pagination>

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
const brands = ref({ data: [], meta: null });
const loading = ref(false);
const filters = ref({ title: "" });
let currentUrl = "/brands";
async function getBrand(url) {
  loading.value = true;
  try {
    const { data } = await axios.get(url, { params: filters.value });
    brands.value = data.data;
    currentPage.value = data.data.current_page
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page) getBrand(`${currentUrl}?page=${page}`);
  else currentUrl = "/brands"
};

const deletebrand = (id) => {
  Swal.fire({
    title: "حذف برند",
    text: "آیا مطمئن هستید؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "بله، حذف شود",
    cancelButtonText: "انصراف",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`/brands/${id}`);
        Swal.fire("موفق", "برند حذف شد", "success");
        getBrand(currentUrl);
      } catch (err) {
        Swal.fire("خطا", "مشکلی در حذف پیش آمد", "error");
      }
    }
  });
};

onMounted(() => {
  getBrand(currentUrl);
});
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>