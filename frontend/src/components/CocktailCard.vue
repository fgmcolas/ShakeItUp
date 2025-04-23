<script setup>
import { ref } from 'vue';
import Badge from './Badge.vue';

const props = defineProps({
    cocktail: Object
});

const fallbackImage = '/default-cocktail.jpg';
const imageSrc = ref(props.cocktail.image);

const handleImageError = () => {
    imageSrc.value = fallbackImage;
};
</script>

<template>
    <div class="bg-[#1e1e1e] rounded-lg shadow-lg overflow-hidden hover:bg-[#2a2a2a] transition duration-200">
        <!-- Image wrapper -->
        <div class="w-full h-40 overflow-hidden bg-black">
            <img :src="imageSrc" :alt="cocktail.name" class="w-full h-full object-cover" @error="handleImageError" />
        </div>

        <div class="p-4 space-y-2">
            <h2 class="text-lg font-semibold text-cocktail-glow-light">{{ cocktail.name }}</h2>

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

            <p class="text-sm">
                <strong>Ingredients:</strong> {{ cocktail.ingredients.join(', ') }}
            </p>
        </div>
    </div>
</template>
