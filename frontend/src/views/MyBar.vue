<script setup>
import { ref, onBeforeUnmount, computed } from 'vue'; // ✅ `computed` ajouté
import { useSidebarStore } from '../stores/sidebar';

const sidebar = useSidebarStore();

const isMobile = ref(window.innerWidth < 768);
const updateIsMobile = () => {
    isMobile.value = window.innerWidth < 768;
};

if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateIsMobile);
    onBeforeUnmount(() => window.removeEventListener('resize', updateIsMobile));
}

const paddingClass = computed(() => {
    if (isMobile.value) {
        return sidebar.isOpen ? 'pl-[calc(256px+1.5rem)] pr-6' : 'px-6';
    }
    return 'pl-[calc(256px+1.5rem)] pr-6';
});

const form = ref({
    name: '',
    ingredients: [],
    instructions: '',
    image: '',
    alcoholic: false
});

const ingredientsInput = ref('');
const success = ref(false);
const error = ref('');

const submitCocktail = async () => {
    form.value.ingredients = ingredientsInput.value
        .split('\n')
        .map(i => i.trim())
        .filter(i => i);

    try {
        const res = await fetch('http://localhost:5000/api/cocktails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form.value),
        });

        if (!res.ok) throw new Error('Failed to create cocktail.');

        success.value = true;
        error.value = '';
        form.value = { name: '', ingredients: [], instructions: '', image: '', alcoholic: false };
        ingredientsInput.value = '';
    } catch (err) {
        success.value = false;
        error.value = err.message;
    }
};
</script>

<template>
    <div :class="`p-6 max-w-xl mx-auto text-white ${paddingClass}`">
        <h1 class="text-3xl font-bold mb-6">Create Your Cocktail 🍸</h1>
        <form @submit.prevent="submitCocktail" class="space-y-4">
            <input v-model="form.name" type="text" placeholder="Cocktail Name"
                class="w-full p-2 rounded bg-[#2a2a2a] text-white" />

            <div>
                <label class="block mb-2">Ingredients (one per line):</label>
                <textarea v-model="ingredientsInput" rows="4" class="w-full p-2 rounded bg-[#2a2a2a] text-white" />
            </div>

            <textarea v-model="form.instructions" rows="3" placeholder="Instructions"
                class="w-full p-2 rounded bg-[#2a2a2a] text-white" />

            <input v-model="form.image" type="text" placeholder="Image URL"
                class="w-full p-2 rounded bg-[#2a2a2a] text-white" />

            <label class="flex items-center space-x-2">
                <input type="checkbox" v-model="form.alcoholic" />
                <span>Contains Alcohol</span>
            </label>

            <button type="submit"
                class="bg-cocktail-glow-light px-4 py-2 rounded text-white hover:bg-cocktail-glow font-semibold">
                Create Cocktail
            </button>

            <p v-if="success" class="text-green-400 mt-2">Cocktail created successfully!</p>
            <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
        </form>
    </div>
</template>
