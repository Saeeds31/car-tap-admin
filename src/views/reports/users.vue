<template>
    <b-container fluid class="py-3 py-md-4 px-2 px-md-3">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3 header-row">
            <h2 class="mb-0 page-title">گزارش کاربران</h2>
            <b-spinner small v-if="loading"></b-spinner>
        </div>

        <b-card class="mb-4 filter-card">
            <b-form @submit.prevent="fetchData">
                <b-row class="g-2">
                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="نام و نام خانوادگی">
                            <b-form-input v-model="filters.full_name" class="search-input"></b-form-input>
                        </b-form-group>
                    </b-col>

                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="شماره تماس">
                            <b-form-input v-model="filters.mobile" class="search-input"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col cols="12" sm="6" md="3">
                        <b-form-group label="کدملی">
                            <b-form-input v-model="filters.national_code" class="search-input"></b-form-input>
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

        <b-card v-if="users">
            <div class="card-body p-2 p-md-3">
                <!-- ===== نمایش جدول در دسکتاپ ===== -->
                <div class="d-none d-md-block">
                    <b-table :items="users.data" :fields="fields" striped hover small responsive>
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
                        v-for="item in users.data"
                        :key="item.id"
                        class="report-card"
                    >
                        <div class="report-card-header">
                            <div class="report-id-badge">#{{ item.id }}</div>
                            <div class="report-name">{{ item.full_name }}</div>
                        </div>

                        <div class="report-card-body">
                            <div class="report-info-row">
                                <i class="bi bi-phone"></i>
                                <span class="info-label">شماره تماس:</span>
                                <span class="info-value">{{ item.mobile ?? '-' }}</span>
                            </div>
                            <div class="report-info-row">
                                <i class="bi bi-person-vcard"></i>
                                <span class="info-label">کدملی:</span>
                                <span class="info-value">{{ item.national_code ?? '-' }}</span>
                            </div>
                            <div class="report-info-row">
                                <i class="bi bi-calendar"></i>
                                <span class="info-label">تاریخ ثبت نام:</span>
                                <span class="info-value">{{ new Date(item.created_at).toLocaleDateString("fa") }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- حالت خالی -->
                    <div v-if="!users.data || users.data.length === 0" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        <p>کاربری یافت نشد</p>
                    </div>
                </div>

                <b-pagination v-model="page" :total-rows="users.total" :per-page="users.per_page" align="center"
                    class="mt-3 pagination-responsive" @change="fetchData" />
            </div>
        </b-card>
    </b-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";

const users = ref({ data: [] });
const loading = ref(false);
const page = ref(1);

const filters = reactive({
    full_name: "",
    mobile: "",
    national_code: "",
    start_date: "",
    end_date: "",
});

const fields = [
    { key: "id", label: "شناسه" },
    { key: "full_name", label: "کاربر" },
    { key: "mobile", label: "شماره تماس" },
    { key: "national_code", label: "کدملی" },
    { key: "created_at", label: "تاریخ ثبت نام" },
];

const fetchData = async () => {
    loading.value = true;
    try {
        const { data } = await axios.get("/reports/users", {
            params: { ...filters, page: page.value },
        });
        users.value = data;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
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
    direction: ltr;
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