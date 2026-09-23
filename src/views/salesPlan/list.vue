<template>
    <div class="users-page container mt-3 mt-md-4 px-2 px-md-3">
        <!-- Header -->
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3 header-row">
            <h4 class="mb-0 page-title">مدیریت طرح های فروش</h4>
            <router-link v-if="checkPermission(['salesplan_store'])" to="/sales-plan/create" class="btn btn-primary add-btn">
                <i class="bi bi-plus"></i>
                <span>افزودن طرح</span>
            </router-link>
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
                                    <th>نام طرح</th>
                                    <th>از تاریخ</th>
                                    <th>تا تاریخ</th>
                                    <th v-if="checkPermission(['salesplan_cars'])">ماشین ها</th>
                                    <th>عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in saleplanes.data" :key="item.id">
                                    <td>{{ item.id }}</td>
                                    <td>{{ item.title }}</td>
                                    <td>{{ new Date(item.start_date).toLocaleDateString('fa') }}</td>
                                    <td>{{ new Date(item.end_date).toLocaleDateString('fa') }}</td>
                                    <td>
                                        <router-link v-if="checkPermission(['salesplan_cars'])"
                                            :to="`/sales-plan/cars/${item.id}`"></router-link>
                                    </td>
                                    <td>

                                        <div class="d-flex flex-wrap gap-1">
                                            <router-link v-if="checkPermission(['salesplan_update'])"
                                                :to="`/sales-plan/${item.id}/edit`" class="btn btn-sm btn-warning">
                                                <i class="bi bi-pen"></i>
                                                <span>ویرایش</span>
                                            </router-link>
                                            <button class="btn btn-sm btn-danger" v-if="checkPermission(['salesplan_delete'])"
                                                @click="deleteSales(item.id)">
                                                <i class="bi bi-trash3-fill"></i>
                                                <span>حذف</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- ===== نمایش کارتی در موبایل ===== -->
                    <div class="d-md-none salesplan-cards">
                        <div
                            v-for="item in saleplanes.data"
                            :key="item.id"
                            class="salesplan-card"
                        >
                            <div class="salesplan-card-header">
                                <div class="salesplan-id-badge">#{{ item.id }}</div>
                                <div class="salesplan-title">{{ item.title }}</div>
                            </div>

                            <div class="salesplan-card-body">
                                <div class="salesplan-info-row">
                                    <i class="bi bi-calendar-plus"></i>
                                    <span class="info-label">از تاریخ:</span>
                                    <span class="info-value">{{ new Date(item.start_date).toLocaleDateString('fa') }}</span>
                                </div>
                                <div class="salesplan-info-row">
                                    <i class="bi bi-calendar-x"></i>
                                    <span class="info-label">تا تاریخ:</span>
                                    <span class="info-value">{{ new Date(item.end_date).toLocaleDateString('fa') }}</span>
                                </div>
                            </div>

                            <div class="salesplan-card-actions">
                                <router-link v-if="checkPermission(['salesplan_update'])"
                                    :to="`/sales-plan/${item.id}/edit`" class="btn btn-sm btn-warning flex-fill">
                                    <i class="bi bi-pen"></i>
                                    <span>ویرایش</span>
                                </router-link>
                                <button class="btn btn-sm btn-danger flex-fill" v-if="checkPermission(['salesplan_delete'])"
                                    @click="deleteSales(item.id)">
                                    <i class="bi bi-trash3-fill"></i>
                                    <span>حذف</span>
                                </button>
                            </div>
                        </div>

                        <!-- حالت خالی -->
                        <div v-if="!saleplanes.data || saleplanes.data.length === 0" class="text-center py-5 text-muted">
                            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                            <p>طرحی یافت نشد</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRoute, useRouter } from "vue-router";
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
const router = useRouter();
const route = useRoute();
const saleplanes = ref({ data: [] });
const loading = ref(false);
const filters = ref({ search: "" });

const getSales = async () => {
    loading.value = true;
    try {
        const response = await axios.get("/sales-plan");
        saleplanes.value = response.data;
    } finally {
        loading.value = false;
    }
};
onMounted(() => {
    getSales();
});

const deleteSales = (id) => {
    Swal.fire({
        title: "حذف طرح",
        text: "آیا مطمئن هستید؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "بله، حذف شود",
        cancelButtonText: "انصراف",
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`/sales-plan/${id}`);
                Swal.fire("موفق", "طرح حذف شد", "success");
                getSales();
            } catch (err) {
                Swal.fire("خطا", "مشکلی در حذف پیش آمد", "error");
            }
        }
    });
};

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

.add-btn {
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    justify-content: center;
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

/* ===== کارت‌های موبایل ===== */
.salesplan-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.salesplan-card {
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}

.salesplan-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.salesplan-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 10px;
}

.salesplan-id-badge {
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    flex-shrink: 0;
}

.salesplan-title {
    font-weight: 700;
    color: #2d3436;
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.salesplan-card-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
}

.salesplan-info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
}

.salesplan-info-row i {
    color: #6c5ce7;
    font-size: 0.95rem;
    width: 18px;
    text-align: center;
    flex-shrink: 0;
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

.salesplan-card-actions {
    display: flex;
    gap: 6px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
}

.salesplan-card-actions .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 0.75rem;
    padding: 6px 8px;
    white-space: nowrap;
}

.salesplan-card-actions .btn span {
    display: none;
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

    /* نمایش label دکمه‌ها در موبایل */
    .salesplan-card-actions .btn span {
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

    .salesplan-card {
        padding: 12px;
    }

    .salesplan-title {
        font-size: 0.9rem;
    }

    .salesplan-info-row {
        font-size: 0.78rem;
    }

    .salesplan-card-actions .btn {
        font-size: 0.7rem;
        padding: 5px 6px;
    }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
    .salesplan-cards {
        display: none;
    }
}
</style>