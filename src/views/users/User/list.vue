<template>
    <div class="users-page container mt-3 mt-md-4 px-2 px-md-3">
        <!-- Header -->
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3 header-row">
            <h4 class="mb-0 page-title">مدیریت کاربران</h4>
            <router-link v-if="checkPermission(['user_store'])" to="/users/create" class="btn btn-primary add-btn">
                <i class="bi bi-plus"></i>
                <span>افزودن کاربر</span>
            </router-link>
        </div>

        <!-- Filter -->
        <div class="card mb-3 header-card">
            <div class="card-body row g-2">
                <b-form-group class="col-12 col-sm-6 col-md-3" label="نام کامل">
                    <b-form-input v-model="filters.full_name" type="text" class="search-input" placeholder="جستجو بر اساس نام  " />
                </b-form-group>

                <b-form-group class="col-12 col-sm-6 col-md-3" label="شماره تماس">
                    <b-form-input v-model="filters.mobile" type="text" class="search-input" placeholder="جستجو بر اساس شماره تماس  " />
                </b-form-group>

                <b-form-group class="col-12 col-sm-6 col-md-3" label="کدملی">
                    <b-form-input v-model="filters.national_code" type="text" class="search-input" placeholder="جستجو بر اساس کدملی  " />
                </b-form-group>

                <b-form-group class="col-12 col-sm-6 col-md-3" label="تاریخ تولد">
                    <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" v-model="filters.birth_date" />
                </b-form-group>


                <b-form-group class="col-12 col-sm-6 col-md-3" label="استان">

                    <select v-model="filters.province_id" class="form-select">
                        <option value="">همه </option>
                        <option v-for="(item, index) in provinces" :key="index" :value="item.id">{{ item.name }}
                        </option>
                    </select>
                </b-form-group>

                <div class="col-12 d-flex align-items-end">
                    <b-button @click="getUsers()" class="filter-btn">
                        <i class="bi bi-funnel me-1"></i>
                        فیلتر سازی
                    </b-button>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="card">
            <div class="card-body p-2 p-md-3">
                <div v-if="loading" class="text-center my-5">
                    <div class="spinner-border" role="status"></div>
                    <p class="mt-2">در حال بارگذاری...</p>
                </div>

                <div class="table-box" v-else>
                    <!-- ===== نمایش جدول در دسکتاپ ===== -->
                    <div class="table-responsive d-none d-md-block">
                        <table class="table table-bordered table-striped mb-0">
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
                    </div>

                    <!-- ===== نمایش کارتی در موبایل ===== -->
                    <div class="d-md-none user-cards">
                        <div
                            v-for="user in users.data"
                            :key="user.id"
                            class="user-card"
                        >
                            <div class="user-card-header">
                                <img :src="imageFinder(user.image)" class="user-profile">
                                <div class="user-info">
                                    <div class="user-name">{{ user.full_name }}</div>
                                    <div class="user-mobile">
                                        <i class="bi bi-phone"></i>
                                        {{ user.mobile }}
                                    </div>
                                </div>
                                <div class="user-id-badge">#{{ user.id }}</div>
                            </div>
                        </div>

                        <!-- حالت خالی -->
                        <div v-if="!users.data || users.data.length === 0" class="text-center py-5 text-muted">
                            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                            <p>کاربری یافت نشد</p>
                        </div>
                    </div>

                    <b-pagination v-model="currentPage" :total-rows="users.total" v-if="users.last_page != 1"
                        :per-page="users.per_page" @Update:modelValue="changePage" align="center"
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
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    transition: all 0.2s ease;
}

.search-input:focus {
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
}

.filter-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 20px;
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

.profile {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
}

/* ===== کارت‌های موبایل ===== */
.user-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.user-card {
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}

.user-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.user-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-profile {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e9ecef;
    flex-shrink: 0;
}

.user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.user-name {
    font-weight: 700;
    color: #2d3436;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.user-mobile {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #6c757d;
    font-size: 0.85rem;
    direction: ltr;
    justify-content: flex-end;
}

.user-mobile i {
    color: #6c5ce7;
}

.user-id-badge {
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 20px;
    flex-shrink: 0;
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
        padding: 8px 10px;
        font-size: 0.9rem;
    }

    .filter-btn {
        width: 100%;
    }
}

/* ========================================= */
/* ===== موبایل کوچک (کمتر از 400px) ===== */
/* ========================================= */
@media (max-width: 399.98px) {
    .page-title {
        font-size: 1rem;
    }

    .user-card {
        padding: 12px;
    }

    .user-profile {
        width: 48px;
        height: 48px;
    }

    .user-name {
        font-size: 0.85rem;
    }

    .user-mobile {
        font-size: 0.75rem;
    }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
    .user-cards {
        display: none;
    }
}

a {
    text-decoration: unset;
}
</style>