<template>
    <b-container fluid class="py-3 py-md-4 px-2 px-md-3">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3 header-row">
            <h2 class="mb-0 page-title">گزارش پیش فروش خودروها</h2>
            <b-spinner small v-if="loading"></b-spinner>
        </div>

        <b-card class="mb-4 filter-card">
            <b-form @submit.prevent="fetchData">
                <b-row class="g-2">

                    <b-col cols="12" sm="6" md="3">
                        <label class="form-label">انتخاب ماشین</label>
                        <Treeselect :options="options" v-model="filters.car_id" :multiple="false"
                            @search-change="loadCars" placeholder="جستجوی ماشین..." :searchable="true" />

                    </b-col>

                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="نام کاربر">
                            <b-form-input v-model="filters.user_name" class="search-input"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="انتخاب طرح">
                            <select name="" class="form-control" v-model="filters.sale_plan_id" id="">
                                <option value="">بدون انتخاب</option>
                                <option v-for="(item, index) in saleplanes" :key="index" :value="item.id">
                                    {{ item.title }}
                                </option>
                            </select>
                        </b-form-group>
                    </b-col>
                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="حداقل قیمت">
                            <b-form-input type="number" v-model="filters.min_price" class="search-input"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="حداکثر قیمت">
                            <b-form-input v-model="filters.max_price" type="number" class="search-input"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="وضعیت :">
                            <select name="" class="form-control" v-model="filters.sale_plan_id" id="">
                                <option v-for="(item, index) in statuses" :key="index" :value="item.id">
                                    {{ item.label }}
                                </option>
                            </select>
                        </b-form-group>
                    </b-col>

                </b-row>
                <div class="d-flex flex-column flex-sm-row gap-2 filter-actions">
                    <b-button type="submit" variant="primary" :disabled="loading" class="filter-btn">
                        <i class="bi bi-funnel me-1"></i>
                        اعمال فیلتر
                    </b-button>
                    <b-button type="button" :disabled="loading" @click="getExcel()" variant="success" class="filter-btn">
                        <i class="bi bi-file-earmark-excel me-1"></i>
                        خروجی اکسل
                    </b-button>
                </div>
            </b-form>
        </b-card>

        <b-card>
            <div class="card-body p-2 p-md-3">
                <!-- ===== نمایش جدول در دسکتاپ ===== -->
                <div class="d-none d-md-block">
                    <b-table :items="carsRequest.data" :fields="fields" striped hover small responsive>

                        <template #cell(user)="data">
                            <span>
                                {{ data.item.user?.full_name }}
                            </span>
                        </template>

                        <template #cell(mobile)="data">
                            <span>
                                {{ data.item.user ? data.item.user.mobile : "" }}
                            </span>
                        </template>
                        <template #cell(car)="data">
                            <span>
                                {{ data.item.car?.name }}
                            </span>
                        </template>

                        <template #cell(salePlan)="data">
                            <span>
                                {{ data.item.sale_plan?.title }}
                            </span>
                        </template>
                        <template #cell(created_at)="data">
                            <span>
                                {{ new Date(data.item.created_at).toLocaleDateString("fa") }}
                            </span>
                        </template>
                        <template #cell(status)="data">
                            <span>
                                {{
                                    statuses.find((s) => s.id == data.item.status)?.label
                                }}
                            </span>
                        </template>
                    </b-table>
                </div>

                <!-- ===== نمایش کارتی در موبایل ===== -->
                <div class="d-md-none report-cards">
                    <div
                        v-for="item in carsRequest.data"
                        :key="item.id"
                        class="report-card"
                    >
                        <div class="report-card-header">
                            <div class="report-id-badge">#{{ item.id }}</div>
                            <div class="report-user">{{ item.user?.full_name ?? 'ناشناس' }}</div>
                            <span class="badge bg-info">
                                {{ statuses.find((s) => s.id == item.status)?.label }}
                            </span>
                        </div>

                        <div class="report-card-body">
                            <div class="report-info-row">
                                <i class="bi bi-phone"></i>
                                <span class="info-label">موبایل:</span>
                                <span class="info-value">{{ item.user ? item.user.mobile : '-' }}</span>
                            </div>
                            <div class="report-info-row">
                                <i class="bi bi-car-front"></i>
                                <span class="info-label">خودرو:</span>
                                <span class="info-value">{{ item.car?.name ?? '-' }}</span>
                            </div>
                            <div class="report-info-row">
                                <i class="bi bi-bag"></i>
                                <span class="info-label">طرح فروش:</span>
                                <span class="info-value">{{ item.sale_plan?.title ?? '-' }}</span>
                            </div>
                            <div class="report-info-row">
                                <i class="bi bi-calendar"></i>
                                <span class="info-label">تاریخ ثبت:</span>
                                <span class="info-value">{{ new Date(item.created_at).toLocaleDateString("fa") }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- حالت خالی -->
                    <div v-if="!carsRequest.data || carsRequest.data.length === 0" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        <p>درخواستی یافت نشد</p>
                    </div>
                </div>

                <b-pagination v-model="carsRequest.current_page" :total-rows="carsRequest.total"
                    :per-page="carsRequest.per_page" align="center" class="mt-3 pagination-responsive"
                    @Update:modelValue="changePage" />
            </div>
        </b-card>
    </b-container>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { useRouter, useRoute } from "vue-router"
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
const route = useRoute();
const router = useRouter();
const carsRequest = ref({ data: [] });
const loading = ref(false);
const page = ref(1);

const filters = reactive({
    car_id: null,
    min_price: "",
    max_price: "",
    user_name: "",
    start_date: "",
    end_date: "",
    status: "",
});
function changePage(p) {
    router.replace({ name: route.name, query: { page: p } })
    page.value = p;
    fetchData();
}
const statuses = ref([
    { id: "", label: "همه" },
    { id: "pending", label: 'در حال بررسی' },
    { id: "pre_registration", label: 'پیش ثبت نام' },
    { id: "invitation_to_attend", label: 'مراجعه حضوری' },
    { id: "delivered", label: 'تحویل شده' },
]);
let options = ref([]);
const loadCars = async (searchQuery) => {
    try {
        const { data } = await axios.get('/cars?search=' + searchQuery ?? '')
        const ops = data.data.map(car => ({ id: car.id, label: `${car.name} (${car.brand?.title})` }))
        options.value = ops
    } catch (e) {
        console.log(e);
        toast.error('خطا در جستجوی ماشین ها')
    }
}

const fields = [
    { key: "id", label: "شناسه" },
    { key: "user", label: "نام متقاضی" },
    { key: "mobile", label: "موبایل متقاضی" },

    { key: "car", label: "نام ماشین" },
    { key: "salePlan", label: "طرح فروش" },
    { key: "status", label: "وضعیت" },
    { key: "created_at", label: "تاریخ ثبت" },
];

const fetchData = async () => {
    loading.value = true;
    try {
        const { data } = await axios.get("/reports/car-request", {
            params: { ...filters, page: page.value },
        });
        carsRequest.value = data;

    } finally {
        loading.value = false;
    }
};

const getExcel = async () => {
    loading.value = true;
    try {
        const response = await axios.get('reports/car-request/excel', {
            headers: {
                Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
            params: {...filters},
            responseType: "blob",
            onDownloadProgress: (progressEvent) => {
                let percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
            },
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "output.xlsx");
        document.body.appendChild(link);
        link.click();
    } finally {
        loading.value = false;
    }
};

let saleplanes = ref([]);
async function fetchInit() {
    const response = await axios.get("/sales-plan");
    saleplanes.value = response.data.data;

}
onMounted(() => {
    page.value = route.query.page ?? 1;
    fetchData();
    fetchInit()
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
    font-size: 1.5rem;
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

.filter-card .card-body {
    padding: 16px;
}

.filter-actions {
    margin-top: 4px;
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
    font-size: 0.85rem;
}

.table tbody td {
    vertical-align: middle;
    font-size: 0.85rem;
}

.badge {
    font-size: 0.75rem;
    padding: 0.35rem 0.6rem;
}

/* ===== کارت‌های موبایل ===== */
.report-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.report-card {
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}

.report-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.report-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.report-id-badge {
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    flex-shrink: 0;
}

.report-user {
    font-weight: 700;
    color: #2d3436;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
}

.report-card-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.report-info-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.85rem;
}

.report-info-row i {
    color: #6c5ce7;
    font-size: 0.95rem;
    width: 18px;
    text-align: center;
    flex-shrink: 0;
    margin-top: 2px;
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
        justify-content: center;
        text-align: center;
        width: 100%;
    }

    .filter-btn {
        width: 100%;
    }

    .search-input {
        padding: 8px 10px;
        font-size: 0.9rem;
    }
}

/* ========================================= */
/* ===== موبایل کوچک (کمتر از 400px) ===== */
/* ========================================= */
@media (max-width: 399.98px) {
    .page-title {
        font-size: 1rem;
    }

    .report-card {
        padding: 12px;
    }

    .report-user {
        font-size: 0.85rem;
    }

    .report-info-row {
        font-size: 0.78rem;
    }

    .badge {
        font-size: 0.7rem;
        padding: 0.3rem 0.5rem;
    }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
    .report-cards {
        display: none;
    }
}
</style>