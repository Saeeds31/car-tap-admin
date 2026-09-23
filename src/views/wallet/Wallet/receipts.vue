<template>
    <div class="wallets-page container mt-3 mt-md-4 px-2 px-md-3">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-3 header-row">
            <h4 class="mb-0 page-title">رسید های واریزی</h4>
        </div>

        <!-- فیلتر -->
        <div class="card mb-3 header-card">
            <div class="card-body row g-2">
                <b-form-group class="col-12 col-sm-6 col-md-3" label="نام کامل">
                    <b-form-input v-model="filters.full_name" type="text" class="search-input" placeholder="جستجو بر اساس نام  " />
                </b-form-group>
                <b-form-group class="col-12 col-sm-6 col-md-3" label="شماره تماس">
                    <b-form-input v-model="filters.mobile" type="text" class="search-input" placeholder="جستجو بر اساس شماره تماس  " />
                </b-form-group>
                <b-form-group class="col-12 col-sm-6 col-md-3" label=" مبلغ واریزی">
                    <b-form-input v-model="filters.amount" type="text" class="search-input" placeholder="جستجو بر اساس  مبلغ واریزی  " />
                </b-form-group>

                <b-form-group class="col-12 col-sm-6 col-md-3" label=" وضعیت">
                    <select v-model="filters.status" class="form-select">
                        <option value="">انتخاب کنید</option>
                        <option value="pending">درحال بررسی</option>
                        <option value="accepted">تایید شده</option>
                        <option value="rejected">رد شده</option>
                    </select>
                </b-form-group>
                <div class="col-12 d-flex align-items-end">
                    <b-button @click="getReceipts()" class="filter-btn">
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
                                    <th>درخواست خودرو</th>
                                    <th>مبلغ خودرو(دلار)</th>
                                    <th>جمع مبلغ تایید شده (تومان)</th>
                                    <th>عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="receipt in receipts.data" :key="receipt.id">
                                    <td>{{ receipt.id }}</td>
                                    <td>{{ receipt.user?.full_name ?? '-' }}</td>
                                    <td>{{ receipt.car?.name ?? '-' }}</td>
                                    <td>{{ receipt.car?.name ?? '-' }}</td>
                                    
                                    <td>{{ Number(receipt.request?.price).toLocaleString("fa") }}</td>
                                    <td>{{ getAcceptedTotal(receipt) }}</td>
                                    <td>
                                        <div class="receipts">
                                            <div v-for="value in receipt.receipts" :key="value.id">
                                                <img width="100" style="cursor: pointer;"
                                                    @click="showOrginalImage(value.image)"
                                                    :src="getReceiptimage(value.image)" alt="">
                                                <span
                                                    :class="{ 'yellow': value.status == 'pending', 'red': value.status == 'rejected', 'green': value.status == 'accepted' }">{{
                                                        getStatusLabel(value.status) }}</span>
                                                <div class="buttons">
                                                    <button v-if="value.status == 'pending'"
                                                        class="btn btn-sm  btn-success me-2"
                                                        @click="acceptReceipt(receipt)">
                                                        تایید
                                                    </button>
                                                    <button v-if="value.status == 'pending'" class="btn btn-sm btn-warning"
                                                        @click="rejecteReceipt(receipt)">
                                                        رد
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>


                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- ===== نمایش کارتی در موبایل ===== -->
                    <div class="d-md-none receipt-cards">
                        <div
                            v-for="receipt in receipts.data"
                            :key="receipt.id"
                            class="receipt-card"
                        >
                            <div class="receipt-card-header">
                                <div class="receipt-id-badge">#{{ receipt.id }}</div>
                                <div class="receipt-user">{{ receipt.user?.full_name ?? '-' }}</div>
                            </div>

                            <div class="receipt-card-body">
                                <div class="receipt-info-row">
                                    <i class="bi bi-car-front"></i>
                                    <span class="info-label">درخواست خودرو:</span>
                                    <span class="info-value">{{ receipt.car?.name ?? '-' }}</span>
                                </div>
                                <div class="receipt-info-row">
                                    <i class="bi bi-cash-stack"></i>
                                    <span class="info-label">مبلغ خودرو (دلار):</span>
                                    <span class="info-value">{{ Number(receipt.request?.price).toLocaleString("fa") }}</span>
                                </div>
                                <div class="receipt-info-row">
                                    <i class="bi bi-currency-exchange"></i>
                                    <span class="info-label">جمع مبلغ تایید شده:</span>
                                    <span class="info-value">{{ getAcceptedTotal(receipt) }} تومان</span>
                                </div>
                            </div>

                            <div class="receipt-card-images">
                                <div v-for="value in receipt.receipts" :key="value.id" class="receipt-image-item">
                                    <img 
                                        @click="showOrginalImage(value.image)"
                                        :src="getReceiptimage(value.image)" 
                                        alt=""
                                        class="receipt-thumb"
                                    >
                                    <span
                                        :class="{ 'yellow': value.status == 'pending', 'red': value.status == 'rejected', 'green': value.status == 'accepted' }"
                                        class="receipt-status-badge"
                                    >
                                        {{ getStatusLabel(value.status) }}
                                    </span>
                                    <div class="receipt-image-actions" v-if="value.status == 'pending'">
                                        <button class="btn btn-sm btn-success flex-fill" @click="acceptReceipt(receipt)">
                                            <i class="bi bi-check-lg"></i>
                                            <span>تایید</span>
                                        </button>
                                        <button class="btn btn-sm btn-warning flex-fill" @click="rejecteReceipt(receipt)">
                                            <i class="bi bi-x-lg"></i>
                                            <span>رد</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- حالت خالی -->
                        <div v-if="!receipts.data || receipts.data.length === 0" class="text-center py-5 text-muted">
                            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                            <p>رسیدی یافت نشد</p>
                        </div>
                    </div>

                    <b-pagination v-model="currentPage" :total-rows="receipts.total" v-if="receipts.last_page != 1"
                        :per-page="receipts.per_page" @Update:modelValue="changePage" align="center"
                        class="mt-3 pagination-responsive"></b-pagination>


                </div>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="walletModal" tabindex="-1" aria-hidden="true" ref="walletModal">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ modalTitle }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="بستن"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">مبلغ (تومان)</label>
                            <input v-model="form.amount" type="number" class="form-control"
                                placeholder="مثلاً 100000" />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">توضیح</label>
                            <textarea v-model="form.description" class="form-control" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x"></i>
                            انصراف
                        </button>
                        <button type="button" class="btn btn-primary" @click="submitForm">
                            <i class="bi bi-save2"></i>
                            ثبت
                        </button>
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
import { Modal } from "bootstrap";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
let router = useRouter();
let route = useRoute();
const receipts = ref({ data: [] });
const loading = ref(false);
const filters = ref({ full_name: "", mobile: "", amount: "", status: "" });
const currentPage = ref(1);

