<script setup>
import { computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { Menu, X } from 'lucide-vue-next';
import { useSidebarStore } from '../stores/sidebar';
import { useAuth } from '../composables/useAuth';

const sidebar = useSidebarStore();
const route = useRoute();
const router = useRouter();
const auth = useAuth();

const isLoggedIn = computed(() => !!auth.user?.value?.id);

const linkClass = (path) =>
    `block px-4 py-2 rounded hover:bg-cocktail-glow-light/20 transition ${route.path === path
        ? 'bg-cocktail-glow-light/30 font-semibold text-white'
        : 'text-white'
    }`;

const handleLogout = () => {
    auth.logout();
    router.push('/login');
};
</script>

<template>
    <div>
        <!-- Burger Button (mobile only) -->
        <button v-if="!sidebar.isOpen"
            class="md:hidden fixed top-4 left-4 z-50 p-2 bg-cocktail-glow text-white border rounded shadow"
            @click="sidebar.open">
            <Menu size="20" />
        </button>

        <!-- Sidebar -->
        <aside :class="`fixed top-0 left-0 h-screen w-64 bg-[#0e0e0e] border-r border-gray-800 shadow-md z-40 transform transition-transform duration-200 flex flex-col ${sidebar.isOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 md:flex`">
            <!-- Scrollable Top Section -->
            <div class="flex-1 overflow-y-auto">
                <!-- Logo + Close Button -->
                <div class="flex items-center justify-between p-6 border-b border-gray-800">
                    <RouterLink :to="isLoggedIn ? '/' : '/login'" @click="sidebar.close" class="block w-full">
                        <img src="/ShakeItUp_logo.png" alt="ShakeItUp Logo"
                            class="w-40 h-auto mx-auto rounded transition duration-200 hover:bg-gray-800/50 p-2" />
                    </RouterLink>
                    <button class="md:hidden p-2 text-white" @click="sidebar.close">
                        <X size="20" />
                    </button>
                </div>

                <!-- Navigation Links -->
                <nav class="p-4 space-y-2">
                    <RouterLink to="/cocktails" :class="linkClass('/cocktails')" @click="sidebar.close">
                        🍹 All Cocktails
                    </RouterLink>
                    <RouterLink to="/ingredients" :class="linkClass('/ingredients')" @click="sidebar.close">
                        🧂 My Ingredients
                    </RouterLink>
                    <RouterLink v-if="isLoggedIn" to="/create" :class="linkClass('/create')" @click="sidebar.close">
                        🍸 Creation
                    </RouterLink>
                    <RouterLink v-if="isLoggedIn" to="/favorites" :class="linkClass('/favorites')"
                        @click="sidebar.close">
                        ❤️ Favorites
                    </RouterLink>
                </nav>
            </div>

            <!-- Sticky Footer -->
            <div class="w-full p-4 border-t border-gray-800 text-sm text-center text-white">
                <template v-if="isLoggedIn">
                    <p class="text-gray-300 mb-3">
                        Logged in as <strong>{{ auth.user.value.username }}</strong>
                    </p>
                    <button @click="handleLogout"
                        class="bg-cocktail-glow px-3 py-1 text-white rounded hover:bg-cocktail-glow-light transition">
                        Log out
                    </button>
                </template>
                <template v-else>
                    <p class="text-gray-500">Not connected</p>
                </template>
            </div>
        </aside>
    </div>
</template>
