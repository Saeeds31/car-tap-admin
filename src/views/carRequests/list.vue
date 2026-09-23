<template>
    <b-container fluid class="py-3 py-md-4 px-2 px-md-3">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3 header-row">
            <h2 class="mb-0 page-title">
                لیست درخواست های آماده
            </h2>
            <b-spinner small v-if="loading"></b-spinner>
        </div>

        <b-card class="mb-4 filter-card">
            <b-form @submit.prevent="fetchData">
                <b-row class="g-2">
                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="نام خودرو">
                            <b-form-input v-model="filters.car_name" class="search-input"></b-form-input>
                        </b-form-group>
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
                        <b-form-group label="وضعیت :">
                            <select name="" class="form-control" v-model="filters.sale_plan_id" id="">
                                <option v-for="(item, index) in statuses" :key="index" :value="item.id">
                                    {{ item.label }}
                                </option>
                            </select>
                        </b-form-group>
                    </b-col>

                </b-row>
                <b-button type="submit" variant="primary" class="w-100 w-sm-auto filter-btn">
                    <i class="bi bi-funnel me-1"></i>
                    اعمال فیلتر
                </b-button>
            </b-form>
        </b-card>

        <b-card>
            <div class="card-body p-2 p-md-3">
                <!-- ===== نمایش جدول در دسکتاپ ===== -->
                <div class="d-none d-md-block">
                    <b-table :items="carsRequest.data" :fields="fields" striped hover bordered small responsive>

                        <template #cell(user)="data">
                            <span>
                                {{ data.item.user ? data.item.user.full_name : data.item.user.mobile }}
                            </span>
                        </template>

                        <template #cell(mobile)="data">
                            <span>
                                {{ data.item.user ? data.item.user.mobile : "-" }}
                            </span>
                        </template>
                        <template #cell(car)="data">
                            <span>
                                {{ data.item.car?.name }}
                            </span>
                        </template>

                        <template #cell(total_accepted_amount)="data">
                            <span>
                                {{ Number(data.item?.total_accepted_amount).toLocaleString('fa') }}
                            </span>
                        </template>

                        <template #cell(salePlan)="data">
                            <span>
                                {{ data.item.sale_plan?.title }}
                            </span>
                        </template>
                        <template #cell(created_at)="data">
                            <span>
                                {{ new Date(data.item.created_at).toLocaleString("fa") }}
                            </span>
                        </template>
                        <template #cell(status)="data">
                            <span>
                                {{
                                    statuses.find((s) => s.id == data.item.status)?.label
                                }}
                            </span>
                        </template>
                        <template #cell(handler)="data">
                            <div class="d-flex flex-column gap-2">
                                <button class="btn btn-primary btn-sm" @click="changeStatus(data.item)">
                                    تغییر وضعیت
                                </button>
                                <button class="btn btn-info btn-sm" @click="changeCar(data.item)">
                                    تغییر خودرو
                                </button>
                            </div>

                        </template>
                    </b-table>
                </div>

                <!-- ===== نمایش کارتی در موبایل ===== -->
                <div class="d-md-none request-cards">
                    <div
                        v-for="item in carsRequest.data"
                        :key="item.id"
                        class="request-card"
                    >
                        <div class="request-card-header">
                            <div class="request-id-badge">#{{ item.id }}</div>
                            <div class="request-user">
                                {{ item.user ? item.user.full_name : (item.user?.mobile ?? 'ناشناس') }}
                            </div>
                            <span class="badge bg-info">
                                {{ statuses.find((s) => s.id == item.status)?.label }}
                            </span>
                        </div>

                        <div class="request-card-body">
                            <div class="request-info-row">
                                <i class="bi bi-phone"></i>
                                <span class="info-label">موبایل:</span>
                                <span class="info-value">{{ item.user ? item.user.mobile : "-" }}</span>
                            </div>
                            <div class="request-info-row">
                                <i class="bi bi-car-front"></i>
                                <span class="info-label">خودرو:</span>
                                <span class="info-value">{{ item.car?.name ?? '-' }}</span>
                            </div>
                            <div class="request-info-row">
                                <i class="bi bi-bag"></i>
                                <span class="info-label">طرح فروش:</span>
                                <span class="info-value">{{ item.sale_plan?.title ?? '-' }}</span>
                            </div>
                            <div class="request-info-row">
                                <i class="bi bi-cash-stack"></i>
                                <span class="info-label">جمع واریزی:</span>
                                <span class="info-value">{{ Number(item?.total_accepted_amount).toLocaleString('fa') }} تومان</span>
                            </div>
                            <div class="request-info-row">
                                <i class="bi bi-calendar"></i>
                                <span class="info-label">تاریخ ثبت:</span>
                                <span class="info-value">{{ new Date(item.created_at).toLocaleString("fa") }}</span>
                            </div>
                        </div>

                        <div class="request-card-actions">
                            <button class="btn btn-primary btn-sm flex-fill" @click="changeStatus(item)">
                                <i class="bi bi-arrow-repeat"></i>
                                <span>تغییر وضعیت</span>
                            </button>
                            <button class="btn btn-info btn-sm flex-fill" @click="changeCar(item)">
                                <i class="bi bi-car-front"></i>
                                <span>تغییر خودرو</span>
                            </button>
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

        <Modal v-if="changeStatusModal" id="changeStatusModal" @closeModal="() => changeStatusModal = false"
            title="تغییر وضعیت">
            <b-form-group class="col-md-12" label="انتخاب وضعیت" label-for="permission_ids">
                <select class="form-control" name="" v-model="selectedStatus" id="">
                    <option v-for="(item, index) in statusesModel" :key="index" :value="item.id">
                        {{ item.label }}
                    </option>
                </select>
            </b-form-group>
            <button :disabled="loading" @click="changeStatusRequest()" class="btn btn-success">
                ذخیره تغییرات
            </button>
        </Modal>
        <Modal v-if="changeCarModal" id="changeCarModal" @closeModal="() => changeCarModal = false" title="تغییر خودرو">

            <div class="col-md-12">
                <label class="form-label">انتخاب ماشین</label>
                <Treeselect :options="options" :normalizer="normalizer" v-model="selectedCar" :multiple="false"
                    @search-change="loadCars" placeholder="جستجوی ماشین..." :searchable="true" />
            </div>
            <button :disabled="loading" @click="changeCarRequest()" class="btn btn-success mt-4">
                ذخیره تغییرات
            </button>
        </Modal>
    </b-container>
