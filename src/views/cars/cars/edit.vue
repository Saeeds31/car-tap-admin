<template>
  <div class="p-4">
    <b-card title="ویرایش ماشین جدید">
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
              <b-form-input id="price" v-model="form.price" :state="!errors.price" placeholder="قیمت ماشین" />
              <b-form-invalid-feedback v-if="errors.price">{{ errors.price[0] }}</b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col cols="12">
            <b-form-group label="تصاویر">

              <VueFileAgent @update:rawModelValue="imageDeleted" @select="imagesLoaded"
                v-model:rawModelValue="oldImages" :multiple="true" accept=".jpg,.png,.pdf" theme="grid" deletable
                sortable />
            </b-form-group>
          </b-col>
          <b-col v-if="parentOptions.length" cols="12" md="6">
            <b-form-group label="دسته‌بندی " label-for="category_id">
              <Treeselect id="category_id" :multiple="false" v-model="form.category_id" :normalizer="normalizer"
                :options="parentOptions" placeholder="انتخاب دسته‌بندی " :clearable="true" :valueConsistsOf="'ALL'" />
              <b-form-invalid-feedback v-if="errors.category_id">{{ errors.category_id[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </b-col>

          <b-col cols="12" md="6" v-if="parentOptionsBrand.length">
            <b-form-group label="برند " label-for="brand_id">
              <Treeselect id="brand_id" :multiple="false" v-model="form.brand_id" :normalizer="normalizer"
                :options="parentOptionsBrand" placeholder="انتخاب برند " :clearable="true" :valueConsistsOf="'ALL'" />
              <b-form-invalid-feedback v-if="errors.brand_id">{{ errors.brand_id[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col v-if="selectedGroup" cols="12" md="12">
            <label>انتخاب گروه مشخصات:</label>
            <Treeselect :valueFormat="'object'" v-model="selectedGroup" :multiple="true" :options="groups"
              :normalizer="normalizer" />
          </b-col>
          <b-col v-if="selectedGroup && selectedGroup.length" cols="12" md="12">
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
                      <select class="form-control" v-model="selectedSpecifications[item.id]['select']">
                        <option v-for="val in item.values" :key="index" :value="val.id">{{
                          val.value
                        }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <input type="text" class="form-control" v-model="selectedSpecifications[item.id]['custom']">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </b-col>

          <!-- Image -->
          <b-col cols="12" md="12">
            <b-form-group label="تصویر (URL)">

              <VueFileAgent @select="imageLoaded" @update:rawModelValue="changeMainImage"
                :raw-model-value="oldMainImage" :maxFiles="1" accept=".jpg,.png" theme="grid" deletable sortable />
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
import { reactive, ref, onMounted } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { BForm, BFormGroup, BFormInput, BFormTextarea, BButton, BCard, BRow, BCol, BFormInvalidFeedback } from 'bootstrap-vue-3'
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
import { useAdmin } from '@/stores/modules/admin';
import { watch } from 'vue'
import { useRoute, useRouter } from "vue-router"
const route = useRoute();
const router = useRouter();
const store = useAdmin();
const checkPermission = store.checkPermission;
const form = reactive({
  name: '',
  description: '',
  price: "",
  image: '',
  category_id: null,
  brand_id: null,
  images: []
})
let backupImages = ref([])
let deleted_images = ref([]);
let oldImages = ref([])
let oldMainImage = ref([])

function imageDeleted(files) {
  backupImages.value.forEach(
    (oldimg, index) => {
      let finded = files.find((newImg) => newImg.id == oldimg.id);
      if (!finded) {
        deleted_images.value.push(oldimg.id);
        backupImages.value.splice(index, 1)
      }
    }
  );
}
let loading = ref(false);
let selectedGroup = ref(null);
watch(() => selectedGroup.value, (newValue) => {
  specifications.value = [];
  newValue.forEach((item) => {
    item.specifications.forEach((sp) => {
      let select = null;
      if (firstInitiSpecificationFlag.value) {
        let findedgroup = oldSpecificationRecivedFromServer.value.find((oldgroup) => oldgroup.group_id == item.id);
        if (findedgroup) {
          let findedspecification = findedgroup.items.find((specificationItem) => specificationItem.specification_id == sp.id);
          if (findedspecification) {
            select = findedspecification.value_id
          }
        }
      }
      selectedSpecifications.value[sp.id] = {
        custom: null,
        select: select
      };
    })
    specifications.value.push(...item.specifications)
  })
  if (firstInitiSpecificationFlag.value) {
    firstInitiSpecificationFlag.value = false;
  }
})
let oldSpecificationRecivedFromServer = ref([])
function initSpecifications(spegroups) {
  let finalArr = [];
  oldSpecificationRecivedFromServer.value = spegroups;
  spegroups.forEach((spg) => {
    let finded = groups.value.find((gr) => gr.id === spg.group_id);
    if (finded) {
      finalArr.push(finded);
    }
  })
  selectedGroup.value = finalArr;
  firstInitiSpecificationFlag.value = true;
}
let firstInitiSpecificationFlag = ref(false);
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
function changeMainImage() {
  console.log("are");

  if (!mainImageDeleted.value) {
    mainImageDeleted.value = true;
  }
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
}

let mainImageDeleted = ref(false);
let car = ref(null);
const submitForm = async () => {

  Object.keys(errors).forEach(key => delete errors[key])
  try {
    loading.value = true;
    const formData = new FormData()
    for (const key in form) {
      console.log(key);

      if (key === 'images') {
        form.images.forEach(imgfile => {
          formData.append("images[]", imgfile)
        })
      } else if (key == "image") {
        if (form.image) {
          formData.append(key, form.image)
        }
        else {
          formData.append(key, car.value.image)
        }
      } else {
        formData.append(key, form[key] ?? '')
      }
    }
    if (deleted_images.value.length) {
      deleted_images.value.forEach(id => {
        formData.append("deleted_images[]", id)
      })
    };
    formData.append("_method", "PUT")
    for (const key in selectedSpecifications.value) {
      if (selectedSpecifications.value[key]['custom']) {
        formData.append(`specification_id[]`, key)
        formData.append(`specification_value[]`, selectedSpecifications.value[key]['custom'])

      } else if (selectedSpecifications.value[key]['select']) {
        formData.append(`specification_id[]`, key)
        formData.append(`specification_value[]`, selectedSpecifications.value[key]['select'])
      }
    }
    await axios.post(`/cars/${route.params.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }

    })
    toast.success('ماشین با موفقیت ذخیره شد ✅')
    setTimeout(() => {
      router.push('/cars/list')

    }, 2000);
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
onMounted(async () => {
  try {
    await axios.get("/specification-tree").then((res) => {
      groups.value = res.data.data
    })
    const res = await axios.get(`/cars/${route.params.id}`);
    car.value = res.data.data.car;
    initSpecifications(res.data.data.specifications)
    if (res.data.data.car.image)
      oldMainImage.value =
        [{
          name: res.data.data.car.image?.split('/').pop(),
          size: 0,
          type: 'image/jpeg',
          ext: res.data.data.car.image.split('.').pop(),
          url: `${baseImageAddress}${res.data.data.car.image}`,
        }];
    if (res.data.data.car.images && res.data.data.car.images.length) {
      backupImages.value = res.data.data.car.images;

      let images = [];
      res.data.data.car.images.forEach((img) => {
        images.push(
          {
            id: img.id,
            name: img.path.split('/').pop(),
            size: 0,
            type: 'image/jpeg',
            ext: img.path.split('.').pop(),
            url: `${baseImageAddress}${img.path}`,
          }
        )
      })
      oldImages.value = images;
    }
    form.name = car.value.name;
    form.description = car.value.description;
    form.image = '';
    form.category_id = car.value.category_id;
    form.price = car.value.price;
    form.brand_id = car.value.brand_id;
    form.images = []
    getParentOption()
  } catch (err) {
    console.log(err);
    toast.error('خطا در دریافت اطلاعات ماشین ❌')
  }
})
</script>