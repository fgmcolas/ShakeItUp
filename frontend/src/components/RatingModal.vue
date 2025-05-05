<template>
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-[#1e1e1e] text-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">Rate this Cocktail</h2>

            <!-- Stars -->
            <div class="flex justify-center mb-4">
                <button v-for="n in 5" :key="n" @click="selectedScore = n"
                    class="text-3xl mx-1 transition-transform hover:scale-110">
                    <span v-if="n <= selectedScore">⭐</span>
                    <span v-else>☆</span>
                </button>
            </div>

            <!-- Comment -->
            <textarea v-model="comment" rows="3" class="w-full bg-[#2a2a2a] text-white rounded p-2 resize-none"
                placeholder="Add a comment (optional)"></textarea>

            <!-- Error -->
            <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

            <!-- Buttons -->
            <div class="flex justify-end gap-2 mt-4">
                <button @click="close" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded">Cancel</button>
                <button @click="submitRating" class="px-4 py-2 bg-cocktail-glow hover:bg-cocktail-glow-light rounded">
                    Submit
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const props = defineProps({
    cocktailId: String,
});

const emit = defineEmits(['close', 'submitted']);
const auth = useAuth();

const selectedScore = ref(0);
const comment = ref('');
const error = ref('');

const close = () => emit('close');

const submitRating = async () => {
    error.value = '';
    if (!selectedScore.value) {
        error.value = 'Please select a rating.';
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/ratings/${props.cocktailId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.token.value}`,
            },
            body: JSON.stringify({
                score: selectedScore.value,
                comment: comment.value,
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to submit rating');

        emit('submitted');
        close();
    } catch (err) {
        console.error('Error submitting rating:', err);
        error.value = err.message || 'Server error';
    }
};
</script>
