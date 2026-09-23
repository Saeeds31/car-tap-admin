<template>
  <div class="container mt-3 mt-md-4 px-2 px-md-3">

    <!-- دکمه افزودن نقش -->
    <div class="mb-3 d-flex justify-content-stretch justify-content-sm-end">
      <router-link v-if="checkPermission(['role_store'])" to="/users/roles/create" class="btn btn-success add-btn w-100 w-sm-auto">
        <i class="bi bi-plus"></i>
        <span>افزودن نقش</span>
      </router-link>
    </div>

    <!-- جدول -->
    <div class="card">
      <div class="card-body p-2 p-md-3">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">در حال بارگذاری...</span>
          </div>
        </div>

        <div class="table-box" v-else>
          <!-- ===== نمایش جدول در دسکتاپ ===== -->
          <div class="table-responsive d-none d-md-block">
            <table class="table table-bordered table-striped mb-0">
              <thead>
                <tr>
                  <th>شناسه</th>
                  <th>نام نقش</th>
                  <th>وضعیت بازرس بودن</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="role in roles" :key="role.id">
                  <td>{{ role.id }}</td>
                  <td>{{ role.name }}</td>
                  <td>
                    <span :class="role.supervisor ? 'badge bg-success' : 'badge bg-secondary'">
                      {{ role.supervisor ? "فعال" : "غیرفعال" }}
                    </span>
                  </td>
                  <td v-if="!role.is_system">
                    <div class="d-flex flex-wrap gap-1">
                      <router-link v-if="checkPermission(['role_update'])" :to="`/users/roles/${role.id}/edit`"
                        class="btn btn-sm btn-warning">
                        <i class="bi bi-pen"></i>
                        <span>ویرایش</span>
                      </router-link>

                      <button v-if="checkPermission(['role_delete'])" class="btn btn-sm btn-danger"
                        @click="deleteRole(role.id)">
                        <i class="bi bi-trash3-fill"></i>
                        <span>حذف</span>
                      </button>
                      <button class="btn btn-sm btn-success" v-if="checkPermission(['role_permission'])"
                        @click="showModalPermission(role)">
                        <i class="bi bi-person-exclamation"></i>
                        <span>دسترسی ها</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ===== نمایش کارتی در موبایل ===== -->
          <div class="d-md-none role-cards">
            <div
              v-for="role in roles"
              :key="role.id"
              class="role-card"
            >
              <div class="role-card-header">
                <div class="role-id-badge">#{{ role.id }}</div>
                <div class="role-name">{{ role.name }}</div>
                <span :class="role.supervisor ? 'badge bg-success' : 'badge bg-secondary'">
                  {{ role.supervisor ? "بازرس" : "غیربازرس" }}
                </span>
              </div>

              <div class="role-card-actions" v-if="!role.is_system">
                <router-link v-if="checkPermission(['role_update'])" :to="`/users/roles/${role.id}/edit`"
                  class="btn btn-sm btn-warning flex-fill">
                  <i class="bi bi-pen"></i>
                  <span>ویرایش</span>
                </router-link>

                <button v-if="checkPermission(['role_delete'])" class="btn btn-sm btn-danger flex-fill"
                  @click="deleteRole(role.id)">
                  <i class="bi bi-trash3-fill"></i>
                  <span>حذف</span>
                </button>
                <button class="btn btn-sm btn-success flex-fill" v-if="checkPermission(['role_permission'])"
                  @click="showModalPermission(role)">
                  <i class="bi bi-person-exclamation"></i>
                  <span>دسترسی</span>
                </button>
              </div>

              <!-- برای نقش‌های سیستمی -->
              <div class="role-card-body" v-else>
                <div class="role-system-note">
                  <i class="bi bi-info-circle"></i>
                  <span>نقش سیستمی (غیرقابل ویرایش)</span>
                </div>
              </div>
            </div>

            <!-- حالت خالی -->
            <div v-if="!roles || roles.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              <p>نقشی یافت نشد</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Modal v-if="permissionModal" id="permissionModal" @closeModal="() => permissionModal = false" title="سطح دسترسی">
      <b-form-group label="انتخاب دسترسی ها " label-for="permission_ids">
        <Treeselect id="permission_ids" v-if="allPermissions.length" :multiple="true" v-model="permission_ids"
          :normalizer="normalizer" :options="allPermissions" placeholder="انتخاب دسترسی ها " :clearable="true"
          :valueConsistsOf="'ALL'" />
      </b-form-group>
      <button @click="savePermissions()" class="btn btn-success">
        <i class="bi bi-save"></i>
        <span>ذخیره دسترسی ها</span>
      </button>
    </Modal>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "@/components/shared/modal.vue";
