<template>
    <b-container fluid class="py-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>گزارش پیش فروش خودروها</h2>
            <b-spinner small v-if="loading"></b-spinner>
        </div>

        <b-card class="mb-4">
            <b-form @submit.prevent="fetchData">
                <b-row>

                    <b-col md="3">
                        <label class="form-label">انتخاب ماشین</label>
                        <Treeselect :options="options" v-model="filters.car_id" :multiple="false"
                            @search-change="loadCars" placeholder="جستجوی ماشین..." :searchable="true" />

                    </b-col>

                    <b-col md="3">
                        <b-form-group label="نام کاربر">
                            <b-form-input v-model="filters.user_name"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col md="3">
                        <b-form-group label="انتخاب طرح">
                            <select name="" class="form-control" v-model="filters.sale_plan_id" id="">
                                <option value="">بدون انتخاب</option>
                                <option v-for="(item, index) in saleplanes" :key="index" :value="item.id">
                                    {{ item.title }}
                                </option>
                            </select>
                        </b-form-group>
                    </b-col>
                    <b-col md="3">
                        <b-form-group label="حداقل قیمت">
                            <b-form-input type="number" v-model="filters.min_price"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col md="3">
                        <b-form-group label="حداکثر قیمت">
                            <b-form-input v-model="filters.max_price" type="number"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col md="3">
                        <b-form-group label="وضعیت :">
                            <select name="" class="form-control" v-model="filters.sale_plan_id" id="">
                                <option v-for="(item, index) in statuses" :key="index" :value="item.id">
                                    {{ item.label }}
                                </option>
                            </select>
                        </b-form-group>
                    </b-col>

                </b-row>
                <b-button type="submit" variant="primary">اعمال فیلتر</b-button>
            </b-form>
        </b-card>

        <b-card>
            <b-table :items="carsRequest.data" :fields="fields" striped hover small responsive>

                <template #cell(user)="data">
                    <span>
                        {{ data.item.user?.full_name }}
                    </span>
                </template>
                <template #cell(car)="data">
                    <span>
                        {{ data.item.car?.name }}
                    </span>
                </template>

                <template #cell(salePlan)="data">
                    <span>
                        {{ data.item.sale_plan?.title }}
                    </span>
                </template>
                <template #cell(created_at)="data">
                    <span>
                        {{ new Date(data.item.created_at).toLocaleDateString("fa") }}
                    </span>
                </template>
                <template #cell(status)="data">
                    <span>
                        {{
                            statuses.find((s) => s.id == data.item.status)?.label
                        }}
                    </span>
                </template>

            </b-table>

            <b-pagination v-model="page" :total-rows="carsRequest.total" :per-page="carsRequest.per_page" align="center"
                class="mt-3" @change="fetchData" />
        </b-card>
    </b-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";

import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
const carsRequest = ref({ data: [] });
const loading = ref(false);
const page = ref(1);

const filters = reactive({
    car_id: null,
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
let options = ref([]);
const loadCars = async (searchQuery) => {
    try {
        const { data } = await axios.get('/cars?search=' + searchQuery ?? '')
        const ops = data.data.map(car => ({ id: car.id, label: `${car.name} (${car.brand?.title})` }))
        options.value = ops
    } catch (e) {
        console.log(e);
        toast.error('خطا در جستجوی ماشین ها')
    }
}

const fields = [
    { key: "id", label: "شناسه" },
    { key: "user", label: "نام متقاضی" },
    { key: "car", label: "نام ماشین" },
    { key: "salePlan", label: "طرح فروش" },
    { key: "status", label: "وضعیت" },
    { key: "created_at", label: "تاریخ ثبت" },
];

const fetchData = async () => {
    loading.value = true;
    try {
        const { data } = await axios.get("/reports/car-request", {
            params: { ...filters, page: page.value },
        });
        carsRequest.value = data;
    } finally {
        loading.value = false;
    }
};
let saleplanes = ref([]);
async function fetchInit() {
    const response = await axios.get("/sales-plan");
    saleplanes.value = response.data.data;

}
onMounted(() => {
    fetchData();
    fetchInit()
});
</script>