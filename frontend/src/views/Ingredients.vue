<script setup>
import { ref, onMounted } from 'vue';
import { useSidebarPadding } from '../composables/useSidebarPadding';

const { paddingClass } = useSidebarPadding();

const ingredients = ref([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
    try {
        const res = await fetch('http://localhost:5000/api/cocktails');
        const cocktails = await res.json();
        const allIngredients = cocktails.flatMap(c => c.ingredients);
        const uniqueIngredients = [...new Set(allIngredients)].sort((a, b) => a.localeCompare(b));
        ingredients.value = uniqueIngredients;
    } catch (err) {
        error.value = 'Failed to load ingredients.';
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div :class="`pt-6 text-white ${paddingClass}`">
        <h1 class="text-3xl font-bold mb-6">
            Ingredients List <span>🧂</span>
        </h1>
        <div v-if="loading">Loading...</div>
        <div v-else-if="error" class="text-red-400">{{ error }}</div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div v-for="ingredient in ingredients" :key="ingredient"
                class="bg-[#1e1e1e] h-12 flex items-center justify-center rounded shadow hover:bg-[#2a2a2a] transition duration-200 text-white font-medium text-center">
                {{ ingredient }}
            </div>
        </div>
    </div>
</template>
