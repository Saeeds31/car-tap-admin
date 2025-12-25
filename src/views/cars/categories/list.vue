<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between mb-3">
            <h3>لیست دسته بندی ها</h3>
            <router-link v-if="checkPermission(['category_store'])" to="/cars/categories/create"
                class="btn btn-primary">
                افزودن دسته بندی
            </router-link>
        </div>

        <b-table striped hover :items="categories.data" :fields="fields">
            <template #cell(actions)="data">
                <router-link v-if="checkPermission(['category_update'])" :to="`/cars/categories/${data.item.id}/edit`"
                    class="btn btn-sm btn-warning me-2">
                    ویرایش </router-link>
                <button v-if="checkPermission(['category_delete'])" class="btn btn-sm btn-danger"
                    @click="confirmDelete(data.item.id)">
                    حذف
                </button>
            </template>
        </b-table>

        <b-pagination v-model="currentPage" :total-rows="categories.total" v-if="categories.last_page != 1"
            :per-page="categories.per_page" @Update:modelValue="fetchCategories" align="center"
            class="mt-3"></b-pagination>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRoute, useRouter } from 'vue-router'
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
let router = useRouter();
let route = useRoute();
const categories = ref({
    data: [],
    total: 0,
    per_page: 10,
    current_page: 1,
})
const currentPage = ref(1)

const fields = [
    { key: 'id', label: 'شناسه' },
    { key: 'title', label: 'عنوان' },
    { key: 'actions', label: 'عملیات' },
]

const fetchCategories = async (page = 1) => {
    try {
        router.replace({ name: route.name, query: { page: page } })
        const res = await axios.get(`/categories?page=${page}`)
        categories.value = res.data.data
        currentPage.value = res.data.data.current_page
    } catch (error) {
        console.error(error)
    }
}

const confirmDelete = (id) => {
    Swal.fire({
        title: 'آیا مطمئن هستید?',
        text: "این عملیات بدون بازگشت است!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'بله پاک شود!',
    }).then((result) => {
        if (result.isConfirmed) {
            deleteCategory(id)
        }
    })
}

const deleteCategory = async (id) => {
    try {
        await axios.delete(`/categories/${id}`)
        Swal.fire('حذف شد!', 'دسته بندی با موفقیت حذف شد', 'success')
        fetchCategories(currentPage.value)
    } catch (error) {
        console.error(error)
        Swal.fire('خطا!', 'خطایی به وجود آمده است', 'error')
    }
}

onMounted(() => {
    fetchCategories()
})


</script>