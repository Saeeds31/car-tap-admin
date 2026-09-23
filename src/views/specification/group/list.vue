<template>
    <div class="container mt-3 mt-md-4 px-2 px-md-3">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3 header-row">
            <h3 class="mb-0 page-title">لیست گروه ها</h3>
            <router-link v-if="checkPermission(['specification_group_store'])" to="/specification/group/create"
                class="btn btn-primary add-btn">
                <i class="bi bi-plus"></i>
                <span>افزودن گروه</span>
            </router-link>
        </div>

        <!-- ===== نمایش جدول در دسکتاپ ===== -->
        <div class="card d-none d-md-block">
            <div class="card-body p-2 p-md-3">
                <b-table class="table table-striped table-hover mb-0" striped hover :items="groups.data" :fields="fields">
                    <template #cell(actions)="data">
                        <div class="d-flex flex-wrap gap-1">
                            <router-link v-if="checkPermission(['specification_group_update'])"
                                :to="`/specification/group/${data.item.id}/edit`" class="btn btn-sm btn-warning">
                                <i class="bi bi-pen"></i>
                                <span>ویرایش</span>
                            </router-link>
                            <button v-if="checkPermission(['specification_group_delete'])" class="btn btn-sm btn-danger"
                                @click="confirmDelete(data.item.id)">
                                <i class="bi bi-trash3-fill"></i>
                                <span>حذف</span>
                            </button>
                        </div>
                    </template>
                </b-table>
            </div>
        </div>

        <!-- ===== نمایش کارتی در موبایل ===== -->
        <div class="card d-md-none">
            <div class="card-body p-2">
                <div class="group-cards">
                    <div
                        v-for="group in groups.data"
                        :key="group.id"
                        class="group-card"
                    >
                        <div class="group-card-header">
                            <div class="group-id-badge">#{{ group.id }}</div>
                            <div class="group-title">{{ group.title }}</div>
                        </div>

                        <div class="group-card-actions">
                            <router-link v-if="checkPermission(['specification_group_update'])"
                                :to="`/specification/group/${group.id}/edit`" class="btn btn-sm btn-warning flex-fill">
                                <i class="bi bi-pen"></i>
                                <span>ویرایش</span>
                            </router-link>
                            <button v-if="checkPermission(['specification_group_delete'])" class="btn btn-sm btn-danger flex-fill"
                                @click="confirmDelete(group.id)">
                                <i class="bi bi-trash3-fill"></i>
                                <span>حذف</span>
                            </button>
                        </div>
                    </div>

                    <!-- حالت خالی -->
                    <div v-if="!groups.data || groups.data.length === 0" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        <p>گروهی یافت نشد</p>
                    </div>
                </div>
            </div>
        </div>

        <b-pagination v-model="currentPage" :total-rows="groups.total" v-if="groups.last_page != 1"
            :per-page="groups.per_page" @Update:modelValue="fetchgroups" align="center"
            class="mt-3 pagination-responsive"></b-pagination>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRoute, useRouter } from 'vue-router'
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
let router = useRouter();
let route = useRoute();
const groups = ref({
    data: [],
    total: 0,
    per_page: 10,
    current_page: 1,
})
const currentPage = ref(1)

const fields = [
    { key: 'id', label: 'شناسه' },
    { key: 'title', label: 'عنوان' },
    { key: 'actions', label: 'عملیات' },
]

const fetchgroups = async (page = 1) => {
    try {
        router.replace({ name: route.name, query: { page: page } })
        const res = await axios.get(`/specifications-group?page=${page}`)
        groups.value = res.data.data
        currentPage.value = res.data.data.current_page
    } catch (error) {
        console.error(error)
    }
}

const confirmDelete = (id) => {
    Swal.fire({
        title: 'آیا مطمئن هستید?',
        text: "این عملیات بدون بازگشت است!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'بله پاک شود!',
    }).then((result) => {
        if (result.isConfirmed) {
            deleteGroup(id)
        }
    })
}

const deleteGroup = async (id) => {
    try {
        await axios.delete(`/specifications-group/${id}`)
        Swal.fire('حذف شد!', 'گروه با موفقیت حذف شد', 'success')
        fetchgroups(currentPage.value)
    } catch (error) {
        Swal.fire('خطا!', 'این گروه قابل حذف نیست', 'error')
    }
}

onMounted(() => {
    fetchgroups()
})


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
.group-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.group-card {
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}

.group-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.group-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 10px;
}

.group-id-badge {
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    flex-shrink: 0;
}

.group-title {
    font-weight: 700;
    color: #2d3436;
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.group-card-actions {
    display: flex;
    gap: 6px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
}

.group-card-actions .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 0.75rem;
    padding: 6px 8px;
    white-space: nowrap;
}

.group-card-actions .btn span {
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
        text-align: center;
        width: 100%;
    }

    .add-btn {
        width: 100%;
    }

    /* نمایش label دکمه‌ها در موبایل */
    .group-card-actions .btn span {
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

    .group-card {
        padding: 12px;
    }

    .group-title {
        font-size: 0.9rem;
    }

    .group-card-actions .btn {
        font-size: 0.7rem;
        padding: 5px 6px;
    }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
    .group-cards {
        display: none;
    }
}
</style>