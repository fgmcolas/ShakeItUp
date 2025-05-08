<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSidebarPadding } from '../composables/useSidebarPadding.js';
import FavoriteButton from '../components/FavoriteButton.vue';
import RatingDisplay from '../components/RatingDisplay.vue';

const route = useRoute();
const cocktail = ref(null);
const error = ref('');
const imageSrc = ref('/default-cocktail.jpg');

const { paddingClass } = useSidebarPadding();

const fetchCocktail = async () => {
    try {
        const res = await fetch(`http://localhost:5000/api/cocktails/${route.params.id}`);
        if (!res.ok) throw new Error('Failed to fetch cocktail details');
        const data = await res.json();
        cocktail.value = data;

        // If a valid image is present, use it
        if (data.image && data.image.trim() !== '') {
            imageSrc.value = data.image.trim();
        }
    } catch (err) {
        error.value = err.message;
    }
};

const handleImageError = () => {
    imageSrc.value = '/default-cocktail.jpg';
};

onMounted(fetchCocktail);
</script>

<template>
    <div :class="`h-full overflow-hidden px-12 py-8 text-white max-w-full ${paddingClass}`">
        <div v-if="error" class="text-red-500">{{ error }}</div>

        <div v-else-if="cocktail" class="grid grid-cols-1 xl:grid-cols-[250px_1fr_300px] gap-8 h-full">
            <!-- Favorites + Score + Ingredients -->
            <div class="flex flex-col space-y-10">
                <!-- Favorite + Score block -->
                <div class="bg-gray-900 p-4 rounded-xl shadow-lg flex flex-col items-center space-y-4">
                    <FavoriteButton :cocktailId="cocktail._id"
                        class="w-10 h-10 hover:scale-110 transition-transform duration-200" />
                    <RatingDisplay :cocktailId="cocktail._id" class="text-2xl font-bold text-yellow-400" />
                </div>

                <!-- Ingredients -->
                <div class="flex-1">
                    <h2 class="text-2xl font-semibold mb-2">Ingredients</h2>
                    <ul class="list-disc list-inside space-y-1">
                        <li v-for="(ing, i) in cocktail.ingredients" :key="i">{{ ing }}</li>
                    </ul>
                </div>
            </div>

            <!-- Center column: Title, Image, Instructions -->
            <div class="flex flex-col justify-start max-w-4xl mx-auto w-full space-y-8">
                <!-- Title -->
                <h1 class="text-4xl font-bold text-center">{{ cocktail.name }}</h1>

                <!-- Image with fallback -->
                <div class="flex justify-center">
                    <img :src="imageSrc"
                        :alt="imageSrc === '/default-cocktail.jpg' ? 'Default placeholder image' : 'Cocktail Image'"
                        @error="handleImageError"
                        class="w-full max-w-3xl max-h-[400px] object-cover rounded-lg shadow-lg" />
                </div>

                <!-- Instructions -->
                <div>
                    <h2 class="text-2xl font-semibold mb-2">Instructions</h2>
                    <p class="leading-relaxed">{{ cocktail.instructions }}</p>
                </div>
            </div>

            <!-- Comments -->
            <div class="pt-6">
                <h2 class="text-2xl font-semibold mb-4">Comments</h2>
                <div v-for="(rating, i) in cocktail.ratings" :key="i" class="mb-4 border-b border-gray-700 pb-2">
                    <p class="font-semibold text-yellow-400">
                        {{ rating.user?.username || 'Anonymous' }} - {{ rating.score }}/5
                    </p>
                    <p>{{ rating.comment || 'No comment' }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
img {
    background-color: #000;
}
</style>
