<template>
    <div class="wallets-page">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>تراکنش های کیف پول‌ها</h4>
        </div>

        <!-- فیلتر -->
        <div class="card mb-3">
            <div class="card-body row">
                <b-form-group class="col-md-4" label="از تاریخ ">
                    <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" v-model="filters.start_date" />
                </b-form-group>
                <b-form-group class="col-md-4" label="تا تاریخ ">
                    <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" v-model="filters.end_date" />
                </b-form-group>
                <b-form-group class="col-md-4" label="مبلغ ">
                    <b-form-input v-model="filters.amount" type="text"
                        placeholder="جستجو بر اساس حداقل مبلغ تراکنش  " />
                </b-form-group>
                <b-button @click="getWallets()">
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
                                <td>{{ item.type == 'credit' ? "افزایش" : "کاهش" }}</td>
                                <td>{{ item.description }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <b-pagination v-model="currentPage" :total-rows="walletTransactions.total"
                        v-if="walletTransactions.last_page != 1" :per-page="walletTransactions.per_page"
                        @Update:modelValue="changePage" align="center" class="mt-3"></b-pagination>


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