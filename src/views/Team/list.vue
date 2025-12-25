<template>
  <div class="container mt-4">

    <!-- دکمه افزودن -->
    <div class="mb-3 text-end">
      <router-link v-if="checkPermission(['team_store'])" to="/team/create" class="btn btn-success">
        افزودن عضو
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

        <div  class="table-box" v-else>
          <table class="table table-bordered table-striped">
            <thead>
              <tr>
                <th>شناسه</th>
                <th>تصویر</th>
                <th>نام کامل</th>
                <th>پست</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in team" :key="member.id">
                <td>{{ member.id }}</td>
                <td>
                  <img :src="imageFinder(member.image)" class="profile">
                </td>
                <td>{{ member.full_name }}</td>
                <td>{{ member.post }}</td>
                <td>
                  <router-link v-if="checkPermission(['team_update'])" :to="`/team/${member.id}/edit`"
                    class="btn btn-sm btn-warning me-2">
                    ویرایش
                  </router-link>
                  <button class="btn btn-sm btn-danger" v-if="checkPermission(['team_delete'])"
                    @click="deleteMember(member.id)">
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
const currentPage = ref(1)
const team = ref(null);
const loading = ref(false);
let currentUrl = "/teams";
async function getTeam(url) {
  loading.value = true;
  try {
    const { data } = await axios.get(url);
    team.value = data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};



const deleteMember = (id) => {
  Swal.fire({
    title: "حذف عضو",
    text: "آیا مطمئن هستید؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "بله، حذف شود",
    cancelButtonText: "انصراف",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`/teams/${id}`);
        Swal.fire("موفق", "عضو حذف شد", "success");
        getTeam('/teams');
      } catch (err) {
        Swal.fire("خطا", "مشکلی در حذف پیش آمد", "error");
      }
    }
  });
};

onMounted(() => {
  getTeam(currentUrl);
});
function imageFinder(imageSrc) {
  return baseImageAddress + imageSrc
}
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
.profile {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
}
</style>
