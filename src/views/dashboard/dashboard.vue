<template>
    <b-container fluid class="py-4">
        <b-row>
            <b-col cols="12" md="12" lg="12" class="mb-4">
                <b-card class="h-100 shadow-sm">
                    <h5 class="mb-3">👤 کاربران</h5>

                    <b-row v-if="dashboard.users" class="mb-3 text-center">

                        <b-col cols="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد ثبت نامی ها</div>
                            <strong>{{ isNaN(dashboard?.users?.total_users) ? dashboard?.users?.total_users :
                                Number(dashboard?.users?.total_users).toLocaleString() }}</strong>
                        </b-col>
                        <b-col cols="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد ثبت نامی های امروز</div>
                            <strong>{{ isNaN(dashboard?.users?.today_registered) ? dashboard?.users?.today_registered :
                                Number(dashboard?.users?.today_registered).toLocaleString() }}</strong>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>
        <b-row>

            <b-col cols="12" md="12" lg="12" class="mb-4">
                <b-card class="h-100 shadow-sm">
                    <h5 class="mb-3">
                        <i class="bi bi-arrow-left-right"></i>
                        <span>درخواست های خودرو</span>
                    </h5>

                    <b-row v-if="dashboard.car_request" class="mb-3 text-center">

                        <b-col cols="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد کل درخواست ها</div>
                            <strong>{{ Number(dashboard?.car_request?.total_requests).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                        <b-col cols="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد درخواست های طرح فعلی</div>
                            <strong>{{
                                Number(dashboard?.car_request?.requests_in_active_sale_plans).toLocaleString('fa')
                            }}</strong>
                        </b-col>

                        <b-col cols="6" md="3" class="dashboardItem">
                            <div class="small text-muted">میانگین قیمت طرح فعلی</div>
                            <strong>{{
                                Number(Math.floor(dashboard?.car_request?.average_price_in_active_sale_plans)).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>


        </b-row>
        <b-row>
            <b-col cols="12" md="12" lg="12" class="mb-4">
                <b-card class="h-100 shadow-sm">
                    <h5 class="mb-3">
                        <i class="bi bi-bag-fill"></i>
                        <span>طرح های فروش</span>
                    </h5>
                    <b-row v-if="dashboard.sales_plan" class="mb-3 text-center">
                        <b-col cols="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد کل طرح ها</div>
                            <strong>{{ Number(dashboard?.sales_plan?.total_sale_plans).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                        <b-col cols="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد طرح های فعلی</div>
                            <strong>{{
                                Number(dashboard?.sales_plan?.active_sale_plans).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                        <b-col cols="6" md="3" class="dashboardItem">
                            <div class="small text-muted">ماشین های حاضر در طرح فعلی</div>
                            <strong>{{
                                Number(dashboard?.sales_plan?.cars_in_active_sale_plans).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                    </b-row>
                </b-card>
            </b-col>
        </b-row>

        <b-row>
            <b-col cols="12" md="12" lg="12" class="mb-4">
                <b-card class="h-100 shadow-sm">
                    <h5 class="mb-3">
                        <i class="bi bi-car-front"></i>
                        <span>خودرو ها</span>
                    </h5>
                    <b-row v-if="dashboard.cars" class="mb-3 text-center">
                        <b-col cols="6" md="3" class="dashboardItem">
                            <div class="small text-muted">تعداد کل ماشین ها</div>
                            <strong>{{ Number(dashboard?.cars?.total_cars).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                        <b-col cols="6" md="3" class="dashboardItem">
                            <div class="small text-muted">بیشترین قیمت</div>
                            <strong>{{
                                Number(dashboard?.cars?.max_price).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                        <b-col cols="6" md="3" class="dashboardItem">
                            <div class="small text-muted">کمترین قیمت</div>
                            <strong>{{
                                Number(dashboard?.cars?.min_price).toLocaleString('fa')
                            }}</strong>
                        </b-col>
                        <b-col cols="6" md="3" class="dashboardItem">
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
    // axios.get("/startprojects/permission");  
    // axios.get("/startprojects/permission/super-admin"); 
    const { data } = await axios.get("/dashboard");
    dashboard.value = data.data;

    // بروزرسانی نمودار سفارش‌ها
    // orderSeries.value[0].data = Object.values(dashboard.value.orders.by_status || {});
    // orderChartOptions.value.xaxis.categories = Object.keys(dashboard.value.orders.by_status || {});

    // نمودار محصولات
    // productSeries.value = [
    //     dashboard.value.products.active_products || 0,
    //     dashboard.value.products.inactive_products || 0,
    //     dashboard.value.products.out_of_stock || 0,
    // ];

    // نمودار کاربران
    // userSeries.value = [
    //     dashboard.value.users.with_wallet || 0,
    //     dashboard.value.users.without_wallet || 0,
    // ];

    // نمودار دیدگاه‌ها
    // commentSeries.value[0].data = [
    //     dashboard.value.comments.approved || 0,
    //     dashboard.value.comments.pending || 0,
    //     dashboard.value.comments.rejected || 0,
    // ];
});
</script>

<style scoped>
h5 {
    font-size: 1rem;
    font-weight: 600;
}

.small {
    font-size: 0.85rem;
    border-bottom: 1px solid #1213;
    padding-bottom: 8px;
}

.dashboardItem strong {
    width: 100%;
    min-height: 40px;
}

.dashboardItem .small {
    background-color: var(--theme-color);
    color: white !important;
    width: 100%;
    padding: 8px 0;
}

.dashboardItem {
    border: 1px solid #1213;
    border-radius: 8px;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 0 5px #1213;
    padding: 0;
    overflow: hidden;
}
</style>