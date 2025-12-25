<template>
  <div class="p-4">
    <b-card title="ایجاد گروه ">
      <b-form class="row" @submit.prevent="submitForm">
        <!-- Title -->
        <b-form-group label="عنوان" class="col-md-12" label-for="title" description="عنوان گروه">
          <b-form-input id="title" v-model="form.title" :state="!errors.title"
            placeholder="عنوان را وارد کنید"></b-form-input>
          <b-form-invalid-feedback v-if="errors.title">{{ errors.title }}</b-form-invalid-feedback>
        </b-form-group>
        <b-button :disabled="loading" v-if="checkPermission(['specification_group_store'])" type="submit"
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
import { BForm, BFormGroup, BFormInput, BButton, BCard, BFormInvalidFeedback } from 'bootstrap-vue-3'
import { useAdmin } from '@/stores/modules/admin';
import { useRouter } from "vue-router"
const store = useAdmin();
const checkPermission = store.checkPermission;
const form = reactive({
  title: '',
})
const router = useRouter();
const errors = reactive({})
let loading = ref(false);
const submitForm = async () => {
  errors.value = {}
  loading.value = true;
  try {
    const formData = new FormData()
    for (const key in form) {
      formData.append(key, form[key] ?? '')
    }
    const response = await axios.post('/specifications-group', formData)
    toast.success('گروه با موفقیت ذخیره شد ✅')
    setTimeout(() => {
      router.push('/specification/group/list')
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