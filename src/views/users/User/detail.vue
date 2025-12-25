<template>
    <b-container fluid class="py-4">
        <b-row>
            <b-col cols="12" md="12" class="mb-4">
                <h3>جزئیات کاربر: {{ user?.full_name }}</h3>
                <p class="text-muted">شماره موبایل: {{ user?.mobile }}</p>
            </b-col>

            <b-col cols="12" md="12" class="row align-items-center justify-content-start mb-4 px-4" style="gap: 8px;">
                <b-button class="col-md-2" @click="sendSms('approve')" variant="success">
                    ارسال پیامک تایید
                </b-button>

                <b-button class="col-md-2" @click="sendSms('reject')" variant="danger">
                    ارسال پیامک رد
                </b-button>

                <b-button class="col-md-2" v-if="user && !user.referred_by" @click="rejectUser()" variant="warning">
                    رد کاربر بخاطر کد معرف
                </b-button>
                <b-button class="col-md-2" @click="validityModal = true" variant="primary">
                    تمدید کردن اعتبار کاربر
                </b-button>
            </b-col>
        </b-row>

        <b-row v-if="!loading">
            <!-- مرحله ۱ -->
            <b-col md="3" class="mb-4">
                <b-card v-if="user" class="h-100">
                    <h5>
                        {{ ` اطلاعات اصلی:${getStep(1) ? statusLabel(getStep(1).status) : ''}` }}
                    </h5>
                    <ul class="list-unstyled mb-3 detail">
                        <li>
                            <img class="profileImage" :src="imageFinder(user?.image)" alt="بدون تصویر">
                        </li>
                        <li><strong>نام کامل:</strong>
                            <span> {{ user?.full_name }}</span>
                        </li>

                        <li><strong>نام کامل - انگلیسی:</strong>
                            <span> {{ user?.full_name_en }}</span>
                        </li>
                        <li><strong>نام پدر:</strong>
                            <span> {{ user?.father_name }}</span>
                        </li>

                        <li><strong>نام پدر - انگلیسی:</strong>
                            <span> {{ user?.father_name_en }}</span>
                        </li>
                        <li><strong>معرف:</strong>
                            <span> {{ user?.referrer?.full_name }}</span>
                        </li>
                        <li><strong>کد ملی:</strong>
                            <span>
                                {{ user?.national_code }}
                            </span>
                        </li>
                        <li><strong>شماره شناسنامه:</strong>
                            <span>
                                {{ user?.birth_certificate_number }}
                            </span>
                        </li>
                        <li><strong>تاریخ تولد:</strong>
                            <span>
                                {{ formatDate(user?.birth_date) }}
                            </span>
                        </li>
                        <li><strong>وضعیت تاهل:</strong>
                            <span>
                                {{ user?.marital_status ? 'متاهل' : 'مجرد' }}
                            </span>
                        </li>

                        <li><strong>شهر و استان:</strong>
                            <span>
                                {{ user?.city ? `${user.city.province.name} - ${user.city.name}` : "وارد نشده" }}
                            </span>
                        </li>
                        <li><strong>جزئیات آدرس سکونت:</strong>
                            <span>
                                {{ user?.place_of_residence }}
                            </span>
                        </li>
                        <li><strong>کدپستی:</strong>
                            <span>
                                {{ user?.postal_code }}
                            </span>
                        </li>
                    </ul>
                    <ErrorNoteForm v-if="getStep(1)" :step="1" :registerStep="getStep(1)"
                        @submitError="handleErrorSubmit" @approveStep="handleApproveStep" />
                </b-card>
            </b-col>

            <!-- مرحله ۲ -->
            <b-col md="3" class="mb-4">
                <b-card v-if="user" class="h-100">
                    <h5>
                        {{ ` اسناد هویتی :${getStep(2) ? statusLabel(getStep(2).status) : ''}` }}
                    </h5>
                    <ul class="list-unstyled mb-3 detail">
                        <li v-for="(file, key) in filteredKeys(user?.identity_document)" :key="key">
                            <strong>{{ translateKey(key) }}:</strong>
                            <a class="btn btn-primary" :href="fileUrl(file)" target="_blank">دانلود</a>
                        </li>
                    </ul>

                    <ErrorNoteForm v-if="getStep(2)" :step="2" :registerStep="getStep(2)"
                        @submitError="handleErrorSubmit" @approveStep="handleApproveStep" />
                </b-card>
            </b-col>

            <!-- مرحله ۳ -->
            <b-col md="3" class="mb-4">
                <b-card v-if="user" class="h-100">
                    <h5>
                        {{ ` ویژگی‌های فیزیکی :${getStep(3) ? statusLabel(getStep(3).status) : ''}` }}
                    </h5>

                    <ul class="list-unstyled mb-3 detail">
                        <li><strong>قد:</strong> {{ user?.physical?.height }} سانتی‌متر</li>
                        <li><strong>وزن:</strong> {{ user?.physical?.weight }} کیلوگرم</li>
                        <li><strong>گروه خونی:</strong> {{ user?.physical?.blood_type }}</li>
                        <li><strong>رنگ چشم:</strong> {{ user?.physical?.eye_color }}</li>
                        <li><strong>رنگ مو:</strong> {{ user?.physical?.hair_color }}</li>
                    </ul>

                    <ErrorNoteForm v-if="getStep(3)" :step="3" :registerStep="getStep(3)"
                        @submitError="handleErrorSubmit" @approveStep="handleApproveStep" />
                </b-card>
            </b-col>

            <!-- مرحله ۴ -->
            <b-col md="3" class="mb-4">
                <b-card v-if="user" class="h-100">
                    <h5>
                        {{ ` اسناد مهم :${getStep(4) ? statusLabel(getStep(4).status) : ''}` }}
                    </h5>

                    <ul class="list-unstyled mb-3 detail">
                        <li>
                            <strong>آخرین مدرک تحصیلی:</strong>
                            <a class="btn btn-primary" :href="fileUrl(user?.important_document?.last_certificate)"
                                target="_blank">دانلود</a>
                        </li>
                        <li>
                            <strong>سوابق شغلی:</strong>
                            <a class="btn btn-primary" :href="fileUrl(user?.important_document?.career_history)"
                                target="_blank">دانلود</a>
                        </li>
                        <li><strong>مهارت‌ها:</strong> {{ user?.important_document?.skills }}</li>
                    </ul>

                    <ErrorNoteForm v-if="getStep(4)" :step="4" :registerStep="getStep(4)"
                        @submitError="handleErrorSubmit" @approveStep="handleApproveStep" />
                </b-card>
            </b-col>
        </b-row>

        <b-alert v-else show variant="info">در حال دریافت اطلاعات...</b-alert>
        <Modal v-if="validityModal" id="validityModal" @closeModal="() => validityModal = false"
            title="تمدید اعتبار کاربر">
            <p class="alert alert-primary">
                <b>
                    {{
                        user.validity ?
                            "این کاربر تا تاریخ " +
                            new Date(user.validity.to_date).toLocaleDateString("fa")
                            + " اعتبار دارد"
                            : "تاریخ اعتبار این کاربر تمام شده است"
                    }}

                </b>
            </p>
            <p class="alert alert-danger">در صورت وارد کردن تاریخی قبل از تاریخ روز اعتبار کاربر منقضی خواهد شد</p>
            <b-form-group label="تاریخ جدید">
                <date-picker display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" v-model="to_date" />
            </b-form-group>
            <button class="btn btn-primary" @click="setNewValidity()">تایید تاریخ</button>
        </Modal>
    </b-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "@/components/shared/modal.vue";

