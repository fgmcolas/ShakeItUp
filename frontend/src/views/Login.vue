<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useSidebarPadding } from '../composables/useSidebarPadding';

const API_URL = import.meta.env.VITE_API_URL;

const router = useRouter();
const auth = useAuth();
const { paddingClass } = useSidebarPadding();

const username = ref('');
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
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username.value,
                password: password.value,
            }),
        });

        if (!res.ok) {
            error.value = await extractApiError(res);
            return;
        }

        const data = await res.json();

        auth.login({
            user: data.user,
            token: data.token,
        });

        router.push('/dashboard');
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
            <h2 class="text-2xl font-bold text-center text-cocktail-glow">Login</h2>

            <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

            <input v-model="username" type="text" placeholder="Username" autocomplete="username"
                class="w-full p-2 rounded bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cocktail-glow-light" />
            <input v-model="password" type="password" placeholder="Password" autocomplete="current-password"
                class="w-full p-2 rounded bg-[#2a2a2a] text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cocktail-glow-light" />

            <button type="submit" :disabled="loading"
                class="w-full bg-cocktail-glow-light hover:bg-cocktail-glow px-4 py-2 rounded text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
                {{ loading ? 'Logging in...' : 'Log In' }}
            </button>

            <p class="text-sm text-center text-gray-400">
                Don't have an account?
                <RouterLink to="/register" class="text-cocktail-glow-light hover:underline">
                    Register
                </RouterLink>
            </p>
        </form>
    </div>
</template>
