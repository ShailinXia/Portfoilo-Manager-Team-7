import { createRouter, createWebHistory } from 'vue-router';

// import LoginView from '../views/LoginView.vue';
// import App from '../App.vue';
import PortfolioManager from '../components/PortfolioManager.vue';
import StockList from '../components/StockList.vue';
import LoginView from '../views/LoginView.vue';

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
    { path: '/', component: LoginView },
    { path: '/portfolio', component: PortfolioManager },
    { path: '/stocks', component: StockList }
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/');
    } else {
        next();
    }
});

export default router;