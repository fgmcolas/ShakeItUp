<script setup>
// Creation.vue
// Cocktail creation form
// Responsibilities:
// - Fetch existing ingredients from backend
// - Allow user to select or add new ingredients
// - Optional image upload with live preview
// - Submit cocktail as multipart/form-data (with JWT token)
// - Responsive padding (adjusts for sidebar/mobile)

import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useSidebarStore } from '../stores/sidebar'

const API_URL = import.meta.env.VITE_API_URL
const sidebar = useSidebarStore()

// --- Responsive layout (mirrors useSidebarPadding) ---
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
const updateIsMobile = () => { isMobile.value = window.innerWidth < 768 }
if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateIsMobile)
    onBeforeUnmount(() => window.removeEventListener('resize', updateIsMobile))
}
const paddingClass = computed(() =>
    isMobile.value
        ? (sidebar.isOpen ? 'pl-[calc(256px+1.5rem)] pr-6 pt-6' : 'px-6 pt-6')
        : 'pl-[calc(256px+1.5rem)] pr-6 pt-6'
)

// --- Ingredients state ---
const ingredientsList = ref([])     // all available ingredients
const newIngredient = ref('')       // input for adding a new ingredient
const selectedIngredients = ref([]) // user-selected ingredients
const imageFile = ref(null)         // uploaded image file

// --- Form state ---
const form = ref({ name: '', instructions: '', alcoholic: false })
const success = ref(false)
const error = ref('')
const loading = ref(false)

// --- Preview image handling ---
// Always show preview; revoke old blob URLs to avoid leaks
const previewImage = ref('/default-cocktail.jpg')
watch(imageFile, (f, old) => {
    if (old && old instanceof File && previewImage.value?.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage.value)
    }
    previewImage.value = f ? URL.createObjectURL(f) : '/default-cocktail.jpg'
})

// --- Load ingredients from API (derived from existing cocktails) ---
const fetchIngredients = async () => {
    try {
        const res = await fetch(`${API_URL}/api/cocktails`)
        const data = await res.json()
        const allIngredients = data.flatMap(c => c.ingredients || [])
        ingredientsList.value = [...new Set(allIngredients)].sort((a, b) => a.localeCompare(b))
    } catch (err) {
        console.error('Failed to load ingredients.', err)
    }
}
onMounted(fetchIngredients)

// --- UI helpers ---
const addIngredient = () => {
    const trimmed = newIngredient.value.trim()
    if (!trimmed) return
    if (!ingredientsList.value.includes(trimmed)) ingredientsList.value.push(trimmed)
    if (!selectedIngredients.value.includes(trimmed)) selectedIngredients.value.push(trimmed)
    newIngredient.value = ''
}
const handleImageUpload = (e) => {
    const file = e.target?.files?.[0]
    if (file) imageFile.value = file
}