import ErrorNoteForm from "@/components/user/errorNotif.vue"
import {
    BContainer,
    BRow,
    BCol,
    BCard,
    BFormTextarea,
    BButton,
    BAlert
} from "bootstrap-vue-3";
import { toast } from "vue3-toastify";
let validityModal = ref(false);
const route = useRoute();
const user = ref(null);
const loading = ref(true);
// گرفتن اطلاعات کاربر
const fetchUser = async (killLoading = false) => {
    loading.value = killLoading ? false : true;
    try {
        const { data } = await axios.get(`/users/${route.params.id}`);
        user.value = data;
    } catch (err) {
        console.error("❌ خطا در دریافت اطلاعات کاربر:", err);
    } finally {
        loading.value = false;
    }
};
let to_date = ref(null);
function setNewValidity() {
    if (!to_date.value) {
        return toast.error("لطفا تاریخ تمدید را وارد کنید");
    }
    const fd = new FormData();
    fd.append("to_date", to_date.value);
    axios.post(`/users/${user.value.id}/set-validity`, fd).then(res => {
        toast.success(res.data.message);
        fetchUser();
    }).catch(err => toast.error(err.response.data.message));
    validityModal.value = false;
}
// گرفتن مرحله از آرایه register
const getStep = (step) => user.value?.register?.find((r) => r.step === step);

