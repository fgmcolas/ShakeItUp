<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
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
    return isMobile.value ? (sidebar.isOpen ? 'pl-[calc(256px+1.5rem)] pr-6' : 'px-6') : 'pl-[calc(256px+1.5rem)] pr-6';
});

const ingredientsList = ref([]);
const newIngredient = ref('');
const selectedIngredients = ref([]);
const imageFile = ref(null);

const form = ref({
    name: '',
    instructions: '',
    alcoholic: false,
});

const success = ref(false);
const error = ref('');

const fetchIngredients = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/cocktails');
        const data = await res.json();
        const allIngredients = data.flatMap(c => c.ingredients || []);
        ingredientsList.value = [...new Set(allIngredients)].sort((a, b) => a.localeCompare(b));
    } catch (err) {
        console.error('Failed to load ingredients.');
    }
};

onMounted(fetchIngredients);

const addIngredient = () => {
    const trimmed = newIngredient.value.trim();
    if (trimmed && !ingredientsList.value.includes(trimmed)) {
        ingredientsList.value.push(trimmed);
    }
    if (trimmed && !selectedIngredients.value.includes(trimmed)) {
        selectedIngredients.value.push(trimmed);
    }
    newIngredient.value = '';
};

const handleImageUpload = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
        imageFile.value = file;
    }
};

const submitCocktail = async () => {
    if (!form.value.name.trim()) {
        error.value = 'Name is required.';
        return;
    }

    const fd = new FormData();
    fd.append('name', form.value.name);
    fd.append('instructions', form.value.instructions);
    fd.append('alcoholic', form.value.alcoholic);
    fd.append('ingredients', JSON.stringify(selectedIngredients.value));
    if (imageFile.value) {
        fd.append('image', imageFile.value);
    }

    console.log('FORM DATA', {
        name: form.value.name,
        instructions: form.value.instructions,
        alcoholic: form.value.alcoholic,
        ingredients: selectedIngredients.value,
        image: imageFile.value?.name
    });

    try {
        const res = await fetch('http://localhost:5000/api/cocktails', {
            method: 'POST',
            body: fd,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to create cocktail.');
        }

        success.value = true;
        error.value = '';
        form.value = { name: '', instructions: '', alcoholic: false };
        selectedIngredients.value = [];
        imageFile.value = null;
    } catch (err) {
        error.value = err.message;
        success.value = false;
    }
};
</script>

<template>
    <div :class="`p-6 max-w-xl mx-auto text-white ${paddingClass}`">
        <h1 class="text-3xl font-bold mb-6">Create Your Cocktail 🍸</h1>

        <form @submit.prevent="submitCocktail" class="space-y-4" enctype="multipart/form-data">
            <input v-model="form.name" type="text" placeholder="Cocktail Name"
                class="w-full p-2 rounded bg-[#2a2a2a] text-white" />

            <div>
                <label class="block mb-2">Select Ingredients:</label>
                <div class="grid grid-cols-2 gap-2">
                    <label v-for="(ingredient, idx) in ingredientsList" :key="idx" class="flex items-center space-x-2">
                        <input type="checkbox" :value="ingredient" v-model="selectedIngredients" />
                        <span>{{ ingredient }}</span>
                    </label>
                </div>
            </div>

            <div class="flex items-center space-x-2">
                <input v-model="newIngredient" type="text" placeholder="Add new ingredient"
                    class="flex-1 p-2 rounded bg-[#2a2a2a] text-white" />
                <button type="button" @click="addIngredient"
                    class="bg-gray-700 text-white px-4 py-2 rounded">Add</button>
            </div>

            <textarea v-model="form.instructions" rows="3" placeholder="Instructions"
                class="w-full p-2 rounded bg-[#2a2a2a] text-white" />

            <input type="file" @change="handleImageUpload" class="text-white" />

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
