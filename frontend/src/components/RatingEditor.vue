<script setup>
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const props = defineProps({
    cocktailId: { type: String, required: true },
    visible: Boolean,
});
const emit = defineEmits(['close', 'submitted']);

const API_URL = import.meta.env.VITE_API_URL;

const rating = ref(0);
const comment = ref('');
const auth = useAuth();

const setRating = (value) => {
    rating.value = value;
};

const close = () => {
    rating.value = 0;
    comment.value = '';
    emit('close');
};

const submitRating = async () => {
    if (!auth.token.value || !rating.value) return;

    try {
        const res = await fetch(`${API_URL}/api/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.token.value}`,
            },
            body: JSON.stringify({
                cocktailId: props.cocktailId,
                rating: rating.value,
                comment: comment.value,
            }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to submit rating');
        }

        emit('submitted');
        close();
    } catch (err) {
        console.error('Rating error:', err);
    }
};
</script>

<template>
    <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-[#1e1e1e] p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-700 text-white">
            <h2 class="text-xl font-bold mb-4 text-cocktail-glow">Rate this Cocktail</h2>

            <!-- Star rating -->
            <div class="flex items-center justify-center mb-4 space-x-1">
                <button v-for="star in 5" :key="star" @click="setRating(star)"
                    class="text-3xl focus:outline-none transition transform hover:scale-110">
                    <span :class="star <= rating ? 'text-pink-500' : 'text-gray-500'">★</span>
                </button>
            </div>

            <!-- Optional comment -->
            <textarea v-model="comment" placeholder="Leave a comment (optional)" rows="3"
                class="w-full bg-[#2a2a2a] p-2 rounded border border-gray-600 placeholder-gray-400 text-white resize-none"></textarea>

            <!-- Actions -->
            <div class="mt-4 flex justify-end space-x-2">
                <button @click="close" class="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">
                    Cancel
                </button>
                <button @click="submitRating"
                    class="px-4 py-2 rounded bg-cocktail-glow hover:bg-cocktail-glow-light text-white">
                    Submit
                </button>
            </div>
        </div>
    </div>
</template>
