import { defineStore } from 'pinia';
import { ref } from 'vue';

// Simple UI store for the sidebar open/close state
export const useSidebarStore = defineStore('sidebar', () => {
    const isOpen = ref(false);

    const toggle = () => (isOpen.value = !isOpen.value);
    const close = () => (isOpen.value = false);
    const open = () => (isOpen.value = true);

    return { isOpen, toggle, close, open };
});
