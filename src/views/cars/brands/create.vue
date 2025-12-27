<template>
    <div class="p-4">
        <b-card title="ایجاد برند جدید">
            <b-form @submit.prevent="submitForm">
                <b-row>
                    <!-- Title -->
                    <b-col cols="12" md="12">
                        <b-form-group label="عنوان" label-for="title">
                            <b-form-input id="title" v-model="form.title" :state="!errors.title"
                                placeholder="عنوان برند" />
                            <b-form-invalid-feedback v-if="errors.title">{{ errors.title[0] }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>



                    <!-- Image -->
                    <b-col cols="12" md="12">
                        <b-form-group label="تصویر (URL)">
                            <VueFileAgent @select="imageLoaded" :maxFiles="1" accept=".pdf,.jpg,.png" theme="grid"
                                deletable sortable />
                            <b-form-invalid-feedback v-if="errors.image">{{ errors.image[0] }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>
                    <!-- Short Description -->
                    <b-col cols="12">
                        <b-form-group label="توضیح ">
                            <b-form-textarea v-model="form.description" :state="!errors.description" rows="2" />
                            <b-form-invalid-feedback v-if="errors.description">{{ errors.description[0]
                                }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>

                    <b-col cols="12" md="6">
                        <b-form-group label="نمایش ماشین ها در صفحه اصلی" label-for="show_in_home">
                            <b-form-checkbox id="show_in_home" v-model="form.show_in_home"
                                :state="errors.show_in_home ? false : null" :true-value="1" :false-value="0">
                                فعال

                            </b-form-checkbox>
                            <small v-if="errors.show_in_home" class="text-danger">{{ errors.show_in_home[0] }}</small>
                        </b-form-group>
                    </b-col>
                </b-row>
                <div class="mt-3">
                    <b-button v-if="checkPermission(['brand_store'])" :disabled="loading" type="submit"
                        variant="primary">ذخیره</b-button>
                </div>
            </b-form>
        </b-card>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { BForm, BFormGroup, BFormInput, BFormTextarea, BButton, BCard, BRow, BCol, BFormInvalidFeedback } from 'bootstrap-vue-3'
import { useAdmin } from '@/stores/modules/admin';
import { useRouter } from "vue-router"
const store = useAdmin();
const router = useRouter();
const checkPermission = store.checkPermission;
const form = reactive({
    title: '',
    description: '',
    show_in_home: '',
    image: '',
})
const errors = reactive({})
let loading = ref(false);
function imageLoaded(files) {
    form.image = files[0].file
}
const submitForm = async () => {
    loading.value = true;
    Object.keys(errors).forEach(key => delete errors[key])
    try {
        const formData = new FormData()
        for (const key in form) {
            if (key == 'show_in_home') formData.append(key, Number(form[key]))
            else formData.append(key, form[key] ?? '')
        }
        await axios.post('/brands', formData);
        router.push("/cars/brands/list");
        toast.success('برند با موفقیت ذخیره شد ✅')
        Object.keys(form).forEach(key => (form[key] = key))
    } catch (err) {
        if (err.response && err.response.status === 422) {
            Object.assign(errors, err.response.data.errors)
            toast.error('لطفاً خطاهای فرم را بررسی کنید ❌')
        } else {
            toast.error('خطا در ارسال اطلاعات ❌')
        }
    } finally {
        loading.value = false;

    }

}
</script>