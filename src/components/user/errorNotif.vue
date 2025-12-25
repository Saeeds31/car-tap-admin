<script setup>
import { BFormTextarea, BButton, BAlert } from "bootstrap-vue-3"
import { ref } from "vue"
import { toast } from 'vue3-toastify'
import axios from 'axios'
import { useRoute } from "vue-router"
const route = useRoute();
const props = defineProps(["step", "registerStep"]);
const emits = defineEmits(["submitError", "approveStep"])
const errorNote = ref(props.registerStep?.error_note || "");
const alertMsg = ref("");

const loader = ref(false);
const submitError = async () => {
    if (loader.value) return;
    if (!errorNote.value.trim()) {
        toast.error("⚠️ لطفا متن خطا را وارد کنید.")

        return;
    }
    loader.value = true;

    try {
        const formData = new FormData();
        formData.append("error_note", errorNote.value)
        await axios.post(`/users/${route.params.id}/register/${props.step}/error`, formData);
        emits("submitError")
        toast.error("✅ پیام خطا تایید شد.")
    } catch (e) {
        console.error(e);
        toast.error("❌ ارسال خطا با مشکل مواجه شد.")
    } finally {
        loader.value = false;
    }

};
const approve = async () => {
    if (loader.value) return;
    loader.value = true;
    try {
        await axios.post(`/users/${route.params.id}/register/${props.step}/approve`);
        toast.error(`✅ مرحله ${props.step} تایید شد.`)
        emits("approveStep");
    } catch (e) {
        toast.error("❌ تایید مرحله با مشکل مواجه شد.")
    } finally {
        loader.value = false;
    }
};
</script>
<template>
    <div class="handlerColumn">
        <div >
            <b-form-textarea v-model="errorNote" rows="2" placeholder="پیغام خطا برای این مرحله..."></b-form-textarea>
            <div class="d-flex justify-content-between mt-2">
                <b-button variant="danger" :class="{ 'opacity-50': loader }" @click="submitError">ارسال خطا</b-button>
                <b-button variant="success" :class="{ 'opacity-50': loader }" @click="approve">تأیید مرحله</b-button>
            </div>
            <b-alert v-if="alertMsg" show variant="info" class="mt-2">{{ alertMsg }}</b-alert>
        </div>

    </div>
</template>
<style>
.handlerColumn {
    margin-top: auto;
}
</style>