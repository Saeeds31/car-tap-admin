<template>
    <b-container fluid class="py-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>گزارش کاربران</h2>
            <b-spinner small v-if="loading"></b-spinner>
        </div>

        <b-card class="mb-4">
            <b-form @submit.prevent="fetchData">
                <b-row>
                    <b-col md="3">
                        <b-form-group label="نام و نام خانوادگی">
                            <b-form-input v-model="filters.full_name"></b-form-input>
                        </b-form-group>
                    </b-col>

                    <b-col md="3">
                        <b-form-group label="شماره تماس">
                            <b-form-input v-model="filters.mobile"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col md="3">
                        <b-form-group label="کدملی">
                            <b-form-input v-model="filters.national_code"></b-form-input>
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

        <b-card v-if="users">
            <b-table :items="users.data" :fields="fields" striped hover small responsive>
                <template #cell(created_at)="data">
                    <span>
                        {{ new Date(data.item.created_at).toLocaleDateString("fa") }}
                    </span>
                </template>
            </b-table>

            <b-pagination v-model="page" :total-rows="users.total" :per-page="users.per_page" align="center"
                class="mt-3" @change="fetchData" />
        </b-card>
    </b-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";

const users = ref({ data: [] });
const loading = ref(false);
const page = ref(1);

const filters = reactive({
    full_name: "",
    mobile: "",
    national_code: "",
    start_date: "",
    end_date: "",
});

const fields = [
    { key: "id", label: "شناسه" },
    { key: "full_name", label: "کاربر" },
    { key: "mobile", label: "شماره تماس" },
    { key: "national_code", label: "کدملی" },
    { key: "created_at", label: "تاریخ ثبت نام" },
];

const fetchData = async () => {
    loading.value = true;
    try {
        const { data } = await axios.get("/reports/users", {
            params: { ...filters, page: page.value },
        });
        users.value = data;
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>