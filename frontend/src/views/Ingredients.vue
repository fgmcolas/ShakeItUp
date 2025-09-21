<script setup>
// Ingredients.vue
// "Fridge" page to select ingredients and see which cocktails you can make
// Responsibilities:
// - Toggle ingredients and persist selection per user in localStorage
// - Fetch all cocktails to build the ingredient catalog
// - Compute cocktails craftable with the selected ingredients
// - Use sidebar-aware responsive padding

import { ref, onMounted, computed, watch } from 'vue'
import { useSidebarPadding } from '../composables/useSidebarPadding'
import { useAuth } from '../composables/useAuth'
import FavoriteButton from '../components/FavoriteButton.vue'

const API_URL = import.meta.env.VITE_API_URL;
const { paddingClass } = useSidebarPadding();
const auth = useAuth();

// --- State ---
const ingredients = ref([]);            // all known ingredients
const selectedIngredients = ref([]);    // "fridge" contents
const cocktails = ref([]);              // all cocktails from API
const error = ref('');
const loading = ref(true);
const fridgeCleared = ref(false);

// Per-user storage key (falls back to "guest")
const storageKey = auth.fridgeKey;

// Load initial data and restore persisted selection
onMounted(async () => {
    const stored = localStorage.getItem(storageKey.value);
    if (stored) selectedIngredients.value = JSON.parse(stored);

    try {
        const res = await fetch(`${API_URL}/api/cocktails`);
        const data = await res.json();
        cocktails.value = data;

        // Build unique, sorted ingredient list from cocktails
        const allIngredients = data.flatMap(c => c.ingredients);
        ingredients.value = [...new Set(allIngredients)].sort((a, b) => a.localeCompare(b));
    } catch {
        error.value = 'Failed to load data.';
    } finally {
        loading.value = false;
    }
})

// Persist fridge selection per user
watch(
    selectedIngredients,
    (val) => localStorage.setItem(storageKey.value, JSON.stringify(val)),
    { deep: true }
);

// Cocktails for which *all* ingredients are available
const availableCocktails = computed(() => {
    if (selectedIngredients.value.length === 0) return [];
    return cocktails.value.filter(c =>
        c.ingredients.every(i => selectedIngredients.value.includes(i))
    );
});

// --- UI actions ---
function toggleIngredient(ingredient) {
    const index = selectedIngredients.value.indexOf(ingredient);
    if (index > -1) selectedIngredients.value.splice(index, 1);
    else selectedIngredients.value.push(ingredient)
}

function clearFridge() {
    selectedIngredients.value = []
    fridgeCleared.value = true
    setTimeout(() => { fridgeCleared.value = false }, 2000) // 2s toast
}
</script>

<template>
    <div :class="`pt-6 text-white ${paddingClass}`" class="flex flex-col gap-10">
        <!-- Ingredients selector -->
        <div>
            <div class="flex justify-between items-center mb-4 relative">
                <h2 class="text-2xl font-bold">🧂 My Ingredients (Fridge)</h2>
                <div class="flex items-center gap-2">
                    <transition name="fade">
                        <span v-if="fridgeCleared" class="text-sm text-green-400">Fridge cleared</span>
                    </transition>
                    <button v-if="selectedIngredients.length > 0" @click="clearFridge"
                        class="text-sm font-semibold text-[#fff7ed] bg-orange-500 hover:bg-pink-500 px-3 py-1 rounded-md transition-all duration-200 active:scale-95 shadow">
                        Clear
                    </button>
                </div>
            </div>

            <div v-if="loading">Loading...</div>
            <div v-else-if="error" class="text-red-400">{{ error }}</div>

            <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div v-for="ingredient in ingredients" :key="ingredient" @click="toggleIngredient(ingredient)" :class="[
                    'cursor-pointer h-10 flex items-center justify-center rounded transition duration-200 text-center font-medium',
                    selectedIngredients.includes(ingredient)
                        ? 'bg-green-600 text-white shadow'
                        : 'bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white'
                ]">
                    {{ ingredient }}
                </div>
            </div>
        </div>

        <!-- Craftable cocktails list -->
        <div>
            <h2 class="text-2xl font-bold mb-4">🍹 Cocktails You Can Make</h2>

            <div v-if="selectedIngredients.length === 0" class="text-gray-400">
                Select ingredients to see available cocktails.
            </div>
            <div v-else-if="availableCocktails.length === 0" class="text-red-400">
                No cocktails can be made with your selected ingredients.
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <router-link v-for="cocktail in availableCocktails" :key="cocktail._id"
                    :to="`/cocktails/${cocktail._id}`"
                    class="flex items-center justify-between bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-xl px-4 py-3 shadow transition duration-200 text-white font-semibold">
                    <span class="text-lg">{{ cocktail.name }}</span>
                    <FavoriteButton :cocktailId="cocktail._id" />
                </router-link>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Small fade for the "Fridge cleared" toast */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
