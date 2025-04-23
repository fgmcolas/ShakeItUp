<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSidebarPadding } from '../composables/useSidebarPadding';
import CocktailCard from '../components/CocktailCard.vue';

const { paddingClass } = useSidebarPadding();

const cocktails = ref([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const alcoholOnly = ref(false);
const officialOnly = ref(false);
const selectedAlcohol = ref('');
const selectedFlavor = ref('');
const selectedIngredient = ref('');

const alcoholTypes = ['Gin', 'Rum', 'Tequila', 'Vodka', 'Whiskey', 'Triple Sec'];
const flavorStyles = ['Sweet', 'Spicy', 'Fruity', 'Bitter', 'Citrusy'];
const ingredientsList = ref([]);

const fetchCocktails = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/cocktails');
        const data = await res.json();
        cocktails.value = data;

        const allIngredients = data.flatMap(c => c.ingredients);
        ingredientsList.value = [...new Set(allIngredients)].sort((a, b) => a.localeCompare(b));
    } catch (err) {
        error.value = 'Failed to load cocktails.';
    } finally {
        loading.value = false;
    }
};

onMounted(fetchCocktails);

const filteredCocktails = computed(() => {
    return cocktails.value.filter(cocktail => {
        const query = search.value.toLowerCase();

        const matchesSearch =
            cocktail.name.toLowerCase().includes(query) ||
            cocktail.ingredients.some(i => i.toLowerCase().includes(query));

        const matchesAlcohol =
            !alcoholOnly.value || cocktail.alcoholic === false;

        const matchesOfficial =
            !officialOnly.value || cocktail.officialRecipe === true;

        const matchesSelectedAlcohol =
            !selectedAlcohol.value ||
            cocktail.ingredients.some(i =>
                i.toLowerCase().includes(selectedAlcohol.value.toLowerCase())
            );

        const matchesFlavor =
            !selectedFlavor.value ||
            cocktail.flavorStyle?.toLowerCase() === selectedFlavor.value.toLowerCase();

        const matchesIngredient =
            !selectedIngredient.value ||
            cocktail.ingredients.some(i =>
                i.toLowerCase().includes(selectedIngredient.value.toLowerCase())
            );

        return (
            matchesSearch &&
            matchesAlcohol &&
            matchesOfficial &&
            matchesSelectedAlcohol &&
            matchesFlavor &&
            matchesIngredient
        );
    });
});

const resetFilters = () => {
    search.value = '';
    alcoholOnly.value = false;
    officialOnly.value = false;
    selectedAlcohol.value = '';
    selectedFlavor.value = '';
    selectedIngredient.value = '';
};
</script>

<template>
    <div :class="`pt-6 ${paddingClass}`">
        <!-- Search Bar -->
        <div class="px-6 mb-4">
            <input v-model="search" type="text" placeholder="Search cocktails by name or ingredients..."
                class="w-full p-2 rounded bg-[#1e1e1e] text-white" />
        </div>

        <!-- Filters -->
        <div class="px-6 flex flex-wrap gap-4 items-center mb-6">
            <label class="flex items-center gap-2 text-white">
                <input type="checkbox" v-model="alcoholOnly" />
                Non-alcoholic only
            </label>

            <label class="flex items-center gap-2 text-white">
                <input type="checkbox" v-model="officialOnly" />
                Official recipes only
            </label>

            <select v-model="selectedAlcohol" class="p-2 rounded bg-[#1e1e1e] text-white">
                <option value="">-- Alcohol Type --</option>
                <option v-for="alcohol in alcoholTypes" :key="alcohol" :value="alcohol">
                    {{ alcohol }}
                </option>
            </select>

            <select v-model="selectedFlavor" class="p-2 rounded bg-[#1e1e1e] text-white">
                <option value="">-- Flavor Style --</option>
                <option v-for="style in flavorStyles" :key="style" :value="style">
                    {{ style }}
                </option>
            </select>

            <select v-model="selectedIngredient" class="p-2 rounded bg-[#1e1e1e] text-white">
                <option value="">-- Ingredient --</option>
                <option v-for="ing in ingredientsList" :key="ing" :value="ing">
                    {{ ing }}
                </option>
            </select>

            <button @click="resetFilters" class="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500">
                Reset Filters
            </button>
        </div>

        <!-- Loading / Error -->
        <div v-if="loading" class="text-white px-6">Loading...</div>
        <div v-else-if="error" class="text-red-400 px-6">{{ error }}</div>

        <!-- No results -->
        <div v-else-if="filteredCocktails.length === 0" class="text-gray-400 px-6 text-center">
            No cocktails match your filters.
        </div>

        <!-- Cocktails Grid -->
        <div class="px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 slg:grid-cols-4 xxl:grid-cols-5 gap-6">
            <CocktailCard v-for="(cocktail, idx) in filteredCocktails" :key="idx" :cocktail="cocktail" />
        </div>
    </div>
</template>
