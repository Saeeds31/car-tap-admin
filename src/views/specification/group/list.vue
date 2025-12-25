<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between mb-3">
            <h3>لیست گروه ها</h3>
            <router-link v-if="checkPermission(['specification_group_store'])" to="/specification/group/create"
                class="btn btn-primary">
                افزودن گروه
            </router-link>
        </div>

        <b-table striped hover :items="groups.data" :fields="fields">
            <template #cell(actions)="data">
                <router-link v-if="checkPermission(['specification_group_update'])"
                    :to="`/specification/group/${data.item.id}/edit`" class="btn btn-sm btn-warning me-2">
                    ویرایش </router-link>
                <button v-if="checkPermission(['specification_group_delete'])" class="btn btn-sm btn-danger"
                    @click="confirmDelete(data.item.id)">
                    حذف
                </button>
            </template>
        </b-table>

        <b-pagination v-model="currentPage" :total-rows="groups.total" v-if="groups.last_page != 1"
            :per-page="groups.per_page" @Update:modelValue="fetchgroups" align="center" class="mt-3"></b-pagination>
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
const groups = ref({
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

const fetchgroups = async (page = 1) => {
    try {
        router.replace({ name: route.name, query: { page: page } })
        const res = await axios.get(`/specifications-group?page=${page}`)
        groups.value = res.data.data
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
            deleteGroup(id)
        }
    })
}

const deleteGroup = async (id) => {
    try {
        await axios.delete(`/specifications-group/${id}`)
        Swal.fire('حذف شد!', 'گروه با موفقیت حذف شد', 'success')
        fetchgroups(currentPage.value)
    } catch (error) {
        Swal.fire('خطا!', 'این گروه قابل حذف نیست', 'error')
    }
}

onMounted(() => {
    fetchgroups()
})


</script>