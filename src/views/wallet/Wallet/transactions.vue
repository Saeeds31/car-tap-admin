<template>
    <div class="wallets-page container mt-3 mt-md-4 px-2 px-md-3">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3 header-row">
            <h4 class="mb-0 page-title">تراکنش های کیف پول‌ها</h4>
        </div>

        <!-- فیلتر -->
        <div class="card mb-3 header-card">
            <div class="card-body row g-2">
                <b-form-group class="col-12 col-sm-6 col-md-4" label="از تاریخ ">
                    <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" v-model="filters.start_date" />
                </b-form-group>
                <b-form-group class="col-12 col-sm-6 col-md-4" label="تا تاریخ ">
                    <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" v-model="filters.end_date" />
                </b-form-group>
                <b-form-group class="col-12 col-sm-6 col-md-4" label="مبلغ ">
                    <b-form-input v-model="filters.amount" type="text" class="search-input"
                        placeholder="جستجو بر اساس حداقل مبلغ تراکنش  " />
                </b-form-group>
                <div class="col-12 d-flex align-items-end">
                    <b-button @click="getWallets()" class="filter-btn">
                        <i class="bi bi-funnel me-1"></i>
                        فیلتر سازی
                    </b-button>
                </div>
            </div>
        </div>

        <!-- جدول -->
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
                                    <th>کاربر</th>
                                    <th>مبلغ(تومان)</th>
                                    <th>عملیات</th>
                                    <th>توضیحات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in walletTransactions.data" :key="item.id">
                                    <td>{{ item.id }}</td>
                                    <td>{{ item.wallet?.user?.full_name }}</td>
                                    <td>{{ Number(item.amount).toLocaleString() }}</td>
                                    <td>
                                        <span :class="item.type == 'credit' ? 'badge bg-success' : 'badge bg-danger'">
                                            {{ item.type == 'credit' ? "افزایش" : "کاهش" }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="transaction-desc">{{ item.description }}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- ===== نمایش کارتی در موبایل ===== -->
                    <div class="d-md-none transaction-cards">
                        <div
                            v-for="item in walletTransactions.data"
                            :key="item.id"
                            class="transaction-card"
                        >
                            <div class="transaction-card-header">
                                <div class="transaction-id-badge">#{{ item.id }}</div>
                                <div class="transaction-user">{{ item.wallet?.user?.full_name ?? '-' }}</div>
                                <span :class="item.type == 'credit' ? 'badge bg-success' : 'badge bg-danger'">
                                    {{ item.type == 'credit' ? "افزایش" : "کاهش" }}
                                </span>
                            </div>

                            <div class="transaction-card-body">
                                <div class="transaction-info-row">
                                    <i class="bi bi-cash-stack"></i>
                                    <span class="info-label">مبلغ:</span>
                                    <span class="info-value">{{ Number(item.amount).toLocaleString() }} تومان</span>
                                </div>
                                <div class="transaction-info-row" v-if="item.description">
                                    <i class="bi bi-chat-left-text"></i>
                                    <span class="info-label">توضیحات:</span>
                                    <span class="info-value">{{ item.description }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- حالت خالی -->
                        <div v-if="!walletTransactions.data || walletTransactions.data.length === 0" class="text-center py-5 text-muted">
                            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                            <p>تراکنشی یافت نشد</p>
                        </div>
                    </div>

                    <b-pagination v-model="currentPage" :total-rows="walletTransactions.total"
                        v-if="walletTransactions.last_page != 1" :per-page="walletTransactions.per_page"
                        @Update:modelValue="changePage" align="center"
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
import { Modal } from "bootstrap";
import { useRoute, useRouter } from "vue-router";
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
let router = useRouter();
let route = useRoute();
const walletTransactions = ref({ data: [] });
const loading = ref(false);
const filters = ref({
    start_date: "",
    end_date: "",
    amount: ""
});
const currentPage = ref(1);

const modalInstance = ref(null);
const modalTitle = ref("");
const actionType = ref(""); // deposit | withdraw
const selectedWallet = ref(null);
const form = ref({
    amount: "",
    description: "",
});

const getWallets = async (page = 1) => {
    loading.value = true;
    try {
        const response = await axios.get("/transactions", {
            params: {
                page,
                start_date: filters.value.start_date,
                end_date: filters.value.end_date,
                amount: filters.value.amount,
            },
        });
        walletTransactions.value = response.data;
        currentPage.value = page;
    } finally {
        loading.value = false;
    }
};


const changePage = (page) => {
    if (page) {
        router.replace({ name: route.name, query: { page: page } })
        getWallets(page)
    }
    else currentUrl = "/products"
};
const openModal = (wallet, type) => {
    selectedWallet.value = wallet;
    actionType.value = type;
    modalTitle.value = type === "deposit" ? "افزایش موجودی" : "کاهش موجودی";
    form.value.amount = "";
    form.value.description = "";
    modalInstance.value = new Modal(document.getElementById("walletModal"));
    modalInstance.value.show();
};

const submitForm = async () => {
    if (!form.value.amount) {
        Swal.fire("خطا", "لطفاً مبلغ را وارد کنید", "error");
        return;
    }
    let formData = new FormData();
    formData.append("wallet_id", selectedWallet.value.id)
    formData.append("amount", form.value.amount)
    formData.append("description", form.value.description)
    formData.append("type", actionType.value == "deposit" ? 'credit' : 'debit')
    try {
        await axios.post(`/wallets/${selectedWallet.value.id}/transactions`, formData);
        modalInstance.value.hide();
        getWallets(currentPage.value);
        Swal.fire("موفق", "عملیات با موفقیت انجام شد", "success");
    } catch (error) {
        Swal.fire("خطا", "مشکلی رخ داد", "error");
    }
};

onMounted(() => {
    getWallets();
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
    font-size: 1.4rem;
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

.badge {
    font-size: 0.75rem;
    padding: 0.35rem 0.65rem;
}

.transaction-desc {
    max-width: 300px;
    word-wrap: break-word;
}

/* ===== کارت‌های موبایل ===== */
.transaction-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.transaction-card {
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}

.transaction-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.transaction-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.transaction-id-badge {
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    flex-shrink: 0;
}

.transaction-user {
    font-weight: 700;
    color: #2d3436;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
}

.transaction-card-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.transaction-info-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.85rem;
}

.transaction-info-row i {
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
        text-align: center;
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

    .transaction-card {
        padding: 12px;
    }

    .transaction-user {
        font-size: 0.85rem;
    }

    .transaction-info-row {
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
    .transaction-cards {
        display: none;
    }
}
</style>