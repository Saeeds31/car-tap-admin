<template>
  <div class="container mt-4">


    <!-- دکمه افزودن -->
    <div class="mb-3 text-end">
      <router-link v-if="checkPermission(['province_store'])" to="/location/provinces/create" class="btn btn-success">
        افزودن استان
      </router-link>
    </div>

    <!-- جدول -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <div class="table-box" v-else>
          <table class="table table-bordered table-striped">
            <thead>
              <tr>
                <th>شناسه</th>
                <th>نام استان</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="province in provinces" :key="province.id">
                <td>{{ province.id }}</td>
                <td>{{ province.name }}</td>
                <td>
                  <router-link v-if="checkPermission(['province_update'])"
                    :to="`/location/provinces/${province.id}/edit`" class="btn btn-sm btn-warning me-2">
                    ویرایش
                  </router-link>
                  <button v-if="checkPermission(['province_delete'])" class="btn btn-sm btn-danger"
                    @click="deleteProvince(province.id)">
                    حذف
                  </button>
                </td>
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
import Swal from "sweetalert2";
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
const provinces = ref([]);
const loading = ref(false);
const filters = ref({ name: "" });
let currentUrl = "/provinces";

const getProvinces = async (url = currentUrl) => {
  loading.value = true;
  try {
    const { data } = await axios.get(url, { params: filters.value });
    provinces.value = data.data;
    currentUrl = url;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const deleteProvince = (id) => {
  Swal.fire({
    title: "حذف استان",
    text: "آیا مطمئن هستید؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "بله، حذف شود",
    cancelButtonText: "انصراف",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`/provinces/${id}`);
        Swal.fire("موفق", "استان حذف شد", "success");
        getProvinces();
      } catch (err) {
        Swal.fire("خطا", "مشکلی در حذف پیش آمد", "error");
      }
    }
  });
};

onMounted(() => {
  getProvinces();
});
</script>