<template>
    <div class="container mt-4">
        <h3>افزودن طرح فروش</h3>
        <form @submit.prevent="submitForm" class="row g-3">
            <b-row>
                <b-col md="12">
                    <b-form-group label="عنوان">
                        <b-form-input v-model="form.title" placeholder="طرح فروش تابستانه"></b-form-input>
                    </b-form-group>
                </b-col>
                <b-col md="6">
                    <b-form-group label="از تاریخ">
                        <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" v-model="form.start_date" />
                    </b-form-group>
                </b-col>

                <b-col md="6">
                    <b-form-group label="تا تاریخ">
                        <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" v-model="form.end_date" />
                    </b-form-group>
                </b-col>
            </b-row>
            <div class="col-md-12">
                <label class="form-label">انتخاب ماشین</label>
                <Treeselect :valueFormat="'object'" :options="options" v-model="selectedcars" :multiple="true"
                    @search-change="loadCars" placeholder="جستجوی ماشین..." :searchable="true" />
            </div>

            <div class="col-12">
                <button v-if="checkPermission(['salesplan_store'])" type="submit" class="btn btn-primary"
                    :disabled="loading">
                    {{ loading ? 'در حال ذخیره...' : 'ذخیره طرح' }}
                </button>
            </div>
            <b-col v-if="selectedCarList.length" cols="12" md="12">
                <label>ماشین های انتخاب شده:</label>
                <div>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>ردیف</th>
                                <th>نام ماشین</th>
                                <th>محدودیت سفارش</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in selectedCarList" :key="index">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.label }}</td>
                                <td>
                                    <input type="text" v-model="min_order[item.id]" class="form-control">
                                </td>
                                <td>
                                    <button class="btn btn-danger" @click="deleteCarFromList(item.id, index)">حذف از
                                        لیست</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </b-col>

        </form>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, reactive, watch } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
const selectedcars = ref(null)
let selectedCarList = ref([]);
const roles = ref([]);
const options = ref([]);
const loading = ref(false)
const form = reactive({
    start_date: '',
    end_date: '',
    title: ''
})
let min_order = ref({});
watch(() => selectedcars.value, (newList) => {
    if (newList && newList.length) {
        newList.forEach((item) => {
            if (!min_order.value[item.id]) {
                min_order.value[item.id] = 1000;
                selectedCarList.value.push(item);
            }
        })
    }
});
function deleteCarFromList(id, index) {
    delete min_order.value[id];
    selectedCarList.value.splice(index, 1);
}
// سرچ کاربران به صورت async
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

const submitForm = async () => {
    try {
        loading.value = true;
        const formData = new FormData()
        for (const key in form) {
            formData.append(key, form[key] ?? '')
        }
        selectedCarList.value.forEach((item) => {
            formData.append(`car_id[]`, item.id)
            formData.append(`min_order_count[]`, min_order.value[item.id])
        });
        await axios.post(`/sales-plan`, formData)
        toast.success('طرح با موفقیت ذخیره شد ✅')
    } catch (err) {
        toast.error(err.response.data.message)
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
/* استایل دلخواه */
</style>