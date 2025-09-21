import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import AllCocktails from '../views/AllCocktails.vue';
import Creation from '../views/Creation.vue';
import Ingredients from '../views/Ingredients.vue';

const routes = [
    // Auth-protected pages
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },

    // Guest-only pages
    { path: '/login', component: Login, meta: { guestOnly: true } },
    { path: '/register', component: Register, meta: { guestOnly: true } },

    // Public pages
    { path: '/cocktails', component: AllCocktails },
    { path: '/cocktails/:id', component: () => import('../views/CocktailDetails.vue') }, // lazy loaded
    { path: '/create', component: Creation },
    { path: '/ingredients', component: Ingredients },
    { path: '/favorites', component: () => import('../views/Favorites.vue'), meta: { requiresAuth: true } }, // lazy + protected

    // Fallback: redirect unknown routes
    { path: '/:pathMatch(.*)*', redirect: '/login' },
];

const router = createRouter({
    history: createWebHistory(), // HTML5 history mode
    routes,
});

// Simple auth guards using localStorage (stateless JWT in header)
router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('user');
    if (to.meta.requiresAuth && !isLoggedIn) return next('/login');     // need login
    if (to.meta.guestOnly && isLoggedIn) return next('/dashboard');     // already logged in
    next();
});

export default router;
