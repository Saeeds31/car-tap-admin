<template>
    <b-container fluid class="py-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>گزارش خودرو</h2>
            <b-spinner small v-if="loading"></b-spinner>
        </div>

        <b-card class="mb-4">
            <b-form @submit.prevent="fetchData">
                <b-row>
                    <b-col md="3">
                        <b-form-group label="نام">
                            <b-form-input v-model="filters.name"></b-form-input>
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
                        <b-form-group label="برند">
                            <select class="form-control" name="" v-model="filters.brand_id" id="">
                                <option value="">بدون انتخاب</option>
                                <option v-for="(brand, index) in brands" :key="index" :value="brand.id">
                                    {{ brand.title }}
                                </option>
                            </select>
                        </b-form-group>
                    </b-col>
                    <b-col md="3">
                        <b-form-group label="دسته بندی ها">
                            <select name="" class="form-control" v-model="filters.category_id" id="">
                                <option value="">بدون انتخاب</option>
                                <option v-for="(category, index) in categories" :key="index" :value="category.id">
                                    {{ category.title }}
                                </option>
                            </select>
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
            <b-table v-if="cars" :items="cars.data" :fields="fields" striped hover small responsive>

                <template #cell(price)="data">
                    <span>
                        {{ Number(data.item.price).toLocaleString('fa') }}
                    </span>
                </template>

                <template #cell(brand)="data">
                    <span>
                        {{ data.item.brand?.title }}
                    </span>
                </template>
                <template #cell(category)="data">
                    <span>
                        {{ data.item.category?.title }}
                    </span>
                </template>

                <template #cell(created_at)="data">
                    <span>
                        {{ new Date(data.item.created_at).toLocaleDateString("fa") }}
                    </span>
                </template>

            </b-table>

            <b-pagination v-model="page" :total-rows="cars.total" :per-page="cars.per_page" align="center" class="mt-3"
                @change="fetchData" />
        </b-card>
    </b-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";

const cars = ref({ data: [] });
const loading = ref(false);
const page = ref(1);

const filters = reactive({
    name: "",
    min_price: "",
    max_price: "",
    brand_id: "",
    category_id: "",
    start_date: "",
    end_date: "",
});

const fields = [
    { key: "id", label: "شناسه" },
    { key: "name", label: "نام ماشین" },
    { key: "price", label: "قیمت" },
    { key: "category", label: "دسته بندی" },
    { key: "brand", label: "برند" },
    { key: "created_at", label: "تاریخ ثبت" },
];

const fetchData = async () => {
    loading.value = true;
    try {
        const { data } = await axios.get("/reports/cars", {
            params: { ...filters, page: page.value },
        });
        cars.value = data;
    } finally {
        loading.value = false;
    }
};
let brands = ref([]);
let categories = ref([]);
async function fetchinit() {
    let res = await axios.get("/brands");
    brands.value = res.data.data.data;
    let res2 = await axios.get("/categories");
    categories.value = res2.data.data.data;
}
onMounted(() => {
    fetchData();
    fetchinit()
});
</script>