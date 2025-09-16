<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useSidebarPadding } from '../composables/useSidebarPadding';
import CocktailCard from '../components/CocktailCard.vue';

const { paddingClass } = useSidebarPadding();
const API_URL = import.meta.env.VITE_API_URL;

const cocktails = ref([]);
const loading = ref(true);
const error = ref('');
const search = ref('');
const alcoholOnly = ref(false);
const officialOnly = ref(false);
const selectedAlcohol = ref('');
const selectedFlavor = ref('');
const selectedIngredient = ref('');
const sortOption = ref('');

const alcoholTypes = ['Gin', 'Rum', 'Tequila', 'Vodka', 'Whiskey', 'Triple Sec'];
const flavorStyles = ['Sweet', 'Spicy', 'Fruity', 'Bitter', 'Citrusy'];
const ingredientsList = ref([]);

// --- Row-based pagination state ---
const gridRef = ref(null);
const rowsToShow = ref(2);  // start with 2 rows
const columns = ref(1);     // current column count (computed from CSS)

/**
 * Compute the number of columns by reading grid-template-columns from the grid element.
 * This adapts to responsive breakpoints (sm/md/lg/etc.).
 */
const computeColumns = () => {
    if (!gridRef.value) return;
    const style = window.getComputedStyle(gridRef.value);
    const tpl = style.gridTemplateColumns || '';
    const count = tpl.split(' ').filter(Boolean).length || 1;
    columns.value = count;
};

const onResize = () => {
    // Use rAF to avoid layout thrashing on continuous resize
    requestAnimationFrame(computeColumns);
};

onMounted(() => {
    window.addEventListener('resize', onResize, { passive: true });
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
});
// --- end row-based pagination state ---

const fetchCocktails = async () => {
    try {
        const res = await fetch(`${API_URL}/api/cocktails`);
        const data = await res.json();
        cocktails.value = data;

        const allIngredients = data.flatMap(c => c.ingredients);
        ingredientsList.value = [...new Set(allIngredients)].sort((a, b) => a.localeCompare(b));
    } catch (err) {
        error.value = 'Failed to load cocktails.';
    } finally {
        loading.value = false;
        await nextTick(); // ensure grid is in DOM before measuring columns
        computeColumns();
    }
};

onMounted(fetchCocktails);

const filteredCocktails = computed(() => {
    let results = cocktails.value.filter(cocktail => {
        const query = search.value.toLowerCase();

        const matchesSearch =
            cocktail.name.toLowerCase().includes(query) ||
            cocktail.ingredients.some(i => i.toLowerCase().includes(query));

        // Note: "Non-alcoholic only" => must be strictly non-alcoholic
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

    switch (sortOption.value) {
        case 'name-asc':
            results.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            results.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'rating-desc':
            results.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
            break;
        case 'rating-asc':
            results.sort((a, b) => (a.averageRating ?? 0) - (b.averageRating ?? 0));
            break;
    }

    return results;
});

// Visible slice = rowsToShow * columns (adapts to breakpoints)
const maxVisible = computed(() => rowsToShow.value * columns.value);
const visibleCocktails = computed(() => filteredCocktails.value.slice(0, maxVisible.value));

// Reset to 2 rows whenever filters change
watch(
    () => [
        search.value, alcoholOnly.value, officialOnly.value,
        selectedAlcohol.value, selectedFlavor.value, selectedIngredient.value, sortOption.value
    ],
    () => { rowsToShow.value = 2; }
);

// Actions
const loadMoreRows = () => { rowsToShow.value += 2; };

const resetFilters = () => {
    search.value = '';
    alcoholOnly.value = false;
    officialOnly.value = false;
    selectedAlcohol.value = '';
    selectedFlavor.value = '';
    selectedIngredient.value = '';
    sortOption.value = '';
    rowsToShow.value = 2;
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

            <select v-model="sortOption" class="p-2 rounded bg-[#1e1e1e] text-white">
                <option value="">-- Sort By --</option>
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
                <option value="rating-desc">Rating (High to Low)</option>
                <option value="rating-asc">Rating (Low to High)</option>
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

        <!-- Cocktails Grid (row-paginated) -->
        <div ref="gridRef"
            class="px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 slg:grid-cols-4 xxl:grid-cols-5 gap-6">
            <CocktailCard v-for="cocktail in visibleCocktails" :key="cocktail._id" :cocktail="cocktail" />
        </div>

        <!-- Pagination button -->
        <div v-if="visibleCocktails.length < filteredCocktails.length" class="px-6 mt-6 flex justify-center">
            <button @click="loadMoreRows" class="px-4 py-2 mb-6 rounded bg-gray-600 text-white hover:bg-gray-500">
                Load more
            </button>
        </div>
    </div>
</template>
