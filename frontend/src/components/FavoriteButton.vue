<template>
    <button @click="toggleFavorite" :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
        class="favorite-button">
        <!-- Neon pink filled heart (when favorited) -->
        <svg v-if="isFavorite" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="none"
            class="w-6 h-6 neon-heart animate-fade-scale">
            <defs>
                <linearGradient id="neonGradient" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stop-color="#ff00cc" />
                    <stop offset="100%" stop-color="#ff66ff" />
                </linearGradient>
            </defs>
            <path fill="url(#neonGradient)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
             2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 
             3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 
             3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>

        <!-- White outline heart (when not favorited) -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2"
            class="w-6 h-6 hover:scale-110 transition-transform animate-fade-scale">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 
             7.636l1.318-1.318a4.5 4.5 0 1 1 
             6.364 6.364L12 21.364l-7.682-7.682a4.5 
             4.5 0 0 1 0-6.364z" />
        </svg>
    </button>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useAuth } from '../composables/useAuth';

const props = defineProps({
    cocktailId: { type: String, required: true },
});

const auth = useAuth();
const isFavorite = ref(false);

watchEffect(() => {
    isFavorite.value =
        auth.user.value?.favorites?.includes(props.cocktailId) ?? false;
});

const toggleFavorite = async () => {
    if (!auth.user.value || !auth.token.value) {
        console.warn('User not authenticated. Cannot favorite.');
        return;
    }

    try {
        const res = await fetch(
            `http://localhost:5000/api/users/${auth.user.value.id}/favorites`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token.value}`,
                },
                body: JSON.stringify({ cocktailId: props.cocktailId }),
            }
        );

        const data = await res.json();
        if (res.ok) auth.updateFavorites(data.favorites);
    } catch (err) {
        console.error('Error toggling favorite:', err);
    }
};
</script>

<style scoped>
.favorite-button {
    all: unset;
    cursor: pointer;
    padding: 0;
    margin: 0;
    display: inline-flex;
    background-color: transparent !important;
    box-shadow: none !important;
}

.neon-heart {
    filter: drop-shadow(0 0 3px #ff66ff) drop-shadow(0 0 6px #ff00cc);
    transition: transform 0.2s ease-in-out;
}

@keyframes fadeScale {
    from {
        opacity: 0;
        transform: scale(0.8);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.animate-fade-scale {
    animation: fadeScale 0.2s ease-in-out;
}
</style>