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
                        <label>مشخصات:</label>
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
                                    <tr v-for="(item, index) in specifications" :key="item.id">
                                        <td>{{ index + 1 }}</td>
                                        <td>{{ item.title }}</td>
                                        <td>
                                            <select :disabled="!item.values.length" class="form-control"
                                                v-model="selectedSpecifications[item.id]['select']">
                                                <option value="">انتخاب کنید</option>
                                                <option v-for="val in item.values" :key="val.id" :value="val.id">{{
                                                    val.value
                                                    }}
                                                </option>
                                            </select>
                                        </td>
                                        <td>
                                            <input type="text" class="form-control"
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
                        </b-form-group>
                        <span class="text-danger" v-if="errors.image">{{ errors.image[0] }}</span>
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
import { reactive, ref, watch } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { BForm, BFormGroup, BFormInput, BFormTextarea, BButton, BCard, BRow, BCol, BFormInvalidFeedback } from 'bootstrap-vue-3'
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
import { useAdmin } from '@/stores/modules/admin';
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
    images: [],
    price: ''
})

let loading = ref(false);
let selectedGroup = ref([]);
let selectedSpecifications = ref({});
let specifications = ref([]);
let groups = ref([]);
const errors = reactive({});

// عکس‌ها
function imagesLoaded(files) {
    form.images = files.map((file) => file.file)
}

function imageLoaded(files) {
    form.image = files[0]?.file || null
}

// نرمالایزر
const normalizer = (node) => {
    return {
        id: node.id,
        label: node.title,
    }
}

const parentOptions = ref([])
const parentOptionsBrand = ref([])

// دریافت داده‌ها
async function getParentOption() {
    try {
        const [categoriesRes, brandsRes, groupsRes] = await Promise.all([
            axios.get("/categories"),
            axios.get("/brands"),
            axios.get("/specification-tree")
        ]);

        parentOptions.value = categoriesRes.data.data.data || [];
        parentOptionsBrand.value = brandsRes.data.data.data || [];
        groups.value = groupsRes.data.data || [];
    } catch (err) {
        console.error('Error loading data:', err);
        toast.error('خطا در بارگذاری اطلاعات');
    }
}

getParentOption();

// واچ کردن تغییرات گروه‌ها
watch(() => selectedGroup.value, (newValue) => {
    // ریست کردن مشخصات
    specifications.value = [];
    selectedSpecifications.value = {};

    newValue.forEach((item) => {
        if (item.specifications && item.specifications.length) {
            item.specifications.forEach((sp) => {
                // مقداردهی اولیه برای هر مشخصه
                selectedSpecifications.value[sp.id] = {
                    custom: '',
                    select: ''
                };
            });
            specifications.value.push(...item.specifications);
        }
    });
}, { deep: true });

// تابع ارسال فرم
const submitForm = async () => {
    // پاک کردن خطاهای قبلی
    Object.keys(errors).forEach(key => delete errors[key]);

    try {
        loading.value = true;
        const formData = new FormData();

        // افزودن فیلدهای فرم
        for (const key in form) {
            if (key === 'images') {
                if (form.images && form.images.length) {
                    form.images.forEach(imgfile => {
                        formData.append("images[]", imgfile);
                    });
                }
            } else if (key === 'image') {
                if (form.image) {
                    formData.append(key, form.image);
                }
            } else if (form[key] !== null && form[key] !== undefined) {
                formData.append(key, form[key]);
            }
        }

        // افزودن مشخصات - استفاده از Object.keys به جای for...in
        const specKeys = Object.keys(selectedSpecifications.value);
        let hasSpecification = false;

        for (const key of specKeys) {
            const spec = selectedSpecifications.value[key];

            // بررسی اینکه آیا مقداری انتخاب شده
            if (spec.select && spec.select !== '') {
                formData.append('specification_id[]', key);
                formData.append('specification_value[]', spec.select);
                hasSpecification = true;
            } else if (spec.custom && spec.custom.trim() !== '') {
                formData.append('specification_id[]', key);
                formData.append('specification_value[]', spec.custom.trim());
                hasSpecification = true;
            }
        }

        // ارسال درخواست
        await axios.post(`/cars`, formData);
        toast.success('ماشین با موفقیت ذخیره شد ✅');

        // ریست کردن فرم
        Object.keys(form).forEach(key => {
            if (key === 'images') {
                form[key] = [];
            } else if (key === 'image') {
                form[key] = '';
            } else {
                form[key] = '';
            }
        });
        selectedGroup.value = [];
        selectedSpecifications.value = {};
        specifications.value = [];

    } catch (err) {
        if (err.response && err.response.status === 422) {
            Object.assign(errors, err.response.data.errors);
            toast.error('لطفاً خطاهای فرم را بررسی کنید ❌');
        } else {
            console.error('Error:', err);
            toast.error('خطا در ارسال اطلاعات ❌');
        }
    } finally {
        loading.value = false;
    }
}
</script>