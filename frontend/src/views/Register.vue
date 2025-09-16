<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSidebarPadding } from '../composables/useSidebarPadding';

const API_URL = import.meta.env.VITE_API_URL;

const router = useRouter();
const { paddingClass } = useSidebarPadding();

const username = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);


async function extractApiError(res) {
    const text = await res.text().catch(() => '');
    if (!text) return `HTTP ${res.status}`;
    try {
        const data = JSON.parse(text);
        const viaDetails = data?.details?.[0]?.msg;
        const viaErr = data?.error || data?.message;
        return viaDetails || viaErr || `HTTP ${res.status}`;
    } catch {
        return text;
    }
}

const handleSubmit = async () => {
    error.value = '';
    loading.value = true;

    try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username.value,
                email: email.value,
                password: password.value,
            }),
        });

        if (!res.ok) {
            error.value = await extractApiError(res);
            return;
        }

        await res.json().catch(() => null);
        router.push('/login');
    } catch (e) {
        error.value = 'Network error. Please try again.';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div :class="`flex items-center justify-center min-h-screen ${paddingClass}`">
        <form @submit.prevent="handleSubmit"
            class="bg-[#1f1f1f] p-6 rounded-lg shadow-lg w-80 space-y-4 border border-gray-800">
            <h2 class="text-2xl font-bold text-center text-cocktail-glow">Register</h2>

            <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

            <input v-model="username" type="text" placeholder="Username" autocomplete="username"
                class="w-full p-2 rounded bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cocktail-glow-light" />
            <input v-model="email" type="email" placeholder="Email" autocomplete="email"
                class="w-full p-2 rounded bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cocktail-glow-light" />
            <input v-model="password" type="password" placeholder="Password" autocomplete="new-password"
                class="w-full p-2 rounded bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cocktail-glow-light" />

            <button type="submit" :disabled="loading"
                class="w-full bg-cocktail-glow-light hover:bg-cocktail-glow px-4 py-2 rounded text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
                {{ loading ? 'Signing up...' : 'Sign Up' }}
            </button>

            <p class="text-sm text-center text-gray-400">
                Already have an account?
                <RouterLink to="/login" class="text-cocktail-glow-light hover:underline">
                    Log in
                </RouterLink>
            </p>
        </form>
    </div>
</template>
