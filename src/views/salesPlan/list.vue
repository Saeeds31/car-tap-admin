<template>
    <div class="users-page container mt-4">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>مدیریت طرح های فروش</h4>
            <router-link v-if="checkPermission(['salesplan_store'])" to="/sales-plan/create" class="btn btn-primary">
                افزودن طرح
            </router-link>
        </div>



        <!-- Table -->
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
                                <th>نام طرح</th>
                                <th>از تاریخ</th>
                                <th>تا تاریخ</th>
                                <th v-if="checkPermission(['salesplan_cars'])">ماشین ها</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in saleplanes.data" :key="item.id">
                                <td>{{ item.id }}</td>
                                <td>{{ item.title }}</td>
                                <td>{{ new Date(item.start_date).toLocaleDateString('fa') }}</td>
                                <td>{{ new Date(item.end_date).toLocaleDateString('fa') }}</td>
                                <td>
                                    <router-link v-if="checkPermission(['salesplan_cars'])"
                                        :to="`/sales-plan/cars/${item.id}`"></router-link>
                                </td>
                                <td>

                                    <router-link v-if="checkPermission(['salesplan_update'])"
                                        :to="`/sales-plan/${item.id}/edit`" class="btn btn-sm btn-warning me-2">
                                        ویرایش
                                    </router-link>
                                    <button class="btn btn-sm btn-danger" v-if="checkPermission(['salesplan_delete'])"
                                        @click="deleteSales(item.id)">
                                        حذف
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>


                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRoute, useRouter } from "vue-router";
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
const router = useRouter();
const route = useRoute();
const saleplanes = ref({ data: [] });
const loading = ref(false);
const filters = ref({ search: "" });

const getSales = async () => {
    loading.value = true;
    try {
        const response = await axios.get("/sales-plan");
        saleplanes.value = response.data;
    } finally {
        loading.value = false;
    }
};
onMounted(() => {
    getSales();
});

const deleteSales = (id) => {
    Swal.fire({
        title: "حذف طرح",
        text: "آیا مطمئن هستید؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "بله، حذف شود",
        cancelButtonText: "انصراف",
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`/sales-plan/${id}`);
                Swal.fire("موفق", "طرح حذف شد", "success");
                getSales();
            } catch (err) {
                Swal.fire("خطا", "مشکلی در حذف پیش آمد", "error");
            }
        }
    });
};

</script>