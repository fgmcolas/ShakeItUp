<script setup>
import { onBeforeUnmount, ref, computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useSidebarStore } from '../stores/sidebar';

const auth = useAuth();
const sidebar = useSidebarStore();

const isMobile = ref(window.innerWidth < 768);
const updateIsMobile = () => {
    isMobile.value = window.innerWidth < 768;
};

window.addEventListener('resize', updateIsMobile);
onBeforeUnmount(() => window.removeEventListener('resize', updateIsMobile));

const paddingClass = computed(() => {
    if (isMobile.value) {
        return sidebar.isOpen ? 'pl-[calc(256px+1.5rem)] pr-6' : 'px-6';
    }
    return 'pl-[calc(256px+1.5rem)] pr-6';
});
</script>

<template>
    <div :class="`flex items-center justify-center h-screen ${paddingClass}`">
        <h1 class="text-2xl font-bold text-pink-400">
            Welcome, {{ auth.user?.username || 'Guest' }}!
        </h1>
    </div>
</template>