</template>

<script setup>
import Modal from "@/components/shared/modal.vue";
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
const normalizer = (node) => {
    return {
        id: node.id,
        label: node.name,
    }
}
const route = useRoute();
const router = useRouter();
let changeStatusModal = ref(false);
let changeCarModal = ref(false);
let selectedStatus = ref();
let selectedItem = ref(null);
const carsRequest = ref({ data: [] });
const loading = ref(false);
const page = ref(1);
function changeStatus(item) {
    selectedItem.value = item;
    selectedStatus.value = item.status;
    changeStatusModal.value = true;
}
let selectedCar = ref(null);
let options = ref([]);
async function changeCarRequest() {
    loading.value = true;
    try {
        const formData = new FormData();
        formData.append('car_id', selectedCar.value)
        formData.append('_method', "PUT")
        const { data } = await axios.post(`/car-requests/${selectedItem.value.id}`, formData);
        toast.success(data.message);
        changeCarModal.value = false;
    }
    catch (error) {
        toast.error(error.response.data.message)
    }
    finally {
        loading.value = false;
    }
}
function changeCar(item) {
    changeCarModal.value = true;
    selectedItem.value = item;
    selectedCar.value = item.car.id;
    options.value = [item.car]
}
const loadCars = async (searchQuery) => {
    console.log(searchQuery);
    try {
        const { data } = await axios.get('/cars?search=' + searchQuery ?? '')
        const ops = data.data;
        options.value = ops
    } catch (e) {
        console.log(e);
        toast.error('خطا در جستجوی کاربران')
    }
}
let statusesModel = ref(
    [
        {
            id: 'pending',
            label: 'در حال بررسی'
        },

        {
            id: 'pre_registration',
            label: 'پیش ثبت نام'
        },

        {
            id: 'invitation_to_attend',
            label: 'مراجعه حضوری'
        },

        {
            id: 'delivered',
            label: 'تحویل شده'
        },
    ]
);
const filters = reactive({
    car_name: "",
    min_price: "",
    max_price: "",
    user_name: "",
    start_date: "",
    end_date: "",
    status: "",
});

const statuses = ref([
    { id: "", label: "همه" },
    { id: "pending", label: 'در حال بررسی' },
    { id: "pre_registration", label: 'پیش ثبت نام' },
    { id: "invitation_to_attend", label: 'مراجعه حضوری' },
    { id: "delivered", label: 'تحویل شده' },
]);

const fields = [
    { key: "id", label: "شناسه" },
    { key: "user", label: "نام متقاضی" },
    { key: "mobile", label: "شماره تماس" },
    { key: "car", label: "نام ماشین" },
    { key: "salePlan", label: "طرح فروش" },
    { key: "total_accepted_amount", label: "جمه واریزی به تومان" },

    { key: "status", label: "وضعیت" },
    { key: "created_at", label: "تاریخ ثبت" },
    { key: "handler", label: "تغییرات" },
];
async function changeStatusRequest() {

    loading.value = true;
    try {
        const formData = new FormData();
        formData.append('status', selectedStatus.value)
        const { data } = await axios.post(`/car-requests/${selectedItem.value.id}/change-status`, formData);
        toast.success(data.message);
        changeStatusModal.value = false;
    }
    catch (error) {
        toast.error(error.response.data.message)
    }
    finally {
        loading.value = false;
    }
}
const fetchData = async () => {
    loading.value = true;
    try {
        const { data } = await axios.get("/car-requests", {
            params: { ...filters, page: page.value },
        });
        carsRequest.value = data;
    } finally {
        loading.value = false;
    }
};
function changePage(p) {
    router.replace({ name: route.name, query: { page: p } })
    page.value = p;
    fetchData();
}
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
    display: flex;
    align-items: center;
    gap: 8px;
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

/* ===== کارت‌های موبایل ===== */
.request-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.request-card {
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}

.request-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.request-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.request-id-badge {
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    flex-shrink: 0;
}

.request-user {
    font-weight: 700;
    color: #2d3436;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
}

.request-card-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
}

.request-info-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.85rem;
}

.request-info-row i {
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

.request-card-actions {
    display: flex;
    gap: 6px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
}

.request-card-actions .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 0.75rem;
    padding: 6px 8px;
    white-space: nowrap;
}

.request-card-actions .btn span {
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

    /* نمایش label دکمه‌ها در موبایل */
    .request-card-actions .btn span {
        display: inline;
    }
}

/* ========================================= */
/* ===== موبایل کوچک (کمتر از 400px) ===== */
/* ========================================= */
@media (max-width: 399.98px) {
    .page-title {
        font-size: 1rem;
    }

    .request-card {
        padding: 12px;
    }

    .request-user {
        font-size: 0.85rem;
    }

    .request-info-row {
        font-size: 0.78rem;
    }

    .request-card-actions .btn {
        font-size: 0.7rem;
        padding: 5px 6px;
    }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
    .request-cards {
        display: none;
    }
}
</style>