import { BFormGroup } from "bootstrap-vue-3"
import { toast } from "vue3-toastify";
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
let permissionModal = ref(false);
const roles = ref([]);
const loading = ref(false);
let currentUrl = "/roles";
let selectedRoleId = ref(null);
function showModalPermission(role) {
  selectedRoleId.value = role.id;
  permission_ids.value = role.permissions ? role.permissions.map(per => per.id) : [];
  permissionModal.value = true;

}
let permission_ids = ref([]);
const normalizer = (node) => {
  // تبدیل کلیدها به فرمت استاندارد کامپوننت
  return {
    id: node.id,
    label: node.label,
  }
}
async function savePermissions() {
  const fd = new FormData();
  fd.append("role_id", selectedRoleId.value);
  permission_ids.value.forEach((id, index) => {
    fd.append(`ids[${index}]`, id)
  });
  let res = await axios.post('/save-permissions', fd);
  permissionModal.value = false;
  if (res.data.success) {
    toast.success("با موفقیت ثبت شد ")
  } else {
    toast.error('خطایی در ثبت به وجود آمده است مجددا تلاش کنید')
  }
}
const getroles = async (url = currentUrl) => {
  loading.value = true;
  try {
    const { data } = await axios.get(url);
    roles.value = data.data;
    currentUrl = url;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};
let allPermissions = ref([]);
async function getAllPermissions() {
  let res = await axios.get('/all-permissions');
  allPermissions.value = res.data.data;
}
getAllPermissions()
const deleteRole = (id) => {
  Swal.fire({
    title: "حذف نقش",
    text: "آیا مطمئن هستید؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "بله، حذف شود",
    cancelButtonText: "انصراف",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`/roles/${id}`);
        Swal.fire("موفق", "نقش حذف شد", "success");
        getroles();
      } catch (err) {
        Swal.fire("خطا", "مشکلی در حذف پیش آمد", "error");
      }
    }
  });
};

onMounted(() => {
  getroles();
});
</script>

<style scoped>
/* ===== دکمه افزودن ===== */
.add-btn {
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

/* ===== جدول ===== */
.table {
  margin-bottom: 0;
}

.table thead th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2d3436;
  white-space: nowrap;
  font-size: 0.9rem;
}

.table tbody td {
  vertical-align: middle;
  font-size: 0.9rem;
}

.badge {
  font-size: 0.8rem;
  padding: 0.35rem 0.65rem;
}

/* ===== کارت‌های موبایل ===== */
.role-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.role-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.role-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.role-id-badge {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}

.role-name {
  font-weight: 700;
  color: #2d3436;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.role-card-actions {
  display: flex;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.role-card-actions .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.75rem;
  padding: 6px 8px;
  white-space: nowrap;
}

.role-card-actions .btn span {
  display: none;
}

.role-card-body {
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.role-system-note {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6c757d;
  font-size: 0.8rem;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 8px;
}

.role-system-note i {
  color: #6c5ce7;
}

/* ========================================= */
/* ===== موبایل (کمتر از 768px) ===== */
/* ========================================= */
@media (max-width: 767.98px) {
  /* نمایش label دکمه‌ها در موبایل */
  .role-card-actions .btn span {
    display: inline;
  }
}

/* ========================================= */
/* ===== موبایل کوچک (کمتر از 400px) ===== */
/* ========================================= */
@media (max-width: 399.98px) {
  .role-card {
    padding: 12px;
  }

  .role-name {
    font-size: 0.85rem;
  }

  .role-card-actions .btn {
    font-size: 0.7rem;
    padding: 5px 6px;
  }

  .badge {
    font-size: 0.7rem;
    padding: 0.3rem 0.5rem;
  }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
  .role-cards {
    display: none;
  }
}
</style>