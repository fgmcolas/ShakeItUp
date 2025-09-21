<script setup>
// RatingDisplay.vue
// Read-only rating summary (average + count) for a given cocktail.
// Fetches rating data from backend and displays stars + text.

// Vue imports
import { ref, onMounted } from 'vue';

// Props: cocktailId to fetch ratings for
const props = defineProps({ cocktailId: String });

// API base URL (from .env)
const API_URL = import.meta.env.VITE_API_URL;

// Local state
const rating = ref(null);   // { average, count } object from backend
const loading = ref(true);  // shows "Loading..." while fetching
const error = ref(null);    // error message if request fails

// Fetch average + count for given cocktailId
const fetchRating = async () => {
    loading.value = true;
    try {
        const res = await fetch(`${API_URL}/api/ratings/${props.cocktailId}`);
        const data = await res.json();
        rating.value = data; // expected shape: { average: number, count: number }
        error.value = null;
    } catch {
        error.value = 'Error loading rating';
    } finally {
        loading.value = false;
    }
};

// Fetch rating once component is mounted
onMounted(fetchRating);

// Expose `refresh()` so parent can manually re-fetch after new rating
defineExpose({ refresh: fetchRating });
</script>

<template>
    <div class="text-sm text-gray-300">
        <!-- Loading state -->
        <span v-if="loading">Loading rating...</span>

        <!-- Error state -->
        <span v-else-if="error" class="text-red-400">{{ error }}</span>

        <!-- Valid rating data -->
        <span v-else-if="rating && rating.count > 0">
            ⭐ {{ rating.average }} / 5 ({{ rating.count }} ratings)
        </span>

        <!-- No ratings yet -->
        <span v-else>No rating yet</span>
    </div>
</template>
