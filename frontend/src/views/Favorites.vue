<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useSidebarPadding } from '../composables/useSidebarPadding';
import CocktailCard from '../components/CocktailCard.vue';

const { paddingClass } = useSidebarPadding();
const auth = useAuth();

const loading = ref(true);
const cocktails = ref([]);
const error = ref('');

onMounted(async () => {
    console.log('auth.user:', auth.user.value);
    console.log('auth.token:', auth.token.value);

    if (!auth.user.value?.id || !auth.token.value) {
        error.value = 'User not authenticated.';
        loading.value = false;
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/users/${auth.user.value.id}`, {
            headers: {
                Authorization: `Bearer ${auth.token.value}`,
            },
        });

        const data = await res.json();
        console.log('Fetched favorites:', data.favorites);
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

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CocktailCard v-for="cocktail in cocktails" :key="cocktail._id" :cocktail="cocktail" />
        </div>
    </div>
</template>
