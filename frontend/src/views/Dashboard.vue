<script setup>
// Dashboard.vue
// Landing page after login
// Responsibilities:
// - Greet the logged-in user
// - Provide quick navigation to main sections (Cocktails, Ingredients, Creation, Favorites)
// - Handle responsive padding (sidebar vs. mobile)

import { onBeforeUnmount, ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useSidebarStore } from '../stores/sidebar'
import { RouterLink } from 'vue-router'

const auth = useAuth()
const sidebar = useSidebarStore()

// --- Responsive padding (same as useSidebarPadding) ---
const isMobile = ref(window.innerWidth < 768)
const updateIsMobile = () => { isMobile.value = window.innerWidth < 768 }
window.addEventListener('resize', updateIsMobile)
onBeforeUnmount(() => window.removeEventListener('resize', updateIsMobile))

const paddingClass = computed(() =>
    isMobile.value
        ? (sidebar.isOpen ? 'pl-[calc(256px+1.5rem)] pr-6' : 'px-6')
        : 'pl-[calc(256px+1.5rem)] pr-6'
)

// --- Dashboard cards ---
const pages = [
    { name: 'All Cocktails', route: '/cocktails', icon: '/AllCocktails.png' },
    { name: 'My Ingredients', route: '/ingredients', icon: '/MyIngredients.png' },
    { name: 'Creation', route: '/create', icon: '/Creation.png' },
    { name: 'Favorites', route: '/favorites', icon: '/Favorites.png' },
]
</script>

<template>
    <div :class="`flex flex-col items-center justify-center h-screen ${paddingClass}`">
        <!-- Greeting -->
        <h1 class="text-6xl mb-6 text-pink-400 neon-text">
            Welcome, {{ auth.user.value.username || 'Guest' }}!
        </h1>

        <!-- Subtext -->
        <p class="text-xl text-gray-300 mb-10 text-center font-light">
            Welcome to ShakeItUp! Explore a variety of cocktails, find recipes based on your ingredients,
            create your own custom cocktails, and easily access your favorites.
        </p>

        <!-- Navigation cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <RouterLink v-for="page in pages" :key="page.route" :to="page.route"
                class="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img :src="page.icon" alt="Cocktail" class="object-cover w-full h-40 md:h-48 lg:h-56" />
                <span
                    class="card-title absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl font-semibold group-hover:bg-opacity-30 transition duration-300">
                    {{ page.name }}
                </span>
            </RouterLink>
        </div>
    </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');

/* Fancy welcome text with pink neon glow */
.neon-text {
    font-family: 'Great Vibes', cursive;
    text-shadow: 0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899;
}

/* Dark outline around card titles for readability */
.card-title {
    text-shadow:
        1px 1px 1px black,
        -1px 1px 1px black,
        1px -1px 1px black,
        -1px -1px 1px black;
}
</style>
