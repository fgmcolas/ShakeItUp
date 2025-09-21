<script setup>
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

// Props: cocktailId (required) and visible (to show/hide modal)
const props = defineProps({
    cocktailId: { type: String, required: true },
    visible: Boolean,
});

// Emits: close (when modal is dismissed), submitted (after saving rating)
const emit = defineEmits(['close', 'submitted']);

const API_URL = import.meta.env.VITE_API_URL;

const rating = ref(0);       // Selected score (1–5)
const comment = ref('');     // Optional user comment
const auth = useAuth();      // Current user + token

// Set the rating when user clicks on a star
const setRating = (value) => {
    rating.value = value;
};

// Reset state and close modal
const close = () => {
    rating.value = 0;
    comment.value = '';
    emit('close');
};

// Submit rating to backend
const submitRating = async () => {
    if (!auth.token.value || !rating.value) return; // must be logged in + have score

    try {
        const res = await fetch(`${API_URL}/api/ratings/${props.cocktailId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.token.value}`,
            },
            body: JSON.stringify({
                score: rating.value,   // backend expects "score" field
                comment: comment.value,
            }),
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || error.message || 'Failed to submit rating');
        }

        emit('submitted'); // notify parent to refresh display
        close();
    } catch (err) {
        console.error('Rating error:', err);
    }
};
</script>
