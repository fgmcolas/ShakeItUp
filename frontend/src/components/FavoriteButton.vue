<script setup>
// FavoriteButton.vue
// Heart toggle button that lets a logged-in user add/remove a cocktail
// from their favorites list. Syncs state with backend and updates local store.

import { ref, watchEffect } from 'vue';
import { useAuth } from '../composables/useAuth';

// Props: cocktailId to favorite/unfavorite
const props = defineProps({
    cocktailId: { type: String, required: true },
});

const auth = useAuth();       // access auth store (user, token, helpers)
const user = auth.user;       // reactive current user
const isFavorite = ref(false); // local flag: is this cocktail in favorites?

// Keep isFavorite updated whenever user.favorites changes
watchEffect(() => {
    const favs = user.value?.favorites ?? [];
    // Map favorites (may be string ids or objects with _id)
    const ids = favs.map(f => (typeof f === 'string' ? f : f?._id)).filter(Boolean);
    isFavorite.value = ids.includes(props.cocktailId);
});

// Toggle favorite state in backend and update local auth store
async function toggleFavorite(event) {
    event.stopPropagation(); // prevent click bubbling to parent elements
    event.preventDefault();  // prevent unwanted navigation

    if (!user.value) return; // skip if not logged in

    const userId = user.value._id || user.value.id;
    const API_URL = import.meta.env.VITE_API_URL;

    try {
        // Call backend PATCH endpoint to toggle favorite
        const res = await fetch(`${API_URL}/api/users/${userId}/favorites`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.token.value}`, // auth required
            },
            body: JSON.stringify({ cocktailId: props.cocktailId }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error('Failed to update favorites:', err.error || res.status);
            return;
        }

        // On success: backend returns updated favorites list
        const data = await res.json();
        auth.updateFavorites(data.favorites); // sync with auth store
    } catch (err) {
        console.error('Error toggling favorite:', err);
    }
}
</script>

<template>
    <!-- Button toggles filled vs outline heart depending on isFavorite -->
    <button @click="toggleFavorite" class="favorite-button">
        <!-- Filled neon heart (active favorite) -->
        <svg v-if="isFavorite" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
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

        <!-- Outline heart (not in favorites) -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2"
            class="w-6 h-6 hover:scale-110 transition-transform animate-fade-scale">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 
                   7.636l1.318-1.318a4.5 4.5 0 1 1 
                   6.364 6.364L12 21.364l-7.682-7.682a4.5 
                   4.5 0 0 1 0-6.364z" />
        </svg>
    </button>
</template>

<style scoped>
.favorite-button {
    all: unset;
    /* reset browser styles */
    cursor: pointer;
    display: inline-flex;
}

/* Neon glow effect for filled heart */
.neon-heart {
    filter: drop-shadow(0 0 3px #ff66ff) drop-shadow(0 0 6px #ff00cc);
    transition: transform 0.2s;
}
</style>
