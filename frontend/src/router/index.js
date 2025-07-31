import { createRouter, createWebHistory } from "vue-router";

// import LoginView from '../views/LoginView.vue';
// import App from '../App.vue';
import FundList from "../components/FundList.vue";
import PortfolioManager from "../components/PortfolioManager.vue";
import StockList from "../components/StockList.vue";
import LoginView from "../views/LoginView.vue";

// const routes = [
//     {
//         path: '/',
//         name: 'login',
//         component: LoginView
//     },
//     {
//         path: '/portfolio',
//         name: 'portfolio',
//         component: App,
//         meta: { requiresAuth: true }
//     },
//     {
//         path: '/stocks',
//         name: 'stocks',
//         component: App,
//         meta: { requiresAuth: true }
//     }
// ];
const routes = [
  { path: "/login", component: LoginView, meta: { requiresAuth: true } },
  {
    path: "/portfolio",
    component: PortfolioManager,
    meta: { requiresAuth: true },
  },
  { path: "/stocks", component: StockList, meta: { requiresAuth: true } },
  { path: "/funds", component: FundList, meta: { requiresAuth: true } },
  { path: "/", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  // if (to.meta.requiresAuth && !isAuthenticated) {
  //   next("/");
  // } else {
  //   next();
  // }

  if (to.path !== "/login" && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
