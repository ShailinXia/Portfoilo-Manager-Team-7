import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import App from '../App.vue';

const routes = [
    {
        path: '/',
        name: 'login',
        component: LoginView
    },
    {
        path: '/portfolio',
        name: 'portfolio',
        component: App,
        meta: { requiresAuth: true }
    },
    {
        path: '/stocks',
        name: 'stocks',
        component: App,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// 简单的路由守卫
router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/');
    } else {
        next();
    }
});

export default router;