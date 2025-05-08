<script setup>
import { ref } from 'vue';
import Badge from './Badge.vue';
import FavoriteButton from './FavoriteButton.vue';
import RatingDisplay from './RatingDisplay.vue';
import RatingModal from './RatingModal.vue';
import { useAuth } from '../composables/useAuth';

const props = defineProps({ cocktail: Object });
const auth = useAuth();

const getImageSrc = () => {
    const img = props.cocktail.image;
    if (!img) return '/default-cocktail.jpg';
    return img.startsWith('/uploads') ? `http://localhost:5000${img}` : img;
};

const imageSrc = ref(getImageSrc());
const isRatingModalOpen = ref(false);
const ratingDisplayRef = ref(null);

const handleImageError = () => {
    imageSrc.value = '/default-cocktail.jpg';
};

const handleRatingSubmitted = () => {
    isRatingModalOpen.value = false;
    ratingDisplayRef.value?.refresh?.();
};
</script>

<template>
    <div class="relative bg-[#1e1e1e] rounded-lg shadow-lg overflow-hidden hover:bg-[#2a2a2a] transition duration-200">

        <!-- Image -->
        <div class="w-full h-40 overflow-hidden bg-black">
            <img :src="imageSrc" :alt="cocktail.name" class="w-full h-full object-cover" @error="handleImageError" />
        </div>

        <!-- Favorite -->
        <div v-if="auth.user.value" class="absolute top-2 right-2 z-10">
            <FavoriteButton :cocktailId="cocktail._id" />
        </div>

        <div class="p-4 space-y-2">
            <h2 class="text-lg font-semibold text-cocktail-glow-light">{{ cocktail.name }}</h2>

            <!-- Rating Display -->
            <RatingDisplay ref="ratingDisplayRef" :cocktailId="cocktail._id" />

            <div v-if="auth.user.value">
                <button @click="isRatingModalOpen = true"
                    class="mt-2 px-3 py-1 text-sm rounded bg-cocktail-glow hover:bg-cocktail-glow-light transition">
                    Rate this cocktail
                </button>
            </div>

            <!-- Badges -->
            <div class="flex flex-wrap gap-2">
                <Badge :color="cocktail.alcoholic ? 'red' : 'green'">
                    {{ cocktail.alcoholic ? 'Alcoholic' : 'Non-alcoholic' }}
                </Badge>
                <Badge v-if="cocktail.officialRecipe" color="blue">Official Recipe</Badge>
                <Badge v-if="cocktail.flavorStyle" color="purple">{{ cocktail.flavorStyle }}</Badge>
            </div>

            <p class="text-sm">
                <strong>Ingredients:</strong> {{ cocktail.ingredients.join(', ') }}
            </p>
        </div>

        <!-- Rating Modal -->
        <RatingModal v-if="isRatingModalOpen" :cocktailId="cocktail._id" @close="isRatingModalOpen = false"
            @submitted="handleRatingSubmitted" />
    </div>
</template>
