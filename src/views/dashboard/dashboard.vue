<template>
    <b-container fluid class="py-3 py-md-4 px-2 px-md-3">
        <b-row class="g-3">
            <b-col cols="12" md="12" lg="12" class="mb-2 mb-md-4">
                <b-card class="h-100 shadow-sm dashboard-card">
                    <h5 class="mb-3 card-title">
                        <i class="bi bi-person"></i>
                        <span>کاربران</span>
                    </h5>

                    <b-row v-if="dashboard.users" class="g-2 g-md-3 text-center">

                        <b-col cols="12" sm="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد ثبت نامی ها</div>
                            <strong>{{ isNaN(dashboard?.users?.total_users) ? dashboard?.users?.total_users :
                                Number(dashboard?.users?.total_users).toLocaleString() }}</strong>
                        </b-col>
                        <b-col cols="12" sm="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد ثبت نامی های امروز</div>
                            <strong>{{ isNaN(dashboard?.users?.today_registered) ? dashboard?.users?.today_registered :
                                Number(dashboard?.users?.today_registered).toLocaleString() }}</strong>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>
        <b-row class="g-3">

            <b-col cols="12" md="12" lg="12" class="mb-2 mb-md-4">
                <b-card class="h-100 shadow-sm dashboard-card">
                    <h5 class="mb-3 card-title">
                        <i class="bi bi-arrow-left-right"></i>
                        <span>درخواست های خودرو</span>
                    </h5>

                    <b-row v-if="dashboard.car_request" class="g-2 g-md-3 text-center">

                        <b-col cols="12" sm="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد کل درخواست ها</div>
                            <strong>{{ Number(dashboard?.car_request?.total_requests).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                        <b-col cols="12" sm="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد درخواست های طرح فعلی</div>
                            <strong>{{
                                Number(dashboard?.car_request?.requests_in_active_sale_plans).toLocaleString('fa')
                            }}</strong>
                        </b-col>

                        <b-col cols="12" sm="6" md="3" class="dashboardItem">
                            <div class="small text-muted">میانگین قیمت طرح فعلی</div>
                            <strong>{{
                                Number(Math.floor(dashboard?.car_request?.average_price_in_active_sale_plans)).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>


        </b-row>
        <b-row class="g-3">
            <b-col cols="12" md="12" lg="12" class="mb-2 mb-md-4">
                <b-card class="h-100 shadow-sm dashboard-card">
                    <h5 class="mb-3 card-title">
                        <i class="bi bi-bag-fill"></i>
                        <span>طرح های فروش</span>
                    </h5>
                    <b-row v-if="dashboard.sales_plan" class="g-2 g-md-3 text-center">
                        <b-col cols="12" sm="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد کل طرح ها</div>
                            <strong>{{ Number(dashboard?.sales_plan?.total_sale_plans).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                        <b-col cols="12" sm="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد طرح های فعلی</div>
                            <strong>{{
                                Number(dashboard?.sales_plan?.active_sale_plans).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                        <b-col cols="12" sm="6" md="3" class="dashboardItem">
                            <div class="small text-muted">ماشین های حاضر در طرح فعلی</div>
                            <strong>{{
                                Number(dashboard?.sales_plan?.cars_in_active_sale_plans).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <b-row class="g-3">
            <b-col cols="12" md="12" lg="12" class="mb-2 mb-md-4">
                <b-card class="h-100 shadow-sm dashboard-card">
                    <h5 class="mb-3 card-title">
                        <i class="bi bi-car-front"></i>
                        <span>خودرو ها</span>
                    </h5>
                    <b-row v-if="dashboard.cars" class="g-2 g-md-3 text-center">
                        <b-col cols="12" sm="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد کل ماشین ها</div>
                            <strong>{{ Number(dashboard?.cars?.total_cars).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                        <b-col cols="12" sm="6" md="3" class="dashboardItem">
                            <div class="small text-muted">بیشترین قیمت</div>
                            <strong>{{
                                Number(dashboard?.cars?.max_price).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                        <b-col cols="12" sm="6" md="3" class="dashboardItem">
                            <div class="small text-muted">کمترین قیمت</div>
                            <strong>{{
                                Number(dashboard?.cars?.min_price).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                        <b-col cols="12" sm="6" md="3" class="dashboardItem">
                            <div class="small text-muted">میانگین قیمت ماشین ها</div>
                            <strong>{{
                                Number(dashboard?.cars?.average_price).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import ApexChart from "vue3-apexcharts";

const dashboard = ref({
    orders: {},
    products: {},
    users: {},
    comments: {},
});

// برچسب‌ها فارسی
const courseLabel = {
    total_brochures: "کل جزوات",
    total_courses: "مجموع دوره ها",
    total_exams: "مجموع آزمون ها",

};

const course_order_label = {
    allowed_to_exam: "آزمون های برگزار نشده",
    paid_orders: "پرداختی ها",
    today_orders: "تعداد فروش امروز",
    total_debt_balance: "جمع طلب",
    total_orders: "تعداد فروش دوره",
    total_paid_amount: "جمع پرداختی ها",
};


const commentLabels = {
    total_comments: "کل دیدگاه‌ها",
    approved: "تأیید شده",
    pending: "در انتظار",
    rejected: "رد شده",
    with_rating: "با امتیاز",
    average_rating: "میانگین امتیاز",
    today_comments: "امروز",
    this_month: "این ماه",
};

// نمودارها
// const orderSeries = ref([{ name: "سفارش‌ها", data: [] }]); 
const orderChartOptions = ref({ chart: { id: "orders" }, xaxis: { categories: [] } });

// const productSeries = ref([]);
const productChartOptions = ref({ labels: ["فعال", "غیرفعال", "ناموجود"] });

// const userSeries = ref([]);
const userChartOptions = ref({ labels: ["دارای کیف پول", "بدون کیف پول"] });

// const commentSeries = ref([{ name: "دیدگاه‌ها", data: [] }]);
const commentChartOptions = ref({ chart: { id: "comments" }, xaxis: { categories: ["تأیید شده", "در انتظار", "رد شده"] } });

// دریافت داده از API
onMounted(async () => {
    const { data } = await axios.get("/dashboard");
    dashboard.value = data.data;
});
</script>

<style scoped>
/* ===== کارت‌ها ===== */
.dashboard-card {
    border-radius: 12px;
    border: 1px solid #eef0f2;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.dashboard-card:hover {
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08) !important;
    transform: translateY(-2px);
}

/* ===== عنوان کارت ===== */
.card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    font-weight: 600;
    color: #2d3436;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 14px !important;
}

.card-title i {
    color: #6c5ce7;
    font-size: 1.15rem;
}

/* ===== آیتم‌های داشبورد ===== */
.dashboardItem {
    border: 1px solid #1213;
    border-radius: 10px;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 0 5px #1213;
    padding: 0;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboardItem:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.dashboardItem strong {
    width: 100%;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    font-weight: 700;
    color: #2d3436;
    padding: 4px 8px;
}

.dashboardItem .small {
    background-color: var(--theme-color);
    color: white !important;
    width: 100%;
    padding: 8px 6px;
    font-size: 0.8rem;
    text-align: center;
    border-bottom: none;
}

/* ========================================= */
/* ===== موبایل (کمتر از 768px) ===== */
/* ========================================= */
@media (max-width: 767.98px) {
    .card-title {
        font-size: 0.95rem;
        justify-content: flex-start;
    }

    .dashboardItem {
        min-height: 90px;
    }

    .dashboardItem strong {
        font-size: 1rem;
        min-height: 36px;
    }

    .dashboardItem .small {
        font-size: 0.75rem;
        padding: 6px 4px;
    }
}

/* ========================================= */
/* ===== موبایل کوچک (کمتر از 400px) ===== */
/* ========================================= */
@media (max-width: 399.98px) {
    .card-title {
        font-size: 0.9rem;
        gap: 6px;
    }

    .card-title i {
        font-size: 1rem;
    }

    .dashboardItem {
        min-height: 80px;
    }

    .dashboardItem strong {
        font-size: 0.9rem;
        min-height: 32px;
    }

    .dashboardItem .small {
        font-size: 0.7rem;
        padding: 5px 3px;
    }
}
</style>