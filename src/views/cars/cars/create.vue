<template>
    <div class="p-4">
        <b-card title="ایجاد ماشین جدید">
            <b-form @submit.prevent="submitForm">
                <b-row>
                    <b-col cols="12" md="6">
                        <b-form-group label="نام" label-for="name">
                            <b-form-input id="name" v-model="form.name" :state="!errors.name" placeholder="نام ماشین" />
                            <b-form-invalid-feedback v-if="errors.name">{{ errors.name[0] }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>

                    <b-col cols="12" md="6">
                        <b-form-group label="قیمت" label-for="price">
                            <b-form-input id="price" v-model="form.price" :state="!errors.price"
                                placeholder="قیمت ماشین" />
                            <b-form-invalid-feedback v-if="errors.price">{{ errors.price[0] }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>
                    <b-col cols="12">
                        <b-form-group label="تصاویر">
                            <VueFileAgent @select="imagesLoaded" :multiple="true" accept=".jpg,.png,.pdf" theme="grid"
                                deletable sortable />
                        </b-form-group>
                    </b-col>
                    <b-col cols="12" md="6">
                        <b-form-group label="دسته‌بندی " label-for="category_id">
                            <Treeselect id="category_id" :multiple="false" v-model="form.category_id"
                                :normalizer="normalizer" :options="parentOptions" placeholder="انتخاب دسته‌بندی "
                                :clearable="true" :valueConsistsOf="'ALL'" />
                            <b-form-invalid-feedback v-if="errors.category_id">{{ errors.category_id[0]
                            }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>

                    <b-col cols="12" md="6">
                        <b-form-group label="برند " label-for="brand_id">
                            <Treeselect id="brand_id" :multiple="false" v-model="form.brand_id" :normalizer="normalizer"
                                :options="parentOptionsBrand" placeholder="انتخاب برند " :clearable="true"
                                :valueConsistsOf="'ALL'" />
                            <b-form-invalid-feedback v-if="errors.brand_id">{{ errors.brand_id[0]
                            }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>
                    <b-col cols="12" md="12">
                        <label>انتخاب گروه مشخصات:</label>
                        <Treeselect :valueFormat="'object'" v-model="selectedGroup" :multiple="true" :options="groups"
                            :normalizer="normalizer" />
                    </b-col>
                    <b-col v-if="selectedGroup.length" cols="12" md="12">
                        <label>انتخاب گروه مشخصات:</label>
                        <div>
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>ردیف</th>
                                        <th>نوع مشخصه</th>
                                        <th>انتخاب از مقدارهای پیش فرض</th>
                                        <th>انتخاب مقدار جدید</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in specifications" :key="index">
                                        <td>{{ index + 1 }}</td>
                                        <td>{{ item.title }}</td>
                                        <td>
                                            <select :disabled="!item.values.length" class="form-control"
                                                v-model="selectedSpecifications[item.id]['select']">
                                                <option v-for="val in item.values" :key="index" :value="val.id">{{
                                                    val.value
                                                }}
                                                </option>
                                            </select>
                                        </td>
                                        <td>
                                            <input :disabled="selectedSpecifications[item.id]['select']" type="text"
                                                class="form-control"
                                                v-model="selectedSpecifications[item.id]['custom']">
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </b-col>

                    <!-- Image -->
                    <b-col cols="12" md="12">
                        <b-form-group label="تصویر (URL)">
                            <VueFileAgent @select="imageLoaded" :maxFiles="1" accept=".pdf,.jpg,.png" theme="grid"
                                deletable sortable />
                            <b-form-invalid-feedback v-if="errors.image">{{ errors.image[0] }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>

                    <b-col cols="12">
                        <b-form-group label="توضیح">
                            <b-form-textarea v-model="form.description" :state="!errors.description" rows="2" />
                            <b-form-invalid-feedback v-if="errors.description">{{ errors.description[0]
                                }}</b-form-invalid-feedback>
                        </b-form-group>
                    </b-col>
                </b-row>

                <div class="mt-3">
                    <b-button :disabled="loading" v-if="checkPermission(['article_store'])" type="submit"
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
import { useAdmin } from '@/stores/modules/admin';
import { watch } from 'vue';
import { useRoute } from "vue-router"
const store = useAdmin();
const route = useRoute();
const checkPermission = store.checkPermission;
const form = reactive({
    name: '',
    description: '',
    image: '',
    category_id: null,
    brand_id: null,
    images: []
})
let loading = ref(false);
let selectedGroup = ref([]);
watch(() => selectedGroup.value, (newValue) => {
    specifications.value = [];
    newValue.forEach((item) => {
        item.specifications.forEach((sp) => {
            selectedSpecifications.value[sp.id] = {
                custom: null,
                select: null
            };
        })
        specifications.value.push(...item.specifications)
    })
})
let selectedSpecifications = ref({});
let specifications = ref([]);
let groups = ref([]);
function imagesLoaded(files) {
    form.images = files.map((file) => file.file)
}
const errors = reactive({})
function imageLoaded(files) {
    form.image = files[0].file
}
const normalizer = (node) => {
    // تبدیل کلیدها به فرمت استاندارد کامپوننت
    return {
        id: node.id,
        label: node.title,
    }
}
const parentOptions = ref([])
const parentOptionsBrand = ref([])

async function getParentOption() {
    await axios.get("/categories").then((res) => {
        parentOptions.value = res.data.data.data
    })
    await axios.get("/brands").then((res) => {
        parentOptionsBrand.value = res.data.data.data
    })
    await axios.get("/specification-tree").then((res) => {
        groups.value = res.data.data
    })
}

getParentOption()
const submitForm = async () => {

    Object.keys(errors).forEach(key => delete errors[key])
    try {
        loading.value = true;
        const formData = new FormData()
        for (const key in form) {
            if (key === 'images') {
                form.images.forEach(imgfile => {
                    formData.append("images[]", imgfile)
                })
            } else {
                formData.append(key, form[key] ?? '')
            }
        }
        for (const key in selectedSpecifications.value) {
            if (selectedSpecifications.value[key]['select']) {
                formData.append(`specification_id[]`, key)
                formData.append(`specification_value[]`, selectedSpecifications.value[key]['select'])
            } else if (selectedSpecifications.value[key]['custom']) {
                formData.append(`specification_id[]`, key)
                formData.append(`specification_value[]`, selectedSpecifications.value[key]['custom'])

            }
        }
        await axios.post(`/cars`, formData)
        toast.success('ماشین با موفقیت ذخیره شد ✅')
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