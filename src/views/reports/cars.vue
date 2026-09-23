<template>
    <b-container fluid class="py-3 py-md-4 px-2 px-md-3">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3 header-row">
            <h2 class="mb-0 page-title">گزارش خودرو</h2>
            <b-spinner small v-if="loading"></b-spinner>
        </div>

        <b-card class="mb-4 filter-card">
            <b-form @submit.prevent="fetchData">
                <b-row class="g-2">
                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="نام">
                            <b-form-input v-model="filters.name" class="search-input"></b-form-input>
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
                        <b-form-group label="برند">
                            <select class="form-control" name="" v-model="filters.brand_id" id="">
                                <option value="">بدون انتخاب</option>
                                <option v-for="(brand, index) in brands" :key="index" :value="brand.id">
                                    {{ brand.title }}
                                </option>
                            </select>
                        </b-form-group>
                    </b-col>
                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="دسته بندی ها">
                            <select name="" class="form-control" v-model="filters.category_id" id="">
                                <option value="">بدون انتخاب</option>
                                <option v-for="(category, index) in categories" :key="index" :value="category.id">
                                    {{ category.title }}
                                </option>
                            </select>
                        </b-form-group>
                    </b-col>

                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="از تاریخ">
                            <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD"
                                v-model="filters.start_date" />
                        </b-form-group>
                    </b-col>

                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="تا تاریخ">
                            <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD"
                                v-model="filters.end_date" />
                        </b-form-group>
                    </b-col>

                </b-row>
                <div class="d-flex flex-column flex-sm-row gap-2 filter-actions">
                    <b-button type="submit" variant="primary" class="filter-btn">
                        <i class="bi bi-funnel me-1"></i>
                        اعمال فیلتر
                    </b-button>
                </div>
            </b-form>
        </b-card>

        <b-card>
            <div class="card-body p-2 p-md-3">
                <!-- ===== نمایش جدول در دسکتاپ ===== -->
                <div class="d-none d-md-block">
                    <b-table v-if="cars" :items="cars.data" :fields="fields" striped hover small responsive>

                        <template #cell(price)="data">
                            <span>
                                {{ Number(data.item.price).toLocaleString('fa') }}
                            </span>
                        </template>

                        <template #cell(brand)="data">
                            <span>
                                {{ data.item.brand?.title }}
                            </span>
                        </template>
                        <template #cell(category)="data">
                            <span>
                                {{ data.item.category?.title }}
                            </span>
                        </template>

                        <template #cell(created_at)="data">
                            <span>
                                {{ new Date(data.item.created_at).toLocaleDateString("fa") }}
                            </span>
                        </template>

                    </b-table>
                </div>

                <!-- ===== نمایش کارتی در موبایل ===== -->
                <div class="d-md-none report-cards">
                    <div
                        v-for="item in cars.data"
                        :key="item.id"
                        class="report-card"
                    >
                        <div class="report-card-header">
                            <div class="report-id-badge">#{{ item.id }}</div>
                            <div class="report-name">{{ item.name }}</div>
                        </div>

                        <div class="report-card-body">
                            <div class="report-info-row">
                                <i class="bi bi-cash-stack"></i>
                                <span class="info-label">قیمت:</span>
                                <span class="info-value">{{ Number(item.price).toLocaleString('fa') }} تومان</span>
                            </div>
                            <div class="report-info-row">
                                <i class="bi bi-tag"></i>
                                <span class="info-label">دسته بندی:</span>
                                <span class="info-value">{{ item.category?.title ?? '-' }}</span>
                            </div>
                            <div class="report-info-row">
                                <i class="bi bi-bing"></i>
                                <span class="info-label">برند:</span>
                                <span class="info-value">{{ item.brand?.title ?? '-' }}</span>
                            </div>
                            <div class="report-info-row">
                                <i class="bi bi-calendar"></i>
                                <span class="info-label">تاریخ ثبت:</span>
                                <span class="info-value">{{ new Date(item.created_at).toLocaleDateString("fa") }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- حالت خالی -->
                    <div v-if="!cars.data || cars.data.length === 0" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        <p>خودرویی یافت نشد</p>
                    </div>
                </div>

                <b-pagination v-model="page" :total-rows="cars.total" :per-page="cars.per_page" align="center"
                    class="mt-3 pagination-responsive" @change="fetchData" />
            </div>
        </b-card>
    </b-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";

const cars = ref({ data: [] });
const loading = ref(false);
const page = ref(1);

const filters = reactive({
    name: "",
    min_price: "",
    max_price: "",
    brand_id: "",
    category_id: "",
    start_date: "",
    end_date: "",
});

const fields = [
    { key: "id", label: "شناسه" },
    { key: "name", label: "نام ماشین" },
    { key: "price", label: "قیمت" },
    { key: "category", label: "دسته بندی" },
    { key: "brand", label: "برند" },
    { key: "created_at", label: "تاریخ ثبت" },
];

const fetchData = async () => {
    loading.value = true;
    try {
        const { data } = await axios.get("/reports/cars", {
            params: { ...filters, page: page.value },
        });
        cars.value = data;
    } finally {
        loading.value = false;
    }
};
let brands = ref([]);
let categories = ref([]);
async function fetchinit() {
    let res = await axios.get("/brands");
    brands.value = res.data.data.data;
    let res2 = await axios.get("/categories");
    categories.value = res2.data.data.data;
}
onMounted(() => {
    fetchData();
    fetchinit()
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
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 10px;
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

.report-name {
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

    .report-name {
        font-size: 0.85rem;
    }

    .report-info-row {
        font-size: 0.78rem;
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