<template>
  <b-container fluid class="py-4">
    <b-row>
      <b-col cols="12" lg="8" class="mx-auto">
        <b-card header="ثبت ویژگی جدید">
          <b-form @submit.prevent="submitForm">
            <b-row>
              <b-col cols="12" md="6">
                <b-form-group label="گروه مشخصات " label-for="category_ids">
                  <Treeselect id="category_ids" :multiple="false" v-model="form.group_id" :normalizer="normalizer"
                    :options="groups" placeholder="انتخاب گروه مشخصات " :clearable="true" :valueConsistsOf="'ALL'" />
                </b-form-group>
              </b-col>
              <b-col cols="12" md="6">
                <b-form-group label="عنوان ویژگی" label-for="title">
                  <b-form-input id="title" v-model="form.title" placeholder="مثال: جنس، رنگ، سایز..." required />
                </b-form-group>
              </b-col>

            </b-row>

            <!-- لیست مقادیر -->
            <b-row class="mt-3">
              <b-col cols="12">
                <b-form-group label="مقادیر ویژگی">
                  <div v-for="(value, index) in form.values" :key="index" class="d-flex mb-2">
                    <b-form-input v-model="form.values[index]"
                      placeholder="مقدار ویژگی (مثال: آهنی، آلومینیومی، چوبی)" />
                    <b-button variant="danger" class="ms-2" @click="removeValue(index)">
                      حذف
                    </b-button>
                  </div>

                  <b-button variant="success" @click="addValue">افزودن مقدار</b-button>
                  <b v-if="form.values.length == 1">
                    برای پر کردن مقدار های منتخب نیاز به وارد کردن مقداری نیست
                  </b>
                </b-form-group>
              </b-col>
            </b-row>

            <!-- دکمه ثبت -->
            <b-row>
              <b-col cols="12" class="text-end">

                <b-button :disabled="loading" variant="primary" type="submit">ثبت ویژگی</b-button>
              </b-col>
            </b-row>
          </b-form>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup>
import { ref } from "vue"
import axios from "axios"
import { toast } from "vue3-toastify"
import "vue3-toastify/dist/index.css"
import { useRouter } from "vue-router"
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
const router = useRouter();
const form = ref({
  title: "",
  group_id: null,
  values: [""], // حداقل یک مقدار خالی اول داشته باشه
})
let loading = ref(false);

const addValue = () => {
  form.value.values.push("")
}

const removeValue = (index) => {
  form.value.values.splice(index, 1)
}
const normalizer = (node) => {
  // تبدیل کلیدها به فرمت استاندارد کامپوننت
  return {
    id: node.id,
    label: node.title,
  }
}
let groups = ref([]);
const fetchgroups = async (page = 1) => {
  try {
    const res = await axios.get(`/specifications-group`)
    groups.value = res.data.data.data
  } catch (error) {
    console.error(error)
  }
}
fetchgroups()
const submitForm = async () => {
  loading.value = true;
  try {
    let formData = new FormData();
    formData.append("title", form.value.title)
    formData.append("group_id", form.value.group_id)
    for (const value of form.value.values) {
      if (value && value.trim() !== "") {
        formData.append("values[]", value)
      }
    }
    const { data } = await axios.post("/specifications", formData)
    toast.success("ویژگی و مقادیر با موفقیت ثبت شدند")
    router.push("/specification/list")
    form.value = { title: "", values: [""] }
  } catch (e) {
    console.log(e)
    toast.error("خطا در ثبت ویژگی یا مقادیر")
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.ms-2 {
  margin-inline-start: 0.5rem;
}
</style>
