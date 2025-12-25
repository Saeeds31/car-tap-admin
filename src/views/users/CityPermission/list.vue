<template>
  <div class="container mt-4">

    <!-- دکمه افزودن دسترسی -->
    <div class="mb-3 text-end d-flex justify-content-between align-items-center">
      <h4>لیست دسترسی های شهری</h4>
      <button @click="showModalPermission()" v-if="checkPermission(['citypermission_store'])" class="btn btn-success">
        افزودن دسترسی شهری
      </button>
    </div>

    <!-- جدول -->
    <div v-if="checkPermission(['citypermission_view'])" class="card">
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
                <th>ردیف</th>
                <th>نام دسترسی</th>
                <th>حذف</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(role, index) in rows" :key="role.id">
                <td>{{ index + 1 }}</td>
                <td>{{ role.label }}</td>
                <td>
                  <button v-if="checkPermission(['citypermission_delete'])" class="btn btn-sm btn-danger"
                    @click="deleteRow(role.id)">
                    حذف
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <Modal v-if="permissionModal" id="permissionModal" @closeModal="() => permissionModal = false" title="سطح دسترسی">
      <b-form-group label="انتخاب دسترسی شهر" label-for="permission_ids">
        <Treeselect id="permission_ids" v-if="cities" :multiple="false" v-model="selectedCity" @search-change="loadCity"
          :normalizer="normalizer" :options="cities" placeholder="انتخاب شهر" :clearable="true"
          :valueConsistsOf="'ALL'" />
      </b-form-group>
      <button @click="savePermissions()" class="btn btn-success">ذخیره دسترسی ها</button>
    </Modal>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "@/components/shared/modal.vue";
import { BFormGroup } from "bootstrap-vue-3"
import { toast } from "vue3-toastify";
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
let permissionModal = ref(false);
const rows = ref([]);
const loading = ref(false);
let currentUrl = "/user-managers/city-permission";
let selectedRoleId = ref(null);
function showModalPermission() {

  permissionModal.value = true;
}
let permission_ids = ref([]);
const normalizer = (node) => {
  // تبدیل کلیدها به فرمت استاندارد کامپوننت
  return {
    id: node.id,
    label: node.name,
  }
}
async function savePermissions() {
  const fd = new FormData();
  fd.append("city_id", selectedCity.value);

  let res = await axios.post('/user-managers/city-permission', fd);
  permissionModal.value = false;
  if (res.data.success) {
    toast.success("با موفقیت ثبت شد ")
    getList();
  } else {
    toast.error('خطایی در ثبت به وجود آمده است مجددا تلاش کنید')
  }
}
const getList = async (url = currentUrl) => {
  loading.value = true;
  try {
    const { data } = await axios.get(url);
    rows.value = data.data;
    currentUrl = url;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};
let cities = ref(null);
let backUpCities = ref(null);
let selectedCity = ref(null);
const loadCity = async (searchQuery) => {
  if (!searchQuery || !searchQuery.length) {
    return;
  }
  try {
    cities.value = backUpCities.value.filter((c) => c.name.includes(searchQuery));
    console.log(cities.value);

  } catch (e) {
    console.log(e);
    toast.error('خطا در جستجوی کاربران')
  }
}
const getCities = async () => {
  try {
    const { data } = await axios.get('/all-city');
    backUpCities.value = data.data;
    cities.value = [];
  } catch (err) {
    console.error(err);
  }
};
let allPermissions = ref([]);
async function getAllPermissions() {
  let res = await axios.get('/all-permissions');
  allPermissions.value = res.data.data;
}
getAllPermissions()
const deleteRow = (id) => {
  Swal.fire({
    title: "حذف دسترسی",
    text: "آیا مطمئن هستید؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "بله، حذف شود",
    cancelButtonText: "انصراف",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`/user-managers/city-permission/${id}`);
        Swal.fire("موفق", "دسترسی حذف شد", "success");
        getList();
      } catch (err) {
        Swal.fire("خطا", "مشکلی در حذف پیش آمد", "error");
      }
    }
  });
};

onMounted(() => {
  getList();
  getCities();
});
</script>