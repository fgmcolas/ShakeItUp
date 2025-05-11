<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useSidebarPadding } from '../composables/useSidebarPadding';
import CocktailCard from '../components/CocktailCard.vue';

const API_URL = import.meta.env.VITE_API_URL;

const { paddingClass } = useSidebarPadding();
const auth = useAuth();

const loading = ref(true);
const cocktails = ref([]);
const error = ref('');

onMounted(async () => {
    if (!auth.user.value?.id || !auth.token.value) {
        error.value = 'User not authenticated.';
        loading.value = false;
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/users/${auth.user.value.id}`, {
            headers: {
                Authorization: `Bearer ${auth.token.value}`,
            },
        });

        const data = await res.json();
        cocktails.value = data.favorites || [];
    } catch (err) {
        console.error('Failed to load favorites:', err);
        error.value = 'Failed to load favorites.';
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div :class="`pt-6 text-white ${paddingClass}`">
        <h1 class="text-3xl font-bold mb-6">
            ❤️ My Favorite Cocktails
        </h1>

        <div v-if="loading" class="text-gray-400">Loading...</div>
        <div v-else-if="error" class="text-red-400">{{ error }}</div>
        <div v-else-if="cocktails.length === 0" class="text-gray-400">
            You haven't added any favorites yet.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <CocktailCard v-for="cocktail in cocktails" :key="cocktail._id" :cocktail="cocktail" />
        </div>
    </div>
</template>
