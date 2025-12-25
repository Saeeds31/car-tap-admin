<template>
  <div class="container py-4">
    <b-card>
      <h5 class="mb-3">ویرایش برند</h5>
      <b-form @submit.prevent="handleSubmit">
        <b-row>
          <b-col cols="12" md="12">
            <b-form-group label="عنوان" label-for="title">
              <b-form-input id="title" v-model="form.title" :state="errors.title ? false : null" />
              <small v-if="errors.title" class="text-danger">{{ errors.title[0] }}</small>
            </b-form-group>
          </b-col>
          <b-col cols="12" md="12">
            <b-form-group label="تصویر" label-for="image">
              <VueFileAgent @update:raw-model-value="imageLoaded" :raw-model-value="oldImage" :maxFiles="1"
                accept=".pdf,.jpg,.png" theme="grid" deletable sortable>
              </VueFileAgent>
              <small v-if="errors.image" class="text-danger">{{ errors.image[0] }}</small>
            </b-form-group>
          </b-col>

          <b-col cols="12">
            <b-form-group label="توضیح ">
              <b-form-textarea v-model="form.description" rows="2" />
              <b-form-invalid-feedback v-if="errors.description">
                {{ errors.description[0] }}
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>

        <div class="mt-3">
          <b-button :disbaled="loading" v-if="checkPermission(['brand_update'])" type="submit" variant="primary">ویرایش
            برند</b-button>
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
const route = useRoute();
const oldImage = ref([]);
const form = reactive({
  title: '',
  image: [],
  description: '',
})
let loading = ref(false);

const errors = reactive({})
onMounted(async () => {
  try {
    // GET اطلاعات برند
    const res = await axios.get(`/brands/${route.params.id}`)

    oldImage.value =
      [{
        name: res.data.data.image.split('/').pop(),
        size: 0,
        type: 'image/jpeg',
        ext: res.data.data.image.split('.').pop(),
        url: `${baseImageAddress}${res.data.data.image}`,
      }];
    let ids = [];
    Object.assign(form, res.data.data);
  } catch (err) {
    console.log(err);
    toast.error('خطا در دریافت اطلاعات برند ❌')
  }
})
function imageLoaded(files) {
  if (files.length) {
    form.image = files[0].file
  } else {
    form.image = '';
  }
}
const handleSubmit = async () => {
  loading.value = true;
  try {
    const formData = new FormData()
    for (const key in form) {
      if (key != 'image') formData.append(key, form[key])
    }
    formData.append("_method", "PUT");
    if (form.image) {
      formData.append("image", form.image);
    }
    await axios.post(`/brands/${route.params.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    toast.success('برند با موفقیت ویرایش شد ✅');
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
