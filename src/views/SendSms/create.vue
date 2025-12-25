<template>
  <div class="container py-4">
    <b-card>
      <h5 class="mb-3">ایجاد نقش</h5>
      <b-form @submit.prevent="handleSubmit">
        <b-row>
          <!-- Name -->
          <b-col cols="12" md="6">
            <b-form-group label="موضوع" label-for="subject">
              <b-form-input id="subject" v-model="form.subject" :state="errors.subject ? false : null"
                placeholder="موضوع را وارد کنید" />
              <small v-if="errors.subject" class="text-danger">{{ errors.subject[0] }}</small>
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group label="گروه گیرنده" label-for="role_is">
              <Treeselect v-model="form.role_id" :multiple="false" :options="roles" placeholder="انتخاب نقش‌"
                label="label" value="id" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group label="متن پیام" label-for="body">
              <b-form-textarea v-model="form.body"></b-form-textarea>
            </b-form-group>
          </b-col>
          <small  class="text-success">
            با توجه به ارسال پیام توسط خطوط تبلیغاتی , نام شرکت را در انتهای پیام لحاظ کنید
          </small>
          
        </b-row>

        <div class="mt-3">
          <b-button v-if="checkPermission(['sendsms_create'])" :disabled="loader" type="submit"
            variant="primary">ثبت</b-button>
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue"
import axios from "axios"
import { BForm, BFormGroup, BFormInput, BButton, BCard, BRow, BCol, BFormTextarea } from "bootstrap-vue-3"
import { toast } from "vue3-toastify"
import "vue3-toastify/dist/index.css"
import { useAdmin } from '@/stores/modules/admin';
import { useRouter } from "vue-router"
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
const router = useRouter();
const store = useAdmin();
const checkPermission = store.checkPermission;
const form = reactive({
  subject: "",
  role_id: null,
  body: ""
})
let roles = ref([]);
let loader = ref(false);
const errors = reactive({})
const fetchRoles = async () => {
  try {
    const { data } = await axios.get('/all-roles')
    roles.value = data.data.map(r => ({ id: r.id, label: r.name }))
  } catch (e) {
    console.log(e);

    toast.error('خطا در دریافت نقش‌ها')
  }
}
onMounted(() => {
  fetchRoles()
})
const handleSubmit = async () => {
  loader.value = true;
  try {
    let formData = new FormData();
    formData.append("subject", form.subject)
    formData.append("role_id", form.role_id);
    formData.append("body", form.body);
    await axios.post("/send-sms", formData)
    toast.success("پیام با موفقیت ایجاد شد ✅")
    router.push('/send-sms');
  } catch (err) {
    if (err.response?.status === 422) {
      Object.assign(errors, err.response.data.errors)
    } else {
      toast.error("خطایی رخ داد ❌")
    }
  } finally {
    loader.value = false;
  }
}
</script>