<template>
    <div class="wallets-page">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4> رسید های واریزی</h4>
        </div>

        <!-- فیلتر -->
        <div class="card mb-3">
            <div class="card-body row">
                <b-form-group class="col-md-3" label="نام کامل">
                    <b-form-input v-model="filters.full_name" type="text" placeholder="جستجو بر اساس نام  " />
                </b-form-group>
                <b-form-group class="col-md-3" label="شماره تماس">
                    <b-form-input v-model="filters.mobile" type="text" placeholder="جستجو بر اساس شماره تماس  " />
                </b-form-group>
                <b-form-group class="col-md-3" label=" مبلغ واریزی">
                    <b-form-input v-model="filters.amount" type="text" placeholder="جستجو بر اساس  مبلغ واریزی  " />
                </b-form-group>

                <b-form-group class="col-md-3" label=" وضعیت">
                    <select v-model="filters.status" class="form-select">
                        <option value="">انتخاب کنید</option>
                        <option value="pending">درحال بررسی</option>
                        <option value="accepted">تایید شده</option>
                        <option value="rejected">رد شده</option>
                    </select>
                </b-form-group>
                <b-button @click="getReceipts()">
                    فیلتر سازی
                </b-button>
            </div>
        </div>

        <!-- جدول -->
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
                                <th>کاربر</th>
                                <th>مبلغ (تومان)</th>
                                <th>تصویر</th>
                                <th>وضعیت</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="receipt in receipts.data" :key="receipt.id">
                                <td>{{ receipt.id }}</td>
                                <td>{{ receipt.user?.full_name ?? '-' }}</td>
                                <td>{{ Number(receipt.amount).toLocaleString() }}</td>
                                <td><img width="48px" style="cursor: pointer;" @click="showOrginalImage(receipt.image)"
                                        :src="getReceiptimage(receipt.image)" alt=""></td>
                                <td>{{ getStatusLabel(receipt.status) }}</td>
                                <td>
                                    <button v-if="receipt.status == 'pending'" class="btn btn-sm btn-success me-2"
                                        @click="acceptReceipt(receipt)">
                                        تایید
                                    </button>
                                    <button v-if="receipt.status == 'pending'" class="btn btn-sm btn-warning"
                                        @click="rejecteReceipt(receipt)">
                                        رد
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <b-pagination v-model="currentPage" :total-rows="receipts.total" v-if="receipts.last_page != 1"
                        :per-page="receipts.per_page" @Update:modelValue="changePage" align="center"
                        class="mt-3"></b-pagination>


                </div>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="walletModal" tabindex="-1" aria-hidden="true" ref="walletModal">
            <div class="modal-dialog">
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
                            انصراف
                        </button>
                        <button type="button" class="btn btn-primary" @click="submitForm">
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
                Swal.fire("موفق", "مبلغ به کیف پول اضافه شد", "success");
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