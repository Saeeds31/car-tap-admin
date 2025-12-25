<template>
    <div class="users-page container mt-4">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>مدیریت کاربران</h4>
            <router-link v-if="checkPermission(['user_store'])" to="/users/create" class="btn btn-primary">
                افزودن کاربر
            </router-link>
        </div>

        <!-- Filter -->
        <div class="card mb-3">
            <div class="card-body row">
                <b-form-group class="col-md-3" label="نام کامل">
                    <b-form-input v-model="filters.full_name" type="text" placeholder="جستجو بر اساس نام  " />
                </b-form-group>

                <b-form-group class="col-md-3" label="شماره تماس">
                    <b-form-input v-model="filters.mobile" type="text" placeholder="جستجو بر اساس شماره تماس  " />
                </b-form-group>

                <b-form-group class="col-md-3" label="کدملی">
                    <b-form-input v-model="filters.national_code" type="text" placeholder="جستجو بر اساس کدملی  " />
                </b-form-group>

                <b-form-group class="col-md-3" label="تاریخ تولد">
                    <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" v-model="filters.birth_date" />
                </b-form-group>


                <b-form-group class="col-md-3" label="استان">

                    <select v-model="filters.province_id" class="form-select">
                        <option value="">همه </option>
                        <option v-for="(item, index) in provinces" :key="index" :value="item.id">{{ item.name }}
                        </option>
                    </select>
                </b-form-group>

                <b-button @click="getUsers()">
                    فیلتر سازی
                </b-button>
            </div>
        </div>

        <!-- Table -->
        <div class="card">
            <div class="card-body">
                <div v-if="loading" class="text-center my-5">
                    <div class="spinner-border" role="status"></div>
                    <p class="mt-2">در حال بارگذاری...</p>
                </div>

                <div class="table-box" v-else>
                    <table class="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>شناسه</th>
                                <th>تصویر</th>
                                <th>نام کامل</th>
                                <th>موبایل</th>
                            </tr>
                        </thead>
                        <tbody v-if="users.data && users.data.length">
                            <tr v-for="user in users.data" :key="user.id">
                                <td>{{ user.id }}</td>
                                <td>
                                    <img :src="imageFinder(user.image)" class="profile">
                                </td>
                                <td>{{ user.full_name }}</td>
                                <td>{{ user.mobile }}</td>
                            

                            </tr>
                        </tbody>
                    </table>

                    <b-pagination v-model="currentPage" :total-rows="users.total" v-if="users.last_page != 1"
                        :per-page="users.per_page" @Update:modelValue="changePage" align="center"
                        class="mt-3"></b-pagination>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { BFormGroup, BFormInput, BButton } from "bootstrap-vue-3"
import { useRoute, useRouter } from "vue-router";
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
const router = useRouter();
const route = useRoute();
const users = ref({ data: [] });
const loading = ref(false);
const filters = ref({

    mobile: "",
    full_name: "",
    national_code: "",
    birth_date: "",
    province_id: ""

});
let provinces = ref([]);
const currentPage = ref(1);
const getUsers = async (page = 1) => {
    loading.value = true;
    try {
        const response = await axios.get("/users", {
            params: {
                page,
                mobile: filters.value.mobile,
                national_code: filters.value.national_code,
                birth_date: filters.value.birth_date,
                full_name: filters.value.full_name,
                province_id: filters.value.province_id,
            },
        });
        users.value = response.data;
        currentPage.value = response.data.current_page;
    } finally {
        loading.value = false;
    }
};

const changePage = (page) => {
    if (page) {
        router.replace({ name: route.name, query: { page: page } })
        getUsers(page)
    }
    else currentUrl = "/users"
};
function imageFinder(imageSrc) {
    return baseImageAddress + imageSrc
}
async function getProvinces() {
    const response = await axios.get("/all-province");
    provinces.value = response.data.data;
}
onMounted(() => {
    currentPage.value = route.query.page ?? 1;
    getUsers(currentPage.value);
    getProvinces();
});
//   
</script>
<style>
.profile {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
}

a {
    text-decoration: unset;
}
</style>