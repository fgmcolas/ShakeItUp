<script setup>
// Cocktail preview card with image, badges, favorites, rating display, and rating modal
import { ref } from 'vue';
import Badge from './Badge.vue';
import FavoriteButton from './FavoriteButton.vue';
import RatingDisplay from './RatingDisplay.vue';
import RatingModal from './RatingModal.vue'; // modal to submit a rating
import { useAuth } from '../composables/useAuth';
import { useRouter } from 'vue-router';

// Props: cocktail object (contains name, image, flags, ingredients, etc.)
const props = defineProps({ cocktail: Object });

const auth = useAuth();       // auth state (user, token, favorites)
const router = useRouter();   // navigation composable

// Cocktail image (fallback if missing or broken)
const imageSrc = ref(props.cocktail.image ? props.cocktail.image : '/default-cocktail.jpg');

// Rating modal state and reference to rating display
const isRatingModalOpen = ref(false);
const ratingDisplayRef = ref(null);

// Reset image to default if it fails to load
const handleImageError = () => {
    imageSrc.value = '/default-cocktail.jpg';
};

// When rating is submitted: close modal and refresh display
const handleRatingSubmitted = () => {
    isRatingModalOpen.value = false;
    ratingDisplayRef.value?.refresh?.(); // call exposed refresh method
};

// Navigate to cocktail details page
const goToDetails = () => {
    router.push(`/cocktails/${props.cocktail._id}`);
};
</script>

<template>
    <!-- Card container -->
    <div class="relative bg-[#1e1e1e] rounded-lg shadow-lg overflow-hidden hover:bg-[#2a2a2a] transition duration-200">

        <!-- Image section (clickable to details) -->
        <div class="w-full h-40 overflow-hidden bg-black cursor-pointer" @click="goToDetails">
            <img :src="imageSrc" :alt="cocktail.name" class="w-full h-full object-cover" @error="handleImageError" />
        </div>

        <!-- Favorite button (only if user logged in) -->
        <div v-if="auth.user.value" class="absolute top-2 right-2 z-10">
            <FavoriteButton :cocktailId="cocktail._id" />
        </div>

        <!-- Card content -->
        <div class="p-4 space-y-2">
            <!-- Cocktail title -->
            <h2 class="text-lg font-semibold text-cocktail-glow-light">
                {{ cocktail.name }}
            </h2>

            <!-- Rating summary (stars + count) -->
            <RatingDisplay ref="ratingDisplayRef" :cocktailId="cocktail._id" />

            <!-- Button to open rating modal (auth only) -->
            <div v-if="auth.user.value">
                <button @click="isRatingModalOpen = true"
                    class="mt-2 px-3 py-1 text-sm rounded bg-cocktail-glow hover:bg-cocktail-glow-light transition">
                    Rate this cocktail
                </button>
            </div>

            <!-- Informative badges -->
            <div class="flex flex-wrap gap-2">
                <Badge :color="cocktail.alcoholic ? 'red' : 'green'">
                    {{ cocktail.alcoholic ? 'Alcoholic' : 'Non-alcoholic' }}
                </Badge>
                <Badge v-if="cocktail.officialRecipe" color="blue">
                    Official Recipe
                </Badge>
                <Badge v-if="cocktail.flavorStyle" color="purple">
                    {{ cocktail.flavorStyle }}
                </Badge>
            </div>

            <!-- Ingredients list -->
            <p class="text-sm">
                <strong>Ingredients:</strong>
                {{ cocktail.ingredients.join(', ') }}
            </p>
        </div>

        <!-- Rating modal (shown only if isRatingModalOpen = true) -->
        <RatingModal v-if="isRatingModalOpen" :cocktailId="cocktail._id" @close="isRatingModalOpen = false"
            @submitted="handleRatingSubmitted" />
    </div>
</template>