// --- Submit cocktail (multipart/form-data) ---
const submitCocktail = async () => {
    success.value = false
    error.value = ''

    if (!form.value.name.trim()) {
        error.value = 'Name is required.'
        return
    }

    const token = localStorage.getItem('token')?.replace(/^"|"$/g, '')
    if (!token) {
        error.value = 'You must be logged in to create a cocktail.'
        return
    }

    // Build FormData payload
    const fd = new FormData()
    fd.append('name', form.value.name)
    fd.append('instructions', form.value.instructions)
    fd.append('alcoholic', String(form.value.alcoholic))
    fd.append('ingredients', JSON.stringify(selectedIngredients.value))
    if (imageFile.value) fd.append('image', imageFile.value)

    loading.value = true
    try {
        const res = await fetch(`${API_URL}/api/cocktails`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }, // attach JWT
            body: fd,
        })

        if (!res.ok) {
            let msg = 'Failed to create cocktail.'
            try {
                const data = await res.json()
                msg = data.error || data.message || msg
            } catch { }
            throw new Error(msg)
        }

        // Reset form on success
        success.value = true
        form.value = { name: '', instructions: '', alcoholic: false }
        selectedIngredients.value = []
        imageFile.value = null
        previewImage.value = '/default-cocktail.jpg'
        await fetchIngredients() // refresh ingredients list
    } catch (e) {
        error.value = e.message || 'Failed to create cocktail.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div :class="`grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-8 text-white ${paddingClass}`">
        <!-- Left column: name, ingredients, add ingredient -->
        <div class="flex flex-col gap-4 xl:gap-6 justify-between">
            <div class="flex flex-col gap-4 xl:gap-6">
                <h2 class="text-3xl font-bold text-pink-400">Create Your Cocktail 🍸</h2>

                <!-- Cocktail name -->
                <input v-model="form.name" placeholder="Cocktail Name"
                    class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600" />

                <!-- Ingredients list (scrollable) -->
                <div class="max-h-80 overflow-y-auto border border-gray-600 rounded-lg p-4">
                    <p class="font-semibold mb-3">Select Ingredients:</p>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <label v-for="ingredient in ingredientsList" :key="ingredient"
                            class="flex items-center gap-2 text-sm">
                            <input type="checkbox" v-model="selectedIngredients" :value="ingredient" />
                            {{ ingredient }}
                        </label>
                    </div>
                </div>

                <!-- Add custom ingredient -->
                <div class="flex gap-3">
                    <input v-model="newIngredient" placeholder="Add new ingredient"
                        class="flex-grow px-3 py-2 rounded-lg bg-gray-800 border border-gray-600" />
                    <button @click="addIngredient"
                        class="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-lg font-medium">
                        Add
                    </button>
                </div>
            </div>

            <!-- Tip box -->
            <div class="p-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80">
                💡 Tip: Include at least two ingredients and clear instructions to get your cocktail saved properly.
            </div>
        </div>

        <!-- Right column: instructions, image upload, preview, submit -->
        <div class="flex flex-col gap-4 xl:gap-6 items-center justify-between">
            <div class="flex flex-col gap-4 xl:gap-6 w-full xl:w-auto items-center">
                <!-- Instructions -->
                <textarea v-model="form.instructions" placeholder="Instructions"
                    class="w-full xl:w-[28rem] min-h-[180px] px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 resize-none"></textarea>

                <!-- Image upload -->
                <div class="flex flex-col items-center w-full xl:w-[28rem] gap-1">
                    <input id="fileUpload" type="file" accept="image/*" @change="handleImageUpload" class="hidden" />
                    <label for="fileUpload"
                        class="cursor-pointer inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-md text-sm">
                        Upload Cocktail Image
                    </label>
                    <p v-if="imageFile" class="text-xs text-white/60 mt-1">
                        Selected: {{ imageFile.name }}
                    </p>
                </div>

                <!-- Alcoholic toggle -->
                <div class="flex items-center gap-3">
                    <input type="checkbox" v-model="form.alcoholic" />
                    <span class="text-sm">Contains Alcohol</span>
                </div>

                <!-- Live preview card (desktop only) -->
                <div class="hidden xl:block w-80 bg-[#1e1e1e] rounded-lg shadow-lg overflow-hidden">
                    <div class="w-full h-48 bg-black flex items-center justify-center overflow-hidden rounded-t-lg">
                        <img :src="previewImage" alt="Preview" class="object-cover h-full w-full" />
                    </div>

                    <div class="p-4 space-y-2">
                        <h2 class="text-lg font-semibold text-pink-400">
                            {{ form.name || 'Unnamed Cocktail' }}
                        </h2>

                        <!-- Alcoholic badge -->
                        <div class="flex flex-wrap gap-2">
                            <span class="text-xs px-2 py-1 rounded-full font-semibold"
                                :class="form.alcoholic ? 'bg-red-500 text-white' : 'bg-green-500 text-white'">
                                {{ form.alcoholic ? 'Alcoholic' : 'Non-alcoholic' }}
                            </span>
                        </div>

                        <!-- Ingredient preview -->
                        <p class="text-sm text-white/80">
                            <strong>Ingredients:</strong><br />
                            <span v-if="selectedIngredients.length">
                                {{ selectedIngredients.join(', ') }}
                            </span>
                            <span v-else class="italic text-white/50">No ingredients selected</span>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Submit button -->
            <button @click="submitCocktail" :disabled="loading"
                class="bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold">
                {{ loading ? 'Creating…' : 'Create Cocktail' }}
            </button>

            <!-- Success/Error message -->
            <p v-if="success || error" :class="{ 'text-green-500': success, 'text-red-500': error }"
                class="text-sm mt-2 text-center">
                {{ success ? 'Cocktail successfully created!' : error }}
            </p>
        </div>
    </div>
</template>
