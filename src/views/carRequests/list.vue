<template>
    <b-container fluid class="py-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>
                لیست درخواست های آماده
            </h2>
            <b-spinner small v-if="loading"></b-spinner>
        </div>

        <b-card class="mb-4">
            <b-form @submit.prevent="fetchData">
                <b-row>
                    <b-col md="3">
                        <b-form-group label="نام خودرو">
                            <b-form-input v-model="filters.car_name"></b-form-input>
                        </b-form-group>
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
            <b-table :items="carsRequest.data" :fields="fields" striped hover bordered small responsive>

                <template #cell(user)="data">
                    <span>
                        {{ data.item.user ? data.item.user.full_name : data.item.user.mobile }}
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
                        {{ new Date(data.item.created_at).toLocaleString("fa") }}
                    </span>
                </template>
                <template #cell(status)="data">
                    <span>
                        {{
                            statuses.find((s) => s.id == data.item.status)?.label
                        }}
                    </span>
                </template>
                <template #cell(handler)="data">
                    <button class="btn btn-primary" @click="changeStatus(data.item)">
                        تغییر وضعیت
                    </button>
                    <button class="mx-3 btn btn-info" @click="changeCar(data.item)">
                        تغییر خودرو
                    </button>

                </template>
            </b-table>

            <b-pagination v-model="carsRequest.current_page" :total-rows="carsRequest.total"
                :per-page="carsRequest.per_page" align="center" class="mt-3" @Update:modelValue="changePage" />
        </b-card>

        <Modal v-if="changeStatusModal" id="changeStatusModal" @closeModal="() => changeStatusModal = false"
            title="تغییر وضعیت">
            <b-form-group class="col-md-12" label="انتخاب وضعیت" label-for="permission_ids">
                <select class="form-control" name="" v-model="selectedStatus" id="">
                    <option v-for="(item, index) in statusesModel" :key="index" :value="item.id">
                        {{ item.label }}
                    </option>
                </select>
            </b-form-group>
            <button :disabled="loading" @click="changeStatusRequest()" class="btn btn-success">
                ذخیره تغییرات
            </button>
        </Modal>
        <Modal v-if="changeCarModal" id="changeCarModal" @closeModal="() => changeCarModal = false" title="تغییر خودرو">

            <div class="col-md-12">
                <label class="form-label">انتخاب ماشین</label>
                <Treeselect :options="options" :normalizer="normalizer" v-model="selectedCar" :multiple="false"
                    @search-change="loadCars" placeholder="جستجوی ماشین..." :searchable="true" />
            </div>
            <button :disabled="loading" @click="changeCarRequest()" class="btn btn-success mt-4">
                ذخیره تغییرات
            </button>
        </Modal>
    </b-container>
</template>

<script setup>
import Modal from "@/components/shared/modal.vue";
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
const normalizer = (node) => {
    return {
        id: node.id,
        label: node.name,
    }
}
const route = useRoute();
const router = useRouter();
let changeStatusModal = ref(false);
let changeCarModal = ref(false);
let selectedStatus = ref();
let selectedItem = ref(null);
const carsRequest = ref({ data: [] });
const loading = ref(false);
const page = ref(1);
function changeStatus(item) {
    selectedItem.value = item;
    selectedStatus.value = item.status;
    changeStatusModal.value = true;
}
let selectedCar = ref(null);
let options = ref([]);
async function changeCarRequest() {
    loading.value = true;
    try {
        const formData = new FormData();
        formData.append('car_id', selectedCar.value)
        formData.append('_method', "PUT")
        const { data } = await axios.post(`/car-requests/${selectedItem.value.id}`, formData);
        toast.success(data.message);
        changeCarModal.value = false;
    }
    catch (error) {
        toast.error(error.response.data.message)
    }
    finally {
        loading.value = false;
    }
}
function changeCar(item) {
    changeCarModal.value = true;
    selectedItem.value = item;
    selectedCar.value = item.car.id;
    options.value = [item.car]
}
const loadCars = async (searchQuery) => {
    console.log(searchQuery);
    try {
        const { data } = await axios.get('/cars?search=' + searchQuery ?? '')
        const ops = data.data;
        options.value = ops
    } catch (e) {
        console.log(e);
        toast.error('خطا در جستجوی کاربران')
    }
}
let statusesModel = ref(
    [
        {
            id: 'pending',
            label: 'در حال بررسی'
        },

        {
            id: 'pre_registration',
            label: 'پیش ثبت نام'
        },

        {
            id: 'invitation_to_attend',
            label: 'مراجعه حضوری'
        },

        {
            id: 'delivered',
            label: 'تحویل شده'
        },
    ]
);
const filters = reactive({
    car_name: "",
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

const fields = [
    { key: "id", label: "شناسه" },
    { key: "user", label: "نام متقاضی" },
    { key: "car", label: "نام ماشین" },
    { key: "salePlan", label: "طرح فروش" },
    { key: "status", label: "وضعیت" },
    { key: "created_at", label: "تاریخ ثبت" },
    { key: "handler", label: "تغییرات" },
];
async function changeStatusRequest() {

    loading.value = true;
    try {
        const formData = new FormData();
        formData.append('status', selectedStatus.value)
        const { data } = await axios.post(`/car-requests/${selectedItem.value.id}/change-status`, formData);
        toast.success(data.message);
        changeStatusModal.value = false;
    }
    catch (error) {
        toast.error(error.response.data.message)
    }
    finally {
        loading.value = false;
    }
}
const fetchData = async () => {
    loading.value = true;
    try {
        const { data } = await axios.get("/car-requests", {
            params: { ...filters, page: page.value },
        });
        carsRequest.value = data;
    } finally {
        loading.value = false;
    }
};
function changePage(p) {
    router.replace({ name: route.name, query: { page: p } })
    page.value = p;
    fetchData();
}
let saleplanes = ref([]);
async function fetchInit() {
    const response = await axios.get("/sales-plan");
    saleplanes.value = response.data.data;
}
onMounted(() => {
    page.value = route.query.page ?? 1;
    fetchData();
    fetchInit()
});
</script>