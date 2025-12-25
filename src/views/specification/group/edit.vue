<template>
  <div class="container py-4">
    <b-card>
      <h5 class="mb-3">ویرایش ویرایش</h5>
      <b-form @submit.prevent="handleSubmit">
        <b-row>
          <b-col cols="12" md="12">
            <b-form-group label="عنوان" label-for="title">
              <b-form-input id="title" v-model="form.title" :state="errors.title ? false : null" />
              <small v-if="errors.title" class="text-danger">{{ errors.title[0] }}</small>
            </b-form-group>
          </b-col>
        </b-row>
        <div class="mt-3">
          <b-button :disabled="loading" v-if="checkPermission(['specification_group_update'])" type="submit"
            variant="primary">
            ویرایش گروه
          </b-button>
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { BForm, BFormGroup, BFormInput, BButton, BCard, BRow, BCol } from 'bootstrap-vue-3'
import { useRoute } from 'vue-router'
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
const route = useRoute()
const form = reactive({
  title: '',
  description: '',
})
let loading = ref(false)
const errors = reactive({})

onMounted(async () => {
  try {
    // GET اطلاعات ویرایش
    const res = await axios.get(`/specifications-group/${route.params.id}`)
    Object.assign(form, res.data.data)
  } catch (err) {
    toast.error('خطا در دریافت اطلاعات ویرایش ❌')
  }
})

const handleSubmit = async () => {
  Object.keys(errors).forEach(k => delete errors[k])
  loading.value = true;
  try {
    const formData = new FormData()
    for (const key in form) formData.append(key, form[key])
    formData.append("_method", "PUT")
    await axios.post(`/specifications-group/${route.params.id}`, formData)
    toast.success('گروه با موفقیت ویرایش شد ✅')

  } catch (err) {
    if (err.response?.status === 422) {
      Object.assign(errors, err.response.data.errors)
      toast.error('خطاهای فرم را بررسی کنید ❌')
    } else {
      toast.error('خطا در ارسال اطلاعات ❌')
    }
  } finally {
    loading.value = false;

  }
}
</script>
