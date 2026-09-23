<template>
  <div class="container mt-3 mt-md-4 px-2 px-md-3">

    <!-- دکمه افزودن -->
    <div class="mb-3 d-flex justify-content-stretch justify-content-sm-end">
      <router-link v-if="checkPermission(['team_store'])" to="/team/create" class="btn btn-success add-btn w-100 w-sm-auto">
        <i class="bi bi-plus"></i>
        <span>افزودن عضو</span>
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
                  <th>تصویر</th>
                  <th>نام کامل</th>
                  <th>پست</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in team" :key="member.id">
                  <td>{{ member.id }}</td>
                  <td>
                    <img :src="imageFinder(member.image)" class="profile">
                  </td>
                  <td>{{ member.full_name }}</td>
                  <td>{{ member.post }}</td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <router-link v-if="checkPermission(['team_update'])" :to="`/team/${member.id}/edit`"
                        class="btn btn-sm btn-warning">
                        <i class="bi bi-pen"></i>
                        <span>ویرایش</span>
                      </router-link>
                      <button class="btn btn-sm btn-danger" v-if="checkPermission(['team_delete'])"
                        @click="deleteMember(member.id)">
                        <i class="bi bi-trash3-fill"></i>
                        <span>حذف</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ===== نمایش کارتی در موبایل ===== -->
          <div class="d-md-none team-cards">
            <div
              v-for="member in team"
              :key="member.id"
              class="team-card"
            >
              <div class="team-card-header">
                <img :src="imageFinder(member.image)" class="team-profile">
                <div class="team-info">
                  <div class="team-name">{{ member.full_name }}</div>
                  <div class="team-post">{{ member.post }}</div>
                </div>
                <div class="team-id-badge">#{{ member.id }}</div>
              </div>

              <div class="team-card-actions">
                <router-link v-if="checkPermission(['team_update'])" :to="`/team/${member.id}/edit`"
                  class="btn btn-sm btn-warning flex-fill">
                  <i class="bi bi-pen"></i>
                  <span>ویرایش</span>
                </router-link>
                <button class="btn btn-sm btn-danger flex-fill" v-if="checkPermission(['team_delete'])"
                  @click="deleteMember(member.id)">
                  <i class="bi bi-trash3-fill"></i>
                  <span>حذف</span>
                </button>
              </div>
            </div>

            <!-- حالت خالی -->
            <div v-if="!team || team.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              <p>عضوی یافت نشد</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
const currentPage = ref(1)
const team = ref(null);
const loading = ref(false);
let currentUrl = "/teams";
async function getTeam(url) {
  loading.value = true;
  try {
    const { data } = await axios.get(url);
    team.value = data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};



const deleteMember = (id) => {
  Swal.fire({
    title: "حذف عضو",
    text: "آیا مطمئن هستید؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "بله، حذف شود",
    cancelButtonText: "انصراف",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`/teams/${id}`);
        Swal.fire("موفق", "عضو حذف شد", "success");
        getTeam('/teams');
      } catch (err) {
        Swal.fire("خطا", "مشکلی در حذف پیش آمد", "error");
      }
    }
  });
};

onMounted(() => {
  getTeam(currentUrl);
});
function imageFinder(imageSrc) {
  return baseImageAddress + imageSrc
}
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

.table th,
.table td {
  vertical-align: middle;
}

.table thead th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2d3436;
  white-space: nowrap;
  font-size: 0.9rem;
}

.table tbody td {
  font-size: 0.9rem;
}

.profile {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

/* ===== کارت‌های موبایل ===== */
.team-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.team-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.team-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.team-profile {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
  flex-shrink: 0;
}

.team-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.team-name {
  font-weight: 700;
  color: #2d3436;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-post {
  color: #6c757d;
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-id-badge {
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}

.team-card-actions {
  display: flex;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.team-card-actions .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.75rem;
  padding: 6px 8px;
  white-space: nowrap;
}

.team-card-actions .btn span {
  display: none;
}

/* ========================================= */
/* ===== موبایل (کمتر از 768px) ===== */
/* ========================================= */
@media (max-width: 767.98px) {
  /* نمایش label دکمه‌ها در موبایل */
  .team-card-actions .btn span {
    display: inline;
  }
}

/* ========================================= */
/* ===== موبایل کوچک (کمتر از 400px) ===== */
/* ========================================= */
@media (max-width: 399.98px) {
  .team-card {
    padding: 12px;
  }

  .team-profile {
    width: 48px;
    height: 48px;
  }

  .team-name {
    font-size: 0.85rem;
  }

  .team-post {
    font-size: 0.75rem;
  }

  .team-card-actions .btn {
    font-size: 0.7rem;
    padding: 5px 6px;
  }
}

/* ========================================= */
/* ===== دسکتاپ: مخفی کردن کارت‌ها ===== */
/* ========================================= */
@media (min-width: 768px) {
  .team-cards {
    display: none;
  }
}
</style>