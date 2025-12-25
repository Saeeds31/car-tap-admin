<template>
    <b-container fluid class="py-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>گزارش فروش دوره‌ها</h2>
            <b-spinner small v-if="loading"></b-spinner>
        </div>

        <b-card class="mb-4">
            <b-form @submit.prevent="fetchData">
                <b-row>
                    <b-col md="3">
                        <b-form-group label="ID دوره">
                            <b-form-input v-model="filters.course_id" placeholder="مثلاً 12"></b-form-input>
                        </b-form-group>
                    </b-col>

                    <b-col md="3">
                        <b-form-group label="وضعیت سفارش">
                            <b-form-input v-model="filters.status" placeholder="مثلاً done"></b-form-input>
                        </b-form-group>
                    </b-col>

                    <b-col md="3">
                        <b-form-group label="وضعیت پرداخت">
                            <b-form-input v-model="filters.pay_status" placeholder="paid / unpaid"></b-form-input>
                        </b-form-group>
                    </b-col>

                    <b-col md="3">
                        <b-form-group label="از تاریخ">
                            <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD"
                                v-model="filters.start_date" />
                        </b-form-group>
                    </b-col>

                    <b-col md="3">
                        <b-form-group label="تا تاریخ">
                            <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD"
                                v-model="filters.end_date" />
                        </b-form-group>
                    </b-col>

                </b-row>
                <b-button type="submit" variant="primary">اعمال فیلتر</b-button>
            </b-form>
        </b-card>

        <b-card>
            <b-table :items="orders.data" :fields="fields" striped hover small responsive>

                <template #cell(user)="data">
                    <span>
                        {{ data.item.user?.full_name }}
                    </span>
                </template>

                <template #cell(paid_cost)="data">
                    <span>
                        {{ Number(data.item.paid_cost).toLocaleString("fa") }}
                    </span>
                </template>
                <template #cell(debt_balance)="data">
                    <span>
                        {{ Number(data.item.debt_balance).toLocaleString("fa") }}
                    </span>
                </template>
                
                <template #cell(course)="data">
                    <span>
                        {{ data.item.course?.title }}
                    </span>
                </template>
                <template #cell(created_at)="data">
                    <span>
                        {{ new Date(data.item.created_at).toLocaleDateString("fa") }}
                    </span>
                </template>
                <template #cell(pay_status)="data">
                    <span>
                        {{ data.item.pay_status == 'debtor' ? "بدهکار" : "پرداخت شده" }}
                    </span>
                </template>

            </b-table>

            <b-pagination v-model="page" :total-rows="orders.total" :per-page="orders.per_page" align="center"
                class="mt-3" @change="fetchData" />
        </b-card>
    </b-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";

const orders = ref({ data: [] });
const loading = ref(false);
const page = ref(1);

const filters = reactive({
    course_id: "",
    status: "",
    pay_status: "",
    start_date: "",
    end_date: "",
});

const fields = [
    { key: "id", label: "شناسه" },
    { key: "user", label: "کاربر" },
    { key: "course", label: "دوره" },
    { key: "paid_cost", label: "مبلغ پرداختی تومان" },
    { key: "debt_balance", label: "مبلغ مانده تومان" },
    
    { key: "pay_status", label: "وضعیت پرداخت" },
    { key: "created_at", label: "تاریخ" },
];

const fetchData = async () => {
    loading.value = true;
    try {
        const { data } = await axios.get("/reports/course-orders", {
            params: { ...filters, page: page.value },
        });
        orders.value = data.table;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>