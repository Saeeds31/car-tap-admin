<template>
  <div class="container py-4">
    <b-card>
      <h5 class="mb-3">ایجاد نقش</h5>
      <b-form @submit.prevent="handleSubmit">
        <b-row>
          <!-- Name -->
          <b-col cols="12" md="6">
            <b-form-group label="نام نقش-fa" label-for="name">
              <b-form-input id="name" v-model="form.name" :state="errors.name ? false : null"
                placeholder="نام نقش را وارد کنید" />
              <small v-if="errors.name" class="text-danger">{{ errors.name[0] }}</small>
            </b-form-group>


          </b-col>
          <b-col cols="12" md="6">
            <b-form-group label="نام نقش-en" label-for="slug">
              <b-form-input id="slug" v-model="form.slug" :state="errors.slug ? false : null"
                placeholder="نام نقش را وارد کنید" />
              <small v-if="errors.slug" class="text-danger">{{ errors.slug[0] }}</small>
            </b-form-group>


          </b-col>
          <b-col cols="12" md="12">
            <b-form-group label="وضعیت ناظر بودن" label-for="supervisor">
              <b-form-checkbox id="supervisor" v-model="form.supervisor" :state="errors.supervisor ? false : null"
                :true-value="1" :false-value="0">
                فعال

              </b-form-checkbox>
            </b-form-group>

          </b-col>

        </b-row>

        <div class="mt-3">
          <b-button 
          v-if="checkPermission(['role_store'])"
          type="submit" variant="primary">ثبت</b-button>
        </div>
      </b-form>
    </b-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue"
import axios from "axios"
import { BForm, BFormGroup, BFormInput, BButton, BCard, BRow, BCol } from "bootstrap-vue-3"
import { toast } from "vue3-toastify"
import "vue3-toastify/dist/index.css"
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
const form = reactive({
  name: "",
  slug: "",
  supervisor: 0
})

const errors = reactive({})

const handleSubmit = async () => {
  errors.name = null
  try {
    let formData = new FormData();
    formData.append("name", form.name)
    formData.append("slug", form.slug ? form.slug.trim().replaceAll(" ", "-") : "");
    formData.append("supervisor", Number(form.supervisor))
    await axios.post("/roles", formData)
    toast.success("نقش با موفقیت ایجاد شد ✅")
    form.name = ""
  } catch (err) {
    if (err.response?.status === 422) {
      Object.assign(errors, err.response.data.errors)
    } else {
      toast.error("خطایی رخ داد ❌")
    }
  }
}
</script>