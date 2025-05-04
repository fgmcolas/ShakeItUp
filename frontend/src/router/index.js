import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import AllCocktails from '../views/AllCocktails.vue';
import MyBar from '../views/MyBar.vue';
import Ingredients from '../views/Ingredients.vue';

const routes = [
    {
        path: '/dashboard',
        component: Dashboard,
        meta: { requiresAuth: true },
    },
    {
        path: '/login',
        component: Login,
        meta: { guestOnly: true },
    },
    {
        path: '/register',
        component: Register,
        meta: { guestOnly: true },
    },
    {
        path: '/cocktails',
        component: AllCocktails,
    },
    {
        path: '/my-bar',
        component: MyBar,
        meta: { requiresAuth: true },
    },
    {
        path: '/ingredients',
        component: Ingredients,
    },
    {
        path: '/favorites',
        component: () => import('../views/Favorites.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login',
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('user');

    if (to.meta.requiresAuth && !isLoggedIn) {
        return next('/login');
    }

    if (to.meta.guestOnly && isLoggedIn) {
        return next('/dashboard');
    }

    next();
});

export default router;