// فرمت تاریخ
const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("fa-IR") : "-";

// ساخت لینک فایل
const fileUrl = (path) => (path ? window.baseImageAddress + path : "#");

// حذف کلیدهای غیرمفید از object (مثل id و user_id)
const filteredKeys = (obj) => {
    if (!obj) return {};
    const clone = { ...obj };
    delete clone.id;
    delete clone.user_id;
    delete clone.created_at;
    delete clone.updated_at;
    return clone;
};

// ثبت خطای مرحله
const handleErrorSubmit = async () => {
    await fetchUser(true);
};

// تایید مرحله
const handleApproveStep = async () => {

    await fetchUser(true);

};

onMounted(fetchUser);
function translateKey(key) {
    let res = "";
    switch (key) {
        case "national_code":
            res = "کارت ملی";
            break;
        case "birth_certificate_first_page":
            res = "صفحه اول شناسنامه";
            break;
        case "birth_certificate_second_page":
            res = "صفحه دوم شناسنامه";
            break;
        case "end_of_service":
            res = "پایان خدمت";
            break;
        case "no_criminal_record":
            res = "گواهی سوپیشینه";
            break;
        case "non_addiction":
            res = "عدم اعتیاد";
            break;
        case "health_certificate":
            res = "گواهی سلامت";
            break;
        case "educational_exemption":
            res = "معافیت تحصیلی";
            break;
    }
    return res
}
function statusLabel(status) {
    if (status == 'pending') {
        return "درانتظار تایید"
    } else if (status == 'rejected') {
        return "رد شده";
    } else {
        return "تایید شده";
    }
}
function imageFinder(imageSrc) {
    return baseImageAddress + imageSrc
}
const sendSms = (status) => {
    let url = `/users/${user.value.id}/${status == 'approve' ? 'approve' : 'reject'}-sms`
    Swal.fire({
        title: "آیا مطمئن هستید؟",
        text: "این عملیات قابل بازگشت نیست!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "بله، ارسال شود",
        cancelButtonText: "انصراف",
    }).then(async (result) => {
        if (result.isConfirmed) {
            await axios.get(url);
            Swal.fire("موفقیت آمیز!", "پیام ارسال شد", "success");
        }
    });
};
function rejectUser() {
    Swal.fire({
        title: "آیا مطمئن هستید؟",
        text: "این عملیات قابل بازگشت نیست!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "بله، رد شود",
        cancelButtonText: "انصراف",
    }).then(async (result) => {
        if (result.isConfirmed) {
            await axios.get(`/users/${user.value.id}/reject-for-referral`);
            fetchUser();
            Swal.fire("موفقیت آمیز!", "کاربر رد شد", "success");
        }
    });
}
</script>

<style>
ul li {
    margin-bottom: 6px;
}

.detail {
    display: flex;
    flex-direction: column;
}

.detail li {
    display: grid;
    grid-template-columns: 2fr 1fr;
    border: 1px solid #1213;
    padding: 8px;
    margin: 0 !important;
}

.card {
    padding: 8px !important;
}

.card-body {
    justify-content: flex-start;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.profileImage {
    width: 100%;
    grid-column: 1 / 3;
}
</style>