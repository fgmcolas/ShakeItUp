<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
    cocktailId: String,
});

const rating = ref(null);
const loading = ref(true);
const error = ref(null);

const fetchRating = async () => {
    loading.value = true;
    try {
        const res = await fetch(`http://localhost:5000/api/ratings/${props.cocktailId}`);
        const data = await res.json();
        rating.value = data;
        error.value = null;
    } catch (err) {
        error.value = 'Error loading rating';
    } finally {
        loading.value = false;
    }
};

onMounted(fetchRating);

defineExpose({
    refresh: fetchRating,
});
</script>

<template>
    <div class="text-sm text-gray-300">
        <span v-if="loading">Loading rating...</span>
        <span v-else-if="error" class="text-red-400">{{ error }}</span>
        <span v-else-if="rating && rating.count > 0">
            ⭐ {{ rating.average }} / 5 ({{ rating.count }} ratings)
        </span>
        <span v-else>No rating yet</span>
    </div>
</template>