const modalInstance = ref(null);
const modalTitle = ref("");
const actionType = ref(""); // deposit | withdraw
const selectedWallet = ref(null);
const form = ref({
    amount: "",
    description: "",
});
function getReceiptimage(imageUrl) {
    return baseImageAddress + imageUrl;
}
function getStatusLabel(status) {
    if (status == 'rejected') {
        return "رد شده"
    } else if (status == 'accepted') {
        return "تایید شده"
    } else {
        return "در حال بررسی"
    }
}
function showOrginalImage(imageUrl) {
    window.open(baseImageAddress + imageUrl, '_blank');
}
function getAcceptedTotal(receipt) {
    let total = receipt.receipts.reduce((sum, re) => {
        if (re.status == "accepted") {
            return sum + re.amount;
        }
        return sum;
    }, 0);
    return Number(total).toLocaleString('fa')
}
function acceptReceipt(receipt) {
    Swal.fire({
        title: "تایید رسید",
        text: `در صورت تایید مبلغ ${Number(receipt.amount).toLocaleString()} تومان به کیف پول ${receipt.user?.full_name} اضافه خواهد شد`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "بله، اضافه شود",
        cancelButtonText: "انصراف",
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.post(`/receipts/${receipt.id}/accept`);
                getReceipts();
                Swal.fire("موفق", "رسید با موفقیت تایید شد", "success");
            } catch (err) {
                Swal.fire("خطا", "مشکلی در تایید پیش آمد", "error");
            }
        }
    });

}
function rejecteReceipt(receipt) {
    Swal.fire({
        title: "رد رسید",
        text: "لطفا دلیل رد رسید را برای کاربر وارد کنید",
        icon: "warning",
        input: "text",
        inputAttributes: {
            autocapitalize: "off"
        },
        showCancelButton: true,
        confirmButtonText: "رد شود",
        showLoaderOnConfirm: true,
        preConfirm: async (message) => {
            const fd = new FormData();
            fd.append("message", message)
            let res = await axios.post(`/receipts/${receipt.id}/reject`, fd);
            toast.success("با موفقیت رد شد")
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
}
const getReceipts = async (page = 1) => {
    loading.value = true;
    try {
        const response = await axios.get("/receipts", {
            params: {
                page,
                full_name: filters.value.full_name,
                amount: filters.value.amount,
                status: filters.value.status,
                mobile: filters.value.mobile,
            },
        });
        receipts.value = response.data;
        currentPage.value = page;
    } finally {
        loading.value = false;
    }
};


const changePage = (page) => {
    if (page) {
        router.replace({ name: route.name, query: { page: page } })
        getReceipts(page)
    }
    else currentUrl = "/receipts"
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
        getReceipts(currentPage.value);
        Swal.fire("موفق", "عملیات با موفقیت انجام شد", "success");
    } catch (error) {
        Swal.fire("خطا", "مشکلی رخ داد", "error");
    }
};

onMounted(() => {
    getReceipts();
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

/* ===== receipts (دسکتاپ) ===== */
.receipts span {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    border-radius: 4px;
    box-shadow: 0 0 5px #1213;
    color: white;
}

.receipts div {
    position: relative;
    padding: 4px;
    border-radius: 4px;
    background: white;
    margin: 4px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 115px;
}

.receipts span.yellow {
    background-color: yellow;
    color: black;
}

.red {
    background-color: red;
}

.green {
    background-color: green;
}

/* ===== کارت‌های موبایل ===== */
.receipt-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.receipt-card {
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}

.receipt-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.receipt-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 10px;
}

.receipt-id-badge {
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    flex-shrink: 0;
}

.receipt-user {
    font-weight: 700;
    color: #2d3436;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
}

.receipt-card-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
}

.receipt-info-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.85rem;
}

.receipt-info-row i {
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

.receipt-card-images {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
}

.receipt-image-item {
    position: relative;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.receipt-thumb {
    width: 100%;
    max-height: 150px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid #e9ecef;
}

.receipt-status-badge {
    position: absolute;
    top: 14px;
    right: 14px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    color: white;
}

.receipt-status-badge.yellow {
    background-color: #f59e0b;
    color: #fff;
}

.receipt-status-badge.red {
    background-color: #dc2626;
    color: #fff;
}

.receipt-status-badge.green {
    background-color: #16a34a;
    color: #fff;
}

.receipt-image-actions {
    display: flex;
    gap: 6px;
    padding-top: 6px;
}

.receipt-image-actions .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 0.75rem;
    padding: 6px 8px;
    white-space: nowrap;
}

.receipt-image-actions .btn span {
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

    .search-input {
        padding: 8px 10px;
        font-size: 0.9rem;
    }

    .filter-btn {
        width: 100%;
    }

    /* نمایش label دکمه‌ها در موبایل */
    .receipt-image-actions .btn span {
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

    .receipt-card {
        padding: 12px;
    }

    .receipt-user {
        font-size: 0.85rem;
    }

    .receipt-info-row {
        font-size: 0.78rem;
    }

    .receipt-image-actions .btn {
        font-size: 0.7rem;
        padding: 5px 6px;
    }

    .receipt-status-badge {
        font-size: 0.7rem;
        padding: 3px 8px;
    }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
    .receipt-cards {
        display: none;
    }
}
</style>