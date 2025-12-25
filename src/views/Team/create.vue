<template>
    <div class="p-4">
        <b-card title="ایجاد عضو جدید">
            <b-form @submit.prevent="submitForm">
                <b-row>
                    <b-col cols="12" md="6">
                        <b-form-group label="نام کامل" label-for="full_name">
                            <b-form-input id="full_name" v-model="form.full_name" :state="!errors.full_name"
                                placeholder="نام کامل عضو" />
                            <b-form-invalid-feedback v-if="errors.full_name">{{ errors.full_name[0]
                                }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>
                    <b-col cols="12" md="6">
                        <b-form-group label="سمت" label-for="post">
                            <b-form-input id="post" v-model="form.post" :state="!errors.post" placeholder="سمت عضو" />
                            <b-form-invalid-feedback v-if="errors.post">{{ errors.post[0] }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>
                    <b-col cols="12" md="12">
                        <b-form-group label="جایگاه نمایشی ">
                            <b-form-input v-model="form.sort_order" :state="!errors.sort_order" type="number"
                                placeholder="مثال: 5" />
                            <b-form-invalid-feedback v-if="errors.sort_order">{{ errors.sort_order[0]
                                }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>
                    <!-- Image -->
                    <b-col cols="12" md="12">
                        <b-form-group label="تصویر (URL)">
                            <VueFileAgent @select="imageLoaded" :maxFiles="1" accept=".jpg,.png" theme="grid" deletable
                                sortable />
                            <b-form-invalid-feedback v-if="errors.image">{{ errors.image[0] }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>
                </b-row>

                <div class="mt-3">
                    <b-button v-if="checkPermission(['article_store'])" :disabled="loader" type="submit"
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
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
import Editor from '@/components/shared/editor.vue';
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
let loader = ref(false);
const checkPermission = store.checkPermission;
const form = reactive({
    full_name: '',
    post: '',
    sort_order: '',
    image: '',
})
const errors = reactive({})
function imageLoaded(files) {
    form.image = files[0].file
}
const submitForm = async () => {
    loader.value = true;
    Object.keys(errors).forEach(key => delete errors[key])
    try {
        const formData = new FormData()
        for (const key in form) {
            formData.append(key, form[key] ?? '')
        }
        await axios.post('/teams', formData)
        toast.success('عضو با موفقیت ذخیره شد ✅')
        Object.keys(form).forEach(key => (form[key] = key))
    } catch (err) {
        if (err.response && err.response.status === 422) {
            Object.assign(errors, err.response.data.errors)
            toast.error('لطفاً خطاهای فرم را بررسی کنید ❌')
        } else {
            toast.error('خطا در ارسال اطلاعات ❌')
        }
    } finally {
        loader.value = false;

    }
}
</script>