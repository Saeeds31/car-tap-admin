<template>
  <div class="p-4">
    <b-card title="ایجاد دسته‌بندی ">
      <b-form class="row" @submit.prevent="submitForm">
        <!-- Title -->
        <b-form-group label="عنوان" class="col-md-12" label-for="title" description="عنوان دسته‌بندی">
          <b-form-input id="title" v-model="form.title" :state="!errors.title"
            placeholder="عنوان را وارد کنید"></b-form-input>
          <b-form-invalid-feedback v-if="errors.title">{{ errors.title }}</b-form-invalid-feedback>
        </b-form-group>
        <b-form-group label="توضیحات" label-for="description" class="col-md-12">
          <b-form-textarea id="description" v-model="form.description" :state="!errors.description"
            rows="5"></b-form-textarea>
          <b-form-invalid-feedback v-if="errors.description">{{ errors.description }}</b-form-invalid-feedback>
        </b-form-group>

        <b-button v-if="checkPermission(['category_store'])" :disabled="loading" type="submit"
          variant="primary">ذخیره</b-button>
      </b-form>
    </b-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { BForm, BFormGroup, BFormInput, BFormTextarea, BButton, BCard, BFormInvalidFeedback } from 'bootstrap-vue-3'
import { useAdmin } from '@/stores/modules/admin';
import { useRouter } from "vue-router"
const store = useAdmin();
const checkPermission = store.checkPermission;
const form = reactive({
  title: '',
  description: '',
})
let loading = ref(false);

const router = useRouter();
const errors = reactive({})
const submitForm = async () => {
  loading.value = true;
  errors.value = {}
  try {
    const formData = new FormData()
    for (const key in form) {
      formData.append(key, form[key] ?? '')
    }
    const response = await axios.post('/categories', formData)
    toast.success('دسته‌بندی با موفقیت ذخیره شد ✅')
    setTimeout(() => {
      router.push('/cars/categories/list')
    }, 2000);
  } catch (err) {
    if (err.response && err.response.status === 422) {
      // خطاهای ولیدیشن لاراول
      const respErrors = err.response.data.errors
      Object.keys(respErrors).forEach(key => {
        if (Array.isArray(respErrors[key])) {
          errors[key] = respErrors[key].join(" - ");
        } else {
          errors[key] = respErrors[key];
        }
      })
      toast.error('لطفا خطاهای فرم را بررسی کنید ❌')
    } else {
      toast.error('خطا در ارسال اطلاعات ❌')
      console.error(err)
    }
  } finally {
    loading.value = false;

  }
}
</script>